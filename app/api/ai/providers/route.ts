import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/require-auth'
import { createServerComponentClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const supabase = await createServerComponentClient()

    const { data: providers, error } = await supabase
      .from('ai_providers')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ providers })
  } catch (error: any) {
    console.error('Error getting AI providers:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get AI providers' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const supabase = await createServerComponentClient()
    const body = await request.json()

    const { provider_name, api_key, base_url, model, is_active } = body

    if (!provider_name) {
      return NextResponse.json(
        { error: 'provider_name is required' },
        { status: 400 }
      )
    }

    // If setting as active, deactivate other providers
    if (is_active) {
      await supabase
        .from('ai_providers')
        .update({ is_active: false })
        .eq('user_id', user.id)
    }

    // Check if provider already exists
    const { data: existing } = await supabase
      .from('ai_providers')
      .select('*')
      .eq('user_id', user.id)
      .eq('provider_name', provider_name)
      .single()

    let result
    if (existing) {
      // Update existing
      const { data, error } = await supabase
        .from('ai_providers')
        .update({
          api_key: api_key || existing.api_key,
          base_url: base_url || existing.base_url,
          model: model || existing.model,
          is_active: is_active !== undefined ? is_active : existing.is_active,
        })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) throw error
      result = data
    } else {
      // Create new
      const { data, error } = await supabase
        .from('ai_providers')
        .insert({
          user_id: user.id,
          provider_name,
          api_key: api_key || null,
          base_url: base_url || null,
          model: model || null,
          is_active: is_active !== undefined ? is_active : false,
        })
        .select()
        .single()

      if (error) throw error
      result = data
    }

    return NextResponse.json({ provider: result })
  } catch (error: any) {
    console.error('Error saving AI provider:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to save AI provider' },
      { status: 500 }
    )
  }
}











