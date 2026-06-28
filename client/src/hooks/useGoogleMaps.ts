import { useEffect, useState } from 'react'

export function useGoogleMaps(apiKey: string) {
  const [loaded, setLoaded] = useState(
    () => typeof window !== 'undefined' && !!window.google?.maps?.places?.AutocompleteSuggestion
  )

  useEffect(() => {
    if (loaded) return
    if (document.querySelector('#google-maps-script')) return

    const script = document.createElement('script')
    script.id = 'google-maps-script'
    // New async bootstrap loader
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,marker&loading=async&v=weekly`
    script.async = true
    script.defer = true
    script.onload = () => setLoaded(true)
    document.head.appendChild(script)
  }, [apiKey, loaded])

  return loaded
}