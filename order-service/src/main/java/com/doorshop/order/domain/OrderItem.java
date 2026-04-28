package com.doorshop.order.domain;

import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "order_id")
    private Order order;

    @Column(nullable = false)
    private Long doorId;

    @Column(nullable = false, length = 180)
    private String name;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(nullable = false)
    private Integer qty;

    @Column(length = 40)
    private String variantSize;

    @Column(length = 80)
    private String variantColor;

    @Column(length = 40)
    private String sku;

    public Long getId() { return id; }
    public Order getOrder() { return order; }
    public Long getDoorId() { return doorId; }
    public String getName() { return name; }
    public BigDecimal getPrice() { return price; }
    public Integer getQty() { return qty; }
    public String getVariantSize() { return variantSize; }
    public String getVariantColor() { return variantColor; }
    public String getSku() { return sku; }

    public void setOrder(Order order) { this.order = order; }
    public void setDoorId(Long doorId) { this.doorId = doorId; }
    public void setName(String name) { this.name = name; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public void setQty(Integer qty) { this.qty = qty; }
    public void setVariantSize(String variantSize) { this.variantSize = variantSize; }
    public void setVariantColor(String variantColor) { this.variantColor = variantColor; }
    public void setSku(String sku) { this.sku = sku; }
}
