'use client'

import { useState, useTransition, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { CheckCircle, Circle, Trash2, Pencil, ChevronDown, ChevronUp } from 'lucide-react'
import EditHabitModal from './EditHabitModal'
import Toast, { ToastData } from './Toast'

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

const STREAK_MILESTONES = [3, 7, 14, 21, 30, 60, 90]

function getStartOfWeek(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return d.toISOString().split('T')[0]
}

export default function HabitList({ habits, checkedIds, checkinNotes, today, userId }: Props) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [localChecked, setLocalChecked] = useState<Set<string>>(new Set(checkedIds))
  const [notes, setNotes] = useState<Record<string, string>>(checkinNotes)
  const [expandedNote, setExpandedNote] = useState<string | null>(null)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [toasts, setToasts] = useState<ToastData[]>([])

  const supabase = createClient()

  const addToast = useCallback((toast: Omit<ToastData, 'id'>) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { ...toast, id }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  async function calculateStreak(habitId: string): Promise<number> {
    const { data } = await supabase
      .from('checkins')
      .select('checked_date')
      .eq('habit_id', habitId)
      .eq('user_id', userId)
      .order('checked_date', { ascending: false })
      .limit(120)

    if (!data?.length) return 1

    let streak = 1
    const sorted = data.map((c) => c.checked_date).sort().reverse()

    for (let i = 0; i < sorted.length - 1; i++) {
      const curr = new Date(sorted[i] + 'T12:00:00')
      const prev = new Date(sorted[i + 1] + 'T12:00:00')
      const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
      if (diff === 1) streak++
      else break
    }

    return streak
  }

  async function getWeeklyCount(habitId: string): Promise<number> {
    const weekStart = getStartOfWeek(today)
    const { count } = await supabase
      .from('checkins')
      .select('id', { count: 'exact' })
      .eq('habit_id', habitId)
      .eq('user_id', userId)
      .gte('checked_date', weekStart)
      .lte('checked_date', today)
    return count ?? 0
  }

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

      const habit = habits.find((h) => h.id === habitId)!

      // Verifica streak
      const streak = await calculateStreak(habitId)
      if (STREAK_MILESTONES.includes(streak)) {
        addToast({
          type: 'streak',
          emoji: '🔥',
          message: `${streak} dias seguidos de "${habit.name}"! Continue assim!`,
        })
      }

      // Verifica meta semanal
      if (habit.frequency === 'weekly') {
        const weeklyCount = await getWeeklyCount(habitId)
        if (weeklyCount === habit.target_days) {
          addToast({
            type: 'weekly',
            emoji: '🏆',
            message: `Meta semanal de "${habit.name}" atingida! ${habit.target_days}x essa semana!`,
          })
        }
      }

      // Verifica se completou todos os hábitos do dia
      const allDone = habits.every((h) => h.id === habitId || next.has(h.id))
      if (allDone && habits.length > 0) {
        setTimeout(() => {
          addToast({
            type: 'complete',
            emoji: '🎉',
            message: `Incrível! Você completou todos os ${habits.length} hábitos de hoje!`,
          })
        }, 600)
      }
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
      <Toast toasts={toasts} onRemove={removeToast} />

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

                <div className="flex items-center gap-1 flex-shrink-0">
                  {checked && (
                    <button
                      onClick={() => setExpandedNote(noteOpen ? null : habit.id)}
                      className="text-gray-300 hover:text-indigo-400 transition-colors p-1"
                    >
                      {noteOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  )}
                  <button
                    onClick={() => setEditingHabit(habit)}
                    className="text-gray-300 hover:text-indigo-400 transition-colors p-1"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteHabit(habit.id)}
                    className="text-gray-300 hover:text-red-400 transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {checked && noteOpen && (
                <div className="px-4 pb-4">
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
