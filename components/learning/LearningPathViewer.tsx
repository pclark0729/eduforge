'use client'

import Link from 'next/link'
import type { LearningPath, Milestone } from '@/types'

interface LearningPathViewerProps {
  learningPath: LearningPath
  progress?: {
    totalItems: number
    completed: number
    inProgress: number
    notStarted: number
    averageScore: number
    completionRate: number
  }
  lessons?: any[]
  worksheets?: any[]
  quizzes?: any[]
  capstones?: any[]
}

export default function LearningPathViewer({
  learningPath,
  progress,
  lessons = [],
  worksheets = [],
  quizzes = [],
  capstones = [],
}: LearningPathViewerProps) {
  const milestones = (learningPath.milestones as Milestone[]) || []

  const getMilestoneContent = (level: string) => {
    return {
      lessons: lessons.filter((l) => l.level === level),
      worksheets: worksheets.filter((w) => w.level === level),
      quizzes: quizzes.filter((q) => q.level === level),
      capstones: capstones.filter((c) => c.level === level),
    }
  }

  // Calculate total content
  const totalContent = lessons.length + worksheets.length + quizzes.length + capstones.length
  const hasAnyContent = totalContent > 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{learningPath.title}</h1>
        {learningPath.description && (
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {learningPath.description}
          </p>
        )}
        {hasAnyContent && (
          <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20">
            <p className="text-sm text-green-800 dark:text-green-200">
              ✓ Complete learning experience ready! {lessons.length} lessons, {worksheets.length} worksheets, {quizzes.length} quizzes, and {capstones.length} capstone projects available.
            </p>
          </div>
        )}
      </div>

      {progress && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="text-xl font-semibold mb-4">Progress</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-2xl font-bold">{progress.completed}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{progress.inProgress}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">In Progress</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {Math.round(progress.completionRate * 100)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Completion</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {Math.round(progress.averageScore)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg Score</div>
            </div>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold mb-4">Learning Milestones</h2>
        <div className="space-y-6">
          {milestones.map((milestone, index) => {
            const content = getMilestoneContent(milestone.level)
            const hasContent =
              content.lessons.length > 0 ||
              content.worksheets.length > 0 ||
              content.quizzes.length > 0 ||
              content.capstones.length > 0

            return (
              <div
                key={index}
                className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold capitalize">{milestone.level}</h3>
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {milestone.estimated_time}
                  </span>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Key Concepts</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                      {milestone.concepts.map((concept, i) => (
                        <li key={i}>{concept}</li>
                      ))}
                    </ul>
                  </div>
                  {milestone.prerequisites && milestone.prerequisites.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Prerequisites</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                        {milestone.prerequisites.map((prereq, i) => (
                          <li key={i}>{prereq}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div>
                    <h4 className="font-medium mb-2">Learning Outcomes</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                      {milestone.outcomes.map((outcome, i) => (
                        <li key={i}>{outcome}</li>
                      ))}
                    </ul>
                  </div>

                  {hasContent && (
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <h4 className="font-medium mb-4">Available Content</h4>
                      <div className="space-y-4">
                        {content.lessons.length > 0 && (
                          <div>
                            <h5 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                              📚 Lessons ({content.lessons.length})
                            </h5>
                            <div className="grid gap-3 md:grid-cols-2">
                              {content.lessons.map((lesson) => (
                                <Link
                                  key={lesson.id}
                                  href={`/dashboard/learn/${learningPath.id}/lesson/${lesson.id}`}
                                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 hover:border-blue-500 hover:bg-blue-50 transition-colors dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-400 dark:hover:bg-blue-900/20"
                                >
                                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {lesson.title}
                                  </span>
                                  <span className="text-xs text-gray-500">→</span>
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                        {content.worksheets.length > 0 && (
                          <div>
                            <h5 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                              ✏️ Worksheets ({content.worksheets.length})
                            </h5>
                            <div className="grid gap-3 md:grid-cols-2">
                              {content.worksheets.map((worksheet) => (
                                <Link
                                  key={worksheet.id}
                                  href={`/dashboard/practice/${worksheet.id}`}
                                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 hover:border-blue-500 hover:bg-blue-50 transition-colors dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-400 dark:hover:bg-blue-900/20"
                                >
                                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {worksheet.title}
                                  </span>
                                  <span className="text-xs text-gray-500">→</span>
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                        {content.quizzes.length > 0 && (
                          <div>
                            <h5 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                              📝 Quizzes ({content.quizzes.length})
                            </h5>
                            <div className="grid gap-3 md:grid-cols-2">
                              {content.quizzes.map((quiz) => (
                                <Link
                                  key={quiz.id}
                                  href={`/dashboard/quiz/${quiz.id}`}
                                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 hover:border-blue-500 hover:bg-blue-50 transition-colors dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-400 dark:hover:bg-blue-900/20"
                                >
                                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {quiz.title}
                                  </span>
                                  <span className="text-xs text-gray-500">→</span>
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                        {content.capstones.length > 0 && (
                          <div>
                            <h5 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                              🎯 Capstone Projects ({content.capstones.length})
                            </h5>
                            <div className="grid gap-3">
                              {content.capstones.map((capstone) => (
                                <Link
                                  key={capstone.id}
                                  href={`/dashboard/capstone/${capstone.id}`}
                                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 hover:border-purple-500 hover:bg-purple-50 transition-colors dark:border-gray-700 dark:bg-gray-800 dark:hover:border-purple-400 dark:hover:bg-purple-900/20"
                                >
                                  <div className="flex-1">
                                    <h6 className="font-semibold text-gray-900 dark:text-gray-100">
                                      {capstone.title}
                                    </h6>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                      {capstone.description}
                                    </p>
                                    {capstone.estimated_hours && (
                                      <p className="text-xs text-gray-500 mt-2">
                                        Estimated: {capstone.estimated_hours} hours
                                      </p>
                                    )}
                                  </div>
                                  <span className="text-xs text-gray-500 ml-4">→</span>
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {learningPath.prerequisites && learningPath.prerequisites.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Prerequisites</h2>
          <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
            {learningPath.prerequisites.map((prereq, i) => (
              <li key={i}>{prereq}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}



