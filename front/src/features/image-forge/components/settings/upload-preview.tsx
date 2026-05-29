import { useEffect, useMemo } from "react";

export function UploadPreview({ alt, file }: { alt: string; file: File | null }) {
  const src = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  useEffect(() => {
    return () => {
      if (src) URL.revokeObjectURL(src);
    };
  }, [src]);

  if (!src) {
    return (
      <div className="grid aspect-[4/3] w-full place-items-center rounded-md border border-[#2a2a2a] bg-[#181818] text-xs text-[#737373]">
        Preview
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className="aspect-[4/3] w-full rounded-md border border-[#2a2a2a] bg-[#181818] object-cover"
    />
  );
}
