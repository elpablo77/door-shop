package com.doorshop.order.web.dto;

import java.math.BigDecimal;

public class OrderItemDto {
    private Long doorId;
    private String name;
    private BigDecimal price;
    private Integer qty;
    private String variantSize;
    private String variantColor;
    private String sku;

    public OrderItemDto(Long doorId, String name, BigDecimal price, Integer qty, String variantSize, String variantColor, String sku) {
        this.doorId = doorId;
        this.name = name;
        this.price = price;
        this.qty = qty;
        this.variantSize = variantSize;
        this.variantColor = variantColor;
        this.sku = sku;
    }

    public Long getDoorId() { return doorId; }
    public String getName() { return name; }
    public BigDecimal getPrice() { return price; }
    public Integer getQty() { return qty; }
    public String getVariantSize() { return variantSize; }
    public String getVariantColor() { return variantColor; }
    public String getSku() { return sku; }
}
