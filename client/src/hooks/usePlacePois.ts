import { useQuery } from '@tanstack/react-query'
import type { Place, Poi } from '@/types/places'

export function usePlacePois(places: Place[]) {
  const queryKey = places.map(p => p.id).join(',')

  return useQuery({
    queryKey: ['places', queryKey],
    queryFn: async () => {
      const results = await Promise.allSettled(
        places.map(async ({ id }) => {
          const place = new google.maps.places.Place({ id })
          await place.fetchFields({ fields: ['location', 'addressComponents', 'displayName', 'formattedAddress'] })

          return {
            key: id,
            location: { lat: place.location!.lat(), lng: place.location!.lng() },
            name: place.displayName ?? '',
            address: place.formattedAddress ?? '',
            city: place.addressComponents?.find(c => c.types.includes('locality'))?.longText ?? '',
            state: place.addressComponents?.find(c => c.types.includes('administrative_area_level_1'))?.shortText ?? '',
          } as Poi
        })
      )

      return results
        .filter(r => r.status === 'fulfilled')
        .map(r => (r as PromiseFulfilledResult<Poi>).value)
    },
    enabled: places.length > 0,
    staleTime: Infinity,
  })
}

