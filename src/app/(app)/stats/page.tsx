import { createClient } from '@/lib/supabase/server'
import { format, subDays, startOfWeek, eachDayOfInterval } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Flame, CheckCircle, Star, Target } from 'lucide-react'

const WEEK_DAYS = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D']

export default async function StatsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const nowBR = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }))
  const today = format(nowBR, 'yyyy-MM-dd')
  const thirtyDaysAgo = subDays(nowBR, 29)

  const { data: habits } = await supabase
    .from('habits')
    .select('id, name, icon, color, frequency, target_days')
    .eq('user_id', user!.id)
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  const { data: checkins } = await supabase
    .from('checkins')
    .select('habit_id, checked_date')
    .eq('user_id', user!.id)
    .gte('checked_date', format(thirtyDaysAgo, 'yyyy-MM-dd'))

  const checkinSet = new Set(checkins?.map((c) => `${c.habit_id}:${c.checked_date}`) ?? [])
  const days30 = eachDayOfInterval({ start: thirtyDaysAgo, end: nowBR })
  const totalHabits = habits?.length ?? 0

  // Taxa de conclusão geral (últimos 7 dias)
  const last7 = eachDayOfInterval({ start: subDays(nowBR, 6), end: nowBR })
  let totalExpected7 = 0
  let totalDone7 = 0
  habits?.forEach((habit) => {
    last7.forEach((day) => {
      const d = format(day, 'yyyy-MM-dd')
      totalExpected7++
      if (checkinSet.has(`${habit.id}:${d}`)) totalDone7++
    })
  })
  const completionRate = totalExpected7 === 0 ? 0 : Math.round((totalDone7 / totalExpected7) * 100)

  // Dias perfeitos (últimos 30 dias)
  let perfectDays = 0
  days30.forEach((day) => {
    const d = format(day, 'yyyy-MM-dd')
    const allDone = habits?.every((h) => checkinSet.has(`${h.id}:${d}`))
    if (allDone && totalHabits > 0) perfectDays++
  })

  // Melhor streak geral
  let bestStreak = 0
  habits?.forEach((habit) => {
    let streak = 0
    let max = 0
    days30.forEach((day) => {
      const d = format(day, 'yyyy-MM-dd')
      if (checkinSet.has(`${habit.id}:${d}`)) {
        streak++
        max = Math.max(max, streak)
      } else {
        streak = 0
      }
    })
    bestStreak = Math.max(bestStreak, max)
  })

  // Streak atual (dias seguidos com pelo menos 1 hábito)
  let currentStreak = 0
  for (let i = 0; i < 30; i++) {
    const d = format(subDays(nowBR, i), 'yyyy-MM-dd')
    const anyDone = habits?.some((h) => checkinSet.has(`${h.id}:${d}`))
    if (anyDone) currentStreak++
    else break
  }

  // Grade semanal — semana atual (seg a dom)
  const weekStart = startOfWeek(nowBR, { weekStartsOn: 1 })
  const weekDays = eachDayOfInterval({
    start: weekStart,
    end: subDays(new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000), 1),
  })

  // Circulo SVG
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (completionRate / 100) * circumference

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Estatísticas</h1>
        <p className="text-gray-500 text-sm">Últimos 7 e 30 dias</p>
      </div>

      {/* Taxa circular + cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

        {/* Taxa circular */}
        <div className="bg-indigo-600 rounded-2xl p-6 flex flex-col items-center justify-center text-white">
          <p className="text-sm font-medium text-indigo-200 mb-4">Taxa de conclusão — 7 dias</p>
          <div className="relative w-36 h-36">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
              <circle cx="64" cy="64" r={radius} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="12" />
              <circle
                cx="64" cy="64" r={radius}
                fill="none"
                stroke="white"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                style={{ transition: 'stroke-dashoffset 0.8s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold">{completionRate}%</span>
            </div>
          </div>
          <p className="text-indigo-200 text-sm mt-4">
            {totalDone7} de {totalExpected7} check-ins
          </p>
        </div>

        {/* Cards de resumo */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-2">
            <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center">
              <Flame className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{currentStreak}</p>
            <p className="text-xs text-gray-400">Dias em sequência</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-2">
            <div className="w-9 h-9 bg-yellow-50 rounded-xl flex items-center justify-center">
              <Star className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{perfectDays}</p>
            <p className="text-xs text-gray-400">Dias perfeitos (30d)</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-2">
            <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center">
              <Target className="w-5 h-5 text-indigo-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalHabits}</p>
            <p className="text-xs text-gray-400">Hábitos ativos</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-2">
            <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{bestStreak}</p>
            <p className="text-xs text-gray-400">Melhor sequência (30d)</p>
          </div>
        </div>
      </div>

      {/* Grade semanal */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Atividade desta semana</h2>

        {/* Header dos dias */}
        <div className="grid mb-3" style={{ gridTemplateColumns: '1fr repeat(7, 2.5rem)' }}>
          <div />
          {weekDays.map((day, i) => (
            <div key={i} className="text-center">
              <p className="text-xs font-semibold text-gray-400">{WEEK_DAYS[i]}</p>
              <p className={`text-xs mt-0.5 ${format(day, 'yyyy-MM-dd') === today ? 'text-indigo-600 font-bold' : 'text-gray-300'}`}>
                {format(day, 'd')}
              </p>
            </div>
          ))}
        </div>

        {/* Linhas por hábito */}
        {totalHabits === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">Nenhum hábito cadastrado ainda.</p>
        ) : (
          <div className="space-y-2">
            {habits?.map((habit) => (
              <div key={habit.id} className="grid items-center" style={{ gridTemplateColumns: '1fr repeat(7, 2.5rem)' }}>
                <div className="flex items-center gap-2 pr-3 min-w-0">
                  <span className="text-base">{habit.icon}</span>
                  <span className="text-sm text-gray-600 truncate">{habit.name}</span>
                </div>
                {weekDays.map((day) => {
                  const dateStr = format(day, 'yyyy-MM-dd')
                  const done = checkinSet.has(`${habit.id}:${dateStr}`)
                  const isFuture = dateStr > today
                  return (
                    <div key={dateStr} className="flex items-center justify-center">
                      <div
                        className="w-7 h-7 rounded-lg"
                        style={{
                          backgroundColor: isFuture ? '#f9fafb' : done ? habit.color : '#f3f4f6',
                          opacity: isFuture ? 0.3 : done ? 1 : 0.7,
                        }}
                        title={`${format(day, "d 'de' MMMM", { locale: ptBR })} — ${done ? 'Feito ✅' : isFuture ? 'Futuro' : 'Não feito'}`}
                      />
                    </div>
                  )
                })}
              </div>
            ))}

            {/* Legenda */}
            <div className="flex items-center gap-4 pt-3 border-t border-gray-100 mt-3">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-indigo-500" />
                <span className="text-xs text-gray-400">Concluído</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-gray-200" />
                <span className="text-xs text-gray-400">Não feito</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-gray-100 opacity-40" />
                <span className="text-xs text-gray-400">Futuro</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
