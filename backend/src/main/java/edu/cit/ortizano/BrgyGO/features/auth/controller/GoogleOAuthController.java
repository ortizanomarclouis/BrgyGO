package edu.cit.ortizano.BrgyGO.features.auth.controller;

import edu.cit.ortizano.BrgyGO.features.auth.model.User;
import edu.cit.ortizano.BrgyGO.features.auth.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/auth")
public class GoogleOAuthController {

    private final UserRepository userRepository;

    // Short-lived token store: token → user data  (lives max 5 minutes)
    // In production you'd use Redis; this in-memory map is fine for a single instance.
    private static final ConcurrentHashMap<String, Map<String, Object>> pendingTokens =
            new ConcurrentHashMap<>();

    public GoogleOAuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Called by Spring Security after Google authenticates the user.
     * We build the user record, create a short-lived one-time token,
     * store the user data in memory, and redirect the BROWSER to the
     * frontend with just that token in the URL.
     *
     * This avoids the cross-domain session-cookie problem entirely:
     * the frontend then calls /api/auth/google/exchange?token=XXX to
     * swap the token for the real user JSON — no session cookie needed.
     */
    @GetMapping("/google/callback")
    public org.springframework.web.servlet.view.RedirectView handleGoogleCallback(
            Principal principal) {

        String frontendBase = System.getenv("FRONTEND_URL") != null
                ? System.getenv("FRONTEND_URL")
                : "https://brgygo-frontend.onrender.com";

        if (principal == null || !(principal instanceof OAuth2AuthenticationToken)) {
            return new org.springframework.web.servlet.view.RedirectView(
                    frontendBase + "?googleAuth=error");
        }

        try {
            OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) principal;
            OAuth2User oauthUser = oauthToken.getPrincipal();

            String email    = oauthUser.getAttribute("email");
            String name     = oauthUser.getAttribute("name");
            String googleId = oauthUser.getAttribute("sub");

            if (email == null) {
                return new org.springframework.web.servlet.view.RedirectView(
                        frontendBase + "?googleAuth=error");
            }

            // Find or create the user
            Optional<User> existingOpt = userRepository.findByEmail(email);
            User user;

            if (existingOpt.isPresent()) {
                user = existingOpt.get();
                if (user.getGoogleId() == null) {
                    user.setGoogleId(googleId);
                    user.setEmailVerified(true);
                    userRepository.save(user);
                }
            } else {
                user = new User();
                user.setEmail(email);
                user.setFullName(name != null ? name : email);
                user.setPassword("GOOGLE_OAUTH_NO_PASSWORD_" + googleId);
                user.setGoogleId(googleId);
                user.setEmailVerified(true);
                user.setIsActive(true);
                userRepository.save(user);
            }

            // Create a short-lived one-time token (UUID)
            String oneTimeToken = java.util.UUID.randomUUID().toString();

            Map<String, Object> userData = new java.util.HashMap<>();
            userData.put("token",    "google-session-" + user.getId());
            userData.put("id",       user.getId());
            userData.put("email",    user.getEmail());
            userData.put("fullName", user.getFullName());
            userData.put("role",     user.getRole().toString());
            userData.put("created",  System.currentTimeMillis());

            pendingTokens.put(oneTimeToken, userData);

            // Clean up tokens older than 5 minutes (lazy cleanup)
            long fiveMinutesAgo = System.currentTimeMillis() - 300_000;
            pendingTokens.entrySet().removeIf(e ->
                    (Long) e.getValue().get("created") < fiveMinutesAgo);

            // Redirect browser to frontend with just the one-time token
            return new org.springframework.web.servlet.view.RedirectView(
                    frontendBase + "?googleToken=" + oneTimeToken);

        } catch (Exception e) {
            System.err.println("Google OAuth callback error: " + e.getMessage());
            return new org.springframework.web.servlet.view.RedirectView(
                    frontendBase + "?googleAuth=error");
        }
    }

    /**
     * Frontend calls this to exchange the one-time token for actual user data.
     * No session cookie needed — the token IS the proof of authentication.
     */
    @GetMapping("/google/exchange")
    public ResponseEntity<?> exchangeGoogleToken(@RequestParam String token) {
        Map<String, Object> userData = pendingTokens.remove(token);

        if (userData == null) {
            return ResponseEntity.status(401).body(Map.of(
                "error", "Token not found or already used. Please sign in again."
            ));
        }

        // Check it's not older than 5 minutes
        long created = (Long) userData.get("created");
        if (System.currentTimeMillis() - created > 300_000) {
            return ResponseEntity.status(401).body(Map.of(
                "error", "Token expired. Please sign in again."
            ));
        }

        // Remove internal field before sending to frontend
        userData.remove("created");
        return ResponseEntity.ok(userData);
    }

    /**
     * KEPT for backward compatibility — but now returns a helpful error
     * explaining to use /google/exchange instead.
     */
    @GetMapping("/google/user")
    public ResponseEntity<?> getGoogleUser(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(Map.of(
                "error", "Not authenticated. Please use the Google Sign-In button to log in."
            ));
        }
        return ResponseEntity.status(400).body(Map.of(
            "error", "This endpoint is deprecated. The app should use /google/exchange with a token."
        ));
    }
}