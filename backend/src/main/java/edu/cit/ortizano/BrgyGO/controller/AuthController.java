package edu.cit.ortizano.BrgyGO.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import edu.cit.ortizano.BrgyGO.dto.AuthResponse;
import edu.cit.ortizano.BrgyGO.dto.LoginRequest;
import edu.cit.ortizano.BrgyGO.dto.RegisterRequest;
import edu.cit.ortizano.BrgyGO.model.User;
import edu.cit.ortizano.BrgyGO.service.UserService;
import jakarta.validation.Valid;

/**
 * Authentication Controller for login and register
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Register a new user
     * @param request the register request
     * @return response with user info
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            // Validate passwords match
            if (!request.getPassword().equals(request.getConfirmPassword())) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Passwords do not match");
                return ResponseEntity.badRequest().body(error);
            }

            // Validate terms agreement
            if (!request.isAgreeTerms()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "You must agree to the terms and conditions");
                return ResponseEntity.badRequest().body(error);
            }

            // Create user from request
            User user = new User();
            user.setFullName(request.getFullName());
            user.setEmail(request.getEmail());
            user.setPassword(request.getPassword());
            user.setContactNumber(request.getContactNumber());
            user.setCompleteAddress(request.getCompleteAddress());

            // Register user
            User savedUser = userService.registerUser(user);

            // Return success response
            AuthResponse response = new AuthResponse(
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getFullName(),
                savedUser.getRole().toString()
            );

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Login user
     * @param request the login request
     * @return response with user info and token
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            Optional<User> userOpt = userService.authenticate(request.getEmail(), request.getPassword());

            if (userOpt.isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Invalid email or password");
                return ResponseEntity.badRequest().body(error);
            }

            User user = userOpt.get();

            // For now, return user info without JWT token
            // In a real application, you'd generate a JWT token here
            AuthResponse response = new AuthResponse(
                "dummy-token", // Replace with actual JWT token generation
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole().toString()
            );

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Login failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Get current user profile (placeholder for authenticated requests)
     * @return user profile
     */
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        // This would typically get the authenticated user from security context
        Map<String, String> response = new HashMap<>();
        response.put("message", "Profile endpoint - implement authentication to get user data");
        return ResponseEntity.ok(response);
    }
}