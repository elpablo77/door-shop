package com.doorshop.catalog.web.dto;

import java.math.BigDecimal;
import java.util.List;

public class FiltersDto {
    private final List<String> colors;
    private final List<String> doorKinds;
    private final List<String> materials;
    private final List<String> styles;
    private final BigDecimal minPrice;
    private final BigDecimal maxPrice;

    public FiltersDto(List<String> colors, List<String> doorKinds, List<String> materials, List<String> styles,
                      BigDecimal minPrice, BigDecimal maxPrice) {
        this.colors = colors;
        this.doorKinds = doorKinds;
        this.materials = materials;
        this.styles = styles;
        this.minPrice = minPrice;
        this.maxPrice = maxPrice;
    }

    public List<String> getColors() { return colors; }
    public List<String> getDoorKinds() { return doorKinds; }
    public List<String> getMaterials() { return materials; }
    public List<String> getStyles() { return styles; }
    public BigDecimal getMinPrice() { return minPrice; }
    public BigDecimal getMaxPrice() { return maxPrice; }
}
