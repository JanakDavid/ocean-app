import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { answers, userData } = body

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

    return NextResponse.json({ id: data.id, results: resultTexts })
  } catch (err) {
    console.error('Submit error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}