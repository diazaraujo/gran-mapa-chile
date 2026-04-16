import type { DomainId } from '@/types/data'

export function getCoverageColor(count: number, max: number): [number, number, number, number] {
  if (count === 0) return [220, 220, 220, 180]
  const ratio = count / max
  if (ratio <= 0.2) return [254, 235, 226, 200]
  if (ratio <= 0.4) return [251, 180, 174, 200]
  if (ratio <= 0.6) return [222, 135, 135, 200]
  if (ratio <= 0.8) return [188, 80, 80, 200]
  return [136, 33, 33, 220]
}

export function getIndicatorColor(value: number, min: number, max: number): [number, number, number, number] {
  if (value === null || value === undefined) return [220, 220, 220, 180]
  const ratio = Math.max(0, Math.min(1, (value - min) / (max - min || 1)))
  const r = Math.round(255 * (1 - ratio) + 33 * ratio)
  const g = Math.round(255 * (1 - ratio) + 102 * ratio)
  const b = Math.round(255 * (1 - ratio) + 172 * ratio)
  return [r, g, b, 200]
}

export const DOMAIN_COLORS: Record<DomainId, string> = {
  vivienda: '#3B82F6',
  educacion: '#8B5CF6',
  ninez: '#F59E0B',
  medioambiente: '#10B981',
  salud: '#EF4444',
}

export const DOMAIN_COLORS_RGB: Record<DomainId, [number, number, number]> = {
  vivienda: [59, 130, 246],
  educacion: [139, 92, 246],
  ninez: [245, 158, 11],
  medioambiente: [16, 185, 129],
  salud: [239, 68, 68],
}
