import { useEffect, useRef } from 'react'

// https://developers.google.com/maps/documentation/javascript/load-maps-js-api#dynamic-library-import

export interface Marker {
  placeId: string
  lat: number
  lng: number
  label: string
}

export function OverviewMap({ places }: { places: Marker[] }) {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mapRef.current || !window.google || !places.length) return

    const map = new google.maps.Map(mapRef.current, {
      center: { lat: places[0].lat, lng: places[0].lng },
      zoom: 12,
      mapId: 'DEMO_MAP_ID',
      // mapId: import.meta.env.VITE_GOOGLE_MAP_ID,
    })

    places.forEach((place) => {
      new google.maps.marker.AdvancedMarkerElement({
        position: { lat: place.lat, lng: place.lng },
        map,
        title: place.label,
      })
    })
  }, [places])

  if (!places.length) {
    console.log('No places found')
    return null
  }

  return <div ref={mapRef} style={{ width: '100%', height: 300 }} />
}