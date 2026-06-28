import { useUser } from "@/hooks/useUser";
import { createNote, deleteNote } from "@/repositories/notes";
import { supabase } from "@/services/supabase";
import type { Note } from "@/types/db";
import AddIcon from '@mui/icons-material/Add';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import MuiDrawer, { drawerClasses } from '@mui/material/Drawer';
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import { styled, useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { useCallback, useState } from "react";
import MenuContent from "./MenuContent";
import { LEFT_DRAWER_WIDTH } from "@/constants.ts/drawerWidth";

const Drawer = styled(MuiDrawer)({
  width: LEFT_DRAWER_WIDTH,
  flexShrink: 0,
  boxSizing: 'border-box',
  [`& .${drawerClasses.paper}`]: {
    width: LEFT_DRAWER_WIDTH,
    boxSizing: 'border-box',
  },
});

type Props = {
  handleSelectCurrentNoteId: (noteId: string) => void;
  currentNoteId: string;
  handleDrawerClose: () => void;
  open: boolean;

}

export default function Sidebar({ handleSelectCurrentNoteId, currentNoteId, handleDrawerClose, open }: Props) {

  const theme = useTheme();
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuNoteId, setMenuNoteId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data: notes = [] } = useQuery<Note[]>({
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

  const handleMenuOpen = useCallback((e: React.MouseEvent<HTMLElement>, noteId: string) => {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
    setMenuNoteId(noteId);
  }, []);

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const deleteMutation = useMutation({
    mutationFn: deleteNote,

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['notes'] });
      const previous = queryClient.getQueryData(['notes']);

      return { previous };
    },

    onError: (_err, _id, context) => {
      queryClient.setQueryData(['notes'], context?.previous);
    },

    onSuccess: () => {
      const updatedNotes: Note[] = queryClient.getQueryData(['notes']) ?? [];
      if (currentNoteId === menuNoteId && updatedNotes.length > 0) {
        handleSelectCurrentNoteId(updatedNotes[updatedNotes.length - 1].id);
      }
      handleMenuClose();
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      enqueueSnackbar(`Deleted note ${menuNoteId}`)
    },
  });

  const { data: user } = useUser();
  const createMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('No user');
      const { data, error } = await createNote('', user.id);
      if (error) throw error;
      return data;
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['notes'], refetchType: 'all' });
      handleSelectCurrentNoteId(data.id);
    },
    onError: (error) => {
      console.log(`Failed to create note: ${error}`);
    },
  });

  return (
    <Drawer
      variant="persistent"
      open={open}
      sx={{
        width: LEFT_DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: LEFT_DRAWER_WIDTH,
          boxSizing: 'border-box',
        },
      }}
    >
      <Stack
        direction="row"
        sx={{
          p: 2,
          gap: 1,
          alignItems: 'center',
          borderBottom: '1px solid',
          borderColor: 'divider',
          justifyContent: 'space-between'
        }}
      >
        <Box>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            Waypoint
          </Typography>
        </Box>
        <Box>
          <IconButton onClick={() => createMutation.mutateAsync()} >
            <AddIcon />
          </IconButton>

          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </Box>
      </Stack>

      <Box
        sx={{
          overflow: 'auto',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <MenuContent
          notes={notes}
          handleSelectCurrentNoteId={handleSelectCurrentNoteId}
          currentNoteId={currentNoteId}
          onMenuOpen={handleMenuOpen}
        />
      </Box>

      {/* Ellipsis context menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1.5,
              '& .MuiAvatar-root': {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              '&::before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
            },
          },
        }}
      >
        <Typography variant="subtitle2" sx={{ fontSize: 10, color: 'lightgray', px: 2 }}>
          {menuNoteId}
        </Typography>
        <MenuItem
          onClick={() => menuNoteId && deleteMutation.mutate(menuNoteId)}
          sx={{ color: 'error.main' }}
        >
          Delete
        </MenuItem>
      </Menu>

      {/* Profile */}
      <Stack
        direction="row"
        sx={{
          p: 2,
          gap: 1,
          alignItems: 'center',
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Avatar
          sizes="small"
          alt="Wavid Wim"
          src="/cockatoo2.jpg"
          sx={{ width: 36, height: 36 }}
        />
        <Box sx={{ mr: 'auto' }}>
          <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: '16px' }}>
            Anonymous Cockatoo
          </Typography>
          <Typography variant="caption" sx={{ fontSize: 8, color: 'text.secondary' }}>
            {/* anon@email.com */}
            {user?.id}
          </Typography>
        </Box>
      </Stack>
    </Drawer>
  );
}