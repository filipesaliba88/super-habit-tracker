'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Flame, LayoutDashboard, BarChart3, BookOpen, Settings, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface Profile {
  full_name: string | null
  has_access: boolean
}

interface Props {
  user: User
  profile: Profile | null
}

export default function Sidebar({ user, profile }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const links = [
    { href: '/dashboard', label: 'Hoje', icon: LayoutDashboard },
    { href: '/progress', label: 'Progresso', icon: BarChart3 },
    { href: '/diary', label: 'Diário', icon: BookOpen },
    { href: '/settings', label: 'Configurações', icon: Settings },
  ]

  return (
    <aside className="w-56 bg-white border-r border-gray-100 flex flex-col h-full">
      <div className="p-5 border-b border-gray-100">
        <Link href="/dashboard" className="flex items-center gap-2 text-indigo-600 font-bold text-xl">
          <Flame className="w-6 h-6" />
          HabitFlow
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              pathname === href
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100">
        {!profile?.has_access && (
          <div className="bg-indigo-50 rounded-xl p-3 mb-3 text-xs text-indigo-700">
            <p className="font-semibold mb-1">Conta gratuita</p>
            <p>Ative o acesso completo para desbloquear todas as funcionalidades.</p>
          </div>
        )}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm">
            {(profile?.full_name ?? user.email ?? '?')[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-900 truncate">
              {profile?.full_name ?? 'Usuário'}
            </p>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors w-full"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </div>
    </aside>
  )
}
