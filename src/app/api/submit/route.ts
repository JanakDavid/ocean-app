import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const SubmitSchema = z.object({
  answers: z
    .array(z.number().int().min(1).max(5))
    .max(120),
  userData: z
    .object({
      firstName:  z.string().max(100).nullable().optional(),
      department: z.string().max(100).nullable().optional(),
      email:      z.string().email().nullable().optional(),
    })
    .optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const parsed = SubmitSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const { answers, userData } = parsed.data

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
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
      fetch(`${baseUrl}/api/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userData.email,
          firstName: userData.firstName || null,
          resultId: data.id,
        }),
      }).catch(err => console.error('Email dispatch error:', err))
    }

    return NextResponse.json({ id: data.id, results: resultTexts })
  } catch (err) {
    console.error('Submit error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}