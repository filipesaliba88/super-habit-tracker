'use client'

import { useEffect, useState } from 'react'

export interface ToastData {
  id: string
  message: string
  emoji: string
  type: 'streak' | 'complete' | 'weekly'
}

interface Props {
  toasts: ToastData[]
  onRemove: (id: string) => void
}

export default function Toast({ toasts, onRemove }: Props) {
  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 pointer-events-none">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onRemove }: { toast: ToastData; onRemove: (id: string) => void }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(() => onRemove(toast.id), 300)
    }, 4000)
    return () => clearTimeout(timer)
  }, [toast.id, onRemove])

  const bg = {
    streak: 'bg-orange-500',
    complete: 'bg-indigo-600',
    weekly: 'bg-green-500',
  }[toast.type]

  return (
    <div
      className={`pointer-events-auto flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl text-white transition-all duration-300 ${bg} ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      }`}
    >
      <span className="text-2xl">{toast.emoji}</span>
      <p className="font-semibold text-sm leading-snug max-w-xs">{toast.message}</p>
    </div>
  )
}
