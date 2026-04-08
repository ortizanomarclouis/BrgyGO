package edu.cit.ortizano.BrgyGO.service;

import edu.cit.ortizano.BrgyGO.model.DocumentRequest;
import edu.cit.ortizano.BrgyGO.model.DocumentStatus;
import edu.cit.ortizano.BrgyGO.model.User;
import edu.cit.ortizano.BrgyGO.repository.DocumentRequestRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Service class for Document Request operations
 * 
 * DESIGN PATTERN INTEGRATION:
 * - Uses PrintQueueManager (SINGLETON): Centralized print job management
 * - Uses DocumentFactory (FACTORY METHOD): Will create different document types
 * - Uses FeeCalculationStrategy (STRATEGY): Will calculate fees based on resident type
 */
@Service
public class DocumentRequestService {

    private final DocumentRequestRepository documentRequestRepository;
    private final UserService UserService;
    
    // SINGLETON INTEGRATION: Inject the PrintQueueManager singleton
    // Only ONE instance exists throughout the entire application
    private final PrintQueueManager printQueueManager;

    public DocumentRequestService(
            DocumentRequestRepository documentRequestRepository, 
            UserService userService,
            PrintQueueManager printQueueManager) {  // CHANGE: Added singleton injection
        this.documentRequestRepository = documentRequestRepository;
        this.UserService = userService;
        this.printQueueManager = printQueueManager;  // CHANGE: Store the singleton reference
    }

    /**
     * Create a new document request
     * @param documentRequest the document request to create
     * @return the created document request
     */
    @Transactional
    public DocumentRequest createRequest(DocumentRequest documentRequest) {
        documentRequest.setStatus(DocumentStatus.SUBMITTED);
        documentRequest.setCreatedAt(LocalDateTime.now());
        documentRequest.setUpdatedAt(LocalDateTime.now());
        return documentRequestRepository.save(documentRequest);
    }

    /**
     * Get all requests for a specific user
     * @param userId the user ID
     * @return list of document requests
     */
    public List<DocumentRequest> getUserRequests(Long userId) {
        return documentRequestRepository.findByUserId(userId);
    }

    /**
     * Get a specific request by ID
     * @param id the request ID
     * @return the document request or empty
     */
    public Optional<DocumentRequest> getRequestById(Long id) {
        return documentRequestRepository.findById(id);
    }

    /**
     * Get request by reference number
     * @param referenceNumber the reference number
     * @return the document request or empty
     */
    public Optional<DocumentRequest> getRequestByRefNumber(String referenceNumber) {
        return documentRequestRepository.findByReferenceNumber(referenceNumber);
    }

    /**
     * Update request status (staff only)
     * @param requestId the request ID
     * @param newStatus the new status
     * @param notes processing notes
     * @param staffMember the staff member updating
     * @return the updated request
     */
    @Transactional
    public DocumentRequest updateRequestStatus(Long requestId, DocumentStatus newStatus, String notes, User staffMember) {
        Optional<DocumentRequest> request = documentRequestRepository.findById(requestId);
        if (request.isPresent()) {
            DocumentRequest doc = request.get();
            doc.setStatus(newStatus);
            doc.setProcessingNotes(notes);
            doc.setProcessedBy(staffMember);
            doc.setUpdatedAt(LocalDateTime.now());
            return documentRequestRepository.save(doc);
        }
        return null;
    }

    /**
     * DESIGN PATTERN: SINGLETON IMPLEMENTATION
     * 
     * Approve document request and queue it for printing
     * This method uses the PrintQueueManager singleton to manage the print job.
     * 
     * CHANGES FROM ORIGINAL:
     * - NEW METHOD: Combines status update with print queue management
     * - Uses the injected PrintQueueManager singleton (only one instance app-wide)
     * - Automatically adds the document to the print queue when approved
     * 
     * @param requestId the request ID
     * @param staffMember the staff member approving
     * @return the approved request and the print job ID
     */
    @Transactional
    public DocumentRequest approveAndQueueForPrinting(Long requestId, User staffMember) {
        Optional<DocumentRequest> request = documentRequestRepository.findById(requestId);
        
        if (request.isPresent()) {
            DocumentRequest doc = request.get();
            
            // Set status to APPROVED
            doc.setStatus(DocumentStatus.APPROVED);
            doc.setProcessingNotes("Document approved and queued for printing");
            doc.setProcessedBy(staffMember);
            doc.setUpdatedAt(LocalDateTime.now());
            
            // SINGLETON USAGE: Add to the one and only PrintQueueManager instance
            String printJobId = printQueueManager.addPrintJob(
                doc.getDocumentType().getDisplayName(),
                doc.getId(),
                doc.getUser().getId()
            );
            
            System.out.println("📋 Document " + requestId + " approved and sent to print queue with job ID: " + printJobId);
            
            return documentRequestRepository.save(doc);
        }
        
        return null;
    }

    /**
     * SINGLETON USAGE: Get current print queue status
     * Returns information about pending print jobs
     * 
     * CHANGES FROM ORIGINAL:
     * - NEW METHOD: Allows frontend to check how many documents are waiting to print
     * 
     * @return number of documents in the print queue
     */
    public int getPrintQueueStatus() {
        // SINGLETON: The printQueueManager always returns the same queue
        return printQueueManager.getQueueSize();
    }

    /**
     * Get all pending requests (for staff dashboard)
     * @return list of pending requests
     */
    public List<DocumentRequest> getPendingRequests() {
        return documentRequestRepository.findByStatusIn(List.of(
            DocumentStatus.SUBMITTED,
            DocumentStatus.UNDER_REVIEW,
            DocumentStatus.ADDITIONAL_DOCUMENTS_REQUIRED
        ));
    }

    /**
     * Get all requests with specific status
     * @param status the status to filter by
     * @return list of requests
     */
    public List<DocumentRequest> getRequestsByStatus(DocumentStatus status) {
        return documentRequestRepository.findByStatus(status);
    }

    /**
     * Delete a request (only if not processed)
     * @param requestId the request ID
     * @return true if deleted, false otherwise
     */
    @Transactional
    public boolean deleteRequest(Long requestId) {
        Optional<DocumentRequest> request = documentRequestRepository.findById(requestId);
        if (request.isPresent() && request.get().getStatus() == DocumentStatus.SUBMITTED) {
            documentRequestRepository.deleteById(requestId);
            return true;
        }
        return false;
    }
}
