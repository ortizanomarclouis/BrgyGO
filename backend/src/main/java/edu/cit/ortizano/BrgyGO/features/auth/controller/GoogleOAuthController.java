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
     * Called by the frontend after Google redirects back.
     * Finds or creates the user from Google profile data.
     */
    @GetMapping("/google/user")
    public ResponseEntity<?> getGoogleUser(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }

        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) principal;
        OAuth2User oauthUser = oauthToken.getPrincipal();

        String email      = oauthUser.getAttribute("email");
        String name       = oauthUser.getAttribute("name");
        String googleId   = oauthUser.getAttribute("sub"); // Google's unique user ID

        if (email == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Google did not return an email address"));
        }

        // Find existing user or create a new one
        Optional<User> existingOpt = userRepository.findByEmail(email);
        User user;

        if (existingOpt.isPresent()) {
            user = existingOpt.get();
            // Link Google ID if not already linked
            if (user.getGoogleId() == null) {
                user.setGoogleId(googleId);
                user.setEmailVerified(true); // Google already verified the email
                userRepository.save(user);
            }
        } else {
            // Auto-register new Google user
            user = new User();
            user.setEmail(email);
            user.setFullName(name != null ? name : email);
            user.setPassword("GOOGLE_OAUTH_NO_PASSWORD_" + googleId); // placeholder — can't log in with password
            user.setGoogleId(googleId);
            user.setEmailVerified(true);
            user.setIsActive(true);
            userRepository.save(user);
        }

        return ResponseEntity.ok(Map.of(
            "token", "google-session-" + user.getId(),
            "id", user.getId(),
            "email", user.getEmail(),
            "fullName", user.getFullName(),
            "role", user.getRole().toString()
        ));
    }
}