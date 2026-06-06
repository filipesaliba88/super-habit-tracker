import { createClient } from '@/lib/supabase/server'
import { format, parseISO, isValid } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import DiaryDatePicker from '@/components/DiaryDatePicker'
import { CheckCircle, Circle } from 'lucide-react'

export default async function DiaryPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
}) {
  const params = await searchParams
  const today = format(new Date(), 'yyyy-MM-dd')

  const parsed = params.date ? parseISO(params.date) : null
  const selectedDate = parsed && isValid(parsed) ? params.date! : today

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: habits } = await supabase
    .from('habits')
    .select('id, name, icon, color, frequency, target_days')
    .eq('user_id', user!.id)
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  const { data: checkins } = await supabase
    .from('checkins')
    .select('habit_id, note')
    .eq('user_id', user!.id)
    .eq('checked_date', selectedDate)

  const checkinMap: Record<string, string | null> = {}
  checkins?.forEach((c) => { checkinMap[c.habit_id] = c.note ?? null })

  const done = habits?.filter((h) => h.id in checkinMap) ?? []
  const missed = habits?.filter((h) => !(h.id in checkinMap)) ?? []
  const total = habits?.length ?? 0
  const pct = total === 0 ? 0 : Math.round((done.length / total) * 100)

  const dateLabel = format(parseISO(selectedDate), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Diário</h1>
          <p className="text-gray-500 text-sm capitalize">{dateLabel}</p>
        </div>
        <DiaryDatePicker selected={selectedDate} today={today} />
      </div>

      {/* Resumo do dia */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-gray-600">Taxa de conclusão</p>
          <p className="text-sm font-bold text-gray-900">{done.length}/{total} hábitos</p>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-indigo-500 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-right text-xs text-gray-400 mt-1">{pct}%</p>
      </div>

      {total === 0 ? (
        <p className="text-center text-gray-400 py-16">Nenhum hábito cadastrado ainda.</p>
      ) : (
        <div className="space-y-3">
          {/* Concluídos */}
          {done.map((habit) => (
            <div key={habit.id} className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" />
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                  style={{ backgroundColor: habit.color + '20' }}
                >
                  {habit.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{habit.name}</p>
                  {checkinMap[habit.id] ? (
                    <p className="text-sm text-indigo-500 italic mt-0.5">
                      &ldquo;{checkinMap[habit.id]}&rdquo;
                    </p>
                  ) : (
                    <p className="text-sm text-gray-300 mt-0.5">Sem nota</p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Não concluídos */}
          {missed.map((habit) => (
            <div key={habit.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 opacity-50">
              <div className="flex items-center gap-3">
                <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                  style={{ backgroundColor: habit.color + '20' }}
                >
                  {habit.icon}
                </div>
                <p className="font-semibold text-gray-400">{habit.name}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
