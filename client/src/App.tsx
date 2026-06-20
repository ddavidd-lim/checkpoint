import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';
import { useEffect } from 'react';
import { initAuth } from './repositories/users';
import { supabase } from './clients/supabase';

export default function App() {

  useEffect(() => {
    initAuth();
    console.log('Auth initialized');

    const hi = async () => {
      const user = await supabase.auth.getUser()
      console.log('Current user:', user)
    }

    hi();
  }, []);

  return <SimpleEditor />
}