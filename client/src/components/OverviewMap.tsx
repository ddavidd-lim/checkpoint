import { useQuery } from '@tanstack/react-query';
import { AdvancedMarker, Map, Pin, useMap } from '@vis.gl/react-google-maps';
import { useEffect } from 'react';

// https://developers.google.com/codelabs/maps-platform/maps-platform-101-react-js

export type Poi = { key: string, location: google.maps.LatLngLiteral }

const PoiMarkers = ({ pois }: { pois: Poi[] }) => {
  const map = useMap()

  useEffect(() => {
    if (!map || !pois.length) return
    map.panTo(pois[0].location)
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
  placeIds: { id: string; label: string }[]
}
export function OverviewMap({ placeIds }: Props) {
  const queryKey = placeIds.map(p => p.id).join(',')

  const { data: pois = [] } = useQuery({
    queryKey: ['places', queryKey],
    queryFn: async () => {
      const results = await Promise.allSettled(
        placeIds.map(async ({ id }) => {
          // https://developers.google.com/maps/documentation/javascript/place-details
          console.log('Searching place details')
          const place = new google.maps.places.Place({ id });

          await place.fetchFields({ fields: ['location'] });

          return {
            key: id,
            location: { lat: place.location!.lat(), lng: place.location!.lng() },
          } as Poi
        })
      );

      return results
        .filter(r => r.status === 'fulfilled')
        .map(r => (r as PromiseFulfilledResult<Poi>).value);
    },
    enabled: placeIds.length > 0,
  })


  return (
    <Map
      style={{ width: '750px', height: '300px' }}
      mapId='DEMO_MAP_ID'
      defaultZoom={13}
      defaultCenter={{ lat: 34.0522, lng: -118.2437 }}
    >
      {<PoiMarkers pois={pois}></PoiMarkers>}
    </Map>
  )
}