package com.doorshop.order.web.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public class OrderDto {
    private Long id;
    private String status;
    private BigDecimal total;
    private String customerName;
    private String phone;
    private String city;
    private String address;
    private String comment;
    private String deliveryType;
    private Instant createdAt;
    private List<OrderItemDto> items;

    public OrderDto(Long id, String status, BigDecimal total, String customerName, String phone, String city,
                    String address, String comment, String deliveryType, Instant createdAt, List<OrderItemDto> items) {
        this.id = id;
        this.status = status;
        this.total = total;
        this.customerName = customerName;
        this.phone = phone;
        this.city = city;
        this.address = address;
        this.comment = comment;
        this.deliveryType = deliveryType;
        this.createdAt = createdAt;
        this.items = items;
    }

    public Long getId() { return id; }
    public String getStatus() { return status; }
    public BigDecimal getTotal() { return total; }
    public String getCustomerName() { return customerName; }
    public String getPhone() { return phone; }
    public String getCity() { return city; }
    public String getAddress() { return address; }
    public String getComment() { return comment; }
    public String getDeliveryType() { return deliveryType; }
    public Instant getCreatedAt() { return createdAt; }
    public List<OrderItemDto> getItems() { return items; }
}
