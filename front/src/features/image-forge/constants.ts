import type { CustomPokemonOutfit, Format, PokemonPlacement, UniverseOption } from "./types";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8004";

export const universes: UniverseOption[] = [
  {
    name: "Kimetsu",
    label: "Kimetsu",
    description: "Traços dramáticos, lâminas, haori e composição cinematográfica.",
    code: "KMT",
    image: "/kimetsu.png",
  },
  {
    name: "Pokemon",
    label: "Pokémon",
    description: "Criaturas, insígnias, energia elemental e visual de treinador.",
    code: "PKM",
    image: "/Pokemon.png",
  },
  {
    name: "Naruto",
    label: "Naruto",
    description: "Vilas, clãs, bandanas, selos e poses de ação.",
    code: "NRT",
    image: "/Naruto.png",
  },
  {
    name: "Digimon",
    label: "Digimon",
    description: "Parceiros digitais, circuitos sutis e evolução heroica.",
    code: "DGM",
    image: "/Digimon.png",
  },
  {
    name: "Avatar, the Last Airbender",
    label: "Avatar, the Last Airbender",
    description: "Mestres do elemento, técnicas de combate e ambientes de fantasia.",
    code: "AVT",
    image: "/Avatar.png",
  },
];

export const recentGenerations = [
  { title: "Avatar treinador", meta: "Pokémon · Quadrada · hoje", image: "/Pokemon.png" },
  { title: "Retrato hashira", meta: "Kimetsu · Retrato · ontem", image: "/kimetsu.png" },
  { title: "Clã da folha", meta: "Naruto · Paisagem · 18 mai", image: "/Naruto.png" },
];

export const backgroundColors = [
  "#050505",
  "#15151A",
  "#1A1A2E",
  "#222222",
  "#F5F5F5",
  "#E8E2D8",
  "#7C2D12",
  "#14532D",
  "#1E3A8A",
  "#581C87",
  "#BE123C",
  "#CA8A04",
];

export const formats: Array<{ label: Format; ratio: string; shape: string }> = [
  { label: "Automático", ratio: "", shape: "auto" },
  { label: "Quadrado 1:1", ratio: "1:1", shape: "square" },
  { label: "Retrato 3:4", ratio: "3:4", shape: "portrait" },
  { label: "Story 9:16", ratio: "9:16", shape: "story" },
  { label: "Paisagem 4:3", ratio: "4:3", shape: "landscape" },
  { label: "Widescreen 16:9", ratio: "16:9", shape: "wide" },
];

export const defaultPokemonOutfit: CustomPokemonOutfit = {
  torso: "Jaqueta tática verde escura",
  legs: "Calça cargo preta",
  shoes: "Tênis técnico branco",
  hat: "",
  glasses: "Sem óculos",
};

export const torsoOptions = [
  "Jaqueta tática verde escura",
  "Casaco preto campeão",
  "Moletom streetwear branco e preto",
  "Uniforme futurista",
];

export const legOptions = [
  "Calça cargo preta",
  "Calça jogger cinza escura",
  "Calça técnica branca",
  "Calça de campeão azul marinho",
];

export const shoeOptions = [
  "Tênis técnico branco",
  "Botas táticas pretas",
  "Tênis high-top vermelho",
  "Sneaker futurista prateado",
];

export const glassesOptions = [
  "Sem óculos",
  "Óculos escuros retangulares",
  "Óculos redondos transparentes",
  "Óculos esportivo futurista",
];

export const defaultPokemonList: PokemonPlacement[] = [
  { name: "Mewtwo", position: "atrás do treinador" },
  { name: "Quilava", position: "ao lado dele" },
  { name: "Pichu", position: "na parte inferior" },
  { name: "Eevee", position: "no ombro" },
  { name: "Ledian", position: "no primeiro plano" },
  { name: "Furret", position: "no canto inferior" },
  { name: "Persian", position: "no centro inferior" },
];

export const pokemonPositions = [
  "atrás do treinador",
  "ao lado dele",
  "na parte inferior",
  "no ombro",
  "no primeiro plano",
  "no canto inferior",
  "no centro inferior",
  "voando acima",
];
