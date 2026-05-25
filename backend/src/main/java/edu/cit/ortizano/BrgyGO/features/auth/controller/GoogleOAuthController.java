package edu.cit.ortizano.BrgyGO.features.auth.controller;

import edu.cit.ortizano.BrgyGO.features.auth.model.User;
import edu.cit.ortizano.BrgyGO.features.auth.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class GoogleOAuthController {

    private final UserRepository userRepository;

    public GoogleOAuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Called by the frontend immediately after Google redirects back with
     * ?googleAuth=true. The Spring session is still alive at this point so
     * the Principal is populated with the OAuth2 user data.
     *
     * Flow:
     *  1. Google redirects browser → Spring backend (/login/oauth2/code/google)
     *  2. Spring validates the code, sets session, redirects → frontend (?googleAuth=true)
     *  3. Frontend detects googleAuth=true, calls GET /api/auth/google/user (with cookies)
     *  4. This endpoint reads the Principal, finds-or-creates the DB user, returns JSON
     *  5. Frontend stores the user in localStorage and navigates to dashboard
     */
    @GetMapping("/google/user")
    public ResponseEntity<?> getGoogleUser(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(Map.of(
                "error", "Not authenticated — Google session not found. Please try signing in again."
            ));
        }

        if (!(principal instanceof OAuth2AuthenticationToken)) {
            return ResponseEntity.status(401).body(Map.of(
                "error", "Unexpected authentication type: " + principal.getClass().getSimpleName()
            ));
        }

        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) principal;
        OAuth2User oauthUser = oauthToken.getPrincipal();

        String email    = oauthUser.getAttribute("email");
        String name     = oauthUser.getAttribute("name");
        String googleId = oauthUser.getAttribute("sub"); // Google's unique user ID

        if (email == null) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Google did not return an email address. Please ensure your Google account has a verified email."
            ));
        }

        // Find existing user or auto-register a new one
        Optional<User> existingOpt = userRepository.findByEmail(email);
        User user;

        if (existingOpt.isPresent()) {
            user = existingOpt.get();
            // Link Google ID if not already linked (first time signing in via Google)
            if (user.getGoogleId() == null) {
                user.setGoogleId(googleId);
                user.setEmailVerified(true); // Google already verified the email
                userRepository.save(user);
            }
        } else {
            // Auto-register new Google user — no password, no OTP needed
            user = new User();
            user.setEmail(email);
            user.setFullName(name != null ? name : email);
            // Placeholder password — this account can only sign in via Google
            user.setPassword("GOOGLE_OAUTH_NO_PASSWORD_" + googleId);
            user.setGoogleId(googleId);
            user.setEmailVerified(true);
            user.setIsActive(true);
            userRepository.save(user);
        }

        // Return the same shape as the email/password login response so the
        // frontend AuthContext can handle both flows identically.
        return ResponseEntity.ok(Map.of(
            "token",    "google-session-" + user.getId(),
            "id",       user.getId(),
            "email",    user.getEmail(),
            "fullName", user.getFullName(),
            "role",     user.getRole().toString()
        ));
    }
}