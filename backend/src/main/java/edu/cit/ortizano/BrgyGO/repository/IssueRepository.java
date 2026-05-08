package edu.cit.ortizano.BrgyGO.repository;

import edu.cit.ortizano.BrgyGO.model.Issue;
import edu.cit.ortizano.BrgyGO.model.IssueCategory;
import edu.cit.ortizano.BrgyGO.model.IssueStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * Repository for Issue entity
 */
@Repository
public interface IssueRepository extends JpaRepository<Issue, Long> {
    
    // Find all issues reported by a user
    List<Issue> findByReportedById(Long userId);
    
    // Find all issues with specific status
    List<Issue> findByStatus(IssueStatus status);
    
    // Find all issues with specific category
    List<Issue> findByCategory(IssueCategory category);
    
    // Find issue by tracking number
    Optional<Issue> findByTrackingNumber(String trackingNumber);
    
    // Find all issues assigned to staff
    List<Issue> findByAssignedToId(Long staffId);
    
    // Find all unassigned issues
    List<Issue> findByAssignedToIsNull();
    
    // Find all active issues within a location radius (approximate)
    List<Issue> findByStatusNotIn(List<IssueStatus> statuses);
}
