#!/usr/bin/env node
/**
 * Multi-agent AI testing orchestration for the Ocean App.
 *
 * Pipeline:
 *   Orchestrator  — Claude Sonnet 4.6  → structured testing brief (JSON)
 *   Worker 1      — GPT-4o mini        → independent findings (JSON)
 *   Worker 2      — Gemini Flash       → independent findings (JSON)
 *   Validator     — Claude Opus 4.6    → deduplicated final report (Markdown)
 */

const path = require('path')
const fs   = require('fs')

// ── Source files ─────────────────────────────────────────────────────────────

const ROOT = path.join(__dirname, '..')

const SOURCE_FILES = {
  'src/app/page.tsx':             fs.readFileSync(path.join(ROOT, 'src/app/page.tsx'), 'utf-8'),
  'src/app/test/page.tsx':        fs.readFileSync(path.join(ROOT, 'src/app/test/page.tsx'), 'utf-8'),
  'src/app/result/page.tsx':      fs.readFileSync(path.join(ROOT, 'src/app/result/page.tsx'), 'utf-8'),
  'src/app/api/submit/route.ts':  fs.readFileSync(path.join(ROOT, 'src/app/api/submit/route.ts'), 'utf-8'),
}

function formatSources(files) {
  return Object.entries(files)
    .map(([p, c]) => `\`\`\`\n// FILE: ${p}\n${c}\n\`\`\``)
    .join('\n\n')
}

// ── JSON extraction helper ───────────────────────────────────────────────────

function extractJSON(raw) {
  const text = (raw || '').trim()

  // Direct parse
  try { return JSON.parse(text) } catch {}

  // Strip markdown code fence
  const fence = text.match(/```(?:json)?\s*([\s\S]+?)\s*```/)
  if (fence) {
    try { return JSON.parse(fence[1]) } catch {}
  }

  // Greedy match for outermost object or array
  const obj  = text.match(/\{[\s\S]+\}/)
  const arr  = text.match(/\[[\s\S]+\]/)
  const blob = arr && (!obj || text.indexOf('[') < text.indexOf('{')) ? arr[0] : obj && obj[0]
  if (blob) {
    try { return JSON.parse(blob) } catch {}
  }

  throw new Error('Could not extract JSON from model response')
}

// ── Stage 1 — Orchestrator (Claude Sonnet 4.6) ───────────────────────────────

async function runOrchestrator(anthropic, sources) {
  console.log('\n[1/4] ORCHESTRATOR  Claude Sonnet 4.6  →  generating testing brief…')

  const res = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    messages: [{
      role: 'user',
      content: `You are a senior QA engineer. Read the following Next.js application source files and produce a structured testing brief covering four areas.

${sources}

Return ONLY a JSON object — no prose, no markdown fences — with exactly this shape:
{
  "appSummary": "one sentence describing what this app does",
  "areas": {
    "mobileUI": {
      "description": "What mobile UI/UX issues should testers look for?",
      "checkpoints": ["list of specific UI checks"],
      "observedRisks": ["concrete risks visible in the code"]
    },
    "edgeCases": {
      "description": "What edge-case scenarios should be tested?",
      "checkpoints": ["list of specific scenarios"],
      "observedRisks": ["edge cases visible in the code"]
    },
    "codeVulnerabilities": {
      "description": "What security or code-quality vulnerabilities exist?",
      "checkpoints": ["list of specific security/quality checks"],
      "observedRisks": ["vulnerabilities visible in the code"]
    },
    "grammarCopyIssues": {
      "description": "What grammar, copy, or UX-writing problems exist?",
      "checkpoints": ["list of specific copy items to review"],
      "observedRisks": ["copy problems visible in the code"]
    }
  }
}`,
    }],
  })

  const text = res.content.find(b => b.type === 'text')?.text || ''
  const brief = extractJSON(text)
  console.log(`    ✓ Brief covers: ${Object.keys(brief.areas).join(', ')}`)
  return brief
}

// ── Stage 2 — Worker 1 (GPT-4o mini) ────────────────────────────────────────

async function runWorker1(openai, brief, sources) {
  console.log('[2/4] WORKER 1      GPT-4o mini         →  analysing all 4 areas…')

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [{
        role: 'user',
        content: `You are an independent QA engineer. Using the testing brief and source files below, analyse each of the four areas and report every issue you find.

TESTING BRIEF:
${JSON.stringify(brief, null, 2)}

SOURCE FILES:
${sources}

Return ONLY a JSON object with a "findings" array. Each element must have:
  - "area": one of "mobileUI" | "edgeCases" | "codeVulnerabilities" | "grammarCopyIssues"
  - "severity": "low" | "medium" | "high"
  - "finding": clear description of the specific issue
  - "recommendation": concrete fix or improvement

Be thorough — include every issue, even minor ones.`,
      }],
    })

    const raw = completion.choices[0].message.content
    const parsed = extractJSON(raw)
    const findings = Array.isArray(parsed) ? parsed : (parsed.findings || [])
    console.log(`    ✓ ${findings.length} findings`)
    return findings
  } catch (err) {
    console.error(`    ⚠ Worker 1 failed: ${err.message}`)
    return null
  }
}

// ── Stage 3 — Worker 2 (Gemini Flash) ───────────────────────────────────────

async function runWorker2(genAI, brief, sources) {
  console.log('[3/4] WORKER 2      Gemini 2.0 Flash    →  analysing all 4 areas…')

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const prompt = `You are an independent QA engineer. Using the testing brief and source files below, analyse each of the four areas and report every issue you find.

TESTING BRIEF:
${JSON.stringify(brief, null, 2)}

SOURCE FILES:
${sources}

Return ONLY a JSON array (no markdown, no extra text). Each element must have:
  - "area": one of "mobileUI" | "edgeCases" | "codeVulnerabilities" | "grammarCopyIssues"
  - "severity": "low" | "medium" | "high"
  - "finding": clear description of the specific issue
  - "recommendation": concrete fix or improvement

Be thorough — include every issue, even minor ones.`

    const result = await model.generateContent(prompt)
    const raw = result.response.text()
    const parsed = extractJSON(raw)
    const findings = Array.isArray(parsed) ? parsed : (parsed.findings || [])
    console.log(`    ✓ ${findings.length} findings`)
    return findings
  } catch (err) {
    console.error(`    ⚠ Worker 2 failed: ${err.message}`)
    return null
  }
}

// ── Stage 4 — Validator (Claude Opus 4.6) ────────────────────────────────────

async function runValidator(anthropic, brief, w1, w2) {
  console.log('[4/4] VALIDATOR     Claude Opus 4.6     →  final report…')

  const w1Text = w1
    ? JSON.stringify(w1, null, 2)
    : '_Worker 1 (GPT-4o mini) did not return results._'
  const w2Text = w2
    ? JSON.stringify(w2, null, 2)
    : '_Worker 2 (Gemini Flash) did not return results._'

  const res = await anthropic.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 8192,
    thinking: { type: 'adaptive' },
    output_config: { effort: 'high' },
    messages: [{
      role: 'user',
      content: `You are a principal engineer conducting a final quality review of a Next.js Big Five personality test application ("Ocean App").

Two independent AI reviewers have each analysed the codebase across four areas. Your job is to:
1. Compare their findings and identify duplicates
2. Assign a final severity to each unique finding
3. Produce a polished markdown report

---

TESTING BRIEF (what was examined):
${JSON.stringify(brief, null, 2)}

---

WORKER 1 FINDINGS — GPT-4o mini:
${w1Text}

---

WORKER 2 FINDINGS — Gemini 2.0 Flash:
${w2Text}

---

Produce a markdown report with these three sections in order:

## Executive Summary
Two to three paragraphs covering the overall state of the codebase, key strengths, and most critical concerns.

## Findings

A markdown table with columns:
| Area | Severity | Finding | Source | Recommendation |

Where Source is "GPT", "Gemini", or "Both". Deduplicate: if both workers found the same issue, merge into one row with Source = "Both". Sort by severity (high → medium → low).

## Verdict

Rate the overall code quality on a scale of **1–10** with a one-paragraph justification.`,
    }],
  })

  const text = res.content.find(b => b.type === 'text')?.text || ''
  console.log('    ✓ Report generated')
  return text
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('╔══════════════════════════════════════════════╗')
  console.log('║  Ocean App — Multi-Agent AI Testing Script   ║')
  console.log('╚══════════════════════════════════════════════╝')

  // Validate env vars
  const missing = ['ANTHROPIC_API_KEY', 'OPENAI_API_KEY', 'GEMINI_API_KEY']
    .filter(k => !process.env[k])
  if (missing.length) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`)
  }

  // Load SDK dependencies (dynamic import handles CJS/ESM interop)
  const { default: Anthropic }         = await import('@anthropic-ai/sdk')
  const { OpenAI }                     = await import('openai')
  const { GoogleGenerativeAI }         = await import('@google/generative-ai')

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const openai    = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const genAI     = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

  const sources = formatSources(SOURCE_FILES)

  // Stage 1 — Orchestrator
  const brief = await runOrchestrator(anthropic, sources)

  // Stages 2 & 3 — Workers in parallel
  console.log('\nRunning workers in parallel…')
  const [w1, w2] = await Promise.all([
    runWorker1(openai, brief, sources),
    runWorker2(genAI,  brief, sources),
  ])

  if (!w1 && !w2) {
    throw new Error('Both workers failed — cannot produce a report.')
  }

  // Stage 4 — Validator
  console.log()
  const report = await runValidator(anthropic, brief, w1, w2)

  // Save report with timestamp
  const ts         = new Date().toISOString().replace(/:/g, '-').slice(0, 19)
  const reportName = `ai-test-report-${ts}.md`
  const reportPath = path.join(__dirname, reportName)

  const header = [
    `# AI Testing Report — Ocean App`,
    `_Generated: ${new Date().toLocaleString('en-GB')} by multi-agent pipeline_`,
    `_Models: Claude Sonnet 4.6 (orchestrator) · GPT-4o mini · Gemini 2.0 Flash · Claude Opus 4.6 (validator)_`,
    '',
    '---',
    '',
  ].join('\n')

  fs.writeFileSync(reportPath, header + report, 'utf-8')

  console.log(`\n✓ Report saved → ${reportPath}`)
  console.log('══════════════════════════════════════════════')
}

main().catch(err => {
  console.error(`\n✗ Fatal: ${err.message}`)
  process.exit(1)
})
