import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Input from "../components/Input";
import Select from "../components/Select";
import { api } from "../lib/api";
import { formatPrice } from "../lib/format";
import { useAuth } from "../state/auth";
import { useCart } from "../state/cart";

const STEPS = ["Контакты", "Адрес", "Доставка", "Комментарий", "Подтверждение"] as const;

export default function CheckoutPage() {
  const cart = useCart();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [f, setF] = useState({
    customerName: "",
    phone: "",
    city: "",
    address: "",
    comment: "",
    deliveryType: "DELIVERY",
  });
  const navigate = useNavigate();

  const summary = useMemo(
    () => ({
      totalQty: cart.items.reduce((sum, item) => sum + item.qty, 0),
      totalPrice: cart.total,
    }),
    [cart.items, cart.total],
  );

  const validateStep = () => {
    if (step === 1 && (!f.customerName.trim() || !f.phone.trim())) {
      setError("Заполните имя и телефон.");
      return false;
    }
    if (step === 2 && f.deliveryType === "DELIVERY" && (!f.city.trim() || !f.address.trim())) {
      setError("Для доставки укажите город и адрес.");
      return false;
    }
    setError("");
    return true;
  };

  const next = () => {
    if (!validateStep()) return;
    setStep((prev) => Math.min(prev + 1, STEPS.length));
  };

  const submit = async () => {
    if (!user) {
      navigate("/account/login");
      return;
    }
    if (!validateStep()) return;

    setSubmitting(true);
    setError("");
    try {
      const order = await api.post<{ id: number }>("/api/orders", {
        ...f,
        items: cart.items.map((it) => ({
          doorId: it.doorId,
          name: it.name,
          price: it.price,
          qty: it.qty,
          variantSize: it.sizeLabel,
          variantColor: it.colorLabel,
          sku: it.sku,
        })),
      });
      cart.clear();
      navigate(`/checkout/success?orderId=${order.id ?? ""}`);
    } catch {
      setError("Не удалось отправить заказ. Проверьте данные и повторите ещё раз.");
    } finally {
      setSubmitting(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="rounded-promo border border-border bg-surface p-6 shadow-soft">
        <h1 className="text-3xl font-semibold">Оформлять пока нечего</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-text-secondary">
          Корзина пуста. Добавьте двери из каталога, после чего можно будет отправить заказ в обработку.
        </p>
        <Link to="/catalog">
          <Button className="mt-5">Вернуться в каталог</Button>
        </Link>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="rounded-promo border border-border bg-surface p-6 shadow-soft">
          <h1 className="text-3xl font-semibold">Войдите, чтобы оформить заказ</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-text-secondary">
            После входа можно сразу завершить оформление: состав корзины останется на месте, а статус заказа появится в личном кабинете.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/account/login">
              <Button>Войти</Button>
            </Link>
            <Link to="/account/register">
              <Button variant="secondary">Создать аккаунт</Button>
            </Link>
          </div>
        </div>

        <aside className="rounded-promo border border-border bg-surface p-5 shadow-soft">
          <div className="text-sm text-text-secondary">Сейчас в корзине</div>
          <div className="mt-1 text-3xl font-semibold">{formatPrice(summary.totalPrice)}</div>
          <div className="mt-2 text-sm text-text-secondary">{summary.totalQty} шт. в выбранных позициях</div>
        </aside>
      </div>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
      <div className="rounded-promo border border-border bg-surface p-5 shadow-soft md:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-text-secondary">Оформление</div>
            <h1 className="mt-1 text-3xl font-semibold">Оформление заказа</h1>
          </div>
          <div className="text-sm text-text-secondary">Шаг {step} из {STEPS.length}</div>
        </div>

        <div className="mt-5 grid gap-2 md:grid-cols-5">
          {STEPS.map((label, idx) => (
            <div key={label} className={`rounded-card border px-3 py-3 text-sm ${idx + 1 <= step ? "border-accent bg-muted text-text-primary" : "border-border bg-bg/70 text-text-secondary"}`}>
              {idx + 1}. {label}
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-card border border-border bg-bg/80 p-5">
          {step === 1 ? (
            <div className="grid gap-3 md:grid-cols-2">
              <Input placeholder="Имя и фамилия" value={f.customerName} onChange={(e) => setF({ ...f, customerName: e.target.value })} />
              <Input placeholder="Телефон" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
            </div>
          ) : null}

          {step === 2 ? (
            <div className="grid gap-3 md:grid-cols-2">
              <Input placeholder="Город" value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} />
              <Input placeholder="Адрес" value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} />
            </div>
          ) : null}

          {step === 3 ? (
            <div className="grid gap-3 md:grid-cols-2">
              <Select value={f.deliveryType} onChange={(e) => setF({ ...f, deliveryType: e.target.value })}>
                <option value="DELIVERY">Доставка</option>
                <option value="PICKUP">Самовывоз</option>
              </Select>
              <div className="rounded-card border border-border bg-surface px-4 py-3 text-sm text-text-secondary">
                {f.deliveryType === "DELIVERY"
                  ? "Менеджер свяжется для согласования времени и деталей монтажа."
                  : "Самовывоз доступен после подтверждения наличия и комплектации заказа."}
              </div>
            </div>
          ) : null}

          {step === 4 ? (
            <textarea
              className="focus-ring min-h-[140px] w-full rounded-control border border-border bg-surface px-3 py-3 text-sm text-text-primary placeholder:text-text-secondary"
              placeholder="Комментарий для менеджера, замерщика или монтажной бригады"
              value={f.comment}
              onChange={(e) => setF({ ...f, comment: e.target.value })}
            />
          ) : null}

          {step === 5 ? (
            <div className="grid gap-3 text-sm text-text-secondary">
              <div>Проверьте контакты, адрес и состав корзины. После подтверждения заказ будет передан менеджеру, а статус появится в личном кабинете.</div>
              <div className="rounded-card border border-border bg-surface p-4">
                <div className="font-medium text-text-primary">{f.customerName || "Получатель не указан"}</div>
                <div className="mt-1">{f.phone || "Телефон не указан"}</div>
                <div className="mt-1">{f.deliveryType === "DELIVERY" ? `${f.city}, ${f.address}` : "Самовывоз"}</div>
              </div>
            </div>
          ) : null}

          {error ? <div className="mt-4 rounded-card border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}

          <div className="mt-5 flex flex-wrap gap-2">
            {step > 1 ? (
              <Button variant="secondary" onClick={() => { setError(""); setStep(step - 1); }}>
                Назад
              </Button>
            ) : null}
            {step < STEPS.length ? (
              <Button onClick={next}>Продолжить</Button>
            ) : (
              <Button onClick={submit} disabled={submitting}>
                {submitting ? "Отправляем..." : "Подтвердить заказ"}
              </Button>
            )}
          </div>
        </div>
      </div>

      <aside className="rounded-promo border border-border bg-surface p-5 shadow-soft lg:sticky lg:top-28 lg:self-start">
        <div className="text-xs uppercase tracking-[0.18em] text-text-secondary">Состав заказа</div>
        <div className="mt-3 grid gap-3">
          {cart.items.map((item) => (
            <div key={item.doorId} className="rounded-card border border-border bg-bg/80 p-4">
              <div className="font-medium">{item.name}</div>
              <div className="mt-1 text-sm text-text-secondary">
                {item.qty} шт.
                {item.colorLabel ? ` · ${item.colorLabel}` : ""}
                {item.sizeLabel ? ` · ${item.sizeLabel}` : ""}
              </div>
              <div className="mt-2 text-sm font-medium">{formatPrice(item.price * item.qty)}</div>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-card border border-border bg-bg/80 p-4">
          <div className="text-sm text-text-secondary">Итого</div>
          <div className="mt-1 text-3xl font-semibold">{formatPrice(summary.totalPrice)}</div>
          <div className="mt-1 text-sm text-text-secondary">{summary.totalQty} шт. в корзине</div>
        </div>
      </aside>
    </div>
  );
}
