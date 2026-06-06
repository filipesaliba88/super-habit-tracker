import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Resend } from 'resend'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export async function GET(req: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  // Protect with a secret token (call this from a cron job)
  const token = req.nextUrl.searchParams.get('token')
  if (token !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const currentHour = format(new Date(), 'HH')

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email, full_name, reminder_time, has_access')
    .eq('reminder_enabled', true)
    .like('reminder_time', `${currentHour}:%`)

  if (!profiles?.length) {
    return NextResponse.json({ sent: 0 })
  }

  const today = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })
  let sent = 0

  for (const profile of profiles) {
    const { data: habits } = await supabase
      .from('habits')
      .select('name, icon')
      .eq('user_id', profile.id)
      .eq('is_active', true)

    if (!habits?.length) continue

    const habitList = habits.map((h) => `${h.icon} ${h.name}`).join('<br/>')

    await resend.emails.send({
      from: 'HabitFlow <noreply@habitflow.app>',
      to: profile.email,
      subject: `🔥 Seus hábitos de hoje — ${today}`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #6366f1;">Olá, ${profile.full_name ?? 'Olá'}! 👋</h2>
          <p>Não esqueça de marcar seus hábitos de hoje:</p>
          <div style="background: #f9fafb; border-radius: 12px; padding: 16px; margin: 16px 0;">
            ${habitList}
          </div>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
             style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: 600;">
            Abrir HabitFlow
          </a>
          <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">
            Para parar de receber lembretes, acesse Configurações no app.
          </p>
        </div>
      `,
    })

    sent++
  }

  return NextResponse.json({ sent })
}
