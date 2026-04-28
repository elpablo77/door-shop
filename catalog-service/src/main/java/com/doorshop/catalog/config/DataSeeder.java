package com.doorshop.catalog.config;

import com.doorshop.catalog.domain.Door;
import com.doorshop.catalog.repo.DoorRepository;
import com.doorshop.catalog.service.CatalogMeta;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Configuration
public class DataSeeder {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);
    private static final String BRAND = "Владимирская Фабрика Дверей";
    private static final Set<String> REQUIRED_SERIES = Set.of(
            "ATUM", "ATUM_PRO", "URBAN", "EMALEX", "BASIC", "ENAMEL", "SOLO_AVANT", "CLASSIC_ART",
            "VFD_METAL", "DIVISION", "THERMAL_VFD", "ECONOM_VFD"
    );
    private static final Set<String> DEPRECATED_SERIES = Set.of("ENAMEL_WHITE", "ENAMEL_COLOR", "FRAME_PANEL", "ENTRANCE_SAFE");

    @Bean
    CommandLineRunner seedCatalog(DoorRepository repo, JdbcTemplate jdbcTemplate) {
        return args -> {
            boolean migrated = ensureLegacySchemaCompatibility(jdbcTemplate);
            long existing = repo.count();

            if (existing > 0) {
                if (requiresRefresh(repo)) {
                    log.warn("Outdated catalog dataset detected. Refreshing seeded catalog in-place (count={})", existing);
                    reseed(repo);
                    return;
                }
                if (migrated) {
                    log.info("Legacy catalog schema migrated in-place; existing rows preserved (count={})", existing);
                }
                log.info("Catalog seeding skipped: doors already exist (count={})", existing);
                return;
            }

            long inserted = seedAll(repo);
            log.info("Seeding catalog completed: inserted {} variants", inserted);
        };
    }

    private boolean requiresRefresh(DoorRepository repo) {
        Set<String> currentSeries = repo.findAll().stream().map(Door::getSeries).collect(java.util.stream.Collectors.toSet());
        boolean hasManagedKeys = repo.findAll().stream().anyMatch(door -> door.getProductKey() != null && door.getProductKey().startsWith("VFD_"));
        return !hasManagedKeys || !currentSeries.containsAll(REQUIRED_SERIES) || currentSeries.stream().anyMatch(DEPRECATED_SERIES::contains);
    }

    private boolean ensureLegacySchemaCompatibility(JdbcTemplate jdbcTemplate) {
        boolean hasDoorType = hasColumn(jdbcTemplate, "doors", "door_type");
        boolean hasSeries = hasColumn(jdbcTemplate, "doors", "series");
        boolean hasProductKey = hasColumn(jdbcTemplate, "doors", "product_key");

        if (hasDoorType && hasSeries && hasProductKey) {
            return false;
        }

        log.warn("Legacy catalog schema detected. Applying compatibility migration for doors table.");
        jdbcTemplate.execute("alter table doors add column if not exists door_type varchar(20)");
        jdbcTemplate.execute("alter table doors add column if not exists series varchar(40)");
        jdbcTemplate.execute("alter table doors add column if not exists product_key varchar(80)");

        jdbcTemplate.execute("alter table doors alter column door_type set default 'INTERIOR'");
        jdbcTemplate.execute("alter table doors alter column series set default 'BASIC'");

        jdbcTemplate.update("""
                update doors
                   set door_type = case
                       when upper(coalesce(collection_name, '')) = 'ENTRANCE' or insulation then 'ENTRANCE'
                       else 'INTERIOR'
                   end
                 where door_type is null or btrim(door_type) = ''
                """);

        jdbcTemplate.update("""
                update doors
                   set series = case
                       when upper(coalesce(collection_name, '')) = 'ENTRANCE' then 'VFD_METAL'
                       when btrim(coalesce(collection_name, '')) = '' then 'BASIC'
                       else upper(regexp_replace(collection_name, '[^A-Za-z0-9]+', '_', 'g'))
                   end
                 where series is null or btrim(series) = ''
                """);

        jdbcTemplate.update("""
                update doors
                   set product_key = case
                       when nullif(btrim(sku), '') is not null then 'LEGACY_' || upper(regexp_replace(sku, '[^A-Za-z0-9]+', '_', 'g'))
                       else 'LEGACY_' || id
                   end
                 where product_key is null or btrim(product_key) = ''
                """);

        jdbcTemplate.execute("alter table doors alter column door_type set not null");
        jdbcTemplate.execute("alter table doors alter column series set not null");
        jdbcTemplate.execute("alter table doors alter column product_key set not null");
        jdbcTemplate.execute("create index if not exists idx_doors_product_key on doors (product_key)");

        return true;
    }

    private boolean hasColumn(JdbcTemplate jdbcTemplate, String tableName, String columnName) {
        Integer count = jdbcTemplate.queryForObject(
                """
                select count(*)
                  from information_schema.columns
                 where table_schema = 'public'
                   and table_name = ?
                   and column_name = ?
                """,
                Integer.class,
                tableName,
                columnName
        );
        return count != null && count > 0;
    }

    public long reseed(DoorRepository repo) {
        repo.deleteAll();
        long inserted = seedAll(repo);
        log.info("Catalog reseeded via admin endpoint: inserted {} variants", inserted);
        return inserted;
    }

    private long seedAll(DoorRepository repo) {
        List<SeedProduct> products = List.of(
                new SeedProduct("VFD_ATUM_A1", "Atum A1", "INTERIOR", "ATUM", "Модерн", "Остекленная", "Экошпон", "Белый", false, false, 39, "Матовое", BigDecimal.valueOf(14990), "/demo/doors/atum-x7-white.svg", "Лаконичная модель для современных интерьеров.", "Белый|Капучино|Графит|Черный"),
                new SeedProduct("VFD_ATUM_PRO_P1", "Atum Pro P1", "INTERIOR", "ATUM_PRO", "Модерн", "Глухая", "Экошпон", "Светлый дуб", false, false, 39, null, BigDecimal.valueOf(16490), "/demo/doors/atum-pro-a2-oak.svg", "Плотное современное полотно с древесной фактурой.", "Светлый дуб|Дуб дымчатый|Графит|Черный"),
                new SeedProduct("VFD_URBAN_U1", "Urban U1", "INTERIOR", "URBAN", "Модерн", "Грифель", "Экокрафт", "Графит", false, false, 38, null, BigDecimal.valueOf(15690), "/demo/doors/urban-u1-graphite.svg", "Строгая серия под минималистичный интерьер.", "Белый|Серый|Графит|Черный"),
                new SeedProduct("VFD_EMALEX_E3", "Emalex E3", "INTERIOR", "EMALEX", "Модерн", "Остекленная", "Эмаль", "Белый", true, false, 40, "Матовое", BigDecimal.valueOf(17990), "/demo/doors/emalex-e3-white.svg", "Гладкое полотно с мягкой современной геометрией.", "Белый|Слоновая кость|Грей|Темный графит"),
                new SeedProduct("VFD_BASIC_B1", "Basic B1", "INTERIOR", "BASIC", "Модерн", "Глухая", "Экокрафт", "Капучино", false, false, 36, null, BigDecimal.valueOf(12990), "/demo/doors/basic-b1-white.svg", "Практичное базовое решение для квартиры и офиса.", "Белый|Капучино|Светлый дуб|Темный дуб"),
                new SeedProduct("VFD_ENAMEL_E1", "Enamel E1", "INTERIOR", "ENAMEL", "Модерн", "Молдинг", "Эмаль", "Оливковый", false, false, 39, null, BigDecimal.valueOf(18990), "/demo/doors/enamel-color-c1-olive.svg", "Эмалевая серия с молдингами и акцентной палитрой.", "Белый|Оливковый|Терракота|Графит"),
                new SeedProduct("VFD_SOLO_AVANT_S1", "Solo Avant S1", "INTERIOR", "SOLO_AVANT", "Модерн", "Остекленная с молдингом", "Экошпон", "Темный графит", true, false, 39, "Матовое", BigDecimal.valueOf(19490), "/demo/doors/frame-panel-f1-gold.svg", "Современное полотно с молдингом и матовым стеклом.", "Белый|Темный графит|Серый|Черный"),
                new SeedProduct("VFD_CLASSIC_ART_C1", "Classic Art C1", "INTERIOR", "CLASSIC_ART", "Классика", "Зеркало", "Шпонированные", "Белый дуб", false, false, 40, null, BigDecimal.valueOf(20990), "/demo/doors/classic-art-ca1-bleached.svg", "Классическая серия с декоративными элементами.", "Белый дуб|Орех|Антрацит|Белый"),
                new SeedProduct("VFD_VFD_METAL_M1", "VFD M1", "ENTRANCE", "VFD_METAL", "Модерн", "Квартирная входная", "Экошпон", "Антрацит", false, true, 72, null, BigDecimal.valueOf(28990), "/demo/doors/entrance-safe-s1-anthracite.svg", "Надежная входная дверь для квартиры.", "Антрацит|Черный|Темный орех|Белый"),
                new SeedProduct("VFD_DIVISION_D1", "Division D1", "ENTRANCE", "DIVISION", "Модерн", "Квартирная входная", "Экошпон", "Черный", false, true, 74, null, BigDecimal.valueOf(31990), "/demo/doors/entrance-safe-s1-anthracite.svg", "Усиленная металлическая дверь с акцентом на шумоизоляцию.", "Черный|Антрацит|Белый"),
                new SeedProduct("VFD_THERMAL_T1", "Thermal T1", "ENTRANCE", "THERMAL_VFD", "Модерн", "Уличная входная", "Экокрафт", "Темный орех", false, false, 86, null, BigDecimal.valueOf(38990), "/demo/doors/entrance-safe-s1-oak.svg", "Входная дверь с терморазрывом для частного дома.", "Темный орех|Антрацит|Белый"),
                new SeedProduct("VFD_ECONOM_EC1", "Econom EC1", "ENTRANCE", "ECONOM_VFD", "Модерн", "Квартирная входная", "Экошпон", "Серый", false, true, 68, null, BigDecimal.valueOf(22990), "/demo/doors/basic-b1-grey.svg", "Доступная металлическая дверь для базовых задач.", "Серый|Белый|Антрацит")
        );

        for (SeedProduct product : products) {
            seedProduct(repo, product);
        }

        return repo.count();
    }

    private void seedProduct(DoorRepository repo, SeedProduct product) {
        int index = 1;
        for (Integer width : CatalogMeta.DEFAULT_WIDTHS) {
            Door door = new Door();
            door.setSku(product.productKey() + "-" + width);
            door.setName(product.name());
            door.setBrand(BRAND);
            door.setCollection(CatalogMeta.seriesLabel(product.series()));
            door.setPrice(product.basePrice().add(BigDecimal.valueOf((width - 800L) * 5L)));
            door.setWidthMm(width);
            door.setHeightMm(2000);
            door.setThicknessMm(product.thicknessMm());
            door.setOpening("UNIVERSAL");
            door.setMaterial(materialText(product));
            door.setFinish(finishText(product.materialGroup()));
            door.setColor(product.color());
            door.setGlass(product.glass());
            door.setInsulation(product.insulation());
            door.setDoorType(product.doorType());
            door.setSeries(product.series());
            door.setProductKey(product.productKey());
            door.setGlassType(product.glass() ? product.glassType() : "Нет");
            door.setCharacteristics(buildCharacteristics(product, width, index++));
            door.setDescription(product.description());
            door.setImageUrl(product.imageUrl());
            repo.save(door);
        }
    }

    private String buildCharacteristics(SeedProduct product, Integer width, int index) {
        Map<String, String> rows = new LinkedHashMap<>();
        rows.put("Артикул", product.productKey().replace("VFD_", "") + "-" + index + width);
        rows.put("Тип", CatalogMeta.doorTypeLabel(product.doorType()));
        rows.put("Механизм двери", "Распашная");
        rows.put("Размер двери, мм", width + "x2000");
        rows.put("Общая толщина двери, мм", String.valueOf(product.thicknessMm()));
        rows.put("Внешняя отделка", finishText(product.materialGroup()));
        rows.put("Ширина полотна, мм", String.valueOf(width));
        rows.put("Высота полотна, мм", "2000");
        if (product.glass()) {
            rows.put("Толщина стекла, мм", "4");
            rows.put("Вид стекла", product.glassType());
        }
        rows.put("Материал полотна", materialText(product));
        rows.put("Дверная ручка", "Отсутствует");
        rows.put("Фрезеровка под петли", "Нет");
        rows.put("Фрезеровка под замок", "Нет");
        rows.put("Петли", "Нет в комплекте");
        rows.put("Вид погонажа", product.doorType().equals("ENTRANCE") ? "Коробка с уплотнителем" : "Телескопический");
        rows.put("Вес с упаковкой, г", product.doorType().equals("ENTRANCE") ? "32000" : "18000");
        rows.put("Цвет", product.color());
        rows.put("Цвета", product.colorOptions());
        rows.put("Группа цвета", CatalogMeta.normalizeColorGroup(product.color()));
        rows.put("Гарантия", "1 год");
        rows.put("Страна-изготовитель", "Россия");
        rows.put("Стиль", product.style().contains("Класс") ? "Классика" : "Модерн");
        rows.put("Материал группы", product.materialGroup());
        rows.put("Тип полотна", product.doorKind());
        if (product.insulation()) {
            rows.put("Утепление", "Минеральная плита");
        }
        return rows.entrySet().stream().map(entry -> entry.getKey() + "=" + entry.getValue()).collect(java.util.stream.Collectors.joining("; "));
    }

    private String materialText(SeedProduct product) {
        if ("ENTRANCE".equals(product.doorType())) {
            return "Сталь, МДФ";
        }
        return switch (product.materialGroup()) {
            case "Шпонированные" -> product.glass() ? "Массив, МДФ, Стекло" : "Массив, МДФ";
            default -> product.glass() ? "Дерево, МДФ, Стекло" : "Дерево, МДФ";
        };
    }

    private String finishText(String materialGroup) {
        return switch (materialGroup) {
            case "Эмаль" -> "Эмаль";
            case "Экокрафт" -> "Экокрафт";
            case "Шпонированные" -> "Шпон";
            default -> "Экошпон";
        };
    }

    private record SeedProduct(
            String productKey,
            String name,
            String doorType,
            String series,
            String style,
            String doorKind,
            String materialGroup,
            String color,
            boolean glass,
            boolean insulation,
            int thicknessMm,
            String glassType,
            BigDecimal basePrice,
            String imageUrl,
            String description,
            String colorOptions
    ) {}
}
