import { supabase } from "@/clients/supabase";
import type { JSONContent } from "@tiptap/core";

export const saveNote = async (content: JSONContent, noteId: string) => {
  await supabase
    .from('notes')
    .update({ content })
    .eq('id', noteId);
};

// Fetch list of notes belonging to user
export const fetchNotes = async () => {
  const { data: notes } = await supabase.from('notes').select('*');
  return notes;
}

// Fetch single note by id

// Create new note

// Delete note by id