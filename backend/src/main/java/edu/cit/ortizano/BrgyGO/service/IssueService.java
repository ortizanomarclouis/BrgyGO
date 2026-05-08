package edu.cit.ortizano.BrgyGO.service;

import edu.cit.ortizano.BrgyGO.model.Issue;
import edu.cit.ortizano.BrgyGO.model.IssueCategory;
import edu.cit.ortizano.BrgyGO.model.IssueStatus;
import edu.cit.ortizano.BrgyGO.model.User;
import edu.cit.ortizano.BrgyGO.repository.IssueRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Service class for Issue Report operations
 */
@Service
public class IssueService {

    private final IssueRepository issueRepository;

    public IssueService(IssueRepository issueRepository) {
        this.issueRepository = issueRepository;
    }

    /**
     * Create a new issue report
     * @param issue the issue to create
     * @return the created issue
     */
    @Transactional
    public Issue createIssue(Issue issue) {
        issue.setStatus(IssueStatus.REPORTED);
        issue.setCreatedAt(LocalDateTime.now());
        issue.setUpdatedAt(LocalDateTime.now());
        return issueRepository.save(issue);
    }

    /**
     * Get all issues reported by a user
     * @param userId the user ID
     * @return list of issues
     */
    public List<Issue> getUserIssues(Long userId) {
        return issueRepository.findByReportedById(userId);
    }

    /**
     * Get a specific issue by ID
     * @param id the issue ID
     * @return the issue or empty
     */
    public Optional<Issue> getIssueById(Long id) {
        return issueRepository.findById(id);
    }

    /**
     * Get issue by tracking number
     * @param trackingNumber the tracking number
     * @return the issue or empty
     */
    public Optional<Issue> getIssueByTrackingNumber(String trackingNumber) {
        return issueRepository.findByTrackingNumber(trackingNumber);
    }

    /**
     * Get all active issues (for map view)
     * @return list of active issues
     */
    public List<Issue> getActiveIssues() {
        return issueRepository.findByStatusNotIn(List.of(IssueStatus.CLOSED, IssueStatus.INVALID));
    }

    /**
     * Get all issues by category
     * @param category the issue category
     * @return list of issues
     */
    public List<Issue> getIssuesByCategory(IssueCategory category) {
        return issueRepository.findByCategory(category);
    }

    /**
     * Get all unassigned issues
     * @return list of unassigned issues
     */
    public List<Issue> getUnassignedIssues() {
        return issueRepository.findByAssignedToIsNull();
    }

    /**
     * Assign issue to staff
     * @param issueId the issue ID
     * @param staff the staff member to assign
     * @return the updated issue
     */
    @Transactional
    public Issue assignIssue(Long issueId, User staff) {
        Optional<Issue> issue = issueRepository.findById(issueId);
        if (issue.isPresent()) {
            Issue foundIssue = issue.get();
            foundIssue.setAssignedTo(staff);
            foundIssue.setStatus(IssueStatus.ACKNOWLEDGED);
            foundIssue.setUpdatedAt(LocalDateTime.now());
            return issueRepository.save(foundIssue);
        }
        return null;
    }

    /**
     * Update issue status
     * @param issueId the issue ID
     * @param newStatus the new status
     * @param notes resolution notes
     * @return the updated issue
     */
    @Transactional
    public Issue updateIssueStatus(Long issueId, IssueStatus newStatus, String notes) {
        Optional<Issue> issue = issueRepository.findById(issueId);
        if (issue.isPresent()) {
            Issue foundIssue = issue.get();
            foundIssue.setStatus(newStatus);
            foundIssue.setResolutionNotes(notes);
            if (newStatus == IssueStatus.RESOLVED || newStatus == IssueStatus.CLOSED) {
                foundIssue.setResolutionDate(LocalDateTime.now());
            }
            foundIssue.setUpdatedAt(LocalDateTime.now());
            return issueRepository.save(foundIssue);
        }
        return null;
    }

    /**
     * Get all issues assigned to a staff member
     * @param staffId the staff member ID
     * @return list of issues
     */
    public List<Issue> getStaffAssignedIssues(Long staffId) {
        return issueRepository.findByAssignedToId(staffId);
    }
}
