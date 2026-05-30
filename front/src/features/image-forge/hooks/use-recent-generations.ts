import { useEffect, useState } from "react";

import { fetchRecentGenerations, type RecentGeneration } from "@/lib/generation-service";

// null = not yet fetched; [] = fetched but empty; [...] = has results
export function useRecentGenerations(userId: string | null) {
  const [generations, setGenerations] = useState<RecentGeneration[] | null>(null);

  useEffect(() => {
    if (!userId) return;
    fetchRecentGenerations(userId)
      .then(setGenerations)
      .catch(console.error);
  }, [userId]);

  return {
    generations: generations ?? [],
    loading: !!userId && generations === null,
  };
}

export function formatGenerationMeta(gen: RecentGeneration): string {
  return `${gen.universeLabel} · ${gen.format} · ${relativeDate(gen.createdAt)}`;
}

function relativeDate(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "hoje";
  if (diffDays === 1) return "ontem";
  return date.toLocaleDateString("pt-BR", { day: "numeric", month: "short" });
}
