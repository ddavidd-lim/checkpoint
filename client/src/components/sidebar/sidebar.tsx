import { deleteNote } from "@/repositories/notes";
import { supabase } from "@/services/supabase";
import type { Note } from "@/types/db";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import MuiDrawer, { drawerClasses } from '@mui/material/Drawer';
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import MenuContent from "./MenuContent";

const drawerWidth = 240;

const Drawer = styled(MuiDrawer)({
  width: drawerWidth,
  flexShrink: 0,
  boxSizing: 'border-box',
  [`& .${drawerClasses.paper}`]: {
    width: drawerWidth,
    boxSizing: 'border-box',
  },
});

type Props = {
  handleSelectCurrentNoteId: (noteId: string) => void;
  currentNoteId: string;
}

export default function Sidebar({ handleSelectCurrentNoteId, currentNoteId }: Props) {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuNoteId, setMenuNoteId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

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

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>, noteId: string) => {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
    setMenuNoteId(noteId);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuNoteId(null);
  };

  const deleteMutation = useMutation({
    mutationFn: deleteNote,

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['notes'] });
      const previous = queryClient.getQueryData(['notes']);
      queryClient.setQueryData(['notes'], (old: Note[]) =>
        old?.filter((n) => n.id !== id)
      );
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
    },
  });

  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: 'none', md: 'block' },
        [`& .${drawerClasses.paper}`]: {
          backgroundColor: 'background.paper',
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
        }}
      >
        <Typography variant="h6">
          Waypoint
        </Typography>
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
          hoveredId={hoveredId}
          setHoveredId={setHoveredId}
          menuNoteId={menuNoteId}
          onMenuOpen={handleMenuOpen}
        />
      </Box>

      {/* Ellipsis context menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem
          onClick={() => menuNoteId && deleteMutation.mutate(menuNoteId)}
          sx={{ color: 'error.main' }}
        >
          Delete
        </MenuItem>
      </Menu>

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
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {/* anon@email.com */}
          </Typography>
        </Box>
      </Stack>
    </Drawer>
  );
}