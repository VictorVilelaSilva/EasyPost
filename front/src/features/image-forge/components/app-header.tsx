"use client";

import { LogOut, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";

import type { Step } from "../types";

export function AppHeader({ step }: { step: Step }) {
  const { user, logout } = useAuth();
  const current = {
    dashboard: "Dashboard",
    universe: "Escolha",
    settings: "Configuração",
    preview: "Preview",
  }[step];

  return (
    <header className="sticky top-0 z-20 border-b border-[#2a2a2a] bg-[#050505]/90 backdrop-blur">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-[#2a2a2a] bg-[#101010]">
            <Wand2 className="size-4" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">ImageForge IA</p>
            <p className="text-xs text-[#a3a3a3]">{current}</p>
          </div>
        </div>

        <nav className="hidden items-center gap-1 rounded-lg border border-[#2a2a2a] bg-[#101010] p-1 text-sm text-[#a3a3a3] md:flex">
          {["Dashboard", "Universo", "Configuração", "Preview"].map((item) => (
            <span
              key={item}
              className={`rounded-md px-3 py-1.5 ${item === current || (item === "Universo" && current === "Escolha") ? "bg-[#181818] text-[#f5f5f5]" : ""}`}
            >
              {item}
            </span>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          <span className="hidden max-w-[12rem] truncate text-sm text-[#a3a3a3] sm:inline">
            {user?.displayName ?? user?.email ?? ""}
          </span>
          <Button
            type="button"
            variant="outline"
            onClick={() => void logout()}
            className="flex items-center gap-2 rounded-lg border border-[#2a2a2a] px-3 py-2 text-sm text-[#a3a3a3] transition hover:bg-[#181818] hover:text-[#f5f5f5]"
          >
            <LogOut className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Sair</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
