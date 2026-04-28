package com.doorshop.catalog;

import com.doorshop.catalog.repo.DoorRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.greaterThan;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CatalogApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private DoorRepository doorRepository;

    @Test
    void suggestReturnsItemsWhenSeeded() throws Exception {
        mockMvc.perform(get("/api/catalog/suggest").queryParam("q", "at"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(greaterThan(0)));
    }

    @Test
    void variantsEndpointReturnsSizeVariantsForProductKey() throws Exception {
        String productKey = doorRepository.findAll().stream()
                .filter(d -> "VFD_ATUM_A1".equals(d.getProductKey()))
                .findFirst()
                .orElseThrow()
                .getProductKey();

        mockMvc.perform(get("/api/catalog/products/{productKey}/variants", productKey))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(greaterThan(3)));
    }
}
