import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  increment,
} from 'firebase/firestore'
import { User } from 'firebase/auth'
import { db } from '@/lib/firebase'

export async function createUserIfNotExists(user: User): Promise<void> {
  try {
    const ref = doc(db, 'users', user.uid)
    const snap = await getDoc(ref)
    if (!snap.exists()) {
      await setDoc(ref, {
        email: user.email,
        name: user.displayName ?? null,
        requestCount: 0,
        isPaid: false,
        createdAt: serverTimestamp(),
      })
    }
  } catch (err) {
    console.error('[userService] createUserIfNotExists:', err)
  }
}

export async function incrementRequestCount(userId: string): Promise<void> {
  try {
    const ref = doc(db, 'users', userId)
    await updateDoc(ref, { requestCount: increment(1) })
  } catch (err) {
    console.error('[userService] incrementRequestCount:', err)
  }
}

export async function markAsPaid(userId: string): Promise<void> {
  try {
    const ref = doc(db, 'users', userId)
    await updateDoc(ref, {
      isPaid: true,
      paymentDate: serverTimestamp(),
    })
  } catch (err) {
    console.error('[userService] markAsPaid:', err)
  }
}

export async function getUserData(userId: string) {
  try {
    const ref = doc(db, 'users', userId)
    const snap = await getDoc(ref)
    return snap.exists() ? snap.data() : null
  } catch (err) {
    console.error('[userService] getUserData:', err)
    return null
  }
}
