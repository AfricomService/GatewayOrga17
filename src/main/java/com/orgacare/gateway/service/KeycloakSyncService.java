package com.orgacare.gateway.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.orgacare.gateway.config.ApplicationProperties;
import com.orgacare.gateway.domain.Authority;
import com.orgacare.gateway.domain.User;
import com.orgacare.gateway.repository.UserRepository;
import com.orgacare.gateway.service.dto.KeycloakSyncResultDTO;
import java.util.Set;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
public class KeycloakSyncService {

    private final Logger log = LoggerFactory.getLogger(KeycloakSyncService.class);

    private final ApplicationProperties applicationProperties;
    private final UserRepository userRepository;
    private final UserService userService;
    private final WebClient webClient;

    public KeycloakSyncService(
        ApplicationProperties applicationProperties,
        UserRepository userRepository,
        UserService userService,
        WebClient.Builder webClientBuilder
    ) {
        this.applicationProperties = applicationProperties;
        this.userRepository = userRepository;
        this.userService = userService;
        this.webClient = webClientBuilder.build();
    }

    // ── DTOs internes ────────────────────────────────────────────────────────

    @JsonIgnoreProperties(ignoreUnknown = true)
    static class TokenResponse {

        @JsonProperty("access_token")
        public String accessToken;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    static class KcUser {

        public String id;
        public String username;
        public String firstName;
        public String lastName;
        public String email;
        public Boolean enabled;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    static class KcRole {

        public String name;
    }

    // ── Point d'entrée ───────────────────────────────────────────────────────

    public Mono<KeycloakSyncResultDTO> syncNow() {
        AtomicInteger created = new AtomicInteger(0);
        AtomicInteger updated = new AtomicInteger(0);
        AtomicInteger skipped = new AtomicInteger(0);

        return getAdminToken()
            .flatMapMany(token -> fetchAllKeycloakUsers(token).flatMap(kcUser -> syncUser(token, kcUser, created, updated, skipped)))
            .then(Mono.fromCallable(() -> new KeycloakSyncResultDTO(created.get(), updated.get(), skipped.get())))
            .doOnSuccess(r ->
                log.info("✅ Sync terminée — créés: {}, mis à jour: {}, ignorés: {}", r.getCreated(), r.getUpdated(), r.getSkipped())
            )
            .doOnError(e -> log.error("❌ Erreur sync: {}", e.getMessage()));
    }

    // ── Privé ────────────────────────────────────────────────────────────────

    private Mono<String> getAdminToken() {
        ApplicationProperties.KeycloakAdmin.Admin cfg = applicationProperties.getKeycloakAdmin().getAdmin();

        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("grant_type", "password");
        form.add("client_id", cfg.getClientId());
        form.add("username", cfg.getUsername());
        form.add("password", cfg.getPassword());

        String tokenUrl = cfg.getServerUrl() + "/realms/" + cfg.getRealm() + "/protocol/openid-connect/token";

        return webClient
            .post()
            .uri(tokenUrl)
            .contentType(MediaType.APPLICATION_FORM_URLENCODED)
            .body(BodyInserters.fromFormData(form))
            .retrieve()
            .bodyToMono(TokenResponse.class)
            .map(r -> r.accessToken)
            .doOnSuccess(t -> log.debug("🔑 Token admin Keycloak obtenu"))
            .doOnError(e -> log.error("❌ Échec obtention token: {}", e.getMessage()));
    }

    private Flux<KcUser> fetchAllKeycloakUsers(String token) {
        ApplicationProperties.KeycloakAdmin.Admin cfg = applicationProperties.getKeycloakAdmin().getAdmin();

        String usersUrl = cfg.getServerUrl() + "/admin/realms/" + cfg.getTargetRealm() + "/users?max=10000";

        return webClient
            .get()
            .uri(usersUrl)
            .header("Authorization", "Bearer " + token)
            .retrieve()
            .bodyToFlux(KcUser.class)
            .doOnComplete(() -> log.info("📋 Users Keycloak récupérés depuis realm '{}'", cfg.getTargetRealm()));
    }

    /**
     * Récupère les rôles realm assignés à un utilisateur Keycloak donné,
     * et les mappe en authorities locales préfixées "ROLE_".
     * En cas d'échec ou d'absence de rôle, retombe sur ROLE_USER.
     */
    private Mono<Set<Authority>> fetchUserAuthorities(String token, String kcUserId) {
        ApplicationProperties.KeycloakAdmin.Admin cfg = applicationProperties.getKeycloakAdmin().getAdmin();

        String rolesUrl = cfg.getServerUrl() + "/admin/realms/" + cfg.getTargetRealm() + "/users/" + kcUserId + "/role-mappings/realm";

        return webClient
            .get()
            .uri(rolesUrl)
            .header("Authorization", "Bearer " + token)
            .retrieve()
            .bodyToFlux(KcRole.class)
            .map(r -> r.name)
            .filter(name -> name != null && !name.isBlank())
            // Keycloak renvoie aussi des rôles techniques par défaut (offline_access, uma_authorization, etc.)
            // qu'on ne veut pas importer comme authorities applicatives.
            .filter(name -> !isDefaultKeycloakRole(name))
            .map(name -> name.startsWith("ROLE_") ? name : "ROLE_" + name.toUpperCase())
            .collect(Collectors.toSet())
            .map(names -> {
                Set<Authority> authorities = names
                    .stream()
                    .map(n -> {
                        Authority a = new Authority();
                        a.setName(n);
                        return a;
                    })
                    .collect(Collectors.toSet());
                if (authorities.isEmpty()) {
                    Authority roleUser = new Authority();
                    roleUser.setName("ROLE_USER");
                    authorities.add(roleUser);
                }
                return authorities;
            })
            .doOnError(e -> log.warn("⚠️ Échec récupération rôles pour user Keycloak '{}': {}", kcUserId, e.getMessage()))
            .onErrorResume(e -> {
                Authority roleUser = new Authority();
                roleUser.setName("ROLE_USER");
                return Mono.just(Set.of(roleUser));
            });
    }

    private boolean isDefaultKeycloakRole(String roleName) {
        return (
            "offline_access".equalsIgnoreCase(roleName) ||
            "uma_authorization".equalsIgnoreCase(roleName) ||
            roleName.toLowerCase().startsWith("default-roles-")
        );
    }

    private Mono<Void> syncUser(String token, KcUser kcUser, AtomicInteger created, AtomicInteger updated, AtomicInteger skipped) {
        if ("admin".equalsIgnoreCase(kcUser.username)) {
            skipped.incrementAndGet();
            return Mono.empty();
        }

        String login = kcUser.username != null ? kcUser.username.toLowerCase() : kcUser.id;

        return fetchUserAuthorities(token, kcUser.id)
            .flatMap(authorities ->
                userRepository
                    .findById(kcUser.id)
                    .switchIfEmpty(Mono.defer(() -> userRepository.findOneByLogin(login)))
                    .flatMap(existing -> updateIfChanged(existing, kcUser, authorities, updated))
                    .switchIfEmpty(Mono.defer(() -> persistNewUser(kcUser, authorities, created)))
            )
            .onErrorResume(e -> {
                log.warn("⚠️ Échec sync user '{}': {}", kcUser.username, e.getMessage());
                skipped.incrementAndGet();
                return Mono.empty();
            })
            .then();
    }

    private Mono<User> persistNewUser(KcUser kcUser, Set<Authority> authorities, AtomicInteger created) {
        log.info("➕ Persistance nouveau user: {}", kcUser.username);
        User user = buildUser(kcUser, authorities);
        return userService
            .saveUser(user, true)
            .doOnSuccess(u -> {
                created.incrementAndGet();
                log.info(
                    "✅ User '{}' créé dans jhi_user avec rôles {}",
                    u.getLogin(),
                    authorities.stream().map(Authority::getName).collect(Collectors.toList())
                );
            })
            .doOnError(e -> log.warn("⚠️ Échec persist '{}': {}", kcUser.username, e.getMessage()));
    }

    private Mono<User> updateIfChanged(User existing, KcUser kcUser, Set<Authority> authorities, AtomicInteger updated) {
        boolean changed = false;

        if (kcUser.firstName != null && !kcUser.firstName.equals(existing.getFirstName())) {
            existing.setFirstName(kcUser.firstName);
            changed = true;
        }
        if (kcUser.lastName != null && !kcUser.lastName.equals(existing.getLastName())) {
            existing.setLastName(kcUser.lastName);
            changed = true;
        }
        if (kcUser.email != null && !kcUser.email.equalsIgnoreCase(existing.getEmail())) {
            existing.setEmail(kcUser.email.toLowerCase());
            changed = true;
        }
        boolean kcEnabled = Boolean.TRUE.equals(kcUser.enabled);
        if (kcEnabled != existing.isActivated()) {
            existing.setActivated(kcEnabled);
            changed = true;
        }

        Set<String> existingAuthorityNames = existing.getAuthorities().stream().map(Authority::getName).collect(Collectors.toSet());
        Set<String> newAuthorityNames = authorities.stream().map(Authority::getName).collect(Collectors.toSet());
        boolean authoritiesChanged = !existingAuthorityNames.equals(newAuthorityNames);

        final boolean baseInfoChanged = changed;

        Mono<User> saveMono;
        if (baseInfoChanged) {
            log.debug("🔁 Mise à jour user '{}'", existing.getLogin());
            saveMono = userService.saveUser(existing).doOnSuccess(u -> updated.incrementAndGet());
        } else {
            saveMono = Mono.just(existing);
        }

        if (authoritiesChanged) {
            log.info("🔁 Rôles modifiés pour '{}': {} → {}", existing.getLogin(), existingAuthorityNames, newAuthorityNames);
            return saveMono
                .flatMap(u -> userService.syncUserAuthorities(u.getId(), authorities).thenReturn(u))
                .doOnSuccess(u -> {
                    if (!baseInfoChanged) {
                        updated.incrementAndGet();
                    }
                });
        }

        return saveMono;
    }

    private User buildUser(KcUser kcUser, Set<Authority> authorities) {
        User user = new User();
        user.setId(kcUser.id);
        user.setLogin(kcUser.username != null ? kcUser.username.toLowerCase() : kcUser.id);
        user.setFirstName(kcUser.firstName);
        user.setLastName(kcUser.lastName);
        user.setEmail(kcUser.email != null ? kcUser.email.toLowerCase() : kcUser.username + "@placeholder.local");
        user.setActivated(Boolean.TRUE.equals(kcUser.enabled));
        user.setLangKey("fr");
        user.setAuthorities(authorities);

        return user;
    }
}
