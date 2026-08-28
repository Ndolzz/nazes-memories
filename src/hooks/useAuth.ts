import { useEffect, useState } from 'react'
import { AuthService } from '@/services/AuthService'
import type { User } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    AuthService.getUser().then((u) => {
      if (mounted) {
        setUser(u)
        setLoading(false)
      }
    })
    const unsubscribe = AuthService.onAuthStateChange((session) => {
      setUser(session?.user ?? null)
    })
    return () => {
      mounted = false
      unsubscribe()
    }
  }, [])

  return { user, isAdmin: AuthService.isAdmin(user), loading }
}
