import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type SavedDoor = {
  doorId: number;
  name: string;
  price: number;
  imageUrl?: string;
  color?: string;
  seriesLabel?: string;
  doorTypeLabel?: string;
  materialGroup?: string;
  sizeLabel?: string;
  sku?: string;
};

type ShopState = {
  favorites: SavedDoor[];
  compare: SavedDoor[];
  toggleFavorite: (door: SavedDoor) => void;
  toggleCompare: (door: SavedDoor) => void;
  isFavorite: (doorId: number) => boolean;
  isCompared: (doorId: number) => boolean;
  clearFavorites: () => void;
  clearCompare: () => void;
};

const FAVORITES_KEY = "doorShop.favorites";
const COMPARE_KEY = "doorShop.compare";
const Ctx = createContext<ShopState | null>(null);

function load<T>(key: string): T[] {
  const raw = localStorage.getItem(key);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<SavedDoor[]>([]);
  const [compare, setCompare] = useState<SavedDoor[]>([]);

  useEffect(() => {
    setFavorites(load<SavedDoor>(FAVORITES_KEY));
    setCompare(load<SavedDoor>(COMPARE_KEY));
  }, []);

  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem(COMPARE_KEY, JSON.stringify(compare));
  }, [compare]);

  const value = useMemo<ShopState>(
    () => ({
      favorites,
      compare,
      toggleFavorite: (door) =>
        setFavorites((prev) => (prev.some((item) => item.doorId === door.doorId) ? prev.filter((item) => item.doorId !== door.doorId) : [...prev, door])),
      toggleCompare: (door) =>
        setCompare((prev) => {
          if (prev.some((item) => item.doorId === door.doorId)) {
            return prev.filter((item) => item.doorId !== door.doorId);
          }
          return [...prev.slice(-1), door];
        }),
      isFavorite: (doorId) => favorites.some((item) => item.doorId === doorId),
      isCompared: (doorId) => compare.some((item) => item.doorId === doorId),
      clearFavorites: () => setFavorites([]),
      clearCompare: () => setCompare([]),
    }),
    [favorites, compare],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useShop() {
  const value = useContext(Ctx);
  if (!value) throw new Error("ShopProvider missing");
  return value;
}
