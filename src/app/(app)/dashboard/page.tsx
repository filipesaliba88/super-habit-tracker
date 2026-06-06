import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import HabitList from '@/components/HabitList'
import AddHabitButton from '@/components/AddHabitButton'
import StatsCards from '@/components/StatsCards'
export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const nowBR = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }))
  const today = format(nowBR, 'yyyy-MM-dd')

  const { data: habits } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', user!.id)
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  const { data: todayCheckins } = await supabase
    .from('checkins')
    .select('habit_id, note')
    .eq('user_id', user!.id)
    .eq('checked_date', today)

  const checkedIds = new Set(todayCheckins?.map((c) => c.habit_id) ?? [])
  const checkinNotes: Record<string, string> = {}
  todayCheckins?.forEach((c) => {
    if (c.note) checkinNotes[c.habit_id] = c.note
  })

  const todayLabel = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hoje</h1>
          <p className="text-gray-500 text-sm capitalize">{todayLabel}</p>
        </div>
        <AddHabitButton />
      </div>

      <StatsCards habits={habits ?? []} checkedIds={checkedIds} />

      <div className="mt-8">
        <HabitList
          habits={habits ?? []}
          checkedIds={checkedIds}
          checkinNotes={checkinNotes}
          today={today}
          userId={user!.id}
        />
      </div>
    </div>
  )
}
