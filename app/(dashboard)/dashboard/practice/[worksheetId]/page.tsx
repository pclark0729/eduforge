'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import WorksheetInterface from '@/components/worksheet/WorksheetInterface'

export default function WorksheetPage() {
  const params = useParams()
  const router = useRouter()
  const [worksheet, setWorksheet] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWorksheet()
  }, [])

  const fetchWorksheet = async () => {
    try {
      const response = await fetch(`/api/worksheets/${params.worksheetId}`)
      if (response.ok) {
        const data = await response.json()
        setWorksheet(data.worksheet)
      }
    } catch (error) {
      console.error('Error fetching worksheet:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (answers: Record<string, any>, score: number) => {
    try {
      await fetch('/api/progress/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content_type: 'worksheet',
          worksheet_id: params.worksheetId,
          status: 'completed',
          completion_percentage: 100,
          score,
          time_spent_minutes: 15,
        }),
      })
    } catch (error) {
      console.error('Error updating progress:', error)
    }
  }

  if (loading) {
    return <div>Loading worksheet...</div>
  }

  if (!worksheet) {
    return <div>Worksheet not found</div>
  }

  return <WorksheetInterface worksheet={worksheet} onSubmit={handleSubmit} />
}



