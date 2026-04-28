package com.doorshop.order.web;

import com.doorshop.order.domain.LeadRequest;
import com.doorshop.order.service.LeadRequestService;
import com.doorshop.order.web.dto.CreateLeadRequest;
import com.doorshop.order.web.dto.LeadRequestDto;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/leads")
public class LeadController {

    private final LeadRequestService service;

    public LeadController(LeadRequestService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public LeadRequestDto create(@Valid @RequestBody CreateLeadRequest request) {
        return toDto(service.create(request));
    }

    @GetMapping
    public List<LeadRequestDto> all(@AuthenticationPrincipal Jwt jwt) {
        if (jwt == null || !"ADMIN".equalsIgnoreCase(jwt.getClaimAsString("role"))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "forbidden");
        }
        return service.all().stream().map(this::toDto).toList();
    }

    private LeadRequestDto toDto(LeadRequest lead) {
        return new LeadRequestDto(
                lead.getId(),
                lead.getType(),
                lead.getDoorId(),
                lead.getDoorName(),
                lead.getSelectedSize(),
                lead.getSelectedColor(),
                lead.getCustomerName(),
                lead.getPhone(),
                lead.getAddress(),
                lead.getMessage(),
                lead.getPreferredDate(),
                lead.getStatus(),
                lead.getCreatedAt()
        );
    }
}
