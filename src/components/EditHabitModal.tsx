'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { X } from 'lucide-react'

const COLORS = ['#6366f1', '#f97316', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6']
const ICONS = ['⭐', '💪', '📚', '🏃', '🧘', '💧', '🍎', '😴', '✍️', '🎯', '📵', '🎵']

interface Habit {
  id: string
  name: string
  description: string | null
  color: string
  icon: string
  frequency: string
  target_days: number
}

interface Props {
  habit: Habit
  onClose: () => void
}

export default function EditHabitModal({ habit, onClose }: Props) {
  const router = useRouter()
  const [name, setName] = useState(habit.name)
  const [description, setDescription] = useState(habit.description ?? '')
  const [color, setColor] = useState(habit.color)
  const [icon, setIcon] = useState(habit.icon)
  const [frequency, setFrequency] = useState(habit.frequency)
  const [targetDays, setTargetDays] = useState(habit.target_days)
  const [pending, startTransition] = useTransition()

  const supabase = createClient()

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    await supabase
      .from('habits')
      .update({ name, description: description || null, color, icon, frequency, target_days: targetDays })
      .eq('id', habit.id)

    onClose()
    startTransition(() => router.refresh())
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">Editar hábito</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Descrição (opcional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Frequência</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setFrequency('daily'); setTargetDays(7) }}
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
                onClick={() => { setFrequency('weekly'); setTargetDays(3) }}
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
            {pending ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </form>
      </div>
    </div>
  )
}
