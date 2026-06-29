import { usePlacePois } from '@/hooks/usePlacePois';
import type { Place, Poi } from '@/types/places';
import { AdvancedMarker, Map, Pin, useMap } from '@vis.gl/react-google-maps';
import { useEffect } from 'react';

// https://developers.google.com/codelabs/maps-platform/maps-platform-101-react-js
// https://developers.google.com/maps/documentation/javascript/reference/map#Map.fitBounds
// https://developers.google.com/maps/documentation/javascript/reference/coordinates#LatLngBounds
// https://developers.google.com/maps/documentation/javascript/reference/map#Map.panTo



const PoiMarkers = ({ pois }: { pois: Poi[] }) => {
  const map = useMap()

  useEffect(() => {
    if (!map || !pois.length) return

    if (pois.length === 1) {
      map.panTo(pois[0].location)
      map.setZoom(14)
      return
    }

    const bounds = new google.maps.LatLngBounds()
    pois.forEach(poi => bounds.extend(poi.location))
    map.fitBounds(bounds, 40) // 40px padding
  }, [map, pois])


  return (
    <>
      {pois.map((poi: Poi) => (
        <AdvancedMarker
          key={poi.key}
          position={poi.location}>
          {/* Customize with background={'#FBBC04'} glyphColor={'#000'} borderColor={'#000'}  */}
          <Pin />
        </AdvancedMarker>
      ))}
    </>
  );
};

type Props = {
  places: Place[]
}
export function OverviewMap({ places }: Props) {
  const { data: pois = [] } = usePlacePois(places);

  return (
    <Map
      style={{ width: '100%', height: '300px', flexShrink: 0 }}
      mapId='DEMO_MAP_ID'
      defaultZoom={13}
      defaultCenter={{ lat: 34.0522, lng: -118.2437 }}
    >
      {<PoiMarkers pois={pois}></PoiMarkers>}
    </Map>
  )
}