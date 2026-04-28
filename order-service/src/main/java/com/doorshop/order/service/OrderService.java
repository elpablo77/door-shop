package com.doorshop.order.service;

import com.doorshop.order.domain.Order;
import com.doorshop.order.domain.OrderItem;
import com.doorshop.order.repo.OrderRepository;
import com.doorshop.order.web.dto.CreateOrderRequest;
import com.doorshop.order.web.dto.OrderItemRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Set;

@Service
public class OrderService {

    public static final Set<String> STATUSES = Set.of("PROCESSING", "ACCEPTED", "AWAITING_STOCK", "PICKING", "DELIVERY", "COMPLETED");

    private final OrderRepository repo;

    public OrderService(OrderRepository repo) {
        this.repo = repo;
    }

    public Order create(Long userId, String userEmail, CreateOrderRequest req) {
        Order order = new Order();
        order.setUserId(userId);
        order.setUserEmail(userEmail);
        order.setStatus("PROCESSING");
        order.setCustomerName(req.getCustomerName());
        order.setPhone(req.getPhone());
        order.setCity(req.getCity());
        order.setAddress(req.getAddress());
        order.setComment(req.getComment());
        order.setDeliveryType(req.getDeliveryType());

        BigDecimal total = BigDecimal.ZERO;

        for (OrderItemRequest it : req.getItems()) {
            if (it.getPrice().signum() < 0) throw new IllegalArgumentException("bad_price");

            OrderItem item = new OrderItem();
            item.setDoorId(it.getDoorId());
            item.setName(it.getName());
            item.setPrice(it.getPrice());
            item.setQty(it.getQty());
            item.setVariantSize(it.getVariantSize());
            item.setVariantColor(it.getVariantColor());
            item.setSku(it.getSku());
            order.addItem(item);

            total = total.add(it.getPrice().multiply(BigDecimal.valueOf(it.getQty())));
        }

        order.setTotal(total);
        return repo.save(order);
    }

    public Order updateStatus(Long orderId, String status) {
        if (!STATUSES.contains(status)) throw new IllegalArgumentException("bad_status");
        Order order = repo.findById(orderId).orElseThrow(() -> new IllegalArgumentException("not_found"));
        order.setStatus(status);
        return repo.save(order);
    }
}
