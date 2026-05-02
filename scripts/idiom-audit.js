#!/usr/bin/env node
/**
 * IPIP-NEO-PI 120-question idiom and clarity audit
 *
 * Pipeline:
 *   Stage 1   — Claude Sonnet 4 (orchestrator)       → audit brief
 *   Stage 2   — 3× GPT-4o mini + 3× Gemini 2.5 Flash → flagged questions (parallel)
 *   Stage 3   — Claude Opus 4 (judge round 1)         → consolidated hints
 *   Stage 4   — 3× GPT-4o mini + 3× Gemini (personas) → clarity/fidelity scores (parallel)
 *   Stage 5   — score evaluation + iteration loop (max 3)
 *
 * Run:
 *   DOTENV_CONFIG_PATH=.env.local node -r dotenv/config scripts/idiom-audit.js
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
  return questions.map((q, i) => `${i + 1}. [${q.id}] ${q.text}`).join('\n')
}

function avg(nums) {
  const valid = nums.filter(n => typeof n === 'number' && !isNaN(n))
  return valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : null
}

// ── Stage 1: Orchestrator ─────────────────────────────────────────────────────

async function runOrchestrator(anthropic, questions) {
  const res = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8192,
    system:
      'You are an orchestrator for a psychometric question audit. Your job is to prepare a clear brief for specialist evaluator agents. You are auditing IPIP-NEO-PI personality assessment questions for language clarity issues that would affect non-native English speakers from Central and Eastern Europe. Do not modify or rewrite any questions — only identify and brief on potential issues.',
    messages: [{
      role: 'user',
      content:
        `Here are all 120 IPIP-NEO-PI questions:\n${formatQuestionList(questions)}\n\n` +
        'Produce a structured JSON brief containing: (1) the full list of questions with their IDs, ' +
        '(2) audit focus areas: idioms, metaphors, colloquialisms, culturally-specific phrases, ' +
        'ambiguous single words, double negatives, and any phrasing that could shift the psychological ' +
        'construct being measured. Output only valid JSON, no markdown.',
    }],
  })
  const text = res.content.find(b => b.type === 'text')?.text || ''
  return extractJSON(text)
}

async function runHintRevision(anthropic, failedItems) {
  const itemList = failedItems
    .map(f =>
      `[${f.id}] "${f.question}"\n  Current hint: "${f.hint || 'none'}"\n  Issue: ${f.issue_summary || 'unclear phrasing'}`
    )
    .join('\n\n')

  const res = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    system:
      'You are an orchestrator for a psychometric question audit. Your job is to prepare a clear brief for specialist evaluator agents. You are auditing IPIP-NEO-PI personality assessment questions for language clarity issues that would affect non-native English speakers from Central and Eastern Europe. Do not modify or rewrite any questions — only identify and brief on potential issues.',
    messages: [{
      role: 'user',
      content:
        'The following questions scored below the clarity/fidelity threshold in persona testing. ' +
        'Revise their hints to be clearer and more neutral (max 8 words each, plain international English). ' +
        'Do not suggest hints for construct-risk questions.\n\n' +
        itemList + '\n\n' +
        'Output only valid JSON array: [{ "id": "...", "revised_hint": "..." }], no markdown.',
    }],
  })
  const text = res.content.find(b => b.type === 'text')?.text || ''
  try { return extractJSON(text) } catch { return [] }
}

// ── Stage 2: Worker agents ────────────────────────────────────────────────────

const WORKER_TASK =
  'Return a JSON array of flagged questions: [{ "id": "...", "question": "...", "issue": "...", "suggested_hint": "..." }]'

const CONSTRUCT_TASK =
  'Return a JSON array of construct-risk items: [{ "id": "...", "question": "...", "construct_risk_reason": "..." }]'

async function workerGPT(openai, systemPrompt, task, brief, questions, label) {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content:
            `ORCHESTRATOR BRIEF:\n${JSON.stringify(brief, null, 2)}\n\n` +
            `ALL 120 QUESTIONS:\n${formatQuestionList(questions)}\n\n` +
            task + ' Output only valid JSON, no markdown.',
        },
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

async function workerGemini(systemPrompt, task, brief, questions, label) {
  try {
    const prompt = `ORCHESTRATOR BRIEF:\n${JSON.stringify(brief, null, 2)}\n\nALL 120 QUESTIONS:\n${formatQuestionList(questions)}\n\n` + task + ' Output only valid JSON, no markdown.'
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      })
    })
    const data = await response.json()
    if (!data.candidates) { console.error(`  ⚠ ${label} API error:`, JSON.stringify(data)); return null }
    const raw = data.candidates[0].content.parts[0].text
    const parsed = extractJSON(raw)
    return Array.isArray(parsed) ? parsed : (parsed.findings || parsed.items || [])
  } catch (err) {
    console.error(`  ⚠ ${label} failed: ${err.message}`)
    return null
  }
}

const SYS_CZECH =
  'You are a bilingual evaluator fluent in English and Czech. You review English psychological assessment questions and flag any phrasing that would be confusing, misleading, or culturally unfamiliar to Czech or Slovak non-native English speakers. Focus on idioms, cultural references, and ambiguous expressions. Output only valid JSON, no markdown.'

const SYS_PLAIN =
  'You are an expert in English linguistics and plain language. You review psychological assessment questions and identify idioms, colloquialisms, metaphors, and culturally bound phrases that reduce clarity for non-native speakers. You do not rewrite questions — you write short clarifying hints only. Output only valid JSON, no markdown.'

const SYS_CONSTRUCT =
  'You are a personality psychologist familiar with the Big Five OCEAN model and IPIP-NEO-PI instrument. You flag questions where adding a clarifying hint could inadvertently shift the psychological construct being measured. Your job is to protect construct validity. Output only valid JSON, no markdown.'

async function runStage2Workers(openai, brief, questions) {
  return Promise.all([
    workerGPT(openai,  SYS_CZECH,     WORKER_TASK,    brief, questions, 'Worker 1 (GPT Czech)'),
    workerGPT(openai,  SYS_PLAIN,     WORKER_TASK,    brief, questions, 'Worker 2 (GPT Plain)'),
    workerGPT(openai,  SYS_CONSTRUCT, CONSTRUCT_TASK, brief, questions, 'Worker 3 (GPT Construct)'),
    workerGemini(SYS_CZECH,     WORKER_TASK,    brief, questions, 'Worker 4 (Gemini Czech)'),
    workerGemini(SYS_PLAIN,     WORKER_TASK,    brief, questions, 'Worker 5 (Gemini Plain)'),
    workerGemini(SYS_CONSTRUCT, CONSTRUCT_TASK, brief, questions, 'Worker 6 (Gemini Construct)'),
  ])
}

// ── Stage 3: Judge Round 1 ────────────────────────────────────────────────────

async function runJudgeRound1(anthropic, workerOutputs, questions) {
  const [w1, w2, w3, w4, w5, w6] = workerOutputs

  const formatWorker = (label, data) =>
    `${label}:\n${data ? JSON.stringify(data, null, 2) : '_No output (agent failed)_'}`

  const res = await anthropic.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 8192,
    system:
      'You are a senior psychometrics editor and judge. You receive evaluation reports from six specialist agents and produce a single deduplicated, quality-controlled list of flagged questions with carefully written hints. Hints must be 8 words or fewer, in plain neutral English understandable to any non-native speaker. Never write hints for questions flagged as construct risks. Output only valid JSON, no markdown.',
    messages: [{
      role: 'user',
      content:
        'Here are all 120 questions for reference:\n' +
        formatQuestionList(questions) + '\n\n' +
        '---\n\n' +
        formatWorker('WORKER 1 — GPT-4o mini (Czech/Slovak perspective)', w1) + '\n\n' +
        formatWorker('WORKER 2 — GPT-4o mini (Plain language expert)', w2) + '\n\n' +
        formatWorker('WORKER 3 — GPT-4o mini (Construct validity)', w3) + '\n\n' +
        formatWorker('WORKER 4 — Gemini 2.5 Flash (Czech/Slovak perspective)', w4) + '\n\n' +
        formatWorker('WORKER 5 — Gemini 2.5 Flash (Plain language expert)', w5) + '\n\n' +
        formatWorker('WORKER 6 — Gemini 2.5 Flash (Construct validity)', w6) + '\n\n' +
        '---\n\n' +
        'Instructions:\n' +
        '1. Merge flagged questions from Workers 1, 2, 4, 5 — deduplicate by question ID.\n' +
        '2. For each unique flagged question: write the best hint (max 8 words, plain neutral international English).\n' +
        '3. Cross-reference against Workers 3 and 6 construct-risk lists — if a question appears there, set construct_risk: true and omit the hint.\n' +
        '4. Output JSON array: [{ "id": "...", "question": "...", "issue_summary": "...", "hint": "..." or null, "construct_risk": true/false, "construct_risk_reason": "..." or null }]',
    }],
  })
  const text = res.content.find(b => b.type === 'text')?.text || ''
  return extractJSON(text)
}

// ── Stage 4: Persona agents ───────────────────────────────────────────────────

function personaPrompt(role) {
  return (
    `You are simulating a ${role} reading a personality assessment. ` +
    'For each question and hint pair you receive, score: ' +
    'clarity 0-100 (how clear is the question + hint together to you?) and ' +
    'fidelity 0-100 (does the hint preserve the original meaning without nudging the answer?). ' +
    'Output only valid JSON, no markdown.'
  )
}

function personaTask(items) {
  const pairs = items
    .map(i => `[${i.id}] "${i.question}" — hint: "${i.hint}"`)
    .join('\n')
  return (
    `Score each of the following question+hint pairs.\n\n${pairs}\n\n` +
    'Return JSON array: [{ "id": "...", "clarity": 0-100, "fidelity": 0-100, "comment": "..." }]' +
    ' Output only valid JSON, no markdown.'
  )
}

async function personaGPT(openai, role, items, label) {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: personaPrompt(role) },
        { role: 'user',   content: personaTask(items) },
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

async function personaGemini(role, items, label) {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: personaPrompt(role) }] },
        contents: [{ role: 'user', parts: [{ text: personaTask(items) }] }]
      })
    })
    const data = await response.json()
    if (!data.candidates) { console.error(`  ⚠ ${label} API error:`, JSON.stringify(data)); return null }
    const raw = data.candidates[0].content.parts[0].text
    const parsed = extractJSON(raw)
    return Array.isArray(parsed) ? parsed : (parsed.scores || parsed.results || [])
  } catch (err) {
    console.error(`  ⚠ ${label} failed: ${err.message}`)
    return null
  }
}

async function runStage4Personas(openai, scorableItems) {
  return Promise.all([
    personaGPT(openai, 'Czech non-native English speaker',  scorableItems, 'Persona 1 (GPT Czech)'),
    personaGPT(openai, 'German non-native English speaker', scorableItems, 'Persona 2 (GPT German)'),
    personaGPT(openai, 'UK native English speaker',         scorableItems, 'Persona 3 (GPT UK)'),
    personaGemini('Czech non-native English speaker',  scorableItems, 'Persona 4 (Gemini Czech)'),
    personaGemini('German non-native English speaker', scorableItems, 'Persona 5 (Gemini German)'),
    personaGemini('UK native English speaker',         scorableItems, 'Persona 6 (Gemini UK)'),
  ])
}

// ── Stage 5: Score evaluation ─────────────────────────────────────────────────

function evaluateScores(items, personaResults) {
  return items.map(item => {
    const allScores = personaResults
      .filter(Boolean)
      .flatMap(agentScores => agentScores.filter(s => s && s.id === item.id))

    const clarityAvg  = avg(allScores.map(s => s.clarity))
    const fidelityAvg = avg(allScores.map(s => s.fidelity))

    return {
      ...item,
      avg_clarity:  clarityAvg  !== null ? Math.round(clarityAvg)  : null,
      avg_fidelity: fidelityAvg !== null ? Math.round(fidelityAvg) : null,
    }
  })
}

// ── Output generation ─────────────────────────────────────────────────────────

function generateReport({
  timestamp, questions, allFlagged, constructRisks,
  passedItems, iterationsUsed, geminiWorkersFailed,
}) {
  const totalFlagged   = allFlagged.length
  const totalRisks     = constructRisks.length
  const totalQuestions = questions.length

  const lines = [
    '# IPIP-NEO-PI Idiom & Clarity Audit',
    '',
    `**Run date:** ${new Date(timestamp).toLocaleString('en-GB')}`,
    `**Total questions audited:** ${totalQuestions}`,
    `**Total flagged:** ${totalFlagged}`,
    `**Total construct risks (no hint):** ${totalRisks}`,
    `**Iterations used:** ${iterationsUsed}`,
    geminiWorkersFailed ? '**Note:** One or more Gemini agents failed — report based on GPT outputs only for those stages.' : '',
    '',
    '---',
    '',
    '## Findings',
    '',
    '| Question ID | Question Text | Issue | Hint | Avg Clarity | Avg Fidelity | Construct Risk |',
    '|---|---|---|---|---|---|---|',
  ]

  // Construct risk items (no scores)
  for (const item of constructRisks) {
    const shortId = item.id.slice(0, 8) + '…'
    lines.push(
      `| \`${shortId}\` | ${item.question} | ${item.issue_summary || '—'} | — | — | — | ✓ |`
    )
  }

  // Passed items with scores
  for (const item of passedItems) {
    const shortId = item.id.slice(0, 8) + '…'
    const hint    = item.hint || '—'
    const clarity  = item.avg_clarity  !== null ? item.avg_clarity  : '—'
    const fidelity = item.avg_fidelity !== null ? item.avg_fidelity : '—'
    const risk     = item.construct_risk ? '✓' : ''
    const note     = item.iteration_limit_reached ? ' _(limit)_' : ''
    lines.push(
      `| \`${shortId}\` | ${item.question} | ${item.issue_summary || '—'} | ${hint}${note} | ${clarity} | ${fidelity} | ${risk} |`
    )
  }

  lines.push('', '---', '', '## Construct Risk Questions', '')
  if (constructRisks.length === 0) {
    lines.push('_None identified._')
  } else {
    for (const item of constructRisks) {
      lines.push(`**\`${item.id}\`** — "${item.question}"`)
      lines.push(`> ${item.construct_risk_reason || 'No reason provided.'}`)
      lines.push('')
    }
  }

  return lines.filter(l => l !== undefined).join('\n')
}

function generateHintsLookup(questions, passedItems) {
  const questionMap = Object.fromEntries(questions.map(q => [q.id, q.text]))

  const entries = passedItems
    .filter(item => !item.construct_risk && item.hint)
    .map(item => {
      const text = questionMap[item.id] || item.question
      return `  ${JSON.stringify(text)}: ${JSON.stringify(item.hint)},`
    })

  return [
    '// Auto-generated by scripts/idiom-audit.js — do not edit by hand.',
    'export const questionHints = {',
    ...entries,
    '};',
    '',
  ].join('\n')
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  // Validate env
  const missing = ['ANTHROPIC_API_KEY', 'OPENAI_API_KEY', 'GEMINI_API_KEY']
    .filter(k => !process.env[k])
  if (missing.length) throw new Error(`Missing env vars: ${missing.join(', ')}`)

  // Load SDK dependencies
  const { default: Anthropic } = await import('@anthropic-ai/sdk')
  const { OpenAI }             = await import('openai')

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const openai    = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  // Load questions directly from JSON — the @bigfive-org/questions JS API is broken/unpublished
  const questions = require('@bigfive-org/questions/data/en/questions.json') // 120 items: { id, text, keyed, domain, facet }
  console.log(`\nLoaded ${questions.length} questions from @bigfive-org/questions`)

  // ── Stage 1 ──────────────────────────────────────────────────────────────
  console.log('\nStage 1: Orchestrator running...')
  const brief = await runOrchestrator(anthropic, questions)
  console.log('  ✓ Brief generated')

  // ── Stage 2 ──────────────────────────────────────────────────────────────
  console.log('\nStage 2: 6 worker agents running in parallel...')
  const workerOutputs = await runStage2Workers(openai, brief, questions)
  const [w1, w2, w3, w4, w5, w6] = workerOutputs
  const geminiWorkersFailed = !w4 && !w5 && !w6

  const workerCounts = workerOutputs.map((o, i) =>
    o ? `W${i + 1}:${o.length}` : `W${i + 1}:fail`
  )
  console.log(`  ✓ Results: ${workerCounts.join('  ')}`)

  // ── Stage 3 ──────────────────────────────────────────────────────────────
  console.log('\nStage 3: Judge Round 1 consolidating outputs...')
  const judgeR1Raw = await runJudgeRound1(anthropic, workerOutputs, questions)
  const judgeR1 = Array.isArray(judgeR1Raw) ? judgeR1Raw : (judgeR1Raw.items || [])
  console.log(`  ✓ ${judgeR1.length} flagged questions (before construct-risk filter)`)

  // Partition
  const constructRisks = judgeR1.filter(i => i.construct_risk)
  let pendingItems     = judgeR1.filter(i => !i.construct_risk && i.hint)
  const passedItems    = []
  let iterationsUsed   = 0

  if (pendingItems.length === 0) {
    console.log('  ✓ No scorable items — all flagged questions are construct risks or have no hint')
  }

  // ── Iteration loop: Stage 4 + Stage 5 ────────────────────────────────────
  for (let iteration = 1; iteration <= 3 && pendingItems.length > 0; iteration++) {
    iterationsUsed = iteration

    console.log(`\nStage 4: 6 persona agents scoring in parallel...`)
    const personaResults = await runStage4Personas(openai, pendingItems)

    console.log(`Stage 5: Judge Round 2 evaluating... (iteration ${iteration}/3)`)
    const scored = evaluateScores(pendingItems, personaResults)

    const passed = scored.filter(
      i => i.avg_clarity !== null && i.avg_fidelity !== null &&
           i.avg_clarity >= 85 && i.avg_fidelity >= 95
    )
    const failed = scored.filter(
      i => i.avg_clarity === null || i.avg_fidelity === null ||
           i.avg_clarity < 85 || i.avg_fidelity < 95
    )

    passedItems.push(...passed)
    console.log(`  PASS — ${passed.length} questions cleared threshold`)

    if (failed.length > 0) {
      console.log(`  FAIL — ${failed.length} questions below threshold: ${failed.map(f => f.id.slice(0, 8)).join(', ')}`)
    }

    if (failed.length === 0) break

    if (iteration === 3) {
      const forcePassed = failed.map(f => ({ ...f, iteration_limit_reached: true }))
      passedItems.push(...forcePassed)
      console.log(`  Force-passed ${forcePassed.length} questions after max iterations`)
    } else {
      console.log(`  Revising hints for ${failed.length} questions via orchestrator...`)
      const revisions = await runHintRevision(anthropic, failed)
      if (Array.isArray(revisions)) {
        for (const rev of revisions) {
          const item = failed.find(f => f.id === rev.id)
          if (item && rev.revised_hint) item.hint = rev.revised_hint
        }
      }
      pendingItems = failed
    }
  }

  // ── Output ────────────────────────────────────────────────────────────────
  const timestamp = Date.now()
  const ts        = new Date(timestamp).toISOString().replace(/:/g, '-').slice(0, 19)

  const report = generateReport({
    timestamp, questions,
    allFlagged: judgeR1,
    constructRisks,
    passedItems,
    iterationsUsed,
    geminiWorkersFailed,
  })

  const reportPath = path.join(__dirname, `ai-idiom-report-${ts}.md`)
  fs.writeFileSync(reportPath, report, 'utf-8')

  const hintsLookup = generateHintsLookup(questions, passedItems)
  const hintsPath   = path.join(__dirname, 'hints-lookup.js')
  fs.writeFileSync(hintsPath, hintsLookup, 'utf-8')

  console.log(`\nDone. Report saved to scripts/ai-idiom-report-${ts}.md`)
  console.log(`      Hints saved to scripts/hints-lookup.js`)
  console.log('══════════════════════════════════════════════')
}

main().catch(err => {
  console.error(`\n✗ Fatal: ${err.message}`)
  process.exit(1)
})
