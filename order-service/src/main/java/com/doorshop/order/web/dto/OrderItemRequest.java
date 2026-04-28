package com.doorshop.order.web.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class OrderItemRequest {

    @NotNull
    private Long doorId;

    @NotBlank
    private String name;

    @NotNull
    private BigDecimal price;

    @NotNull
    @Min(1)
    private Integer qty;

    private String variantSize;
    private String variantColor;
    private String sku;

    public Long getDoorId() { return doorId; }
    public String getName() { return name; }
    public BigDecimal getPrice() { return price; }
    public Integer getQty() { return qty; }
    public String getVariantSize() { return variantSize; }
    public String getVariantColor() { return variantColor; }
    public String getSku() { return sku; }

    public void setDoorId(Long doorId) { this.doorId = doorId; }
    public void setName(String name) { this.name = name; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public void setQty(Integer qty) { this.qty = qty; }
    public void setVariantSize(String variantSize) { this.variantSize = variantSize; }
    public void setVariantColor(String variantColor) { this.variantColor = variantColor; }
    public void setSku(String sku) { this.sku = sku; }
}
