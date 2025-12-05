import type { AIProvider } from '@/lib/ai/providers/base'
import { ContentGenerator } from './content-generator'
import type { Database, Json } from '@/types/database'
import type { SupabaseClient } from '@supabase/supabase-js'

export async function generateMilestoneContent(
  supabase: SupabaseClient<Database>,
  generator: ContentGenerator,
  learningPathId: string,
  milestone: any,
  milestoneLevel: string,
  learningPathTitle: string,
  learningPathTopic: string,
  learningStyle?: string | null
) {
  const generatedContent = {
    lessons: [] as any[],
    worksheets: [] as any[],
    quizzes: [] as any[],
    capstones: [] as any[],
  }

  // Validate milestone structure
  if (!milestone) {
    console.error('Milestone is null or undefined')
    return generatedContent
  }

  if (!milestone.concepts || !Array.isArray(milestone.concepts) || milestone.concepts.length === 0) {
    console.error(`Milestone ${milestoneLevel} has no concepts:`, milestone)
    return generatedContent
  }

  console.log(`Starting content generation for milestone ${milestoneLevel} with ${milestone.concepts.length} concepts`)

  // Generate lessons for each concept in the milestone
  for (let i = 0; i < milestone.concepts.length; i++) {
    const concept = milestone.concepts[i]
    
    try {
      const lesson = await generator.createLesson(
        concept,
        milestoneLevel,
        learningStyle || undefined,
        `Part of ${learningPathTitle} - ${milestoneLevel} level`
      )

      const { data: savedLesson, error: lessonError } = await supabase
        .from('lessons')
        .insert({
          learning_path_id: learningPathId,
          title: lesson.title,
          concept: lesson.concept,
          level: lesson.level,
          order_index: i,
          simple_explanation: lesson.simple_explanation,
          deep_explanation: lesson.deep_explanation,
          real_world_use_cases: lesson.real_world_use_cases,
          analogies: lesson.analogies,
          visual_models: lesson.visual_models,
          step_by_step_examples: lesson.step_by_step_examples as Json,
          common_mistakes: lesson.common_mistakes,
          estimated_minutes: lesson.estimated_minutes,
        } as Database['public']['Tables']['lessons']['Insert'])
        .select()
        .single()

      if (lessonError) {
        console.error(`Error saving lesson for ${concept}:`, lessonError)
        continue // Skip this lesson and continue
      }

      if (savedLesson) {
        generatedContent.lessons.push(savedLesson)

        // Generate worksheet for this lesson
        try {
          console.log(`Generating worksheet for concept: ${concept}`)
          const worksheet = await generator.createWorksheet(
            concept,
            milestoneLevel,
            `${lesson.title}: ${lesson.simple_explanation}`
          )

          console.log(`Worksheet generated: ${worksheet.title}, ${worksheet.questions?.length || 0} questions`)

          const { data: savedWorksheet, error: worksheetError } = await supabase
            .from('worksheets')
            .insert({
              learning_path_id: learningPathId,
              lesson_id: savedLesson.id,
              title: worksheet.title,
              level: worksheet.level,
              questions: worksheet.questions,
              answer_key: worksheet.answer_key,
            })
            .select()
            .single()

          if (worksheetError) {
            console.error(`Error saving worksheet for ${concept}:`, worksheetError)
            console.error('Worksheet data:', JSON.stringify(worksheet, null, 2))
          } else if (savedWorksheet) {
            console.log(`Worksheet saved successfully: ${savedWorksheet.id}`)
            generatedContent.worksheets.push(savedWorksheet)
          } else {
            console.warn(`Worksheet not saved - no data returned`)
          }
        } catch (worksheetErr: any) {
          console.error(`Error generating worksheet for ${concept}:`, worksheetErr)
          console.error('Error stack:', worksheetErr.stack)
          // Continue with next concept
        }
      }
    } catch (lessonErr: any) {
      console.error(`Error generating lesson for ${concept}:`, lessonErr)
      // Continue with next concept
    }
  }

  // Generate quiz for the milestone
  try {
    const concepts = milestone.concepts || []
    if (concepts.length === 0) {
      console.warn(`Skipping quiz generation for milestone ${milestoneLevel}: no concepts available`)
      return generatedContent
    }

    console.log(`\n=== Generating quiz for milestone level: ${milestoneLevel} ===`)
    console.log(`Concepts: ${concepts.join(', ')}`)
    console.log(`Number of concepts: ${concepts.length}`)

    const quiz = await generator.createQuiz(
      concepts,
      milestoneLevel,
      'quiz'
    )

    console.log(`✓ Quiz generated successfully: ${quiz.title}`)
    console.log(`  Questions: ${quiz.questions?.length || 0}`)
    console.log(`  Level: ${quiz.level}`)
    console.log(`  Type: ${quiz.type}`)
    console.log(`  Passing score: ${quiz.passing_score}%`)
    console.log(`  Time limit: ${quiz.time_limit_minutes} minutes`)

    if (!quiz.questions || quiz.questions.length === 0) {
      console.error('ERROR: Quiz generated with no questions!')
      throw new Error('Quiz generated with no questions')
    }

    if (!quiz.answer_key || Object.keys(quiz.answer_key).length === 0) {
      console.error('ERROR: Quiz generated with no answer key!')
      throw new Error('Quiz generated with no answer key')
    }

    console.log(`Attempting to save quiz to database...`)
    const { data: savedQuiz, error: quizError } = await supabase
      .from('quizzes')
      .insert({
        learning_path_id: learningPathId,
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

    if (quizError) {
      console.error('❌ ERROR saving quiz to database:', quizError)
      console.error('Error code:', quizError.code)
      console.error('Error message:', quizError.message)
      console.error('Error details:', quizError.details)
      console.error('Quiz data being saved:', {
        learning_path_id: learningPathId,
        title: quiz.title,
        level: quiz.level,
        type: quiz.type,
        questions_count: quiz.questions?.length || 0,
        answer_key_count: Object.keys(quiz.answer_key || {}).length,
        passing_score: quiz.passing_score,
        time_limit_minutes: quiz.time_limit_minutes,
      })
      throw quizError // Re-throw to ensure it's not silently ignored
    } else if (savedQuiz) {
      console.log(`✓ Quiz saved successfully to database: ${savedQuiz.id}`)
      generatedContent.quizzes.push(savedQuiz)
    } else {
      console.error('❌ ERROR: Quiz insert returned no data')
      throw new Error('Quiz insert returned no data')
    }
  } catch (quizErr: any) {
    console.error('❌ ERROR generating quiz for milestone:', milestoneLevel)
    console.error('Error type:', quizErr.constructor.name)
    console.error('Error message:', quizErr.message)
    console.error('Error stack:', quizErr.stack)
    if (quizErr.details) {
      console.error('Error details:', quizErr.details)
    }
    if (quizErr.hint) {
      console.error('Error hint:', quizErr.hint)
    }
    // Don't throw - continue with other content generation
  }

  // Generate capstone project for advanced/expert levels
  if (milestoneLevel === 'advanced' || milestoneLevel === 'expert') {
    try {
      console.log(`Generating capstone for milestone level: ${milestoneLevel}`)
      const capstone = await generator.createCapstone(
        learningPathTopic,
        milestoneLevel,
        milestone.concepts || []
      )

      console.log(`Capstone generated: ${capstone.title}`)

      const { data: savedCapstone, error: capstoneError } = await supabase
        .from('capstone_projects')
        .insert({
          learning_path_id: learningPathId,
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

      if (capstoneError) {
        console.error('Error saving capstone:', capstoneError)
        console.error('Capstone data:', JSON.stringify(capstone, null, 2))
      } else if (savedCapstone) {
        console.log(`Capstone saved successfully: ${savedCapstone.id}`)
        generatedContent.capstones.push(savedCapstone)
      } else {
        console.warn(`Capstone not saved - no data returned`)
      }
    } catch (capstoneErr: any) {
      console.error('Error generating capstone:', capstoneErr)
      console.error('Error stack:', capstoneErr.stack)
      console.error('Error message:', capstoneErr.message)
    }
  } else {
    console.log(`Skipping capstone generation for level: ${milestoneLevel} (only generated for advanced/expert)`)
  }

  console.log(`Milestone content generation complete for ${milestoneLevel}:`, {
    lessons: generatedContent.lessons.length,
    worksheets: generatedContent.worksheets.length,
    quizzes: generatedContent.quizzes.length,
    capstones: generatedContent.capstones.length,
  })

  return generatedContent
}


