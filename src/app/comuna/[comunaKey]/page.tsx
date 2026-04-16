'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { DOMAINS, type DomainId, type ComunaData } from '@/types/data'
import { loadComunasUnified } from '@/lib/data-loader'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export default function ComunaPage() {
  const params = useParams()
  const comunaKey = params.comunaKey as string
  const [comuna, setComuna] = useState<ComunaData | null>(null)

  useEffect(() => {
    loadComunasUnified()
      .then((data) => setComuna(data[comunaKey] || null))
      .catch(console.error)
  }, [comunaKey])

  if (!comuna) {
    return (
      <div className="flex-1 flex items-center justify-center text-zinc-400">
        Cargando comuna...
      </div>
    )
  }

  const indicatorsByDomain = (Object.keys(DOMAINS) as DomainId[]).map((domainId) => {
    const domain = DOMAINS[domainId]
    const indicators = Object.entries(comuna.indicators)
      .filter(([key]) => key.startsWith(domainId + '.'))
      .map(([key, values]) => ({
        id: key,
        name: key.split('.').pop()?.replace(/_/g, ' ') || key,
        values: values.filter((v) => v.value !== null),
      }))
      .filter((ind) => ind.values.length > 0)
    return { domainId, domain, indicators }
  })

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/mapa"
            className="text-xs text-zinc-400 hover:text-zinc-600 mb-2 inline-block"
          >
            &larr; Volver al mapa
          </Link>
          <h1 className="text-3xl font-bold text-zinc-900">{comuna.comuna}</h1>
          <p className="text-zinc-500">{comuna.region}</p>
        </div>

        {/* Coverage summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          {(Object.keys(DOMAINS) as DomainId[]).map((domainId) => {
            const domain = DOMAINS[domainId]
            const hasData = comuna.coverage?.domains?.includes(domainId)
            return (
              <div
                key={domainId}
                className={`rounded-xl p-4 text-center border ${
                  hasData
                    ? 'border-zinc-200 bg-white'
                    : 'border-zinc-100 bg-zinc-50 opacity-50'
                }`}
              >
                <div className="text-2xl mb-1">{domain.icon}</div>
                <div className="text-xs font-medium text-zinc-700">
                  {domain.shortName}
                </div>
                <div
                  className="text-[10px] mt-0.5"
                  style={{ color: hasData ? domain.color : '#9CA3AF' }}
                >
                  {hasData ? 'Con datos' : 'Sin datos'}
                </div>
              </div>
            )
          })}
        </div>

        {/* Indicators by domain */}
        <div className="space-y-8">
          {indicatorsByDomain
            .filter((d) => d.indicators.length > 0)
            .map(({ domainId, domain, indicators }) => (
              <div key={domainId}>
                <div className="flex items-center gap-2 mb-4">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: domain.color }}
                  />
                  <h2 className="text-lg font-semibold text-zinc-900">
                    {domain.name}
                  </h2>
                  <span className="text-xs text-zinc-400 ml-auto">
                    {domain.source}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {indicators.map((ind) => (
                    <div
                      key={ind.id}
                      className="bg-white rounded-xl border border-zinc-200 p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-zinc-700 capitalize">
                          {ind.name}
                        </h3>
                        <span className="text-lg font-bold text-zinc-900">
                          {ind.values[ind.values.length - 1]?.value?.toLocaleString(
                            'es-CL'
                          )}
                        </span>
                      </div>
                      <ResponsiveContainer width="100%" height={120}>
                        <LineChart data={ind.values}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis
                            dataKey="year"
                            tick={{ fontSize: 10 }}
                            tickLine={false}
                          />
                          <YAxis hide />
                          <Tooltip
                            contentStyle={{ fontSize: 12 }}
                            formatter={(v) => typeof v === 'number' ? v.toLocaleString('es-CL') : v}
                          />
                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke={domain.color}
                            strokeWidth={2}
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
