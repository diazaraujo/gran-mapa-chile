'use client'

import { useMapStore } from '@/store/map-store'
import { DOMAINS, type DomainId } from '@/types/data'
import Link from 'next/link'

export default function ComunaPanel() {
  const { selectedComuna, setSelectedComuna, comunasData } = useMapStore()

  if (!selectedComuna) return null

  const comuna = comunasData[selectedComuna]

  return (
    <div className="absolute right-4 top-4 bottom-4 w-80 bg-white rounded-xl shadow-xl overflow-y-auto z-10">
      <div className="sticky top-0 bg-white border-b border-zinc-100 p-4 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-zinc-900">
            {comuna?.comuna || selectedComuna}
          </h2>
          <p className="text-xs text-zinc-500">{comuna?.region || ''}</p>
        </div>
        <button
          onClick={() => setSelectedComuna(null)}
          className="w-7 h-7 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-500"
        >
          x
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Coverage summary */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-zinc-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-zinc-900">
              {comuna?.coverage?.totalDomains || 0}
            </div>
            <div className="text-xs text-zinc-500">Dominios</div>
          </div>
          <div className="bg-zinc-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-zinc-900">
              {comuna?.coverage?.totalIndicators || 0}
            </div>
            <div className="text-xs text-zinc-500">Indicadores</div>
          </div>
        </div>

        {/* Domain breakdown */}
        {(Object.keys(DOMAINS) as DomainId[]).map((domainId) => {
          const domain = DOMAINS[domainId]
          const domainIndicators = Object.entries(comuna?.indicators || {}).filter(
            ([key]) => key.startsWith(domainId + '.')
          )
          const hasData = domainIndicators.some(([, vals]) =>
            vals.some((v) => v.value !== null)
          )

          return (
            <div
              key={domainId}
              className={`rounded-lg border p-3 ${
                hasData ? 'border-zinc-200' : 'border-zinc-100 opacity-50'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: domain.color }}
                />
                <span className="text-sm font-medium text-zinc-700">
                  {domain.shortName}
                </span>
                <span className="text-xs text-zinc-400 ml-auto">
                  {hasData ? `${domainIndicators.length} ind.` : 'Sin datos'}
                </span>
              </div>
              {hasData && (
                <div className="space-y-1">
                  {domainIndicators.slice(0, 4).map(([key, values]) => {
                    const latest = values.filter((v) => v.value !== null).pop()
                    return (
                      <div
                        key={key}
                        className="flex justify-between text-xs"
                      >
                        <span className="text-zinc-500 truncate mr-2">
                          {key.split('.').pop()?.replace(/_/g, ' ')}
                        </span>
                        <span className="font-medium text-zinc-700 shrink-0">
                          {latest?.value?.toLocaleString('es-CL') ?? '-'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}

        <Link
          href={`/comuna/${selectedComuna}`}
          className="block w-full text-center text-sm font-medium text-white bg-zinc-900 rounded-lg py-2.5 hover:bg-zinc-800 transition-colors"
        >
          Ver perfil completo
        </Link>
      </div>
    </div>
  )
}
