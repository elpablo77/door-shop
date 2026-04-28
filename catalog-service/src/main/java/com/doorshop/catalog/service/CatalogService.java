package com.doorshop.catalog.service;

import com.doorshop.catalog.domain.Door;
import com.doorshop.catalog.repo.DoorRepository;
import com.doorshop.catalog.web.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class CatalogService {

    private static final String BRAND = "Владимирская Фабрика Дверей";
    private static final List<String> DOOR_KIND_ORDER = List.of(
            "Глухая", "Остекленная", "Зеркало", "Грифель", "Молдинг", "Остекленная с молдингом",
            "Квартирная входная", "Уличная входная"
    );
    private static final List<String> MATERIAL_ORDER = List.of("Экошпон", "Экокрафт", "Эмаль", "Шпонированные");
    private static final List<String> STYLE_ORDER = List.of("Модерн", "Классика");
    private static final List<String> COLOR_GROUP_ORDER = List.of("Белые", "Светлые", "Темные", "Яркие цвета", "Черные");

    private final DoorRepository repo;
    private final com.doorshop.catalog.config.DataSeeder seeder;

    public CatalogService(DoorRepository repo, com.doorshop.catalog.config.DataSeeder seeder) {
        this.repo = repo;
        this.seeder = seeder;
    }

    public Page<Door> search(String q, BigDecimal minPrice, BigDecimal maxPrice,
                             String material, String color, String doorType, String series,
                             String style, String doorKind, int page, int size, String sort) {

        List<Door> filtered = groupedProducts().values().stream()
                .map(CatalogMeta::representative)
                .filter(door -> matches(door, q, minPrice, maxPrice, material, color, doorType, series, style, doorKind))
                .sorted(comparator(sort))
                .toList();

        int safeSize = Math.min(Math.max(size, 1), 48);
        int safePage = Math.max(page, 0);
        int from = Math.min(safePage * safeSize, filtered.size());
        int to = Math.min(from + safeSize, filtered.size());

        return new PageImpl<>(filtered.subList(from, to), PageRequest.of(safePage, safeSize), filtered.size());
    }

    public Optional<Door> get(Long id) {
        return repo.findById(id);
    }

    public List<VariantDto> variants(String productKey) {
        return repo.findByProductKeyOrderByWidthMmAsc(productKey).stream()
                .map(v -> new VariantDto(v.getId(), v.getWidthMm(), v.getHeightMm(), v.getColor(), v.getImageUrl(), v.getPrice(), v.getSku()))
                .toList();
    }

    public List<Door> getProductVariants(String productKey) {
        return repo.findByProductKeyOrderByWidthMmAsc(productKey);
    }

    public List<SuggestDto> suggest(String q) {
        if (q == null || q.trim().length() < 2) {
            return List.of();
        }

        return groupedProducts().values().stream()
                .map(CatalogMeta::representative)
                .map(door -> Map.entry(door, suggestScore(door, q)))
                .filter(entry -> entry.getValue() > 0)
                .sorted(Comparator.<Map.Entry<Door, Integer>>comparingInt(Map.Entry::getValue).reversed()
                        .thenComparing(entry -> entry.getKey().getPrice()))
                .limit(8)
                .map(entry -> {
                    Door door = entry.getKey();
                    return new SuggestDto(
                            door.getId(),
                            door.getName(),
                            door.getPrice(),
                            imageFor(door),
                            door.getProductKey(),
                            CatalogMeta.seriesLabel(door.getSeries())
                    );
                })
                .toList();
    }

    public FiltersDto filters(String doorType) {
        List<Door> doors = groupedProducts().values().stream()
                .map(CatalogMeta::representative)
                .filter(door -> isBlank(doorType) || equalsIgnoreCase(door.getDoorType(), doorType))
                .toList();

        List<String> colors = COLOR_GROUP_ORDER;
        List<String> doorKinds = "ENTRANCE".equalsIgnoreCase(doorType)
                ? DOOR_KIND_ORDER.subList(6, DOOR_KIND_ORDER.size())
                : "INTERIOR".equalsIgnoreCase(doorType)
                ? DOOR_KIND_ORDER.subList(0, 6)
                : DOOR_KIND_ORDER;
        List<String> materials = MATERIAL_ORDER;
        List<String> styles = STYLE_ORDER;
        BigDecimal min = doors.stream().map(Door::getPrice).min(Comparator.naturalOrder()).orElse(BigDecimal.ZERO);
        BigDecimal max = doors.stream().map(Door::getPrice).max(Comparator.naturalOrder()).orElse(BigDecimal.ZERO);

        return new FiltersDto(colors, doorKinds, materials, styles, min, max);
    }

    public Map<String, List<SeriesDto>> seriesTree() {
        return groupedProducts().values().stream()
                .map(CatalogMeta::representative)
                .collect(Collectors.groupingBy(
                        Door::getDoorType,
                        LinkedHashMap::new,
                        Collectors.collectingAndThen(Collectors.groupingBy(Door::getSeries, LinkedHashMap::new, Collectors.counting()), map ->
                                map.entrySet().stream()
                                        .sorted(Comparator.comparingInt(entry -> CatalogMeta.seriesRank(entry.getKey())))
                                        .map(entry -> new SeriesDto(
                                                entry.getKey(),
                                                CatalogMeta.seriesLabel(entry.getKey()),
                                                CatalogMeta.seriesDescription(entry.getKey()),
                                                entry.getValue()))
                                        .toList()
                        )
                ));
    }

    public long reseed() {
        return seeder.reseed(repo);
    }

    public List<FinderRecommendationDto> recommend(FinderRequest req) {
        return groupedProducts().values().stream()
                .map(CatalogMeta::representative)
                .map(door -> scoreDoor(door, req))
                .sorted(Comparator.comparingInt(ScoredDoor::score).reversed().thenComparing(sd -> sd.door().getPrice()))
                .limit(8)
                .map(sd -> new FinderRecommendationDto(
                        sd.door().getId(),
                        sd.door().getName(),
                        sd.door().getBrand(),
                        CatalogMeta.seriesLabel(sd.door().getSeries()),
                        sd.door().getPrice(),
                        sd.door().getColor(),
                        sd.door().isGlass(),
                        sd.door().isInsulation(),
                        imageFor(sd.door()),
                        sd.score(),
                        sd.why().isEmpty() ? List.of("Подходит по выбранным параметрам.") : sd.why()
                ))
                .toList();
    }

    public List<AdminProductDto> adminProducts() {
        return groupedProducts().values().stream()
                .map(this::toAdminDto)
                .sorted(Comparator.comparingInt((AdminProductDto dto) -> CatalogMeta.seriesRank(dto.series())).thenComparing(AdminProductDto::name))
                .toList();
    }

    public AdminProductDto createAdminProduct(AdminProductRequest request) {
        String productKey = buildProductKey(request);
        if (!repo.findByProductKeyOrderByWidthMmAsc(productKey).isEmpty()) {
            throw new IllegalArgumentException("product_exists");
        }
        List<Door> saved = upsertProductFamily(List.of(), productKey, request);
        return toAdminDto(saved);
    }

    public AdminProductDto updateAdminProduct(String productKey, AdminProductRequest request) {
        List<Door> existing = repo.findByProductKeyOrderByWidthMmAsc(productKey);
        if (existing.isEmpty()) {
            throw new IllegalArgumentException("not_found");
        }
        List<Door> saved = upsertProductFamily(existing, productKey, request);
        return toAdminDto(saved);
    }

    public void deleteAdminProduct(String productKey) {
        List<Door> existing = repo.findByProductKeyOrderByWidthMmAsc(productKey);
        if (existing.isEmpty()) {
            throw new IllegalArgumentException("not_found");
        }
        repo.deleteAll(existing);
    }

    private List<Door> upsertProductFamily(List<Door> existing, String productKey, AdminProductRequest request) {
        Map<Integer, Door> byWidth = existing.stream()
                .collect(Collectors.toMap(Door::getWidthMm, Function.identity(), (left, right) -> left, LinkedHashMap::new));

        List<Door> result = new ArrayList<>();
        int index = 1;
        for (Integer width : CatalogMeta.DEFAULT_WIDTHS) {
            Door door = byWidth.remove(width);
            if (door == null) {
                door = new Door();
            }
            fillDoor(door, productKey, width, request, index++);
            result.add(repo.save(door));
        }

        if (!byWidth.isEmpty()) {
            repo.deleteAll(byWidth.values());
        }

        return result;
    }

    private void fillDoor(Door door, String productKey, Integer width, AdminProductRequest request, int index) {
        String series = CatalogMeta.normalizeCode(request.getSeries());
        String doorType = CatalogMeta.normalizeCode(request.getDoorType());
        String doorKind = CatalogMeta.normalizeDoorKind(request.getDoorKind());
        String materialGroup = CatalogMeta.normalizeMaterialGroup(request.getMaterialGroup());
        String style = CatalogMeta.containsNormalized(request.getStyle(), "класс") ? "Классика" : "Модерн";
        boolean glass = Boolean.TRUE.equals(request.getGlass()) || doorKind.contains("Остек");
        boolean insulation = Boolean.TRUE.equals(request.getInsulation()) || "ENTRANCE".equals(doorType);
        int thickness = request.getThicknessMm() != null ? request.getThicknessMm() : ("ENTRANCE".equals(doorType) ? 72 : 39);

        door.setSku(productKey + "-" + width);
        door.setName(request.getName().trim());
        door.setBrand(BRAND);
        door.setCollection(CatalogMeta.seriesLabel(series));
        door.setPrice(priceForWidth(request.getBasePrice(), width));
        door.setWidthMm(width);
        door.setHeightMm(2000);
        door.setThicknessMm(thickness);
        door.setOpening("UNIVERSAL");
        door.setMaterial(materialText(materialGroup, glass, doorType));
        door.setFinish(finishText(materialGroup));
        door.setColor(request.getColor().trim());
        door.setGlass(glass);
        door.setInsulation(insulation);
        door.setDoorType(doorType);
        door.setSeries(series);
        door.setProductKey(productKey);
        door.setGlassType(glass ? Optional.ofNullable(request.getGlassType()).filter(v -> !v.isBlank()).orElse("Матовое") : "Нет");
        door.setCharacteristics(buildCharacteristics(productKey, width, thickness, request, doorKind, materialGroup, style, glass, insulation, index));
        door.setDescription(defaultDescription(request, series));
        door.setImageUrl(Optional.ofNullable(request.getImageUrl()).filter(v -> !v.isBlank()).orElse(CatalogMeta.imageFor(series, request.getColor(), doorType)));
    }

    private String buildCharacteristics(String productKey, Integer width, int thickness, AdminProductRequest request, String doorKind,
                                        String materialGroup, String style, boolean glass, boolean insulation, int index) {
        Map<String, String> rows = new LinkedHashMap<>();
        String article = productKey.replace("VFD_", "") + "-" + index + width;
        rows.put("Артикул", article);
        rows.put("Тип", CatalogMeta.doorTypeLabel(request.getDoorType()));
        rows.put("Механизм двери", "Распашная");
        rows.put("Размер двери, мм", width + "x2000");
        rows.put("Общая толщина двери, мм", String.valueOf(thickness));
        rows.put("Внешняя отделка", finishText(materialGroup));
        rows.put("Ширина полотна, мм", String.valueOf(width));
        rows.put("Высота полотна, мм", "2000");
        if (glass) {
            rows.put("Толщина стекла, мм", "4");
            rows.put("Вид стекла", Optional.ofNullable(request.getGlassType()).filter(v -> !v.isBlank()).orElse("Матовое"));
        }
        rows.put("Материал полотна", materialText(materialGroup, glass, request.getDoorType()));
        rows.put("Дверная ручка", "Отсутствует");
        rows.put("Фрезеровка под петли", "Нет");
        rows.put("Фрезеровка под замок", "Нет");
        rows.put("Петли", "Нет в комплекте");
        rows.put("Вид погонажа", "ENTRANCE".equalsIgnoreCase(request.getDoorType()) ? "Коробка с уплотнителем" : "Телескопический");
        rows.put("Вес с упаковкой, г", insulation ? "32000" : "18000");
        rows.put("Цвет", request.getColor().trim());
        rows.put("Цвета", Optional.ofNullable(request.getColor()).orElse("").trim());
        rows.put("Группа цвета", CatalogMeta.normalizeColorGroup(request.getColor()));
        rows.put("Гарантия", Optional.ofNullable(request.getWarranty()).filter(v -> !v.isBlank()).orElse("1 год"));
        rows.put("Страна-изготовитель", Optional.ofNullable(request.getCountry()).filter(v -> !v.isBlank()).orElse("Россия"));
        rows.put("Стиль", style);
        rows.put("Материал группы", materialGroup);
        rows.put("Тип полотна", doorKind);
        if (insulation) {
            rows.put("Утепление", "Минеральная плита");
        }

        rows.putAll(parseManualCharacteristics(request.getCharacteristicsText()));
        return rows.entrySet().stream().map(entry -> entry.getKey() + "=" + entry.getValue()).collect(Collectors.joining("; "));
    }

    private Map<String, String> parseManualCharacteristics(String raw) {
        if (raw == null || raw.isBlank()) {
            return Map.of();
        }
        return CatalogMeta.parseCharacteristics(raw);
    }

    private String materialText(String materialGroup, boolean glass, String doorType) {
        if ("ENTRANCE".equalsIgnoreCase(doorType)) {
            return glass ? "Сталь, МДФ, Стекло" : "Сталь, МДФ";
        }
        return switch (materialGroup) {
            case "Эмаль" -> glass ? "Дерево, МДФ, Стекло" : "Дерево, МДФ";
            case "Шпонированные" -> glass ? "Массив, МДФ, Стекло" : "Массив, МДФ";
            default -> glass ? "Дерево, МДФ, Стекло" : "Дерево, МДФ";
        };
    }

    private String finishText(String materialGroup) {
        return switch (materialGroup) {
            case "Эмаль" -> "Эмаль";
            case "Шпонированные" -> "Шпон";
            case "Экокрафт" -> "Экокрафт";
            default -> "Экошпон";
        };
    }

    private String defaultDescription(AdminProductRequest request, String series) {
        if (request.getDescription() != null && !request.getDescription().isBlank()) {
            return request.getDescription().trim();
        }
        return "Серия " + CatalogMeta.seriesLabel(series) + " с выбором размера, цвета и комплектующих.";
    }

    private BigDecimal priceForWidth(BigDecimal basePrice, Integer width) {
        int delta = width - 800;
        return basePrice.add(BigDecimal.valueOf(delta * 5L));
    }

    private AdminProductDto toAdminDto(List<Door> variants) {
        Door representative = CatalogMeta.representative(variants);
        return new AdminProductDto(
                representative.getProductKey(),
                representative.getName(),
                representative.getDoorType(),
                representative.getSeries(),
                CatalogMeta.seriesLabel(representative.getSeries()),
                CatalogMeta.style(representative),
                CatalogMeta.doorKind(representative),
                CatalogMeta.materialGroup(representative),
                representative.getColor(),
                CatalogMeta.colorGroup(representative),
                representative.isGlass(),
                representative.isInsulation(),
                representative.getPrice(),
                representative.getThicknessMm(),
                imageFor(representative),
                representative.getDescription(),
                representative.getCharacteristics(),
                CatalogMeta.sizes(variants)
        );
    }

    private ScoredDoor scoreDoor(Door door, FinderRequest req) {
        int score = 10;
        List<String> why = new ArrayList<>();

        String roomType = normalizedOption(req.getRoomType());
        String style = normalizedOption(req.getStyle());
        String lightNeed = normalizedOption(req.getLightNeed());

        if ("entrance".equals(roomType) || "прихожая".equals(roomType)) {
            if ("ENTRANCE".equalsIgnoreCase(door.getDoorType())) {
                score += 24;
                why.add("Подходит для входной зоны и повышенной нагрузки.");
            }
        } else if ("bedroom".equals(roomType) || "спальня".equals(roomType)) {
            if (CatalogMeta.doorKind(door).equals("Глухая")) {
                score += 14;
                why.add("Глухое полотно лучше сохраняет приватность спальни.");
            }
        } else if ("living_room".equals(roomType) || "гостиная".equals(roomType)) {
            if (CatalogMeta.doorKind(door).contains("Остек")) {
                score += 12;
                why.add("Остекление лучше работает в общей зоне.");
            }
        }

        if (!"any".equals(style) && !style.isBlank() && CatalogMeta.containsNormalized(CatalogMeta.style(door), style)) {
            score += 18;
            why.add("Совпадает с выбранным стилем.");
        }

        if (req.getNeedInsulation() != null && req.getNeedInsulation().equals(door.isInsulation())) {
            score += 14;
            why.add(door.isInsulation() ? "Есть усиленная изоляция." : "Без лишнего утепления для стандартного интерьера.");
        }

        if (Boolean.TRUE.equals(req.getHasKidsPets()) && CatalogMeta.doorKind(door).equals("Глухая")) {
            score += 10;
            why.add("Практичное решение для активного быта.");
        }

        if ("more".equals(lightNeed) && CatalogMeta.doorKind(door).contains("Остек")) {
            score += 12;
            why.add("Остекление добавляет света в помещение.");
        } else if ("less".equals(lightNeed) && CatalogMeta.doorKind(door).equals("Глухая")) {
            score += 10;
            why.add("Глухое полотно даёт больше приватности.");
        }

        if (req.getBudget() != null && req.getBudget() > 0) {
            BigDecimal diff = door.getPrice().subtract(BigDecimal.valueOf(req.getBudget())).abs();
            if (diff.compareTo(BigDecimal.valueOf(2000)) <= 0) {
                score += 18;
                why.add("Цена близка к вашему бюджету.");
            } else if (diff.compareTo(BigDecimal.valueOf(5000)) <= 0) {
                score += 8;
            }
        }

        return new ScoredDoor(door, score, why);
    }

    private int suggestScore(Door door, String query) {
        String q = CatalogMeta.normalizeText(query);
        String name = CatalogMeta.normalizeText(door.getName());
        String series = CatalogMeta.normalizeText(CatalogMeta.seriesLabel(door.getSeries()));
        String color = CatalogMeta.normalizeText(door.getColor());

        int score = 0;
        if (name.startsWith(q)) score += 30;
        if (name.contains(q)) score += 18;
        if (series.contains(q)) score += 12;
        if (color.contains(q)) score += 6;
        return score;
    }

    private boolean matches(Door door, String q, BigDecimal minPrice, BigDecimal maxPrice,
                            String material, String color, String doorType, String series,
                            String style, String doorKind) {
        if (!isBlank(q) && !matchesQuery(door, q)) return false;
        if (minPrice != null && door.getPrice().compareTo(minPrice) < 0) return false;
        if (maxPrice != null && door.getPrice().compareTo(maxPrice) > 0) return false;
        if (!isBlank(material) && !equalsIgnoreCase(CatalogMeta.materialGroup(door), material)) return false;
        if (!isBlank(color) && !equalsIgnoreCase(CatalogMeta.colorGroup(door), color)) return false;
        if (!isBlank(doorType) && !equalsIgnoreCase(door.getDoorType(), doorType)) return false;
        if (!isBlank(series) && !equalsIgnoreCase(CatalogMeta.normalizeCode(door.getSeries()), CatalogMeta.normalizeCode(series))) return false;
        if (!isBlank(style) && !equalsIgnoreCase(CatalogMeta.style(door), style)) return false;
        return isBlank(doorKind) || equalsIgnoreCase(CatalogMeta.doorKind(door), doorKind);
    }

    private boolean matchesQuery(Door door, String query) {
        return Stream.of(
                        door.getName(),
                        CatalogMeta.seriesLabel(door.getSeries()),
                        door.getColor(),
                        CatalogMeta.style(door),
                        CatalogMeta.doorKind(door),
                        CatalogMeta.materialGroup(door),
                        door.getDescription(),
                        door.getCharacteristics()
                )
                .filter(Objects::nonNull)
                .anyMatch(value -> CatalogMeta.containsNormalized(value, query));
    }

    private Map<String, List<Door>> groupedProducts() {
        return repo.findAll().stream()
                .filter(door -> door.getProductKey() != null && !door.getProductKey().isBlank())
                .collect(Collectors.groupingBy(Door::getProductKey, LinkedHashMap::new, Collectors.toList()));
    }

    private Comparator<Door> comparator(String sort) {
        if ("priceAsc".equalsIgnoreCase(sort)) {
            return Comparator.comparing(Door::getPrice).thenComparingInt(door -> CatalogMeta.seriesRank(door.getSeries())).thenComparing(Door::getName);
        }
        if ("priceDesc".equalsIgnoreCase(sort)) {
            return Comparator.comparing(Door::getPrice).reversed().thenComparingInt(door -> CatalogMeta.seriesRank(door.getSeries())).thenComparing(Door::getName);
        }
        return Comparator.comparing(Door::getCreatedAt, Comparator.nullsLast(Comparator.<Instant>naturalOrder())).reversed()
                .thenComparingInt(door -> CatalogMeta.seriesRank(door.getSeries()))
                .thenComparing(Door::getName);
    }

    private String buildProductKey(AdminProductRequest request) {
        String series = CatalogMeta.normalizeCode(request.getSeries());
        String name = CatalogMeta.slugify(request.getName());
        String base = "VFD_" + (series.isBlank() ? "CUSTOM" : series) + "_" + name;
        if (repo.findByProductKeyOrderByWidthMmAsc(base).isEmpty()) {
            return base;
        }
        int suffix = 2;
        while (!repo.findByProductKeyOrderByWidthMmAsc(base + "_" + suffix).isEmpty()) {
            suffix++;
        }
        return base + "_" + suffix;
    }

    private List<String> sortByOrder(Collection<String> values, List<String> order) {
        return values.stream()
                .filter(Objects::nonNull)
                .distinct()
                .sorted(Comparator.comparingInt(value -> {
                    int idx = order.indexOf(value);
                    return idx >= 0 ? idx : 999;
                }))
                .toList();
    }

    private String imageFor(Door door) {
        return door.getImageUrl() != null ? door.getImageUrl() : CatalogMeta.imageFor(door.getSeries(), door.getColor(), door.getDoorType());
    }

    private boolean equalsIgnoreCase(String left, String right) {
        return left != null && right != null && left.equalsIgnoreCase(right);
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private String normalizedOption(String value) {
        if (value == null || value.isBlank()) {
            return "any";
        }
        String normalized = CatalogMeta.normalizeText(value);
        return normalized.equals("не важно") ? "any" : normalized;
    }

    private record ScoredDoor(Door door, int score, List<String> why) {}
}
