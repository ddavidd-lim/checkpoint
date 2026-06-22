import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';

import { initAuth } from '@/repositories/users';
import { supabase } from '@/services/supabase';
import {
  useMutation,
  useQuery,
  useQueryClient
} from '@tanstack/react-query';

const drawerWidth = 240;

export default function Notes() {
  const [currentNoteId, setCurrentNoteId] = useState<string>();

  const queryClient = useQueryClient();

  const { data: noteIds } = useQuery({
    queryKey: ['notes', currentNoteId],
    queryFn: async () => {
      const { data } = await supabase.from('notes').select('id').order("created_at", { ascending: true});

      console.log(data)
      if (data) {
        console.log(`Found ${data.length} notes`)

        const notes = data.map(note => note.id);
        if (!currentNoteId) {
          setCurrentNoteId(notes[0])
        }
        return notes;
      }

      return [];
    }
  })

  const mutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error) throw error;

      const userId = data.user?.id;

      if (!userId) return;

      const { error: insertError } = await supabase.from('notes').insert({
        user_id: userId,
      });

      if (insertError) {
        console.log(`Error creating note: ${insertError}`)
      }
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: ['notes'],
        refetchType: 'all'
      })
    }
  })


  useEffect(() => {
    initAuth();
    const hi = async () => {
      const user = await supabase.auth.getUser();
      console.log('Current user:', user);
    };
    hi();
  }, []);



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
        <Typography variant='subtitle1'>
          Current: {currentNoteId}
        </Typography>
        <Box sx={{
          display: 'flex',
          flexGrow: 1,
          justifyContent: 'space-between',
          flexDirection: 'column',
        }}>
          <List>
            {noteIds && noteIds.map(noteId => (
              <ListItemButton
                selected={noteId === currentNoteId}
                onClick={() => setCurrentNoteId(noteId)}>
                {noteId}
              </ListItemButton>
            ))}
          </List>
          <Button onClick={() => mutation.mutateAsync()}>
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