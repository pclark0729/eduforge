import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/require-auth'
import { getActiveAIProvider, createProviderFromEnv } from '@/lib/ai/provider-factory'
import { ContentGenerator } from '@/lib/content/content-generator'
import { createServerComponentClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const supabase = await createServerComponentClient()
    const body = await request.json()

    const { learning_path_id, topic, level, concepts } = body

    if (!learning_path_id || !topic || !level || !concepts || !Array.isArray(concepts)) {
      return NextResponse.json(
        { error: 'learning_path_id, topic, level, and concepts array are required' },
        { status: 400 }
      )
    }

    // Verify path belongs to user
    const { data: path } = await supabase
      .from('learning_paths')
      .select('*')
      .eq('id', learning_path_id)
      .eq('user_id', user.id)
      .single()

    if (!path) {
      return NextResponse.json(
        { error: 'Learning path not found' },
        { status: 404 }
      )
    }

    // Get AI provider
    let provider = await getActiveAIProvider(user.id)
    if (!provider) {
      provider = createProviderFromEnv()
      if (!provider) {
        return NextResponse.json(
          { error: 'No AI provider configured' },
          { status: 400 }
        )
      }
    }

    // Generate capstone
    const generator = new ContentGenerator(provider)
    const capstone = await generator.createCapstone(topic, level, concepts)

    // Save to database
    const { data: savedCapstone, error: saveError } = await (supabase
      .from('capstone_projects') as any)
      .insert({
        learning_path_id,
        title: capstone.title,
        level: capstone.level,
        description: capstone.description,
        instructions: capstone.instructions,
        requirements: capstone.requirements,
        evaluation_rubric: capstone.evaluation_rubric,
        extension_challenges: capstone.extension_challenges,
        estimated_hours: capstone.estimated_hours,
      })
      .select()
      .single()

    if (saveError) {
      throw saveError
    }

    return NextResponse.json({ capstone: savedCapstone })
  } catch (error: any) {
    console.error('Error generating capstone:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate capstone' },
      { status: 500 }
    )
  }
}
















