import { createClient } from '@/lib/supabase/server'
import { subDays, format, eachDayOfInterval, parseISO, isValid } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Suspense } from 'react'
import PeriodSelector from '@/components/PeriodSelector'

const VALID_PERIODS = [7, 30, 90]

export default async function ProgressPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; from?: string; to?: string }>
}) {
  const params = await searchParams
  const today = new Date()

  let startDate: Date
  let endDate: Date
  let period = 30
  let isCustom = false

  if (params.from && params.to) {
    const parsedFrom = parseISO(params.from)
    const parsedTo = parseISO(params.to)
    if (isValid(parsedFrom) && isValid(parsedTo) && parsedFrom <= parsedTo && parsedTo <= today) {
      startDate = parsedFrom
      endDate = parsedTo
      isCustom = true
    } else {
      startDate = subDays(today, 29)
      endDate = today
    }
  } else {
    period = VALID_PERIODS.includes(Number(params.period)) ? Number(params.period) : 30
    startDate = subDays(today, period - 1)
    endDate = today
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: habits } = await supabase
    .from('habits')
    .select('id, name, icon, color')
    .eq('user_id', user!.id)
    .eq('is_active', true)

  const { data: checkins } = await supabase
    .from('checkins')
    .select('habit_id, checked_date')
    .eq('user_id', user!.id)
    .gte('checked_date', format(startDate, 'yyyy-MM-dd'))
    .lte('checked_date', format(endDate, 'yyyy-MM-dd'))

  const days = eachDayOfInterval({ start: startDate, end: endDate })
  const checkinSet = new Set(checkins?.map((c) => `${c.habit_id}:${c.checked_date}`) ?? [])
  const totalDays = days.length

  function getStreak(habitId: string): number {
    let streak = 0
    for (let i = 0; i < days.length; i++) {
      const d = format(subDays(today, i), 'yyyy-MM-dd')
      if (checkinSet.has(`${habitId}:${d}`)) streak++
      else break
    }
    return streak
  }

  const startStr = format(startDate, 'yyyy-MM-dd')
  const endStr = format(endDate, 'yyyy-MM-dd')

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Progresso</h1>
          <p className="text-gray-500 text-sm">
            {format(startDate, "d 'de' MMM", { locale: ptBR })} →{' '}
            {format(endDate, "d 'de' MMM", { locale: ptBR })}
            {isCustom && (
              <span className="ml-2 text-indigo-500 font-medium">({totalDays} dias)</span>
            )}
          </p>
        </div>
        <Suspense>
          <PeriodSelector current={period} startDate={startStr} endDate={endStr} />
        </Suspense>
      </div>

      {(habits ?? []).length === 0 ? (
        <p className="text-gray-400 text-center py-16">Nenhum hábito para mostrar ainda.</p>
      ) : (
        <div className="space-y-6">
          {(habits ?? []).map((habit) => {
            const streak = getStreak(habit.id)
            const total = days.filter((d) =>
              checkinSet.has(`${habit.id}:${format(d, 'yyyy-MM-dd')}`)
            ).length
            const pct = Math.round((total / totalDays) * 100)

            return (
              <div key={habit.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                      style={{ backgroundColor: habit.color + '20' }}
                    >
                      {habit.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{habit.name}</p>
                      <p className="text-xs text-gray-400">
                        {total}/{totalDays} dias • {pct}% de conclusão
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold" style={{ color: habit.color }}>
                      🔥 {streak}
                    </p>
                    <p className="text-xs text-gray-400">dias seguidos</p>
                  </div>
                </div>

                {/* Heatmap */}
                <div className="flex gap-1 flex-wrap">
                  {days.map((day) => {
                    const dateStr = format(day, 'yyyy-MM-dd')
                    const done = checkinSet.has(`${habit.id}:${dateStr}`)
                    const label = format(day, "d 'de' MMMM", { locale: ptBR })
                    return (
                      <div
                        key={dateStr}
                        title={`${label} — ${done ? 'Feito ✅' : 'Não feito'}`}
                        className="w-6 h-6 rounded-md cursor-default"
                        style={{
                          backgroundColor: done ? habit.color : '#f3f4f6',
                          opacity: done ? 1 : 0.6,
                        }}
                      />
                    )
                  })}
                </div>

                {/* Barra de progresso */}
                <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, backgroundColor: habit.color }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
