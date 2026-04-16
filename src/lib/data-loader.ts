import type { ComunaData, ComunaCoverage, DomainId } from '@/types/data'

const DATA_BASE = '/data'

export async function loadComunasUnified(): Promise<Record<string, ComunaData>> {
  const res = await fetch(`${DATA_BASE}/comunas_unified.json`)
  if (!res.ok) throw new Error('Failed to load comunas data')
  return res.json()
}

export async function loadTopoJSON(filename: string): Promise<unknown> {
  const res = await fetch(`/geo/${filename}`)
  if (!res.ok) throw new Error(`Failed to load ${filename}`)
  return res.json()
}

export async function loadPointsGeoJSON(domain: DomainId): Promise<GeoJSON.FeatureCollection> {
  const res = await fetch(`${DATA_BASE}/points_${domain}.geojson`)
  if (!res.ok) throw new Error(`Failed to load points for ${domain}`)
  return res.json()
}

export function computeCoverage(comunaData: ComunaData): ComunaCoverage {
  const domainSet = new Set<DomainId>()
  let totalIndicators = 0

  for (const [indicatorId, values] of Object.entries(comunaData.indicators)) {
    const hasData = values.some((v) => v.value !== null)
    if (hasData) {
      totalIndicators++
      const domain = indicatorId.split('.')[0] as DomainId
      domainSet.add(domain)
    }
  }

  return {
    totalDomains: domainSet.size,
    totalIndicators,
    domains: Array.from(domainSet),
    completeness: domainSet.size / 5,
  }
}
