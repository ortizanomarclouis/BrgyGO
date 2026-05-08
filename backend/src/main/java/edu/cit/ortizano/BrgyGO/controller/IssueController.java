package edu.cit.ortizano.BrgyGO.controller;

import edu.cit.ortizano.BrgyGO.model.Issue;
import edu.cit.ortizano.BrgyGO.model.IssueCategory;
import edu.cit.ortizano.BrgyGO.model.IssueStatus;
import edu.cit.ortizano.BrgyGO.model.User;
import edu.cit.ortizano.BrgyGO.dto.IssueDTO;
import edu.cit.ortizano.BrgyGO.service.IssueService;
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
     * Create a new issue report
     */
    @PostMapping
    public ResponseEntity<?> createIssue(@Valid @RequestBody IssueDTO issueDTO) {
        try {
            Issue issue = new Issue();
            issue.setCategory(issueDTO.getCategory());
            issue.setDescription(issueDTO.getDescription());
            issue.setLatitude(issueDTO.getLatitude());
            issue.setLongitude(issueDTO.getLongitude());
            issue.setAddress(issueDTO.getAddress());
            issue.setUrgency(issueDTO.getUrgency());
            
            // Get current user (in real implementation, get from security context)
            Optional<User> user = userService.getUserById(1L); // Placeholder
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
        dto.setLatitude(issue.getLatitude());
        dto.setLongitude(issue.getLongitude());
        dto.setAddress(issue.getAddress());
        dto.setResolutionNotes(issue.getResolutionNotes());
        dto.setCreatedAt(issue.getCreatedAt());
        dto.setUpdatedAt(issue.getUpdatedAt());
        return dto;
    }
}
