package edu.cit.ortizano.BrgyGO.factory;

import edu.cit.ortizano.BrgyGO.model.DocumentType;
import java.time.LocalDateTime;

/**
 * DESIGN PATTERN: FACTORY METHOD
 * 
 * Base abstract class for all certificates created by the factory.
 * Each specific certificate type (BarangayClearance, CertificateOfIndigency, etc.)
 * extends this class.
 * 
 * This class defines common properties and methods shared by all certificates.
 */
public abstract class Certificate {

    protected String certificationNumber;
    protected String residentName;
    protected String address;
    protected DocumentType documentType;
    protected String issuedBy;
    protected LocalDateTime issuedDate;
    protected LocalDateTime expirationDate;
    protected String content;
    protected boolean isActive;

    // Constructor
    public Certificate(DocumentType documentType) {
        this.documentType = documentType;
        this.isActive = true;
        this.issuedDate = LocalDateTime.now();
    }

    /**
     * Abstract method - each certificate type must implement
     * Returns the formatted certificate content with specific fields
     */
    public abstract String generateContent();

    /**
     * Abstract method - each certificate type must implement
     * Validates if certificate data is complete
     */
    public abstract boolean isValid();

    // Getters and Setters
    public String getCertificationNumber() { return certificationNumber; }
    public void setCertificationNumber(String certificationNumber) { this.certificationNumber = certificationNumber; }

    public String getResidentName() { return residentName; }
    public void setResidentName(String residentName) { this.residentName = residentName; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public DocumentType getDocumentType() { return documentType; }

    public String getIssuedBy() { return issuedBy; }
    public void setIssuedBy(String issuedBy) { this.issuedBy = issuedBy; }

    public LocalDateTime getIssuedDate() { return issuedDate; }
    public void setIssuedDate(LocalDateTime issuedDate) { this.issuedDate = issuedDate; }

    public LocalDateTime getExpirationDate() { return expirationDate; }
    public void setExpirationDate(LocalDateTime expirationDate) { this.expirationDate = expirationDate; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }
}
