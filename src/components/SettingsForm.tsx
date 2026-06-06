'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Profile {
  full_name: string | null
  reminder_time: string | null
  reminder_enabled: boolean
  has_access: boolean
}

interface Props {
  profile: Profile | null
  userId: string
}

export default function SettingsForm({ profile, userId }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [name, setName] = useState(profile?.full_name ?? '')
  const [reminderTime, setReminderTime] = useState(profile?.reminder_time ?? '08:00')
  const [reminderEnabled, setReminderEnabled] = useState(profile?.reminder_enabled ?? true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    await supabase
      .from('profiles')
      .update({ full_name: name, reminder_time: reminderTime, reminder_enabled: reminderEnabled })
      .eq('id', userId)

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
    router.refresh()
  }

  return (
    <div className="space-y-6">

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <h2 className="font-semibold text-gray-900">Perfil</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome completo</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="pt-2 border-t border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Lembretes por e-mail</h3>

          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-700">Ativar lembretes</p>
              <p className="text-xs text-gray-400">Receba um e-mail diário para não esquecer seus hábitos</p>
            </div>
            <button
              type="button"
              onClick={() => setReminderEnabled(!reminderEnabled)}
              className={`relative w-10 h-6 rounded-full transition-colors ${
                reminderEnabled ? 'bg-indigo-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  reminderEnabled ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {reminderEnabled && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Horário do lembrete</label>
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60"
        >
          {saving ? 'Salvando...' : saved ? '✅ Salvo!' : 'Salvar alterações'}
        </button>
      </form>
    </div>
  )
}
