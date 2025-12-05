import { requireAuth } from '@/lib/auth/require-auth'
import { createServerComponentClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireAuth()
  const supabase = await createServerComponentClient()

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const handleSignOut = async () => {
    'use server'
    const supabase = await createServerComponentClient()
    await supabase.auth.signOut()
    redirect('/signin')
  }

  return (
    <div className="min-h-screen">
      {/* Terminal Header */}
      <nav className="terminal-border border-b-2">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-6">
              <Link href="/dashboard" className="text-terminal-green font-bold text-lg">
                <span className="text-terminal-prompt">$</span> EduForge
              </Link>
              <div className="hidden md:flex space-x-1">
                <Link
                  href="/dashboard"
                  className="px-3 py-2 text-sm terminal-link border-none hover:text-terminal-green"
                >
                  [dashboard]
                </Link>
                <Link
                  href="/dashboard/learn"
                  className="px-3 py-2 text-sm terminal-link border-none hover:text-terminal-green"
                >
                  [learn]
                </Link>
                <Link
                  href="/dashboard/settings"
                  className="px-3 py-2 text-sm terminal-link border-none hover:text-terminal-green"
                >
                  [settings]
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-terminal-text">
                <span className="text-terminal-blue">@</span>
                {(profile as any)?.full_name || user.email?.split('@')[0]}
              </span>
              <form action={handleSignOut}>
                <button
                  type="submit"
                  className="terminal-button text-terminal-red border-terminal-red hover:bg-terminal-red hover:text-terminal-bg"
                >
                  [exit]
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
















