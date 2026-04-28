import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Badge from "../components/Badge";
import Button from "../components/Button";
import LeadModal from "../components/LeadModal";
import { api } from "../lib/api";
import { Door, doorImage } from "../components/DoorCard";
import { formatPrice } from "../lib/format";
import { useCart } from "../state/cart";
import { parseCharacteristics } from "../lib/characteristics";
import { splitColorOptions, swatchStyle } from "../lib/catalogMeta";
import { useShop } from "../state/shop";

type Variant = { id: number; widthMm: number; heightMm: number; color: string; imageUrl: string; price: number; sku: string };

function openingLabel(value?: string): string {
  if (value === "LEFT") return "Левое";
  if (value === "RIGHT") return "Правое";
  return "Универсальное";
}

export default function DoorDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [door, setDoor] = useState<Door>();
  const [variants, setVariants] = useState<Variant[]>([]);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [measurementOpen, setMeasurementOpen] = useState(false);
  const [oneClickOpen, setOneClickOpen] = useState(false);
  const cart = useCart();
  const { compare, toggleCompare, toggleFavorite, isCompared, isFavorite } = useShop();

  useEffect(() => {
    api
      .get<Door>(`/api/catalog/doors/${id}`)
      .then((data) => {
        setError(null);
        setDoor(data);
        if (data.productKey) {
          api.get<Variant[]>(`/api/catalog/products/${data.productKey}/variants`).then(setVariants).catch(() => setVariants([]));
        } else {
          setVariants([]);
        }
      })
      .catch(() => {
        setDoor(undefined);
        setVariants([]);
        setError("Не удалось загрузить карточку товара. Обновите страницу или вернитесь в каталог.");
      });
  }, [id]);

  const current = useMemo(() => variants.find((variant) => variant.id === door?.id) || variants[0], [variants, door?.id]);
  const sizes = useMemo(
    () =>
      variants.length
        ? variants.map((variant) => `${variant.widthMm}x${variant.heightMm}`)
        : (door?.availableSizes?.length ? door.availableSizes : [600, 700, 800, 900]).map((size) => `${size}x2000`),
    [door?.availableSizes, variants],
  );

  useEffect(() => {
    if (!door) return;
    setSelectedSize(`${current?.widthMm ?? door.widthMm ?? 800}x${current?.heightMm ?? door.heightMm ?? 2000}`);
    setSelectedColor(door.color);
  }, [door, current?.heightMm, current?.widthMm]);

  const characteristicRows = parseCharacteristics(door?.characteristics);
  const characteristicsMap = useMemo(
    () => new Map(characteristicRows.map((row) => [row.key, row.value])),
    [characteristicRows],
  );
  const colorOptions = useMemo(() => splitColorOptions(characteristicsMap.get("Цвета"), door?.color), [characteristicsMap, door?.color]);

  if (error) {
    return (
      <div className="rounded-promo border border-border bg-surface p-6 shadow-soft">
        <h1 className="text-2xl font-semibold">Карточка товара недоступна</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-text-secondary">{error}</p>
        <Link to="/catalog">
          <Button className="mt-5">Вернуться в каталог</Button>
        </Link>
      </div>
    );
  }

  if (!door) {
    return <div className="h-80 animate-pulse rounded-promo border border-border bg-muted" />;
  }

  const activeVariant = variants.find((variant) => `${variant.widthMm}x${variant.heightMm}` === selectedSize) || current;
  const activeSize = selectedSize || `${activeVariant?.widthMm ?? door.widthMm ?? 800}x${activeVariant?.heightMm ?? door.heightMm ?? 2000}`;
  const activePrice = activeVariant?.price ?? door.price;
  const activeImage =
    selectedColor && selectedColor !== door.color
      ? doorImage({ ...door, imageUrl: undefined, color: selectedColor })
      : doorImage({ ...door, imageUrl: activeVariant?.imageUrl || door.imageUrl });

  const savedDoor = {
    doorId: activeVariant?.id || door.id,
    name: door.name,
    price: activePrice,
    imageUrl: activeImage,
    color: selectedColor || door.color,
    seriesLabel: door.seriesLabel || door.collection,
    doorTypeLabel: door.doorTypeLabel,
    materialGroup: door.materialGroup || door.finish,
    sizeLabel: activeSize,
    sku: activeVariant?.sku || door.sku,
  };

  const summaryRows = [
    ["Артикул", characteristicsMap.get("Артикул") || activeVariant?.sku || door.sku],
    ["Тип", door.doorTypeLabel || (door.doorType === "ENTRANCE" ? "Металлическая дверь" : "Межкомнатная дверь")],
    ["Размер двери", characteristicsMap.get("Размер двери, мм") || activeSize],
    ["Материал полотна", characteristicsMap.get("Материал полотна") || door.material || "Уточняется"],
    ["Внешняя отделка", characteristicsMap.get("Внешняя отделка") || door.finish || "Уточняется"],
    ["Толщина полотна", door.thicknessMm ? `${door.thicknessMm} мм` : "Уточняется"],
    ["Механизм двери", characteristicsMap.get("Механизм двери") || "Распашная"],
    ["Открывание", openingLabel(door.opening)],
  ];

  const switchVariant = (nextSize: string) => {
    setSelectedSize(nextSize);
    const target = variants.find((variant) => `${variant.widthMm}x${variant.heightMm}` === nextSize);
    if (target && target.id !== door.id) navigate(`/doors/${target.id}`);
  };

  return (
    <>
      <div className="grid gap-6">
        <div className="text-sm text-text-secondary">
          <Link to="/" className="hover:text-text-primary">
            Главная
          </Link>{" "}
          →{" "}
          <Link to="/catalog" className="hover:text-text-primary">
            Каталог
          </Link>{" "}
          → {door.name}
        </div>

        <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="grid gap-5">
            <div className="rounded-promo border border-border bg-surface p-5 shadow-soft md:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.16em] text-text-secondary">{door.seriesLabel || door.collection}</div>
                  <h1 className="mt-2 text-4xl font-semibold leading-tight">{door.name}</h1>
                  <p className="mt-4 max-w-3xl text-sm leading-7 text-text-secondary">
                    {door.description || "Подберите размер полотна, цвет и сразу оформите заказ с доставкой, замером и монтажом."}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={`focus-ring rounded-full border px-4 py-2 text-sm font-medium ${
                      isFavorite(activeVariant?.id || door.id) ? "border-accent bg-accent text-white" : "border-border bg-bg/80 text-text-primary"
                    }`}
                    onClick={() => toggleFavorite(savedDoor)}
                  >
                    {isFavorite(activeVariant?.id || door.id) ? "В закладках" : "В закладки"}
                  </button>
                  <button
                    type="button"
                    className={`focus-ring rounded-full border px-4 py-2 text-sm font-medium ${
                      isCompared(activeVariant?.id || door.id) ? "border-accent bg-accent text-white" : "border-border bg-bg/80 text-text-primary"
                    }`}
                    onClick={() => toggleCompare(savedDoor)}
                  >
                    {isCompared(activeVariant?.id || door.id) ? "В сравнении" : "Сравнить"}
                  </button>
                </div>
              </div>

              <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_230px]">
                <div className="rounded-promo border border-border bg-[linear-gradient(180deg,#f7f1ea_0%,#fffdfa_100%)] p-6">
                  <img src={activeImage} alt={door.name} className="h-full min-h-[420px] w-full object-contain" />
                </div>

                <div className="grid gap-3">
                  <div className="rounded-card border border-border bg-bg/75 p-4">
                    <div className="text-xs uppercase tracking-[0.14em] text-text-secondary">Серия</div>
                    <div className="mt-2 font-medium">{door.seriesLabel || door.collection}</div>
                  </div>
                  <div className="rounded-card border border-border bg-bg/75 p-4">
                    <div className="text-xs uppercase tracking-[0.14em] text-text-secondary">Размеры</div>
                    <div className="mt-2 font-medium">600 / 700 / 800 / 900 × 2000</div>
                  </div>
                  <div className="rounded-card border border-border bg-bg/75 p-4">
                    <div className="text-xs uppercase tracking-[0.14em] text-text-secondary">Текущий цвет</div>
                    <div className="mt-2 font-medium">{selectedColor || door.color}</div>
                  </div>
                  <div className="rounded-card border border-border bg-bg/75 p-4">
                    <div className="text-xs uppercase tracking-[0.14em] text-text-secondary">Под заказ</div>
                    <div className="mt-2 text-sm leading-6 text-text-secondary">Поможем с замером, доставкой и подбором комплектации под проем.</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {[
                { title: "Доставка", text: "По г. Нижний Новгород бесплатно" },
                { title: "Установка входной двери", text: "от 6 250 ₽", note: "Указан следующий день" },
                { title: "Оплата", text: "Наличными или картой в магазине, безналичный расчет, в кредит и Сплит" },
              ].map((item) => (
                <div key={item.title} className="rounded-card border border-border bg-surface p-4 shadow-soft">
                  <div className="text-xs uppercase tracking-[0.14em] text-text-secondary">{item.title}</div>
                  <div className="mt-2 font-medium">{item.text}</div>
                  {item.note ? <div className="mt-2 text-sm text-text-secondary">{item.note}</div> : null}
                </div>
              ))}
            </div>
          </div>

          <aside className="space-y-5">
            <div className="rounded-promo border border-border bg-surface p-6 shadow-soft">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.16em] text-text-secondary">{door.doorTypeLabel || "Дверь"}</div>
                  <div className="mt-2 text-4xl font-semibold">{formatPrice(activePrice)}</div>
                </div>
                <div className="rounded-full border border-border bg-muted px-3 py-2 text-sm text-text-secondary">Артикул: {activeVariant?.sku || door.sku}</div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <Badge>{door.materialGroup || door.finish || "Экошпон"}</Badge>
                <Badge>{door.doorKind || (door.glass ? "Остекленная" : "Глухая")}</Badge>
                {door.style ? <Badge>{door.style}</Badge> : null}
                {door.insulation ? <Badge>С утеплением</Badge> : null}
              </div>

              <div className="mt-6 grid gap-3">
                <div>
                  <div className="mb-3 text-sm font-medium">Размер полотна</div>
                  <div className="grid grid-cols-2 gap-2">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => switchVariant(size)}
                        className={`focus-ring rounded-control border px-4 py-3 text-left text-sm font-medium transition ${
                          activeSize === size ? "border-accent bg-muted text-text-primary" : "border-border bg-bg/80 text-text-secondary hover:border-accent/40"
                        }`}
                      >
                        {size.replace("x", " × ")}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-3 text-sm font-medium">Цвет двери</div>
                  <div className="flex flex-wrap gap-3">
                    {colorOptions.map((color) => (
                      <button key={color} type="button" className="group flex items-center gap-3" onClick={() => setSelectedColor(color)}>
                        <span
                          className={`h-11 w-11 rounded-full border-2 transition ${
                            selectedColor === color ? "border-accent shadow-soft" : "border-border"
                          }`}
                          style={{ background: swatchStyle(color) }}
                        />
                        <span className={`text-sm ${selectedColor === color ? "font-medium text-text-primary" : "text-text-secondary"}`}>{color}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-3">
                <Button
                  onClick={() =>
                    cart.add({
                      doorId: activeVariant?.id || door.id,
                      name: door.name,
                      price: activePrice,
                      imageUrl: activeImage,
                      sizeLabel: activeSize,
                      colorLabel: selectedColor || door.color,
                      sku: activeVariant?.sku || door.sku,
                    })
                  }
                >
                  В корзину
                </Button>
                <Button variant="secondary" onClick={() => setOneClickOpen(true)}>
                  Купить в 1 клик
                </Button>
                <Button variant="secondary" onClick={() => setMeasurementOpen(true)}>
                  Вызвать замерщика
                </Button>
                {compare.length === 2 ? (
                  <Link to="/compare">
                    <Button variant="ghost" className="w-full">
                      Открыть сравнение двух дверей
                    </Button>
                  </Link>
                ) : null}
              </div>

              <div className="mt-6 rounded-card border border-border bg-bg/80 p-4">
                <div className="text-sm font-medium">Коммерческие условия</div>
                <div className="mt-2 space-y-2 text-sm leading-6 text-text-secondary">
                  <div>Доставка по г. Нижний Новгород бесплатная.</div>
                  <div>Установка входной двери от 6 250 ₽, возможен выезд на следующий день.</div>
                  <div>Оплата при получении наличными или картой в магазине, безналичный расчет, кредит и Сплит.</div>
                </div>
              </div>
            </div>
          </aside>
        </section>

        <section className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-promo border border-border bg-surface p-5 shadow-soft">
            <div className="text-xs uppercase tracking-[0.16em] text-text-secondary">Основные параметры</div>
            <dl className="mt-4 grid gap-3">
              {summaryRows.map(([label, value]) => (
                <div key={label} className="grid grid-cols-[170px_1fr] gap-3 border-b border-border/70 pb-3 text-sm last:border-b-0 last:pb-0">
                  <dt className="text-text-secondary">{label}</dt>
                  <dd className="font-medium text-text-primary">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="rounded-promo border border-border bg-surface p-5 shadow-soft">
            <div className="text-xs uppercase tracking-[0.16em] text-text-secondary">Характеристики</div>
            {characteristicRows.length ? (
              <dl className="mt-4 grid gap-3">
                {characteristicRows.map((row) => (
                  <div key={row.key} className="grid grid-cols-[220px_1fr] gap-3 border-b border-border/70 pb-3 text-sm last:border-b-0 last:pb-0">
                    <dt className="text-text-secondary">{row.key}</dt>
                    <dd className="font-medium text-text-primary">{row.value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <div className="mt-4 text-sm leading-7 text-text-secondary">Подробные характеристики для этой позиции появятся после обновления карточки.</div>
            )}
          </div>
        </section>
      </div>

      <LeadModal
        open={measurementOpen}
        mode="MEASUREMENT"
        title="Вызвать замерщика"
        doorId={activeVariant?.id || door.id}
        doorName={door.name}
        selectedSize={activeSize}
        selectedColor={selectedColor || door.color}
        onClose={() => setMeasurementOpen(false)}
      />
      <LeadModal
        open={oneClickOpen}
        mode="ONE_CLICK"
        title="Купить в 1 клик"
        doorId={activeVariant?.id || door.id}
        doorName={door.name}
        selectedSize={activeSize}
        selectedColor={selectedColor || door.color}
        onClose={() => setOneClickOpen(false)}
      />
    </>
  );
}
