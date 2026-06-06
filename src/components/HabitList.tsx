'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { CheckCircle, Circle, Trash2, Pencil, ChevronDown, ChevronUp } from 'lucide-react'
import EditHabitModal from './EditHabitModal'

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
  habits: Habit[]
  checkedIds: Set<string>
  checkinNotes: Record<string, string>
  today: string
  userId: string
}

export default function HabitList({ habits, checkedIds, checkinNotes, today, userId }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [localChecked, setLocalChecked] = useState<Set<string>>(new Set(checkedIds))
  const [notes, setNotes] = useState<Record<string, string>>(checkinNotes)
  const [expandedNote, setExpandedNote] = useState<string | null>(null)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)

  const supabase = createClient()

  async function toggle(habitId: string) {
    const isChecked = localChecked.has(habitId)
    const next = new Set(localChecked)

    if (isChecked) {
      next.delete(habitId)
      setLocalChecked(next)
      setExpandedNote(null)
      await supabase.from('checkins').delete().match({ habit_id: habitId, checked_date: today })
    } else {
      next.add(habitId)
      setLocalChecked(next)
      setExpandedNote(habitId)
      await supabase.from('checkins').insert({
        habit_id: habitId,
        user_id: userId,
        checked_date: today,
        note: notes[habitId] ?? null,
      })
    }

    startTransition(() => router.refresh())
  }

  async function saveNote(habitId: string) {
    await supabase
      .from('checkins')
      .update({ note: notes[habitId] || null })
      .match({ habit_id: habitId, checked_date: today })
    setExpandedNote(null)
  }

  async function deleteHabit(habitId: string) {
    if (!confirm('Excluir este hábito?')) return
    await supabase.from('habits').delete().eq('id', habitId)
    startTransition(() => router.refresh())
  }

  if (habits.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-lg font-medium mb-1">Nenhum hábito ainda</p>
        <p className="text-sm">Clique em &quot;Novo hábito&quot; para começar.</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {habits.map((habit) => {
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
                {/* Checkbox */}
                <button
                  onClick={() => toggle(habit.id)}
                  disabled={pending}
                  className="flex-shrink-0 transition-transform hover:scale-110"
                >
                  {checked ? (
                    <CheckCircle className="w-7 h-7 text-indigo-600" />
                  ) : (
                    <Circle className="w-7 h-7 text-gray-300" />
                  )}
                </button>

                {/* Ícone */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ backgroundColor: habit.color + '20' }}
                >
                  {habit.icon}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`font-semibold text-gray-900 ${checked ? 'line-through text-gray-400' : ''}`}>
                      {habit.name}
                    </p>
                    {habit.frequency === 'weekly' && (
                      <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium">
                        {habit.target_days}x/sem
                      </span>
                    )}
                  </div>
                  {habit.description && (
                    <p className="text-sm text-gray-400 truncate">{habit.description}</p>
                  )}
                  {checked && notes[habit.id] && !noteOpen && (
                    <p className="text-xs text-indigo-400 italic truncate mt-0.5">
                      &ldquo;{notes[habit.id]}&rdquo;
                    </p>
                  )}
                </div>

                {/* Ações */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {checked && (
                    <button
                      onClick={() => setExpandedNote(noteOpen ? null : habit.id)}
                      className="text-gray-300 hover:text-indigo-400 transition-colors p-1"
                      title="Adicionar nota"
                    >
                      {noteOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  )}
                  <button
                    onClick={() => setEditingHabit(habit)}
                    className="text-gray-300 hover:text-indigo-400 transition-colors p-1"
                    title="Editar"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteHabit(habit.id)}
                    className="text-gray-300 hover:text-red-400 transition-colors p-1"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Nota diária */}
              {checked && noteOpen && (
                <div className="px-4 pb-4 pt-0">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={notes[habit.id] ?? ''}
                      onChange={(e) => setNotes({ ...notes, [habit.id]: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && saveNote(habit.id)}
                      placeholder="Como foi? Ex: Corri 5km hoje..."
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

      {editingHabit && (
        <EditHabitModal habit={editingHabit} onClose={() => setEditingHabit(null)} />
      )}
    </>
  )
}
