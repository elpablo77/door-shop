package com.doorshop.order.domain;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders", indexes = {
        @Index(name = "idx_orders_user_id", columnList = "userId"),
        @Index(name = "idx_orders_created_at", columnList = "createdAt")
})
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false, length = 190)
    private String userEmail;

    @Column(nullable = false, length = 30)
    private String status = "PROCESSING";

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal total = BigDecimal.ZERO;

    @Column(length = 120)
    private String customerName;

    @Column(length = 40)
    private String phone;

    @Column(length = 80)
    private String city;

    @Column(length = 240)
    private String address;

    @Column(length = 240)
    private String comment;

    @Column(length = 40)
    private String deliveryType;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public String getUserEmail() { return userEmail; }
    public String getStatus() { return status; }
    public BigDecimal getTotal() { return total; }
    public String getCustomerName() { return customerName; }
    public String getPhone() { return phone; }
    public String getCity() { return city; }
    public String getAddress() { return address; }
    public String getComment() { return comment; }
    public String getDeliveryType() { return deliveryType; }
    public Instant getCreatedAt() { return createdAt; }
    public List<OrderItem> getItems() { return items; }

    public void setUserId(Long userId) { this.userId = userId; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
    public void setStatus(String status) { this.status = status; }
    public void setTotal(BigDecimal total) { this.total = total; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public void setPhone(String phone) { this.phone = phone; }
    public void setCity(String city) { this.city = city; }
    public void setAddress(String address) { this.address = address; }
    public void setComment(String comment) { this.comment = comment; }
    public void setDeliveryType(String deliveryType) { this.deliveryType = deliveryType; }

    public void addItem(OrderItem item) {
        items.add(item);
        item.setOrder(this);
    }
}
