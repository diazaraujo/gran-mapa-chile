'use client'

import { useMapStore } from '@/store/map-store'
import { DOMAINS, type DomainId } from '@/types/data'

export default function DomainFilter() {
  const { activeDomains, toggleDomain } = useMapStore()

  return (
    <div className="flex flex-col gap-1.5 p-3 bg-white rounded-lg shadow-md">
      <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">
        Dominios
      </span>
      {(Object.keys(DOMAINS) as DomainId[]).map((domainId) => {
        const domain = DOMAINS[domainId]
        const isActive = activeDomains.includes(domainId)
        return (
          <button
            key={domainId}
            onClick={() => toggleDomain(domainId)}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded text-xs font-medium transition-all ${
              isActive
                ? 'text-white shadow-sm'
                : 'text-zinc-400 bg-zinc-50 hover:bg-zinc-100'
            }`}
            style={isActive ? { backgroundColor: domain.color } : undefined}
          >
            <span className="text-sm">{domain.icon}</span>
            {domain.shortName}
          </button>
        )
      })}
    </div>
  )
}
