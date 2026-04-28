import { Link } from "react-router-dom";
import Button from "../components/Button";
import { formatPrice } from "../lib/format";
import { useShop } from "../state/shop";

export default function FavoritesPage() {
  const { favorites, toggleFavorite, clearFavorites } = useShop();

  if (!favorites.length) {
    return (
      <div className="rounded-promo border border-border bg-surface p-6 shadow-soft">
        <h1 className="text-3xl font-semibold">В закладках пока пусто</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-text-secondary">Добавляйте понравившиеся модели, чтобы быстро вернуться к ним позже.</p>
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
          <div className="text-xs uppercase tracking-[0.18em] text-text-secondary">Закладки</div>
          <h1 className="mt-1 text-3xl font-semibold">Избранные двери</h1>
        </div>
        <button className="text-sm text-text-secondary hover:text-text-primary" onClick={clearFavorites}>
          Очистить все
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {favorites.map((door) => (
          <div key={door.doorId} className="grid gap-4 rounded-promo border border-border bg-surface p-5 shadow-soft md:grid-cols-[140px_1fr]">
            <div className="overflow-hidden rounded-card border border-border bg-white p-3">
              {door.imageUrl ? <img src={door.imageUrl} alt={door.name} className="h-36 w-full object-contain" /> : null}
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.14em] text-text-secondary">{door.seriesLabel || "Серия"}</div>
              <Link to={`/doors/${door.doorId}`} className="mt-1 block text-xl font-semibold">
                {door.name}
              </Link>
              <div className="mt-2 text-sm text-text-secondary">
                {door.color ? `${door.color}` : ""}
                {door.materialGroup ? ` · ${door.materialGroup}` : ""}
              </div>
              <div className="mt-3 text-2xl font-semibold">{formatPrice(door.price)}</div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link to={`/doors/${door.doorId}`}>
                  <Button>Открыть карточку</Button>
                </Link>
                <Button variant="secondary" onClick={() => toggleFavorite(door)}>
                  Убрать
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
