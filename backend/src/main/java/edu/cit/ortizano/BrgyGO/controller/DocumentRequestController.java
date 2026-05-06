package edu.cit.ortizano.BrgyGO.controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import edu.cit.ortizano.BrgyGO.dto.DocumentRequestDTO;
import edu.cit.ortizano.BrgyGO.model.DocumentRequest;
import edu.cit.ortizano.BrgyGO.model.DocumentStatus;
import edu.cit.ortizano.BrgyGO.model.User;
import edu.cit.ortizano.BrgyGO.service.DocumentRequestService;
import edu.cit.ortizano.BrgyGO.service.SupabaseStorageService;
import edu.cit.ortizano.BrgyGO.service.UserService;
import jakarta.validation.Valid;

/**
 * Controller for Document Request endpoints
 */
@RestController
@RequestMapping("/api/requests")
public class DocumentRequestController {

    private final DocumentRequestService documentRequestService;
    private final UserService userService;
    private final SupabaseStorageService supabaseStorageService;

    public DocumentRequestController(DocumentRequestService documentRequestService, UserService userService, SupabaseStorageService supabaseStorageService) {
        this.documentRequestService = documentRequestService;
        this.userService = userService;
        this.supabaseStorageService = supabaseStorageService;
    }

    /**
     * Create a new document request
     */
    @PostMapping
    public ResponseEntity<?> createRequest(@Valid @RequestBody DocumentRequestDTO requestDTO) {
        try {
            DocumentRequest request = new DocumentRequest();
            request.setDocumentType(requestDTO.getDocumentType());
            request.setPurpose(requestDTO.getPurpose());
            
            // Generate reference number
            request.setReferenceNumber("BR-" + System.currentTimeMillis() + "-" + System.nanoTime());
            
            // Get current user (in real implementation, get from security context)
            Optional<User> user = userService.getUserById(1L); // Placeholder
            if (user.isPresent()) {
                request.setUser(user.get());
                DocumentRequest created = documentRequestService.createRequest(request);
                return ResponseEntity.ok(mapToDTO(created));
            }
            return ResponseEntity.status(401).body(Map.of("error", "User not authenticated"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Create a new document request with identity photo upload
     * Accepts multipart form data with documentType, purpose, and identityPhoto
     */
    @PostMapping("/with-identity")
    public ResponseEntity<?> createRequestWithIdentity(
            @RequestParam("documentType") String documentType,
            @RequestParam("purpose") String purpose,
            @RequestParam("identityPhoto") MultipartFile identityPhoto) {
        try {
            // Validate inputs
            if (purpose == null || purpose.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Purpose is required"));
            }

            if (identityPhoto == null || identityPhoto.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Identity photo is required"));
            }

            System.out.println("=== Document Request with Identity ===");
            System.out.println("Document Type: " + documentType);
            System.out.println("Purpose: " + purpose);
            System.out.println("File: " + identityPhoto.getOriginalFilename() + " (" + identityPhoto.getSize() + " bytes)");

            // Convert file to base64 and store in database
            String photoData = supabaseStorageService.uploadFile(identityPhoto, "identity-documents");
            System.out.println("Photo data prepared for storage");

            // Get current user - try to find any available user
            List<User> allUsers = userService.getAllUsers();
            if (allUsers.isEmpty()) {
                return ResponseEntity.status(401).body(Map.of("error", "No users found in system"));
            }
            
            // Use the last (most recently created) user as the requester
            User user = allUsers.get(allUsers.size() - 1);
            System.out.println("Using user: " + user.getEmail());

            // Create document request with proper initialization
            DocumentRequest request = new DocumentRequest();
            request.setUser(user);
            
            try {
                request.setDocumentType(edu.cit.ortizano.BrgyGO.model.DocumentType.valueOf(documentType));
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid document type: " + documentType));
            }
            
            request.setPurpose(purpose);
            request.setIdentityPhotoUrl(photoData); // Store base64 encoded file data
            
            // Generate reference number
            request.setReferenceNumber("BR-" + System.currentTimeMillis() + "-" + System.nanoTime());
            DocumentRequest created = documentRequestService.createRequest(request);
            
            System.out.println("Request created successfully with ID: " + created.getId());
            System.out.println("Request saved to database with reference: " + created.getReferenceNumber());
            
            return ResponseEntity.ok(mapToDTO(created));
        } catch (IllegalArgumentException e) {
            System.out.println("Validation error: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            System.out.println("Error creating request: " + e.getMessage());
            System.out.println("Stack trace: " + e);
            return ResponseEntity.badRequest().body(Map.of("error", "Request submission failed: " + e.getMessage()));
        }
    }

    /**
     * Get all requests for current user
     */
    @GetMapping
    public ResponseEntity<?> getUserRequests() {
        try {
            // In real implementation, get from security context
            Optional<User> user = userService.getUserById(1L); // Placeholder
            if (user.isPresent()) {
                List<DocumentRequest> requests = documentRequestService.getUserRequests(user.get().getId());
                return ResponseEntity.ok(requests.stream().map(this::mapToDTO).collect(Collectors.toList()));
            }
            return ResponseEntity.status(401).body(Map.of("error", "User not authenticated"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get specific request by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getRequest(@PathVariable Long id) {
        try {
            Optional<DocumentRequest> request = documentRequestService.getRequestById(id);
            if (request.isPresent()) {
                return ResponseEntity.ok(mapToDTO(request.get()));
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Update request status (staff only)
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateRequestStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Object> statusUpdate) {
        try {
            DocumentStatus newStatus = DocumentStatus.valueOf(statusUpdate.get("status").toString());
            String notes = (String) statusUpdate.get("notes");
            
            // In real implementation, get staff from security context
            Optional<User> staff = userService.getUserById(2L); // Placeholder
            if (staff.isPresent()) {
                DocumentRequest updated = documentRequestService.updateRequestStatus(id, newStatus, notes, staff.get());
                if (updated != null) {
                    return ResponseEntity.ok(mapToDTO(updated));
                }
            }
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get pending requests (staff dashboard)
     */
    @GetMapping("/pending")
    public ResponseEntity<?> getPendingRequests() {
        try {
            List<DocumentRequest> requests = documentRequestService.getPendingRequests();
            return ResponseEntity.ok(requests.stream().map(this::mapToDTO).collect(Collectors.toList()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Delete request (only if not processed)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRequest(@PathVariable Long id) {
        try {
            boolean deleted = documentRequestService.deleteRequest(id);
            if (deleted) {
                return ResponseEntity.ok(Map.of("message", "Request cancelled successfully"));
            }
            return ResponseEntity.badRequest().body(Map.of("error", "Request cannot be cancelled"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Helper method to convert entity to DTO
    private DocumentRequestDTO mapToDTO(DocumentRequest request) {
        DocumentRequestDTO dto = new DocumentRequestDTO();
        dto.setId(request.getId());
        dto.setDocumentType(request.getDocumentType());
        dto.setPurpose(request.getPurpose());
        dto.setStatus(request.getStatus());
        dto.setReferenceNumber(request.getReferenceNumber());
        dto.setDocumentUrl(request.getDocumentUrl());
        dto.setIdentityPhotoUrl(request.getIdentityPhotoUrl());
        dto.setReleaseDate(request.getReleaseDate());
        dto.setProcessingNotes(request.getProcessingNotes());
        dto.setCreatedAt(request.getCreatedAt());
        dto.setUpdatedAt(request.getUpdatedAt());
        return dto;
    }
}
