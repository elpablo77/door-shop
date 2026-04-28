package com.doorshop.catalog.web.dto;

import java.math.BigDecimal;

public record VariantDto(Long id, Integer widthMm, Integer heightMm, String color, String imageUrl, BigDecimal price, String sku) {}
