package edu.cit.ortizano.BrgyGO.repository;

import edu.cit.ortizano.BrgyGO.model.DocumentRequest;
import edu.cit.ortizano.BrgyGO.model.DocumentStatus;
import edu.cit.ortizano.BrgyGO.model.DocumentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * Repository for DocumentRequest entity
 */
@Repository
public interface DocumentRequestRepository extends JpaRepository<DocumentRequest, Long> {
    
    // Find all requests by user ID
    List<DocumentRequest> findByUserId(Long userId);
    
    // Find all requests with specific status
    List<DocumentRequest> findByStatus(DocumentStatus status);
    
    // Find all requests with specific document type
    List<DocumentRequest> findByDocumentType(DocumentType documentType);
    
    // Find request by reference number
    Optional<DocumentRequest> findByReferenceNumber(String referenceNumber);
    
    // Find all requests by user and status
    List<DocumentRequest> findByUserIdAndStatus(Long userId, DocumentStatus status);
    
    // Find all pending requests (for staff view)
    List<DocumentRequest> findByStatusIn(List<DocumentStatus> statuses);
}
