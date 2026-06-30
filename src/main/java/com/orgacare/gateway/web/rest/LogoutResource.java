package com.orgacare.gateway.web.rest;

import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ReactiveClientRegistrationRepository;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.WebSession;
import reactor.core.publisher.Mono;

/**
 * REST controller for managing global OIDC logout.
 */
@RestController
public class LogoutResource {

    private final Mono<ClientRegistration> registration;

    public LogoutResource(ReactiveClientRegistrationRepository registrations) {
        this.registration = registrations.findByRegistrationId("oidc");
    }

    @PostMapping("/api/logout")
    public Mono<Map<String, String>> logout(
        @AuthenticationPrincipal(expression = "idToken") OidcIdToken idToken,
        ServerHttpRequest request,
        WebSession session
    ) {
        return session.invalidate().then(this.registration.map(oidc -> prepareLogoutUri(request, oidc, idToken)));
    }

    private Map<String, String> prepareLogoutUri(ServerHttpRequest request, ClientRegistration clientRegistration, OidcIdToken idToken) {
        StringBuilder logoutUrl = new StringBuilder();
        String issuerUri = clientRegistration.getProviderDetails().getIssuerUri();
        if (issuerUri.contains("auth0.com")) {
            logoutUrl.append(issuerUri.endsWith("/") ? issuerUri + "v2/logout" : issuerUri + "/v2/logout");
        } else {
            logoutUrl.append(clientRegistration.getProviderDetails().getConfigurationMetadata().get("end_session_endpoint").toString());
        }

        String originUrl = buildPostLogoutRedirectUri(request);

        if (logoutUrl.indexOf("/protocol") > -1) {
            logoutUrl.append("?post_logout_redirect_uri=").append(originUrl).append("&id_token_hint=").append(idToken.getTokenValue());
        } else if (logoutUrl.indexOf("auth0.com") > -1) {
            // Auth0
            logoutUrl.append("?client_id=").append(clientRegistration.getClientId()).append("&returnTo=").append(originUrl);
        } else {
            // Okta
            logoutUrl.append("?id_token_hint=").append(idToken.getTokenValue()).append("&post_logout_redirect_uri=").append(originUrl);
        }
        return Map.of("logoutUrl", logoutUrl.toString());
    }

    /**
     * Builds the post-logout redirect URI from the actual server request,
     * including the reverse-proxy context path (e.g. "/orga"), instead of
     * relying on the browser's "Origin" header which never carries a path.
     */
    private String buildPostLogoutRedirectUri(ServerHttpRequest request) {
        String scheme = request.getURI().getScheme();
        String host = request.getURI().getHost();
        int port = request.getURI().getPort();

        StringBuilder uri = new StringBuilder();
        uri.append(scheme).append("://").append(host);
        if (port != -1 && !((scheme.equals("http") && port == 80) || (scheme.equals("https") && port == 443))) {
            uri.append(":").append(port);
        }

        String contextPath = request.getPath().contextPath().value();
        if (contextPath != null && !contextPath.isEmpty()) {
            uri.append(contextPath);
        }
        uri.append("/");

        return uri.toString();
    }
}
