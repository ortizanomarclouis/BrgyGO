package edu.cit.ortizano.BrgyGO.features.documentrequest.controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
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

import edu.cit.ortizano.BrgyGO.features.documentrequest.dto.DocumentRequestDTO;
import edu.cit.ortizano.BrgyGO.features.documentrequest.factory.Certificate;
import edu.cit.ortizano.BrgyGO.features.documentrequest.model.DocumentRequest;
import edu.cit.ortizano.BrgyGO.features.documentrequest.model.DocumentStatus;
import edu.cit.ortizano.BrgyGO.features.auth.model.User;
import edu.cit.ortizano.BrgyGO.features.documentrequest.service.DocumentRequestService;
import edu.cit.ortizano.BrgyGO.features.documentrequest.support.SupabaseStorageService;
import edu.cit.ortizano.BrgyGO.features.auth.service.UserService;
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
     * Create a new document request (JSON body, no file)
     */
    @PostMapping
    public ResponseEntity<?> createRequest(
            @RequestParam(value = "userId", required = false) Long userId,
            @Valid @RequestBody DocumentRequestDTO requestDTO) {
        try {
            DocumentRequest request = new DocumentRequest();
            request.setDocumentType(requestDTO.getDocumentType());
            request.setPurpose(requestDTO.getPurpose());
            request.setReferenceNumber("BR-" + System.currentTimeMillis() + "-" + System.nanoTime());

            if (userId == null) userId = 1L;
            Optional<User> user = userService.getUserById(userId);
            if (user.isPresent()) {
                request.setUser(user.get());
                DocumentRequest created = documentRequestService.createRequest(request);
                return ResponseEntity.ok(mapToDTO(created));
            }
            return ResponseEntity.status(401).body(Map.of("error", "User not found"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Create a new document request with identity photo (multipart)
     */
    @PostMapping("/with-identity")
    public ResponseEntity<?> createRequestWithIdentity(
            @RequestParam("documentType") String documentType,
            @RequestParam("purpose") String purpose,
            @RequestParam("identityPhoto") MultipartFile identityPhoto,
            @RequestParam(value = "userId", required = false) Long userId) {
        try {
            if (purpose == null || purpose.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Purpose is required"));
            }
            if (identityPhoto == null || identityPhoto.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Identity photo is required"));
            }

            String photoData = supabaseStorageService.uploadFile(identityPhoto, "identity-documents");

            User user = null;
            if (userId != null) {
                Optional<User> userOpt = userService.getUserById(userId);
                if (userOpt.isPresent()) user = userOpt.get();
            }
            if (user == null) {
                List<User> allUsers = userService.getAllUsers();
                if (allUsers.isEmpty()) return ResponseEntity.status(401).body(Map.of("error", "No users found"));
                user = allUsers.get(allUsers.size() - 1);
            }

            DocumentRequest request = new DocumentRequest();
            request.setUser(user);
            try {
                request.setDocumentType(edu.cit.ortizano.BrgyGO.features.documentrequest.model.DocumentType.valueOf(documentType));
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid document type: " + documentType));
            }
            request.setPurpose(purpose);
            request.setIdentityPhotoUrl(photoData);
            request.setReferenceNumber("BR-" + System.currentTimeMillis() + "-" + System.nanoTime());

            DocumentRequest created = documentRequestService.createRequest(request);
            return ResponseEntity.ok(mapToDTO(created));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Request submission failed: " + e.getMessage()));
        }
    }

    /**
     * Get all requests for current user
     */
    @GetMapping
    public ResponseEntity<?> getUserRequests(@RequestParam(value = "userId", required = false) Long userId) {
        try {
            if (userId == null) userId = 1L;
            Optional<User> user = userService.getUserById(userId);
            if (user.isPresent()) {
                List<DocumentRequest> requests = documentRequestService.getUserRequests(user.get().getId());
                return ResponseEntity.ok(Map.of(
                    "content", requests.stream().map(this::mapToDTO).collect(Collectors.toList()),
                    "total", requests.size()
                ));
            }
            return ResponseEntity.status(401).body(Map.of("error", "User not found"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get specific request by ID
     */
    @Transactional(readOnly = true)
    @GetMapping("/{id}")
    public ResponseEntity<?> getRequest(@PathVariable Long id) {
        try {
            Optional<DocumentRequest> request = documentRequestService.getRequestById(id);
            if (request.isPresent()) return ResponseEntity.ok(mapToDTO(request.get()));
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get all requests (staff and admin)
     */
    @Transactional(readOnly = true)
    @GetMapping("/all")
    public ResponseEntity<?> getAllRequests() {
        try {
            return ResponseEntity.ok(documentRequestService.getAllRequests().stream().map(this::mapToDTO).collect(Collectors.toList()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Generate certificate — with safe fallbacks so incomplete profile data never throws
     */
    @GetMapping("/{id}/certificate")
    public ResponseEntity<?> getCertificate(@PathVariable Long id) {
        try {
            Optional<DocumentRequest> requestOpt = documentRequestService.getRequestById(id);
            if (requestOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            DocumentRequest docRequest = requestOpt.get();
            User user = docRequest.getUser();

            // Safe fallbacks — never let a null field crash certificate generation
            String residentName = (user != null && user.getFullName() != null && !user.getFullName().isBlank())
                    ? user.getFullName() : "Resident";
            String address = (user != null && user.getCompleteAddress() != null && !user.getCompleteAddress().isBlank())
                    ? user.getCompleteAddress() : "Address on file";

            Certificate certificate = documentRequestService.generateCertificateWithData(
                    id, residentName, address);

            if (certificate == null) return ResponseEntity.notFound().build();

            String content = certificate.getContent();
            if (content == null || content.isBlank()) {
                content = certificate.generateContent();
            }

            return ResponseEntity.ok(Map.of(
                "id", id,
                "documentType", certificate.getDocumentType().name(),
                "documentTypeLabel", certificate.getDocumentType().getDisplayName(),
                "certificationNumber", certificate.getCertificationNumber() != null ? certificate.getCertificationNumber() : "CERT-" + id,
                "issuedBy", certificate.getIssuedBy() != null ? certificate.getIssuedBy() : "Barangay Official",
                "issuedDate", certificate.getIssuedDate() != null ? certificate.getIssuedDate().toString() : java.time.LocalDateTime.now().toString(),
                "content", content != null ? content : "Certificate content unavailable"
            ));
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
                if (updated != null) return ResponseEntity.ok(mapToDTO(updated));
            }
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get pending requests (staff dashboard)
     */
    @Transactional(readOnly = true)
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
            if (deleted) return ResponseEntity.ok(Map.of("message", "Request cancelled successfully"));
            return ResponseEntity.badRequest().body(Map.of("error", "Request cannot be cancelled"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

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
        dto.setProcessedBy(request.getProcessedBy() != null ? request.getProcessedBy().getFullName() : null);
        if (request.getUser() != null) {
            dto.setRequestorId(request.getUser().getId());
            dto.setRequestorFullName(request.getUser().getFullName());
            dto.setRequestorEmail(request.getUser().getEmail());
            dto.setRequestorAddress(request.getUser().getCompleteAddress());
        }
        dto.setCreatedAt(request.getCreatedAt());
        dto.setUpdatedAt(request.getUpdatedAt());
        return dto;
    }
}