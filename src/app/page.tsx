import Link from 'next/link'
import { DOMAINS, type DomainId } from '@/types/data'

const CARDS = [
  {
    href: '/mapa',
    title: 'Explorador Territorial',
    desc: 'Navega el mapa de Chile y descubre todos los indicadores disponibles por comuna.',
    gradient: 'from-blue-600 to-cyan-500',
  },
  {
    href: '/cobertura',
    title: 'Indice de Cobertura',
    desc: 'Visualiza qué nivel de datos existe en cada territorio y dónde están los gaps.',
    gradient: 'from-rose-600 to-orange-500',
  },
  {
    href: '/comparar',
    title: 'Dashboard Comparativo',
    desc: 'Cruza indicadores de vivienda, educación, niñez, medio ambiente y salud entre comunas.',
    gradient: 'from-violet-600 to-purple-500',
  },
  {
    href: '/datos',
    title: 'Portal de Datos',
    desc: 'Catálogo completo de fuentes con preview y descarga de datasets.',
    gradient: 'from-emerald-600 to-teal-500',
  },
]

export default function Home() {
  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-zinc-900 mb-3">
            Gran Mapa de Datos de Chile
          </h1>
          <p className="text-lg text-zinc-500 max-w-2xl">
            Plataforma territorial que unifica datos de vivienda, educación,
            niñez, medio ambiente y salud pública a nivel comunal.
          </p>
        </div>

        {/* Domain chips */}
        <div className="flex flex-wrap gap-2 mb-10">
          {(Object.keys(DOMAINS) as DomainId[]).map((id) => {
            const d = DOMAINS[id]
            return (
              <span
                key={id}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-white"
                style={{ backgroundColor: d.color }}
              >
                {d.icon} {d.shortName}
              </span>
            )
          })}
        </div>

        {/* Action cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CARDS.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group relative overflow-hidden rounded-2xl p-6 text-white transition-transform hover:scale-[1.02]"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${card.gradient}`}
              />
              <div className="relative">
                <h2 className="text-xl font-semibold mb-2">{card.title}</h2>
                <p className="text-sm text-white/80">{card.desc}</p>
                <span className="inline-block mt-4 text-sm font-medium text-white/90 group-hover:translate-x-1 transition-transform">
                  Explorar &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Stats preview */}
        <div className="mt-12 grid grid-cols-3 md:grid-cols-5 gap-4">
          {(Object.keys(DOMAINS) as DomainId[]).map((id) => {
            const d = DOMAINS[id]
            return (
              <div key={id} className="text-center">
                <div className="text-2xl mb-1">{d.icon}</div>
                <div className="text-xs text-zinc-500">{d.source}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
