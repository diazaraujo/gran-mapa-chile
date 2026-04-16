# Gran Mapa de Datos de Chile — Plan de Trabajo

## Estado actual (2026-04-16)

### Completado
- [x] Proyecto Next.js 16 + TypeScript + Tailwind
- [x] Mapa Mapbox GL con TopoJSON de 343 comunas
- [x] ETL real de 5 fuentes (458 comunas con datos)
- [x] 4 vistas: explorador, cobertura, comparar, catálogo
- [x] Repo: https://github.com/diazaraujo/gran-mapa-chile

### Datos integrados
| Dominio | Comunas | Fuente | Indicadores |
|---|---|---|---|
| Vivienda | 345 (75%) | DeficitCero CDN | crecimiento_natural, migracion_neta |
| Educación | 325 (70%) | SIP GitHub + Colunga CDN | promedio_paes, matricula_total, cantidad_colegios, matricula_basica |
| Niñez | 345 (75%) | Colunga CDN | pobreza_comunal, ivm_vulnerabilidad, ivm_salud, ivm_socioeconomico, indice_bienestar |
| M. Ambiente | 345 (75%) | SOFOFA CDN (gzip) | proyectos_seia, inversion_total_mmusd, empleo_total |
| Salud | 171 (37%) | ACHS CDN (gzip) | camas_hospitalarias, indice_ocupacion, indice_rotacion, promedio_dias_estadia |

### Archivos clave
- `scripts/etl_real_data.py` — ETL principal, descarga de CloudFront + GitHub
- `scripts/generate-demo-data.py` — generador de datos demo (ya no se usa)
- `public/data/comunas_unified.json` — datos unificados (1.1 MB, 458 comunas)
- `public/geo/comunas.topo.json` — TopoJSON comunas (565 KB, 343 comunas)
- `src/components/map/ChileMap.tsx` — mapa Mapbox con choropleth
- `src/store/map-store.ts` — estado global Zustand

---

## Fase 2: Calidad de datos y matching

### 2.1 Mejorar matching de comunas (ALTA PRIORIDAD)
- [ ] El ETL actual para SOFOFA y ACHS usa string matching naive (nombre → canonical_key)
- [ ] Crear tabla de lookup `comuna_name_variants.json` con aliases (ej: "Ñuñoa" = "nunoa", "O'Higgins" = "ohiggins")
- [ ] Usar fuzzy matching (rapidfuzz) como fallback
- [ ] Log comunas que no matchean para revisión manual
- [ ] Meta: subir salud de 37% → 90%+ de cobertura

### 2.2 Agregar más indicadores de Colunga
- [ ] Deserción escolar: `/colunga/viz-colunga/exclusion-escolar/datos/data_desercion_comunal_mapa.json`
- [ ] Alcohol: `/colunga/viz-colunga/consumo-alcohol/datos/data_alcohol_mapa_v6.json`
- [ ] NEET/NEEP: `/colunga/viz-colunga/neet-neep/datos/data_neet_neep_mapa.json`
- [ ] Drogas, tabaco, violencia (buscar URLs en repo ds-colunga)
- [ ] Explorar las ~20 carpetas mapa_* del repo para encontrar todos los endpoints

### 2.3 Agregar más indicadores de DeficitCero
- [ ] Nuevos predios: buscar URL similar a nuevos_hogares_mapa_v3.json
- [ ] Viviendas autorizadas
- [ ] Tasa de crecimiento
- [ ] Superficie total

### 2.4 Educación: datos históricos PAES/PDT
- [ ] El ETL actual agrega un solo punto por comuna (2024)
- [ ] Buscar si hay datos por año en los notebooks de ds-colegiosSIP
- [ ] Agregar trayectorias post-egreso (universidad, IP, CFT, no estudia) si hay datos comunales

---

## Fase 3: UI y experiencia de usuario

### 3.1 Mapa — mejoras visuales
- [ ] Tooltip al hover sobre comuna (nombre + resumen de indicadores)
- [ ] Selector de indicador para el choropleth (no solo cobertura)
- [ ] Animación temporal: play/pause en el slider de años
- [ ] Capa de puntos: escuelas, hospitales, proyectos SEIA sobre el mapa
- [ ] Gran Santiago como vista especial (zoom automático)
- [ ] Leyenda dinámica según el indicador seleccionado

### 3.2 Panel de comuna (sidebar derecho)
- [ ] Sparklines inline para cada indicador
- [ ] Comparación con promedio regional/nacional
- [ ] Badges de alerta (ej: "Alta pobreza", "Sin hospital")
- [ ] Links a fuentes originales

### 3.3 Página de perfil comunal (/comuna/[key])
- [ ] Mejorar layout: grid responsivo de charts
- [ ] Agregar mapa pequeño mostrando ubicación de la comuna
- [ ] Tabla con todos los valores descargable como CSV
- [ ] Comparación con comunas vecinas

### 3.4 Comparador (/comparar)
- [ ] Búsqueda por región (filtro de dropdown)
- [ ] Presets: "Comunas más pobres", "Mayor inversión SEIA"
- [ ] Gráfico de serie temporal comparativa
- [ ] Scatter plot: cruzar 2 indicadores de distintos dominios

### 3.5 Catálogo de datos (/datos)
- [ ] Filtro funcional por dominio (ahora es estático)
- [ ] Preview de datos (tabla con primeras filas)
- [ ] Botón de descarga CSV/JSON por dataset
- [ ] Metadata: última actualización, frecuencia, fuente original

### 3.6 Landing page (/)
- [ ] Counter animado: "458 comunas, 5 dominios, X indicadores"
- [ ] Mini mapa preview de Chile
- [ ] Buscador global de comunas

---

## Fase 4: Infraestructura y deploy

### 4.1 Deploy a Vercel
- [ ] Configurar proyecto en Vercel
- [ ] Variables de entorno (MAPBOX_TOKEN)
- [ ] Optimizar: comprimir comunas_unified.json con gzip
- [ ] Dominio personalizado (opcional)

### 4.2 Rendimiento
- [ ] Lazy loading del mapa (dynamic import)
- [ ] Dividir comunas_unified.json por dominio (cargar on-demand)
- [ ] Service worker para cache de datos geográficos
- [ ] Virtualización en listas largas de comunas

### 4.3 Automatización
- [ ] GitHub Action para correr ETL semanal
- [ ] Auto-commit de comunas_unified.json actualizado
- [ ] Notificación si una fuente deja de responder

---

## Fase 5: Funcionalidades avanzadas

### 5.1 Índice compuesto territorial
- [ ] Crear un "score" por comuna combinando indicadores normalizados
- [ ] Ponderación configurable por el usuario
- [ ] Ranking de comunas

### 5.2 Análisis de correlaciones
- [ ] Scatter plots automáticos entre indicadores de distintos dominios
- [ ] Ej: pobreza infantil vs. inversión SEIA, PAES vs. vulnerabilidad JUNAEB
- [ ] Coeficiente de correlación visible

### 5.3 Exportaciones
- [ ] Exportar vista actual como imagen/PDF
- [ ] API pública REST con los datos unificados
- [ ] Embed de mapas para terceros (iframe)

### 5.4 Capas adicionales de datos
- [ ] DecideChile (datos electorales — ya hay en ds-colunga)
- [ ] Datos censales INE
- [ ] Datos de seguridad (CEAD/SPD)
- [ ] Datos meteorológicos/ambientales
