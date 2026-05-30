import { ChevronRight, ImageIcon, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";

import {
  formatGenerationMeta,
  useRecentGenerations,
} from "../hooks/use-recent-generations";
import { PrimaryButton } from "./common";

export function Dashboard({ onCreate }: { onCreate: () => void }) {
  const { user } = useAuth();
  const { generations, loading } = useRecentGenerations(user?.uid ?? null);
  return (
    <section className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 sm:py-8 xl:grid-cols-[minmax(0,1fr)_360px] xl:gap-8 xl:px-8 xl:py-10">
      <div className="min-w-0 space-y-8">
        <div className="flex flex-col justify-between gap-5 border-b border-[#2a2a2a] pb-7 sm:flex-row sm:items-end">
          <div className="min-w-0">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#a3a3a3]">
              Estúdio de geração
            </p>
            <h1 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
              Suas gerações
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#a3a3a3]">
              Crie imagens estilizadas a partir de um rosto, escolha um universo visual e ajuste o
              formato antes de gerar.
            </p>
          </div>
          <PrimaryButton onClick={onCreate}>
            Gerar imagens
            <ChevronRight className="size-4" aria-hidden="true" />
          </PrimaryButton>
        </div>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold">Recentes</h2>
            <Button type="button" variant="ghost" className="text-sm text-[#a3a3a3] hover:text-[#f5f5f5]">
              Ver tudo
            </Button>
          </div>

          {loading && (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="min-w-0 rounded-lg border border-[#2a2a2a] bg-[#101010] p-3 animate-pulse"
                >
                  <div className="aspect-square rounded-md bg-[#181818]" />
                  <div className="mt-3 h-3 w-3/4 rounded bg-[#1d1d1d]" />
                  <div className="mt-2 h-2 w-1/2 rounded bg-[#1d1d1d]" />
                </div>
              ))}
            </div>
          )}

          {!loading && generations.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[#2a2a2a] py-14 text-center">
              <ImageIcon className="mb-3 size-8 text-[#3a3a3a]" aria-hidden="true" />
              <p className="text-sm font-medium text-[#a3a3a3]">Nenhuma geração ainda</p>
              <p className="mt-1 text-xs text-[#555]">Crie sua primeira imagem para vê-la aqui.</p>
            </div>
          )}

          {!loading && generations.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {generations.map((item, index) => (
                <Card
                  key={item.id}
                  className="group min-w-0 rounded-lg border border-[#2a2a2a] bg-[#101010] p-3 transition hover:border-[#555] hover:bg-[#181818]"
                >
                  <div className="aspect-square rounded-md border border-[#2a2a2a] bg-[linear-gradient(135deg,#111,#1d1d1d_45%,#090909)] p-3">
                    <div className="flex h-full flex-col justify-between gap-3">
                      <div className="flex items-start justify-between gap-2">
                        <ImageIcon className="size-5 text-[#a3a3a3]" aria-hidden="true" />
                        <span className="text-xs text-[#a3a3a3]">0{index + 1}</span>
                      </div>
                      <div className="flex flex-1 items-center justify-center overflow-hidden rounded-md border border-[#2a2a2a] bg-[#0e0e0e]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.imageUrl}
                          alt=""
                          className="block h-full w-full object-cover object-center"
                        />
                      </div>
                    </div>
                  </div>
                  <h3 className="mt-3 truncate text-sm font-semibold">{item.universeLabel}</h3>
                  <p className="mt-1 truncate text-xs text-[#a3a3a3]">{formatGenerationMeta(item)}</p>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <Card className="rounded-lg border border-[#2a2a2a] bg-[#101010] p-4 sm:p-5">
        <div className="flex size-10 items-center justify-center rounded-lg border border-[#2a2a2a] bg-[#181818]">
          <Sparkles className="size-5" aria-hidden="true" />
        </div>
        <h2 className="mt-5 text-lg font-semibold">Nenhuma fila ativa</h2>
        <p className="mt-2 text-sm leading-6 text-[#a3a3a3]">
          Quando uma geração estiver em andamento, o progresso e a prévia vão aparecer aqui.
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={onCreate}
          className="mt-6 w-full rounded-lg border border-[#2a2a2a] px-4 py-3 text-sm font-semibold transition hover:bg-[#181818]"
        >
          Iniciar nova imagem
        </Button>
      </Card>
    </section>
  );
}
