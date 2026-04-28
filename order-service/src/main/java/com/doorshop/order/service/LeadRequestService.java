package com.doorshop.order.service;

import com.doorshop.order.domain.LeadRequest;
import com.doorshop.order.repo.LeadRequestRepository;
import com.doorshop.order.web.dto.CreateLeadRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LeadRequestService {

    private final LeadRequestRepository repo;

    public LeadRequestService(LeadRequestRepository repo) {
        this.repo = repo;
    }

    public LeadRequest create(CreateLeadRequest req) {
        LeadRequest lead = new LeadRequest();
        lead.setType(req.getType());
        lead.setDoorId(req.getDoorId());
        lead.setDoorName(req.getDoorName());
        lead.setSelectedSize(req.getSelectedSize());
        lead.setSelectedColor(req.getSelectedColor());
        lead.setCustomerName(req.getCustomerName());
        lead.setPhone(req.getPhone());
        lead.setAddress(req.getAddress());
        lead.setMessage(req.getMessage());
        lead.setPreferredDate(req.getPreferredDate());
        lead.setConsent(req.isConsent());
        return repo.save(lead);
    }

    public List<LeadRequest> all() {
        return repo.findAllByOrderByCreatedAtDesc();
    }
}
