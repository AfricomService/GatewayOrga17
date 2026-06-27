package com.orgacare.gateway.web.filter;

import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

@Component
public class SpaWebFilter implements WebFilter {

    /**
     * Forwards any unmapped paths (except those containing a period) to the client {@code index.html}.
     */
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        String contextPath = exchange.getRequest().getPath().contextPath().value();
        String path = exchange.getRequest().getPath().pathWithinApplication().value();
        if (
            !path.startsWith("/api") &&
            !path.startsWith("/management") &&
            !path.startsWith("/login") &&
            !path.startsWith("/services") &&
            !path.startsWith("/swagger") &&
            !path.startsWith("/v2/api-docs") &&
            !path.startsWith("/v3/api-docs") &&
            path.matches("[^\\\\.]*")
        ) {
            return chain.filter(
                exchange
                    .mutate()
                    .request(exchange.getRequest().mutate().path(contextPath + "/index.html").contextPath(contextPath).build())
                    .build()
            );
        }
        return chain.filter(exchange);
    }
}
