import { DOMAINS, type DomainId } from '@/types/data'

const DATASETS = [
  {
    domain: 'vivienda' as DomainId,
    name: 'Nuevos Hogares por Comuna',
    source: 'Deficit Cero / INE',
    years: '2002-2023',
    granularity: 'Comunal (346)',
    indicators: ['Crecimiento natural', 'Migración neta', 'Total nuevos hogares'],
    format: 'JSON',
  },
  {
    domain: 'vivienda' as DomainId,
    name: 'Viviendas Autorizadas',
    source: 'Deficit Cero / INE',
    years: '2002-2023',
    granularity: 'Comunal (346)',
    indicators: ['Viviendas cada mil hab.', 'Total viviendas'],
    format: 'JSON',
  },
  {
    domain: 'vivienda' as DomainId,
    name: 'Nuevos Predios Urbanos',
    source: 'Deficit Cero / SII',
    years: '2002-2023',
    granularity: 'Comunal (346)',
    indicators: ['Nuevos predios cada mil', 'Total predios'],
    format: 'JSON',
  },
  {
    domain: 'educacion' as DomainId,
    name: 'Puntajes PAES/PDT por Escuela',
    source: 'Colegios SIP / MINEDUC',
    years: '2021-2025',
    granularity: 'Escuela (RBD)',
    indicators: ['CLEC (lectura)', 'MATE1 (matemáticas)'],
    format: 'GeoJSON',
  },
  {
    domain: 'educacion' as DomainId,
    name: 'Trayectorias Post-Egreso',
    source: 'Colegios SIP / MINEDUC',
    years: '2011-2021',
    granularity: 'Escuela (RBD) / Cohorte',
    indicators: ['Universidad', 'IP', 'CFT', 'No estudia', 'Titulados'],
    format: 'JSON',
  },
  {
    domain: 'ninez' as DomainId,
    name: 'Pobreza Infantil',
    source: 'Observatorio Colunga / CASEN',
    years: '2006-2022',
    granularity: 'Comunal (346)',
    indicators: ['Pobreza por ingresos', 'Pobreza multidimensional'],
    format: 'JSON',
  },
  {
    domain: 'ninez' as DomainId,
    name: 'Educación y Exclusión Escolar',
    source: 'Observatorio Colunga / MINEDUC',
    years: '2010-2023',
    granularity: 'Comunal (346)',
    indicators: ['Deserción escolar', 'Exclusión escolar', 'NEET', 'Matrícula'],
    format: 'JSON',
  },
  {
    domain: 'ninez' as DomainId,
    name: 'Nutrición y Salud Infantil',
    source: 'Observatorio Colunga / JUNAEB / DEIS',
    years: '2010-2023',
    granularity: 'Comunal (346)',
    indicators: ['Malnutrición', 'Bajo peso', 'Prematurez', 'Mortalidad infantil'],
    format: 'JSON',
  },
  {
    domain: 'medioambiente' as DomainId,
    name: 'Proyectos SEIA',
    source: 'SOFOFA / SEA',
    years: '2000-2025',
    granularity: 'Proyecto (lat/lon)',
    indicators: ['Inversión (MM USD)', 'Empleo', 'Estado', 'Sector'],
    format: 'GeoJSON',
  },
  {
    domain: 'salud' as DomainId,
    name: 'Red Hospitalaria SNSS',
    source: 'ACHS Observatorio / DEIS',
    years: '2010-2025',
    granularity: 'Establecimiento (lat/lon)',
    indicators: ['Camas', 'Ocupación', 'Rotación', 'Gasto'],
    format: 'GeoJSON',
  },
  {
    domain: 'salud' as DomainId,
    name: 'Listas de Espera',
    source: 'ACHS Observatorio / FONASA',
    years: '2022-2025',
    granularity: 'Establecimiento',
    indicators: ['Cirugía', 'Especialidad', 'Diagnóstico'],
    format: 'JSON',
  },
]

export default function DatosPage() {
  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">
            Catálogo de Datos
          </h1>
          <p className="text-sm text-zinc-500">
            {DATASETS.length} datasets de {Object.keys(DOMAINS).length} dominios,
            cubriendo indicadores territoriales de Chile.
          </p>
        </div>

        {/* Domain tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-zinc-900 text-white">
            Todos
          </span>
          {(Object.keys(DOMAINS) as DomainId[]).map((id) => {
            const d = DOMAINS[id]
            return (
              <span
                key={id}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-600 hover:bg-zinc-200 cursor-pointer transition-colors"
              >
                {d.icon} {d.shortName}
              </span>
            )
          })}
        </div>

        {/* Dataset cards */}
        <div className="space-y-3">
          {DATASETS.map((ds, i) => {
            const domain = DOMAINS[ds.domain]
            return (
              <div
                key={i}
                className="bg-white rounded-xl border border-zinc-200 p-5 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: domain.color }}
                      />
                      <span className="text-xs font-medium text-zinc-500">
                        {domain.shortName}
                      </span>
                    </div>
                    <h3 className="font-semibold text-zinc-900">{ds.name}</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">{ds.source}</p>
                  </div>
                  <span className="text-xs font-mono bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded">
                    {ds.format}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-zinc-400">
                      Periodo
                    </div>
                    <div className="text-sm font-medium text-zinc-700">{ds.years}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-zinc-400">
                      Granularidad
                    </div>
                    <div className="text-sm font-medium text-zinc-700">
                      {ds.granularity}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-zinc-400">
                      Indicadores
                    </div>
                    <div className="text-sm font-medium text-zinc-700">
                      {ds.indicators.length}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {ds.indicators.map((ind) => (
                    <span
                      key={ind}
                      className="text-xs px-2 py-0.5 rounded bg-zinc-50 text-zinc-600 border border-zinc-100"
                    >
                      {ind}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
