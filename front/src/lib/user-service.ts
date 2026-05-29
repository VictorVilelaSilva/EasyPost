import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import type { User } from "firebase/auth";

import { db } from "./firebase";

export async function createUserIfNotExists(user: User): Promise<void> {
  try {
    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        email: user.email,
        name: user.displayName ?? null,
        createdAt: serverTimestamp(),
      });
    }
  } catch (err) {
    console.error("[user-service] createUserIfNotExists:", err);
  }
}
