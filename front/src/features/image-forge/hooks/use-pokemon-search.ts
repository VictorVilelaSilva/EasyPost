import { useEffect, useState } from "react";

import { API_URL } from "../constants";
import type { PokemonListResponse, PokemonSummary } from "../types";

export function usePokemonSearch(enabled: boolean) {
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState<PokemonSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    const timeout = window.setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({ limit: "12" });
        const trimmedSearch = search.trim();
        if (trimmedSearch) params.set("search", trimmedSearch);

        const response = await fetch(`${API_URL}/pokemon?${params.toString()}`);
        if (!response.ok) throw new Error("Falha ao buscar Pokémon");

        const data = (await response.json()) as PokemonListResponse;
        if (!cancelled) setOptions(data.results);
      } catch {
        if (!cancelled) {
          setOptions([]);
          setError("Não foi possível carregar a lista de Pokémon.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [enabled, search]);

  return { error, loading, options, search, setSearch };
}
