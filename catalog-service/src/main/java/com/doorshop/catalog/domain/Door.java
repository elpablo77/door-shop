package com.doorshop.catalog.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "doors", indexes = {
        @Index(name = "idx_doors_price", columnList = "price"),
        @Index(name = "idx_doors_brand", columnList = "brand"),
        @Index(name = "idx_doors_collection", columnList = "collectionName"),
        @Index(name = "idx_doors_product_key", columnList = "productKey")
})
public class Door {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 40, unique = true)
    private String sku;

    @Column(nullable = false, length = 180)
    private String name;

    @Column(nullable = false, length = 80)
    private String brand;

    @Column(name = "collectionName", nullable = false, length = 80)
    private String collection;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(nullable = false)
    private Integer widthMm;

    @Column(nullable = false)
    private Integer heightMm;

    @Column(nullable = false)
    private Integer thicknessMm;

    @Column(nullable = false, length = 30)
    private String opening;

    @Column(nullable = false, length = 60)
    private String material;

    @Column(nullable = false, length = 60)
    private String finish;

    @Column(nullable = false, length = 60)
    private String color;

    @Column(nullable = false)
    private boolean glass;

    @Column(nullable = false)
    private boolean insulation;

    @Column(nullable = false, length = 20)
    private String doorType = "INTERIOR";

    @Column(nullable = false, length = 40)
    private String series = "BASIC";

    @Column(nullable = false, length = 80)
    private String productKey;

    @Column(length = 40)
    private String glassType;

    @Column(length = 4000)
    private String characteristics;

    @Column(length = 2000)
    private String description;

    @Column(length = 400)
    private String imageUrl;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    public Door() {}

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
    public String getSeries() { return series; }
    public String getProductKey() { return productKey; }
    public String getGlassType() { return glassType; }
    public String getCharacteristics() { return characteristics; }
    public String getDescription() { return description; }
    public String getImageUrl() { return imageUrl; }
    public Instant getCreatedAt() { return createdAt; }

    public void setSku(String sku) { this.sku = sku; }
    public void setName(String name) { this.name = name; }
    public void setBrand(String brand) { this.brand = brand; }
    public void setCollection(String collection) { this.collection = collection; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public void setWidthMm(Integer widthMm) { this.widthMm = widthMm; }
    public void setHeightMm(Integer heightMm) { this.heightMm = heightMm; }
    public void setThicknessMm(Integer thicknessMm) { this.thicknessMm = thicknessMm; }
    public void setOpening(String opening) { this.opening = opening; }
    public void setMaterial(String material) { this.material = material; }
    public void setFinish(String finish) { this.finish = finish; }
    public void setColor(String color) { this.color = color; }
    public void setGlass(boolean glass) { this.glass = glass; }
    public void setInsulation(boolean insulation) { this.insulation = insulation; }
    public void setDoorType(String doorType) { this.doorType = doorType; }
    public void setSeries(String series) { this.series = series; }
    public void setProductKey(String productKey) { this.productKey = productKey; }
    public void setGlassType(String glassType) { this.glassType = glassType; }
    public void setCharacteristics(String characteristics) { this.characteristics = characteristics; }
    public void setDescription(String description) { this.description = description; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}
