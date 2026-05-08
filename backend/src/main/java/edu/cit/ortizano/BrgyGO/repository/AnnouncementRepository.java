package edu.cit.ortizano.BrgyGO.repository;

import edu.cit.ortizano.BrgyGO.model.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * Repository for Announcement entity
 */
@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
    
    // Find all active announcements
    List<Announcement> findByIsActiveTrue();
    
    // Find all pinned announcements
    List<Announcement> findByIsPinnedTrueAndIsActiveTrue();
    
    // Find announcements with pagination
    Page<Announcement> findByIsActiveTrueOrderByCreatedAtDesc(Pageable pageable);
    
    // Find announcements by creator
    List<Announcement> findByCreatedById(Long userId);
}
