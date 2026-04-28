package com.doorshop.order.web.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public class CreateOrderRequest {

    @Valid
    @NotEmpty
    private List<OrderItemRequest> items;

    private String customerName;
    private String phone;
    private String city;
    private String address;
    private String comment;
    private String deliveryType;

    public List<OrderItemRequest> getItems() { return items; }
    public String getCustomerName() { return customerName; }
    public String getPhone() { return phone; }
    public String getCity() { return city; }
    public String getAddress() { return address; }
    public String getComment() { return comment; }
    public String getDeliveryType() { return deliveryType; }

    public void setItems(List<OrderItemRequest> items) { this.items = items; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public void setPhone(String phone) { this.phone = phone; }
    public void setCity(String city) { this.city = city; }
    public void setAddress(String address) { this.address = address; }
    public void setComment(String comment) { this.comment = comment; }
    public void setDeliveryType(String deliveryType) { this.deliveryType = deliveryType; }
}
