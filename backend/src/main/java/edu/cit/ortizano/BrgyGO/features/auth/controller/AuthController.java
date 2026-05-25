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
import edu.cit.ortizano.BrgyGO.features.auth.service.OtpService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final OtpService otpService;

    public AuthController(UserService userService, PasswordEncoder passwordEncoder, OtpService otpService) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
        this.otpService = otpService;
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

        User savedUser = userService.registerUser(user);   // password gets hashed here
        otpService.sendOtp(savedUser);                      // send OTP email

        // Don't return a usable token yet — user must verify OTP first
        return ResponseEntity.ok(Map.of(
            "message", "Registration successful. Please check your email for the verification code.",
            "email", savedUser.getEmail(),
            "requiresVerification", true
        ));

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
            user.getId(), user.getEmail(), user.getFullName(), user.getRole().toString()
        );
        return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            String msg = e.getMessage();
            if (msg != null && msg.startsWith("EMAIL_NOT_VERIFIED:")) {
            String email = msg.replace("EMAIL_NOT_VERIFIED:", "");
            return ResponseEntity.status(403).body(Map.of(
                "error", "Email not verified",
                "requiresVerification", true,
                "email", email
            ));
        }
        return ResponseEntity.badRequest().body(Map.of("error", "Login failed: " + msg));
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Profile endpoint - implement authentication to get user data");
        return ResponseEntity.ok(response);
    }


    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String otp   = body.get("otp");

    if (email == null || otp == null) {
        return ResponseEntity.badRequest().body(Map.of("error", "Email and OTP are required"));
    }

    boolean verified = otpService.verifyOtp(email, otp);
    if (!verified) {
        return ResponseEntity.badRequest().body(Map.of("error", "Invalid or expired verification code"));
    }

    // Now return a proper login response
    Optional<User> userOpt = userService.findByEmail(email);
    if (userOpt.isEmpty()) {
        return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
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
}

// ── NEW: resend OTP ───────────────────────────────────────────────────────
    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null) {
         return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        }
        boolean sent = otpService.resendOtp(email);
        if (!sent) {
            return ResponseEntity.badRequest().body(Map.of("error", "No account found with that email"));
        }
        return ResponseEntity.ok(Map.of("message", "A new verification code has been sent to " + email));
    }
}