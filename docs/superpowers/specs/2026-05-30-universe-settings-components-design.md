# Design: Componentes de configuração por universo

**Data:** 2026-05-30  
**Status:** Aprovado

## Problema

`settings-step.tsx` acumula lógica condicional (`if isPokemon`, `if showBackground`, `if showBadges`…) para 13 universos distintos. Cada nova regra aumenta a complexidade do arquivo. A estrutura atual não deixa claro o que cada universo pede.

## Solução

Um componente de configuração dedicado por universo. O `settings-step.tsx` vira um dispatcher fino; cada universo controla exatamente quais painéis exibe.

---

## Estrutura de arquivos

```
front/src/features/image-forge/
  components/
    settings/
      universes/                          ← pasta nova
        universe-settings-props.ts        ← tipo compartilhado
        anime-geral-settings.tsx
        avatar-settings.tsx
        bleach-settings.tsx
        casal-settings.tsx
        copa-settings.tsx
        digimon-settings.tsx
        kimetsu-settings.tsx
        lego-settings.tsx
        monster-high-settings.tsx
        naruto-settings.tsx
        pokemon-settings.tsx
        rick-morty-settings.tsx
        san-andreas-settings.tsx
      background-panel.tsx                (sem mudança)
      couple-reference-panel.tsx          (sem mudança)
      face-upload-panel.tsx               (sem mudança)
      generation-options-panel.tsx        (sem mudança)
      personal-characteristics-panel.tsx  (sem mudança)
      pokemon-poster-panel.tsx            (sem mudança)
      pokemon-selection-panel.tsx         (sem mudança)
      settings-summary.tsx                (sem mudança)
    settings-step.tsx                     ← vira dispatcher
  lib/
    prompt-template-rules.ts             ← simplificado
```

---

## Matriz de painéis

| Universo | Upload imagem | PersonalChar | Background | Pokémon panels | Insígnias | Formato |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| Kimetsu | rosto | ✓ | ✓ | — | — | ✓ |
| Pokemon | rosto | — | ✓ | ✓ | ✓ | ✓ |
| Naruto | rosto | ✓ | ✓ | — | — | ✓ |
| Digimon | rosto | ✓ | ✓ | — | — | ✓ |
| Avatar | rosto | ✓ | ✓ | — | — | ✓ |
| Anime Geral | rosto | ✓ | ✓ | — | — | ✓ |
| Bleach | rosto | ✓ | ✓ | — | — | ✓ |
| Copa | rosto | — | ✓ | — | — | ✓ |
| Casal | casal | ✓ | ✓ | — | — | ✓ |
| LEGO | rosto | — | — | — | — | ✓ |
| Monster High | rosto | ✓ | ✓ | — | — | ✓ |
| Rick and Morty | rosto | ✓ | ✓ | — | — | ✓ |
| San Andreas | rosto | — | ✓ | — | — | ✓ |

---

## Tipo compartilhado

`universe-settings-props.ts` define o contrato entre `settings-step.tsx` e todos os componentes de universo. Cada componente recebe o tipo completo e usa apenas o que precisa.

```ts
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

---

## Dispatcher (settings-step.tsx)

```ts
const UNIVERSE_SETTINGS: Record<Universe, ComponentType<UniverseSettingsProps>> = {
  "Anime Geral":               AnimeGeralSettings,
  "Avatar, the Last Airbender": AvatarSettings,
  "Bleach":                    BleachSettings,
  "Casal":                     CasalSettings,
  "Copa":                      CopaSettings,
  "Digimon":                   DigimonSettings,
  "LEGO":                      LegoSettings,
  "Kimetsu":                   KimetsuSettings,
  "Monster High":              MonsterHighSettings,
  "Naruto":                    NarutoSettings,
  "Pokemon":                   PokemonSettings,
  "Rick and Morty":            RickMortySettings,
  "San Andreas":               SanAndreasSettings,
};
```

`settings-step.tsx` resolve o componente, renderiza `StepIntro` + grid + `<UniverseSettings {...settingsProps} />` + `SettingsSummary`. A lógica condicional existente (`isPokemon`, `showBackground`, etc.) é removida.

---

## prompt-template-rules.ts

Remove `needsPersonalCharacteristics` e `needsCoupleReferences` (a lógica passa para cada componente).

`hasBadges` passa a retornar `true` apenas para `pokemon`:

```ts
export function hasBadges(template: PromptTemplate) {
  return template === "pokemon";
}
```

`hasBackground` mantém retornando `false` para `lego`.

`SettingsSummary` continua usando `hasBackground` e `hasBadges` para decidir quais linhas exibir na sidebar.

---

## Não está no escopo

- Alterar os painéis existentes (`background-panel`, `face-upload-panel`, etc.)
- Alterar `SettingsSummary`
- Alterar `page.tsx`
- Adicionar novos painéis ou configurações de universo
