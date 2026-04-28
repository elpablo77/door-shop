import { useEffect, useMemo, useState } from "react";
import Button from "./Button";
import Input from "./Input";
import { api } from "../lib/api";

type Props = {
  open: boolean;
  mode: "MEASUREMENT" | "ONE_CLICK";
  title: string;
  doorId: number;
  doorName: string;
  selectedSize?: string;
  selectedColor?: string;
  onClose: () => void;
};

const EMPTY_FORM = {
  customerName: "",
  phone: "",
  address: "",
  message: "",
  preferredDate: "",
  consent: false,
};

export default function LeadModal({ open, mode, title, doorId, doorName, selectedSize, selectedColor, onClose }: Props) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const submitLabel = useMemo(() => (mode === "MEASUREMENT" ? "Отправить заявку на замер" : "Отправить заявку"), [mode]);
  const minDate = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (!open) return;
    setForm(EMPTY_FORM);
    setMessage(null);
  }, [open]);

  if (!open) return null;

  const submit = async () => {
    if (!form.phone.trim() || !form.consent) {
      setMessage("Заполните телефон и подтвердите согласие на обработку персональных данных.");
      return;
    }

    setSubmitting(true);
    setMessage(null);
    try {
      await api.post("/api/leads", {
        type: mode,
        doorId,
        doorName,
        selectedSize,
        selectedColor,
        customerName: form.customerName,
        phone: form.phone,
        address: form.address,
        message: form.message,
        preferredDate: form.preferredDate || null,
        consent: form.consent,
      });
      setMessage(mode === "MEASUREMENT" ? "Заявка на замер отправлена. Мы свяжемся для подтверждения времени." : "Заявка на покупку в 1 клик отправлена. Мы скоро перезвоним.");
      setForm(EMPTY_FORM);
    } catch {
      setMessage("Не удалось отправить заявку. Попробуйте ещё раз.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/35 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-[620px] rounded-promo border border-border bg-surface p-6 shadow-soft md:p-7" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-text-secondary">{mode === "MEASUREMENT" ? "Замер" : "Покупка в 1 клик"}</div>
            <h3 className="mt-1 text-2xl font-semibold">{title}</h3>
            <p className="mt-2 text-sm text-text-secondary">{doorName}</p>
            {(selectedSize || selectedColor) ? (
              <div className="mt-2 text-sm text-text-secondary">
                {[selectedSize, selectedColor].filter(Boolean).join(" • ")}
              </div>
            ) : null}
          </div>
          <button className="text-sm text-text-secondary hover:text-text-primary" onClick={onClose}>
            Закрыть
          </button>
        </div>

        <div className="mt-5 grid gap-3">
          {mode === "MEASUREMENT" ? (
            <Input type="date" min={minDate} value={form.preferredDate} onChange={(e) => setForm({ ...form, preferredDate: e.target.value })} />
          ) : null}
          <div className="grid gap-3 md:grid-cols-2">
            <Input value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} placeholder="Имя" />
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Телефон" />
          </div>
          <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Адрес" />
          <textarea
            className="focus-ring min-h-[120px] w-full rounded-control border border-border bg-surface px-3 py-3 text-sm text-text-primary placeholder:text-text-secondary"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder="Сообщение (необязательно)"
          />

          <label className="flex items-start gap-2 text-sm text-text-secondary">
            <input type="checkbox" checked={form.consent} onChange={(e) => setForm({ ...form, consent: e.target.checked })} />
            <span>
              Я согласен с{" "}
              <a href="/privacy-policy" target="_blank" rel="noreferrer" className="font-medium text-accent">
                Политикой обработки персональных данных
              </a>
            </span>
          </label>

          {message ? <div className="rounded-card border border-border bg-bg/80 p-3 text-sm text-text-secondary">{message}</div> : null}

          <Button disabled={submitting} onClick={submit}>
            {submitting ? "Отправляем..." : submitLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
