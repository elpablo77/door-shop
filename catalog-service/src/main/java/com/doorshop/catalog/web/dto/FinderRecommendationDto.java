package com.doorshop.catalog.web.dto;

import java.math.BigDecimal;
import java.util.List;

public class FinderRecommendationDto {
    private Long id;
    private String name;
    private String brand;
    private String collection;
    private BigDecimal price;
    private String color;
    private boolean glass;
    private boolean insulation;
    private String imageUrl;
    private int score;
    private List<String> why; // объяснение выбора

    public FinderRecommendationDto(Long id, String name, String brand, String collection, BigDecimal price, String color,
                                   boolean glass, boolean insulation, String imageUrl, int score, List<String> why) {
        this.id = id;
        this.name = name;
        this.brand = brand;
        this.collection = collection;
        this.price = price;
        this.color = color;
        this.glass = glass;
        this.insulation = insulation;
        this.imageUrl = imageUrl;
        this.score = score;
        this.why = why;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getBrand() { return brand; }
    public String getCollection() { return collection; }
    public BigDecimal getPrice() { return price; }
    public String getColor() { return color; }
    public boolean isGlass() { return glass; }
    public boolean isInsulation() { return insulation; }
    public String getImageUrl() { return imageUrl; }
    public int getScore() { return score; }
    public List<String> getWhy() { return why; }
}
