#!/usr/bin/env node
/**
 * IPIP-NEO-PI 120-question Czech translation pipeline
 *
 * Pipeline:
 *   Stage 1 — Claude Sonnet 4.6 (coordinator)           → translation briefs
 *   Stage 2 — 9 parallel translators                    → Czech drafts
 *             (GPT-4o mini ×3, Sonnet 4.6 ×3, Gemini 2.5 Flash ×3)
 *   Stage 3 — 9 parallel back-translators (cross-model) → English back-translations
 *   Stage 4 — Claude Opus 4.7 (judge)                   → best Czech + fidelity score
 *   Stage 5 — 3 persona agents (GPT, Sonnet, Gemini)    → naturalness/clarity/fidelity
 *   Stage 6 — quality gate + iteration loop (max 3)
 *
 * Run:
 *   DOTENV_CONFIG_PATH=.env.local node -r dotenv/config scripts/czech-translation.js
 */

const path = require('path')
const fs   = require('fs')

// ── JSON extraction ───────────────────────────────────────────────────────────

function extractJSON(raw) {
  const text = (raw || '').trim()
  try { return JSON.parse(text) } catch {}
  const fence = text.match(/```(?:json)?\s*([\s\S]+?)\s*```/s)
  if (fence) { try { return JSON.parse(fence[1]) } catch {} }
  const arr = text.match(/\[[\s\S]+\]/s)
  const obj = text.match(/\{[\s\S]+\}/s)
  const blob = arr && (!obj || text.indexOf('[') < text.indexOf('{')) ? arr[0] : obj?.[0]
  if (blob) { try { return JSON.parse(blob) } catch {} }
  throw new Error('Could not extract JSON from model response')
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatQuestionList(questions) {
  return questions.map((q, i) =>
    `${i + 1}. [${q.id}] domain:${q.domain} facet:${q.facet} keyed:${q.keyed} — "${q.text}"`
  ).join('\n')
}

function avg(nums) {
  const valid = nums.filter(n => typeof n === 'number' && !isNaN(n))
  return valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : null
}

// ── Stage 1: Coordinator ──────────────────────────────────────────────────────

const COORDINATOR_SYSTEM =
  'You are a psychometric translation coordinator. For each IPIP-NEO-PI question, you produce a translation brief that identifies: (1) the OCEAN domain and facet being measured, (2) whether the item is positively or negatively keyed, (3) the specific behavioural construct the question targets, (4) the intended emotional register and tone, (5) any idioms or culturally specific phrases that must be adapted rather than literally translated, (6) what the Czech translation must preserve to maintain construct validity. Output only valid JSON, no markdown.'

async function runCoordinator(anthropic, questions) {
  const half = Math.ceil(questions.length / 2)
  const batch1 = questions.slice(0, half)
  const batch2 = questions.slice(half)

  const results = []
  for (const [i, batch] of [batch1, batch2].entries()) {
    console.log(`  Processing batch ${i + 1}/2 (${batch.length} questions)...`)
    const res = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 16384,
      system: COORDINATOR_SYSTEM,
      messages: [{
        role: 'user',
        content: `Here are ${batch.length} IPIP-NEO-PI questions:\n${formatQuestionList(batch)}\n\n` +
          'For each question, produce a translation brief. Keep each field concise — construct and register should be 5-10 words max. ' +
          'idioms_to_adapt and translation_constraints should be short arrays of brief phrases. ' +
          'Output a JSON array: [{ "id": "...", "text": "...", "domain": "...", "facet": ..., "keyed": "...", "construct": "...", "register": "...", "idioms_to_adapt": [...], "translation_constraints": [...] }]. Output only valid JSON, no markdown.',
      }],
    })
    const text = res.content.find(b => b.type === 'text')?.text || ''
    console.log(`  Batch ${i + 1} response: ${text.length} chars`)
    const parsed = extractJSON(text)
    const arr = Array.isArray(parsed) ? parsed : Object.values(parsed).find(v => Array.isArray(v)) || []
    results.push(...arr)
  }
  return results
}

async function runRetryCoordinator(anthropic, failedItems) {
  const itemList = failedItems.map(f =>
    `[${f.id}] "${f.english}"\nJudge notes: ${f.notes || 'none'}\nBack-translation check: ${f.back_translation_check || 'none'}`
  ).join('\n\n')

  const res = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system:
      'You are a psychometric translation coordinator. For each IPIP-NEO-PI question, you produce a translation brief that identifies: (1) the OCEAN domain and facet being measured, (2) whether the item is positively or negatively keyed, (3) the specific behavioural construct the question targets, (4) the intended emotional register and tone, (5) any idioms or culturally specific phrases that must be adapted rather than literally translated, (6) what the Czech translation must preserve to maintain construct validity. Output only valid JSON, no markdown.',
    messages: [{
      role: 'user',
      content:
        'The following questions failed the fidelity threshold in the previous translation round. ' +
        'Produce revised translation briefs that address the specific issues noted by the judge.\n\n' +
        itemList + '\n\n' +
        'Output a JSON array: [{ id, text, domain, facet, keyed, construct, register, idioms_to_adapt, translation_constraints, revision_notes }]. ' +
        'Output only valid JSON, no markdown.',
    }],
  })
  const text = res.content.find(b => b.type === 'text')?.text || ''
  try { return extractJSON(text) } catch { return [] }
}

// ── Stage 2: 9 Translators ────────────────────────────────────────────────────

const TRANSLATOR_BASE_SYSTEM =
  'You are translating English personality assessment questions into Czech. Your translations must: ' +
  '(1) preserve the exact psychological construct being measured, ' +
  '(2) sound natural to a native Czech speaker, ' +
  '(3) maintain the same register and tone as the original, ' +
  '(4) use standard Czech (spisovná čeština), not colloquial. ' +
  'For each question, provide the Czech translation. ' +
  'Output only valid JSON array: [{ id, english, czech }]. No markdown.'

const LENS_NATURAL  = 'Focus on natural, everyday Czech phrasing. Prioritise how a Czech person would naturally express this behaviour.'
const LENS_FIDELITY = 'Focus on psychological fidelity. Ensure the Czech wording measures exactly the same construct as the English original.'
const LENS_PLAIN    = 'Focus on plain-language clarity. Ensure any Czech reader regardless of education level can understand the question.'

function buildTranslatorPrompt(brief, questions) {
  return (
    `TRANSLATION BRIEF:\n${JSON.stringify(brief, null, 2)}\n\n` +
    `ENGLISH QUESTIONS TO TRANSLATE:\n${questions.map((q, i) => `${i + 1}. [${q.id}] "${q.text}"`).join('\n')}\n\n` +
    'Translate each question into Czech. Output only valid JSON array: [{ id, english, czech }]. No markdown.'
  )
}

async function translatorGPT(openai, lens, brief, questions, label) {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: `${TRANSLATOR_BASE_SYSTEM}\n\n${lens}` },
        { role: 'user',   content: buildTranslatorPrompt(brief, questions) },
      ],
    })
    const raw = completion.choices[0].message.content
    const parsed = extractJSON(raw)
    if (Array.isArray(parsed)) return parsed
    const firstArray = Object.values(parsed).find(v => Array.isArray(v))
    return firstArray || []
  } catch (err) {
    console.error(`  ⚠ ${label} failed: ${err.message}`)
    return null
  }
}

async function translatorSonnet(anthropic, lens, brief, questions, label) {
  try {
    const res = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      system: `${TRANSLATOR_BASE_SYSTEM}\n\n${lens}`,
      messages: [{ role: 'user', content: buildTranslatorPrompt(brief, questions) }],
    })
    const text = res.content.find(b => b.type === 'text')?.text || ''
    const parsed = extractJSON(text)
    if (Array.isArray(parsed)) return parsed
    const firstArray = Object.values(parsed).find(v => Array.isArray(v))
    return firstArray || []
  } catch (err) {
    console.error(`  ⚠ ${label} failed: ${err.message}`)
    return null
  }
}

async function translatorGemini(lens, brief, questions, label) {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: `${TRANSLATOR_BASE_SYSTEM}\n\n${lens}` }] },
          contents: [{ role: 'user', parts: [{ text: buildTranslatorPrompt(brief, questions) }] }],
        }),
      }
    )
    const data = await response.json()
    if (!data.candidates) { console.error(`  ⚠ ${label} API error:`, JSON.stringify(data)); return null }
    const raw = data.candidates[0].content.parts[0].text
    const parsed = extractJSON(raw)
    if (Array.isArray(parsed)) return parsed
    const firstArray = Object.values(parsed).find(v => Array.isArray(v))
    return firstArray || []
  } catch (err) {
    console.error(`  ⚠ ${label} failed: ${err.message}`)
    return null
  }
}

async function runStage2Translators(openai, anthropic, brief, questions) {
  return Promise.all([
    translatorGPT(openai,      LENS_NATURAL,  brief, questions, 'T1 (GPT Natural)'),
    translatorGPT(openai,      LENS_FIDELITY, brief, questions, 'T2 (GPT Fidelity)'),
    translatorGPT(openai,      LENS_PLAIN,    brief, questions, 'T3 (GPT Plain)'),
    translatorSonnet(anthropic, LENS_NATURAL,  brief, questions, 'T4 (Sonnet Natural)'),
    translatorSonnet(anthropic, LENS_FIDELITY, brief, questions, 'T5 (Sonnet Fidelity)'),
    translatorSonnet(anthropic, LENS_PLAIN,    brief, questions, 'T6 (Sonnet Plain)'),
    translatorGemini(LENS_NATURAL,  brief, questions, 'T7 (Gemini Natural)'),
    translatorGemini(LENS_FIDELITY, brief, questions, 'T8 (Gemini Fidelity)'),
    translatorGemini(LENS_PLAIN,    brief, questions, 'T9 (Gemini Plain)'),
  ])
}

// ── Stage 3: 9 Back-Translators (cross-model) ─────────────────────────────────

const BACK_TRANSLATOR_SYSTEM =
  'You are translating Czech personality assessment questions back into English. ' +
  'Translate literally and faithfully — do not try to reconstruct the original English phrasing. ' +
  'Translate exactly what the Czech text says. ' +
  'Output only valid JSON array: [{ id, czech, back_translation }]. No markdown.'

function buildBackTranslatorPrompt(czechItems) {
  const list = czechItems
    .filter(Boolean)
    .map((item, i) => `${i + 1}. [${item.id}] "${item.czech}"`)
    .join('\n')
  return (
    `Translate each Czech question back to English.\n\n${list}\n\n` +
    'Output only valid JSON array: [{ id, czech, back_translation }]. No markdown.'
  )
}

async function backTranslatorGPT(openai, czechItems, label) {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: BACK_TRANSLATOR_SYSTEM },
        { role: 'user',   content: buildBackTranslatorPrompt(czechItems) },
      ],
    })
    const raw = completion.choices[0].message.content
    const parsed = extractJSON(raw)
    if (Array.isArray(parsed)) return parsed
    const firstArray = Object.values(parsed).find(v => Array.isArray(v))
    return firstArray || []
  } catch (err) {
    console.error(`  ⚠ ${label} failed: ${err.message}`)
    return null
  }
}

async function backTranslatorSonnet(anthropic, czechItems, label) {
  try {
    const res = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      system: BACK_TRANSLATOR_SYSTEM,
      messages: [{ role: 'user', content: buildBackTranslatorPrompt(czechItems) }],
    })
    const text = res.content.find(b => b.type === 'text')?.text || ''
    const parsed = extractJSON(text)
    if (Array.isArray(parsed)) return parsed
    const firstArray = Object.values(parsed).find(v => Array.isArray(v))
    return firstArray || []
  } catch (err) {
    console.error(`  ⚠ ${label} failed: ${err.message}`)
    return null
  }
}

async function backTranslatorGemini(czechItems, label) {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: BACK_TRANSLATOR_SYSTEM }] },
          contents: [{ role: 'user', parts: [{ text: buildBackTranslatorPrompt(czechItems) }] }],
        }),
      }
    )
    const data = await response.json()
    if (!data.candidates) { console.error(`  ⚠ ${label} API error:`, JSON.stringify(data)); return null }
    const raw = data.candidates[0].content.parts[0].text
    const parsed = extractJSON(raw)
    if (Array.isArray(parsed)) return parsed
    const firstArray = Object.values(parsed).find(v => Array.isArray(v))
    return firstArray || []
  } catch (err) {
    console.error(`  ⚠ ${label} failed: ${err.message}`)
    return null
  }
}

async function runStage3BackTranslators(openai, anthropic, translatorOutputs) {
  const [t1, t2, t3, t4, t5, t6, t7, t8, t9] = translatorOutputs
  return Promise.all([
    // GPT drafts (T1,T2,T3) → Gemini back-translates
    backTranslatorGemini(t1 || [], 'BT1 (Gemini ← T1/GPT)'),
    backTranslatorGemini(t2 || [], 'BT2 (Gemini ← T2/GPT)'),
    backTranslatorGemini(t3 || [], 'BT3 (Gemini ← T3/GPT)'),
    // Sonnet drafts (T4,T5,T6) → GPT back-translates
    backTranslatorGPT(openai, t4 || [], 'BT4 (GPT ← T4/Sonnet)'),
    backTranslatorGPT(openai, t5 || [], 'BT5 (GPT ← T5/Sonnet)'),
    backTranslatorGPT(openai, t6 || [], 'BT6 (GPT ← T6/Sonnet)'),
    // Gemini drafts (T7,T8,T9) → Sonnet back-translates
    backTranslatorSonnet(anthropic, t7 || [], 'BT7 (Sonnet ← T7/Gemini)'),
    backTranslatorSonnet(anthropic, t8 || [], 'BT8 (Sonnet ← T8/Gemini)'),
    backTranslatorSonnet(anthropic, t9 || [], 'BT9 (Sonnet ← T9/Gemini)'),
  ])
}

// ── Stage 4: Judge ────────────────────────────────────────────────────────────

function buildJudgePrompt(questions, brief, translatorOutputs, backTranslatorOutputs) {
  const [t1,t2,t3,t4,t5,t6,t7,t8,t9]   = translatorOutputs
  const [bt1,bt2,bt3,bt4,bt5,bt6,bt7,bt8,bt9] = backTranslatorOutputs

  const makeLookup = arr => {
    const map = {}
    if (Array.isArray(arr)) for (const item of arr) { if (item?.id) map[item.id] = item }
    return map
  }

  const tMaps  = [t1,t2,t3,t4,t5,t6,t7,t8,t9].map(makeLookup)
  const btMaps = [bt1,bt2,bt3,bt4,bt5,bt6,bt7,bt8,bt9].map(makeLookup)

  const briefMap = {}
  if (Array.isArray(brief)) for (const b of brief) { if (b?.id) briefMap[b.id] = b }

  const tLabels  = [
    'T1(GPT-Natural)', 'T2(GPT-Fidelity)', 'T3(GPT-Plain)',
    'T4(Sonnet-Natural)', 'T5(Sonnet-Fidelity)', 'T6(Sonnet-Plain)',
    'T7(Gemini-Natural)', 'T8(Gemini-Fidelity)', 'T9(Gemini-Plain)',
  ]
  const btLabels = [
    'BT1(Gemini←T1)', 'BT2(Gemini←T2)', 'BT3(Gemini←T3)',
    'BT4(GPT←T4)', 'BT5(GPT←T5)', 'BT6(GPT←T6)',
    'BT7(Sonnet←T7)', 'BT8(Sonnet←T8)', 'BT9(Sonnet←T9)',
  ]

  const lines = []
  for (const q of questions) {
    const b = briefMap[q.id] || {}
    lines.push(`[${q.id}] "${q.text}"`)
    if (b.construct) lines.push(`Construct: ${b.construct}`)
    if (b.translation_constraints) lines.push(`Constraints: ${b.translation_constraints}`)
    for (let i = 0; i < 9; i++) {
      const czech  = tMaps[i][q.id]?.czech           || '(no output)'
      const btText = btMaps[i][q.id]?.back_translation || '(no output)'
      lines.push(`  ${tLabels[i]}: "${czech}"`)
      lines.push(`  ${btLabels[i]}: "${btText}"`)
    }
    lines.push('')
  }

  return (
    lines.join('\n') +
    'For each question, select or synthesise the best Czech translation. ' +
    'Output only valid JSON array: ' +
    '[{ id, english, czech_selected, fidelity_score, source_agent, back_translation_check, notes }]. ' +
    'No markdown.'
  )
}

const JUDGE_SYSTEM =
  'You are a senior psychometrics translation judge fluent in both English and Czech. ' +
  'For each question, you receive 9 Czech translation candidates and 9 back-translations. Your task:\n' +
  '1. Compare each back-translation against the original English — flag any semantic drift\n' +
  '2. Evaluate each Czech candidate for naturalness, construct fidelity, and clarity\n' +
  '3. Select the single best Czech translation OR synthesise a better one from the candidates\n' +
  '4. Score fidelity 0-100 (how well does the Czech translation preserve the original psychological construct?)\n' +
  '5. If no candidate scores above 90, synthesise your own Czech translation\n' +
  'Output only valid JSON array: [{ id, english, czech_selected, fidelity_score, source_agent, back_translation_check, notes }]. No markdown.'

async function runJudge(anthropic, questions, brief, translatorOutputs, backTranslatorOutputs) {
  const batchSize  = 20
  const allResults = []

  for (let start = 0; start < questions.length; start += batchSize) {
    const batchQuestions = questions.slice(start, start + batchSize)
    const batchNum       = Math.floor(start / batchSize) + 1
    const totalBatches   = Math.ceil(questions.length / batchSize)
    console.log(`  Judge batch ${batchNum}/${totalBatches} (questions ${start + 1}-${start + batchQuestions.length})...`)

    const prompt = buildJudgePrompt(batchQuestions, brief, translatorOutputs, backTranslatorOutputs)

    const res = await anthropic.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 16384,
      system: JUDGE_SYSTEM,
      messages: [{ role: 'user', content: prompt }],
    })
    const text   = res.content.find(b => b.type === 'text')?.text || ''
    const parsed = extractJSON(text)
    const arr    = Array.isArray(parsed) ? parsed : Object.values(parsed).find(v => Array.isArray(v)) || []
    allResults.push(...arr)
  }

  return allResults
}

// ── Stage 5: Persona Agents ───────────────────────────────────────────────────

const PERSONA_SYSTEM =
  'You are simulating a Czech native speaker reading a personality assessment translated into Czech. ' +
  'For each question, score: ' +
  'naturalness 0-100 (does this sound like natural Czech, not a translation?), ' +
  'clarity 0-100 (is the meaning immediately clear?), ' +
  'fidelity 0-100 (does the Czech version ask the same thing as the English original?). ' +
  'Output only valid JSON array: [{ id, naturalness, clarity, fidelity, comment }]. No markdown.'

function buildPersonaTask(items) {
  const pairs = items.map((item, i) =>
    `${i + 1}. [${item.id}]\nEN: "${item.english}"\nCS: "${item.czech_selected}"`
  ).join('\n\n')
  return (
    `Score each of the following English–Czech question pairs as a Czech native speaker.\n\n${pairs}\n\n` +
    'Output only valid JSON array: [{ id, naturalness, clarity, fidelity, comment }]. No markdown.'
  )
}

async function personaGPT(openai, items, label) {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: PERSONA_SYSTEM },
        { role: 'user',   content: buildPersonaTask(items) },
      ],
    })
    const raw = completion.choices[0].message.content
    const parsed = extractJSON(raw)
    if (Array.isArray(parsed)) return parsed
    const firstArray = Object.values(parsed).find(v => Array.isArray(v))
    return firstArray || []
  } catch (err) {
    console.error(`  ⚠ ${label} failed: ${err.message}`)
    return null
  }
}

async function personaSonnet(anthropic, items, label) {
  try {
    const res = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      system: PERSONA_SYSTEM,
      messages: [{ role: 'user', content: buildPersonaTask(items) }],
    })
    const text = res.content.find(b => b.type === 'text')?.text || ''
    const parsed = extractJSON(text)
    if (Array.isArray(parsed)) return parsed
    const firstArray = Object.values(parsed).find(v => Array.isArray(v))
    return firstArray || []
  } catch (err) {
    console.error(`  ⚠ ${label} failed: ${err.message}`)
    return null
  }
}

async function personaGemini(items, label) {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: PERSONA_SYSTEM }] },
          contents: [{ role: 'user', parts: [{ text: buildPersonaTask(items) }] }],
        }),
      }
    )
    const data = await response.json()
    if (!data.candidates) { console.error(`  ⚠ ${label} API error:`, JSON.stringify(data)); return null }
    const raw = data.candidates[0].content.parts[0].text
    const parsed = extractJSON(raw)
    if (Array.isArray(parsed)) return parsed
    const firstArray = Object.values(parsed).find(v => Array.isArray(v))
    return firstArray || []
  } catch (err) {
    console.error(`  ⚠ ${label} failed: ${err.message}`)
    return null
  }
}

async function runStage5Personas(openai, anthropic, judgeResults) {
  return Promise.all([
    personaGPT(openai,      judgeResults, 'Persona 1 (GPT Czech native)'),
    personaSonnet(anthropic, judgeResults, 'Persona 2 (Sonnet Czech native)'),
    personaGemini(judgeResults,            'Persona 3 (Gemini Czech native)'),
  ])
}

// ── Stage 6: Quality evaluation ───────────────────────────────────────────────

function evaluateScores(items, personaResults) {
  return items.map(item => {
    const allScores = personaResults
      .filter(Boolean)
      .flatMap(agentScores => agentScores.filter(s => s && s.id === item.id))

    const fidelityAvg = avg(allScores.map(s => s.fidelity))

    return {
      ...item,
      avg_fidelity: fidelityAvg !== null ? Math.round(fidelityAvg) : null,
    }
  })
}

// ── Output generation ─────────────────────────────────────────────────────────

function generateReport({
  timestamp, questions, passedFirstRound, retriedCount,
  forcedPassCount, iterationsUsed, passedItems,
}) {
  const lines = [
    '# IPIP-NEO-PI Czech Translation Report',
    '',
    `**Run date:** ${new Date(timestamp).toLocaleString('en-GB')}`,
    `**Total questions:** ${questions.length}`,
    `**Passed first round:** ${passedFirstRound}`,
    `**Retried:** ${retriedCount}`,
    `**Forced pass (iteration limit):** ${forcedPassCount}`,
    `**Iterations used:** ${iterationsUsed}`,
    '',
    '---',
    '',
    '## Translations',
    '',
    '| ID | English | Czech | Fidelity | Source Agent | Notes |',
    '|---|---|---|---|---|---|',
  ]

  for (const item of passedItems) {
    const shortId   = item.id.slice(0, 8) + '…'
    const fidelity  = item.fidelity_score ?? item.avg_fidelity ?? '—'
    const source    = item.source_agent || '—'
    const notes     = (item.notes || '').replace(/\|/g, '\\|').replace(/\n/g, ' ')
    const limitFlag = item.iteration_limit_reached ? ' _(limit)_' : ''
    lines.push(
      `| \`${shortId}\` | ${item.english} | ${item.czech_selected} | ${fidelity}${limitFlag} | ${source} | ${notes} |`
    )
  }

  const forcedItems = passedItems.filter(i => i.iteration_limit_reached)
  if (forcedItems.length > 0) {
    lines.push('', '---', '', '## Force-Passed Questions (Iteration Limit Reached)', '')
    for (const item of forcedItems) {
      lines.push(`**\`${item.id}\`** — "${item.english}"`)
      lines.push(`Czech: "${item.czech_selected}"`)
      lines.push(`> Judge notes: ${item.notes || 'none'}`)
      lines.push('')
    }
  }

  return lines.join('\n')
}

function generateJSON(questions, passedItems) {
  const questionMap = Object.fromEntries(questions.map(q => [q.id, q]))
  return passedItems.map(item => {
    const q = questionMap[item.id] || {}
    return {
      id:            item.id,
      english:       item.english,
      czech:         item.czech_selected,
      domain:        q.domain ?? null,
      facet:         q.facet  ?? null,
      keyed:         q.keyed  ?? null,
      fidelity_score: item.fidelity_score ?? item.avg_fidelity ?? null,
    }
  })
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const missing = ['ANTHROPIC_API_KEY', 'OPENAI_API_KEY', 'GEMINI_API_KEY']
    .filter(k => !process.env[k])
  if (missing.length) throw new Error(`Missing env vars: ${missing.join(', ')}`)

  const { default: Anthropic } = await import('@anthropic-ai/sdk')
  const { OpenAI }             = await import('openai')

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const openai    = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  const questions = require('@bigfive-org/questions/data/en/questions.json')
  console.log(`\nLoaded ${questions.length} questions`)

  // ── Stage 1 ──────────────────────────────────────────────────────────────
  console.log('\nStage 1: Coordinator producing translation briefs...')
  const brief = await runCoordinator(anthropic, questions)
  console.log(`  ✓ Brief produced for ${Array.isArray(brief) ? brief.length : '?'} questions`)

  // ── Stage 2 ──────────────────────────────────────────────────────────────
  console.log('\nStage 2: 9 translators running in parallel...')
  const translatorOutputs = await runStage2Translators(openai, anthropic, brief, questions)
  const translatorCounts  = translatorOutputs.map((o, i) =>
    o ? `T${i + 1}:${o.length}` : `T${i + 1}:fail`
  )
  console.log(`  ✓ Results: ${translatorCounts.join('  ')}`)

  // ── Stage 3 ──────────────────────────────────────────────────────────────
  console.log('\nStage 3: 9 back-translators running in parallel (cross-model)...')
  const backTranslatorOutputs = await runStage3BackTranslators(openai, anthropic, translatorOutputs)
  const btCounts = backTranslatorOutputs.map((o, i) =>
    o ? `BT${i + 1}:${o.length}` : `BT${i + 1}:fail`
  )
  console.log(`  ✓ Results: ${btCounts.join('  ')}`)

  // ── Stage 4 ──────────────────────────────────────────────────────────────
  console.log('\nStage 4: Judge Round 1 — Opus evaluating 9 candidates per question...')
  const judgeResults = await runJudge(anthropic, questions, brief, translatorOutputs, backTranslatorOutputs)
  console.log(`  ✓ Judge selected translations for ${judgeResults.length} questions`)

  // ── Iteration loop: Stage 5 + Stage 6 ────────────────────────────────────
  const passedItems    = []
  let pendingItems     = judgeResults
  let iterationsUsed   = 0
  let passedFirstRound = 0
  let retriedCount     = 0
  let forcedPassCount  = 0

  for (let iteration = 1; iteration <= 3 && pendingItems.length > 0; iteration++) {
    iterationsUsed = iteration

    console.log(`\nStage 5: 3 persona agents scoring Czech translations...`)
    const personaResults = await runStage5Personas(openai, anthropic, pendingItems)

    console.log(`Stage 6: Quality gate evaluating... (iteration ${iteration}/3)`)
    const scored = evaluateScores(pendingItems, personaResults)

    const passed = scored.filter(i => i.avg_fidelity !== null && i.avg_fidelity >= 95)
    const failed = scored.filter(i => i.avg_fidelity === null || i.avg_fidelity < 95)

    if (iteration === 1) passedFirstRound = passed.length
    else retriedCount += passed.length

    passedItems.push(...passed)
    console.log(`  PASS — ${passed.length} questions cleared fidelity threshold`)

    if (failed.length > 0) {
      console.log(`  FAIL — ${failed.length} questions below threshold`)
    }

    if (failed.length === 0) break

    if (iteration === 3) {
      const forcePassed = failed.map(f => ({ ...f, iteration_limit_reached: true }))
      passedItems.push(...forcePassed)
      forcedPassCount = forcePassed.length
      console.log(`  Force-passed ${forcePassed.length} questions after max iterations`)
    } else {
      console.log(`  Re-translating ${failed.length} questions via coordinator...`)
      const failedIds       = new Set(failed.map(f => f.id))
      const failedQuestions = questions.filter(q => failedIds.has(q.id))
      const retryBrief      = await runRetryCoordinator(anthropic, failed)

      console.log('\nStage 2: 9 translators running in parallel...')
      const retryTranslations = await runStage2Translators(openai, anthropic, retryBrief, failedQuestions)

      console.log('\nStage 3: 9 back-translators running in parallel (cross-model)...')
      const retryBackTranslations = await runStage3BackTranslators(openai, anthropic, retryTranslations)

      console.log('\nStage 4: Judge Round 1 — Opus evaluating 9 candidates per question...')
      const retryJudge = await runJudge(anthropic, failedQuestions, retryBrief, retryTranslations, retryBackTranslations)

      pendingItems = retryJudge
    }
  }

  // ── Output ────────────────────────────────────────────────────────────────
  const timestamp = Date.now()
  const ts        = new Date(timestamp).toISOString().replace(/:/g, '-').slice(0, 19)

  const report     = generateReport({ timestamp, questions, passedFirstRound, retriedCount, forcedPassCount, iterationsUsed, passedItems })
  const reportPath = path.join(__dirname, `czech-translation-report-${ts}.md`)
  fs.writeFileSync(reportPath, report, 'utf-8')

  const jsonData = generateJSON(questions, passedItems)
  const jsonPath = path.join(__dirname, 'czech-questions.json')
  fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2), 'utf-8')

  console.log(`\nDone. Report saved to scripts/czech-translation-report-${ts}.md`)
  console.log(`      JSON saved to scripts/czech-questions.json`)
  console.log('══════════════════════════════════════════════')
}

main().catch(err => {
  console.error(`\n✗ Fatal: ${err.message}`)
  process.exit(1)
})
