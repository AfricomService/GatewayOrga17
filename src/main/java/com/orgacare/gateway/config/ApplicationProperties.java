package com.orgacare.gateway.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "application", ignoreUnknownFields = false)
public class ApplicationProperties {

    private final Frontend frontend = new Frontend();
    private final KeycloakAdmin keycloakAdmin = new KeycloakAdmin();

    public Frontend getFrontend() {
        return frontend;
    }

    public KeycloakAdmin getKeycloakAdmin() {
        return keycloakAdmin;
    }

    // ── Frontend ──────────────────────────────────────────
    public static class Frontend {

        private final Keycloak keycloak = new Keycloak();

        public Keycloak getKeycloak() {
            return keycloak;
        }

        public static class Keycloak {

            private String adminUserCreateUrl;

            public String getAdminUserCreateUrl() {
                return adminUserCreateUrl;
            }

            public void setAdminUserCreateUrl(String v) {
                this.adminUserCreateUrl = v;
            }
        }
    }

    // ── KeycloakAdmin ─────────────────────────────────────
    // getter getKeycloakAdmin() → YAML: keycloak-admin
    public static class KeycloakAdmin {

        private Admin admin = new Admin();

        public Admin getAdmin() {
            return admin;
        }

        public void setAdmin(Admin admin) {
            this.admin = admin;
        }

        public static class Admin {

            private String serverUrl;
            private String realm;
            private String clientId;
            private String username;
            private String password;
            private String targetRealm;

            public String getServerUrl() {
                return serverUrl;
            }

            public void setServerUrl(String v) {
                this.serverUrl = v;
            }

            public String getRealm() {
                return realm;
            }

            public void setRealm(String v) {
                this.realm = v;
            }

            public String getClientId() {
                return clientId;
            }

            public void setClientId(String v) {
                this.clientId = v;
            }

            public String getUsername() {
                return username;
            }

            public void setUsername(String v) {
                this.username = v;
            }

            public String getPassword() {
                return password;
            }

            public void setPassword(String v) {
                this.password = v;
            }

            public String getTargetRealm() {
                return targetRealm;
            }

            public void setTargetRealm(String v) {
                this.targetRealm = v;
            }
        }
    }
}
