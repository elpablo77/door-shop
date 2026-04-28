import { Link, useSearchParams } from "react-router-dom";
import Button from "../components/Button";

export default function CheckoutSuccessPage() {
  const [sp] = useSearchParams();
  const orderId = sp.get("orderId") || "уточняется";

  return (
    <div className="rounded-promo border border-border bg-surface p-6 shadow-soft md:p-8">
      <div className="inline-flex items-center rounded-full border border-border bg-muted px-3 py-1 text-xs uppercase tracking-[0.18em] text-text-secondary">
        Заказ отправлен
      </div>
      <h1 className="mt-4 text-3xl font-semibold">Спасибо за заказ</h1>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-text-secondary">
        Заказ принят. Менеджер свяжется для подтверждения деталей, а статус можно посмотреть в личном кабинете.
      </p>

      <div className="mt-5 rounded-card border border-border bg-bg/80 p-5">
        <div className="text-sm text-text-secondary">Номер заказа</div>
        <div className="mt-1 text-3xl font-semibold">#{orderId}</div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link to="/account/orders">
          <Button>Перейти к заказам</Button>
        </Link>
        <Link to="/catalog">
          <Button variant="secondary">Продолжить подбор</Button>
        </Link>
      </div>
    </div>
  );
}
