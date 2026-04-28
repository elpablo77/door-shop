package com.doorshop.order.web;

import com.doorshop.order.domain.Order;
import com.doorshop.order.repo.OrderRepository;
import com.doorshop.order.service.OrderService;
import com.doorshop.order.web.dto.CreateOrderRequest;
import com.doorshop.order.web.dto.OrderDto;
import com.doorshop.order.web.dto.OrderItemDto;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;
    private final OrderRepository repo;

    public OrderController(OrderService orderService, OrderRepository repo) {
        this.orderService = orderService;
        this.repo = repo;
    }

    @PostMapping
    public OrderDto create(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody CreateOrderRequest req) {
        Long uid = extractUid(jwt);
        String email = jwt.getSubject();
        Order o = orderService.create(uid, email, req);
        return toDto(o);
    }

    @GetMapping("/my")
    public List<OrderDto> my(@AuthenticationPrincipal Jwt jwt) {
        Long uid = extractUid(jwt);
        return repo.findByUserIdOrderByCreatedAtDesc(uid).stream().map(this::toDto).toList();
    }

    @GetMapping
    public List<OrderDto> all(@AuthenticationPrincipal Jwt jwt) {
        String role = jwt.getClaim("role");
        if (!"ADMIN".equals(role)) throw new IllegalArgumentException("forbidden");
        return repo.findAllByOrderByCreatedAtDesc().stream().map(this::toDto).toList();
    }

    @PatchMapping("/{id}/status")
    public OrderDto updateStatus(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id, @RequestBody Map<String, String> payload) {
        String role = jwt.getClaim("role");
        if (!"ADMIN".equals(role)) throw new IllegalArgumentException("forbidden");
        Order o = orderService.updateStatus(id, payload.getOrDefault("status", ""));
        return toDto(o);
    }

    private Long extractUid(Jwt jwt) {
        Number uid = jwt.getClaim("uid");
        if (uid == null) throw new IllegalArgumentException("missing_uid_claim");
        return uid.longValue();
    }

    private OrderDto toDto(Order o) {
        List<OrderItemDto> items = o.getItems().stream()
                .map(i -> new OrderItemDto(i.getDoorId(), i.getName(), i.getPrice(), i.getQty(), i.getVariantSize(), i.getVariantColor(), i.getSku()))
                .toList();
        return new OrderDto(o.getId(), o.getStatus(), o.getTotal(), o.getCustomerName(), o.getPhone(), o.getCity(), o.getAddress(), o.getComment(), o.getDeliveryType(), o.getCreatedAt(), items);
    }
}
