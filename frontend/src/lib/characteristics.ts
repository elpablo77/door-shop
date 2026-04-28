export type CharacteristicRow = { key: string; value: string };

const BLOCKED = new Set(["бренд", "вставка", "исполнение двери", "количество товара", "стиль", "тип полотна"]);

export function parseCharacteristics(raw?: string): CharacteristicRow[] {
  if (!raw) return [];
  const seen = new Set<string>();

  return raw
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const idx = part.indexOf("=");
      if (idx < 0) return null;
      let key = part.slice(0, idx).trim();
      const value = part.slice(idx + 1).trim();
      if (!key || !value) return null;

      if (key.toLowerCase() === "вид добора") key = "Вид погонажа";
      const keyLower = key.toLowerCase();
      if (BLOCKED.has(keyLower)) return null;
      if (keyLower === "отделка") {
        if (seen.has("отделка")) return null;
        seen.add("отделка");
      }

      return { key, value };
    })
    .filter((x): x is CharacteristicRow => Boolean(x));
}
