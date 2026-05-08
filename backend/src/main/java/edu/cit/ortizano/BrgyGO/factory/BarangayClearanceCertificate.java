package edu.cit.ortizano.BrgyGO.factory;

import edu.cit.ortizano.BrgyGO.model.DocumentType;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

/**
 * DESIGN PATTERN: FACTORY METHOD
 * 
 * Concrete implementation: Barangay Clearance Certificate
 * 
 * A Barangay Clearance is a document certifying that the resident
 * has no derogatory record and is of good moral character.
 * 
 * CHANGES FROM ORIGINAL:
 * - NEW FILE: Concrete certificate type for Barangay Clearance
 * - Specific content generation for this certificate
 * - Validation rules specific to this document type
 * - 1-year expiration period
 */
public class BarangayClearanceCertificate extends Certificate {

    public BarangayClearanceCertificate() {
        super(DocumentType.BARANGAY_CLEARANCE);
        // Barangay Clearance typically expires in 1 year
        this.expirationDate = LocalDateTime.now().plus(1, ChronoUnit.YEARS);
    }

    @Override
    public String generateContent() {
        if (!isValid()) {
            throw new IllegalStateException("Cannot generate content: incomplete certificate data");
        }

        StringBuilder content = new StringBuilder();
        content.append("═══════════════════════════════════════════\n");
        content.append("       REPUBLIC OF THE PHILIPPINES\n");
        content.append("       BARANGAY CLEARANCE\n");
        content.append("═══════════════════════════════════════════\n\n");
        
        content.append("Clearance No.: ").append(certificationNumber).append("\n");
        content.append("Issued Date: ").append(issuedDate).append("\n");
        content.append("Expiration Date: ").append(expirationDate).append("\n\n");
        
        content.append("TO WHOM IT MAY CONCERN:\n\n");
        
        content.append("This is to certify that ").append(residentName).append("\n");
        content.append("Address: ").append(address).append("\n\n");
        
        content.append("has been a resident of this barangay and is known to be\n");
        content.append("of good moral character. He/She is hereby certified to\n");
        content.append("have no derogatory record on file with this office.\n\n");
        
        content.append("This certification is issued upon request for employment,\n");
        content.append("travel, loans, and other legitimate purposes.\n\n");
        
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
}
