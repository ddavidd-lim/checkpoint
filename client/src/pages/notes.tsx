/* eslint-disable react-hooks/exhaustive-deps */
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';
import Box from '@mui/material/Box';
import { useCallback, useEffect, useRef, useState } from 'react';

import Drawer from '@/components/drawer';
import { useUser } from '@/hooks/useUser';
import { createNote } from '@/repositories/notes';
import { initAuth } from '@/repositories/users';
import { supabase } from '@/services/supabase';
import type { Note } from '@/types/db';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';

const drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean;
}>(({ theme }) => ({
  flexGrow: 1,
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth}px`,
  variants: [
    {
      props: ({ open }) => open,
      style: {
        transition: theme.transitions.create('margin', {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
        marginLeft: 0,
      },
    },
  ],
}));

export default function Notes() {
  const [selectedNoteId, setSelectedNoteId] = useState<string>();
  const isCreating = useRef(false);

  const queryClient = useQueryClient();
  const { data: user } = useUser();

  const handleSelectCurrentNoteId = useCallback((noteId: string) => {
    setSelectedNoteId(noteId);
  }, []);

  const { data: notes, isSuccess } = useQuery<Note[]>({
    queryKey: ['notes'],
    queryFn: async () => {
      const { data } = await supabase
        .from('notes')
        .select()
        .order("created_at", { ascending: true });
      return data ?? [];
    },
    staleTime: 1000 * 60 * 5,
  });

  const currentNoteId = selectedNoteId ?? notes?.[0]?.id;

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('No user');
      const { data, error } = await createNote('', user.id);
      if (error) throw error;
      return data;

    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['notes'], refetchType: 'all' });
      setSelectedNoteId(data.id);
    },
    onError: (error) => {
      console.log(`Failed to create note: ${error}`);
    },
  });

  useEffect(() => {
    initAuth();
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    if (!isSuccess) return;
    if (notes.length > 0) return;
    if (isCreating.current) return;

    isCreating.current = true;

    createMutation.mutate();
  }, [user?.id, isSuccess, notes?.length]);

  const [open, setOpen] = useState(true);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const mapsLoaded = useGoogleMaps(import.meta.env.VITE_GOOGLE_MAPS_API_KEY)

  return (
    <>
      <Drawer
        currentNoteId={currentNoteId ?? ''}
        handleSelectCurrentNoteId={handleSelectCurrentNoteId}
        open={open}
        handleDrawerClose={handleDrawerClose}
      />
      <Main open={open}>
        <Stack direction={'row'} sx={{ height: 1, width: 1 }}>

          <Box sx={{ p: 2, flexShrink: 1, height: 1, display: 'flex', alignItems: 'start', justifyContent: 'start' }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              edge="start"
              sx={[
                {
                  mr: 2,
                },
                open && { display: 'none' },
              ]}
            >
              <ChevronRightIcon />
            </IconButton>
          </Box>
          {!mapsLoaded && (<div>Loading...</div>)}
          {mapsLoaded && (<SimpleEditor key={currentNoteId} noteId={currentNoteId} />)}
        </Stack>
      </Main>
    </>
  );
}