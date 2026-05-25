package edu.cit.ortizano.BrgyGO.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> {})
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/requests/**").permitAll()
                .requestMatchers("/api/issues/**").permitAll()
                .requestMatchers("/api/announcements/**").permitAll()
                .requestMatchers("/api/payments/**").permitAll()
                .anyRequest().authenticated()
            )
            .oauth2Login(oauth2 -> oauth2
                // After Google authenticates the user, redirect to the frontend
                // with googleAuth=true as a plain query param (no hash) so
                // App.js can detect it via URLSearchParams.
                .defaultSuccessUrl("http://localhost:3000?googleAuth=true", true)
                .failureUrl("http://localhost:3000/login?error=google_failed")
            )
            .headers(headers -> headers
                .frameOptions(HeadersConfigurer.FrameOptionsConfig::disable));

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}