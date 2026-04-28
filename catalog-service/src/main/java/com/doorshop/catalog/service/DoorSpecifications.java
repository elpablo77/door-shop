package com.doorshop.catalog.service;

import com.doorshop.catalog.domain.Door;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;

public class DoorSpecifications {

    public static Specification<Door> q(String q) {
        if (q == null || q.isBlank()) return null;
        String like = "%" + q.trim().toLowerCase() + "%";
        return (root, query, cb) -> cb.or(
                cb.like(cb.lower(root.get("name")), like),
                cb.like(cb.lower(root.get("brand")), like),
                cb.like(cb.lower(root.get("collection")), like),
                cb.like(cb.lower(root.get("material")), like),
                cb.like(cb.lower(root.get("color")), like)
        );
    }

    public static Specification<Door> minPrice(BigDecimal v) {
        if (v == null) return null;
        return (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("price"), v);
    }

    public static Specification<Door> maxPrice(BigDecimal v) {
        if (v == null) return null;
        return (root, query, cb) -> cb.lessThanOrEqualTo(root.get("price"), v);
    }

    public static Specification<Door> eqIgnoreCase(String field, String v) {
        if (v == null || v.isBlank()) return null;
        String val = v.trim().toLowerCase();
        return (root, query, cb) -> cb.equal(cb.lower(root.get(field)), val);
    }

    public static Specification<Door> boolEq(String field, Boolean v) {
        if (v == null) return null;
        return (root, query, cb) -> cb.equal(root.get(field), v);
    }
}
