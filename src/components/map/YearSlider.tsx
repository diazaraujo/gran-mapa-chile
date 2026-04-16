'use client'

import { useMapStore } from '@/store/map-store'

export default function YearSlider() {
  const { selectedYear, setSelectedYear } = useMapStore()

  return (
    <div className="bg-white rounded-lg shadow-md p-3 w-52">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          Año
        </span>
        <span className="text-sm font-bold text-zinc-900">{selectedYear}</span>
      </div>
      <input
        type="range"
        min={2010}
        max={2025}
        value={selectedYear}
        onChange={(e) => setSelectedYear(Number(e.target.value))}
        className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-900"
      />
      <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
        <span>2010</span>
        <span>2025</span>
      </div>
    </div>
  )
}
