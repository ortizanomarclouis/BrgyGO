package edu.cit.ortizano.BrgyGO.service;

import edu.cit.ortizano.BrgyGO.model.DocumentRequest;
import edu.cit.ortizano.BrgyGO.model.DocumentStatus;
import edu.cit.ortizano.BrgyGO.model.User;
import edu.cit.ortizano.BrgyGO.repository.DocumentRequestRepository;
import edu.cit.ortizano.BrgyGO.factory.DocumentFactory;
import edu.cit.ortizano.BrgyGO.factory.Certificate;
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
 * - Uses DocumentFactory (FACTORY METHOD): Creates different document types
 * - Uses FeeCalculationStrategy (STRATEGY): Will calculate fees based on resident type
 */
@Service
public class DocumentRequestService {

    private final DocumentRequestRepository documentRequestRepository;
    private final UserService UserService;
    
    // SINGLETON INTEGRATION: Inject the PrintQueueManager singleton
    // Only ONE instance exists throughout the entire application
    private final PrintQueueManager printQueueManager;
    
    // FACTORY METHOD INTEGRATION: Inject the DocumentFactory
    // Uses factory to create different certificate types
    private final DocumentFactory documentFactory;

    public DocumentRequestService(
            DocumentRequestRepository documentRequestRepository, 
            UserService userService,
            PrintQueueManager printQueueManager,
            DocumentFactory documentFactory) {  // CHANGE: Added factory injection
        this.documentRequestRepository = documentRequestRepository;
        this.UserService = userService;
        this.printQueueManager = printQueueManager;
        this.documentFactory = documentFactory;  // CHANGE: Store factory reference
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

    /**
     * DESIGN PATTERN: FACTORY METHOD IMPLEMENTATION
     * 
     * Generate a certificate for a document request
     * 
     * Uses DocumentFactory to create the appropriate certificate based on document type.
     * The factory decides which certificate class to instantiate without changing
     * the existing code.
     * 
     * CHANGES FROM ORIGINAL:
     * - NEW METHOD: Uses DocumentFactory to create certificates
     * - Eliminates need for if-else chains based on document type
     * - Easy to add new document types in the future
     * 
     * @param requestId the document request ID
     * @return the generated certificate
     */
    public Certificate generateCertificate(Long requestId) {
        Optional<DocumentRequest> request = documentRequestRepository.findById(requestId);
        
        if (request.isEmpty()) {
            throw new IllegalArgumentException("Document request not found: " + requestId);
        }
        
        DocumentRequest doc = request.get();
        
        // FACTORY METHOD: Use factory to create appropriate certificate type
        Certificate certificate = documentFactory.createCertificate(doc.getDocumentType());
        
        // Set certificate data from request
        certificate.setCertificationNumber("CERT-" + System.currentTimeMillis());
        certificate.setResidentName(doc.getUser().getFullName());
        certificate.setAddress(doc.getUser().getCompleteAddress());
        certificate.setIssuedBy("Barangay Official");
        
        // Generate the certificate content with specific format for this type
        certificate.generateContent();
        
        System.out.println("✅ Certificate generated for request " + requestId + 
                          " of type: " + doc.getDocumentType().getDisplayName());
        
        return certificate;
    }

    /**
     * DESIGN PATTERN: FACTORY METHOD USAGE
     * 
     * Get certificate template for a document type
     * Useful for showing users what each certificate looks like
     * 
     * CHANGES FROM ORIGINAL:
     * - NEW METHOD: Shows available certificate templates
     * 
     * @param documentType the type of document
     * @return the certificate template description
     */
    public String getCertificateTemplate(edu.cit.ortizano.BrgyGO.model.DocumentType documentType) {
        // FACTORY METHOD: Get template from factory
        return documentFactory.getCertificateTemplate(documentType);
    }

    /**
     * DESIGN PATTERN: FACTORY METHOD USAGE
     * 
     * Check if a document type is supported
     * 
     * CHANGES FROM ORIGINAL:
     * - NEW METHOD: Validates if system can create this document type
     * 
     * @param documentType the type to check
     * @return true if supported
     */
    public boolean isSupportedDocumentType(edu.cit.ortizano.BrgyGO.model.DocumentType documentType) {
        // FACTORY METHOD: Check if factory supports this type
        return documentFactory.isSupported(documentType);
    }
}
