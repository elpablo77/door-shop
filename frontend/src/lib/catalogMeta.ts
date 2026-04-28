export type SeriesOption = {
  id: string;
  title: string;
  description: string;
  count?: number;
};

export type SeriesTree = Record<"INTERIOR" | "ENTRANCE", SeriesOption[]>;

export const INTERIOR_SERIES: SeriesOption[] = [
  { id: "ATUM", title: "Атум", description: "Лаконичные межкомнатные двери в современной древесной гамме." },
  { id: "ATUM_PRO", title: "Атум Про", description: "Более выразительные полотна с глубокими оттенками и стеклом." },
  { id: "URBAN", title: "Урбан", description: "Современные строгие модели для интерьеров в стиле модерн." },
  { id: "EMALEX", title: "Эмалекс", description: "Гладкие двери с ровным покрытием и мягкой палитрой." },
  { id: "BASIC", title: "Бэйсик", description: "Практичные базовые двери под типовые квартиры и проекты." },
  { id: "ENAMEL", title: "Белая и цветная Эмаль", description: "Эмалевые полотна в белых и акцентных цветах." },
  { id: "SOLO_AVANT", title: "Соло, Авант", description: "Декоративные модели с молдингом и выразительными вставками." },
  { id: "CLASSIC_ART", title: "Классик Арт", description: "Классические двери с филенкой и остеклением." },
];

export const ENTRANCE_SERIES: SeriesOption[] = [
  { id: "VFD_METAL", title: "ВФД", description: "Квартирные металлические двери с базовой шумоизоляцией." },
  { id: "DIVISION", title: "Дивизион", description: "Усиленные металлические двери для квартиры и офиса." },
  { id: "THERMAL_VFD", title: "С терморазрывом ВФД", description: "Уличные двери с терморазрывом для частного дома." },
  { id: "ECONOM_VFD", title: "Эконом ВФД", description: "Доступные металлические двери для типовых задач." },
];

export const SERIES_TREE_FALLBACK: SeriesTree = {
  INTERIOR: INTERIOR_SERIES,
  ENTRANCE: ENTRANCE_SERIES,
};

export const COLOR_FILTER_OPTIONS = ["Белые", "Светлые", "Темные", "Яркие цвета", "Черные"] as const;
export const MATERIAL_OPTIONS = ["Экошпон", "Экокрафт", "Эмаль", "Шпонированные"] as const;
export const STYLE_OPTIONS = ["Модерн", "Классика"] as const;

export const DOOR_KIND_OPTIONS = {
  INTERIOR: ["Глухая", "Остекленная", "Зеркало", "Грифель", "Молдинг", "Остекленная с молдингом"],
  ENTRANCE: ["Квартирная входная", "Уличная входная"],
} as const;

export const PRICE_PRESETS = [
  { id: "from10000", label: "от 10 000 ₽", minPrice: "10000", maxPrice: "" },
  { id: "to10000", label: "до 10 000 ₽", minPrice: "", maxPrice: "10000" },
  { id: "to5000", label: "до 5 000 ₽", minPrice: "", maxPrice: "5000" },
  { id: "to2000", label: "до 2 000 ₽", minPrice: "", maxPrice: "2000" },
  { id: "to1000", label: "до 1 000 ₽", minPrice: "", maxPrice: "1000" },
];

const SWATCH_MAP: Record<string, string[]> = {
  белый: ["#f8f8f2", "#e6dfd4"],
  айс: ["#f6f6f0", "#ddd8d0"],
  крем: ["#f4ead8", "#d3c0a0"],
  ivory: ["#f2ede1", "#cec3aa"],
  слоновая: ["#efe4d0", "#d1b790"],
  капучино: ["#b99979", "#eadbc6"],
  мокко: ["#8a6754", "#d7b39a"],
  орех: ["#7a563e", "#c89a75"],
  дуб: ["#b78654", "#efd5af"],
  сосна: ["#d8bf8f", "#f5e5be"],
  песочный: ["#dcb78a", "#f2dfbf"],
  серый: ["#7a7b80", "#d8d8dc"],
  графит: ["#4b5059", "#8a9098"],
  антрацит: ["#2f343a", "#757b83"],
  черный: ["#111111", "#575757"],
  олива: ["#7d8a61", "#d6ddbf"],
  синий: ["#4f6b9a", "#d2dced"],
  зеленый: ["#5f8e68", "#d2e7d7"],
  терракот: ["#b55f48", "#efccbf"],
  красный: ["#a94949", "#e8c2c2"],
};

export function seriesForDoorType(doorType?: string): SeriesOption[] {
  return doorType === "ENTRANCE" ? ENTRANCE_SERIES : doorType === "INTERIOR" ? INTERIOR_SERIES : [...INTERIOR_SERIES, ...ENTRANCE_SERIES];
}

export function doorTypeLabel(doorType?: string): string {
  return doorType === "ENTRANCE" ? "Металлическая дверь" : "Межкомнатная дверь";
}

export function splitColorOptions(raw?: string, fallback?: string): string[] {
  const parts = (raw ?? "")
    .split(/[;,/|]/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (fallback && !parts.some((item) => item.toLowerCase() === fallback.toLowerCase())) {
    parts.unshift(fallback);
  }

  return Array.from(new Set(parts));
}

export function swatchStyle(label: string): string {
  const normalized = label.toLowerCase();
  const match = Object.entries(SWATCH_MAP).find(([token]) => normalized.includes(token));
  const [start, end] = match?.[1] ?? ["#ece3d7", "#b89b82"];
  return `linear-gradient(135deg, ${start}, ${end})`;
}

export function activePricePreset(minPrice: string, maxPrice: string): string {
  const match = PRICE_PRESETS.find((preset) => preset.minPrice === minPrice && preset.maxPrice === maxPrice);
  return match?.id ?? "";
}
