package edu.cit.ortizano.BrgyGO.controller;

import edu.cit.ortizano.BrgyGO.model.DocumentRequest;
import edu.cit.ortizano.BrgyGO.model.DocumentStatus;
import edu.cit.ortizano.BrgyGO.model.User;
import edu.cit.ortizano.BrgyGO.dto.DocumentRequestDTO;
import edu.cit.ortizano.BrgyGO.service.DocumentRequestService;
import edu.cit.ortizano.BrgyGO.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Controller for Document Request endpoints
 */
@RestController
@RequestMapping("/api/requests")
public class DocumentRequestController {

    private final DocumentRequestService documentRequestService;
    private final UserService userService;

    public DocumentRequestController(DocumentRequestService documentRequestService, UserService userService) {
        this.documentRequestService = documentRequestService;
        this.userService = userService;
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
        dto.setReleaseDate(request.getReleaseDate());
        dto.setProcessingNotes(request.getProcessingNotes());
        dto.setCreatedAt(request.getCreatedAt());
        dto.setUpdatedAt(request.getUpdatedAt());
        return dto;
    }
}
