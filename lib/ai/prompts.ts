export const PROMPTS = {
  learningPath: (topic: string, level: string, priorKnowledge?: string) => `
Generate a comprehensive learning path for the topic: "${topic}" at ${level} level.

${priorKnowledge ? `User's prior knowledge: ${priorKnowledge}` : 'User is a complete beginner.'}

Create a structured learning path with the following format (respond in valid JSON only):

{
  "title": "Learning Path Title",
  "description": "Brief description of what the learner will achieve",
  "topic": "${topic}",
  "level": "${level}",
  "estimated_hours": number,
  "prerequisites": ["prerequisite1", "prerequisite2"],
  "key_concepts": ["concept1", "concept2", "concept3"],
  "milestones": [
    {
      "level": "beginner",
      "concepts": ["concept1", "concept2"],
      "estimated_time": "X hours",
      "prerequisites": [],
      "outcomes": ["outcome1", "outcome2"]
    },
    {
      "level": "intermediate",
      "concepts": ["concept3", "concept4"],
      "estimated_time": "X hours",
      "prerequisites": ["concept1", "concept2"],
      "outcomes": ["outcome3", "outcome4"]
    },
    {
      "level": "advanced",
      "concepts": ["concept5", "concept6"],
      "estimated_time": "X hours",
      "prerequisites": ["concept3", "concept4"],
      "outcomes": ["outcome5", "outcome6"]
    },
    {
      "level": "expert",
      "concepts": ["concept7", "concept8"],
      "estimated_time": "X hours",
      "prerequisites": ["concept5", "concept6"],
      "outcomes": ["outcome7", "outcome8"]
    }
  ]
}

Ensure the learning path is progressive, builds on previous concepts, and is appropriate for the ${level} level.
`,

  lesson: (
    concept: string,
    level: string,
    learningStyle?: string,
    context?: string
  ) => `
Create a comprehensive lesson for the concept: "${concept}" at ${level} level.

${context ? `Context: ${context}` : ''}
${learningStyle ? `Learning style: ${learningStyle}` : ''}

Generate a lesson with the following structure (respond in valid JSON only):

{
  "title": "Lesson Title",
  "concept": "${concept}",
  "level": "${level}",
  "simple_explanation": "A simple, beginner-friendly explanation (2-3 sentences)",
  "deep_explanation": "A detailed, comprehensive explanation (3-5 paragraphs)",
  "real_world_use_cases": [
    "Use case 1 with brief description",
    "Use case 2 with brief description",
    "Use case 3 with brief description"
  ],
  "analogies": [
    "Analogy 1 that helps explain the concept",
    "Analogy 2 that helps explain the concept"
  ],
  "visual_models": "Description of visual models or mental frameworks (markdown format)",
  "step_by_step_examples": [
    {
      "step": 1,
      "description": "What this step does",
      "example": "Concrete example or code snippet"
    },
    {
      "step": 2,
      "description": "What this step does",
      "example": "Concrete example or code snippet"
    }
  ],
  "common_mistakes": [
    "Common mistake 1 and how to avoid it",
    "Common mistake 2 and how to avoid it",
    "Common mistake 3 and how to avoid it"
  ],
  "estimated_minutes": number
}

Make the lesson engaging, practical, and appropriate for ${level} learners. Include concrete examples.
`,

  worksheet: (concept: string, level: string, lessonContext?: string) => `
Create a practice worksheet for the concept: "${concept}" at ${level} level.

${lessonContext ? `Lesson context: ${lessonContext}` : ''}

Generate a worksheet with diverse question types (respond in valid JSON only):

{
  "title": "Worksheet Title",
  "level": "${level}",
  "questions": [
    {
      "id": "q1",
      "type": "fill_in_blank",
      "question": "Question text with ___ blank",
      "correct_answer": "correct answer",
      "points": 5
    },
    {
      "id": "q2",
      "type": "multiple_choice",
      "question": "Multiple choice question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": 0,
      "points": 10
    },
    {
      "id": "q3",
      "type": "true_false",
      "question": "True or False statement",
      "correct_answer": "true",
      "points": 5
    },
    {
      "id": "q4",
      "type": "matching",
      "question": "Match the following:",
      "options": ["Option A", "Option B", "Option C"],
      "correct_answer": ["match1", "match2", "match3"],
      "points": 10
    },
    {
      "id": "q3",
      "type": "scenario",
      "question": "Scenario-based question that requires application",
      "correct_answer": "Expected answer or key points",
      "points": 15
    },
    {
      "id": "q4",
      "type": "short_answer",
      "question": "Short answer question",
      "correct_answer": "Key points that should be included",
      "points": 10
    },
    {
      "id": "q5",
      "type": "applied_challenge",
      "question": "Practical challenge that requires problem-solving",
      "correct_answer": "Solution approach or key steps",
      "points": 20
    }
  ],
  "answer_key": {
    "q1": "correct answer",
    "q2": ["match1", "match2", "match3"],
    "q3": "Expected answer or key points",
    "q4": "Key points that should be included",
    "q5": "Solution approach or key steps"
  }
}

CRITICAL REQUIREMENTS:
- You MUST generate exactly 7-8 questions. Do not generate fewer than 7 questions.
- Every question MUST have ALL required fields:
  * fill_in_blank: id, type, question (with ___ for blank), correct_answer, points
  * matching: id, type, question, options (array of items to match), correct_answer (array of matches), points
  * multiple_choice: id, type, question, options (array of 4 options), correct_answer (index 0-3), points
  * true_false: id, type, question, correct_answer ("true" or "false"), points
  * short_answer: id, type, question, correct_answer, points
  * scenario: id, type, question, correct_answer, points
  * applied_challenge: id, type, question, correct_answer, points
- For matching questions, the options array and correct_answer array MUST have the same length.
- For multiple_choice questions, you MUST provide exactly 4 options.
- Every question MUST have a complete, meaningful question text - never leave it empty or partial.
- Ensure every question has a unique id (q1, q2, q3, etc.) and that the answer_key includes an entry for every question id.
`,

  quiz: (concepts: string[], level: string, type: 'quiz' | 'exam' = 'quiz') => `
Create a ${type} covering these concepts: ${concepts.join(', ')} at ${level} level.

Generate a ${type} with diverse question types (respond in valid JSON only):

{
  "title": "${type === 'exam' ? 'Exam' : 'Quiz'} Title",
  "level": "${level}",
  "type": "${type}",
  "questions": [
    {
      "id": "q1",
      "type": "multiple_choice",
      "question": "Multiple choice question",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": 0,
      "explanation": "Why this answer is correct",
      "points": 10
    },
    {
      "id": "q2",
      "type": "true_false",
      "question": "True or False statement",
      "correct_answer": "true",
      "explanation": "Explanation of the correct answer",
      "points": 5
    },
    {
      "id": "q3",
      "type": "short_response",
      "question": "Short response question requiring explanation",
      "correct_answer": "Key points that should be included",
      "explanation": "What a good answer should include",
      "points": 15
    },
    {
      "id": "q4",
      "type": "scenario",
      "question": "Scenario-based question requiring analysis",
      "correct_answer": "Expected analysis or solution",
      "explanation": "How to approach this scenario",
      "points": 20
    }
  ],
  "answer_key": {
    "q1": 0,
    "q2": "true",
    "q3": "Key points that should be included",
    "q4": "Expected analysis or solution"
  },
  "passing_score": ${type === 'exam' ? 70 : 60},
  "time_limit_minutes": ${type === 'exam' ? 60 : 30}
}

CRITICAL REQUIREMENTS:
- You MUST generate at least 8-10 questions for ${type === 'exam' ? 'exam' : 'quiz'}. Do not generate fewer than 8 questions.
- Every question MUST have ALL required fields: id, type, question, correct_answer, explanation, points
- For multiple_choice questions: MUST include options array with exactly 4 options, correct_answer must be an index (0-3)
- For true_false questions: correct_answer must be exactly "true" or "false" (lowercase string)
- Every question must have a unique id (q1, q2, q3, q4, q5, q6, q7, q8, etc.)
- The answer_key MUST include an entry for EVERY question id in the questions array
- Ensure questions test understanding, not just memorization
- Always respond with valid JSON only, no markdown code blocks, no additional text
`,

  capstone: (topic: string, level: string, concepts: string[]) => `
Create a capstone project for "${topic}" at ${level} level covering: ${concepts.join(', ')}.

Generate a comprehensive project (respond in valid JSON only):

{
  "title": "Project Title",
  "level": "${level}",
  "description": "Brief description of what the project accomplishes",
  "instructions": "Detailed step-by-step instructions (markdown format, 3-5 paragraphs)",
  "requirements": [
    "Requirement 1 - specific and measurable",
    "Requirement 2 - specific and measurable",
    "Requirement 3 - specific and measurable"
  ],
  "evaluation_rubric": [
    {
      "criterion": "Criterion 1",
      "excellent": "What excellent work looks like",
      "good": "What good work looks like",
      "satisfactory": "What satisfactory work looks like",
      "needs_improvement": "What needs improvement looks like",
      "points": 25
    },
    {
      "criterion": "Criterion 2",
      "excellent": "What excellent work looks like",
      "good": "What good work looks like",
      "satisfactory": "What satisfactory work looks like",
      "needs_improvement": "What needs improvement looks like",
      "points": 25
    }
  ],
  "extension_challenges": [
    "Optional advanced challenge 1",
    "Optional advanced challenge 2"
  ],
  "estimated_hours": number
}

Make the project meaningful, portfolio-worthy, and appropriate for ${level} level. Include 4-6 requirements and 3-5 rubric criteria.
`,
}






