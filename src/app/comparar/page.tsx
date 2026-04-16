'use client'

import { useEffect, useState } from 'react'
import { useMapStore } from '@/store/map-store'
import { loadComunasUnified } from '@/lib/data-loader'
import { DOMAINS, type DomainId } from '@/types/data'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts'

export default function CompararPage() {
  const { comunasData, setComunasData } = useMapStore()
  const [selected, setSelected] = useState<string[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadComunasUnified()
      .then(setComunasData)
      .catch(console.error)
  }, [setComunasData])

  const comunasList = Object.entries(comunasData)
    .map(([key, data]) => ({ key, name: data.comuna, region: data.region }))
    .sort((a, b) => a.name.localeCompare(b.name))

  const filtered = search
    ? comunasList.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.region.toLowerCase().includes(search.toLowerCase())
      )
    : comunasList

  const toggleComuna = (key: string) => {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : prev.length < 4 ? [...prev, key] : prev
    )
  }

  // Radar data: coverage by domain for selected comunas
  const radarData = (Object.keys(DOMAINS) as DomainId[]).map((domainId) => {
    const point: Record<string, unknown> = { domain: DOMAINS[domainId].shortName }
    selected.forEach((key) => {
      const comuna = comunasData[key]
      const domainIndicators = Object.entries(comuna?.indicators || {}).filter(
        ([k]) => k.startsWith(domainId + '.')
      )
      const withData = domainIndicators.filter(([, vals]) =>
        vals.some((v) => v.value !== null)
      ).length
      point[comuna?.comuna || key] = withData
    })
    return point
  })

  // Bar data: total indicators per domain per selected comuna
  const barData = selected.map((key) => {
    const comuna = comunasData[key]
    const entry: Record<string, unknown> = { name: comuna?.comuna || key }
    ;(Object.keys(DOMAINS) as DomainId[]).forEach((domainId) => {
      const count = Object.entries(comuna?.indicators || {}).filter(
        ([k, vals]) => k.startsWith(domainId + '.') && vals.some((v) => v.value !== null)
      ).length
      entry[DOMAINS[domainId].shortName] = count
    })
    return entry
  })

  const COLORS = ['#3B82F6', '#8B5CF6', '#F59E0B', '#10B981', '#EF4444']

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Selector sidebar */}
      <div className="w-72 bg-white border-r border-zinc-200 flex flex-col shrink-0">
        <div className="p-4 border-b border-zinc-100">
          <h2 className="font-semibold text-zinc-900 mb-1">Comparar Comunas</h2>
          <p className="text-xs text-zinc-500 mb-3">
            Selecciona hasta 4 comunas para cruzar indicadores.
          </p>
          <input
            type="text"
            placeholder="Buscar comuna..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
          />
        </div>

        {/* Selected chips */}
        {selected.length > 0 && (
          <div className="px-4 py-2 border-b border-zinc-100 flex flex-wrap gap-1.5">
            {selected.map((key, i) => (
              <button
                key={key}
                onClick={() => toggleComuna(key)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              >
                {comunasData[key]?.comuna || key}
                <span className="opacity-70">x</span>
              </button>
            ))}
          </div>
        )}

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {filtered.slice(0, 100).map((c) => {
            const isSelected = selected.includes(c.key)
            return (
              <button
                key={c.key}
                onClick={() => toggleComuna(c.key)}
                className={`w-full text-left px-4 py-2 text-sm border-b border-zinc-50 transition-colors ${
                  isSelected
                    ? 'bg-zinc-900 text-white'
                    : 'hover:bg-zinc-50 text-zinc-700'
                }`}
              >
                <div className="font-medium">{c.name}</div>
                <div className={`text-xs ${isSelected ? 'text-zinc-300' : 'text-zinc-400'}`}>
                  {c.region}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Charts area */}
      <div className="flex-1 overflow-auto p-6">
        {selected.length === 0 ? (
          <div className="flex items-center justify-center h-full text-zinc-400 text-sm">
            Selecciona comunas a la izquierda para comparar
          </div>
        ) : (
          <div className="space-y-8">
            {/* Radar chart */}
            <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6">
              <h3 className="font-semibold text-zinc-900 mb-4">
                Cobertura por dominio
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="domain" tick={{ fontSize: 12 }} />
                  <PolarRadiusAxis />
                  {selected.map((key, i) => (
                    <Radar
                      key={key}
                      name={comunasData[key]?.comuna || key}
                      dataKey={comunasData[key]?.comuna || key}
                      stroke={COLORS[i % COLORS.length]}
                      fill={COLORS[i % COLORS.length]}
                      fillOpacity={0.15}
                    />
                  ))}
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Bar chart */}
            <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6">
              <h3 className="font-semibold text-zinc-900 mb-4">
                Indicadores disponibles por dominio
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  {(Object.keys(DOMAINS) as DomainId[]).map((domainId) => (
                    <Bar
                      key={domainId}
                      dataKey={DOMAINS[domainId].shortName}
                      fill={DOMAINS[domainId].color}
                      radius={[2, 2, 0, 0]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
