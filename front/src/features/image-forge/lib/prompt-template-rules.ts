import type { PromptTemplate } from "../types";

const noBackgroundTemplates = new Set<PromptTemplate>(["lego"]);

export function hasBackground(template: PromptTemplate) {
  return !noBackgroundTemplates.has(template);
}

export function hasBadges(template: PromptTemplate) {
  return template === "pokemon";
}
