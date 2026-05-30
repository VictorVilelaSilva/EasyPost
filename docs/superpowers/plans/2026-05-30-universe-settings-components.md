# Universe Settings Components — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-extended-cc:subagent-driven-development (recommended) or superpowers-extended-cc:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir a lógica condicional em `settings-step.tsx` por 13 componentes dedicados — um por universo — usando dispatch via mapa.

**Architecture:** Um tipo compartilhado `UniverseSettingsProps` serve de contrato entre o dispatcher e os 13 componentes. `settings-step.tsx` vira um dispatcher fino que resolve o componente via `UNIVERSE_SETTINGS[selectedUniverse.name]`. Cada universo só renderiza os painéis que precisa.

**Tech Stack:** Next.js 16.2, React 19, TypeScript 5, Tailwind 4. Package manager: `npm`. Type check: `npx tsc --noEmit` (run from `front/`).

**User Verification:** NO

---

## File Map

**Criar:**
- `front/src/features/image-forge/components/settings/universes/universe-settings-props.ts`
- `front/src/features/image-forge/components/settings/universes/pokemon-settings.tsx`
- `front/src/features/image-forge/components/settings/universes/lego-settings.tsx`
- `front/src/features/image-forge/components/settings/universes/casal-settings.tsx`
- `front/src/features/image-forge/components/settings/universes/kimetsu-settings.tsx`
- `front/src/features/image-forge/components/settings/universes/naruto-settings.tsx`
- `front/src/features/image-forge/components/settings/universes/digimon-settings.tsx`
- `front/src/features/image-forge/components/settings/universes/avatar-settings.tsx`
- `front/src/features/image-forge/components/settings/universes/anime-geral-settings.tsx`
- `front/src/features/image-forge/components/settings/universes/bleach-settings.tsx`
- `front/src/features/image-forge/components/settings/universes/monster-high-settings.tsx`
- `front/src/features/image-forge/components/settings/universes/rick-morty-settings.tsx`
- `front/src/features/image-forge/components/settings/universes/copa-settings.tsx`
- `front/src/features/image-forge/components/settings/universes/san-andreas-settings.tsx`

**Modificar:**
- `front/src/features/image-forge/lib/prompt-template-rules.ts`
- `front/src/features/image-forge/components/settings-step.tsx`

**Sem mudança:**
- Todos os painéis em `settings/` (`background-panel`, `face-upload-panel`, etc.)
- `settings/settings-summary.tsx`
- `page.tsx`

---

## Task 1: Tipo compartilhado + atualizar prompt-template-rules

**Goal:** Criar o contrato de props e simplificar as regras de template.

**Files:**
- Create: `front/src/features/image-forge/components/settings/universes/universe-settings-props.ts`
- Modify: `front/src/features/image-forge/lib/prompt-template-rules.ts`

**Acceptance Criteria:**
- [ ] `UniverseSettingsProps` exportado com todas as 15 propriedades
- [ ] `hasBadges` retorna `true` apenas para `"pokemon"`
- [ ] `needsPersonalCharacteristics` e `needsCoupleReferences` removidos
- [ ] `npx tsc --noEmit` passa sem erros

**Verify:** `cd front && npx tsc --noEmit` → sem output (sucesso silencioso)

**Steps:**

- [ ] **Criar `universe-settings-props.ts`**

```ts
// front/src/features/image-forge/components/settings/universes/universe-settings-props.ts
import type { CoupleReferences, Format, PokemonConfig } from "../../../types";

export type UniverseSettingsProps = {
  background: string;
  badgesEnabled: boolean;
  coupleReferences: CoupleReferences;
  format: Format;
  personalCharacteristics: string;
  pokemonConfig: PokemonConfig;
  referenceImage: File | null;
  uploadedName: string;
  onBackgroundChange: (color: string) => void;
  onBadgesChange: (enabled: boolean) => void;
  onCoupleReferencesChange: (refs: CoupleReferences) => void;
  onFileChange: (file: File) => void;
  onFormatChange: (format: Format) => void;
  onPersonalCharacteristicsChange: (value: string) => void;
  onPokemonConfigChange: (config: PokemonConfig) => void;
};
```

- [ ] **Substituir `prompt-template-rules.ts` inteiro**

```ts
// front/src/features/image-forge/lib/prompt-template-rules.ts
import type { PromptTemplate } from "../types";

const noBackgroundTemplates = new Set<PromptTemplate>(["lego"]);

export function hasBackground(template: PromptTemplate) {
  return !noBackgroundTemplates.has(template);
}

export function hasBadges(template: PromptTemplate) {
  return template === "pokemon";
}
```

- [ ] **Verificar tipos**

```bash
cd front && npx tsc --noEmit
```

Esperado: sem erros. Se aparecer erro sobre `needsPersonalCharacteristics` ou `needsCoupleReferences` ainda sendo importados, é porque `settings-step.tsx` ainda usa — será resolvido na Task 7. Erros nessas importações são esperados agora.

- [ ] **Commit**

```bash
git add front/src/features/image-forge/components/settings/universes/universe-settings-props.ts
git add front/src/features/image-forge/lib/prompt-template-rules.ts
git commit -m "feat(settings): tipo compartilhado UniverseSettingsProps + simplificar prompt-template-rules"
```

```json:metadata
{"files": ["front/src/features/image-forge/components/settings/universes/universe-settings-props.ts", "front/src/features/image-forge/lib/prompt-template-rules.ts"], "verifyCommand": "cd front && npx tsc --noEmit", "acceptanceCriteria": ["UniverseSettingsProps exportado com 15 props", "hasBadges retorna true só para pokemon", "needsPersonalCharacteristics e needsCoupleReferences removidos"], "requiresUserVerification": false}
```

---

## Task 2: Componentes únicos — Pokemon, LEGO, Casal

**Goal:** Criar os 3 componentes com layout exclusivo.

**Files:**
- Create: `front/src/features/image-forge/components/settings/universes/pokemon-settings.tsx`
- Create: `front/src/features/image-forge/components/settings/universes/lego-settings.tsx`
- Create: `front/src/features/image-forge/components/settings/universes/casal-settings.tsx`

**Acceptance Criteria:**
- [ ] `PokemonSettings` renderiza: FaceUpload + Background + PokemonPoster + PokemonSelection + GenerationOptions(showBadges=true)
- [ ] `LegoSettings` renderiza: FaceUpload + GenerationOptions(showBadges=false) — sem Background
- [ ] `CasalSettings` renderiza: CoupleReference + PersonalChar + Background + GenerationOptions(showBadges=false)
- [ ] `npx tsc --noEmit` passa

**Verify:** `cd front && npx tsc --noEmit` → sem erros

**Steps:**

- [ ] **Criar `pokemon-settings.tsx`**

```tsx
// front/src/features/image-forge/components/settings/universes/pokemon-settings.tsx
import { BackgroundPanel } from "../background-panel";
import { FaceUploadPanel } from "../face-upload-panel";
import { GenerationOptionsPanel } from "../generation-options-panel";
import { PokemonPosterPanel } from "../pokemon-poster-panel";
import { PokemonSelectionPanel } from "../pokemon-selection-panel";
import type { UniverseSettingsProps } from "./universe-settings-props";

export function PokemonSettings({
  background,
  badgesEnabled,
  format,
  pokemonConfig,
  referenceImage,
  uploadedName,
  onBackgroundChange,
  onBadgesChange,
  onFileChange,
  onFormatChange,
  onPokemonConfigChange,
}: UniverseSettingsProps) {
  return (
    <>
      <FaceUploadPanel file={referenceImage} uploadedName={uploadedName} onFileChange={onFileChange} />
      <BackgroundPanel background={background} onBackgroundChange={onBackgroundChange} />
      <PokemonPosterPanel pokemonConfig={pokemonConfig} onPokemonConfigChange={onPokemonConfigChange} />
      <PokemonSelectionPanel pokemonConfig={pokemonConfig} onPokemonConfigChange={onPokemonConfigChange} />
      <GenerationOptionsPanel
        badgesEnabled={badgesEnabled}
        format={format}
        showBadges={true}
        onBadgesChange={onBadgesChange}
        onFormatChange={onFormatChange}
      />
    </>
  );
}
```

- [ ] **Criar `lego-settings.tsx`**

```tsx
// front/src/features/image-forge/components/settings/universes/lego-settings.tsx
import { FaceUploadPanel } from "../face-upload-panel";
import { GenerationOptionsPanel } from "../generation-options-panel";
import type { UniverseSettingsProps } from "./universe-settings-props";

export function LegoSettings({
  badgesEnabled,
  format,
  referenceImage,
  uploadedName,
  onBadgesChange,
  onFileChange,
  onFormatChange,
}: UniverseSettingsProps) {
  return (
    <>
      <FaceUploadPanel file={referenceImage} uploadedName={uploadedName} onFileChange={onFileChange} />
      <GenerationOptionsPanel
        badgesEnabled={badgesEnabled}
        format={format}
        showBadges={false}
        onBadgesChange={onBadgesChange}
        onFormatChange={onFormatChange}
      />
    </>
  );
}
```

- [ ] **Criar `casal-settings.tsx`**

```tsx
// front/src/features/image-forge/components/settings/universes/casal-settings.tsx
import { BackgroundPanel } from "../background-panel";
import { CoupleReferencePanel } from "../couple-reference-panel";
import { GenerationOptionsPanel } from "../generation-options-panel";
import { PersonalCharacteristicsPanel } from "../personal-characteristics-panel";
import type { UniverseSettingsProps } from "./universe-settings-props";

export function CasalSettings({
  background,
  badgesEnabled,
  coupleReferences,
  format,
  personalCharacteristics,
  onBackgroundChange,
  onBadgesChange,
  onCoupleReferencesChange,
  onFormatChange,
  onPersonalCharacteristicsChange,
}: UniverseSettingsProps) {
  return (
    <>
      <CoupleReferencePanel references={coupleReferences} onChange={onCoupleReferencesChange} />
      <PersonalCharacteristicsPanel value={personalCharacteristics} onChange={onPersonalCharacteristicsChange} />
      <BackgroundPanel background={background} onBackgroundChange={onBackgroundChange} />
      <GenerationOptionsPanel
        badgesEnabled={badgesEnabled}
        format={format}
        showBadges={false}
        onBadgesChange={onBadgesChange}
        onFormatChange={onFormatChange}
      />
    </>
  );
}
```

- [ ] **Verificar tipos**

```bash
cd front && npx tsc --noEmit
```

- [ ] **Commit**

```bash
git add front/src/features/image-forge/components/settings/universes/pokemon-settings.tsx
git add front/src/features/image-forge/components/settings/universes/lego-settings.tsx
git add front/src/features/image-forge/components/settings/universes/casal-settings.tsx
git commit -m "feat(settings): componentes Pokemon, LEGO e Casal"
```

```json:metadata
{"files": ["front/src/features/image-forge/components/settings/universes/pokemon-settings.tsx", "front/src/features/image-forge/components/settings/universes/lego-settings.tsx", "front/src/features/image-forge/components/settings/universes/casal-settings.tsx"], "verifyCommand": "cd front && npx tsc --noEmit", "acceptanceCriteria": ["PokemonSettings tem 5 painéis incluindo insígnias", "LegoSettings não tem Background nem insígnias", "CasalSettings usa CoupleReferencePanel"], "requiresUserVerification": false}
```

---

## Task 3: Componentes com PersonalChar (8 universos)

**Goal:** Criar os 8 componentes com layout FaceUpload + PersonalChar + Background + GenerationOptions.

**Files:**
- Create: `front/src/features/image-forge/components/settings/universes/kimetsu-settings.tsx`
- Create: `front/src/features/image-forge/components/settings/universes/naruto-settings.tsx`
- Create: `front/src/features/image-forge/components/settings/universes/digimon-settings.tsx`
- Create: `front/src/features/image-forge/components/settings/universes/avatar-settings.tsx`
- Create: `front/src/features/image-forge/components/settings/universes/anime-geral-settings.tsx`
- Create: `front/src/features/image-forge/components/settings/universes/bleach-settings.tsx`
- Create: `front/src/features/image-forge/components/settings/universes/monster-high-settings.tsx`
- Create: `front/src/features/image-forge/components/settings/universes/rick-morty-settings.tsx`

**Acceptance Criteria:**
- [ ] Cada componente renderiza: FaceUpload + PersonalChar + Background + GenerationOptions(showBadges=false)
- [ ] Nenhum deles importa lógica de outros universos
- [ ] `npx tsc --noEmit` passa

**Verify:** `cd front && npx tsc --noEmit` → sem erros

**Steps:**

- [ ] **Criar `kimetsu-settings.tsx`**

```tsx
// front/src/features/image-forge/components/settings/universes/kimetsu-settings.tsx
import { BackgroundPanel } from "../background-panel";
import { FaceUploadPanel } from "../face-upload-panel";
import { GenerationOptionsPanel } from "../generation-options-panel";
import { PersonalCharacteristicsPanel } from "../personal-characteristics-panel";
import type { UniverseSettingsProps } from "./universe-settings-props";

export function KimetsuSettings({
  background,
  badgesEnabled,
  format,
  personalCharacteristics,
  referenceImage,
  uploadedName,
  onBackgroundChange,
  onBadgesChange,
  onFileChange,
  onFormatChange,
  onPersonalCharacteristicsChange,
}: UniverseSettingsProps) {
  return (
    <>
      <FaceUploadPanel file={referenceImage} uploadedName={uploadedName} onFileChange={onFileChange} />
      <PersonalCharacteristicsPanel value={personalCharacteristics} onChange={onPersonalCharacteristicsChange} />
      <BackgroundPanel background={background} onBackgroundChange={onBackgroundChange} />
      <GenerationOptionsPanel
        badgesEnabled={badgesEnabled}
        format={format}
        showBadges={false}
        onBadgesChange={onBadgesChange}
        onFormatChange={onFormatChange}
      />
    </>
  );
}
```

- [ ] **Criar `naruto-settings.tsx`** (idêntico ao Kimetsu, exceto o nome da função)

```tsx
// front/src/features/image-forge/components/settings/universes/naruto-settings.tsx
import { BackgroundPanel } from "../background-panel";
import { FaceUploadPanel } from "../face-upload-panel";
import { GenerationOptionsPanel } from "../generation-options-panel";
import { PersonalCharacteristicsPanel } from "../personal-characteristics-panel";
import type { UniverseSettingsProps } from "./universe-settings-props";

export function NarutoSettings({
  background,
  badgesEnabled,
  format,
  personalCharacteristics,
  referenceImage,
  uploadedName,
  onBackgroundChange,
  onBadgesChange,
  onFileChange,
  onFormatChange,
  onPersonalCharacteristicsChange,
}: UniverseSettingsProps) {
  return (
    <>
      <FaceUploadPanel file={referenceImage} uploadedName={uploadedName} onFileChange={onFileChange} />
      <PersonalCharacteristicsPanel value={personalCharacteristics} onChange={onPersonalCharacteristicsChange} />
      <BackgroundPanel background={background} onBackgroundChange={onBackgroundChange} />
      <GenerationOptionsPanel
        badgesEnabled={badgesEnabled}
        format={format}
        showBadges={false}
        onBadgesChange={onBadgesChange}
        onFormatChange={onFormatChange}
      />
    </>
  );
}
```

- [ ] **Criar `digimon-settings.tsx`**

```tsx
// front/src/features/image-forge/components/settings/universes/digimon-settings.tsx
import { BackgroundPanel } from "../background-panel";
import { FaceUploadPanel } from "../face-upload-panel";
import { GenerationOptionsPanel } from "../generation-options-panel";
import { PersonalCharacteristicsPanel } from "../personal-characteristics-panel";
import type { UniverseSettingsProps } from "./universe-settings-props";

export function DigimonSettings({
  background,
  badgesEnabled,
  format,
  personalCharacteristics,
  referenceImage,
  uploadedName,
  onBackgroundChange,
  onBadgesChange,
  onFileChange,
  onFormatChange,
  onPersonalCharacteristicsChange,
}: UniverseSettingsProps) {
  return (
    <>
      <FaceUploadPanel file={referenceImage} uploadedName={uploadedName} onFileChange={onFileChange} />
      <PersonalCharacteristicsPanel value={personalCharacteristics} onChange={onPersonalCharacteristicsChange} />
      <BackgroundPanel background={background} onBackgroundChange={onBackgroundChange} />
      <GenerationOptionsPanel
        badgesEnabled={badgesEnabled}
        format={format}
        showBadges={false}
        onBadgesChange={onBadgesChange}
        onFormatChange={onFormatChange}
      />
    </>
  );
}
```

- [ ] **Criar `avatar-settings.tsx`**

```tsx
// front/src/features/image-forge/components/settings/universes/avatar-settings.tsx
import { BackgroundPanel } from "../background-panel";
import { FaceUploadPanel } from "../face-upload-panel";
import { GenerationOptionsPanel } from "../generation-options-panel";
import { PersonalCharacteristicsPanel } from "../personal-characteristics-panel";
import type { UniverseSettingsProps } from "./universe-settings-props";

export function AvatarSettings({
  background,
  badgesEnabled,
  format,
  personalCharacteristics,
  referenceImage,
  uploadedName,
  onBackgroundChange,
  onBadgesChange,
  onFileChange,
  onFormatChange,
  onPersonalCharacteristicsChange,
}: UniverseSettingsProps) {
  return (
    <>
      <FaceUploadPanel file={referenceImage} uploadedName={uploadedName} onFileChange={onFileChange} />
      <PersonalCharacteristicsPanel value={personalCharacteristics} onChange={onPersonalCharacteristicsChange} />
      <BackgroundPanel background={background} onBackgroundChange={onBackgroundChange} />
      <GenerationOptionsPanel
        badgesEnabled={badgesEnabled}
        format={format}
        showBadges={false}
        onBadgesChange={onBadgesChange}
        onFormatChange={onFormatChange}
      />
    </>
  );
}
```

- [ ] **Criar `anime-geral-settings.tsx`**

```tsx
// front/src/features/image-forge/components/settings/universes/anime-geral-settings.tsx
import { BackgroundPanel } from "../background-panel";
import { FaceUploadPanel } from "../face-upload-panel";
import { GenerationOptionsPanel } from "../generation-options-panel";
import { PersonalCharacteristicsPanel } from "../personal-characteristics-panel";
import type { UniverseSettingsProps } from "./universe-settings-props";

export function AnimeGeralSettings({
  background,
  badgesEnabled,
  format,
  personalCharacteristics,
  referenceImage,
  uploadedName,
  onBackgroundChange,
  onBadgesChange,
  onFileChange,
  onFormatChange,
  onPersonalCharacteristicsChange,
}: UniverseSettingsProps) {
  return (
    <>
      <FaceUploadPanel file={referenceImage} uploadedName={uploadedName} onFileChange={onFileChange} />
      <PersonalCharacteristicsPanel value={personalCharacteristics} onChange={onPersonalCharacteristicsChange} />
      <BackgroundPanel background={background} onBackgroundChange={onBackgroundChange} />
      <GenerationOptionsPanel
        badgesEnabled={badgesEnabled}
        format={format}
        showBadges={false}
        onBadgesChange={onBadgesChange}
        onFormatChange={onFormatChange}
      />
    </>
  );
}
```

- [ ] **Criar `bleach-settings.tsx`**

```tsx
// front/src/features/image-forge/components/settings/universes/bleach-settings.tsx
import { BackgroundPanel } from "../background-panel";
import { FaceUploadPanel } from "../face-upload-panel";
import { GenerationOptionsPanel } from "../generation-options-panel";
import { PersonalCharacteristicsPanel } from "../personal-characteristics-panel";
import type { UniverseSettingsProps } from "./universe-settings-props";

export function BleachSettings({
  background,
  badgesEnabled,
  format,
  personalCharacteristics,
  referenceImage,
  uploadedName,
  onBackgroundChange,
  onBadgesChange,
  onFileChange,
  onFormatChange,
  onPersonalCharacteristicsChange,
}: UniverseSettingsProps) {
  return (
    <>
      <FaceUploadPanel file={referenceImage} uploadedName={uploadedName} onFileChange={onFileChange} />
      <PersonalCharacteristicsPanel value={personalCharacteristics} onChange={onPersonalCharacteristicsChange} />
      <BackgroundPanel background={background} onBackgroundChange={onBackgroundChange} />
      <GenerationOptionsPanel
        badgesEnabled={badgesEnabled}
        format={format}
        showBadges={false}
        onBadgesChange={onBadgesChange}
        onFormatChange={onFormatChange}
      />
    </>
  );
}
```

- [ ] **Criar `monster-high-settings.tsx`**

```tsx
// front/src/features/image-forge/components/settings/universes/monster-high-settings.tsx
import { BackgroundPanel } from "../background-panel";
import { FaceUploadPanel } from "../face-upload-panel";
import { GenerationOptionsPanel } from "../generation-options-panel";
import { PersonalCharacteristicsPanel } from "../personal-characteristics-panel";
import type { UniverseSettingsProps } from "./universe-settings-props";

export function MonsterHighSettings({
  background,
  badgesEnabled,
  format,
  personalCharacteristics,
  referenceImage,
  uploadedName,
  onBackgroundChange,
  onBadgesChange,
  onFileChange,
  onFormatChange,
  onPersonalCharacteristicsChange,
}: UniverseSettingsProps) {
  return (
    <>
      <FaceUploadPanel file={referenceImage} uploadedName={uploadedName} onFileChange={onFileChange} />
      <PersonalCharacteristicsPanel value={personalCharacteristics} onChange={onPersonalCharacteristicsChange} />
      <BackgroundPanel background={background} onBackgroundChange={onBackgroundChange} />
      <GenerationOptionsPanel
        badgesEnabled={badgesEnabled}
        format={format}
        showBadges={false}
        onBadgesChange={onBadgesChange}
        onFormatChange={onFormatChange}
      />
    </>
  );
}
```

- [ ] **Criar `rick-morty-settings.tsx`**

```tsx
// front/src/features/image-forge/components/settings/universes/rick-morty-settings.tsx
import { BackgroundPanel } from "../background-panel";
import { FaceUploadPanel } from "../face-upload-panel";
import { GenerationOptionsPanel } from "../generation-options-panel";
import { PersonalCharacteristicsPanel } from "../personal-characteristics-panel";
import type { UniverseSettingsProps } from "./universe-settings-props";

export function RickMortySettings({
  background,
  badgesEnabled,
  format,
  personalCharacteristics,
  referenceImage,
  uploadedName,
  onBackgroundChange,
  onBadgesChange,
  onFileChange,
  onFormatChange,
  onPersonalCharacteristicsChange,
}: UniverseSettingsProps) {
  return (
    <>
      <FaceUploadPanel file={referenceImage} uploadedName={uploadedName} onFileChange={onFileChange} />
      <PersonalCharacteristicsPanel value={personalCharacteristics} onChange={onPersonalCharacteristicsChange} />
      <BackgroundPanel background={background} onBackgroundChange={onBackgroundChange} />
      <GenerationOptionsPanel
        badgesEnabled={badgesEnabled}
        format={format}
        showBadges={false}
        onBadgesChange={onBadgesChange}
        onFormatChange={onFormatChange}
      />
    </>
  );
}
```

- [ ] **Verificar tipos**

```bash
cd front && npx tsc --noEmit
```

- [ ] **Commit**

```bash
git add front/src/features/image-forge/components/settings/universes/
git commit -m "feat(settings): componentes Kimetsu, Naruto, Digimon, Avatar, Anime Geral, Bleach, Monster High, Rick and Morty"
```

```json:metadata
{"files": ["front/src/features/image-forge/components/settings/universes/kimetsu-settings.tsx", "front/src/features/image-forge/components/settings/universes/naruto-settings.tsx", "front/src/features/image-forge/components/settings/universes/digimon-settings.tsx", "front/src/features/image-forge/components/settings/universes/avatar-settings.tsx", "front/src/features/image-forge/components/settings/universes/anime-geral-settings.tsx", "front/src/features/image-forge/components/settings/universes/bleach-settings.tsx", "front/src/features/image-forge/components/settings/universes/monster-high-settings.tsx", "front/src/features/image-forge/components/settings/universes/rick-morty-settings.tsx"], "verifyCommand": "cd front && npx tsc --noEmit", "acceptanceCriteria": ["8 componentes criados", "cada um tem FaceUpload + PersonalChar + Background + GenerationOptions(showBadges=false)"], "requiresUserVerification": false}
```

---

## Task 4: Componentes padrão sem PersonalChar (Copa e San Andreas)

**Goal:** Criar os 2 componentes com layout FaceUpload + Background + GenerationOptions.

**Files:**
- Create: `front/src/features/image-forge/components/settings/universes/copa-settings.tsx`
- Create: `front/src/features/image-forge/components/settings/universes/san-andreas-settings.tsx`

**Acceptance Criteria:**
- [x] Cada componente renderiza: FaceUpload + Background + GenerationOptions(showBadges=false)
- [x] `npx tsc --noEmit` passa

**Verify:** `cd front && npx tsc --noEmit` → sem erros

**Steps:**

- [x] **Criar `copa-settings.tsx`**

```tsx
// front/src/features/image-forge/components/settings/universes/copa-settings.tsx
import { BackgroundPanel } from "../background-panel";
import { FaceUploadPanel } from "../face-upload-panel";
import { GenerationOptionsPanel } from "../generation-options-panel";
import type { UniverseSettingsProps } from "./universe-settings-props";

export function CopaSettings({
  background,
  badgesEnabled,
  format,
  referenceImage,
  uploadedName,
  onBackgroundChange,
  onBadgesChange,
  onFileChange,
  onFormatChange,
}: UniverseSettingsProps) {
  return (
    <>
      <FaceUploadPanel file={referenceImage} uploadedName={uploadedName} onFileChange={onFileChange} />
      <BackgroundPanel background={background} onBackgroundChange={onBackgroundChange} />
      <GenerationOptionsPanel
        badgesEnabled={badgesEnabled}
        format={format}
        showBadges={false}
        onBadgesChange={onBadgesChange}
        onFormatChange={onFormatChange}
      />
    </>
  );
}
```

- [ ] **Criar `san-andreas-settings.tsx`**

```tsx
// front/src/features/image-forge/components/settings/universes/san-andreas-settings.tsx
import { BackgroundPanel } from "../background-panel";
import { FaceUploadPanel } from "../face-upload-panel";
import { GenerationOptionsPanel } from "../generation-options-panel";
import type { UniverseSettingsProps } from "./universe-settings-props";

export function SanAndreasSettings({
  background,
  badgesEnabled,
  format,
  referenceImage,
  uploadedName,
  onBackgroundChange,
  onBadgesChange,
  onFileChange,
  onFormatChange,
}: UniverseSettingsProps) {
  return (
    <>
      <FaceUploadPanel file={referenceImage} uploadedName={uploadedName} onFileChange={onFileChange} />
      <BackgroundPanel background={background} onBackgroundChange={onBackgroundChange} />
      <GenerationOptionsPanel
        badgesEnabled={badgesEnabled}
        format={format}
        showBadges={false}
        onBadgesChange={onBadgesChange}
        onFormatChange={onFormatChange}
      />
    </>
  );
}
```

- [x] **Verificar tipos**

```bash
cd front && npx tsc --noEmit
```

- [x] **Commit**

```bash
git add front/src/features/image-forge/components/settings/universes/copa-settings.tsx
git add front/src/features/image-forge/components/settings/universes/san-andreas-settings.tsx
git commit -m "feat(settings): componentes Copa e San Andreas"
```

```json:metadata
{"files": ["front/src/features/image-forge/components/settings/universes/copa-settings.tsx", "front/src/features/image-forge/components/settings/universes/san-andreas-settings.tsx"], "verifyCommand": "cd front && npx tsc --noEmit", "acceptanceCriteria": ["CopaSettings: FaceUpload + Background + Options", "SanAndreasSettings: FaceUpload + Background + Options"], "requiresUserVerification": false}
```

---

## Task 5: Dispatcher — refatorar settings-step.tsx

**Goal:** Substituir toda a lógica condicional de `settings-step.tsx` pelo mapa `UNIVERSE_SETTINGS`.

**Files:**
- Modify: `front/src/features/image-forge/components/settings-step.tsx`

**Acceptance Criteria:**
- [ ] `settings-step.tsx` não importa mais `prompt-template-rules`
- [ ] Todas as constantes `isPokemon`, `showPersonalCharacteristics`, `showCoupleReferences`, `showBackground`, `showBadges` removidas
- [ ] `UNIVERSE_SETTINGS` cobre os 13 universos
- [ ] `npx tsc --noEmit` passa sem erros
- [ ] `npm run lint` passa

**Verify:** `cd front && npx tsc --noEmit && npm run lint` → sem erros

**Steps:**

- [ ] **Substituir `settings-step.tsx` inteiro**

```tsx
// front/src/features/image-forge/components/settings-step.tsx
import type { ComponentType } from "react";

import type { CoupleReferences, Format, PokemonConfig, Universe, UniverseOption } from "../types";
import { StepIntro } from "./common";
import { AnimeGeralSettings } from "./settings/universes/anime-geral-settings";
import { AvatarSettings } from "./settings/universes/avatar-settings";
import { BleachSettings } from "./settings/universes/bleach-settings";
import { CasalSettings } from "./settings/universes/casal-settings";
import { CopaSettings } from "./settings/universes/copa-settings";
import { DigimonSettings } from "./settings/universes/digimon-settings";
import { KimetsuSettings } from "./settings/universes/kimetsu-settings";
import { LegoSettings } from "./settings/universes/lego-settings";
import { MonsterHighSettings } from "./settings/universes/monster-high-settings";
import { NarutoSettings } from "./settings/universes/naruto-settings";
import { PokemonSettings } from "./settings/universes/pokemon-settings";
import { RickMortySettings } from "./settings/universes/rick-morty-settings";
import { SanAndreasSettings } from "./settings/universes/san-andreas-settings";
import type { UniverseSettingsProps } from "./settings/universes/universe-settings-props";
import { SettingsSummary } from "./settings/settings-summary";

const UNIVERSE_SETTINGS: Record<Universe, ComponentType<UniverseSettingsProps>> = {
  "Anime Geral":                AnimeGeralSettings,
  "Avatar, the Last Airbender": AvatarSettings,
  "Bleach":                     BleachSettings,
  "Casal":                      CasalSettings,
  "Copa":                       CopaSettings,
  "Digimon":                    DigimonSettings,
  "Kimetsu":                    KimetsuSettings,
  "LEGO":                       LegoSettings,
  "Monster High":               MonsterHighSettings,
  "Naruto":                     NarutoSettings,
  "Pokemon":                    PokemonSettings,
  "Rick and Morty":             RickMortySettings,
  "San Andreas":                SanAndreasSettings,
};

export function SettingsStep({
  background,
  badgesEnabled,
  coupleReferences,
  format,
  personalCharacteristics,
  pokemonConfig,
  referenceImage,
  selectedUniverse,
  uploadedName,
  onBack,
  onBackgroundChange,
  onBadgesChange,
  onCoupleReferencesChange,
  onFileChange,
  onFormatChange,
  onGenerate,
  onPersonalCharacteristicsChange,
  onPokemonConfigChange,
}: {
  background: string;
  badgesEnabled: boolean;
  coupleReferences: CoupleReferences;
  format: Format;
  personalCharacteristics: string;
  pokemonConfig: PokemonConfig;
  referenceImage: File | null;
  selectedUniverse: UniverseOption;
  uploadedName: string;
  onBack: () => void;
  onBackgroundChange: (color: string) => void;
  onBadgesChange: (enabled: boolean) => void;
  onCoupleReferencesChange: (references: CoupleReferences) => void;
  onFileChange: (file: File) => void;
  onFormatChange: (format: Format) => void;
  onGenerate: () => void;
  onPersonalCharacteristicsChange: (value: string) => void;
  onPokemonConfigChange: (config: PokemonConfig) => void;
}) {
  const UniverseSettings = UNIVERSE_SETTINGS[selectedUniverse.name];
  const settingsProps: UniverseSettingsProps = {
    background,
    badgesEnabled,
    coupleReferences,
    format,
    personalCharacteristics,
    pokemonConfig,
    referenceImage,
    uploadedName,
    onBackgroundChange,
    onBadgesChange,
    onCoupleReferencesChange,
    onFileChange,
    onFormatChange,
    onPersonalCharacteristicsChange,
    onPokemonConfigChange,
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <StepIntro
        eyebrow="Passo 2 de 3"
        title="Configurações da imagem"
        description="Ajuste a referência, o fundo e o formato antes de iniciar a geração."
      />
      <div className="mt-6 grid min-w-0 gap-5 lg:mt-8 xl:grid-cols-[minmax(0,1fr)_360px] xl:gap-6">
        <div className="min-w-0 space-y-5">
          <UniverseSettings {...settingsProps} />
        </div>
        <SettingsSummary
          background={background}
          badgesEnabled={badgesEnabled}
          format={format}
          isPokemon={selectedUniverse.name === "Pokemon"}
          pokemonConfig={pokemonConfig}
          selectedUniverse={selectedUniverse}
          onBack={onBack}
          onGenerate={onGenerate}
        />
      </div>
    </section>
  );
}
```

- [ ] **Verificar tipos e lint**

```bash
cd front && npx tsc --noEmit && npm run lint
```

Esperado: sem erros de TypeScript nem de lint.

- [ ] **Commit final**

```bash
git add front/src/features/image-forge/components/settings-step.tsx
git commit -m "feat(settings): dispatcher por universo, remover lógica condicional de settings-step"
```

```json:metadata
{"files": ["front/src/features/image-forge/components/settings-step.tsx"], "verifyCommand": "cd front && npx tsc --noEmit && npm run lint", "acceptanceCriteria": ["UNIVERSE_SETTINGS cobre 13 universos", "sem imports de prompt-template-rules", "sem variáveis isPokemon/showBackground/showBadges", "tsc sem erros", "lint sem erros"], "requiresUserVerification": false}
```
