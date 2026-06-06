'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Plus, X } from 'lucide-react'

const COLORS = ['#6366f1', '#f97316', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6']
const ICONS = ['⭐', '💪', '📚', '🏃', '🧘', '💧', '🍎', '😴', '✍️', '🎯', '📵', '🎵']

export default function AddHabitButton() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState(COLORS[0])
  const [icon, setIcon] = useState(ICONS[0])
  const [frequency, setFrequency] = useState('daily')
  const [targetDays, setTargetDays] = useState(3)
  const [pending, startTransition] = useTransition()

  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('habits').insert({
      user_id: user.id,
      name,
      description: description || null,
      color,
      icon,
      frequency,
      target_days: frequency === 'daily' ? 7 : targetDays,
    })

    setOpen(false)
    setName('')
    setDescription('')
    setColor(COLORS[0])
    setIcon(ICONS[0])
    setFrequency('daily')
    setTargetDays(3)
    startTransition(() => router.refresh())
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Novo hábito
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">Novo hábito</h2>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome do hábito</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ex: Ler 30 minutos"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Descrição (opcional)</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ex: Antes de dormir"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Frequência</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFrequency('daily')}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      frequency === 'daily'
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Diário
                  </button>
                  <button
                    type="button"
                    onClick={() => setFrequency('weekly')}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      frequency === 'weekly'
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Semanal
                  </button>
                </div>
                {frequency === 'weekly' && (
                  <div className="mt-3">
                    <label className="block text-sm text-gray-600 mb-2">Quantas vezes por semana?</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5, 6].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setTargetDays(n)}
                          className={`w-9 h-9 rounded-lg text-sm font-semibold border transition-colors ${
                            targetDays === n
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {n}x
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ícone</label>
                <div className="flex gap-2 flex-wrap">
                  {ICONS.map((i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setIcon(i)}
                      className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center border-2 transition-all ${
                        icon === i ? 'border-indigo-500 bg-indigo-50' : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cor</label>
                <div className="flex gap-2">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        color === c ? 'border-gray-700 scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={pending}
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60 mt-2"
              >
                {pending ? 'Salvando...' : 'Criar hábito'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
