import { Resend } from 'resend'
import { NextRequest, NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { email, firstName, resultId } = await request.json()

    if (!email || !resultId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const resultUrl = `${baseUrl}/results?id=${resultId}`
    const greeting = firstName ? `Hi ${firstName},` : 'Hi there,'

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
                ${greeting.replace(/[<>&"]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]!))}
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

    const { error } = await resend.emails.send({
      from: 'OCEAN Instrument <onboarding@resend.dev>',
      to: email,
      subject: 'Your OCEAN result is ready',
      html,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Email route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
