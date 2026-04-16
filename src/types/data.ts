export type DomainId = 'vivienda' | 'educacion' | 'ninez' | 'medioambiente' | 'salud'

export interface Domain {
  id: DomainId
  name: string
  shortName: string
  color: string
  icon: string
  source: string
  description: string
}

export const DOMAINS: Record<DomainId, Domain> = {
  vivienda: {
    id: 'vivienda',
    name: 'Vivienda y Urbanismo',
    shortName: 'Vivienda',
    color: '#3B82F6',
    icon: '🏠',
    source: 'Deficit Cero',
    description: 'Nuevos hogares, predios, viviendas autorizadas y tasas de crecimiento urbano',
  },
  educacion: {
    id: 'educacion',
    name: 'Educación',
    shortName: 'Educación',
    color: '#8B5CF6',
    icon: '🎓',
    source: 'Colegios SIP / MINEDUC',
    description: 'Puntajes PAES, trayectorias post-egreso, cobertura escolar',
  },
  ninez: {
    id: 'ninez',
    name: 'Niñez e Infancia',
    shortName: 'Niñez',
    color: '#F59E0B',
    icon: '👶',
    source: 'Observatorio Colunga',
    description: 'Pobreza infantil, deserción escolar, nutrición, violencia, salud mental',
  },
  medioambiente: {
    id: 'medioambiente',
    name: 'Medio Ambiente e Inversión',
    shortName: 'M. Ambiente',
    color: '#10B981',
    icon: '🌿',
    source: 'SOFOFA / SEIA',
    description: 'Proyectos de evaluación ambiental, inversión, empleo por sector',
  },
  salud: {
    id: 'salud',
    name: 'Salud Pública',
    shortName: 'Salud',
    color: '#EF4444',
    icon: '🏥',
    source: 'ACHS / MINSAL / DEIS',
    description: 'Establecimientos de salud, camas, ocupación, listas de espera, gasto',
  },
}

export interface Indicator {
  id: string
  domain: DomainId
  name: string
  unit: string
  description: string
  years: number[]
}

export interface ComunaData {
  comunaKey: string
  comuna: string
  region: string
  indicators: Record<string, IndicatorValue[]>
  coverage: ComunaCoverage
}

export interface IndicatorValue {
  year: number
  value: number | null
}

export interface ComunaCoverage {
  totalDomains: number
  totalIndicators: number
  domains: DomainId[]
  completeness: number // 0-1
}

export interface PointFeature {
  type: 'school' | 'hospital' | 'project'
  domain: DomainId
  lat: number
  lon: number
  name: string
  comuna: string
  region: string
  properties: Record<string, unknown>
}

export interface MapViewState {
  longitude: number
  latitude: number
  zoom: number
  pitch?: number
  bearing?: number
}

export const CHILE_CENTER: MapViewState = {
  longitude: -70.6693,
  latitude: -33.4489,
  zoom: 5.5,
  pitch: 0,
  bearing: 0,
}

export const REGIONS = [
  'Arica y Parinacota',
  'Tarapacá',
  'Antofagasta',
  'Atacama',
  'Coquimbo',
  'Valparaíso',
  'Metropolitana',
  'O\'Higgins',
  'Maule',
  'Ñuble',
  'Biobío',
  'Araucanía',
  'Los Ríos',
  'Los Lagos',
  'Aysén',
  'Magallanes',
] as const
