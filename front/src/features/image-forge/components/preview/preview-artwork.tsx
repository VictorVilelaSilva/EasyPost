import { BadgeCheck, Sparkles, TriangleAlert } from "lucide-react";

import type { ImageGenerationResult, UniverseOption } from "../../types";

export function PreviewArtwork({
  badgesEnabled,
  error,
  image,
  loading,
  selectedUniverse,
}: {
  badgesEnabled: boolean;
  error: string | null;
  image: ImageGenerationResult | null;
  loading: boolean;
  selectedUniverse: UniverseOption;
}) {
  if (image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`data:${image.mime_type};base64,${image.image_base64}`}
        alt="Imagem gerada"
        className="block h-auto w-full max-w-full rounded-md object-contain object-center shadow-2xl shadow-black/50"
      />
    );
  }

  return (
    <div className="flex h-full flex-col justify-between rounded-md border border-white/10 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.16),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.10),rgba(0,0,0,0.35))] p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <span className="min-w-0 truncate rounded-md bg-black/40 px-3 py-1 text-xs font-semibold text-white/80">
          {selectedUniverse.label}
        </span>
        {badgesEnabled && (
          <span className="flex size-9 items-center justify-center rounded-full bg-white text-[#050505]">
            <BadgeCheck className="size-5" aria-hidden="true" />
          </span>
        )}
      </div>
      <div>
        <PreviewStatusIcon error={error} loading={loading} />
        <h2 className="text-2xl font-semibold">
          {loading ? "Gerando..." : error ? "Falha na geração" : "Aguardando resultado"}
        </h2>
        <p className="mt-2 text-sm text-white/65">
          {loading
            ? "A OpenAI está processando a foto e o prompt."
            : error ?? "O resultado aparecerá aqui quando a geração terminar."}
        </p>
      </div>
    </div>
  );
}

function PreviewStatusIcon({ error, loading }: { error: string | null; loading: boolean }) {
  if (loading) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src="/Sparkles_Loop_Loader.svg"
        alt=""
        aria-hidden="true"
        className="mb-4 size-16"
      />
    );
  }

  if (error) {
    return <TriangleAlert className="mb-4 size-12 text-[#ffb4ab]" aria-hidden="true" />;
  }

  return <Sparkles className="mb-4 size-12 text-white/70" aria-hidden="true" />;
}
