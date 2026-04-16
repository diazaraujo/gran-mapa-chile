'use client'

import { useEffect } from 'react'
import ChileMap from '@/components/map/ChileMap'
import { useMapStore } from '@/store/map-store'
import { loadComunasUnified } from '@/lib/data-loader'
import { DOMAINS, type DomainId } from '@/types/data'

export default function CoberturaPage() {
  const { setComunasData, comunasData } = useMapStore()

  useEffect(() => {
    loadComunasUnified()
      .then(setComunasData)
      .catch(console.error)
  }, [setComunasData])

  const totalComunas = Object.keys(comunasData).length
  const domainCounts = (Object.keys(DOMAINS) as DomainId[]).map((domainId) => {
    const count = Object.values(comunasData).filter((c) =>
      c.coverage?.domains?.includes(domainId)
    ).length
    return { domainId, count }
  })

  return (
    <div className="flex-1 flex">
      {/* Sidebar stats */}
      <div className="w-72 bg-white border-r border-zinc-200 p-4 overflow-y-auto shrink-0">
        <h2 className="font-semibold text-zinc-900 mb-1">Indice de Cobertura</h2>
        <p className="text-xs text-zinc-500 mb-4">
          Nivel de datos disponible por comuna. Mas oscuro = mas dominios con datos.
        </p>

        <div className="bg-zinc-50 rounded-lg p-3 mb-4">
          <div className="text-3xl font-bold text-zinc-900">{totalComunas}</div>
          <div className="text-xs text-zinc-500">Comunas con datos</div>
        </div>

        <div className="space-y-3">
          {domainCounts.map(({ domainId, count }) => {
            const domain = DOMAINS[domainId]
            const pct = totalComunas > 0 ? Math.round((count / totalComunas) * 100) : 0
            return (
              <div key={domainId}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-zinc-700 flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full inline-block"
                      style={{ backgroundColor: domain.color }}
                    />
                    {domain.shortName}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {count}/{totalComunas} ({pct}%)
                  </span>
                </div>
                <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: domain.color,
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-6 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="text-xs font-medium text-amber-800 mb-1">Gaps de datos</div>
          <p className="text-xs text-amber-700">
            Las comunas en gris no tienen datos en ninguna fuente. Haz click para ver el detalle.
          </p>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <ChileMap mode="coverage" />
      </div>
    </div>
  )
}
