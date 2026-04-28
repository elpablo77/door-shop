import { Link } from "react-router-dom";
import Badge from "./Badge";
import Button from "./Button";
import { useCart } from "../state/cart";
import { formatPrice } from "../lib/format";

export type Door = {
  id: number;
  sku: string;
  name: string;
  brand?: string;
  collection?: string;
  price: number;
  color: string;
  glass: boolean;
  insulation: boolean;
  imageUrl?: string;
  productKey?: string;
  series?: string;
  seriesLabel?: string;
  doorType?: string;
  doorTypeLabel?: string;
  doorKind?: string;
  style?: string;
  materialGroup?: string;
  colorGroup?: string;
  widthMm?: number;
  heightMm?: number;
  thicknessMm?: number;
  opening?: string;
  material?: string;
  finish?: string;
  description?: string;
  characteristics?: string;
  availableSizes?: number[];
};

const SERIES_PREVIEWS: Record<string, { light: string; dark: string }> = {
  ATUM: { light: "/demo/doors/atum-x7-cappuccino.svg", dark: "/demo/doors/atum-x7-graphite.svg" },
  ATUM_PRO: { light: "/demo/doors/atum-pro-a2-oak.svg", dark: "/demo/doors/atum-pro-a2-smoke.svg" },
  BASIC: { light: "/demo/doors/basic-b1-white.svg", dark: "/demo/doors/basic-b1-grey.svg" },
  EMALEX: { light: "/demo/doors/emalex-e3-white.svg", dark: "/demo/doors/emalex-e3-ivory.svg" },
  ENAMEL: { light: "/demo/doors/enamel-white-w1.svg", dark: "/demo/doors/enamel-color-c1-olive.svg" },
  SOLO_AVANT: { light: "/demo/doors/enamel-color-c1-blue.svg", dark: "/demo/doors/frame-panel-f1-gold.svg" },
  CLASSIC_ART: { light: "/demo/doors/classic-art-ca1-bleached.svg", dark: "/demo/doors/classic-art-ca1-oak.svg" },
  URBAN: { light: "/demo/doors/urban-u1-mocco.svg", dark: "/demo/doors/urban-u1-graphite.svg" },
  VFD_METAL: { light: "/demo/doors/entrance-safe-s1-oak.svg", dark: "/demo/doors/entrance-safe-s1-anthracite.svg" },
  DIVISION: { light: "/demo/doors/entrance-safe-s1-oak.svg", dark: "/demo/doors/entrance-safe-s1-anthracite.svg" },
  THERMAL_VFD: { light: "/demo/doors/entrance-safe-s1-oak.svg", dark: "/demo/doors/entrance-safe-s1-anthracite.svg" },
  ECONOM_VFD: { light: "/demo/doors/basic-b1-white.svg", dark: "/demo/doors/basic-b1-grey.svg" },
};

function normalize(value?: string): string {
  return (value ?? "").toUpperCase().replace(/[^A-Z0-9А-Я]+/g, "_");
}

function looksDark(value?: string): boolean {
  const source = (value ?? "").toLowerCase();
  return ["граф", "антрац", "тём", "тем", "smoke", "dark", "grey", "gray", "black", "сер", "мокко", "черн"].some((token) =>
    source.includes(token),
  );
}

function doorTypeLabel(door: Door): string {
  return door.doorTypeLabel || (door.doorType === "ENTRANCE" ? "Металлическая дверь" : "Межкомнатная дверь");
}

function seriesLabel(door: Door): string {
  return door.seriesLabel || door.collection || door.series?.replaceAll("_", " ") || "Серия";
}

function resolvePreview(door: Door): string {
  if (door.imageUrl?.startsWith("/demo/doors/")) return door.imageUrl;

  const dark = looksDark(door.color) || looksDark(door.finish);
  const seriesKey = normalize(door.series);
  const preview = SERIES_PREVIEWS[seriesKey];
  if (preview) return dark ? preview.dark : preview.light;

  return dark ? "/demo/doors/basic-b1-grey.svg" : "/demo/doors/basic-b1-white.svg";
}

export function doorImage(door: Door): string {
  return resolvePreview(door);
}

export default function DoorCard({ door }: { door: Door }) {
  const cart = useCart();

  return (
    <div className="group overflow-hidden rounded-card border border-border bg-surface shadow-soft transition hover:-translate-y-0.5">
      <Link to={`/doors/${door.id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-[linear-gradient(180deg,#f7f1ea_0%,#fffdfa_100%)] p-5">
          <div className="absolute left-4 top-4 rounded-control border border-border bg-surface/95 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-text-secondary">
            {doorTypeLabel(door)}
          </div>
          <img
            src={doorImage(door)}
            alt={door.name}
            className="h-full w-full object-contain transition duration-300 group-hover:scale-[1.02]"
            loading="lazy"
          />
        </div>
      </Link>

      <div className="p-5">
        <div className="text-xs uppercase tracking-[0.12em] text-text-secondary">{seriesLabel(door)}</div>
        <Link to={`/doors/${door.id}`} className="mt-2 block text-xl font-semibold leading-snug">
          {door.name}
        </Link>
        <div className="mt-2 text-sm text-text-secondary">
          {door.doorKind || "Готовое решение"}
          {door.style ? ` • ${door.style}` : ""}
        </div>
        <div className="mt-1 text-sm text-text-secondary">{door.color}</div>
        <div className="mt-4 text-3xl font-semibold">{formatPrice(door.price)}</div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Badge>{door.materialGroup || door.finish || "Экошпон"}</Badge>
          <Badge>{door.glass ? "Остекленная" : "Глухая"}</Badge>
          {door.insulation ? <Badge>С утеплением</Badge> : null}
        </div>

        <div className="mt-5 flex gap-2">
          <Button
            className="flex-1"
            onClick={() =>
              cart.add({
                doorId: door.id,
                name: door.name,
                price: door.price,
                imageUrl: doorImage(door),
                sku: door.sku,
                colorLabel: door.color,
                sizeLabel: `${door.availableSizes?.includes(800) ? 800 : door.widthMm || 800}x${door.heightMm || 2000}`,
              })
            }
          >
            В корзину
          </Button>
          <Link to={`/doors/${door.id}`} className="flex-1">
            <Button variant="secondary" className="w-full">
              Подробнее
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
