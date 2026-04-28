import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import DoorCard, { Door } from "../components/DoorCard";
import Input from "../components/Input";
import Select from "../components/Select";
import Button from "../components/Button";
import { api, ApiError } from "../lib/api";
import { activePricePreset, PRICE_PRESETS, SERIES_TREE_FALLBACK, seriesForDoorType, SeriesOption } from "../lib/catalogMeta";

type PageResp<T> = { content: T[]; totalPages: number; number: number; totalElements: number };
type Filters = {
  colors: string[];
  doorKinds: string[];
  materials: string[];
  styles: string[];
  minPrice: number;
  maxPrice: number;
};

const SORT_OPTIONS = [
  ["new", "Сначала новинки"],
  ["priceAsc", "Цена по возрастанию"],
  ["priceDesc", "Цена по убыванию"],
] as const;

const DOOR_TYPE_OPTIONS = [
  ["", "Все двери"],
  ["INTERIOR", "Межкомнатные"],
  ["ENTRANCE", "Металлические"],
] as const;

function FilterGroup({
  title,
  items,
  value,
  onChange,
}: {
  title: string;
  items: string[];
  value: string;
  onChange: (next: string) => void;
}) {
  if (!items.length) return null;

  return (
    <div className="grid gap-3">
      <div className="text-sm font-medium">{title}</div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChange("")}
          className={`rounded-control border px-3 py-2 text-sm ${!value ? "border-accent bg-muted text-text-primary" : "border-border bg-surface text-text-secondary"}`}
        >
          Все
        </button>
        {items.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            className={`rounded-control border px-3 py-2 text-sm ${
              value === item ? "border-accent bg-muted text-text-primary" : "border-border bg-surface text-text-secondary"
            }`}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Catalog() {
  const [sp, setSp] = useSearchParams();
  const [page, setPage] = useState<PageResp<Door>>();
  const [filters, setFilters] = useState<Filters>();
  const [seriesTree, setSeriesTree] = useState<Record<string, SeriesOption[]>>(SERIES_TREE_FALLBACK);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const q = useMemo(
    () => ({
      q: sp.get("q") ?? "",
      color: sp.get("color") ?? "",
      doorType: sp.get("doorType") ?? "",
      series: sp.get("series") ?? "",
      style: sp.get("style") ?? "",
      doorKind: sp.get("doorKind") ?? "",
      material: sp.get("material") ?? "",
      minPrice: sp.get("minPrice") ?? "",
      maxPrice: sp.get("maxPrice") ?? "",
      sort: sp.get("sort") ?? "new",
      page: Number(sp.get("page") ?? 0),
    }),
    [sp],
  );

  const set = (key: string, value: string) => {
    const next = new URLSearchParams(sp);
    if (value) next.set(key, value);
    else next.delete(key);
    next.set("page", "0");
    setSp(next);
  };

  const setMany = (changes: Record<string, string>) => {
    const next = new URLSearchParams(sp);
    Object.entries(changes).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    next.set("page", "0");
    setSp(next);
  };

  const applyPricePreset = (presetId: string) => {
    const preset = PRICE_PRESETS.find((item) => item.id === presetId);
    const next = new URLSearchParams(sp);

    if (!preset) {
      next.delete("minPrice");
      next.delete("maxPrice");
    } else {
      if (preset.minPrice) next.set("minPrice", preset.minPrice);
      else next.delete("minPrice");
      if (preset.maxPrice) next.set("maxPrice", preset.maxPrice);
      else next.delete("maxPrice");
    }

    next.set("page", "0");
    setSp(next);
  };

  const setPageParam = (value: number) => {
    const next = new URLSearchParams(sp);
    next.set("page", String(Math.max(value, 0)));
    setSp(next);
  };

  useEffect(() => {
    const params = new URLSearchParams();
    if (q.doorType) params.set("doorType", q.doorType);
    api.get<Filters>(`/api/catalog/filters?${params.toString()}`).then(setFilters).catch(() => undefined);
  }, [q.doorType]);

  useEffect(() => {
    api
      .get<Record<string, SeriesOption[]>>("/api/catalog/series")
      .then((data) => setSeriesTree({ ...SERIES_TREE_FALLBACK, ...data }))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({
      sort: q.sort,
      page: String(q.page),
      size: "12",
    });

    Object.entries(q).forEach(([key, value]) => {
      if (["sort", "page"].includes(key)) return;
      if (typeof value === "string" && value) params.set(key, value);
    });

    api
      .get<PageResp<Door>>(`/api/catalog/doors?${params.toString()}`)
      .then(setPage)
      .catch((e: ApiError) => {
        setPage(undefined);
        setError(e.error || "Ошибка загрузки каталога");
      })
      .finally(() => setLoading(false));
  }, [q]);

  const canPrev = (page?.number ?? 0) > 0;
  const canNext = (page?.number ?? 0) + 1 < (page?.totalPages ?? 0);
  const pricePreset = activePricePreset(q.minPrice, q.maxPrice);
  const allSeries = seriesTree[q.doorType || ""]?.length
    ? seriesTree[q.doorType || ""]
    : q.doorType
      ? seriesForDoorType(q.doorType)
      : [...(seriesTree.INTERIOR ?? []), ...(seriesTree.ENTRANCE ?? [])];
  const selectedSeries = allSeries.find((item) => item.id === q.series);
  const heading = q.doorType === "ENTRANCE" ? "Металлические двери" : q.doorType === "INTERIOR" ? "Межкомнатные двери" : "Каталог дверей";

  return (
    <div className="grid gap-5 lg:items-start lg:grid-cols-[300px_1fr] xl:grid-cols-[320px_1fr]">
      <aside className="h-fit rounded-promo border border-border bg-surface p-4 shadow-soft lg:sticky lg:top-28 lg:p-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-text-secondary">Фильтры</div>
            <div className="mt-1 text-xl font-semibold">Подбор по параметрам</div>
          </div>
          <button className="text-sm text-text-secondary hover:text-text-primary" onClick={() => setSp(new URLSearchParams())}>
            Сбросить
          </button>
        </div>

        <div className="mt-5 grid gap-5">
          <div className="grid gap-3">
            <div className="text-sm font-medium">Направление</div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-1">
              {DOOR_TYPE_OPTIONS.map(([value, label]) => (
                <button
                  key={value || "all"}
                  type="button"
                  onClick={() => setMany({ doorType: value, series: "" })}
                  className={`rounded-control border px-4 py-3 text-left text-sm ${
                    q.doorType === value ? "border-accent bg-muted text-text-primary" : "border-border bg-bg/80 text-text-secondary"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3">
            <div className="text-sm font-medium">Поиск по каталогу</div>
            <Input value={q.q} onChange={(e) => set("q", e.target.value)} placeholder="Название, серия или цвет" />
          </div>

          <FilterGroup
            title="Серия"
            items={allSeries.map((item) => item.title)}
            value={selectedSeries?.title ?? ""}
            onChange={(value) => {
              const series = allSeries.find((item) => item.title === value);
              set("series", series?.id ?? "");
            }}
          />

          <FilterGroup title="Цвета" items={filters?.colors ?? []} value={q.color} onChange={(value) => set("color", value)} />
          <FilterGroup title="Тип двери" items={filters?.doorKinds ?? []} value={q.doorKind} onChange={(value) => set("doorKind", value)} />
          <FilterGroup title="Материалы" items={filters?.materials ?? []} value={q.material} onChange={(value) => set("material", value)} />
          <FilterGroup title="Стиль" items={filters?.styles ?? []} value={q.style} onChange={(value) => set("style", value)} />

          <div className="grid gap-3">
            <div className="text-sm font-medium">Цена</div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => applyPricePreset("")}
                className={`rounded-control border px-3 py-2 text-sm ${!pricePreset ? "border-accent bg-muted text-text-primary" : "border-border bg-surface text-text-secondary"}`}
              >
                Любая
              </button>
              {PRICE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPricePreset(preset.id)}
                  className={`rounded-control border px-3 py-2 text-sm ${
                    pricePreset === preset.id ? "border-accent bg-muted text-text-primary" : "border-border bg-surface text-text-secondary"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <Input inputMode="numeric" value={q.minPrice} onChange={(e) => set("minPrice", e.target.value)} placeholder={`От ${filters?.minPrice ?? 0}`} />
              <Input inputMode="numeric" value={q.maxPrice} onChange={(e) => set("maxPrice", e.target.value)} placeholder={`До ${filters?.maxPrice ?? 0}`} />
            </div>
          </div>
        </div>
      </aside>

      <div className="grid content-start gap-5">
        <section className="self-start rounded-promo border border-border bg-surface px-4 py-4 shadow-soft md:px-6">
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_280px] md:items-start">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-text-secondary">{heading}</div>
              <h1 className="mt-1 text-3xl font-semibold">{selectedSeries ? selectedSeries.title : "Каталог"}</h1>
              <div className="mt-2 text-sm text-text-secondary">Найдено: {page?.totalElements ?? 0}</div>
            </div>

            <Select className="w-full" value={q.sort} onChange={(e) => set("sort", e.target.value)}>
              {SORT_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
        </section>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-72 animate-pulse rounded-card border border-border bg-muted" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-card border border-red-300 bg-red-50 p-4 text-sm text-red-700">{error}</div>
        ) : page?.content?.length ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {page.content.map((door) => (
                <DoorCard key={door.id} door={door} />
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-border bg-surface p-4">
              <div className="text-sm text-text-secondary">
                Страница {(page.number ?? 0) + 1} из {Math.max(page.totalPages ?? 1, 1)}
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" disabled={!canPrev} onClick={() => setPageParam((page.number ?? 0) - 1)}>
                  Назад
                </Button>
                <Button variant="secondary" disabled={!canNext} onClick={() => setPageParam((page.number ?? 0) + 1)}>
                  Дальше
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-card border border-border bg-surface p-5 text-sm text-text-secondary">
            По заданным параметрам двери не найдены. Попробуйте сбросить часть фильтров или изменить поисковый запрос.
          </div>
        )}
      </div>
    </div>
  );
}
