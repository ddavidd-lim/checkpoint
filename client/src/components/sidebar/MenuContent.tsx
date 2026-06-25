import type { Note } from "@/types/db";
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import TextSnippetOutlinedIcon from '@mui/icons-material/TextSnippetOutlined';
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton, { listItemButtonClasses } from "@mui/material/ListItemButton";
import Stack from "@mui/material/Stack";
import { alpha } from '@mui/material/styles';
import Typography from "@mui/material/Typography";
import dayjs from "dayjs";
import { memo } from "react";


type Props = {
  notes: Note[];
  handleSelectCurrentNoteId: (noteId: string) => void;
  currentNoteId: string;
  onMenuOpen: (e: React.MouseEvent<HTMLElement>, noteId: string) => void;
}

export default memo(
  function MenuContent({
    notes,
    handleSelectCurrentNoteId,
    currentNoteId,
    onMenuOpen,
  }: Props) {

    return (
      <Stack sx={{ flexGrow: 1, p: 1, justifyContent: 'space-between' }}>
        <List dense>
          {notes.map((note) => (
            <ListItem key={note.id} disablePadding sx={{ display: 'block' }}>
              <ListItemButton
                onClick={() => handleSelectCurrentNoteId(note.id)}
                className={note.id === currentNoteId ? 'selected' : ''}
                sx={(theme) => ({
                  borderRadius: 2,
                  px: 1,
                  py: 0.75,
                  height: 40,
                  '& .hover-actions': {
                    visibility: 'hidden',
                  },
                  '&:hover .hover-actions': {
                    visibility: 'visible',
                  },
                  '&.selected': {
                    backgroundColor: alpha(theme.palette.action.selected, 0.15),
                  },
                  '&.selected .hover-actions': {
                    visibility: 'visible',
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
                  className="hover-actions"
                  sx={{ ml: 1 }}
                >
                  <MoreHorizIcon fontSize="small" />
                </IconButton>
              </ListItemButton>
            </ListItem>
          ))}
        </List>

      </Stack>
    );
  })