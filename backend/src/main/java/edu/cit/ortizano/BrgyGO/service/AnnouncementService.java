package edu.cit.ortizano.BrgyGO.service;

import edu.cit.ortizano.BrgyGO.model.Announcement;
import edu.cit.ortizano.BrgyGO.model.User;
import edu.cit.ortizano.BrgyGO.repository.AnnouncementRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Service class for Announcement operations
 */
@Service
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;

    public AnnouncementService(AnnouncementRepository announcementRepository) {
        this.announcementRepository = announcementRepository;
    }

    /**
     * Create a new announcement
     * @param announcement the announcement to create
     * @return the created announcement
     */
    @Transactional
    public Announcement createAnnouncement(Announcement announcement) {
        announcement.setCreatedAt(LocalDateTime.now());
        announcement.setUpdatedAt(LocalDateTime.now());
        announcement.setIsActive(true);
        return announcementRepository.save(announcement);
    }

    /**
     * Get all active announcements
     * @return list of active announcements
     */
    public List<Announcement> getActiveAnnouncements() {
        return announcementRepository.findByIsActiveTrue();
    }

    /**
     * Get all pinned announcements
     * @return list of pinned announcements
     */
    public List<Announcement> getPinnedAnnouncements() {
        return announcementRepository.findByIsPinnedTrueAndIsActiveTrue();
    }

    /**
     * Get announcements with pagination
     * @param pageable the pagination info
     * @return page of announcements
     */
    public Page<Announcement> getAnnouncementsPaginated(Pageable pageable) {
        return announcementRepository.findByIsActiveTrueOrderByCreatedAtDesc(pageable);
    }

    /**
     * Get a specific announcement by ID
     * @param id the announcement ID
     * @return the announcement or empty
     */
    public Optional<Announcement> getAnnouncementById(Long id) {
        return announcementRepository.findById(id);
    }

    /**
     * Update an announcement
     * @param id the announcement ID
     * @param announcement the updated announcement data
     * @return the updated announcement
     */
    @Transactional
    public Optional<Announcement> updateAnnouncement(Long id, Announcement announcement) {
        return announcementRepository.findById(id).map(existing -> {
            existing.setTitle(announcement.getTitle());
            existing.setDescription(announcement.getDescription());
            existing.setContent(announcement.getContent());
            existing.setImageUrl(announcement.getImageUrl());
            existing.setIsPinned(announcement.getIsPinned());
            existing.setUpdatedAt(LocalDateTime.now());
            return announcementRepository.save(existing);
        });
    }

    /**
     * Deactivate an announcement
     * @param id the announcement ID
     * @return the deactivated announcement
     */
    @Transactional
    public Optional<Announcement> deactivateAnnouncement(Long id) {
        return announcementRepository.findById(id).map(announcement -> {
            announcement.setIsActive(false);
            announcement.setUpdatedAt(LocalDateTime.now());
            return announcementRepository.save(announcement);
        });
    }

    /**
     * Pin an announcement
     * @param id the announcement ID
     * @return the pinned announcement
     */
    @Transactional
    public Optional<Announcement> pinAnnouncement(Long id) {
        return announcementRepository.findById(id).map(announcement -> {
            announcement.setIsPinned(true);
            announcement.setUpdatedAt(LocalDateTime.now());
            return announcementRepository.save(announcement);
        });
    }

    /**
     * Unpin an announcement
     * @param id the announcement ID
     * @return the unpinned announcement
     */
    @Transactional
    public Optional<Announcement> unpinAnnouncement(Long id) {
        return announcementRepository.findById(id).map(announcement -> {
            announcement.setIsPinned(false);
            announcement.setUpdatedAt(LocalDateTime.now());
            return announcementRepository.save(announcement);
        });
    }

    /**
     * Get announcements by creator
     * @param userId the creator user ID
     * @return list of announcements
     */
    public List<Announcement> getAnnouncementsByCreator(Long userId) {
        return announcementRepository.findByCreatedById(userId);
    }
}
