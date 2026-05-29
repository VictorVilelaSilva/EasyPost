import type { DragEvent } from "react";

export function imageFilesFromDrop(event: DragEvent<HTMLElement>) {
  event.preventDefault();
  return Array.from(event.dataTransfer.files).filter((file) => file.type.startsWith("image/"));
}

export function allowImageDrop(event: DragEvent<HTMLElement>) {
  event.preventDefault();
  event.dataTransfer.dropEffect = "copy";
}
