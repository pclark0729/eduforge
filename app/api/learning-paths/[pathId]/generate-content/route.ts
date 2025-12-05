import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/require-auth'
import { getActiveAIProvider, createProviderFromEnv } from '@/lib/ai/provider-factory'
import { ContentGenerator } from '@/lib/content/content-generator'
import { createServerComponentClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { pathId: string } }
) {
  try {
    const user = await requireAuth()
    const supabase = await createServerComponentClient()
    const body = await request.json()

    const { milestoneLevel } = body

    if (!milestoneLevel) {
      return NextResponse.json(
        { error: 'milestoneLevel is required' },
        { status: 400 }
      )
    }

    // Get learning path
    const { data: learningPath, error: pathError } = await supabase
      .from('learning_paths')
      .select('*')
      .eq('id', params.pathId)
      .eq('user_id', user.id)
      .single()

    if (pathError || !learningPath) {
      return NextResponse.json(
        { error: 'Learning path not found' },
        { status: 404 }
      )
    }

    const learningPathAny = learningPath as any
    const milestones = (learningPathAny.milestones as any[]) || []
    const milestone = milestones.find((m: any) => m.level === milestoneLevel)

    if (!milestone) {
      return NextResponse.json(
        { error: 'Milestone not found' },
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

    const generator = new ContentGenerator(provider)

    // Get user profile for learning style
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('learning_style')
      .eq('id', user.id)
      .single()

    const profileAny = profile as any

    const generatedContent = {
      lessons: [] as any[],
      worksheets: [] as any[],
      quizzes: [] as any[],
      capstone: null as any,
    }

    // Generate lessons for each concept in the milestone
    for (let i = 0; i < milestone.concepts.length; i++) {
      const concept = milestone.concepts[i]
      
      try {
        const lesson = await generator.createLesson(
          concept,
          milestoneLevel,
          profileAny?.learning_style || undefined,
          `Part of ${learningPathAny.title} - ${milestoneLevel} level`
        )

        const { data: savedLesson, error: lessonError } = await (supabase
          .from('lessons') as any)
          .insert({
            learning_path_id: params.pathId,
            title: lesson.title,
            concept: lesson.concept,
            level: lesson.level,
            order_index: i,
            simple_explanation: lesson.simple_explanation,
            deep_explanation: lesson.deep_explanation,
            real_world_use_cases: lesson.real_world_use_cases,
            analogies: lesson.analogies,
            visual_models: lesson.visual_models,
            step_by_step_examples: lesson.step_by_step_examples,
            common_mistakes: lesson.common_mistakes,
            estimated_minutes: lesson.estimated_minutes,
          })
          .select()
          .single()

        if (lessonError) {
          console.error(`Error saving lesson for ${concept}:`, lessonError)
          throw new Error(`Failed to save lesson: ${lessonError.message}`)
        }

        const savedLessonAny = savedLesson as any
        if (savedLessonAny) {
          generatedContent.lessons.push(savedLessonAny)

          // Generate worksheet for this lesson
          try {
            const worksheet = await generator.createWorksheet(
              concept,
              milestoneLevel,
              `${lesson.title}: ${lesson.simple_explanation}`
            )

            const { data: savedWorksheet, error: worksheetError } = await (supabase
              .from('worksheets') as any)
              .insert({
                learning_path_id: params.pathId,
                lesson_id: savedLessonAny.id,
                title: worksheet.title,
                level: worksheet.level,
                questions: worksheet.questions,
                answer_key: worksheet.answer_key,
              })
              .select()
              .single()

            const savedWorksheetAny = savedWorksheet as any
            if (worksheetError) {
              console.error(`Error saving worksheet for ${concept}:`, worksheetError)
            } else if (savedWorksheetAny) {
              generatedContent.worksheets.push(savedWorksheetAny)
            }
          } catch (worksheetErr: any) {
            console.error(`Error generating worksheet for ${concept}:`, worksheetErr)
            // Don't throw - continue with other content
          }
        }
      } catch (lessonErr: any) {
        console.error(`Error generating lesson for ${concept}:`, lessonErr)
        // Don't throw - continue with other concepts
      }
    }

    // Generate quiz for the milestone
    try {
      const quiz = await generator.createQuiz(
        milestone.concepts,
        milestoneLevel,
        'quiz'
      )

      const { data: savedQuiz, error: quizError } = await (supabase
        .from('quizzes') as any)
        .insert({
          learning_path_id: params.pathId,
          title: quiz.title,
          level: quiz.level,
          type: quiz.type,
          questions: quiz.questions,
          answer_key: quiz.answer_key,
          passing_score: quiz.passing_score,
          time_limit_minutes: quiz.time_limit_minutes,
        })
        .select()
        .single()

      const savedQuizAny = savedQuiz as any
      if (quizError) {
        console.error('Error saving quiz:', quizError)
      } else if (savedQuizAny) {
        generatedContent.quizzes.push(savedQuizAny)
      }
    } catch (quizErr: any) {
      console.error('Error generating quiz:', quizErr)
      // Don't throw - continue
    }

    // Generate capstone project for advanced/expert levels
    if (milestoneLevel === 'advanced' || milestoneLevel === 'expert') {
      try {
        const capstone = await generator.createCapstone(
          learningPathAny.topic,
          milestoneLevel,
          milestone.concepts
        )

        const { data: savedCapstone, error: capstoneError } = await (supabase
          .from('capstone_projects') as any)
          .insert({
            learning_path_id: params.pathId,
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

        const savedCapstoneAny = savedCapstone as any
        if (capstoneError) {
          console.error('Error saving capstone:', capstoneError)
        } else if (savedCapstoneAny) {
          generatedContent.capstone = savedCapstoneAny
        }
      } catch (capstoneErr: any) {
        console.error('Error generating capstone:', capstoneErr)
        // Don't throw - continue
      }
    }

    // Log what was generated for debugging
    console.log('Generated content summary:', {
      milestoneLevel,
      lessons: generatedContent.lessons.length,
      worksheets: generatedContent.worksheets.length,
      quizzes: generatedContent.quizzes.length,
      capstone: generatedContent.capstone ? 1 : 0,
    })

    return NextResponse.json({
      success: true,
      content: generatedContent,
      message: `Generated ${generatedContent.lessons.length} lessons, ${generatedContent.worksheets.length} worksheets, ${generatedContent.quizzes.length} quizzes${generatedContent.capstone ? ', 1 capstone project' : ''} for ${milestoneLevel} level`,
    })
  } catch (error: any) {
    console.error('Error generating content:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate content' },
      { status: 500 }
    )
  }
}



