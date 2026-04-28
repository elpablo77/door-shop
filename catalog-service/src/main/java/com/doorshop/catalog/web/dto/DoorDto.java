package com.doorshop.catalog.web.dto;

import com.doorshop.catalog.domain.Door;
import com.doorshop.catalog.service.CatalogMeta;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public class DoorDto {
    private Long id;
    private String sku;
    private String name;
    private String brand;
    private String collection;
    private BigDecimal price;
    private Integer widthMm;
    private Integer heightMm;
    private Integer thicknessMm;
    private String opening;
    private String material;
    private String finish;
    private String color;
    private boolean glass;
    private boolean insulation;
    private String doorType;
    private String doorTypeLabel;
    private String series;
    private String seriesLabel;
    private String productKey;
    private String glassType;
    private String characteristics;
    private String description;
    private String imageUrl;
    private String style;
    private String doorKind;
    private String materialGroup;
    private String colorGroup;
    private List<Integer> availableSizes;

    public static DoorDto from(Door door) {
        return from(door, List.of(door));
    }

    public static DoorDto from(Door door, List<Door> variants) {
        DoorDto dto = new DoorDto();
        dto.id = door.getId();
        dto.sku = door.getSku();
        dto.name = door.getName();
        dto.brand = door.getBrand();
        dto.collection = CatalogMeta.seriesLabel(door.getSeries());
        dto.price = door.getPrice();
        dto.widthMm = door.getWidthMm();
        dto.heightMm = door.getHeightMm();
        dto.thicknessMm = door.getThicknessMm();
        dto.opening = door.getOpening();
        dto.material = Optional.ofNullable(CatalogMeta.characteristic(door, "Материал полотна")).orElse(door.getMaterial());
        dto.finish = Optional.ofNullable(CatalogMeta.characteristic(door, "Внешняя отделка"))
                .orElse(Optional.ofNullable(CatalogMeta.characteristic(door, "Отделка")).orElse(door.getFinish()));
        dto.color = door.getColor();
        dto.glass = door.isGlass();
        dto.insulation = door.isInsulation();
        dto.doorType = door.getDoorType();
        dto.doorTypeLabel = CatalogMeta.doorTypeLabel(door.getDoorType());
        dto.series = door.getSeries();
        dto.seriesLabel = CatalogMeta.seriesLabel(door.getSeries());
        dto.productKey = door.getProductKey();
        dto.glassType = Optional.ofNullable(CatalogMeta.characteristic(door, "Вид стекла")).orElse(door.getGlassType());
        dto.characteristics = door.getCharacteristics();
        dto.description = door.getDescription();
        dto.imageUrl = door.getImageUrl() != null ? door.getImageUrl() : CatalogMeta.imageFor(door.getSeries(), door.getColor(), door.getDoorType());
        dto.style = CatalogMeta.style(door);
        dto.doorKind = CatalogMeta.doorKind(door);
        dto.materialGroup = CatalogMeta.materialGroup(door);
        dto.colorGroup = CatalogMeta.colorGroup(door);
        dto.availableSizes = CatalogMeta.sizes(variants);
        return dto;
    }

    public Long getId() { return id; }
    public String getSku() { return sku; }
    public String getName() { return name; }
    public String getBrand() { return brand; }
    public String getCollection() { return collection; }
    public BigDecimal getPrice() { return price; }
    public Integer getWidthMm() { return widthMm; }
    public Integer getHeightMm() { return heightMm; }
    public Integer getThicknessMm() { return thicknessMm; }
    public String getOpening() { return opening; }
    public String getMaterial() { return material; }
    public String getFinish() { return finish; }
    public String getColor() { return color; }
    public boolean isGlass() { return glass; }
    public boolean isInsulation() { return insulation; }
    public String getDoorType() { return doorType; }
    public String getDoorTypeLabel() { return doorTypeLabel; }
    public String getSeries() { return series; }
    public String getSeriesLabel() { return seriesLabel; }
    public String getProductKey() { return productKey; }
    public String getGlassType() { return glassType; }
    public String getCharacteristics() { return characteristics; }
    public String getDescription() { return description; }
    public String getImageUrl() { return imageUrl; }
    public String getStyle() { return style; }
    public String getDoorKind() { return doorKind; }
    public String getMaterialGroup() { return materialGroup; }
    public String getColorGroup() { return colorGroup; }
    public List<Integer> getAvailableSizes() { return availableSizes; }
}
