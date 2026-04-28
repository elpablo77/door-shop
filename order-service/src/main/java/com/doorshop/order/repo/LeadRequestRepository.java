package com.doorshop.order.repo;

import com.doorshop.order.domain.LeadRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LeadRequestRepository extends JpaRepository<LeadRequest, Long> {
    List<LeadRequest> findAllByOrderByCreatedAtDesc();
}
