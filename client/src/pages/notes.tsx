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
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import OverviewMapDrawer from '@/components/drawer/OverviewMapDrawer';
import { LEFT_DRAWER_WIDTH, RIGHT_DRAWER_WIDTH } from '@/constants.ts/drawerWidth';



const Main = styled('main', {
  shouldForwardProp: (prop) => prop !== 'openLeft' && prop !== 'openRight'
})<{
  openLeft?: boolean;
  openRight?: boolean;
}>(({ theme }) => ({
  flexGrow: 1,
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${LEFT_DRAWER_WIDTH}px`,
  marginRight: `-${RIGHT_DRAWER_WIDTH}px`,
  variants: [
    {
      props: ({ openLeft }) => openLeft,
      style: {
        transition: theme.transitions.create('margin', {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
        marginLeft: 0,
      },
    },
    {
      props: ({ openRight }) => openRight,
      style: {
        transition: theme.transitions.create('margin', {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
        marginRight: 0,
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

  // Left Drawer state
  const [openLeftDrawer, setOpenLeftDrawer] = useState(true);

  const handleLeftDrawerOpen = () => {
    setOpenLeftDrawer(true);
  };

  const handleLeftDrawerClose = () => {
    setOpenLeftDrawer(false);
  };

  // Right Drawer State
  const [openRightDrawer, setOpenRightDrawer] = useState(true);

  const handleRightDrawerOpen = () => {
    setOpenRightDrawer(true);
  };

  const handleRightDrawerClose = () => {
    setOpenRightDrawer(false);
  };

  return (
    <>
      <Drawer
        currentNoteId={currentNoteId ?? ''}
        handleSelectCurrentNoteId={handleSelectCurrentNoteId}
        open={openLeftDrawer}
        handleDrawerClose={handleLeftDrawerClose}
      />

      <Main openLeft={openLeftDrawer} openRight={openRightDrawer}>
        <Stack direction={'row'} sx={{ height: 1, width: 1 }}>

          <Box sx={{ p: 2, flexShrink: 1, height: 1, display: 'flex', alignItems: 'start', justifyContent: 'start' }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleLeftDrawerOpen}
              edge="start"
              sx={[
                {
                  mr: 2,
                },
                openLeftDrawer && { display: 'none' },
              ]}
            >
              <ChevronRightIcon />
            </IconButton>
          </Box>

          <SimpleEditor key={currentNoteId} noteId={currentNoteId} />

          {/* Right toggle */}
          <Box sx={{ p: 2, flexShrink: 0, height: 1, display: 'flex', alignItems: 'start' }}>
            <IconButton
              onClick={handleRightDrawerOpen}
              sx={[openRightDrawer && { display: 'none' }]}
            >
              <ChevronLeftIcon />
            </IconButton>
          </Box>
        </Stack>
      </Main>

      <OverviewMapDrawer
        open={openRightDrawer}
        handleDrawerClose={handleRightDrawerClose}
      />
    </>
  );
}