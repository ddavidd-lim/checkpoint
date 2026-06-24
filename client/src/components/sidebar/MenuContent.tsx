import { useUser } from "@/hooks/useUser";
import { createNote } from "@/repositories/notes";
import type { Note } from "@/types/db";
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import TextSnippetOutlinedIcon from '@mui/icons-material/TextSnippetOutlined';
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton, { listItemButtonClasses } from "@mui/material/ListItemButton";
import Stack from "@mui/material/Stack";
import { alpha } from '@mui/material/styles';
import Typography from "@mui/material/Typography";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";


type Props = {
  notes: Note[];
  handleSelectCurrentNoteId: (noteId: string) => void;
  currentNoteId: string;
  hoveredId: string | null;
  setHoveredId: (id: string | null) => void;
  menuNoteId: string | null;
  onMenuOpen: (e: React.MouseEvent<HTMLElement>, noteId: string) => void;
}

export default function MenuContent({
  notes,
  handleSelectCurrentNoteId,
  currentNoteId,
  hoveredId,
  setHoveredId,
  menuNoteId,
  onMenuOpen,
}: Props) {
  const queryClient = useQueryClient();
  const { data: user } = useUser();
  const createMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('No user');
      const { error } = await createNote('', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'], refetchType: 'all' });
    },
    onError: (error) => {
      console.log(`Failed to create note: ${error}`);
    },
  });

  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: 'space-between' }}>
      <List dense>
        {notes.map((note) => (
          <ListItem key={note.id} disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              selected={note.id === currentNoteId}
              onClick={() => handleSelectCurrentNoteId(note.id)}
              onMouseEnter={() => setHoveredId(note.id)}
              onMouseLeave={() => setHoveredId(null)}
              sx={(theme) => ({
                borderRadius: 2,
                px: 1,
                py: 0.75,
                height: 40,
                [`&.${listItemButtonClasses.focusVisible}`]: {
                  backgroundColor: 'transparent',
                },
                [`&.${listItemButtonClasses.selected}`]: {
                  [`&.${listItemButtonClasses.focusVisible}`]: {
                    backgroundColor: alpha(theme.palette.action.selected, 0.3),
                  },
                },
              })}
            >
              <TextSnippetOutlinedIcon sx={{ mr: 1 }} />
              <Stack sx={{ flex: 1, width: 0 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}
                >
                  {note.title === '' ? 'Untitled' : note.title}
                </Typography>
                <Typography variant="subtitle2" sx={{ fontSize: 10 }}>
                  {dayjs(note?.created_at).format('MM/DD/YYYY, h:mm A')}
                </Typography>
              </Stack>

              <IconButton
                size="small"
                onClick={(e) => onMenuOpen(e, note.id)}
                sx={{
                  visibility:
                    hoveredId === note.id || menuNoteId === note.id
                      ? 'visible'
                      : 'hidden',
                  ml: 1,
                }}
              >
                <MoreHorizIcon fontSize="small" />
              </IconButton>
            </ListItemButton>
          </ListItem>
        ))}
        <Box sx={{ my: 2 }}>
          <Button variant='contained' fullWidth onClick={() => createMutation.mutateAsync()} >
            +
          </Button>
        </Box>
      </List>

    </Stack>
  );
}