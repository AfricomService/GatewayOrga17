package com.orgacare.gateway.web.rest;

import com.orgacare.gateway.config.ApplicationProperties;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/frontend-config")
public class FrontendConfigResource {

    private final ApplicationProperties applicationProperties;

    public FrontendConfigResource(ApplicationProperties applicationProperties) {
        this.applicationProperties = applicationProperties;
    }

    @GetMapping("/keycloak")
    public ResponseEntity<Map<String, String>> getKeycloakConfig() {
        Map<String, String> body = new LinkedHashMap<>();
        body.put("adminUserCreateUrl", applicationProperties.getFrontend().getKeycloak().getAdminUserCreateUrl());
        return ResponseEntity.ok(body);
    }
}
