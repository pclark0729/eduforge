import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/require-auth'
import { getActiveAIProvider, createProviderFromEnv } from '@/lib/ai/provider-factory'
import { ContentGenerator } from '@/lib/content/content-generator'
import { createServerComponentClient } from '@/lib/supabase/server'
import { generateMilestoneContent } from '@/lib/content/generate-milestone-content'
import { setGenerationProgress, clearGenerationProgress } from '@/lib/utils/generation-progress'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const supabase = await createServerComponentClient()
    const body = await request.json()

    const { topic, level, priorKnowledge, goalId } = body

    if (!topic || !level) {
      return NextResponse.json(
        { error: 'Topic and level are required' },
        { status: 400 }
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

    // Generate learning path
    const generator = new ContentGenerator(provider)
    const learningPath = await generator.createLearningPath(
      topic,
      level,
      priorKnowledge
    )

    // Save to database
    const { data: savedPath, error: saveError } = await (supabase
      .from('learning_paths') as any)
      .insert({
        user_id: user.id,
        learning_goal_id: goalId || null,
        title: learningPath.title,
        description: learningPath.description,
        topic: learningPath.topic,
        level: learningPath.level,
        estimated_hours: learningPath.estimated_hours,
        prerequisites: learningPath.prerequisites,
        key_concepts: learningPath.key_concepts,
        milestones: learningPath.milestones,
      })
      .select()
      .single()

    if (saveError) {
      throw saveError
    }

    // Get user profile for learning style
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('learning_style')
      .eq('id', user.id)
      .single()

    // Return immediately so user can navigate to the path
    // Content will be generated in the background
    const response = NextResponse.json({
      learningPath: savedPath,
      generatedContent: {
        lessons: 0,
        worksheets: 0,
        quizzes: 0,
        capstones: 0,
      },
      message: 'Learning path created! Content is being generated in the background.',
    })

    // Generate content in background (don't await - let it run async)
    generateContentInBackground(
      supabase,
      generator,
      (savedPath as any).id,
      learningPath,
      (profile as any)?.learning_style || null
    ).catch((error) => {
      console.error('Error generating content in background:', error)
    })

    return response
  } catch (error: any) {
    console.error('Error generating learning path:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate learning path' },
      { status: 500 }
    )
  }
}

// Background content generation function
async function generateContentInBackground(
  supabase: any,
  generator: ContentGenerator,
  pathId: string,
  learningPath: any,
  learningStyle: string | null
) {
  const milestones = learningPath.milestones || []
  const allGeneratedContent = {
    lessons: [] as any[],
    worksheets: [] as any[],
    quizzes: [] as any[],
    capstones: [] as any[],
  }

  // Initialize progress tracking
  setGenerationProgress(pathId, {
    status: 'generating',
    currentStep: 'Starting content generation...',
    progress: {
      milestones: 0,
      totalMilestones: milestones.length,
      lessons: 0,
      worksheets: 0,
      quizzes: 0,
      capstones: 0,
    },
  })

  // Generate content for each milestone sequentially
  for (let i = 0; i < milestones.length; i++) {
    const milestone = milestones[i]
    try {
      console.log(`\n=== Generating content for milestone: ${milestone.level} ===`)
      
      // Update progress
      setGenerationProgress(pathId, {
        status: 'generating',
        currentStep: `Generating content for ${milestone.level} level milestone (${i + 1}/${milestones.length})...`,
        progress: {
          milestones: i,
          totalMilestones: milestones.length,
          lessons: allGeneratedContent.lessons.length,
          worksheets: allGeneratedContent.worksheets.length,
          quizzes: allGeneratedContent.quizzes.length,
          capstones: allGeneratedContent.capstones.length,
        },
      })
      
      const milestoneContent = await generateMilestoneContent(
        supabase,
        generator,
        pathId,
        milestone,
        milestone.level,
        learningPath.title,
        learningPath.topic,
        learningStyle
      )

      console.log(`Milestone ${milestone.level} generated:`, {
        lessons: milestoneContent.lessons.length,
        worksheets: milestoneContent.worksheets.length,
        quizzes: milestoneContent.quizzes.length,
        capstones: milestoneContent.capstones.length,
      })

      allGeneratedContent.lessons.push(...milestoneContent.lessons)
      allGeneratedContent.worksheets.push(...milestoneContent.worksheets)
      allGeneratedContent.quizzes.push(...milestoneContent.quizzes)
      allGeneratedContent.capstones.push(...milestoneContent.capstones)

      // Get actual counts from database for more accurate progress
      try {
        const [lessonsCount, worksheetsCount, quizzesCount, capstonesCount] = await Promise.all([
          supabase.from('lessons').select('id', { count: 'exact', head: true }).eq('learning_path_id', pathId),
          supabase.from('worksheets').select('id', { count: 'exact', head: true }).eq('learning_path_id', pathId),
          supabase.from('quizzes').select('id', { count: 'exact', head: true }).eq('learning_path_id', pathId),
          supabase.from('capstone_projects').select('id', { count: 'exact', head: true }).eq('learning_path_id', pathId),
        ])

        // Update progress after milestone with actual database counts
        setGenerationProgress(pathId, {
          status: 'generating',
          currentStep: `Completed ${milestone.level} level milestone (${i + 1}/${milestones.length})`,
          progress: {
            milestones: i + 1,
            totalMilestones: milestones.length,
            lessons: lessonsCount.count || allGeneratedContent.lessons.length,
            worksheets: worksheetsCount.count || allGeneratedContent.worksheets.length,
            quizzes: quizzesCount.count || allGeneratedContent.quizzes.length,
            capstones: capstonesCount.count || allGeneratedContent.capstones.length,
          },
        })
      } catch (countError) {
        // Fallback to in-memory counts if database query fails
        setGenerationProgress(pathId, {
          status: 'generating',
          currentStep: `Completed ${milestone.level} level milestone (${i + 1}/${milestones.length})`,
          progress: {
            milestones: i + 1,
            totalMilestones: milestones.length,
            lessons: allGeneratedContent.lessons.length,
            worksheets: allGeneratedContent.worksheets.length,
            quizzes: allGeneratedContent.quizzes.length,
            capstones: allGeneratedContent.capstones.length,
          },
        })
      }
    } catch (milestoneErr: any) {
      console.error(`Error generating content for milestone ${milestone.level}:`, milestoneErr)
      console.error('Error stack:', milestoneErr.stack)
      
      setGenerationProgress(pathId, {
        status: 'error',
        currentStep: `Error generating ${milestone.level} milestone`,
        progress: {
          milestones: i,
          totalMilestones: milestones.length,
          lessons: allGeneratedContent.lessons.length,
          worksheets: allGeneratedContent.worksheets.length,
          quizzes: allGeneratedContent.quizzes.length,
          capstones: allGeneratedContent.capstones.length,
        },
        error: milestoneErr.message,
      })
      // Continue with next milestone
    }
  }

  // Get final counts from database
  try {
    const [lessonsCount, worksheetsCount, quizzesCount, capstonesCount] = await Promise.all([
      supabase.from('lessons').select('id', { count: 'exact', head: true }).eq('learning_path_id', pathId),
      supabase.from('worksheets').select('id', { count: 'exact', head: true }).eq('learning_path_id', pathId),
      supabase.from('quizzes').select('id', { count: 'exact', head: true }).eq('learning_path_id', pathId),
      supabase.from('capstone_projects').select('id', { count: 'exact', head: true }).eq('learning_path_id', pathId),
    ])

    // Mark as completed with actual database counts
    setGenerationProgress(pathId, {
      status: 'completed',
      currentStep: 'All content generated successfully!',
      progress: {
        milestones: milestones.length,
        totalMilestones: milestones.length,
        lessons: lessonsCount.count || 0,
        worksheets: worksheetsCount.count || 0,
        quizzes: quizzesCount.count || 0,
        capstones: capstonesCount.count || 0,
      },
    })
  } catch (countError) {
    // Fallback to in-memory counts
    setGenerationProgress(pathId, {
      status: 'completed',
      currentStep: 'All content generated successfully!',
      progress: {
        milestones: milestones.length,
        totalMilestones: milestones.length,
        lessons: allGeneratedContent.lessons.length,
        worksheets: allGeneratedContent.worksheets.length,
        quizzes: allGeneratedContent.quizzes.length,
        capstones: allGeneratedContent.capstones.length,
      },
    })
  }

  console.log('Content generation summary:', {
    pathId,
    lessons: allGeneratedContent.lessons.length,
    worksheets: allGeneratedContent.worksheets.length,
    quizzes: allGeneratedContent.quizzes.length,
    capstones: allGeneratedContent.capstones.length,
  })

  // Clear progress after a delay
  setTimeout(() => {
    clearGenerationProgress(pathId)
  }, 60000)
}






