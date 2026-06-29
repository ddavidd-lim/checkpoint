/* eslint-disable react-hooks/exhaustive-deps */
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';
import { useCallback, useEffect, useRef, useState } from 'react';

import Drawer from '@/components/drawer';
import OverviewMapDrawer from '@/components/drawer/OverviewMapDrawer';
import { LEFT_DRAWER_WIDTH, RIGHT_DRAWER_WIDTH } from '@/constants.ts/drawerWidth';
import { useUser } from '@/hooks/useUser';
import { createNote } from '@/repositories/notes';
import { initAuth } from '@/repositories/users';
import { supabase } from '@/services/supabase';
import type { Note } from '@/types/db';
import type { Place } from '@/types/places';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import { styled, useTheme } from '@mui/material/styles';
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import welcomeContent from '../components/tiptap-templates/simple/data/welcome-content.json';
import useMediaQuery from '@mui/material/useMediaQuery';



const Main = styled('main', {
  shouldForwardProp: (prop) => prop !== 'openLeft' && prop !== 'openRight'
})<{
  openLeft?: boolean;
  openRight?: boolean;
}>(({ theme }) => ({
  flexGrow: 1,
  overflow: 'hidden',
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${LEFT_DRAWER_WIDTH}px`,
  marginRight: `-${RIGHT_DRAWER_WIDTH}px`,
  [theme.breakpoints.down('sm')]: {
    marginLeft: 0,
    marginRight: 0,
  },
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
  const queryClient = useQueryClient();
  const { data: user } = useUser();

  const isCreating = useRef(false);
  const [selectedNoteId, setSelectedNoteId] = useState<string>();
  const [places, setPlaces] = useState<Place[]>([]);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
      const { data, error } = await createNote('👋 Welcome to Waypoint', user.id, welcomeContent);
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
  const [openLeftDrawer, setOpenLeftDrawer] = useState(isMobile ? false : true);

  const handleLeftDrawerOpen = () => {
    setOpenLeftDrawer(true);
  };

  const handleLeftDrawerClose = () => {
    setOpenLeftDrawer(false);
  };

  // Right Drawer State
  const [openRightDrawer, setOpenRightDrawer] = useState(false);

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

          <IconButton
            color="inherit"
            onClick={handleLeftDrawerOpen}
            sx={{
              position: 'absolute',
              left: { xs: 0, sm: 8 },
              top: { xs: '50%', sm: 50 },
              zIndex: 1300,
              opacity: openLeftDrawer ? 0 : 1,
              pointerEvents: openLeftDrawer ? 'none' : 'auto',
              transition: 'opacity 225ms cubic-bezier(0.0, 0, 0.2, 1)',
              transitionDelay: openLeftDrawer ? '0ms' : '225ms',
            }}
          >
            <ChevronRightIcon />
          </IconButton>

          <SimpleEditor key={currentNoteId} noteId={currentNoteId} setPlaces={setPlaces} />

          <IconButton
            onClick={handleRightDrawerOpen}
            sx={{
              position: 'absolute',
              right: { xs: 0, sm: 8 },
              top: { xs: '50%', sm: 50 },
              zIndex: 1300,
              opacity: openRightDrawer ? 0 : 1,
              pointerEvents: openRightDrawer ? 'none' : 'auto',
              transition: 'opacity 225ms cubic-bezier(0.0, 0, 0.2, 1)',
              transitionDelay: openRightDrawer ? '0ms' : '225ms',
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
        </Stack>
      </Main>

      <OverviewMapDrawer
        places={places}
        open={openRightDrawer}
        handleDrawerClose={handleRightDrawerClose}
      />
    </>
  );
}