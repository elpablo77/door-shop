package com.doorshop.order.web.dto;

import java.time.Instant;
import java.time.LocalDate;

public class LeadRequestDto {
    private Long id;
    private String type;
    private Long doorId;
    private String doorName;
    private String selectedSize;
    private String selectedColor;
    private String customerName;
    private String phone;
    private String address;
    private String message;
    private LocalDate preferredDate;
    private String status;
    private Instant createdAt;

    public LeadRequestDto(Long id, String type, Long doorId, String doorName, String selectedSize, String selectedColor,
                          String customerName, String phone, String address, String message, LocalDate preferredDate,
                          String status, Instant createdAt) {
        this.id = id;
        this.type = type;
        this.doorId = doorId;
        this.doorName = doorName;
        this.selectedSize = selectedSize;
        this.selectedColor = selectedColor;
        this.customerName = customerName;
        this.phone = phone;
        this.address = address;
        this.message = message;
        this.preferredDate = preferredDate;
        this.status = status;
        this.createdAt = createdAt;
    }

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
    public String getStatus() { return status; }
    public Instant getCreatedAt() { return createdAt; }
}
