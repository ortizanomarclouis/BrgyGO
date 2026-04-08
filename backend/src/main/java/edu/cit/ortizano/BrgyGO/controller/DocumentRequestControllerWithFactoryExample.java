package edu.cit.ortizano.BrgyGO.controller;

import edu.cit.ortizano.BrgyGO.factory.Certificate;
import edu.cit.ortizano.BrgyGO.model.DocumentRequest;
import edu.cit.ortizano.BrgyGO.model.DocumentStatus;
import edu.cit.ortizano.BrgyGO.model.DocumentType;
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
 * DESIGN PATTERN EXAMPLE: FACTORY METHOD USAGE
 * 
 * This controller demonstrates how the Factory Method pattern
 * is used to create different certificate types without hardcoding
 * the certificate class names.
 * 
 * Example endpoints showing Factory Method usage:
 * - POST /api/documents/{id}/generate-certificate (Factory creates certificate)
 * - GET /api/documents/certificate-template/{type} (Factory provides template)
 */
@RestController
@RequestMapping("/api/documents")
public class DocumentRequestControllerWithFactoryExample {

    private final DocumentRequestService documentRequestService;
    private final UserService userService;

    public DocumentRequestControllerWithFactoryExample(
            DocumentRequestService documentRequestService, 
            UserService userService) {
        this.documentRequestService = documentRequestService;
        this.userService = userService;
    }

    /**
     * DESIGN PATTERN: FACTORY METHOD EXAMPLE
     * 
     * Generate certificate for a document request
     * 
     * The Certificate Factory decides which certificate type to create
     * based on the document request's DocumentType field.
     * 
     * CHANGES FROM ORIGINAL:
     * - NEW ENDPOINT: Demonstrates Factory Method pattern
     * - No if-else statements for different certificate types
     * - Factory handles all certificate creation logic
     * 
     * Example usage:
     * POST /api/documents/1/generate-certificate
     * 
     * Response includes:
     * - Certificate type (Barangay Clearance, Certificate of Indigency, etc.)
     * - Generated certificate content
     * - Certificate details
     */
    @PostMapping("/{id}/generate-certificate")
    public ResponseEntity<?> generateCertificate(@PathVariable Long id) {
        try {
            // FACTORY METHOD: Service uses factory to generate certificate
            // Factory decides which certificate type based on DocumentType
            Certificate certificate = documentRequestService.generateCertificate(id);
            
            if (certificate != null) {
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Certificate generated successfully");
                response.put("certificateType", certificate.getDocumentType().getDisplayName());
                response.put("certificationNumber", certificate.getCertificationNumber());
                response.put("residentName", certificate.getResidentName());
                response.put("address", certificate.getAddress());
                response.put("issuedDate", certificate.getIssuedDate());
                response.put("expirationDate", certificate.getExpirationDate());
                response.put("content", certificate.getContent());
                
                return ResponseEntity.ok(response);
            }
            
            return ResponseEntity.status(404).body(Map.of("error", "Document request not found"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * DESIGN PATTERN: FACTORY METHOD EXAMPLE
     * 
     * Get certificate template for a specific document type
     * 
     * Shows what the certificate looks like for each type.
     * The factory provides this information.
     * 
     * CHANGES FROM ORIGINAL:
     * - NEW ENDPOINT: Shows certificate templates
     * - Factory provides template information
     * 
     * Example usage:
     * GET /api/documents/certificate-template/BARANGAY_CLEARANCE
     */
    @GetMapping("/certificate-template/{documentType}")
    public ResponseEntity<?> getCertificateTemplate(
            @PathVariable String documentType) {
        try {
            // Parse document type
            DocumentType type = DocumentType.valueOf(documentType);
            
            // FACTORY METHOD: Get template from factory
            String template = documentRequestService.getCertificateTemplate(type);
            
            Map<String, Object> response = new HashMap<>();
            response.put("documentType", type.getDisplayName());
            response.put("template", template);
            response.put("isSupported", documentRequestService.isSupportedDocumentType(type));
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid document type: " + documentType));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * DESIGN PATTERN: FACTORY METHOD EXAMPLE
     * 
     * Get list of all supported certificate types
     * 
     * Shows users which certificates can be requested.
     * Uses the Factory to check support.
     * 
     * CHANGES FROM ORIGINAL:
     * - NEW ENDPOINT: Lists available certificate types
     * - Factory validates support for each type
     */
    @GetMapping("/supported-types")
    public ResponseEntity<?> getSupportedDocumentTypes() {
        try {
            List<Map<String, String>> supportedTypes = new java.util.ArrayList<>();
            
            // Check all document types
            for (DocumentType type : DocumentType.values()) {
                // FACTORY METHOD: Check if factory supports this type
                if (documentRequestService.isSupportedDocumentType(type)) {
                    Map<String, String> typeInfo = new HashMap<>();
                    typeInfo.put("type", type.name());
                    typeInfo.put("displayName", type.getDisplayName());
                    typeInfo.put("template", documentRequestService.getCertificateTemplate(type));
                    supportedTypes.add(typeInfo);
                }
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Available certificate types");
            response.put("count", supportedTypes.size());
            response.put("types", supportedTypes);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
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
            
            Optional<User> user = userService.getUserById(1L);
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
            Optional<User> user = userService.getUserById(1L);
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
            
            Optional<User> staff = userService.getUserById(2L);
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
