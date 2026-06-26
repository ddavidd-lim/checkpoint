
import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react"
import { PlaceChip } from "@/components/place-suggestion/PlaceChip"
import Mention from "@tiptap/extension-mention"

export const PlaceMention = Mention.extend({
  addNodeView() {
    return ReactNodeViewRenderer(({ node }) => (
      <NodeViewWrapper as="span" >
        <PlaceChip label={node.attrs.label} />
      </NodeViewWrapper>
    ))
  },
})