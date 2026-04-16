'use client'

import { useEffect } from 'react'
import ChileMap from '@/components/map/ChileMap'
import DomainFilter from '@/components/map/DomainFilter'
import ComunaPanel from '@/components/map/ComunaPanel'
import YearSlider from '@/components/map/YearSlider'
import { useMapStore } from '@/store/map-store'
import { loadComunasUnified } from '@/lib/data-loader'

export default function MapaPage() {
  const { setComunasData } = useMapStore()

  useEffect(() => {
    loadComunasUnified()
      .then(setComunasData)
      .catch(console.error)
  }, [setComunasData])

  return (
    <div className="flex-1 relative">
      <ChileMap mode="explorer" />

      {/* Controls overlay */}
      <div className="absolute left-4 top-4 z-10 flex flex-col gap-3">
        <DomainFilter />
        <YearSlider />
      </div>

      {/* Selected comuna panel */}
      <ComunaPanel />

      {/* Legend */}
      <div className="absolute left-4 bottom-4 z-10 bg-white rounded-lg shadow-md p-3">
        <div className="text-xs font-semibold text-zinc-500 mb-2">Cobertura de datos</div>
        <div className="flex items-center gap-1">
          {[
            { color: '#dcdcdc', label: '0' },
            { color: '#FEEBE2', label: '1' },
            { color: '#FBB4AE', label: '2' },
            { color: '#DE8787', label: '3' },
            { color: '#BC5050', label: '4' },
            { color: '#882121', label: '5' },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center">
              <div
                className="w-6 h-4 rounded-sm"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[10px] text-zinc-400 mt-0.5">
                {item.label}
              </span>
            </div>
          ))}
        </div>
        <div className="text-[10px] text-zinc-400 mt-1">Dominios con datos</div>
      </div>
    </div>
  )
}
