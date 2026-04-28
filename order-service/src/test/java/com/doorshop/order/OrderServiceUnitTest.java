package com.doorshop.order;

import com.doorshop.order.domain.Order;
import com.doorshop.order.repo.OrderRepository;
import com.doorshop.order.service.OrderService;
import com.doorshop.order.web.dto.CreateOrderRequest;
import com.doorshop.order.web.dto.OrderItemRequest;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;

class OrderServiceUnitTest {

    @Test
    void createPersistsProcessingStatusAndVariantFields() {
        OrderRepository repo = Mockito.mock(OrderRepository.class);
        Mockito.when(repo.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

        OrderService service = new OrderService(repo);

        OrderItemRequest item = new OrderItemRequest();
        item.setDoorId(10L);
        item.setName("ATUM X7");
        item.setPrice(new BigDecimal("10000"));
        item.setQty(2);
        item.setVariantSize("800x2000");
        item.setVariantColor("Белый");
        item.setSku("ATUM_X7-800-1");

        CreateOrderRequest req = new CreateOrderRequest();
        req.setCustomerName("Иван");
        req.setPhone("+79000000000");
        req.setCity("Москва");
        req.setItems(List.of(item));

        Order order = service.create(1L, "u@test.com", req);

        assertEquals("PROCESSING", order.getStatus());
        assertEquals(new BigDecimal("20000"), order.getTotal());
        assertEquals("Иван", order.getCustomerName());
        assertEquals(1, order.getItems().size());
        assertEquals("800x2000", order.getItems().get(0).getVariantSize());
        assertEquals("Белый", order.getItems().get(0).getVariantColor());
        assertEquals("ATUM_X7-800-1", order.getItems().get(0).getSku());
    }
}
