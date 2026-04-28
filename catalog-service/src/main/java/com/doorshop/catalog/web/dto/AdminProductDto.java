package com.doorshop.catalog.web.dto;

import java.math.BigDecimal;
import java.util.List;

public record AdminProductDto(
        String productKey,
        String name,
        String doorType,
        String series,
        String seriesLabel,
        String style,
        String doorKind,
        String materialGroup,
        String color,
        String colorGroup,
        boolean glass,
        boolean insulation,
        BigDecimal basePrice,
        Integer thicknessMm,
        String imageUrl,
        String description,
        String characteristics,
        List<Integer> sizes
) {}
