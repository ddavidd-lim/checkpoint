/* eslint-disable react-hooks/refs */
"use client"

import { EditorContent, EditorContext, useEditor, type Content } from "@tiptap/react"
import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react"

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
import { PlacePopover } from "@/components/place-suggestion/PlacePopover"
import { placeSuggestion } from "@/components/place-suggestion/placeSuggestion"
import type { ActivePlace } from "@/components/place-suggestion/types"
import { SaveIndicator } from "@/components/SaveIndicator"
import type { SaveState } from "@/components/SaveIndicator/types"
import { saveNote } from "@/repositories/notes"
import { supabase } from "@/services/supabase"
import type { Note } from "@/types/db"
import type { Place } from "@/types/places"
import Box from "@mui/material/Box"
import Stack from "@mui/material/Stack"
import TextField from "@mui/material/TextField"
import MuiTypography from "@mui/material/Typography"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import dayjs from 'dayjs'


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
  setPlaces: Dispatch<SetStateAction<Place[]>>
}

export function SimpleEditor({ noteId, setPlaces }: Props) {
  const isMobile = useIsBreakpoint()
  const { height } = useWindowSize()
  const [mobileView, setMobileView] = useState<"main" | "highlighter" | "link">(
    "main"
  )

  const queryClient = useQueryClient();

  const toolbarRef = useRef<HTMLDivElement>(null);

  const saveTimeout = useRef<number | null>(null);

  const loadedNoteId = useRef<string | null>(null);

  const [title, setTitle] = useState('');

  const [activePlace, setActivePlace] = useState<ActivePlace | null>(null)

  const [saveState, setSaveState] = useState<SaveState>('idle');

  const titleRef = useRef(title);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const noteIdRef = useRef(noteId);
  const justLoadedRef = useRef(false);


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

      }).extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            secondaryText: { default: null },
          }
        },
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


  // Keep refs in sync
  useEffect(() => { titleRef.current = title; }, [title]);
  useEffect(() => { noteIdRef.current = noteId; }, [noteId]);

  // Stable save function — never recreated
  const scheduleSave = useCallback(() => {
    if (!editor || !noteIdRef.current) return;
    if (justLoadedRef.current) return;  // skip saves during load

    if (saveTimeout.current) clearTimeout(saveTimeout.current);

    setSaveState('saving');

    saveTimeout.current = setTimeout(() => {

      const content = editor.getJSON();
      const currentTitle = titleRef.current;
      const currentNoteId = noteIdRef.current;
      if (!currentNoteId) return;

      saveNote(currentTitle, content, currentNoteId);

      setSaveState('saved');

      queryClient.setQueryData(['notes'], (old: Note[] = []) =>
        old.map((n) =>
          n.id === currentNoteId
            ? { ...n, title: currentTitle, updated_at: new Date().toISOString() }
            : n
        )
      );

      queryClient.setQueryData(['note', currentNoteId], (old: Note | null | undefined) =>
        old ? { ...old, title: currentTitle, content, updated_at: new Date().toISOString() } : old
      );
    }, 1000);
  }, [editor, queryClient]);

  // Register editor listener once
  useEffect(() => {
    if (!editor || !noteId) return;
    editor.on('update', scheduleSave);
    return () => {
      editor.off('update', scheduleSave);
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, [editor, noteId, scheduleSave]);

  // Title changes also trigger a save
  useEffect(() => {
    if (!editor || !noteId) return;
    scheduleSave();
  }, [title]); // eslint-disable-line react-hooks/exhaustive-deps

  // Flush on note switch
  useEffect(() => {
    return () => {
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current);
        // fire immediately on cleanup
        if (editor && noteIdRef.current) {
          saveNote(titleRef.current, editor.getJSON(), noteIdRef.current);
        }
      }
    };
  }, [noteId, editor]);

  // Load note content into editor when note changes
  useEffect(() => {
    if (!editor || !note) return;
    if (loadedNoteId.current === note.id) return;
    justLoadedRef.current = true;

    loadedNoteId.current = note.id;

    setTitle(note.title ?? '');
    requestAnimationFrame(() => {
      editor.commands.setContent(note.content as Content);
      justLoadedRef.current = false;
    });
  }, [editor, note]);

  const rect = useCursorVisibility({
    editor,
    overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0,
  })

  // Extract places from editor
  useEffect(() => {
    if (!editor) return

    function extractPlaces() {
      const ids: { id: string; label: string }[] = []
      editor!.state.doc.descendants((node) => {
        if (node.type.name === 'mention' && node.attrs.id) {
          ids.push({ id: node.attrs.id, label: node.attrs.label })
        }
      })

      setPlaces((prev) => {
        const newKey = ids.map(i => i.id).join(',')
        const prevKey = prev.map(i => i.id).join(',')
        if (newKey === prevKey) return prev;
        return ids;
      });
    }

    editor.on('update', extractPlaces);
    extractPlaces();

    return () => {
      editor.off('update', extractPlaces);
    }
  }, [editor, setPlaces])

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
            inputRef={titleInputRef}
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
              pl: { xs: 2, sm: 5 },
              width: 1,
              maxWidth: 750,

              '& .MuiInputBase-input': {
                fontSize: '2rem',
                fontWeight: 700,
              },
            }}
          />

          <Box sx={{ display: 'flex', flexDirection: 'row', width: 1, maxWidth: 750, px: { xs: 2, sm: 7 }, justifyContent: 'space-between' }}>
            <MuiTypography variant={'subtitle2'}>
              Created: {isMobile
                ? dayjs(note?.created_at).format('MM/DD/YYYY')
                : dayjs(note?.created_at).format('MM/DD/YYYY, h:mm A')}
            </MuiTypography>
            <Stack direction={'row'} sx={{ gap: 1, alignItems: 'center' }}>
              <SaveIndicator state={saveState} updatedAt={dayjs(note?.updated_at).format('MM/DD/YYYY, h:mm A')} />
              <MuiTypography variant={'subtitle2'}>
                Updated: {isMobile
                  ? dayjs(note?.updated_at).format('MM/DD/YYYY')
                  : dayjs(note?.updated_at).format('MM/DD/YYYY, h:mm A')}
              </MuiTypography>

            </Stack>
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
