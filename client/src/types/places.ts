export type Place = { id: string; label: string };

export type Poi = {
  key: string,
  location: google.maps.LatLngLiteral,
  name: string,
  address: string,
  city: string
  state: string
}