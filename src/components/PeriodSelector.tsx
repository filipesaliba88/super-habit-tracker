'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

const QUICK = [
  { label: '7 dias', value: 7 },
  { label: '30 dias', value: 30 },
  { label: '90 dias', value: 90 },
]

export default function PeriodSelector({
  current,
  startDate,
  endDate,
}: {
  current: number
  startDate: string
  endDate: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [from, setFrom] = useState(startDate)
  const [to, setTo] = useState(endDate)

  function selectQuick(days: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('period', String(days))
    params.delete('from')
    params.delete('to')
    router.push(`/progress?${params.toString()}`)
  }

  function applyCustom() {
    if (!from || !to || from > to) return
    const params = new URLSearchParams(searchParams.toString())
    params.set('from', from)
    params.set('to', to)
    params.delete('period')
    router.push(`/progress?${params.toString()}`)
  }

  const isCustom = !!searchParams.get('from')

  return (
    <div className="flex flex-col items-end gap-3">
      {/* Botões rápidos */}
      <div className="flex gap-2">
        {QUICK.map((opt) => (
          <button
            key={opt.value}
            onClick={() => selectQuick(opt.value)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              !isCustom && current === opt.value
                ? 'bg-indigo-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Seletor de intervalo */}
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={from}
          max={to}
          onChange={(e) => setFrom(e.target.value)}
          className={`border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            isCustom ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200'
          }`}
        />
        <span className="text-gray-400 text-sm">até</span>
        <input
          type="date"
          value={to}
          min={from}
          onChange={(e) => setTo(e.target.value)}
          className={`border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            isCustom ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200'
          }`}
        />
        <button
          onClick={applyCustom}
          disabled={!from || !to || from > to}
          className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-40"
        >
          Filtrar
        </button>
      </div>
    </div>
  )
}
