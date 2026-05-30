import { auth } from "@/lib/firebase";

import { API_URL } from "@/features/image-forge/constants";

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
  void userId;

  const token = await auth.currentUser?.getIdToken();
  if (!token) {
    throw new Error("Sessão expirada. Faça login novamente.");
  }

  const response = await fetch(`${API_URL}/generations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      image_base64: imageBase64,
      mime_type: mimeType,
      universe_label: universeLabel,
      format,
    }),
  });

  if (!response.ok) throw new Error(await responseErrorMessage(response));
}

export async function fetchRecentGenerations(
  userId: string,
  count = 3,
): Promise<RecentGeneration[]> {
  void userId;

  const token = await auth.currentUser?.getIdToken();
  if (!token) return [];

  const params = new URLSearchParams({ limit: String(count) });
  const response = await fetch(`${API_URL}/generations/recent?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) throw new Error(await responseErrorMessage(response));

  const payload = (await response.json()) as {
    generations: {
      id: string;
      universe_label: string;
      format: string;
      image_url: string;
      created_at: string;
    }[];
  };

  return payload.generations.map((item) => ({
    id: item.id,
    universeLabel: item.universe_label,
    format: item.format,
    imageUrl: item.image_url,
    createdAt: new Date(item.created_at),
  }));
}

async function responseErrorMessage(response: Response) {
  try {
    const payload = (await response.json()) as { detail?: unknown };
    if (typeof payload.detail === "string") return payload.detail;
  } catch {
    // Fall back to status text below.
  }

  return `Falha ao salvar geração (${response.status})`;
}
