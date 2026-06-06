'use client'

import { useRouter } from 'next/navigation'

interface Props {
  selected: string
  today: string
}

export default function DiaryDatePicker({ selected, today }: Props) {
  const router = useRouter()

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    if (val) router.push(`/diary?date=${val}`)
  }

  return (
    <input
      type="date"
      value={selected}
      max={today}
      onChange={handleChange}
      className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm"
    />
  )
}
