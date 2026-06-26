import type { SuggestionOptions } from '@tiptap/suggestion'
import { ReactRenderer } from '@tiptap/react'
import PlaceSuggestionList from './PlaceSuggestionList'
import type { PlaceItem, SuggestionListRef } from './PlaceSuggestionList'
import { updatePosition } from './updatePosition'

export const placeSuggestion: Partial<SuggestionOptions<PlaceItem>> = {
  char: '@',
  allowSpaces: true,
  minQueryLength: 2,
  debounce: 300,
  decorationClass: 'place-suggestion',
  decorationEmptyClass: 'is-empty',

  items: async ({ query, signal }): Promise<PlaceItem[]> => {
    if (!window.google?.maps?.places?.AutocompleteSuggestion) return []
    if (!query) return [] // return empty array, not early exit before dropdown mounts

    try {
      const result = await google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
        input: query,
      })

      if (signal.aborted) return [];

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
    let component: ReactRenderer<SuggestionListRef>

    return {
      onStart: props => {
        component = new ReactRenderer(PlaceSuggestionList, {
          props,
          editor: props.editor,
        })

        if (!props.clientRect) {
          return
        }

        component.element.style.position = 'absolute'

        document.body.appendChild(component.element)

        updatePosition({ editor: props.editor, element: component.element })
      },

      onUpdate(props) {
        component.updateProps(props)

        if (!props.clientRect) {
          return
        }

        updatePosition({ editor: props.editor, element: component.element })

      },
      onKeyDown(props) {
        return component.ref?.onKeyDown(props) ?? false
      },
      onExit() {
        component.element.remove()
        component.destroy()
      },
    }
  },
}