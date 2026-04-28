import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";

type SeriesItem = { id: string; title: string; description: string; count: number };
type SeriesTree = Record<string, SeriesItem[]>;

export default function SeriesPage({ doorType }: { doorType: "INTERIOR" | "ENTRANCE" }) {
  const [items, setItems] = useState<SeriesItem[]>([]);

  useEffect(() => {
    api
      .get<SeriesTree>("/api/catalog/series")
      .then((tree) => setItems(tree[doorType] ?? []))
      .catch(() => setItems([]));
  }, [doorType]);

  return (
    <div className="grid gap-6">
      <section className="rounded-promo border border-border bg-surface p-6 shadow-soft md:p-8">
        <div className="text-xs uppercase tracking-[0.18em] text-text-secondary">
          {doorType === "INTERIOR" ? "Межкомнатные серии" : "Входные решения"}
        </div>
        <h1 className="mt-2 text-4xl font-semibold">
          {doorType === "INTERIOR" ? "Серии межкомнатных дверей" : "Серии входных дверей"}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-text-secondary">
          Перейдите в нужную серию и откройте каталог уже с выбранным направлением.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <Link
            key={item.id}
            to={`/catalog?doorType=${doorType}&series=${item.id}`}
            className="rounded-card border border-border bg-surface p-5 transition hover:-translate-y-0.5 hover:shadow-soft"
          >
            <div className="text-lg font-semibold">{item.title}</div>
            <div className="mt-2 text-sm leading-6 text-text-secondary">{item.description}</div>
            <div className="mt-4 text-xs uppercase tracking-[0.14em] text-text-secondary">{item.count} моделей</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
