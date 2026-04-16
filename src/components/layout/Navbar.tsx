'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/mapa', label: 'Explorador', description: 'Mapa territorial' },
  { href: '/cobertura', label: 'Cobertura', description: 'Nivel de datos' },
  { href: '/comparar', label: 'Comparar', description: 'Cruzar indicadores' },
  { href: '/datos', label: 'Datos', description: 'Catálogo de fuentes' },
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <header className="h-14 border-b border-zinc-200 bg-white flex items-center px-4 shrink-0">
      <Link href="/" className="flex items-center gap-2 mr-8">
        <div className="w-7 h-7 rounded bg-zinc-900 flex items-center justify-center text-white text-xs font-bold">
          CL
        </div>
        <span className="font-semibold text-sm text-zinc-900 hidden sm:block">
          Gran Mapa de Datos
        </span>
      </Link>
      <nav className="flex items-center gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                isActive
                  ? 'bg-zinc-900 text-white'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
    </header>
  )
}
