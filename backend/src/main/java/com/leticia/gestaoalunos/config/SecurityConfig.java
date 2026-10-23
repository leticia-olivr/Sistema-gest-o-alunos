package com.leticia.gestaoalunos.config;

import com.leticia.gestaoalunos.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter
    ) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/api/auth/**",
                                "/swagger-ui/**",
                                "/v3/api-docs/**",
                                "/h2-console/**",
                                // Sem isso, um 403 é reencaminhado para /error sem o JWT e vira 401.
                                "/error"
                        ).permitAll()
                        // Leitura liberada para ADMIN e LEITOR; escrita somente ADMIN.
                        .requestMatchers(HttpMethod.GET, "/api/alunos/**")
                        .hasAnyRole("ADMIN", "LEITOR")
                        .requestMatchers("/api/alunos/**", "/api/admin/**")
                        .hasRole("ADMIN")
                        .anyRequest().hasAnyRole("ADMIN", "LEITOR")
                )
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint(
                                new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)
                        )
                )
                .headers(headers ->
                        headers.frameOptions(
                                frame -> frame.disable()
                        )
                )
                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}