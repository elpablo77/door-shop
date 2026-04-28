import { FormEvent, useState } from "react";
import Button from "../components/Button";
import Select from "../components/Select";
import Input from "../components/Input";
import { api } from "../lib/api";
import DoorCard, { Door } from "../components/DoorCard";

type FinderRecommendation = Door & { why?: string[] };

function toNullableBoolean(value: string): boolean | null {
  if (value === "true") return true;
  if (value === "false") return false;
  return null;
}

export default function Finder() {
  const [items, setItems] = useState<FinderRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    roomType: "any",
    style: "any",
    needInsulation: "any",
    hasKidsPets: "any",
    lightNeed: "any",
    budget: "25000",
  });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post<FinderRecommendation[]>("/api/catalog/finder/recommendations", {
        roomType: form.roomType,
        style: form.style,
        needInsulation: toNullableBoolean(form.needInsulation),
        hasKidsPets: toNullableBoolean(form.hasKidsPets),
        lightNeed: form.lightNeed,
        budget: Number(form.budget) || null,
      });
      setItems(res ?? []);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6">
      <section className="rounded-promo border border-border bg-surface p-6 shadow-soft md:p-8">
        <div className="text-xs uppercase tracking-[0.18em] text-text-secondary">Подбор по сценарию</div>
        <h1 className="mt-2 text-4xl font-semibold">Подберите дверь по интерьеру и условиям эксплуатации</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-text-secondary">
          В каждом пункте можно выбрать вариант "Не важно", чтобы этот критерий не влиял на подбор.
        </p>
      </section>

      <form onSubmit={submit} className="rounded-promo border border-border bg-surface p-5 shadow-soft">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="grid gap-2">
            <div className="text-sm font-medium">Помещение</div>
            <Select value={form.roomType} onChange={(e) => setForm({ ...form, roomType: e.target.value })}>
              <option value="any">Не важно</option>
              <option value="hallway">Прихожая</option>
              <option value="living_room">Гостиная</option>
              <option value="bedroom">Спальня</option>
              <option value="bathroom">Санузел</option>
              <option value="entrance">Входная зона</option>
            </Select>
          </div>

          <div className="grid gap-2">
            <div className="text-sm font-medium">Стиль</div>
            <Select value={form.style} onChange={(e) => setForm({ ...form, style: e.target.value })}>
              <option value="any">Не важно</option>
              <option value="модерн">Модерн</option>
              <option value="неоклассика">Неоклассика</option>
              <option value="классика">Классика</option>
            </Select>
          </div>

          <div className="grid gap-2">
            <div className="text-sm font-medium">Бюджет</div>
            <Input inputMode="numeric" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} placeholder="Например, 25000" />
          </div>

          <div className="grid gap-2">
            <div className="text-sm font-medium">Шумоизоляция</div>
            <Select value={form.needInsulation} onChange={(e) => setForm({ ...form, needInsulation: e.target.value })}>
              <option value="any">Не важно</option>
              <option value="true">Нужна</option>
              <option value="false">Не обязательна</option>
            </Select>
          </div>

          <div className="grid gap-2">
            <div className="text-sm font-medium">Дети или питомцы</div>
            <Select value={form.hasKidsPets} onChange={(e) => setForm({ ...form, hasKidsPets: e.target.value })}>
              <option value="any">Не важно</option>
              <option value="true">Да</option>
              <option value="false">Нет</option>
            </Select>
          </div>

          <div className="grid gap-2">
            <div className="text-sm font-medium">Свет в помещении</div>
            <Select value={form.lightNeed} onChange={(e) => setForm({ ...form, lightNeed: e.target.value })}>
              <option value="any">Не важно</option>
              <option value="more">Больше света</option>
              <option value="neutral">Нейтрально</option>
              <option value="less">Больше приватности</option>
            </Select>
          </div>

          <div className="md:col-span-2 xl:col-span-3">
            <Button type="submit" disabled={loading}>
              {loading ? "Подбираем..." : "Показать подходящие двери"}
            </Button>
          </div>
        </div>
      </form>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((door) => (
          <div key={door.id} className="grid gap-2">
            <DoorCard door={door} />
            {door.why?.length ? (
              <div className="rounded-card border border-border bg-surface p-4 text-sm leading-6 text-text-secondary">
                {door.why.map((why, index) => (
                  <div key={`${door.id}-${index}`}>• {why}</div>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
