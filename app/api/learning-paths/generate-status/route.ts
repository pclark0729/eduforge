import { NextRequest, NextResponse } from 'next/server'
import { getGenerationProgress } from '@/lib/utils/generation-progress'
import { createServerComponentClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const pathId = searchParams.get('pathId')

  if (!pathId) {
    return NextResponse.json(
      { error: 'pathId is required' },
      { status: 400 }
    )
  }

  const progress = getGenerationProgress(pathId)
  
  if (!progress) {
    // If no in-memory progress, check database to see if generation might be complete
    try {
      const supabase = await createServerComponentClient()
      
      const [lessonsResult, worksheetsResult, quizzesResult, capstonesResult] = await Promise.all([
        supabase.from('lessons').select('id', { count: 'exact', head: true }).eq('learning_path_id', pathId),
        supabase.from('worksheets').select('id', { count: 'exact', head: true }).eq('learning_path_id', pathId),
        supabase.from('quizzes').select('id', { count: 'exact', head: true }).eq('learning_path_id', pathId),
        supabase.from('capstone_projects').select('id', { count: 'exact', head: true }).eq('learning_path_id', pathId),
      ])

      const totalContent = (lessonsResult.count || 0) + 
                           (worksheetsResult.count || 0) + 
                           (quizzesResult.count || 0) + 
                           (capstonesResult.count || 0)

      // If there's content, generation might be complete or in progress
      if (totalContent > 0) {
        return NextResponse.json({
          status: 'not_found',
          message: 'No active generation tracking found',
        })
      }
    } catch (error) {
      // Ignore errors, just return not_found
    }

    return NextResponse.json({
      status: 'not_found',
      message: 'No generation in progress',
    })
  }

  // Enhance progress with actual database counts if available
  try {
    const supabase = await createServerComponentClient()
    
    const [lessonsResult, worksheetsResult, quizzesResult, capstonesResult] = await Promise.all([
      supabase.from('lessons').select('id', { count: 'exact', head: true }).eq('learning_path_id', pathId),
      supabase.from('worksheets').select('id', { count: 'exact', head: true }).eq('learning_path_id', pathId),
      supabase.from('quizzes').select('id', { count: 'exact', head: true }).eq('learning_path_id', pathId),
      supabase.from('capstone_projects').select('id', { count: 'exact', head: true }).eq('learning_path_id', pathId),
    ])

    // Use actual database counts if they're higher (more accurate)
    const enhancedProgress = {
      ...progress,
      progress: {
        ...progress.progress,
        lessons: Math.max(progress.progress.lessons, lessonsResult.count || 0),
        worksheets: Math.max(progress.progress.worksheets, worksheetsResult.count || 0),
        quizzes: Math.max(progress.progress.quizzes, quizzesResult.count || 0),
        capstones: Math.max(progress.progress.capstones, capstonesResult.count || 0),
      },
    }

    return NextResponse.json(enhancedProgress)
  } catch (error) {
    // If database query fails, return in-memory progress
    return NextResponse.json(progress)
  }
}

