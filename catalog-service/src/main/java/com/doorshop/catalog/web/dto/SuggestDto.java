package com.doorshop.catalog.web.dto;

import java.math.BigDecimal;

public record SuggestDto(Long id, String name, BigDecimal price, String imageUrl, String productKey, String series) {}
