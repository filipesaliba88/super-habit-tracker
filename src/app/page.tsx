import Link from 'next/link'
import { CheckCircle, Flame, Bell, BarChart3, ArrowRight, Star } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2 font-bold text-xl text-indigo-600">
          <Flame className="w-6 h-6" />
          HabitFlow
        </div>
        <div className="flex gap-4">
          <Link href="/login" className="text-gray-600 hover:text-gray-900 px-4 py-2 text-sm font-medium">
            Entrar
          </Link>
          <Link href="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
            Começar agora
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
          <Star className="w-4 h-4" />
          Mais de 500 pessoas já transformaram sua rotina
        </div>
        <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
          Construa hábitos que<br />
          <span className="text-indigo-600">duram para sempre</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
          O HabitFlow te ajuda a criar disciplina através do acompanhamento diário de hábitos,
          streaks motivadores e lembretes inteligentes.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
          >
            Quero começar agora
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 border border-gray-200 text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Já tenho conta
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Tudo que você precisa para mudar sua vida
          </h2>
          <p className="text-center text-gray-500 mb-16">Simples, poderoso e feito para durar.</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <CheckCircle className="w-8 h-8 text-indigo-600" />,
                title: 'Check-in diário',
                desc: 'Marque seus hábitos com um clique e veja seu progresso em tempo real.',
              },
              {
                icon: <Flame className="w-8 h-8 text-orange-500" />,
                title: 'Streaks motivadores',
                desc: 'Mantenha sequências de dias consecutivos para se manter motivado.',
              },
              {
                icon: <Bell className="w-8 h-8 text-blue-500" />,
                title: 'Lembretes por e-mail',
                desc: 'Receba lembretes diários no horário que você escolher.',
              },
              {
                icon: <BarChart3 className="w-8 h-8 text-green-500" />,
                title: 'Progresso visual',
                desc: 'Veja gráficos e histórico completo do seu desempenho.',
              },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="mb-4">{f.icon}</div>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-indigo-600">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Pronto para transformar seus hábitos?
          </h2>
          <p className="text-indigo-200 text-lg mb-10">
            Acesso vitalício. Sem mensalidade. Pague uma vez e use para sempre.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-white text-indigo-600 px-8 py-4 rounded-xl text-lg font-bold hover:bg-indigo-50 transition-colors shadow-lg"
          >
            Garantir meu acesso
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-400 text-sm border-t border-gray-100">
        © {new Date().getFullYear()} HabitFlow. Todos os direitos reservados.
      </footer>
    </div>
  )
}
