package com.doorshop.catalog.web.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class AdminProductRequest {

    @NotBlank
    private String name;

    @NotBlank
    private String doorType;

    @NotBlank
    private String series;

    @NotBlank
    private String style;

    @NotBlank
    private String doorKind;

    @NotBlank
    private String materialGroup;

    @NotBlank
    private String color;

    private Boolean glass;
    private Boolean insulation;

    @NotNull
    @DecimalMin("1.00")
    private BigDecimal basePrice;

    private Integer thicknessMm;
    private String imageUrl;
    private String description;
    private String glassType;
    private String warranty;
    private String country;
    private String characteristicsText;

    public String getName() { return name; }
    public String getDoorType() { return doorType; }
    public String getSeries() { return series; }
    public String getStyle() { return style; }
    public String getDoorKind() { return doorKind; }
    public String getMaterialGroup() { return materialGroup; }
    public String getColor() { return color; }
    public Boolean getGlass() { return glass; }
    public Boolean getInsulation() { return insulation; }
    public BigDecimal getBasePrice() { return basePrice; }
    public Integer getThicknessMm() { return thicknessMm; }
    public String getImageUrl() { return imageUrl; }
    public String getDescription() { return description; }
    public String getGlassType() { return glassType; }
    public String getWarranty() { return warranty; }
    public String getCountry() { return country; }
    public String getCharacteristicsText() { return characteristicsText; }

    public void setName(String name) { this.name = name; }
    public void setDoorType(String doorType) { this.doorType = doorType; }
    public void setSeries(String series) { this.series = series; }
    public void setStyle(String style) { this.style = style; }
    public void setDoorKind(String doorKind) { this.doorKind = doorKind; }
    public void setMaterialGroup(String materialGroup) { this.materialGroup = materialGroup; }
    public void setColor(String color) { this.color = color; }
    public void setGlass(Boolean glass) { this.glass = glass; }
    public void setInsulation(Boolean insulation) { this.insulation = insulation; }
    public void setBasePrice(BigDecimal basePrice) { this.basePrice = basePrice; }
    public void setThicknessMm(Integer thicknessMm) { this.thicknessMm = thicknessMm; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public void setDescription(String description) { this.description = description; }
    public void setGlassType(String glassType) { this.glassType = glassType; }
    public void setWarranty(String warranty) { this.warranty = warranty; }
    public void setCountry(String country) { this.country = country; }
    public void setCharacteristicsText(String characteristicsText) { this.characteristicsText = characteristicsText; }
}
