import { Link } from "react-router-dom";
import Button from "../components/Button";
import { formatPrice } from "../lib/format";
import { useCart } from "../state/cart";

export default function CartPage() {
  const cart = useCart();

  if (cart.items.length === 0) {
    return (
      <div className="rounded-promo border border-border bg-surface p-6 shadow-soft md:p-8">
        <h1 className="text-3xl font-semibold">Корзина пока пуста</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-text-secondary">
          Добавьте модели из каталога или карточек товара. После этого можно будет перейти к оформлению заказа.
        </p>
        <Link to="/catalog">
          <Button className="mt-5">Перейти в каталог</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
      <div className="rounded-promo border border-border bg-surface p-5 shadow-soft">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-text-secondary">Текущий заказ</div>
            <h1 className="mt-1 text-3xl font-semibold">Корзина</h1>
          </div>
          <Link to="/catalog" className="text-sm font-medium text-accent">
            Добавить ещё двери
          </Link>
        </div>

        <div className="mt-5 grid gap-4">
          {cart.items.map((item) => (
            <div key={item.doorId} className="grid gap-4 rounded-card border border-border bg-bg/80 p-4 md:grid-cols-[96px_1fr_auto] md:items-center">
              <div className="overflow-hidden rounded-card border border-border bg-white">
                {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="h-24 w-full object-cover" /> : <div className="h-24 bg-muted" />}
              </div>

              <div>
                <div className="text-lg font-medium">{item.name}</div>
                <div className="mt-1 text-sm text-text-secondary">
                  {item.colorLabel ? `${item.colorLabel}` : "Без цвета"}
                  {item.sizeLabel ? ` · ${item.sizeLabel}` : ""}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button className="rounded-control border border-border px-3 py-2" onClick={() => cart.setQty(item.doorId, item.qty - 1)}>
                    −
                  </button>
                  <span className="min-w-8 text-center text-sm">{item.qty}</span>
                  <button className="rounded-control border border-border px-3 py-2" onClick={() => cart.setQty(item.doorId, item.qty + 1)}>
                    +
                  </button>
                  <button className="text-sm text-text-secondary hover:text-text-primary" onClick={() => cart.remove(item.doorId)}>
                    Удалить
                  </button>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm text-text-secondary">Сумма</div>
                <div className="mt-1 text-lg font-semibold">{formatPrice(item.price * item.qty)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <aside className="rounded-promo border border-border bg-surface p-5 shadow-soft lg:sticky lg:top-28 lg:self-start">
        <div className="text-xs uppercase tracking-[0.18em] text-text-secondary">Сводка</div>
        <div className="mt-3 grid gap-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">Позиций</span>
            <span>{cart.items.length}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">Товаров</span>
            <span>{cart.items.reduce((sum, item) => sum + item.qty, 0)}</span>
          </div>
          <div className="rounded-card border border-border bg-bg/80 p-4">
            <div className="text-sm text-text-secondary">Итого</div>
            <div className="mt-1 text-3xl font-semibold">{formatPrice(cart.total)}</div>
          </div>
        </div>

        <Link to="/checkout">
          <Button className="mt-5 w-full">Перейти к оформлению</Button>
        </Link>
        <button className="mt-3 w-full text-sm text-text-secondary hover:text-text-primary" onClick={cart.clear}>
          Очистить корзину
        </button>
      </aside>
    </div>
  );
}
