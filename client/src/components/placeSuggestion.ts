import type { SuggestionOptions } from '@tiptap/suggestion'
import { ReactRenderer } from '@tiptap/react'
import PlaceSuggestionList from './PlaceSuggestionList'
import type { PlaceItem, SuggestionListRef } from './PlaceSuggestionList'

export const placeSuggestion: Partial<SuggestionOptions<PlaceItem>> = {
  char: '@',
  allowSpaces: true,

  items: async ({ query }): Promise<PlaceItem[]> => {
    if (!window.google?.maps?.places?.AutocompleteSuggestion) return []
    if (!query) return [] // return empty array, not early exit before dropdown mounts

    try {
      const result = await google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
        input: query,
      })
      console.log('results:', result)
      return result.suggestions
        .filter((s) => s.placePrediction)
        .slice(0, 5)
        .map((s) => {
          const p = s.placePrediction!
          return {
            id: p.placeId,
            label: p.mainText?.toString() ?? p.text.toString(),
            secondaryText: p.secondaryText?.toString() ?? '',
            placeId: p.placeId,
          }
        })
    } catch (e) {
      console.error('Places error:', e)
      return []
    }
  },

  render: () => {
    let renderer: ReactRenderer<SuggestionListRef>

    return {
      onStart(props) {
        renderer = new ReactRenderer(PlaceSuggestionList, {
          props,
          editor: props.editor,
        })
      },
      onUpdate(props) {
        renderer.updateProps(props)
      },
      onKeyDown(props) {
        return renderer.ref?.onKeyDown(props) ?? false
      },
      onExit() {
        renderer.destroy()
      },
    }
  },
}