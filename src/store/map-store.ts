import { create } from 'zustand'
import type { DomainId, MapViewState, ComunaData } from '@/types/data'
import { CHILE_CENTER } from '@/types/data'

interface MapStore {
  viewState: MapViewState
  setViewState: (vs: MapViewState) => void

  activeDomains: DomainId[]
  toggleDomain: (domain: DomainId) => void
  setActiveDomains: (domains: DomainId[]) => void

  selectedComuna: string | null
  setSelectedComuna: (comunaKey: string | null) => void

  selectedIndicator: string | null
  setSelectedIndicator: (id: string | null) => void

  hoveredComuna: string | null
  setHoveredComuna: (comunaKey: string | null) => void

  selectedYear: number
  setSelectedYear: (year: number) => void

  comunasData: Record<string, ComunaData>
  setComunasData: (data: Record<string, ComunaData>) => void

  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export const useMapStore = create<MapStore>((set) => ({
  viewState: CHILE_CENTER,
  setViewState: (viewState) => set({ viewState }),

  activeDomains: ['vivienda', 'educacion', 'ninez', 'medioambiente', 'salud'],
  toggleDomain: (domain) =>
    set((state) => ({
      activeDomains: state.activeDomains.includes(domain)
        ? state.activeDomains.filter((d) => d !== domain)
        : [...state.activeDomains, domain],
    })),
  setActiveDomains: (domains) => set({ activeDomains: domains }),

  selectedComuna: null,
  setSelectedComuna: (comunaKey) => set({ selectedComuna: comunaKey }),

  selectedIndicator: null,
  setSelectedIndicator: (id) => set({ selectedIndicator: id }),

  hoveredComuna: null,
  setHoveredComuna: (comunaKey) => set({ hoveredComuna: comunaKey }),

  selectedYear: 2023,
  setSelectedYear: (year) => set({ selectedYear: year }),

  comunasData: {},
  setComunasData: (data) => set({ comunasData: data }),

  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}))
