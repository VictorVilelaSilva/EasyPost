"use client";

import { Loader2 } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { LoginScreen } from "./login-screen";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505] text-[#f5f5f5]">
        <Loader2 className="size-6 animate-spin" aria-hidden="true" />
      </main>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return <>{children}</>;
}
