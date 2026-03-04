'use client'

import { useEffect, useState } from 'react'
import { doc, onSnapshot, DocumentData } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'

export function useUserData() {
  const { user } = useAuth()
  const [userData, setUserData] = useState<DocumentData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setUserData(null)
      setLoading(false)
      return
    }

    const ref = doc(db, 'users', user.uid)
    const unsubscribe = onSnapshot(
      ref,
      snap => {
        setUserData(snap.exists() ? snap.data() : null)
        setLoading(false)
      },
      err => {
        console.error('[useUserData] onSnapshot:', err)
        setLoading(false)
      },
    )

    return unsubscribe
  }, [user])

  return { userData, loading }
}
