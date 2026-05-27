package edu.cit.ortizano.BrgyGO.features.documentrequest.factory;

import edu.cit.ortizano.BrgyGO.features.documentrequest.model.DocumentType;
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
    content.append("REPUBLIC OF THE PHILIPPINES\n\n");
    content.append("OFFICE OF THE BARANGAY CAPTAIN\n\n");
    content.append("CERTIFICATE OF RESIDENCY\n\n");
    content.append("Cert. No.: ").append(certificationNumber).append("\n");
    content.append("Date Issued: ").append(issuedDate.toLocalDate()).append("\n\n");

    content.append("TO WHOM IT MAY CONCERN:\n\n");

    content.append("        This is to certify that ").append(residentName)
           .append(", of legal age, Filipino citizen,\n");
    content.append("whose address is ").append(address).append(", is a PERMANENT RESIDENT\n");
    content.append("of this Barangay.\n\n");

    if (residencePeriod != null && !residencePeriod.isEmpty()) {
        content.append("        Based on records of this office, he/she has been residing in this\n");
        content.append("barangay for ").append(residencePeriod).append(".\n\n");
    } else {
        content.append("        Based on records of this office, he/she has been residing in this\n");
        content.append("barangay as shown in official records.\n\n");
    }

    content.append("        This CERTIFICATION is being issued upon the request of the above-named\n");
    content.append("person for whatever legal purpose it may serve.\n\n");

    content.append("        Issued this ")
           .append(issuedDate.getDayOfMonth())
           .append(" day of ")
           .append(issuedDate.getMonth().toString())
           .append(", ")
           .append(issuedDate.getYear())
           .append(" at this Barangay.\n\n\n");

    content.append("Issued by: ").append(issuedBy).append("\n");
    content.append("Punong Barangay\n\n");
    content.append("Valid until: ").append(expirationDate.toLocalDate()).append("\n");

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
