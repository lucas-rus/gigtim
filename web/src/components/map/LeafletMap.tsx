'use client'

import { useEffect, useRef } from 'react'
import { useTheme } from 'next-themes'
import 'leaflet/dist/leaflet.css'

export interface MapShiftPin {
  id: string
  lat: number
  lng: number
  applied: boolean
}

interface LeafletMapProps {
  pins: MapShiftPin[]
  onPinClick: (id: string) => void
  onMapClick?: () => void
  /** Timișoara city center */
  center?: [number, number]
  zoom?: number
}

/**
 * Zori-styled Leaflet map.
 * - Carto Positron (light) / Dark Matter (dark) tiles: desaturated, warm-neutral,
 *   so the ember/sage pins carry all the chromatic weight (mirrors the mobile
 *   custom map styles).
 * - Pins are divIcons: ember for open shifts, sage for already-applied.
 * - No external API key required.
 */
export default function LeafletMap({
  pins,
  onPinClick,
  onMapClick,
  center = [45.75372, 21.22571],
  zoom = 13,
}: LeafletMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markersRef = useRef<Map<string, any>>(new Map())
  const tileLayerRef = useRef<any>(null)
  const { resolvedTheme } = useTheme()

  // Callback refs so marker handlers always call the latest props
  const onPinClickRef = useRef(onPinClick)
  const onMapClickRef = useRef(onMapClick)
  useEffect(() => {
    onPinClickRef.current = onPinClick
    onMapClickRef.current = onMapClick
  }, [onPinClick, onMapClick])

  // Initialize map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    let cancelled = false
    let resizeObserver: ResizeObserver | null = null

    async function init() {
      const L = (await import('leaflet')).default
      if (cancelled || !containerRef.current || mapRef.current) return

      const map = L.map(containerRef.current, {
        center,
        zoom,
        zoomControl: false,
        attributionControl: true,
      })
      L.control.zoom({ position: 'bottomright' }).addTo(map)
      map.on('click', () => onMapClickRef.current?.())
      mapRef.current = map

      tileLayerRef.current = L.tileLayer(tileUrl(resolvedTheme), {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      })
      tileLayerRef.current.addTo(map)

      // Ensure Leaflet recalculates viewport bounds immediately after render
      setTimeout(() => {
        if (!cancelled && mapRef.current) {
          mapRef.current.invalidateSize()
        }
      }, 150)

      if (typeof window !== 'undefined' && 'ResizeObserver' in window && containerRef.current) {
        resizeObserver = new ResizeObserver(() => {
          if (mapRef.current) {
            mapRef.current.invalidateSize()
          }
        })
        resizeObserver.observe(containerRef.current)
      }
    }
    init()

    return () => {
      cancelled = true
      if (resizeObserver) {
        resizeObserver.disconnect()
      }
      const map = mapRef.current
      const markers = markersRef.current
      if (map) {
        map.remove()
        mapRef.current = null
        markers.clear()
        tileLayerRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Swap tiles when theme changes
  useEffect(() => {
    if (!tileLayerRef.current || !mapRef.current) return
    tileLayerRef.current.setUrl(tileUrl(resolvedTheme))
  }, [resolvedTheme])

  // Sync markers with pins
  useEffect(() => {
    if (!mapRef.current) return
    let cancelled = false

    async function sync() {
      const L = (await import('leaflet')).default
      const map = mapRef.current
      if (cancelled || !map) return

      const seen = new Set<string>()
      for (const pin of pins) {
        seen.add(pin.id)
        const existing = markersRef.current.get(pin.id)
        const icon = makeIcon(L, pin.applied)
        if (existing) {
          existing.setLatLng([pin.lat, pin.lng])
          existing.setIcon(icon)
        } else {
          const marker = L.marker([pin.lat, pin.lng], { icon })
          marker.on('click', () => onPinClickRef.current(pin.id))
          marker.addTo(map)
          markersRef.current.set(pin.id, marker)
        }
      }
      // Remove stale markers
      for (const [id, marker] of markersRef.current.entries()) {
        if (!seen.has(id)) {
          marker.remove()
          markersRef.current.delete(id)
        }
      }

      // Fit bounds when we have pins
      if (pins.length > 0) {
        const bounds = L.latLngBounds(pins.map((p) => [p.lat, p.lng] as [number, number]))
        map.fitBounds(bounds.pad(0.15), { maxZoom: 15 })
      }
    }
    sync()
    return () => {
      cancelled = true
    }
  }, [pins])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-0 h-full w-full bg-muted"
      aria-label="Hartă cu ture disponibile"
      role="application"
    />
  )
}

function tileUrl(theme: string | undefined): string {
  const apiKey = process.env.NEXT_PUBLIC_CARTO_API_KEY || 'cb1_2ftt_1_dbae2466188fb2a6e2a1b2a8'
  const query = apiKey ? `?api_key=${apiKey}` : ''
  return theme === 'dark'
    ? `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png${query}`
    : `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png${query}`
}

function makeIcon(L: any, applied: boolean) {
  // Ember for open, sage for applied — Zori accent strategy (matches mobile pins)
  const fill = applied ? '#33854A' : '#E14D28'
  return L.divIcon({
    className: 'gigtim-pin',
    html: `<div style="
      width: 34px; height: 34px;
      background: ${fill};
      border: 2.5px solid #FDFBF9;
      border-radius: 50% 50% 50% 4px;
      transform: rotate(-45deg);
      box-shadow: 0 3px 10px rgba(0,0,0,0.35);
      display: flex; align-items: center; justify-content: center;
    "><div style="
      width: 10px; height: 10px;
      background: #FDFBF9;
      border-radius: 50%;
    "></div></div>`,
    iconSize: [34, 34],
    iconAnchor: [6, 32],
  })
}
