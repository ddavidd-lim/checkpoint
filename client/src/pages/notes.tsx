import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';
import Box from '@mui/material/Box';
import { useEffect, useState } from 'react';

import { createNote } from '@/repositories/notes';
import { initAuth } from '@/repositories/users';
import { supabase } from '@/services/supabase';
import type { Note } from '@/types/db';
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useUser } from '@/hooks/useUser';
import Sidebar from '@/components/sidebar/Sidebar';

export default function Notes() {
  const [selectedNoteId, setSelectedNoteId] = useState<string>();

  const queryClient = useQueryClient();
  const { data: user } = useUser();

  const handleSelectCurrentNoteId = (noteId: string) => {
    setSelectedNoteId(noteId);
  };

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
    const hi = async () => {
      const user = await supabase.auth.getUser();
      console.log('Current user:', user);
    };
    hi();
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    if (!isSuccess) return;
    if (notes.length > 0) return;
    createMutation.mutate();
  }, [user?.id, isSuccess, notes?.length, createMutation]);

  return (
    <>
      <Sidebar
        currentNoteId={currentNoteId ?? ''}
        handleSelectCurrentNoteId={handleSelectCurrentNoteId}
      />
      <Box sx={{ flex: 1, minWidth: 0, height: '100%', overflow: 'hidden' }}>
        <SimpleEditor key={currentNoteId} noteId={currentNoteId} />
      </Box>
    </>
  );
}