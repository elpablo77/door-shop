import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import Container from "./Container";
import Button from "./Button";
import SearchBox from "./SearchBox";
import { useCart } from "../state/cart";
import { formatPrice } from "../lib/format";
import { useAuth } from "../state/auth";
import { api } from "../lib/api";
import { ENTRANCE_SERIES, INTERIOR_SERIES, SERIES_TREE_FALLBACK, SeriesOption } from "../lib/catalogMeta";
import { useShop } from "../state/shop";
import { storeInfo } from "../lib/storeInfo";

const PRIMARY_LINKS = [
  ["/", "Главная"],
  ["/catalog", "Каталог"],
  ["/finder", "Подбор двери"],
  ["/delivery-installation", "Доставка и монтаж"],
  ["/contacts", "Контакты"],
] as const;

const FOOTER_LINKS = [
  ["/payment", "Оплата"],
  ["/warranty-return", "Гарантия и возврат"],
  ["/showrooms", "Салоны"],
  ["/delivery-installation", "Замер и монтаж"],
] as const;

type MenuKey = "INTERIOR" | "ENTRANCE" | null;
type SeriesTreeState = Record<string, SeriesOption[]>;

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
      <path d="M12 20.4 4.9 13.7a4.8 4.8 0 0 1 6.8-6.8L12 7.2l.3-.3a4.8 4.8 0 0 1 6.8 6.8L12 20.4Z" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 7.5 5 5 5-5" />
    </svg>
  );
}

function clampDescription() {
  return {
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical" as const,
    overflow: "hidden",
  };
}

function navLinkClass(isActive: boolean) {
  return `focus-ring inline-flex min-h-[44px] items-center rounded-control border px-4 text-[15px] font-semibold transition ${
    isActive
      ? "border-accent/45 bg-muted text-text-primary"
      : "border-border bg-white text-text-primary hover:border-accent/25 hover:bg-muted/60"
  }`;
}

function CategoryMenu({
  title,
  doorType,
  items,
  activeMenu,
  highlighted,
  onOpen,
  onClose,
  onToggle,
}: {
  title: string;
  doorType: "INTERIOR" | "ENTRANCE";
  items: SeriesOption[];
  activeMenu: MenuKey;
  highlighted: boolean;
  onOpen: (next: MenuKey) => void;
  onClose: () => void;
  onToggle: (next: Exclude<MenuKey, null>) => void;
}) {
  const open = activeMenu === doorType;
  const wideMenu = items.length > 6;

  return (
    <div className="relative" onMouseEnter={() => onOpen(doorType)} onMouseLeave={onClose}>
      <button
        type="button"
        aria-expanded={open}
        className={`focus-ring inline-flex min-h-[44px] items-center gap-2 rounded-control border px-4 text-[15px] font-medium transition ${
          open || highlighted
            ? "border-accent/35 bg-muted text-text-primary"
            : "border-border bg-white text-text-primary hover:border-accent/25 hover:bg-muted/60"
        }`}
        onClick={() => onToggle(doorType)}
      >
        <span>{title}</span>
        <ChevronIcon open={open} />
      </button>

      {open ? (
        <div className={`absolute left-0 top-full z-50 pt-2 ${wideMenu ? "w-[560px] max-w-[calc(100vw-3rem)]" : "w-[360px] max-w-[calc(100vw-3rem)]"}`}>
          <div className="rounded-promo border border-border bg-surface p-4 shadow-soft">
            <div className="mb-3 flex items-end justify-between gap-3">
              <div>
                <div className="text-[11px] uppercase tracking-[0.18em] text-text-secondary">{title}</div>
                <div className="mt-1 text-base font-semibold">Серии дверей</div>
              </div>
              <Link to={`/catalog?doorType=${doorType}`} className="text-sm font-medium text-accent" onClick={() => onOpen(null)}>
                Все модели
              </Link>
            </div>

            <div className={`grid gap-2 ${wideMenu ? "sm:grid-cols-2" : ""}`}>
              {items.map((item) => (
                <Link
                  key={item.id}
                  to={`/catalog?doorType=${doorType}&series=${item.id}`}
                  className="rounded-card border border-border bg-bg px-3 py-2.5 transition hover:border-accent/40 hover:bg-muted"
                  onClick={() => onOpen(null)}
                >
                  <div className="text-sm font-semibold leading-5">{item.title}</div>
                  <div className="mt-1 text-xs leading-4 text-text-secondary" style={clampDescription()}>
                    {item.description}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<MenuKey>(null);
  const [seriesTree, setSeriesTree] = useState<SeriesTreeState>(SERIES_TREE_FALLBACK);
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<number | null>(null);
  const cart = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { favorites, compare, clearCompare } = useShop();

  const clearCloseTimer = () => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const openMenu = (next: MenuKey) => {
    clearCloseTimer();
    setActiveMenu(next);
  };

  const scheduleCloseMenu = () => {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => setActiveMenu(null), 180);
  };

  const toggleMenu = (next: Exclude<MenuKey, null>) => {
    clearCloseTimer();
    setActiveMenu((current) => (current === next ? null : next));
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    setOpen(false);
    setActiveMenu(null);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setActiveMenu(null);
      }
    };

    document.addEventListener("keydown", onKey);
    if (open) drawerRef.current?.querySelector<HTMLElement>("a,button,input")?.focus();

    return () => {
      clearCloseTimer();
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
    setActiveMenu(null);
  }, [location.pathname, location.search]);

  useEffect(() => {
    api
      .get<SeriesTreeState>("/api/catalog/series")
      .then((data) => setSeriesTree({ ...SERIES_TREE_FALLBACK, ...data }))
      .catch(() => setSeriesTree(SERIES_TREE_FALLBACK));
  }, []);

  const cartQty = cart.items.reduce((sum, item) => sum + item.qty, 0);
  const interiorSeries = seriesTree.INTERIOR?.length ? seriesTree.INTERIOR : INTERIOR_SERIES;
  const entranceSeries = seriesTree.ENTRANCE?.length ? seriesTree.ENTRANCE : ENTRANCE_SERIES;
  const rawDoorType = new URLSearchParams(location.search).get("doorType");
  const currentDoorType: MenuKey = rawDoorType === "INTERIOR" || rawDoorType === "ENTRANCE" ? rawDoorType : null;
  const primaryPhone = storeInfo.phones[0];

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-bg text-text-primary">
      <div className="relative flex min-h-screen flex-col">
        <header className="sticky top-0 z-40 border-b border-border bg-bg">
          <div className="border-b border-border bg-muted/90 text-xs text-text-secondary">
            <Container>
              <div className="flex min-h-[38px] flex-col justify-center gap-1 py-1 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3 sm:py-0">
                <span>Регион: {storeInfo.region}</span>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  <a href={primaryPhone.href} className="transition hover:text-text-primary">
                    {primaryPhone.text}
                  </a>
                  <span>{storeInfo.schedule.short}</span>
                </div>
              </div>
            </Container>
          </div>

          <Container>
            <div className="grid min-h-[88px] items-center gap-3 py-3 lg:grid-cols-[auto_minmax(320px,1fr)_auto] lg:gap-4 lg:py-4">
              <div className="flex items-center gap-3">
                <button
                  className="focus-ring rounded-control border border-border p-2 md:hidden"
                  aria-expanded={open}
                  aria-label="Открыть меню"
                  onClick={() => setOpen(true)}
                >
                  ☰
                </button>

                <Link to="/" className="min-w-0 shrink-0">
                  <div className="flex items-center gap-3">
                    <img src="/brand/vfd-logo.png" alt={storeInfo.brand.full} className="h-9 w-auto shrink-0 object-contain sm:h-10" />
                    <div className="min-w-0 leading-tight">
                      <div className="font-semibold tracking-[0.08em] text-text-primary">{storeInfo.brand.short}</div>
                      <div className="max-w-[220px] text-[11px] leading-4 text-text-secondary">{storeInfo.brand.full}</div>
                    </div>
                  </div>
                </Link>
              </div>

              <div className="hidden min-w-0 md:block">
                <SearchBox />
              </div>

              <div className="hidden items-center justify-end gap-2 lg:flex">
                <Link
                  to="/favorites"
                  aria-label="Избранное"
                  className="focus-ring relative grid h-10 w-10 place-items-center rounded-control border border-border bg-surface text-text-primary shadow-soft transition hover:bg-muted/60"
                >
                  <HeartIcon filled={favorites.length > 0} />
                  {favorites.length ? (
                    <span className="absolute -right-1 -top-1 min-w-[20px] rounded-full bg-accent px-1.5 py-0.5 text-center text-[11px] font-semibold leading-none text-white">
                      {favorites.length}
                    </span>
                  ) : null}
                </Link>

                <Link to={user ? "/account" : "/account/login"}>
                  <Button size="sm" variant="secondary" className="min-w-[120px]">
                    {user ? "Кабинет" : "Войти"}
                  </Button>
                </Link>

                <Link to="/cart">
                  <Button size="sm" variant="secondary" className="min-w-[178px] justify-between">
                    <span>Корзина {cartQty}</span>
                    <span>{formatPrice(cart.total)}</span>
                  </Button>
                </Link>
              </div>
            </div>

            <div className="pb-3 md:hidden">
              <SearchBox mobile />
            </div>

            <div className="hidden border-t border-border py-4 md:block">
              <nav className="flex flex-wrap items-center gap-2 rounded-promo border border-border bg-surface p-2 shadow-soft">
                <NavLink to="/" end className={({ isActive }) => navLinkClass(isActive)}>
                  Главная
                </NavLink>
                <NavLink to="/catalog" className={({ isActive }) => navLinkClass(isActive && location.pathname === "/catalog" && !currentDoorType)}>
                  Каталог
                </NavLink>
                <CategoryMenu
                  title="Двери межкомнатные"
                  doorType="INTERIOR"
                  items={interiorSeries}
                  activeMenu={activeMenu}
                  highlighted={location.pathname === "/catalog" && currentDoorType === "INTERIOR"}
                  onOpen={openMenu}
                  onClose={scheduleCloseMenu}
                  onToggle={toggleMenu}
                />
                <CategoryMenu
                  title="Двери металлические"
                  doorType="ENTRANCE"
                  items={entranceSeries}
                  activeMenu={activeMenu}
                  highlighted={location.pathname === "/catalog" && currentDoorType === "ENTRANCE"}
                  onOpen={openMenu}
                  onClose={scheduleCloseMenu}
                  onToggle={toggleMenu}
                />
                {PRIMARY_LINKS.slice(2).map(([to, label]) => (
                  <NavLink key={to} to={to} className={({ isActive }) => navLinkClass(isActive)}>
                    {label}
                  </NavLink>
                ))}
              </nav>
            </div>
          </Container>
        </header>

        {open ? (
          <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm" onClick={() => setOpen(false)}>
            <div
              ref={drawerRef}
              role="dialog"
              className="flex h-full w-80 max-w-[92vw] flex-col bg-surface p-4 shadow-soft"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img src="/brand/vfd-logo.png" alt={storeInfo.brand.full} className="h-9 w-auto object-contain" />
                  <div>
                    <div className="font-semibold">{storeInfo.brand.short}</div>
                    <div className="text-xs text-text-secondary">{storeInfo.brand.full}</div>
                  </div>
                </div>
                <button className="rounded-control border border-border px-3 py-2 text-sm" onClick={() => setOpen(false)}>
                  Закрыть
                </button>
              </div>

              <SearchBox mobile />

              <div className="mt-5 grid gap-5 overflow-y-auto pb-4">
                <div className="grid gap-2">
                  <div className="text-xs uppercase tracking-[0.14em] text-text-secondary">Основное меню</div>
                  {PRIMARY_LINKS.map(([to, label]) => (
                    <Link key={to} to={to} className="rounded-control border border-transparent px-3 py-2 hover:border-border hover:bg-muted">
                      {label}
                    </Link>
                  ))}
                </div>

                <div className="grid gap-2">
                  <div className="text-xs uppercase tracking-[0.14em] text-text-secondary">Межкомнатные серии</div>
                  {interiorSeries.map((item) => (
                    <Link key={item.id} to={`/catalog?doorType=INTERIOR&series=${item.id}`} className="rounded-control px-3 py-2 hover:bg-muted">
                      {item.title}
                    </Link>
                  ))}
                </div>

                <div className="grid gap-2">
                  <div className="text-xs uppercase tracking-[0.14em] text-text-secondary">Металлические серии</div>
                  {entranceSeries.map((item) => (
                    <Link key={item.id} to={`/catalog?doorType=ENTRANCE&series=${item.id}`} className="rounded-control px-3 py-2 hover:bg-muted">
                      {item.title}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="mt-4 grid gap-2 border-t border-border pt-4">
                <Link to="/favorites">
                  <Button variant="secondary" className="w-full justify-between">
                    <span>Избранное</span>
                    <span>{favorites.length}</span>
                  </Button>
                </Link>
                {compare.length === 2 ? (
                  <Link to="/compare">
                    <Button variant="secondary" className="w-full justify-between">
                      <span>Сравнение</span>
                      <span>{compare.length}</span>
                    </Button>
                  </Link>
                ) : null}
                <Link to={user ? "/account" : "/account/login"}>
                  <Button variant="secondary" className="w-full">
                    {user ? "Кабинет" : "Войти"}
                  </Button>
                </Link>
                <Link to="/cart">
                  <Button variant="secondary" className="w-full justify-between">
                    <span>Корзина {cartQty}</span>
                    <span>{formatPrice(cart.total)}</span>
                  </Button>
                </Link>
                {user ? (
                  <>
                    <Link to="/account/orders" className="rounded-control px-3 py-2 hover:bg-muted">
                      Мои заказы
                    </Link>
                    {user.role === "ADMIN" ? (
                      <Link to="/admin" className="rounded-control px-3 py-2 hover:bg-muted">
                        Админ-панель
                      </Link>
                    ) : null}
                    <button className="rounded-control px-3 py-2 text-left hover:bg-muted" onClick={handleLogout}>
                      Выйти
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}

        {compare.length === 2 && location.pathname !== "/compare" ? (
          <div className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex justify-center px-4">
            <div className="pointer-events-auto flex w-full max-w-[560px] flex-wrap items-center justify-between gap-3 rounded-promo border border-border bg-surface px-4 py-3 shadow-soft">
              <div className="min-w-0">
                <div className="text-[11px] uppercase tracking-[0.18em] text-text-secondary">Сравнение</div>
                <div className="text-sm font-medium">Вы выбрали 2 двери. Можно открыть сравнение.</div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link to="/compare">
                  <Button size="sm">Сравнить</Button>
                </Link>
                <button className="rounded-control px-3 py-2 text-sm text-text-secondary transition hover:bg-muted hover:text-text-primary" onClick={clearCompare}>
                  Очистить
                </button>
              </div>
            </div>
          </div>
        ) : null}

        <main className="flex-1 pb-16 pt-6 md:pb-20 md:pt-10">
          <Container>{children}</Container>
        </main>

        <footer className="border-t border-border bg-surface/85 py-10 text-sm text-text-secondary">
          <Container>
            <div className="grid gap-8 lg:grid-cols-[1.3fr_0.9fr_0.9fr_1fr]">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <img src="/brand/vfd-logo.png" alt={storeInfo.brand.full} className="h-10 w-auto object-contain" />
                  <div>
                    <div className="font-semibold text-text-primary">{storeInfo.brand.short}</div>
                    <div className="text-xs text-text-secondary">{storeInfo.brand.full}</div>
                  </div>
                </div>
                <p>
                  Межкомнатные и входные двери в наличии и под заказ, выезд на замер, доставка и монтаж по Нижнему Новгороду и
                  области.
                </p>
              </div>

              <div className="grid gap-2">
                <div className="font-medium text-text-primary">Покупателям</div>
                {FOOTER_LINKS.map(([to, label]) => (
                  <Link key={to} to={to} className="hover:text-text-primary">
                    {label}
                  </Link>
                ))}
              </div>

              <div className="grid gap-2">
                <div className="font-medium text-text-primary">Навигация</div>
                {PRIMARY_LINKS.map(([to, label]) => (
                  <Link key={to} to={to} className="hover:text-text-primary">
                    {label}
                  </Link>
                ))}
              </div>

              <div className="space-y-2">
                <div className="font-medium text-text-primary">Контакты</div>
                <div className="grid gap-1">
                  {storeInfo.phones.map((phone) => (
                    <a key={phone.href} href={phone.href} className="transition hover:text-text-primary">
                      {phone.label}: {phone.text}
                    </a>
                  ))}
                </div>
                <a href={`mailto:${storeInfo.email}`} className="block transition hover:text-text-primary">
                  E-mail: {storeInfo.email}
                </a>
                <div>{storeInfo.address}</div>
                <div>{storeInfo.schedule.short}</div>
              </div>
            </div>

            <div className="mt-8 border-t border-border pt-4 text-xs text-text-secondary">
              {storeInfo.disclaimer}
            </div>
          </Container>
        </footer>
      </div>
    </div>
  );
}
