package com.doorshop.order.web.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

public class CreateLeadRequest {

    @NotBlank
    private String type;

    private Long doorId;
    private String doorName;
    private String selectedSize;
    private String selectedColor;
    private String customerName;

    @NotBlank
    private String phone;

    private String address;
    private String message;
    private LocalDate preferredDate;
    private boolean consent;

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

    @AssertTrue
    public boolean isConsentAccepted() {
        return consent;
    }
}
