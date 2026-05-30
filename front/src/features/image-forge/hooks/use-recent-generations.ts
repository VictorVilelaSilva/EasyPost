import { useEffect, useState } from "react";

import { fetchRecentGenerations, type RecentGeneration } from "@/lib/generation-service";

// null = not yet fetched; [] = fetched but empty; [...] = has results
export function useRecentGenerations(userId: string | null) {
  const [state, setState] = useState<{
    generations: RecentGeneration[];
    userId: string | null;
  }>({ generations: [], userId: null });

  useEffect(() => {
    if (!userId) return;

    let ignore = false;
    fetchRecentGenerations(userId)
      .then((items) => {
        if (!ignore) setState({ generations: items, userId });
      })
      .catch(() => {
        if (!ignore) setState({ generations: [], userId });
      });

    return () => {
      ignore = true;
    };
  }, [userId]);

  if (!userId) {
    return { generations: [], loading: false };
  }

  return {
    generations: state.userId === userId ? state.generations : [],
    loading: state.userId !== userId,
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
