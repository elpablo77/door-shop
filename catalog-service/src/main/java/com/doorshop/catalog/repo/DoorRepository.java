package com.doorshop.catalog.repo;

import com.doorshop.catalog.domain.Door;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface DoorRepository extends JpaRepository<Door, Long>, JpaSpecificationExecutor<Door> {
    Optional<Door> findBySku(String sku);
    List<Door> findByProductKeyOrderByWidthMmAsc(String productKey);
}
