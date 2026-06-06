import { createClient } from '@/lib/supabase/server'
import SettingsForm from '@/components/SettingsForm'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Configurações</h1>
      <p className="text-gray-500 text-sm mb-8">Gerencie suas preferências</p>
      <SettingsForm profile={profile} userId={user!.id} />
    </div>
  )
}
