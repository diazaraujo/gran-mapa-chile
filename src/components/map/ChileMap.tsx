'use client'

import { useCallback, useEffect, useState } from 'react'
import Map, { Source, Layer, type MapMouseEvent } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'
import * as topojson from 'topojson-client'
import { useMapStore } from '@/store/map-store'
import { getCoverageColor, getIndicatorColor } from '@/lib/colors'
import type { DomainId } from '@/types/data'
import { DOMAINS } from '@/types/data'

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

interface ChileMapProps {
  mode: 'explorer' | 'coverage'
}

export default function ChileMap({ mode }: ChileMapProps) {
  const {
    viewState,
    setViewState,
    selectedComuna,
    setSelectedComuna,
    hoveredComuna,
    setHoveredComuna,
    comunasData,
    activeDomains,
    selectedIndicator,
    selectedYear,
  } = useMapStore()

  const [geoData, setGeoData] = useState<GeoJSON.FeatureCollection | null>(null)

  useEffect(() => {
    fetch('/geo/comunas.topo.json')
      .then((r) => r.json())
      .then((topo) => {
        const objectKey = Object.keys(topo.objects)[0]
        const geo = topojson.feature(topo, topo.objects[objectKey]) as unknown as GeoJSON.FeatureCollection
        // Enrich with coverage data
        const enriched: GeoJSON.FeatureCollection = {
          type: 'FeatureCollection',
          features: geo.features.map((f) => {
            const key = f.properties?.comuna_key || f.properties?.canonical_key || ''
            const comunaInfo = comunasData[key]
            return {
              ...f,
              properties: {
                ...f.properties,
                coverage_domains: comunaInfo?.coverage?.totalDomains || 0,
                coverage_indicators: comunaInfo?.coverage?.totalIndicators || 0,
                coverage_completeness: comunaInfo?.coverage?.completeness || 0,
              },
            }
          }),
        }
        setGeoData(enriched)
      })
      .catch(console.error)
  }, [comunasData])

  const onClick = useCallback(
    (e: MapMouseEvent) => {
      const feature = e.features?.[0]
      if (feature?.properties) {
        const key = feature.properties.comuna_key || feature.properties.canonical_key
        setSelectedComuna(key || null)
      }
    },
    [setSelectedComuna]
  )

  const onHover = useCallback(
    (e: MapMouseEvent) => {
      const feature = e.features?.[0]
      if (feature?.properties) {
        const key = feature.properties.comuna_key || feature.properties.canonical_key
        setHoveredComuna(key || null)
      } else {
        setHoveredComuna(null)
      }
    },
    [setHoveredComuna]
  )

  const fillColor: mapboxgl.Expression =
    mode === 'coverage'
      ? [
          'interpolate',
          ['linear'],
          ['get', 'coverage_domains'],
          0, '#dcdcdc',
          1, '#FEEBE2',
          2, '#FBB4AE',
          3, '#DE8787',
          4, '#BC5050',
          5, '#882121',
        ]
      : [
          'interpolate',
          ['linear'],
          ['get', 'coverage_completeness'],
          0, '#f0f0f0',
          0.5, '#93C5FD',
          1, '#2166AC',
        ]

  return (
    <Map
      {...viewState}
      onMove={(e) => setViewState(e.viewState)}
      mapboxAccessToken={MAPBOX_TOKEN}
      style={{ width: '100%', height: '100%' }}
      mapStyle="mapbox://styles/mapbox/light-v11"
      interactiveLayerIds={['comunas-fill']}
      onClick={onClick}
      onMouseMove={onHover}
      cursor={hoveredComuna ? 'pointer' : 'grab'}
    >
      {geoData && (
        <Source id="comunas" type="geojson" data={geoData}>
          <Layer
            id="comunas-fill"
            type="fill"
            paint={{
              'fill-color': fillColor as unknown as string,
              'fill-opacity': [
                'case',
                ['==', ['get', 'comuna_key'], selectedComuna || ''],
                0.9,
                ['==', ['get', 'comuna_key'], hoveredComuna || ''],
                0.7,
                0.6,
              ],
            }}
          />
          <Layer
            id="comunas-border"
            type="line"
            paint={{
              'line-color': [
                'case',
                ['==', ['get', 'comuna_key'], selectedComuna || ''],
                '#000000',
                '#999999',
              ],
              'line-width': [
                'case',
                ['==', ['get', 'comuna_key'], selectedComuna || ''],
                2,
                0.5,
              ],
            }}
          />
        </Source>
      )}
    </Map>
  )
}
