import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react"
import { PlaceChip } from "@/components/place-suggestion/PlaceChip"
import Mention, { type MentionOptions } from "@tiptap/extension-mention"
import type { ActivePlace } from "./types"
import type { PlaceItem } from "./PlaceSuggestionList"

interface PlaceMentionOptions extends MentionOptions<PlaceItem> {
  onChipClick: (place: ActivePlace, anchor: HTMLElement) => void
}

export const PlaceMention = Mention.extend<PlaceMentionOptions>({
  addOptions() {
    return {
      ...this.parent?.(),
      onChipClick: () => { },
    } as PlaceMentionOptions
  },

  addNodeView() {
    const { onChipClick } = this.options

    return ReactNodeViewRenderer(({ node }) => (
      <NodeViewWrapper as="span">
        <PlaceChip
          label={node.attrs.label}
          onClick={(anchor) =>
            onChipClick(
              {
                anchor,
                placeId: node.attrs.id,
                label: node.attrs.label,
                secondaryText: node.attrs.secondaryText ?? '',
              },
              anchor
            )
          }
        />
      </NodeViewWrapper>
    ))
  },
})