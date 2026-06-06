'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { CheckCircle, Circle, ChevronDown, ChevronUp } from 'lucide-react'

interface Habit {
  id: string
  name: string
  icon: string
  color: string
}

interface Props {
  habits: Habit[]
  checkedIds: Set<string>
  checkinNotes: Record<string, string>
  date: string
  userId: string
  isToday: boolean
}

export default function DiaryHabitList({ habits, checkedIds, checkinNotes, date, userId, isToday }: Props) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [localChecked, setLocalChecked] = useState<Set<string>>(new Set(checkedIds))
  const [notes, setNotes] = useState<Record<string, string>>(checkinNotes)
  const [expandedNote, setExpandedNote] = useState<string | null>(null)

  const supabase = createClient()

  async function toggle(habitId: string) {
    const isChecked = localChecked.has(habitId)
    const next = new Set(localChecked)

    if (isChecked) {
      next.delete(habitId)
      setLocalChecked(next)
      setExpandedNote(null)
      await supabase.from('checkins').delete().match({ habit_id: habitId, checked_date: date })
    } else {
      next.add(habitId)
      setLocalChecked(next)
      setExpandedNote(habitId)
      await supabase.from('checkins').insert({
        habit_id: habitId,
        user_id: userId,
        checked_date: date,
        note: notes[habitId] ?? null,
      })
    }

    startTransition(() => router.refresh())
  }

  async function saveNote(habitId: string) {
    await supabase
      .from('checkins')
      .update({ note: notes[habitId] || null })
      .match({ habit_id: habitId, checked_date: date })
    setExpandedNote(null)
    startTransition(() => router.refresh())
  }

  const done = habits.filter((h) => localChecked.has(h.id))
  const missed = habits.filter((h) => !localChecked.has(h.id))
  const pct = habits.length === 0 ? 0 : Math.round((done.length / habits.length) * 100)

  return (
    <div className="space-y-4">
      {/* Barra de progresso */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-gray-600">Taxa de conclusão</p>
          <p className="text-sm font-bold text-gray-900">{done.length}/{habits.length} hábitos</p>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-indigo-500 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-right text-xs text-gray-400 mt-1">{pct}%</p>
      </div>

      {!isToday && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-sm text-amber-700">
          Você está editando um dia passado. Marque os hábitos que realizou neste dia.
        </div>
      )}

      {/* Lista */}
      <div className="space-y-3">
        {[...done, ...missed].map((habit) => {
          const checked = localChecked.has(habit.id)
          const noteOpen = expandedNote === habit.id

          return (
            <div
              key={habit.id}
              className={`bg-white rounded-2xl border transition-all shadow-sm ${
                checked ? 'border-indigo-200 bg-indigo-50/30' : 'border-gray-100'
              }`}
            >
              <div className="flex items-center gap-4 p-4">
                <button
                  onClick={() => toggle(habit.id)}
                  className="flex-shrink-0 transition-transform hover:scale-110"
                >
                  {checked ? (
                    <CheckCircle className="w-7 h-7 text-indigo-600" />
                  ) : (
                    <Circle className="w-7 h-7 text-gray-300" />
                  )}
                </button>

                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ backgroundColor: habit.color + '20' }}
                >
                  {habit.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-gray-900 ${!checked ? 'text-gray-400' : ''}`}>
                    {habit.name}
                  </p>
                  {checked && notes[habit.id] && !noteOpen && (
                    <p className="text-xs text-indigo-400 italic truncate mt-0.5">
                      &ldquo;{notes[habit.id]}&rdquo;
                    </p>
                  )}
                </div>

                {checked && (
                  <button
                    onClick={() => setExpandedNote(noteOpen ? null : habit.id)}
                    className="text-gray-300 hover:text-indigo-400 transition-colors p-1 flex-shrink-0"
                    title="Adicionar nota"
                  >
                    {noteOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                )}
              </div>

              {checked && noteOpen && (
                <div className="px-4 pb-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={notes[habit.id] ?? ''}
                      onChange={(e) => setNotes({ ...notes, [habit.id]: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && saveNote(habit.id)}
                      placeholder="Como foi? Ex: Corri 5km..."
                      className="flex-1 border border-indigo-200 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                    <button
                      onClick={() => saveNote(habit.id)}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                    >
                      Salvar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
