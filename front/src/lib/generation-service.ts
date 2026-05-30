import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

import { db, storage } from "./firebase";

export type RecentGeneration = {
  id: string;
  universeLabel: string;
  format: string;
  imageUrl: string;
  createdAt: Date;
};

export async function saveGeneration({
  userId,
  imageBase64,
  mimeType,
  universeLabel,
  format,
}: {
  userId: string;
  imageBase64: string;
  mimeType: string;
  universeLabel: string;
  format: string;
}): Promise<void> {
  const imageId = `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const storageRef = ref(storage, `generations/${userId}/${imageId}`);
  const blob = base64ToBlob(imageBase64, mimeType);
  await uploadBytes(storageRef, blob, { contentType: mimeType });
  const imageUrl = await getDownloadURL(storageRef);

  await addDoc(collection(db, "generations"), {
    userId,
    universeLabel,
    format,
    imageUrl,
    createdAt: Timestamp.now(),
  });
}

export async function fetchRecentGenerations(
  userId: string,
  count = 3,
): Promise<RecentGeneration[]> {
  const q = query(
    collection(db, "generations"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(count),
  );
  const snap = await getDocs(q);
  return snap.docs.map((docSnap) => {
    const data = docSnap.data() as {
      universeLabel: string;
      format: string;
      imageUrl: string;
      createdAt: Timestamp;
    };
    return {
      id: docSnap.id,
      universeLabel: data.universeLabel,
      format: data.format,
      imageUrl: data.imageUrl,
      createdAt: data.createdAt.toDate(),
    };
  });
}

function base64ToBlob(base64: string, mimeType: string): Blob {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mimeType });
}
