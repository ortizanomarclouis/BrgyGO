package edu.cit.ortizano.BrgyGO.features.issues.controller;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import edu.cit.ortizano.BrgyGO.features.issues.dto.IssueDTO;
import edu.cit.ortizano.BrgyGO.features.issues.model.Issue;
import edu.cit.ortizano.BrgyGO.features.issues.model.IssueCategory;
import edu.cit.ortizano.BrgyGO.features.issues.model.IssueStatus;
import edu.cit.ortizano.BrgyGO.features.auth.model.User;
import edu.cit.ortizano.BrgyGO.features.issues.service.IssueService;
import edu.cit.ortizano.BrgyGO.features.auth.service.UserService;

/**
 * Controller for Issue Report endpoints
 */
@RestController
@RequestMapping("/api/issues")
public class IssueController {

    private final IssueService issueService;
    private final UserService userService;

    public IssueController(IssueService issueService, UserService userService) {
        this.issueService = issueService;
        this.userService = userService;
    }

    /**
     * Create a new issue report with optional image
     */
    @PostMapping
    public ResponseEntity<?> createIssue(
            @RequestParam("category") String category,
            @RequestParam("urgency") String urgency,
            @RequestParam("address") String address,
            @RequestParam("description") String description,
            @RequestParam(value = "userId", required = false) Long userId,
            @RequestParam(value = "proofImage", required = false) MultipartFile proofImage) {
        try {
            Issue issue = new Issue();
            issue.setCategory(IssueCategory.valueOf(category));
            issue.setDescription(description);
            issue.setAddress(address);
            try {
                issue.setUrgency(edu.cit.ortizano.BrgyGO.features.issues.model.UrgencyLevel.valueOf(urgency));
            } catch (Exception e) {
                issue.setUrgency(edu.cit.ortizano.BrgyGO.features.issues.model.UrgencyLevel.MEDIUM);
            }
            
            // Handle file upload if image is provided
            if (proofImage != null && !proofImage.isEmpty()) {
                try {
                    String imageUrl = saveProofImage(proofImage);
                    issue.setProofImageUrl(imageUrl);
                } catch (Exception e) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Failed to upload image: " + e.getMessage()));
                }
            }
            
            // Get current user (in real implementation, get from security context)
            if (userId == null) {
                userId = 1L; // Placeholder default
            }
            Optional<User> user = userService.getUserById(userId);
            if (user.isPresent()) {
                issue.setReportedBy(user.get());
                Issue created = issueService.createIssue(issue);
                return ResponseEntity.ok(mapToDTO(created));
            }
            return ResponseEntity.status(401).body(Map.of("error", "User not authenticated"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Helper method to save proof image to file system
     */
    private String saveProofImage(MultipartFile file) throws Exception {
        // Create uploads directory if it doesn't exist
        String uploadDir = "uploads/issues";
        Files.createDirectories(Paths.get(uploadDir));
        
        // Generate unique filename
        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path filePath = Paths.get(uploadDir, fileName);
        
        // Save file
        Files.write(filePath, file.getBytes());
        
        // Return relative path for database storage
        return "/uploads/issues/" + fileName;
    }

    /**
     * Get all issues reported by current user
     */
    @GetMapping
    public ResponseEntity<?> getUserIssues() {
        try {
            // In real implementation, get from security context
            Optional<User> user = userService.getUserById(1L); // Placeholder
            if (user.isPresent()) {
                List<Issue> issues = issueService.getUserIssues(user.get().getId());
                return ResponseEntity.ok(issues.stream().map(this::mapToDTO).collect(Collectors.toList()));
            }
            return ResponseEntity.status(401).body(Map.of("error", "User not authenticated"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get all active issues (for public map view)
     */
    @GetMapping("/map")
    public ResponseEntity<?> getActiveIssuesForMap() {
        try {
            List<Issue> issues = issueService.getActiveIssues();
            return ResponseEntity.ok(issues.stream().map(this::mapToDTO).collect(Collectors.toList()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get specific issue by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getIssue(@PathVariable Long id) {
        try {
            Optional<Issue> issue = issueService.getIssueById(id);
            if (issue.isPresent()) {
                return ResponseEntity.ok(mapToDTO(issue.get()));
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get issues by category
     */
    @GetMapping("/category/{category}")
    public ResponseEntity<?> getIssuesByCategory(@PathVariable String category) {
        try {
            IssueCategory issueCategory = IssueCategory.valueOf(category);
            List<Issue> issues = issueService.getIssuesByCategory(issueCategory);
            return ResponseEntity.ok(issues.stream().map(this::mapToDTO).collect(Collectors.toList()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Update issue status (staff only)
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateIssueStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Object> statusUpdate) {
        try {
            IssueStatus newStatus = IssueStatus.valueOf(statusUpdate.get("status").toString());
            String notes = (String) statusUpdate.get("notes");
            
            Issue updated = issueService.updateIssueStatus(id, newStatus, notes);
            if (updated != null) {
                return ResponseEntity.ok(mapToDTO(updated));
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Assign issue to staff member
     */
    @PostMapping("/{id}/assign/{staffId}")
    public ResponseEntity<?> assignIssue(@PathVariable Long id, @PathVariable Long staffId) {
        try {
            Optional<User> staff = userService.getUserById(staffId);
            if (staff.isPresent()) {
                Issue assigned = issueService.assignIssue(id, staff.get());
                if (assigned != null) {
                    return ResponseEntity.ok(mapToDTO(assigned));
                }
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get unassigned issues (for staff assignment)
     */
    @GetMapping("/unassigned")
    public ResponseEntity<?> getUnassignedIssues() {
        try {
            List<Issue> issues = issueService.getUnassignedIssues();
            return ResponseEntity.ok(issues.stream().map(this::mapToDTO).collect(Collectors.toList()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Helper method to convert entity to DTO
    private IssueDTO mapToDTO(Issue issue) {
        IssueDTO dto = new IssueDTO();
        dto.setId(issue.getId());
        dto.setCategory(issue.getCategory());
        dto.setDescription(issue.getDescription());
        dto.setStatus(issue.getStatus());
        dto.setUrgency(issue.getUrgency());
        dto.setTrackingNumber(issue.getTrackingNumber());
        dto.setAddress(issue.getAddress());
        dto.setResolutionNotes(issue.getResolutionNotes());
        dto.setCreatedAt(issue.getCreatedAt());
        dto.setUpdatedAt(issue.getUpdatedAt());
        return dto;
    }
}
