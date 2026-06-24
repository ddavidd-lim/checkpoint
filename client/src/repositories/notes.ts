import { supabase } from "@/services/supabase";
import type { JSONContent } from "@tiptap/core";
import content from '../components/tiptap-templates/simple/data/content.json';

export const saveNote = async (title: string, content: JSONContent, noteId: string) => {
  await supabase
    .from('notes')
    .update({ content, title })
    .eq('id', noteId);
};

// Fetch list of notes belonging to user
export const fetchNotes = async () => {
  const { data: notes } = await supabase.from('notes').select('*');
  return notes;
}

// Fetch single note by id

// Create new note
export const createNote = async (title: string, userId: string) => {
  const result = await supabase.from('notes').insert({
    title: title,
    user_id: userId,
    content: content as JSONContent
  }).select().single();

  return result;
}
// Delete note by id
export const deleteNote = async (noteId: string) => {
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', noteId);

  if (error) {
    console.log(`Error deleting note: ${error}`);
    throw error;
  }
}