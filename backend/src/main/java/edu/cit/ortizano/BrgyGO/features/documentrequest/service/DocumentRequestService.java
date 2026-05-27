package edu.cit.ortizano.BrgyGO.features.documentrequest.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import edu.cit.ortizano.BrgyGO.features.documentrequest.factory.Certificate;
import edu.cit.ortizano.BrgyGO.features.documentrequest.model.DocumentRequest;
import edu.cit.ortizano.BrgyGO.features.documentrequest.model.DocumentStatus;
import edu.cit.ortizano.BrgyGO.features.auth.model.User;
import edu.cit.ortizano.BrgyGO.features.documentrequest.repository.DocumentRequestRepository;
import edu.cit.ortizano.BrgyGO.features.documentrequest.support.PrintQueueManager;

@Service
public class DocumentRequestService {

    private final DocumentRequestRepository documentRequestRepository;
    private final PrintQueueManager printQueueManager;

    public DocumentRequestService(
            DocumentRequestRepository documentRequestRepository,
            PrintQueueManager printQueueManager) {
        this.documentRequestRepository = documentRequestRepository;
        this.printQueueManager = printQueueManager;
    }

    @Transactional
    public DocumentRequest createRequest(DocumentRequest documentRequest) {
        documentRequest.setStatus(DocumentStatus.SUBMITTED);
        documentRequest.setCreatedAt(LocalDateTime.now());
        documentRequest.setUpdatedAt(LocalDateTime.now());
        return documentRequestRepository.save(documentRequest);
    }

    public List<DocumentRequest> getUserRequests(Long userId) {
        return documentRequestRepository.findByUserId(userId);
    }

    public Optional<DocumentRequest> getRequestById(Long id) {
        return documentRequestRepository.findById(id);
    }

    public Optional<DocumentRequest> getRequestByRefNumber(String referenceNumber) {
        return documentRequestRepository.findByReferenceNumber(referenceNumber);
    }

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

    @Transactional
    public DocumentRequest approveAndQueueForPrinting(Long requestId, User staffMember) {
        Optional<DocumentRequest> request = documentRequestRepository.findById(requestId);
        if (request.isPresent()) {
            DocumentRequest doc = request.get();
            doc.setStatus(DocumentStatus.APPROVED);
            doc.setProcessingNotes("Document approved and queued for printing");
            doc.setProcessedBy(staffMember);
            doc.setUpdatedAt(LocalDateTime.now());
            String printJobId = printQueueManager.addPrintJob(
                doc.getDocumentType().getDisplayName(),
                doc.getId(),
                doc.getUser().getId()
            );
            System.out.println("Document " + requestId + " approved, print job: " + printJobId);
            return documentRequestRepository.save(doc);
        }
        return null;
    }

    public int getPrintQueueStatus() {
        return printQueueManager.getQueueSize();
    }

    public List<DocumentRequest> getPendingRequests() {
        return documentRequestRepository.findByStatusIn(List.of(
            DocumentStatus.SUBMITTED,
            DocumentStatus.UNDER_REVIEW,
            DocumentStatus.ADDITIONAL_DOCUMENTS_REQUIRED
        ));
    }

    public List<DocumentRequest> getAllRequests() {
        return documentRequestRepository.findAll();
    }

    public List<DocumentRequest> getRequestsByStatus(DocumentStatus status) {
        return documentRequestRepository.findByStatus(status);
    }

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
     * Generate certificate using explicit resident name and address.
     * Safe fallbacks are applied by the caller so this never throws on null fields.
     */
    public Certificate generateCertificateWithData(Long requestId, String residentName, String address) {
        Optional<DocumentRequest> request = documentRequestRepository.findById(requestId);
        if (request.isEmpty()) {
            throw new IllegalArgumentException("Document request not found: " + requestId);
        }

        DocumentRequest doc = request.get();
        Certificate certificate = documentFactory.createCertificate(doc.getDocumentType());

        certificate.setCertificationNumber("CERT-" + requestId + "-" + System.currentTimeMillis());
        certificate.setResidentName(residentName);
        certificate.setAddress(address);
        certificate.setIssuedBy("Barangay Official");

        // Generate content — guaranteed to succeed because name/address are never null
        certificate.generateContent();

        return certificate;
    }

    /**
     * Original generateCertificate kept for backward compatibility.
     * Falls back to safe values if user profile is incomplete.
     */
    public Certificate generateCertificate(Long requestId) {
        Optional<DocumentRequest> request = documentRequestRepository.findById(requestId);
        if (request.isEmpty()) {
            throw new IllegalArgumentException("Document request not found: " + requestId);
        }

        DocumentRequest doc = request.get();

        String residentName = (doc.getUser() != null && doc.getUser().getFullName() != null
                && !doc.getUser().getFullName().isBlank())
                ? doc.getUser().getFullName() : "Resident";

        String address = (doc.getUser() != null && doc.getUser().getCompleteAddress() != null
                && !doc.getUser().getCompleteAddress().isBlank())
                ? doc.getUser().getCompleteAddress() : "Address on file";

        return generateCertificateWithData(requestId, residentName, address);
    }

    public String getCertificateTemplate(edu.cit.ortizano.BrgyGO.features.documentrequest.model.DocumentType documentType) {
        return documentFactory.getCertificateTemplate(documentType);
    }

    public boolean isSupportedDocumentType(edu.cit.ortizano.BrgyGO.features.documentrequest.model.DocumentType documentType) {
        return documentFactory.isSupported(documentType);
    }
}