package com.orgacare.gateway.web.rest;

import com.orgacare.gateway.security.AuthoritiesConstants;
import com.orgacare.gateway.service.KeycloakSyncService;
import com.orgacare.gateway.service.dto.KeycloakSyncResultDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/admin/keycloak")
public class KeycloakSyncResource {

    private final Logger log = LoggerFactory.getLogger(KeycloakSyncResource.class);
    private final KeycloakSyncService keycloakSyncService;

    public KeycloakSyncResource(KeycloakSyncService keycloakSyncService) {
        this.keycloakSyncService = keycloakSyncService;
        log.info("✅ KeycloakSyncResource initialisé");
    }

    /**
     * POST /api/admin/keycloak/sync
     * Synchronise manuellement les users Keycloak → jhi_user
     */
    @PostMapping("/sync")
    @PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.ADMIN + "\")")
    public Mono<ResponseEntity<KeycloakSyncResultDTO>> syncKeycloakUsers() {
        log.info("REST request to sync Keycloak users");
        return keycloakSyncService.syncNow().map(result -> ResponseEntity.ok().body(result));
    }
}
