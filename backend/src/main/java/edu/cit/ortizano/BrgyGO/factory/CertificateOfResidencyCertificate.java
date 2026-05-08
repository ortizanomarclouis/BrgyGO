package edu.cit.ortizano.BrgyGO.factory;

import edu.cit.ortizano.BrgyGO.model.DocumentType;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

/**
 * DESIGN PATTERN: FACTORY METHOD
 * 
 * Concrete implementation: Certificate of Residency
 * 
 * Certificate of Residency is a document certifying that a person
 * is a bonafide resident of the barangay for a certain period of time.
 * Used for vehicle registration, franchises, business permits, etc.
 * 
 * CHANGES FROM ORIGINAL:
 * - NEW FILE: Concrete certificate type for Certificate of Residency
 * - Specific content generation for residency certification
 * - Track residency period/length
 * - 1-year expiration period
 */
public class CertificateOfResidencyCertificate extends Certificate {

    private String residencePeriod;  // e.g., "3 years" or "5 months"
    private LocalDateTime dateOfResidency;

    public CertificateOfResidencyCertificate() {
        super(DocumentType.CERTIFICATE_OF_RESIDENCY);
        // Certificate of Residency typically expires in 1 year
        this.expirationDate = LocalDateTime.now().plus(1, ChronoUnit.YEARS);
        this.dateOfResidency = LocalDateTime.now();
    }

    @Override
    public String generateContent() {
        if (!isValid()) {
            throw new IllegalStateException("Cannot generate content: incomplete certificate data");
        }

        StringBuilder content = new StringBuilder();
        content.append("═══════════════════════════════════════════\n");
        content.append("       REPUBLIC OF THE PHILIPPINES\n");
        content.append("       CERTIFICATE OF RESIDENCY\n");
        content.append("═══════════════════════════════════════════\n\n");
        
        content.append("Cert. No.: ").append(certificationNumber).append("\n");
        content.append("Issued Date: ").append(issuedDate).append("\n");
        content.append("Expiration Date: ").append(expirationDate).append("\n\n");
        
        content.append("TO WHOM IT MAY CONCERN:\n\n");
        
        content.append("This is to certify that ").append(residentName).append(",\n");
        content.append("Address: ").append(address).append("\n");
        content.append("is a bonafide resident of this barangay.\n\n");
        
        content.append("Period of Residency: ").append(residencePeriod != null ? residencePeriod : "As shown in records").append("\n");
        content.append("Since: ").append(dateOfResidency).append("\n\n");
        
        content.append("This certificate is issued for purposes of vehicle\n");
        content.append("registration, business permits, school enrollment,\n");
        content.append("and other official requirements.\n\n");
        
        content.append("Issued by: ").append(issuedBy).append("\n");
        content.append("Barangay Official\n");
        
        content.append("\n═══════════════════════════════════════════\n");

        this.content = content.toString();
        return this.content;
    }

    @Override
    public boolean isValid() {
        return residentName != null && !residentName.isEmpty() &&
               address != null && !address.isEmpty() &&
               certificationNumber != null && !certificationNumber.isEmpty() &&
               issuedBy != null && !issuedBy.isEmpty();
    }

    // Getters and Setters
    public String getResidencePeriod() { return residencePeriod; }
    public void setResidencePeriod(String residencePeriod) { this.residencePeriod = residencePeriod; }

    public LocalDateTime getDateOfResidency() { return dateOfResidency; }
    public void setDateOfResidency(LocalDateTime dateOfResidency) { this.dateOfResidency = dateOfResidency; }
}
