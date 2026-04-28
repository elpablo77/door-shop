import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/Button";
import { api } from "../lib/api";
import { formatPrice } from "../lib/format";
import { mapOrderStatus, ORDER_STATUS_STEPS } from "../lib/orderStatus";
import { useAuth } from "../state/auth";

type Item = { doorId: number; name: string; qty: number; price: number; variantSize?: string; variantColor?: string };
type Order = { id: number; createdAt: string; status: string; total: number; items: Item[] };

export default function AccountOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    api
      .get<Order[]>("/api/orders/my")
      .then(setOrders)
      .catch(() => setError("Не удалось загрузить историю заказов."))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="rounded-promo border border-border bg-surface p-6 shadow-soft">
        <h1 className="text-2xl font-semibold">История заказов</h1>
        <p className="mt-3 max-w-xl text-sm leading-7 text-text-secondary">
          Чтобы видеть статусы и состав заказов, сначала войдите в личный кабинет.
        </p>
        <Link to="/account/login">
          <Button className="mt-5">Перейти ко входу</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-text-secondary">Личный кабинет</div>
          <h1 className="mt-1 text-3xl font-semibold">Мои заказы</h1>
        </div>
        <Link to="/catalog" className="text-sm font-medium text-accent">
          Вернуться в каталог
        </Link>
      </div>

      {loading ? <div className="h-48 animate-pulse rounded-promo border border-border bg-muted" /> : null}
      {error ? <div className="rounded-card border border-red-300 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}

      {!loading && !error && orders.length === 0 ? (
        <div className="rounded-promo border border-border bg-surface p-6 shadow-soft">
          <h2 className="text-xl font-semibold">Заказов пока нет</h2>
          <p className="mt-2 text-sm leading-7 text-text-secondary">
            После оформления первая заявка появится здесь вместе со статусами и составом корзины.
          </p>
          <Link to="/catalog">
            <Button className="mt-5">Выбрать двери</Button>
          </Link>
        </div>
      ) : null}

      <div className="grid gap-4">
        {orders.map((o) => {
          const activeIdx = Math.max(0, ORDER_STATUS_STEPS.indexOf(o.status as (typeof ORDER_STATUS_STEPS)[number]));
          return (
            <div key={o.id} className="rounded-promo border border-border bg-surface p-5 shadow-soft">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-lg font-semibold">Заказ #{o.id}</div>
                  <div className="mt-1 text-sm text-text-secondary">{new Date(o.createdAt).toLocaleString("ru-RU")}</div>
                </div>
                <div className="rounded-full border border-border bg-muted px-3 py-1 text-sm">
                  {mapOrderStatus(o.status)}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-6 gap-1">
                {ORDER_STATUS_STEPS.map((s, idx) => (
                  <div key={s} className={`h-1.5 rounded-full ${idx <= activeIdx ? "bg-accent" : "bg-border"}`} />
                ))}
              </div>

              <div className="mt-4 grid gap-3">
                {o.items.map((i) => (
                  <div key={`${i.doorId}-${i.name}`} className="rounded-card border border-border bg-bg/80 p-4">
                    <div className="font-medium">{i.name}</div>
                    <div className="mt-2 text-sm text-text-secondary">
                      {i.qty} шт. · {formatPrice(i.price)}
                      {i.variantColor ? ` · ${i.variantColor}` : ""}
                      {i.variantSize ? ` · ${i.variantSize}` : ""}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 text-right text-lg font-semibold">Итого: {formatPrice(o.total)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
