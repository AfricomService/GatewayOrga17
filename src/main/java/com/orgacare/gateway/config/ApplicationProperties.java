package com.orgacare.gateway.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "application", ignoreUnknownFields = false)
public class ApplicationProperties {

    private final Frontend frontend = new Frontend();

    public Frontend getFrontend() {
        return frontend;
    }

    public static class Frontend {

        private final Keycloak keycloak = new Keycloak();

        public Keycloak getKeycloak() {
            return keycloak;
        }
    }

    public static class Keycloak {

        private String adminUserCreateUrl;

        public String getAdminUserCreateUrl() {
            return adminUserCreateUrl;
        }

        public void setAdminUserCreateUrl(String adminUserCreateUrl) {
            this.adminUserCreateUrl = adminUserCreateUrl;
        }
    }
}
