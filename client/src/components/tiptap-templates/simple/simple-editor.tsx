/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/refs */
"use client"

import { EditorContent, EditorContext, useEditor, type Content } from "@tiptap/react"
import { useCallback, useEffect, useRef, useState } from "react"

// --- Tiptap Core Extensions ---
import { Highlight } from "@tiptap/extension-highlight"
import { Image } from "@tiptap/extension-image"
import { TaskItem, TaskList } from "@tiptap/extension-list"
import { Subscript } from "@tiptap/extension-subscript"
import { Superscript } from "@tiptap/extension-superscript"
import { TextAlign } from "@tiptap/extension-text-align"
import { Typography } from "@tiptap/extension-typography"
import { Selection } from "@tiptap/extensions"
import { StarterKit } from "@tiptap/starter-kit"

// --- UI Primitives ---
import { Button } from "@/components/tiptap-ui-primitive/button"
import { Spacer } from "@/components/tiptap-ui-primitive/spacer"
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/components/tiptap-ui-primitive/toolbar"

// --- Tiptap Node ---
import "@/components/tiptap-node/blockquote-node/blockquote-node.scss"
import "@/components/tiptap-node/code-block-node/code-block-node.scss"
import "@/components/tiptap-node/heading-node/heading-node.scss"
import { HorizontalRule } from "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension"
import "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss"
import "@/components/tiptap-node/image-node/image-node.scss"
import { ImageUploadNode } from "@/components/tiptap-node/image-upload-node/image-upload-node-extension"
import "@/components/tiptap-node/list-node/list-node.scss"
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss"

// --- Tiptap UI ---
import { BlockquoteButton } from "@/components/tiptap-ui/blockquote-button"
import { CodeBlockButton } from "@/components/tiptap-ui/code-block-button"
import {
  ColorHighlightPopover,
  ColorHighlightPopoverButton,
  ColorHighlightPopoverContent,
} from "@/components/tiptap-ui/color-highlight-popover"
import { HeadingDropdownMenu } from "@/components/tiptap-ui/heading-dropdown-menu"
import { ImageUploadButton } from "@/components/tiptap-ui/image-upload-button"
import {
  LinkButton,
  LinkContent,
  LinkPopover,
} from "@/components/tiptap-ui/link-popover"
import { ListDropdownMenu } from "@/components/tiptap-ui/list-dropdown-menu"
import { MarkButton } from "@/components/tiptap-ui/mark-button"
import { TextAlignButton } from "@/components/tiptap-ui/text-align-button"
import { UndoRedoButton } from "@/components/tiptap-ui/undo-redo-button"

// --- Icons ---
import { ArrowLeftIcon } from "@/components/tiptap-icons/arrow-left-icon"
import { HighlighterIcon } from "@/components/tiptap-icons/highlighter-icon"
import { LinkIcon } from "@/components/tiptap-icons/link-icon"

// --- Hooks ---
import { useCursorVisibility } from "@/hooks/tip-tap-hooks/use-cursor-visibility"
import { useIsBreakpoint } from "@/hooks/tip-tap-hooks/use-is-breakpoint"
import { useWindowSize } from "@/hooks/tip-tap-hooks/use-window-size"

// --- Components ---
import { ThemeToggle } from "@/components/tiptap-templates/simple/theme-toggle"

// --- Lib ---
import { handleImageUpload, MAX_FILE_SIZE } from "@/lib/tiptap-utils"

// --- Styles ---
import "@/components/tiptap-templates/simple/simple-editor.scss"

import { PlaceMention } from "@/components/place-suggestion/placeMention"
import { placeSuggestion } from "@/components/place-suggestion/placeSuggestion"
import { saveNote } from "@/repositories/notes"
import { supabase } from "@/services/supabase"
import type { Note } from "@/types/db"
import Box from "@mui/material/Box"
import TextField from "@mui/material/TextField"
import MuiTypography from "@mui/material/Typography"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import dayjs from 'dayjs'
import type { ActivePlace } from "@/components/place-suggestion/types"
import { PlacePopover } from "@/components/place-suggestion/PlacePopover"


const MainToolbarContent = ({
  onHighlighterClick,
  onLinkClick,
  isMobile,
}: {
  onHighlighterClick: () => void
  onLinkClick: () => void
  isMobile: boolean
}) => {
  return (
    <>
      <Spacer />

      <ToolbarGroup>
        <UndoRedoButton action="undo" />
        <UndoRedoButton action="redo" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <HeadingDropdownMenu modal={false} levels={[1, 2, 3, 4]} />
        <ListDropdownMenu
          modal={false}
          types={["bulletList", "orderedList", "taskList"]}
        />
        <BlockquoteButton />
        <CodeBlockButton />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="bold" />
        <MarkButton type="italic" />
        <MarkButton type="strike" />
        <MarkButton type="code" />
        <MarkButton type="underline" />
        {!isMobile ? (
          <ColorHighlightPopover />
        ) : (
          <ColorHighlightPopoverButton onClick={onHighlighterClick} />
        )}
        {!isMobile ? <LinkPopover /> : <LinkButton onClick={onLinkClick} />}
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="superscript" />
        <MarkButton type="subscript" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <TextAlignButton align="left" />
        <TextAlignButton align="center" />
        <TextAlignButton align="right" />
        <TextAlignButton align="justify" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <ImageUploadButton text="Add" />
      </ToolbarGroup>

      <Spacer />

      {isMobile && <ToolbarSeparator />}

      <ToolbarGroup>
        <ThemeToggle />
      </ToolbarGroup>
    </>
  )
}

const MobileToolbarContent = ({
  type,
  onBack,
}: {
  type: "highlighter" | "link"
  onBack: () => void
}) => (
  <>
    <ToolbarGroup>
      <Button variant="ghost" onClick={onBack}>
        <ArrowLeftIcon className="tiptap-button-icon" />
        {type === "highlighter" ? (
          <HighlighterIcon className="tiptap-button-icon" />
        ) : (
          <LinkIcon className="tiptap-button-icon" />
        )}
      </Button>
    </ToolbarGroup>

    <ToolbarSeparator />

    {type === "highlighter" ? (
      <ColorHighlightPopoverContent />
    ) : (
      <LinkContent />
    )}
  </>
)

type Props = {
  noteId?: string;
}

export function SimpleEditor({ noteId }: Props) {
  const isMobile = useIsBreakpoint()
  const { height } = useWindowSize()
  const [mobileView, setMobileView] = useState<"main" | "highlighter" | "link">(
    "main"
  )

  const queryClient = useQueryClient();

  const toolbarRef = useRef<HTMLDivElement>(null);

  const saveTimeout = useRef<number | null>(null);

  const titleRef = useRef<HTMLInputElement>(null)

  const loadedNoteId = useRef<string | null>(null);

  const [title, setTitle] = useState('');

  const [activePlace, setActivePlace] = useState<ActivePlace | null>(null)

  const editor = useEditor({
    immediatelyRender: false,
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        "aria-label": "Main content area, start typing to enter text.",
        class: "simple-editor",
      },
      handleDOMEvents: {
        mousedown(_view, event) {
          const target = event.target as HTMLElement

          // Prevent from updating selection when clicking a place chip or its children
          if (target.closest('.place-chip')) {
            event.preventDefault()
            return true
          }
          return false
        },
      },

    },
    extensions: [
      PlaceMention.configure({
        HTMLAttributes: { class: 'place-chip' },
        suggestion: placeSuggestion,
        onChipClick: (place) => setActivePlace(place),

      }),
      StarterKit.configure({
        horizontalRule: false,
        link: {
          openOnClick: false,
          enableClickSelection: true,
        },
      }),
      HorizontalRule,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Image,
      Typography,
      Superscript,
      Subscript,
      Selection,
      ImageUploadNode.configure({
        accept: "image/*",
        maxSize: MAX_FILE_SIZE,
        limit: 3,
        upload: handleImageUpload,
        onError: (error) => console.error("Upload failed:", error),
      }),
    ],
    content: '',
  })

  const { data: note } = useQuery({
    queryKey: ['note', noteId],
    queryFn: async () => {
      if (!noteId) return null;

      const { data } = await supabase.from('notes').select('*').eq('id', noteId).limit(1);

      return data?.[0] ?? null
    },
    enabled: !!noteId,
    staleTime: 1000 * 60 * 5
  })

  useEffect(() => {
    if (!editor || !note) return;
    if (loadedNoteId.current === note.id) return

    // Don't set content if its the same note
    loadedNoteId.current = note.id;

    setTitle(note.title ?? '')
    editor.commands.setContent(note.content as Content)

  }, [editor, note])

  const rect = useCursorVisibility({
    editor,
    overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0,
  })

  useEffect(() => {
    if (!isMobile && mobileView !== "main") {
      setMobileView("main")
    }
  }, [isMobile, mobileView])


  // Callback to save debounced
  const scheduleSave = useCallback(() => {
    if (!editor || !noteId) return;

    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
    }

    saveTimeout.current = setTimeout(() => {
      const content = editor.getJSON();

      saveNote(title, content, noteId);
      // Update single note
      // queryClient.setQueryData(['note', noteId], (old: Note) => {
      //   if (!old) return old;

      //   return {
      //     ...old,
      //     title,
      //     content,
      //   };
      // });

      // 2. optionally update notes list WITHOUT refetch
      queryClient.setQueryData(['notes'], (old: Note[] = []) => {
        return old.map((n) =>
          n.id === noteId
            ? { ...n, title, updated_at: new Date().toISOString() }
            : n
        );
      });
    }, 1000);
  }, [editor, noteId, title, queryClient]);

  // Debounce note saving to 1 second after user stops typing
  useEffect(() => {
    if (!editor || !noteId) return;

    editor.on('update', scheduleSave);

    return () => {
      editor.off("update", scheduleSave)

      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current)
      }
    }
  }, [editor, noteId, title, scheduleSave])

  // Debounce note saving after user edits title
  useEffect(() => {
    if (!editor || !noteId) return;
    scheduleSave();
  }, [title, editor, noteId, scheduleSave])

  return (
    <div className="simple-editor-wrapper">
      <EditorContext.Provider value={{ editor }}>
        <Toolbar
          ref={toolbarRef}
          style={{
            ...(isMobile
              ? {
                bottom: `calc(100% - ${height - rect.y}px)`,
              }
              : {}),
          }}
        >
          {mobileView === "main" ? (
            <MainToolbarContent
              onHighlighterClick={() => setMobileView("highlighter")}
              onLinkClick={() => setMobileView("link")}
              isMobile={isMobile}
            />
          ) : (
            <MobileToolbarContent
              type={mobileView === "highlighter" ? "highlighter" : "link"}
              onBack={() => setMobileView("main")}
            />
          )}
        </Toolbar>

        <Box sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', width: '100%', alignItems: 'center' }}>

          <TextField
            variant="standard"
            placeholder="Untitled"
            value={title}
            inputRef={titleRef}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                editor?.commands.focus('start')
              }
              if (e.key === 'ArrowDown') {
                e.preventDefault()
                editor?.commands.focus('start')
              }
            }}
            sx={{
              p: 2,
              pl: 5,
              width: 1,
              maxWidth: 750,

              '& .MuiInputBase-input': {
                fontSize: '2rem',
                fontWeight: 700,
              },
            }}
          />
          <Box sx={{ display: 'flex', flexDirection: 'row', width: 1, maxWidth: 750, pl: 7, justifyContent: 'space-between' }}>

            <MuiTypography variant={'subtitle2'}>
              Created: {dayjs(note?.created_at).format('MM/DD/YYYY, h:mm A')}
            </MuiTypography>
            <MuiTypography variant={'subtitle2'}>
              Updated: {dayjs(note?.updated_at).format('MM/DD/YYYY, h:mm A')}
            </MuiTypography>
          </Box>
        </Box>
        <EditorContent
          editor={editor}
          role="presentation"
          className="simple-editor-content"
        />
      </EditorContext.Provider>
      <PlacePopover
        anchor={activePlace?.anchor ?? null}
        placeId={activePlace?.placeId ?? ''}
        label={activePlace?.label ?? ''}
        secondaryText={activePlace?.secondaryText ?? ''}
        onClose={() => setActivePlace(null)}
      />
    </div>
  )
}
