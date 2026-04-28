import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "./Input";
import { api } from "../lib/api";
import { formatPrice } from "../lib/format";

type Suggest = { id: number; name: string; price: number; series?: string };

export function shouldFetchSuggestions(q: string): boolean {
  return q.trim().length >= 2;
}

export default function SearchBox({ mobile }: { mobile?: boolean }) {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Suggest[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const nav = useNavigate();

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      if (!shouldFetchSuggestions(q)) {
        setItems([]);
        setOpen(false);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await api.get<Suggest[]>(`/api/catalog/suggest?q=${encodeURIComponent(q)}`);
        if (cancelled) return;
        setItems(data);
        setActive(0);
        setOpen(true);
      } catch {
        if (cancelled) return;
        setItems([]);
        setOpen(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 220);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [q]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    nav(`/catalog?q=${encodeURIComponent(q)}`);
    setOpen(false);
  };

  return (
    <div className={`relative ${mobile ? "" : "w-full"}`} ref={boxRef}>
      <form onSubmit={submit} className="w-full">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={mobile ? "Поиск двери" : "Найти дверь по названию или серии"}
          onFocus={() => shouldFetchSuggestions(q) && setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
            if (e.key === "ArrowDown") setActive((p) => Math.min(p + 1, Math.max(items.length - 1, 0)));
            if (e.key === "ArrowUp") setActive((p) => Math.max(p - 1, 0));
            if (e.key === "Enter" && open && items[active]) {
              e.preventDefault();
              nav(`/doors/${items[active].id}`);
              setOpen(false);
            }
          }}
        />
      </form>

      {open && (loading || items.length > 0 || shouldFetchSuggestions(q)) ? (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-card border border-border bg-surface shadow-soft">
          {loading ? <div className="px-3 py-4 text-sm text-text-secondary">Ищем подходящие двери...</div> : null}

          {!loading && items.length > 0
            ? items.map((it, idx) => (
                <button
                  type="button"
                  key={it.id}
                  className={`flex min-h-[56px] w-full items-center justify-between gap-3 px-3 text-left ${idx === active ? "bg-muted" : ""}`}
                  onMouseDown={() => {
                    nav(`/doors/${it.id}`);
                    setOpen(false);
                  }}
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{it.name}</div>
                    {it.series ? <div className="text-xs text-text-secondary">{it.series}</div> : null}
                  </div>
                  <span className="shrink-0 text-xs text-text-secondary">{formatPrice(it.price)}</span>
                </button>
              ))
            : null}

          {!loading && items.length === 0 ? (
            <div className="px-3 py-4 text-sm text-text-secondary">По этому запросу пока ничего не найдено.</div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
