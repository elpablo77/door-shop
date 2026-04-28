import { Link } from "react-router-dom";
import Button from "../components/Button";
import { formatPrice } from "../lib/format";
import { useShop } from "../state/shop";

const ROWS: Array<[keyof ReturnType<typeof useShop>["compare"][number], string]> = [
  ["seriesLabel", "Серия"],
  ["color", "Цвет"],
  ["materialGroup", "Материал"],
  ["doorTypeLabel", "Тип"],
  ["sizeLabel", "Размер"],
];

export default function ComparePage() {
  const { compare, toggleCompare, clearCompare } = useShop();

  if (!compare.length) {
    return (
      <div className="rounded-promo border border-border bg-surface p-6 shadow-soft">
        <h1 className="text-3xl font-semibold">Сравнение пока пусто</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-text-secondary">Добавьте две двери в сравнение из каталога или карточки товара.</p>
        <Link to="/catalog">
          <Button className="mt-5">Перейти в каталог</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-text-secondary">Сравнение</div>
          <h1 className="mt-1 text-3xl font-semibold">Сравнить двери</h1>
        </div>
        <button className="text-sm text-text-secondary hover:text-text-primary" onClick={clearCompare}>
          Очистить сравнение
        </button>
      </div>

      <div className={`grid gap-4 ${compare.length === 1 ? "md:grid-cols-1" : "md:grid-cols-2"}`}>
        {compare.map((door) => (
          <div key={door.doorId} className="rounded-promo border border-border bg-surface p-5 shadow-soft">
            <div className="overflow-hidden rounded-card border border-border bg-white p-4">
              {door.imageUrl ? <img src={door.imageUrl} alt={door.name} className="h-60 w-full object-contain" /> : null}
            </div>
            <div className="mt-4 text-xl font-semibold">{door.name}</div>
            <div className="mt-2 text-2xl font-semibold">{formatPrice(door.price)}</div>
            <dl className="mt-4 grid gap-3">
              {ROWS.map(([key, label]) => (
                <div key={label} className="grid grid-cols-[140px_1fr] gap-3 border-b border-border pb-3 text-sm last:border-b-0 last:pb-0">
                  <dt className="text-text-secondary">{label}</dt>
                  <dd>{door[key] || "—"}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link to={`/doors/${door.doorId}`}>
                <Button>Открыть карточку</Button>
              </Link>
              <Button variant="secondary" onClick={() => toggleCompare(door)}>
                Убрать
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
