import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';

import { createNote, deleteNote } from '@/repositories/notes';
import { initAuth } from '@/repositories/users';
import { supabase } from '@/services/supabase';
import type { Note } from '@/types/db';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import {
  useMutation,
  useQuery,
  useQueryClient
} from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useUser } from '@/hooks/useUser';

const drawerWidth = 240;

export default function Notes() {
  const [selectedNoteId, setSelectedNoteId] = useState<string>();

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuNoteId, setMenuNoteId] = useState<string | null>(null);

  const { data: user } = useUser();

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>, noteId: string) => {
    e.stopPropagation(); // prevent ListItemButton onClick from firing
    setMenuAnchor(e.currentTarget);
    setMenuNoteId(noteId);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuNoteId(null);
  };

  const queryClient = useQueryClient();

  const { data: noteIds, isSuccess } = useQuery({
    queryKey: ['notes'],
    queryFn: async () => {
      const { data } = await supabase.from('notes').select().order("created_at", { ascending: true });

      return data ?? []
    },
    staleTime: 1000 * 60 * 5
  })

  const currentNoteId = selectedNoteId ?? noteIds?.[0]?.id;

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('No user')

      const { error } = await createNote('', user.id)

      if (error) throw error;
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: ['notes'],
        refetchType: 'all'
      })
    },
    onError: async (error) => {
      console.log(`Failed to create note: ${error}`)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: deleteNote,

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['notes'] });

      const previous = queryClient.getQueryData(['notes']);

      queryClient.setQueryData(['notes'], (old: Note[]) =>
        old?.filter((n: Note) => n.id !== id)
      );

      return { previous };
    },

    onError: (_err, _id, context) => {
      queryClient.setQueryData(['notes'], context?.previous);
    },

    onSuccess: async () => {
      if (currentNoteId === menuNoteId && noteIds) {
        setSelectedNoteId(noteIds[-1].id)
      }
      handleMenuClose();
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  useEffect(() => {
    initAuth();
    const hi = async () => {
      const user = await supabase.auth.getUser();
      console.log('Current user:', user);
    };
    hi();
  }, []);

  useEffect(() => {
    if (!user?.id) return
    if (!isSuccess) return
    if (noteIds.length > 0) return

    createMutation.mutate()
  }, [user?.id, isSuccess, noteIds?.length, createMutation])


  return (
    <>
      <Box
        sx={{
          height: '100%',
          width: drawerWidth,
          flexShrink: 0,
          borderRight: '1px solid grey',
          display: 'flex',
          justifyContent: 'space-between',
          flexDirection: 'column',
        }}
      >
        <Typography variant='subtitle1' sx={{ fontWeight: 600, p: 2 }}>
          Waypoint
        </Typography>
        <Box sx={{
          display: 'flex',
          flexGrow: 1,
          justifyContent: 'space-between',
          flexDirection: 'column',
        }}>
          <List>
            {noteIds && noteIds.map(note => (
              <ListItemButton
                key={note.id}
                selected={note.id === currentNoteId}
                onClick={() => setSelectedNoteId(note.id)}
                onMouseEnter={() => setHoveredId(note.id)}
                onMouseLeave={() => setHoveredId(null)}
                sx={{ justifyContent: 'space-between', pr: 0.5 }}
              >
                <Stack sx={{ flex: 1, width: 0 }}>
                  <Typography variant='subtitle2' sx={{ textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                    {note.title === '' ? 'Untitled' : note.title}
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontSize: 10 }}>
                    {dayjs(note?.created_at).format('MM/DD/YYYY, h:mm A')}
                  </Typography>
                </Stack>

                <IconButton
                  size="small"
                  onClick={(e) => handleMenuOpen(e, note.id)}
                  sx={{
                    visibility: hoveredId === note.id || menuNoteId === note.id ? 'visible' : 'hidden',
                    ml: 1,
                  }}
                >
                  <MoreHorizIcon fontSize="small" />
                </IconButton>
              </ListItemButton>
            ))}
            <Menu
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={handleMenuClose}
              slotProps={{ paper: { sx: { minWidth: 140 } } }}
            >
              <Typography variant='subtitle1' sx={{ px: 2, color: 'grey' }}>{menuNoteId}</Typography>
              {/* <MenuItem onClick={() => { handleMenuClose(); }}>Rename</MenuItem> */}
              <MenuItem onClick={() => {
                if (!menuNoteId) return;
                deleteMutation.mutate(menuNoteId);
              }} sx={{ color: 'error.main' }}>Delete</MenuItem>
            </Menu>
          </List>
          <Button onClick={() => createMutation.mutateAsync()}>
            Create New Note
          </Button>
        </Box>
      </Box>
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          height: '100%',
          overflow: 'hidden',
        }}
      >
        <SimpleEditor noteId={currentNoteId} />
      </Box>
    </>
  );
}