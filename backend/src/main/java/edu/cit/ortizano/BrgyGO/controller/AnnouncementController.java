package edu.cit.ortizano.BrgyGO.controller;

import edu.cit.ortizano.BrgyGO.model.Announcement;
import edu.cit.ortizano.BrgyGO.model.User;
import edu.cit.ortizano.BrgyGO.dto.AnnouncementDTO;
import edu.cit.ortizano.BrgyGO.service.AnnouncementService;
import edu.cit.ortizano.BrgyGO.service.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Controller for Announcement endpoints
 */
@RestController
@RequestMapping("/api/announcements")
public class AnnouncementController {

    private final AnnouncementService announcementService;
    private final UserService userService;

    public AnnouncementController(AnnouncementService announcementService, UserService userService) {
        this.announcementService = announcementService;
        this.userService = userService;
    }

    /**
     * Create a new announcement (admin/staff only)
     */
    @PostMapping
    public ResponseEntity<?> createAnnouncement(@Valid @RequestBody AnnouncementDTO announcementDTO) {
        try {
            Announcement announcement = new Announcement();
            announcement.setTitle(announcementDTO.getTitle());
            announcement.setDescription(announcementDTO.getDescription());
            announcement.setContent(announcementDTO.getContent());
            announcement.setImageUrl(announcementDTO.getImageUrl());
            
            // Get current user (in real implementation, get from security context)
            Optional<User> user = userService.getUserById(2L); // Placeholder - staff/admin
            if (user.isPresent()) {
                announcement.setCreatedBy(user.get());
                Announcement created = announcementService.createAnnouncement(announcement);
                return ResponseEntity.ok(mapToDTO(created));
            }
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get all active announcements
     */
    @GetMapping
    public ResponseEntity<?> getAnnouncements(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Announcement> announcements = announcementService.getAnnouncementsPaginated(pageable);
            Map<String, Object> response = new HashMap<>();
            response.put("content", announcements.getContent().stream()
                    .map(this::mapToDTO)
                    .collect(Collectors.toList()));
            response.put("totalPages", announcements.getTotalPages());
            response.put("totalElements", announcements.getTotalElements());
            response.put("currentPage", page);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get pinned announcements
     */
    @GetMapping("/pinned")
    public ResponseEntity<?> getPinnedAnnouncements() {
        try {
            List<Announcement> announcements = announcementService.getPinnedAnnouncements();
            return ResponseEntity.ok(announcements.stream()
                    .map(this::mapToDTO)
                    .collect(Collectors.toList()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get specific announcement by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getAnnouncement(@PathVariable Long id) {
        try {
            Optional<Announcement> announcement = announcementService.getAnnouncementById(id);
            if (announcement.isPresent()) {
                return ResponseEntity.ok(mapToDTO(announcement.get()));
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Update announcement (admin/staff only)
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateAnnouncement(@PathVariable Long id, @Valid @RequestBody AnnouncementDTO announcementDTO) {
        try {
            Announcement announcement = new Announcement();
            announcement.setTitle(announcementDTO.getTitle());
            announcement.setDescription(announcementDTO.getDescription());
            announcement.setContent(announcementDTO.getContent());
            announcement.setImageUrl(announcementDTO.getImageUrl());
            announcement.setIsPinned(announcementDTO.getIsPinned());
            
            Optional<Announcement> updated = announcementService.updateAnnouncement(id, announcement);
            if (updated.isPresent()) {
                return ResponseEntity.ok(mapToDTO(updated.get()));
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Pin an announcement
     */
    @PostMapping("/{id}/pin")
    public ResponseEntity<?> pinAnnouncement(@PathVariable Long id) {
        try {
            Optional<Announcement> announcement = announcementService.pinAnnouncement(id);
            if (announcement.isPresent()) {
                return ResponseEntity.ok(mapToDTO(announcement.get()));
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Unpin an announcement
     */
    @PostMapping("/{id}/unpin")
    public ResponseEntity<?> unpinAnnouncement(@PathVariable Long id) {
        try {
            Optional<Announcement> announcement = announcementService.unpinAnnouncement(id);
            if (announcement.isPresent()) {
                return ResponseEntity.ok(mapToDTO(announcement.get()));
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Deactivate an announcement
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deactivateAnnouncement(@PathVariable Long id) {
        try {
            Optional<Announcement> announcement = announcementService.deactivateAnnouncement(id);
            if (announcement.isPresent()) {
                return ResponseEntity.ok(Map.of("message", "Announcement deactivated successfully"));
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Helper method to convert entity to DTO
    private AnnouncementDTO mapToDTO(Announcement announcement) {
        AnnouncementDTO dto = new AnnouncementDTO();
        dto.setId(announcement.getId());
        dto.setTitle(announcement.getTitle());
        dto.setDescription(announcement.getDescription());
        dto.setContent(announcement.getContent());
        dto.setImageUrl(announcement.getImageUrl());
        dto.setIsPinned(announcement.getIsPinned());
        dto.setIsActive(announcement.getIsActive());
        dto.setCreatedAt(announcement.getCreatedAt());
        dto.setUpdatedAt(announcement.getUpdatedAt());
        return dto;
    }
}
