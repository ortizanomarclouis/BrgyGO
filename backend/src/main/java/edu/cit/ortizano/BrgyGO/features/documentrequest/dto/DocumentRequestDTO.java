package edu.cit.ortizano.BrgyGO.features.documentrequest.dto;

import java.time.LocalDateTime;

import edu.cit.ortizano.BrgyGO.features.documentrequest.model.DocumentStatus;
import edu.cit.ortizano.BrgyGO.features.documentrequest.model.DocumentType;
import jakarta.validation.constraints.NotNull;

/**
 * DTO for Document Request
 */
public class DocumentRequestDTO {
    
    private Long id;
    
    @NotNull(message = "Document type is required")
    private DocumentType documentType;
    
    private String purpose;
    
    private DocumentStatus status;
    
    private String referenceNumber;
    
    private String documentUrl;
    
    private String identityPhotoUrl;
    
    private LocalDateTime releaseDate;
    
    private String processingNotes;
    
    private String processedBy;
    
    private Long requestorId;
    private String requestorFullName;
    private String requestorEmail;
    private String requestorAddress;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;

    // Constructors
    public DocumentRequestDTO() {
    }

    public DocumentRequestDTO(Long id, DocumentType documentType, DocumentStatus status, String referenceNumber) {
        this.id = id;
        this.documentType = documentType;
        this.status = status;
        this.referenceNumber = referenceNumber;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public DocumentType getDocumentType() {
        return documentType;
    }

    public void setDocumentType(DocumentType documentType) {
        this.documentType = documentType;
    }

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }

    public DocumentStatus getStatus() {
        return status;
    }

    public void setStatus(DocumentStatus status) {
        this.status = status;
    }

    public String getReferenceNumber() {
        return referenceNumber;
    }

    public void setReferenceNumber(String referenceNumber) {
        this.referenceNumber = referenceNumber;
    }

    public String getDocumentUrl() {
        return documentUrl;
    }

    public void setDocumentUrl(String documentUrl) {
        this.documentUrl = documentUrl;
    }

    public String getIdentityPhotoUrl() {
        return identityPhotoUrl;
    }

    public void setIdentityPhotoUrl(String identityPhotoUrl) {
        this.identityPhotoUrl = identityPhotoUrl;
    }

    public LocalDateTime getReleaseDate() {
        return releaseDate;
    }

    public void setReleaseDate(LocalDateTime releaseDate) {
        this.releaseDate = releaseDate;
    }

    public String getProcessingNotes() {
        return processingNotes;
    }

    public void setProcessingNotes(String processingNotes) {
        this.processingNotes = processingNotes;
    }

    public String getProcessedBy() {
        return processedBy;
    }

    public void setProcessedBy(String processedBy) {
        this.processedBy = processedBy;
    }

    public Long getRequestorId() {
        return requestorId;
    }

    public void setRequestorId(Long requestorId) {
        this.requestorId = requestorId;
    }

    public String getRequestorFullName() {
        return requestorFullName;
    }

    public void setRequestorFullName(String requestorFullName) {
        this.requestorFullName = requestorFullName;
    }

    public String getRequestorEmail() {
        return requestorEmail;
    }

    public void setRequestorEmail(String requestorEmail) {
        this.requestorEmail = requestorEmail;
    }

    public String getRequestorAddress() {
        return requestorAddress;
    }

    public void setRequestorAddress(String requestorAddress) {
        this.requestorAddress = requestorAddress;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
