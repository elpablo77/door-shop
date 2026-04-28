import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/Button";
import Input from "../components/Input";
import Select from "../components/Select";
import { api } from "../lib/api";
import { formatPrice } from "../lib/format";
import { ENTRANCE_SERIES, INTERIOR_SERIES, DOOR_KIND_OPTIONS, MATERIAL_OPTIONS, STYLE_OPTIONS } from "../lib/catalogMeta";
import { mapOrderStatus, ORDER_STATUS_STEPS } from "../lib/orderStatus";
import { useAuth } from "../state/auth";

const STATUSES = ["PROCESSING", "ACCEPTED", "AWAITING_STOCK", "PICKING", "DELIVERY", "COMPLETED"] as const;

type Item = { name: string; qty: number; variantSize?: string; variantColor?: string };
type Order = {
  id: number;
  status: string;
  createdAt: string;
  total?: number;
  customerName?: string;
  phone?: string;
  city?: string;
  address?: string;
  items: Item[];
};

type Lead = {
  id: number;
  type: string;
  doorId?: number;
  doorName?: string;
  selectedSize?: string;
  selectedColor?: string;
  customerName?: string;
  phone: string;
  address?: string;
  message?: string;
  preferredDate?: string;
  status: string;
  createdAt: string;
};

type Product = {
  productKey: string;
  name: string;
  doorType: string;
  series: string;
  seriesLabel: string;
  style: string;
  doorKind: string;
  materialGroup: string;
  color: string;
  colorGroup: string;
  glass: boolean;
  insulation: boolean;
  basePrice: number;
  thicknessMm: number;
  imageUrl?: string;
  description?: string;
  characteristics?: string;
  sizes: number[];
};

type ProductForm = {
  name: string;
  doorType: string;
  series: string;
  style: string;
  doorKind: string;
  materialGroup: string;
  color: string;
  glass: boolean;
  insulation: boolean;
  basePrice: string;
  thicknessMm: string;
  imageUrl: string;
  description: string;
  glassType: string;
  warranty: string;
  country: string;
  characteristicsText: string;
};

const EMPTY_FORM: ProductForm = {
  name: "",
  doorType: "INTERIOR",
  series: "ATUM",
  style: "Модерн",
  doorKind: "Остекленная",
  materialGroup: "Экошпон",
  color: "",
  glass: true,
  insulation: false,
  basePrice: "14990",
  thicknessMm: "39",
  imageUrl: "",
  description: "",
  glassType: "Матовое",
  warranty: "1 год",
  country: "Россия",
  characteristicsText: "",
};

function doorKindOptions(doorType: string) {
  return doorType === "ENTRANCE" ? [...DOOR_KIND_OPTIONS.ENTRANCE] : [...DOOR_KIND_OPTIONS.INTERIOR];
}

function seriesOptions(doorType: string) {
  return doorType === "ENTRANCE" ? ENTRANCE_SERIES : INTERIOR_SERIES;
}

function usesGlass(doorKind: string) {
  return ["Остекленная", "Остекленная с молдингом", "Зеркало"].includes(doorKind);
}

function leadTypeLabel(type: string) {
  return type === "MEASUREMENT" ? "Замер" : "Покупка в 1 клик";
}

export default function AdminOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [tab, setTab] = useState<"products" | "orders" | "leads">("products");
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const productCount = products.length;
  const orderCount = orders.length;
  const leadCount = leads.length;
  const processingCount = orders.filter((order) => order.status !== "COMPLETED").length;

  const load = async () => {
    setLoading(true);
    try {
      const [ordersData, productsData, leadsData] = await Promise.all([
        api.get<Order[]>("/api/orders"),
        api.get<Product[]>("/api/catalog/admin/products"),
        api.get<Lead[]>("/api/leads"),
      ]);
      setOrders(ordersData);
      setProducts(productsData);
      setLeads(leadsData);
    } catch {
      setOrders([]);
      setProducts([]);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      setLoading(false);
      return;
    }
    load();
  }, [user]);

  const updateStatus = async (id: number, status: string) => {
    setSavingId(id);
    try {
      await api.patch(`/api/orders/${id}/status`, { status });
      await load();
    } finally {
      setSavingId(null);
    }
  };

  const resetForm = () => {
    setEditingKey(null);
    setForm(EMPTY_FORM);
  };

  const startEdit = (product: Product) => {
    setEditingKey(product.productKey);
    setForm({
      name: product.name,
      doorType: product.doorType,
      series: product.series,
      style: product.style,
      doorKind: product.doorKind,
      materialGroup: product.materialGroup,
      color: product.color,
      glass: product.glass,
      insulation: product.insulation,
      basePrice: String(product.basePrice),
      thicknessMm: String(product.thicknessMm),
      imageUrl: product.imageUrl || "",
      description: product.description || "",
      glassType: product.glass ? "Матовое" : "",
      warranty: "1 год",
      country: "Россия",
      characteristicsText: (product.characteristics || "")
        .split(";")
        .map((part) => part.trim())
        .filter(Boolean)
        .join("\n"),
    });
    setTab("products");
    setMessage(null);
  };

  const saveProduct = async () => {
    setSubmitting(true);
    setMessage(null);
    const payload = {
      ...form,
      basePrice: Number(form.basePrice),
      thicknessMm: Number(form.thicknessMm),
    };

    try {
      if (editingKey) await api.put(`/api/catalog/admin/products/${editingKey}`, payload);
      else await api.post("/api/catalog/admin/products", payload);
      setMessage(editingKey ? "Изменения сохранены." : "Новая модель добавлена.");
      resetForm();
      await load();
    } catch {
      setMessage("Не удалось сохранить карточку товара.");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteProduct = async (productKey: string) => {
    if (!window.confirm("Удалить модель из каталога?")) return;
    try {
      await api.delete(`/api/catalog/admin/products/${productKey}`);
      if (editingKey === productKey) resetForm();
      await load();
    } catch {
      setMessage("Не удалось удалить модель.");
    }
  };

  const reseedCatalog = async () => {
    if (!window.confirm("Пересоздать демонстрационный каталог? Это удалит текущие товары каталога.")) return;
    try {
      await api.post("/api/catalog/admin/reseed");
      resetForm();
      setMessage("Каталог пересоздан.");
      await load();
    } catch {
      setMessage("Не удалось пересоздать каталог.");
    }
  };

  const currentSeriesOptions = useMemo(() => seriesOptions(form.doorType), [form.doorType]);

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="rounded-promo border border-border bg-surface p-6 shadow-soft">
        <h1 className="text-2xl font-semibold">Админ-панель</h1>
        <p className="mt-3 max-w-xl text-sm leading-7 text-text-secondary">Доступна только пользователю с ролью администратора.</p>
        <Link to="/account/login">
          <Button className="mt-5">Войти под администратором</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-promo border border-border bg-surface p-6 shadow-soft md:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-text-secondary">Администрирование</div>
            <h1 className="mt-1 text-4xl font-semibold">Панель управления магазином</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-text-secondary">
              Управляйте каталогом, заказами и заявками с карточек товара. Основные параметры товара редактируются отдельно, а
              дополнительными характеристиками можно переопределить или дополнить автогенерацию.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={reseedCatalog}>
              Пересоздать каталог
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-4">
          {[
            [`${productCount}`, "Товарных карточек"],
            [`${orderCount}`, "Заказов всего"],
            [`${processingCount}`, "Заказов в работе"],
            [`${leadCount}`, "Новых заявок"],
          ].map(([value, label]) => (
            <div key={label} className="rounded-card border border-border bg-bg/80 p-4">
              <div className="text-2xl font-semibold">{value}</div>
              <div className="mt-1 text-sm text-text-secondary">{label}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex gap-2 rounded-full border border-border bg-surface p-1 shadow-soft">
        {[
          ["products", "Каталог"],
          ["orders", "Заказы"],
          ["leads", "Заявки"],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value as "products" | "orders" | "leads")}
            className={`flex-1 rounded-full px-4 py-3 text-sm ${tab === value ? "bg-muted text-text-primary" : "text-text-secondary"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? <div className="h-64 animate-pulse rounded-promo border border-border bg-muted" /> : null}

      {tab === "products" && !loading ? (
        <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="grid gap-4">
            {products.map((product) => (
              <div key={product.productKey} className="rounded-promo border border-border bg-surface p-5 shadow-soft">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-[0.16em] text-text-secondary">{product.seriesLabel}</div>
                    <div className="mt-1 text-xl font-semibold">{product.name}</div>
                    <div className="mt-2 text-sm text-text-secondary">
                      {product.doorType === "ENTRANCE" ? "Металлическая дверь" : "Межкомнатная дверь"} • {product.doorKind} • {product.color}
                    </div>
                    <div className="mt-2 text-lg font-semibold">{formatPrice(product.basePrice)}</div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => startEdit(product)}>
                      Редактировать
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => deleteProduct(product.productKey)}>
                      Удалить
                    </Button>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 text-sm text-text-secondary">
                  <span className="rounded-full border border-border px-3 py-1">{product.materialGroup}</span>
                  <span className="rounded-full border border-border px-3 py-1">{product.style}</span>
                  <span className="rounded-full border border-border px-3 py-1">{product.colorGroup}</span>
                  <span className="rounded-full border border-border px-3 py-1">Размеры: {product.sizes.join(", ")}</span>
                </div>
              </div>
            ))}
          </div>

          <aside className="rounded-promo border border-border bg-surface p-5 shadow-soft xl:sticky xl:top-28 xl:self-start">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-[0.16em] text-text-secondary">{editingKey ? "Редактирование" : "Новая модель"}</div>
                <div className="mt-1 text-2xl font-semibold">{editingKey ? "Изменить карточку" : "Добавить дверь"}</div>
              </div>
              {editingKey ? (
                <button className="text-sm text-text-secondary hover:text-text-primary" onClick={resetForm}>
                  Очистить
                </button>
              ) : null}
            </div>

            <div className="mt-5 grid gap-3">
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Название модели" />

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                <Select
                  value={form.doorType}
                  onChange={(e) => {
                    const nextDoorType = e.target.value;
                    const nextKinds = doorKindOptions(nextDoorType);
                    const nextSeries = seriesOptions(nextDoorType)[0]?.id || "";
                    const nextDoorKind = nextKinds[0] || "";
                    setForm({
                      ...form,
                      doorType: nextDoorType,
                      series: nextSeries,
                      doorKind: nextDoorKind,
                      glass: usesGlass(nextDoorKind),
                      insulation: nextDoorType === "ENTRANCE",
                      thicknessMm: nextDoorType === "ENTRANCE" ? "72" : "39",
                    });
                  }}
                >
                  <option value="INTERIOR">Межкомнатная</option>
                  <option value="ENTRANCE">Металлическая</option>
                </Select>

                <Select value={form.series} onChange={(e) => setForm({ ...form, series: e.target.value })}>
                  {currentSeriesOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.title}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                <Select value={form.style} onChange={(e) => setForm({ ...form, style: e.target.value })}>
                  {STYLE_OPTIONS.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </Select>

                <Select value={form.materialGroup} onChange={(e) => setForm({ ...form, materialGroup: e.target.value })}>
                  {MATERIAL_OPTIONS.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </Select>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                <Select
                  value={form.doorKind}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      doorKind: e.target.value,
                      glass: usesGlass(e.target.value),
                    })
                  }
                >
                  {doorKindOptions(form.doorType).map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </Select>
                <Input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} placeholder="Основной цвет" />
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                <Input inputMode="numeric" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: e.target.value })} placeholder="Базовая цена" />
                <Input inputMode="numeric" value={form.thicknessMm} onChange={(e) => setForm({ ...form, thicknessMm: e.target.value })} placeholder="Толщина, мм" />
              </div>

              <Input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="URL изображения (необязательно)" />
              <Input value={form.glassType} onChange={(e) => setForm({ ...form, glassType: e.target.value })} placeholder="Вид стекла" />

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                <label className="flex items-center gap-2 text-sm text-text-secondary">
                  <input type="checkbox" checked={form.glass} onChange={(e) => setForm({ ...form, glass: e.target.checked })} />
                  Со стеклом
                </label>
                <label className="flex items-center gap-2 text-sm text-text-secondary">
                  <input type="checkbox" checked={form.insulation} onChange={(e) => setForm({ ...form, insulation: e.target.checked })} />
                  С утеплением
                </label>
              </div>

              <textarea
                className="focus-ring min-h-[120px] w-full rounded-control border border-border bg-surface px-3 py-3 text-sm text-text-primary placeholder:text-text-secondary"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Описание серии и модели"
              />

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                <Input value={form.warranty} onChange={(e) => setForm({ ...form, warranty: e.target.value })} placeholder="Гарантия" />
                <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} placeholder="Страна" />
              </div>

              <textarea
                className="focus-ring min-h-[220px] w-full rounded-control border border-border bg-surface px-3 py-3 text-sm text-text-primary placeholder:text-text-secondary"
                value={form.characteristicsText}
                onChange={(e) => setForm({ ...form, characteristicsText: e.target.value })}
                placeholder={`Дополнительные и переопределяемые характеристики, по одной строке:\nАртикул=842483762\nЦвета=Белый, Капучино, Графит\nГарантия=2 года`}
              />

              <div className="rounded-card border border-border bg-bg/80 p-4 text-sm text-text-secondary">
                Размеры создаются автоматически: 600×2000, 700×2000, 800×2000 и 900×2000. Поля вроде материала полотна,
                внешней отделки, типа, веса и базовых размеров генерируются из основных параметров, а значения из блока
                характеристик могут их переопределить.
              </div>

              {message ? <div className="rounded-card border border-border bg-bg/80 p-3 text-sm text-text-secondary">{message}</div> : null}

              <Button disabled={submitting || !form.name || !form.color || !form.basePrice} onClick={saveProduct}>
                {submitting ? "Сохраняем..." : editingKey ? "Сохранить изменения" : "Добавить модель"}
              </Button>
            </div>
          </aside>
        </div>
      ) : null}

      {tab === "orders" && !loading ? (
        <div className="grid gap-4">
          {orders.map((order) => {
            const activeIdx = Math.max(0, ORDER_STATUS_STEPS.indexOf(order.status as (typeof ORDER_STATUS_STEPS)[number]));
            return (
              <div key={order.id} className="rounded-promo border border-border bg-surface p-5 shadow-soft">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="text-lg font-semibold">Заказ #{order.id}</div>
                    <div className="mt-1 text-sm text-text-secondary">{new Date(order.createdAt).toLocaleString("ru-RU")}</div>
                    {order.customerName || order.phone || order.city ? (
                      <div className="mt-3 text-sm text-text-secondary">
                        {order.customerName ? <div>{order.customerName}</div> : null}
                        {order.phone ? <div>{order.phone}</div> : null}
                        {order.city || order.address ? <div>{[order.city, order.address].filter(Boolean).join(", ")}</div> : null}
                      </div>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-2">
                    <Select value={order.status} onChange={(e) => updateStatus(order.id, e.target.value)} className="w-64">
                      {STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {mapOrderStatus(status)}
                        </option>
                      ))}
                    </Select>
                    <span className="text-sm text-text-secondary">{savingId === order.id ? "Сохраняем..." : "Изменение сохранится сразу"}</span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-6 gap-1">
                  {ORDER_STATUS_STEPS.map((status, idx) => (
                    <div key={status} className={`h-1.5 rounded-full ${idx <= activeIdx ? "bg-accent" : "bg-border"}`} />
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                  <span className="rounded-full border border-border bg-muted px-3 py-1">{mapOrderStatus(order.status)}</span>
                  {order.total ? <span className="rounded-full border border-border bg-muted px-3 py-1">{formatPrice(order.total)}</span> : null}
                </div>

                <div className="mt-4 grid gap-3">
                  {order.items.map((item, idx) => (
                    <div key={`${order.id}-${idx}`} className="rounded-card border border-border bg-bg/80 p-4 text-sm">
                      <div className="font-medium">{item.name}</div>
                      <div className="mt-1 text-text-secondary">
                        {item.qty} шт.
                        {item.variantColor ? ` • ${item.variantColor}` : ""}
                        {item.variantSize ? ` • ${item.variantSize}` : ""}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {tab === "leads" && !loading ? (
        <div className="grid gap-4">
          {leads.map((lead) => (
            <div key={lead.id} className="rounded-promo border border-border bg-surface p-5 shadow-soft">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.16em] text-text-secondary">{leadTypeLabel(lead.type)}</div>
                  <div className="mt-1 text-xl font-semibold">{lead.customerName || "Без имени"}</div>
                  <div className="mt-2 text-sm text-text-secondary">{new Date(lead.createdAt).toLocaleString("ru-RU")}</div>
                </div>
                <div className="rounded-full border border-border bg-muted px-3 py-2 text-sm">{lead.status}</div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-card border border-border bg-bg/80 p-4 text-sm">
                  <div className="font-medium">Контактные данные</div>
                  <div className="mt-2 text-text-secondary">{lead.phone}</div>
                  {lead.address ? <div className="mt-1 text-text-secondary">{lead.address}</div> : null}
                  {lead.message ? <div className="mt-3 text-text-secondary">{lead.message}</div> : null}
                </div>

                <div className="rounded-card border border-border bg-bg/80 p-4 text-sm">
                  <div className="font-medium">Товар</div>
                  <div className="mt-2 text-text-secondary">{lead.doorName || "Без привязки к товару"}</div>
                  {lead.selectedColor ? <div className="mt-1 text-text-secondary">Цвет: {lead.selectedColor}</div> : null}
                  {lead.selectedSize ? <div className="mt-1 text-text-secondary">Размер: {lead.selectedSize}</div> : null}
                  {lead.preferredDate ? <div className="mt-3 text-text-secondary">Предпочтительная дата: {lead.preferredDate}</div> : null}
                </div>
              </div>
            </div>
          ))}

          {!leads.length ? (
            <div className="rounded-card border border-border bg-surface p-5 text-sm text-text-secondary">Заявок пока нет.</div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
