'use client'

import React from 'react'
import type { CapstoneProject } from '@/types'

interface CapstoneViewerProps {
  capstone: CapstoneProject & {
    requirements?: string[] | string
    evaluation_rubric?: any[] | string
    extension_challenges?: string[] | string | null
  }
}

export default function CapstoneViewer({ capstone }: CapstoneViewerProps) {
  // Parse requirements if it's a string
  const requirements = Array.isArray(capstone.requirements)
    ? capstone.requirements
    : typeof capstone.requirements === 'string'
      ? JSON.parse(capstone.requirements || '[]')
      : []

  // Parse evaluation rubric if it's a string
  const rubric = Array.isArray(capstone.evaluation_rubric)
    ? capstone.evaluation_rubric
    : typeof capstone.evaluation_rubric === 'string'
      ? JSON.parse(capstone.evaluation_rubric || '[]')
      : []

  // Parse extension challenges if it's a string
  const extensionChallenges = Array.isArray(capstone.extension_challenges)
    ? capstone.extension_challenges
    : typeof capstone.extension_challenges === 'string'
      ? JSON.parse(capstone.extension_challenges || '[]')
      : capstone.extension_challenges || []

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">{capstone.title}</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Level: {capstone.level} • {capstone.estimated_hours ? `Estimated: ${capstone.estimated_hours} hours` : 'Project'}
            </p>
          </div>
        </div>

        {capstone.description && (
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="text-xl font-semibold mb-3">Project Overview</h2>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {capstone.description}
            </p>
          </div>
        )}
      </div>

      {capstone.instructions && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-900/20">
          <h2 className="text-xl font-semibold mb-3 text-blue-900 dark:text-blue-100">
            Instructions
          </h2>
          <div className="text-blue-800 dark:text-blue-200 whitespace-pre-wrap">
            {capstone.instructions}
          </div>
        </div>
      )}

      {requirements.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="text-xl font-semibold mb-4">Requirements</h2>
          <ul className="space-y-2">
            {requirements.map((requirement: string, index: number) => (
              <li key={index} className="flex items-start space-x-3">
                <span className="mt-1 flex-shrink-0 h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center dark:bg-blue-900">
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-300">
                    {index + 1}
                  </span>
                </span>
                <span className="text-gray-700 dark:text-gray-300 flex-1">
                  {requirement}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {rubric.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="text-xl font-semibold mb-4">Evaluation Rubric</h2>
          <div className="space-y-4">
            {rubric.map((criterion: any, index: number) => (
              <div key={index} className="border-l-4 border-purple-500 pl-4">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {criterion.criterion || `Criterion ${index + 1}`}
                </h3>
                <div className="space-y-2 text-sm">
                  {criterion.excellent && (
                    <div>
                      <span className="font-medium text-green-700 dark:text-green-400">
                        Excellent:
                      </span>
                      <span className="ml-2 text-gray-700 dark:text-gray-300">
                        {criterion.excellent}
                      </span>
                    </div>
                  )}
                  {criterion.good && (
                    <div>
                      <span className="font-medium text-blue-700 dark:text-blue-400">
                        Good:
                      </span>
                      <span className="ml-2 text-gray-700 dark:text-gray-300">
                        {criterion.good}
                      </span>
                    </div>
                  )}
                  {criterion.needs_improvement && (
                    <div>
                      <span className="font-medium text-yellow-700 dark:text-yellow-400">
                        Needs Improvement:
                      </span>
                      <span className="ml-2 text-gray-700 dark:text-gray-300">
                        {criterion.needs_improvement}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {extensionChallenges.length > 0 && (
        <div className="rounded-lg border border-purple-200 bg-purple-50 p-6 dark:border-purple-800 dark:bg-purple-900/20">
          <h2 className="text-xl font-semibold mb-4 text-purple-900 dark:text-purple-100">
            Extension Challenges
          </h2>
          <p className="text-sm text-purple-800 dark:text-purple-200 mb-3">
            Ready for more? Try these advanced challenges:
          </p>
          <ul className="space-y-2">
            {extensionChallenges.map((challenge: string, index: number) => (
              <li key={index} className="flex items-start space-x-3">
                <span className="mt-1 flex-shrink-0 h-5 w-5 rounded-full bg-purple-200 flex items-center justify-center dark:bg-purple-800">
                  <svg
                    className="h-3 w-3 text-purple-600 dark:text-purple-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </span>
                <span className="text-purple-800 dark:text-purple-200 flex-1">
                  {challenge}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
