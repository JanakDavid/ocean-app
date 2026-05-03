import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { z } from 'zod'

const resend = new Resend(process.env.RESEND_API_KEY)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const SubmitSchema = z.object({
  answers: z.array(
    z.object({
      domain: z.string(),
      facet:  z.number().int(),
      score:  z.number().int().min(1).max(5),
    })
  ),
  userData: z
    .object({
      firstName:  z.string().max(100).nullable().optional(),
      department: z.string().max(100).nullable().optional(),
      email:      z.union([z.string().email(), z.literal("")]).nullable().optional(),
    })
    .optional(),
  lang: z.enum(['en', 'cs']).optional().default('en'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Request body received:', JSON.stringify(body).slice(0, 500))

    const parsed = SubmitSchema.safeParse(body)
    if (!parsed.success) {
      console.error('Zod validation error:', JSON.stringify(parsed.error.flatten(), null, 2))
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const { answers, userData, lang } = parsed.data

    // Run scoring on the server
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const calculateScore = require('@alheimsins/bigfive-calculate-score')
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const getResult = require('@bigfive-org/results')

    const scoreResult = calculateScore({ answers })
    const resultTexts = getResult({ scores: scoreResult, lang: 'en' })

    const { data, error } = await supabase
      .from('results')
      .insert({
        first_name: userData?.firstName || null,
        department: userData?.department || null,
        email: userData?.email || null,
        answers: answers,
        scores: scoreResult,
      })
      .select('id')
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Failed to save result' }, { status: 500 })
    }

    // Fire-and-forget email — never blocks the response.
    // Guard against aborted requests (React StrictMode double-invoke) to ensure
    // only the real submission triggers an email with the confirmed data.id.
    if (userData?.email && !request.signal.aborted) {
      const email     = userData.email
      const firstName = userData.firstName || null
      const resultId  = data.id
      const baseUrl   = process.env.NEXT_PUBLIC_BASE_URL || `https://${process.env.VERCEL_URL}` || 'http://localhost:3000'
      const resultUrl = `${baseUrl}/results?id=${resultId}`
      const greeting  = firstName ? `Hi ${firstName},` : 'Hi there,'
      const safeGreeting = greeting.replace(/[<>&"]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]!))

      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your OCEAN result is ready</title>
</head>
<body style="margin:0;padding:0;background:#F2EFE7;font-family:'Inter',system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F2EFE7;padding:48px 24px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- Header -->
          <tr>
            <td style="padding-bottom:40px;">
              <p style="margin:0;font-size:11px;font-weight:500;letter-spacing:0.18em;text-transform:uppercase;color:#6B6A63;">
                OCEAN Instrument
              </p>
            </td>
          </tr>

          <!-- Body card -->
          <tr>
            <td style="background:#ffffff;padding:48px 40px;">

              <p style="margin:0 0 24px;font-size:11px;font-weight:500;letter-spacing:0.18em;text-transform:uppercase;color:#6B6A63;">
                Your result is ready
              </p>

              <p style="margin:0 0 16px;font-family:'Instrument Serif','Times New Roman',serif;font-size:36px;font-weight:400;line-height:1.1;letter-spacing:-0.02em;color:#111111;">
                ${safeGreeting}
              </p>

              <p style="margin:0 0 32px;font-size:16px;line-height:1.6;color:#3A3A38;">
                Your OCEAN personality assessment has been scored and your profile is ready to view.
                This link is permanent — return to it any time.
              </p>

              <!-- UUID -->
              <p style="margin:0 0 8px;font-size:11px;font-weight:500;letter-spacing:0.18em;text-transform:uppercase;color:#6B6A63;">
                Result ID
              </p>
              <p style="margin:0 0 32px;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:13px;color:#3A3A38;letter-spacing:0.04em;word-break:break-all;">
                ${resultId}
              </p>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#111111;">
                    <a href="${resultUrl}" style="display:inline-block;padding:16px 32px;font-size:14px;font-weight:500;color:#F2EFE7;text-decoration:none;letter-spacing:0.01em;">
                      View your profile →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:32px 0 0;font-size:13px;line-height:1.6;color:#A6A49A;">
                Or copy this link into your browser:<br />
                <span style="font-family:'JetBrains Mono',ui-monospace,monospace;font-size:12px;word-break:break-all;">${resultUrl}</span>
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:32px;">
              <p style="margin:0;font-size:12px;color:#A6A49A;line-height:1.6;">
                © 2026 OCEAN Instrument · Built on open science<br />
                You received this because you provided your email when taking the assessment.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

      resend.emails.send({
        from: 'OCEAN Instrument <onboarding@resend.dev>',
        to: email,
        subject: 'Your OCEAN result is ready',
        html,
      }).catch(err => console.error('Email dispatch error:', err))
    }

    return NextResponse.json({ id: data.id, results: resultTexts, lang })
  } catch (err) {
    console.error('Submit error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}