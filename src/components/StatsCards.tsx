'use client'

import { CheckCircle, Flame, Target } from 'lucide-react'

interface Habit {
  id: string
  name: string
}

interface Props {
  habits: Habit[]
  checkedIds: Set<string>
}

export default function StatsCards({ habits, checkedIds }: Props) {
  const total = habits.length
  const done = habits.filter((h) => checkedIds.has(h.id)).length
  const pct = total === 0 ? 0 : Math.round((done / total) * 100)

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center">
            <Target className="w-5 h-5 text-indigo-600" />
          </div>
          <span className="text-sm text-gray-500 font-medium">Total de hábitos</span>
        </div>
        <p className="text-3xl font-bold text-gray-900">{total}</p>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <span className="text-sm text-gray-500 font-medium">Concluídos hoje</span>
        </div>
        <p className="text-3xl font-bold text-gray-900">{done}/{total}</p>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center">
            <Flame className="w-5 h-5 text-orange-500" />
          </div>
          <span className="text-sm text-gray-500 font-medium">Taxa do dia</span>
        </div>
        <p className="text-3xl font-bold text-gray-900">{pct}%</p>
      </div>
    </div>
  )
}
