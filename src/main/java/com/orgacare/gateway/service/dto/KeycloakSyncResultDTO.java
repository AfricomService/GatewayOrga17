package com.orgacare.gateway.service.dto;

public class KeycloakSyncResultDTO {

    private int created;
    private int updated;
    private int skipped;
    private String message;

    public KeycloakSyncResultDTO(int created, int updated, int skipped) {
        this.created = created;
        this.updated = updated;
        this.skipped = skipped;
        this.message = String.format("Sync terminée : %d créé(s), %d mis à jour, %d ignoré(s)", created, updated, skipped);
    }

    public int getCreated() {
        return created;
    }

    public int getUpdated() {
        return updated;
    }

    public int getSkipped() {
        return skipped;
    }

    public String getMessage() {
        return message;
    }
}
