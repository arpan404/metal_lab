import { NextRequest, NextResponse } from 'next/server'
import { supabaseTestClient } from '@/lib/supabase-test'

export async function GET(req: NextRequest) {
  try {
    // Test user_state table
    const { data: userState, error: userError } = await supabaseTestClient
      .from('user_state')
      .select('*')
      .limit(1)

    if (userError) throw userError

    // Test learning_state table
    const { data: learningState, error: learningError } = await supabaseTestClient
      .from('learning_state')
      .select('*')
      .limit(1)

    if (learningError) throw learningError

    // Test stats table
    const { data: stats, error: statsError } = await supabaseTestClient
      .from('stats')
      .select('*')
      .limit(1)

    if (statsError) throw statsError

    return NextResponse.json({
      success: true,
      data: {
        userState,
        learningState,
        stats
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 })
  }
}