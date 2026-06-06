import { createClient } from '@/lib/supabase/server'
import { format, parseISO, isValid } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Suspense } from 'react'
import DiaryDatePicker from '@/components/DiaryDatePicker'
import DiaryHabitList from '@/components/DiaryHabitList'

export default async function DiaryPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
}) {
  const params = await searchParams

  // Usa fuso horário do Brasil (UTC-3)
  const nowBR = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }))
  const today = format(nowBR, 'yyyy-MM-dd')

  const parsed = params.date ? parseISO(params.date) : null
  const selectedDate = parsed && isValid(parsed) ? params.date! : today
  const isToday = selectedDate === today

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: habits } = await supabase
    .from('habits')
    .select('id, name, icon, color')
    .eq('user_id', user!.id)
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  const { data: checkins } = await supabase
    .from('checkins')
    .select('habit_id, note')
    .eq('user_id', user!.id)
    .eq('checked_date', selectedDate)

  const checkedIds = new Set(checkins?.map((c) => c.habit_id) ?? [])
  const checkinNotes: Record<string, string> = {}
  checkins?.forEach((c) => { if (c.note) checkinNotes[c.habit_id] = c.note })

  const dateLabel = format(parseISO(selectedDate), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Diário</h1>
          <p className="text-gray-500 text-sm capitalize">{dateLabel}</p>
        </div>
        <Suspense>
          <DiaryDatePicker selected={selectedDate} today={today} />
        </Suspense>
      </div>

      {(habits ?? []).length === 0 ? (
        <p className="text-center text-gray-400 py-16">Nenhum hábito cadastrado ainda.</p>
      ) : (
        <DiaryHabitList
          key={selectedDate}
          habits={habits ?? []}
          checkedIds={checkedIds}
          checkinNotes={checkinNotes}
          date={selectedDate}
          userId={user!.id}
          isToday={isToday}
        />
      )}
    </div>
  )
}
