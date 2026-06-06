import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-webhook-secret') ?? req.nextUrl.searchParams.get('token')

  if (secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()

  // Hotmart payload: body.data.buyer.email + body.data.purchase.transaction
  // Kiwify payload:  body.Customer.email + body.order_id
  const email =
    body?.data?.buyer?.email ??
    body?.Customer?.email ??
    body?.email

  const transactionId =
    body?.data?.purchase?.transaction ??
    body?.order_id ??
    body?.transaction_id

  // Only process approved payments
  const status =
    body?.event?.toLowerCase() ??
    body?.webhook_event_type?.toLowerCase() ??
    ''

  const isApproved =
    status.includes('approved') ||
    status.includes('complete') ||
    status.includes('purchase_approved') ||
    status.includes('order_approved')

  if (!email || !isApproved) {
    return NextResponse.json({ ok: true, skipped: true })
  }

  const supabase = createAdminClient()

  // Try to find existing user
  const { data: users } = await supabase.auth.admin.listUsers()
  const existing = users?.users.find((u) => u.email === email)

  if (existing) {
    await supabase
      .from('profiles')
      .update({
        has_access: true,
        access_granted_at: new Date().toISOString(),
        hotmart_transaction_id: transactionId,
      })
      .eq('id', existing.id)
  } else {
    // Create account with temporary password — user resets via email
    const tempPassword = Math.random().toString(36).slice(-12)
    const { data: newUser, error } = await supabase.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
    })

    if (newUser?.user) {
      await supabase.from('profiles').update({
        has_access: true,
        access_granted_at: new Date().toISOString(),
        hotmart_transaction_id: transactionId,
      }).eq('id', newUser.user.id)

      // Send password reset so user sets their own password
      await supabase.auth.admin.generateLink({
        type: 'recovery',
        email,
        options: { redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard` },
      })
    } else {
      console.error('Error creating user:', error)
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
    }
  }

  return NextResponse.json({ ok: true })
}
