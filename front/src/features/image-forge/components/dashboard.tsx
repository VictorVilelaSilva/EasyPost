import { ChevronRight, ImageIcon, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { recentGenerations } from "../constants";
import { PrimaryButton } from "./common";

export function Dashboard({ onCreate }: { onCreate: () => void }) {
  return (
    <section className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8 lg:py-10">
      <div className="space-y-8">
        <div className="flex flex-col justify-between gap-5 border-b border-[#2a2a2a] pb-7 sm:flex-row sm:items-end">
          <div>
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
          <div className="grid gap-4 md:grid-cols-3">
            {recentGenerations.map((item, index) => (
              <Card
                key={item.title}
                className="group rounded-lg border border-[#2a2a2a] bg-[#101010] p-3 transition hover:border-[#555] hover:bg-[#181818]"
              >
                <div className="aspect-square rounded-md border border-[#2a2a2a] bg-[linear-gradient(135deg,#111,#1d1d1d_45%,#090909)] p-3">
                  <div className="flex h-full items-end justify-between">
                    <ImageIcon className="size-5 text-[#a3a3a3]" aria-hidden="true" />
                    <span className="text-xs text-[#a3a3a3]">0{index + 1}</span>
                  </div>
                </div>
                <h3 className="mt-3 text-sm font-semibold">{item.title}</h3>
                <p className="mt-1 text-xs text-[#a3a3a3]">{item.meta}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <Card className="rounded-lg border border-[#2a2a2a] bg-[#101010] p-5">
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
