package com.doorshop.order.domain;

import jakarta.persistence.*;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "lead_requests", indexes = {
        @Index(name = "idx_leads_type", columnList = "type"),
        @Index(name = "idx_leads_created_at", columnList = "createdAt")
})
public class LeadRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 20)
    private String type;

    private Long doorId;

    @Column(length = 180)
    private String doorName;

    @Column(length = 80)
    private String selectedSize;

    @Column(length = 80)
    private String selectedColor;

    @Column(length = 120)
    private String customerName;

    @Column(nullable = false, length = 40)
    private String phone;

    @Column(length = 240)
    private String address;

    @Column(length = 500)
    private String message;

    private LocalDate preferredDate;

    @Column(nullable = false)
    private boolean consent;

    @Column(length = 20)
    private String status = "NEW";

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    public Long getId() { return id; }
    public String getType() { return type; }
    public Long getDoorId() { return doorId; }
    public String getDoorName() { return doorName; }
    public String getSelectedSize() { return selectedSize; }
    public String getSelectedColor() { return selectedColor; }
    public String getCustomerName() { return customerName; }
    public String getPhone() { return phone; }
    public String getAddress() { return address; }
    public String getMessage() { return message; }
    public LocalDate getPreferredDate() { return preferredDate; }
    public boolean isConsent() { return consent; }
    public String getStatus() { return status; }
    public Instant getCreatedAt() { return createdAt; }

    public void setType(String type) { this.type = type; }
    public void setDoorId(Long doorId) { this.doorId = doorId; }
    public void setDoorName(String doorName) { this.doorName = doorName; }
    public void setSelectedSize(String selectedSize) { this.selectedSize = selectedSize; }
    public void setSelectedColor(String selectedColor) { this.selectedColor = selectedColor; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public void setPhone(String phone) { this.phone = phone; }
    public void setAddress(String address) { this.address = address; }
    public void setMessage(String message) { this.message = message; }
    public void setPreferredDate(LocalDate preferredDate) { this.preferredDate = preferredDate; }
    public void setConsent(boolean consent) { this.consent = consent; }
    public void setStatus(String status) { this.status = status; }
}
