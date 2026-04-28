import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/Button";
import DoorCard, { Door } from "../components/DoorCard";
import { api } from "../lib/api";

type PageResp<T> = { content: T[] };
type SeriesItem = { id: string; title: string; description: string; count: number };
type SeriesTree = Record<string, SeriesItem[]>;

const DIRECTIONS = [
  {
    title: "Межкомнатные двери",
    text: "Экошпон, эмаль, фрезерованные и классические серии с подбором размеров 600/700/800/900.",
    href: "/interior",
  },
  {
    title: "Входные двери",
    text: "Утеплённые модели для квартиры и дома с акцентом на шумоизоляцию и надёжность.",
    href: "/entrance",
  },
  {
    title: "Подбор двери",
    text: "Быстрый сценарий для выбора по стилю, свету, бюджету и пожеланиям к изоляции.",
    href: "/finder",
  },
] as const;

export default function Home() {
  const [featured, setFeatured] = useState<Door[]>([]);
  const [series, setSeries] = useState<SeriesTree>({});

  useEffect(() => {
    api.get<PageResp<Door>>("/api/catalog/doors?size=6&sort=new").then((res) => setFeatured(res.content ?? [])).catch(() => undefined);
    api.get<SeriesTree>("/api/catalog/series").then(setSeries).catch(() => undefined);
  }, []);

  const interiorSeries = series.INTERIOR ?? [];
  const entranceSeries = series.ENTRANCE ?? [];

  return (
    <div className="grid gap-10">
      <section className="grid gap-6 rounded-promo border border-border bg-surface/90 p-5 shadow-soft md:grid-cols-[1.15fr_0.85fr] md:p-7">
        <div className="space-y-5">
          <div className="section-kicker">
            Интернет-магазин дверей
          </div>
          <div className="space-y-3">
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight md:text-5xl">
              Межкомнатные и входные двери с подбором серии, размера и комплектации
            </h1>
            <p className="max-w-2xl text-base leading-7 text-text-secondary md:text-lg">
              Подберите дверь по стилю интерьера, сразу сравните серии и оформите заказ с доставкой, замером и монтажом.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link to="/catalog">
              <Button>Открыть каталог</Button>
            </Link>
            <Link to="/finder">
              <Button variant="secondary">Подобрать дверь</Button>
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["600-900 мм", "четыре стандартных размера у каждой модели"],
              ["Серии", "экошпон, эмаль, эмалекс, классика и входные решения"],
              ["Под ключ", "замер, доставка, подъём и монтаж"],
            ].map(([value, label]) => (
              <div key={value} className="rounded-card border border-border bg-bg/80 p-4">
                <div className="text-2xl font-semibold">{value}</div>
                <div className="mt-1 text-sm text-text-secondary">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          <div className="overflow-hidden rounded-promo border border-border bg-[linear-gradient(180deg,#f8f2ea_0%,#fffdfa_100%)] p-4 md:p-5">
            <div className="grid gap-4 md:grid-cols-[0.85fr_1fr]">
              <div className="space-y-3">
                <div className="text-xs uppercase tracking-[0.18em] text-text-secondary">Серии и сценарии</div>
                <div className="text-xl font-semibold">От лаконичного модерна до классики и входных решений</div>
                <p className="text-sm leading-6 text-text-secondary">
                  На главной собраны быстрые переходы в межкомнатные и входные разделы, а также по сериям: эмаль, экошпон,
                  эмалекс и другие.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <img src="/demo/doors/atum-x7-white.svg" alt="Atum X7" className="h-full w-full rounded-card border border-border bg-white object-cover p-2" />
                <img src="/demo/doors/entrance-safe-s1-anthracite.svg" alt="Safe Steel" className="h-full w-full rounded-card border border-border bg-white object-cover p-2" />
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-promo border border-border bg-bg/80">
            {[
              "Выезд замерщика по записи",
              "Монтаж и гарантия на работы",
              "Подбор по цветам, стилю и материалам",
              "История заказов в личном кабинете",
            ].map((item, index) => (
              <div key={item} className={`px-4 py-3 text-sm ${index !== 0 ? "border-t border-border" : ""}`}>
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {DIRECTIONS.map((item) => (
          <Link key={item.title} to={item.href} className="rounded-card border border-border bg-surface p-5 transition hover:-translate-y-0.5">
            <div className="text-lg font-semibold">{item.title}</div>
            <p className="mt-2 text-sm leading-6 text-text-secondary">{item.text}</p>
            <div className="mt-4 text-sm font-medium text-accent">Перейти в раздел</div>
          </Link>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-promo border border-border bg-surface p-5 shadow-soft md:p-6">
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-text-secondary">Серии межкомнатных дверей</div>
              <h2 className="mt-1 text-3xl font-semibold">Экошпон, эмаль, эмалекс и классика</h2>
            </div>
            <Link to="/interior" className="text-sm font-medium text-accent">
              Все серии
            </Link>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {interiorSeries.slice(0, 6).map((item) => (
              <Link
                key={item.id}
                to={`/catalog?doorType=INTERIOR&series=${item.id}`}
                className="rounded-card border border-border bg-bg/80 p-4 transition hover:border-accent"
              >
                <div className="font-medium">{item.title}</div>
                <div className="mt-1 text-sm leading-6 text-text-secondary">{item.description}</div>
                <div className="mt-3 text-xs uppercase tracking-[0.14em] text-text-secondary">{item.count} моделей</div>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-promo border border-border bg-surface p-5 shadow-soft md:p-6">
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-text-secondary">Входные решения</div>
              <h2 className="mt-1 text-3xl font-semibold">Надёжные входные двери</h2>
            </div>
            <Link to="/entrance" className="text-sm font-medium text-accent">
              Смотреть раздел
            </Link>
          </div>

          <div className="mt-5 grid gap-3">
            {entranceSeries.map((item) => (
              <Link
                key={item.id}
                to={`/catalog?doorType=ENTRANCE&series=${item.id}`}
                className="rounded-card border border-border bg-bg/80 p-4 transition hover:border-accent"
              >
                <div className="font-medium">{item.title}</div>
                <div className="mt-1 text-sm leading-6 text-text-secondary">{item.description}</div>
                <div className="mt-3 text-xs uppercase tracking-[0.14em] text-text-secondary">{item.count} моделей</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-text-secondary">Популярные позиции</div>
            <h2 className="mt-1 text-3xl font-semibold">Что смотрят чаще всего</h2>
          </div>
          <Link to="/catalog" className="text-sm font-medium text-accent">
            Смотреть весь каталог
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {featured.length
            ? featured.map((door) => <DoorCard key={door.id} door={door} />)
            : Array.from({ length: 6 }).map((_, idx) => <div key={idx} className="h-72 animate-pulse rounded-card border border-border bg-muted" />)}
        </div>
      </section>
    </div>
  );
}
