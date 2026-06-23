import { supabase } from "@/services/supabase"
import { useQuery } from "@tanstack/react-query"

export function useUser() {
  return useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data, error } = await supabase.auth.getUser()

      if (error) throw error
      return data.user
    },
    staleTime: Infinity,
  })
}