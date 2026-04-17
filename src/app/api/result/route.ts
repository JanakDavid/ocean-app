import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('results')
      .select('id, scores, first_name, department, created_at')
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Result not found' }, { status: 404 })
    }

    // Get result texts server-side
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const getResult = require('@bigfive-org/results')
    const resultTexts = getResult({ scores: data.scores, lang: 'en' })

    return NextResponse.json({
      id: data.id,
      firstName: data.first_name,
      department: data.department,
      createdAt: data.created_at,
      results: resultTexts,
    })
  } catch (err) {
    console.error('Result fetch error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}