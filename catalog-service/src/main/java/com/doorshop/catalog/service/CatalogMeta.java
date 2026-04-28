package com.doorshop.catalog.service;

import com.doorshop.catalog.domain.Door;

import java.util.*;
import java.util.stream.Collectors;

public final class CatalogMeta {

    public static final List<Integer> DEFAULT_WIDTHS = List.of(600, 700, 800, 900);

    private static final Map<String, String> SERIES_LABELS = Map.ofEntries(
            Map.entry("ATUM", "Атум"),
            Map.entry("ATUM_PRO", "Атум Про"),
            Map.entry("URBAN", "Урбан"),
            Map.entry("EMALEX", "Эмалекс"),
            Map.entry("BASIC", "Бэйсик"),
            Map.entry("ENAMEL", "Белая и цветная Эмаль"),
            Map.entry("SOLO_AVANT", "Соло, Авант"),
            Map.entry("CLASSIC_ART", "Классик Арт"),
            Map.entry("VFD_METAL", "ВФД"),
            Map.entry("DIVISION", "Дивизион"),
            Map.entry("THERMAL_VFD", "С терморазрывом ВФД"),
            Map.entry("ECONOM_VFD", "Эконом ВФД")
    );

    private static final Map<String, String> SERIES_DESCRIPTIONS = Map.ofEntries(
            Map.entry("ATUM", "Современные межкомнатные двери в экошпоне"),
            Map.entry("ATUM_PRO", "Более выразительные модели в глубокой древесной гамме"),
            Map.entry("URBAN", "Строгие современные полотна под интерьер в стиле модерн"),
            Map.entry("EMALEX", "Гладкие модели с эмалекс-покрытием"),
            Map.entry("BASIC", "Практичные базовые двери на каждый день"),
            Map.entry("ENAMEL", "Белые и цветные эмалевые решения"),
            Map.entry("SOLO_AVANT", "Акцентные модели с молдингами и современными вставками"),
            Map.entry("CLASSIC_ART", "Классические двери со стеклом и филёнкой"),
            Map.entry("VFD_METAL", "Надёжные квартирные входные двери"),
            Map.entry("DIVISION", "Усиленные металлические двери для квартиры"),
            Map.entry("THERMAL_VFD", "Входные двери с терморазрывом для дома"),
            Map.entry("ECONOM_VFD", "Доступные металлические двери базовой комплектации")
    );

    private static final List<String> SERIES_ORDER = List.of(
            "ATUM", "ATUM_PRO", "URBAN", "EMALEX", "BASIC", "ENAMEL", "SOLO_AVANT", "CLASSIC_ART",
            "VFD_METAL", "DIVISION", "THERMAL_VFD", "ECONOM_VFD"
    );

    private CatalogMeta() {}

    public static Door representative(List<Door> variants) {
        return variants.stream()
                .sorted(Comparator.comparingInt(d -> Math.abs((d.getWidthMm() == null ? 800 : d.getWidthMm()) - 800)))
                .findFirst()
                .orElseThrow();
    }

    public static Map<String, String> parseCharacteristics(String raw) {
        if (raw == null || raw.isBlank()) {
            return Map.of();
        }

        String normalized = raw.replace("\r", ";").replace("\n", ";");
        Map<String, String> result = new LinkedHashMap<>();
        for (String part : normalized.split(";")) {
            String item = part.trim();
            int idx = item.indexOf('=');
            if (idx < 0) {
                continue;
            }
            String key = item.substring(0, idx).trim();
            String value = item.substring(idx + 1).trim();
            if (!key.isBlank() && !value.isBlank()) {
                result.put(key, value);
            }
        }
        return result;
    }

    public static String characteristic(Door door, String key) {
        return parseCharacteristics(door.getCharacteristics()).get(key);
    }

    public static String seriesLabel(String series) {
        String normalized = normalizeCode(series);
        return SERIES_LABELS.getOrDefault(normalized, normalized.replace('_', ' '));
    }

    public static String seriesDescription(String series) {
        String normalized = normalizeCode(series);
        return SERIES_DESCRIPTIONS.getOrDefault(normalized, "Подбор двери по параметрам и размерам");
    }

    public static int seriesRank(String series) {
        int idx = SERIES_ORDER.indexOf(normalizeCode(series));
        return idx >= 0 ? idx : 999;
    }

    public static String style(Door door) {
        String explicit = characteristic(door, "Стиль");
        if (explicit != null) {
            return containsNormalized(explicit, "класс") ? "Классика" : "Модерн";
        }

        String series = normalizeCode(door.getSeries());
        return List.of("CLASSIC_ART").contains(series) ? "Классика" : "Модерн";
    }

    public static String doorKind(Door door) {
        String explicit = characteristic(door, "Тип полотна");
        if (explicit != null) {
            return normalizeDoorKind(explicit);
        }

        if ("ENTRANCE".equalsIgnoreCase(door.getDoorType())) {
            return door.isInsulation() ? "Квартирная входная" : "Уличная входная";
        }
        return door.isGlass() ? "Остекленная" : "Глухая";
    }

    public static String normalizeDoorKind(String value) {
        String normalized = normalizeText(value);
        if (normalized.contains("улич")) return "Уличная входная";
        if (normalized.contains("квартир")) return "Квартирная входная";
        if (normalized.contains("молдинг") && normalized.contains("стек")) return "Остекленная с молдингом";
        if (normalized.contains("молдинг")) return "Молдинг";
        if (normalized.contains("зерк")) return "Зеркало";
        if (normalized.contains("гриф")) return "Грифель";
        if (normalized.contains("остек") || normalized.contains("стек")) return "Остекленная";
        return "Глухая";
    }

    public static String materialGroup(Door door) {
        String explicit = characteristic(door, "Материал группы");
        if (explicit != null) {
            return normalizeMaterialGroup(explicit);
        }

        String finish = Optional.ofNullable(characteristic(door, "Внешняя отделка"))
                .orElse(Optional.ofNullable(characteristic(door, "Отделка")).orElse(Optional.ofNullable(door.getFinish()).orElse("")));
        return normalizeMaterialGroup(finish);
    }

    public static String normalizeMaterialGroup(String value) {
        String normalized = normalizeText(value);
        if (normalized.contains("крафт")) return "Экокрафт";
        if (normalized.contains("эмал")) return "Эмаль";
        if (normalized.contains("шпон")) return "Шпонированные";
        return "Экошпон";
    }

    public static String colorGroup(Door door) {
        String explicit = characteristic(door, "Группа цвета");
        if (explicit != null) {
            return normalizeColorGroup(explicit);
        }
        return normalizeColorGroup(door.getColor());
    }

    public static String normalizeColorGroup(String value) {
        String color = normalizeText(value);
        if (containsAny(color, "черн")) return "Черные";
        if (containsAny(color, "бел", "айвори", "слонов")) return "Белые";
        if (containsAny(color, "граф", "антрац", "темн", "сер")) return "Темные";
        if (containsAny(color, "син", "олив", "зелен", "крас", "терракот")) return "Яркие цвета";
        return "Светлые";
    }

    public static String doorTypeLabel(String doorType) {
        return "ENTRANCE".equalsIgnoreCase(doorType) ? "Металлическая дверь" : "Межкомнатная дверь";
    }

    public static String normalizeCode(String value) {
        return (value == null ? "" : value.trim().toUpperCase(Locale.ROOT))
                .replaceAll("[^A-ZА-Я0-9]+", "_")
                .replaceAll("_{2,}", "_")
                .replaceAll("^_|_$", "");
    }

    public static String slugify(String value) {
        return normalizeCode(value);
    }

    public static String imageFor(String series, String color, String doorType) {
        String normalizedSeries = normalizeCode(series);
        String normalizedColor = normalizeText(color);
        boolean dark = containsAny(normalizedColor, "граф", "антрац", "чер", "сер", "тем", "мокко");

        if ("ENTRANCE".equalsIgnoreCase(doorType)) {
            return switch (normalizedSeries) {
                case "THERMAL_VFD" -> dark ? "/demo/doors/entrance-safe-s1-anthracite.svg" : "/demo/doors/entrance-safe-s1-oak.svg";
                case "ECONOM_VFD" -> dark ? "/demo/doors/basic-b1-grey.svg" : "/demo/doors/basic-b1-white.svg";
                default -> dark ? "/demo/doors/entrance-safe-s1-anthracite.svg" : "/demo/doors/entrance-safe-s1-oak.svg";
            };
        }

        return switch (normalizedSeries) {
            case "ATUM" -> dark ? "/demo/doors/atum-x7-graphite.svg" : "/demo/doors/atum-x7-cappuccino.svg";
            case "ATUM_PRO" -> dark ? "/demo/doors/atum-pro-a2-smoke.svg" : "/demo/doors/atum-pro-a2-oak.svg";
            case "URBAN" -> dark ? "/demo/doors/urban-u1-graphite.svg" : "/demo/doors/urban-u1-mocco.svg";
            case "EMALEX" -> dark ? "/demo/doors/emalex-e3-ivory.svg" : "/demo/doors/emalex-e3-white.svg";
            case "ENAMEL" -> dark ? "/demo/doors/enamel-color-c1-olive.svg" : "/demo/doors/enamel-white-w1.svg";
            case "SOLO_AVANT" -> dark ? "/demo/doors/frame-panel-f1-gold.svg" : "/demo/doors/enamel-color-c1-blue.svg";
            case "CLASSIC_ART" -> dark ? "/demo/doors/classic-art-ca1-oak.svg" : "/demo/doors/classic-art-ca1-bleached.svg";
            default -> dark ? "/demo/doors/basic-b1-grey.svg" : "/demo/doors/basic-b1-white.svg";
        };
    }

    public static List<Integer> sizes(List<Door> variants) {
        return variants.stream()
                .map(Door::getWidthMm)
                .filter(Objects::nonNull)
                .distinct()
                .sorted()
                .toList();
    }

    public static List<String> sortedDistinct(Collection<String> values) {
        return values.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(v -> !v.isBlank())
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }

    public static String normalizeText(String value) {
        return Optional.ofNullable(value)
                .orElse("")
                .toLowerCase(Locale.ROOT)
                .replace('ё', 'е');
    }

    public static boolean containsNormalized(String source, String query) {
        return normalizeText(source).contains(normalizeText(query));
    }

    private static boolean containsAny(String source, String... tokens) {
        for (String token : tokens) {
            if (source.contains(token)) {
                return true;
            }
        }
        return false;
    }
}
