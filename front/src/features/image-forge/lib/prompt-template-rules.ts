import type { PromptTemplate } from "../types";

const personalCharacteristicsTemplates = new Set<PromptTemplate>([
  "anime-general",
  "avatar",
  "bleach",
  "couple",
  "monster_high",
  "rick_morty",
]);

export function needsPersonalCharacteristics(template: PromptTemplate) {
  return personalCharacteristicsTemplates.has(template);
}

export function needsCoupleReferences(template: PromptTemplate) {
  return template === "couple";
}
