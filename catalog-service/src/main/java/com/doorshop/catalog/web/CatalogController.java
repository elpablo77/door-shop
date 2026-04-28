package com.doorshop.catalog.web;

import com.doorshop.catalog.domain.Door;
import com.doorshop.catalog.service.CatalogService;
import com.doorshop.catalog.web.dto.*;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/catalog")
public class CatalogController {

    private final CatalogService service;

    public CatalogController(CatalogService service) {
        this.service = service;
    }

    @GetMapping("/doors")
    public Page<DoorDto> list(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String material,
            @RequestParam(required = false) String color,
            @RequestParam(required = false) String doorType,
            @RequestParam(required = false) String series,
            @RequestParam(required = false) String style,
            @RequestParam(required = false) String doorKind,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "new") String sort
    ) {
        return service.search(q, minPrice, maxPrice, material, color, doorType, series, style, doorKind, page, size, sort)
                .map(door -> DoorDto.from(door, service.getProductVariants(door.getProductKey())));
    }

    @GetMapping("/doors/{id}")
    public DoorDto get(@PathVariable Long id) {
        Door door = service.get(id).orElseThrow(() -> new IllegalArgumentException("not_found"));
        List<Door> variants = service.getProductVariants(door.getProductKey());
        return DoorDto.from(door, variants.isEmpty() ? List.of(door) : variants);
    }

    @GetMapping("/products/{productKey}/variants")
    public List<VariantDto> variants(@PathVariable String productKey) {
        return service.variants(productKey);
    }

    @GetMapping("/suggest")
    public List<SuggestDto> suggest(@RequestParam String q) {
        return service.suggest(q);
    }

    @GetMapping("/series")
    public Map<String, List<SeriesDto>> series() {
        return service.seriesTree();
    }

    @GetMapping("/filters")
    public FiltersDto filters(@RequestParam(required = false) String doorType) {
        return service.filters(doorType);
    }

    @PostMapping("/finder/recommendations")
    public List<FinderRecommendationDto> finder(@Valid @RequestBody FinderRequest req) {
        return service.recommend(req);
    }

    @PostMapping("/admin/reseed")
    public Map<String, Long> reseed(@AuthenticationPrincipal Jwt jwt) {
        ensureAdmin(jwt);
        return Map.of("inserted", service.reseed());
    }

    @GetMapping("/admin/products")
    public List<AdminProductDto> adminProducts(@AuthenticationPrincipal Jwt jwt) {
        ensureAdmin(jwt);
        return service.adminProducts();
    }

    @PostMapping("/admin/products")
    @ResponseStatus(HttpStatus.CREATED)
    public AdminProductDto createProduct(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody AdminProductRequest request) {
        ensureAdmin(jwt);
        return service.createAdminProduct(request);
    }

    @PutMapping("/admin/products/{productKey}")
    public AdminProductDto updateProduct(@AuthenticationPrincipal Jwt jwt, @PathVariable String productKey, @Valid @RequestBody AdminProductRequest request) {
        ensureAdmin(jwt);
        return service.updateAdminProduct(productKey, request);
    }

    @DeleteMapping("/admin/products/{productKey}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProduct(@AuthenticationPrincipal Jwt jwt, @PathVariable String productKey) {
        ensureAdmin(jwt);
        service.deleteAdminProduct(productKey);
    }

    private void ensureAdmin(Jwt jwt) {
        if (jwt == null || !"ADMIN".equalsIgnoreCase(jwt.getClaimAsString("role"))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "forbidden");
        }
    }
}
