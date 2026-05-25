package edu.cit.ortizano.BrgyGO.features.auth.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import edu.cit.ortizano.BrgyGO.features.auth.dto.AuthResponse;
import edu.cit.ortizano.BrgyGO.features.auth.dto.LoginRequest;
import edu.cit.ortizano.BrgyGO.features.auth.dto.RegisterRequest;
import edu.cit.ortizano.BrgyGO.features.auth.model.User;
import edu.cit.ortizano.BrgyGO.features.auth.service.UserService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    public AuthController(UserService userService, PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            if (!request.getPassword().equals(request.getConfirmPassword())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Passwords do not match"));
            }
            if (!request.isAgreeTerms()) {
                return ResponseEntity.badRequest().body(Map.of("error", "You must agree to the terms and conditions"));
            }

            User user = new User();
            user.setFullName(request.getFullName());
            user.setEmail(request.getEmail());
            user.setPassword(request.getPassword());
            user.setContactNumber(request.getContactNumber());
            user.setCompleteAddress(request.getCompleteAddress());

            User savedUser = userService.registerUser(user);

            AuthResponse response = new AuthResponse(
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getFullName(),
                savedUser.getRole().toString()
            );
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            Optional<User> userOpt = userService.authenticate(request.getEmail(), request.getPassword());

            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid email or password"));
            }

            User user = userOpt.get();
            AuthResponse response = new AuthResponse(
                "dummy-token",
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole().toString()
            );
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Login failed: " + e.getMessage()));
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Profile endpoint - implement authentication to get user data");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/google/user")
    public ResponseEntity<?> getGoogleUser() {
        // Simplified - OAuth2 token handling removed
        return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
    }
}