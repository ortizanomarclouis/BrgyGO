package edu.cit.ortizano.BrgyGO.features.documentrequest.factory;

import edu.cit.ortizano.BrgyGO.features.documentrequest.model.DocumentType;
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
    content.append("REPUBLIC OF THE PHILIPPINES\n\n");
    content.append("OFFICE OF THE BARANGAY CAPTAIN\n\n");
    content.append("BARANGAY CLEARANCE\n\n");
    content.append("Clearance No.: ").append(certificationNumber).append("\n");
    content.append("Date Issued: ").append(issuedDate.toLocalDate()).append("\n\n");

    content.append("TO WHOM IT MAY CONCERN:\n\n");

    content.append("        This is to certify that ").append(residentName)
           .append(", of legal age, Filipino citizen, and a bonafide resident of this\n");
    content.append("barangay located at ").append(address).append(", is known to be of GOOD MORAL\n");
    content.append("CHARACTER and a law-abiding citizen in the community.\n\n");

    content.append("        To certify further, that he/she has no derogatory and/or criminal\n");
    content.append("records filed in this barangay.\n\n");

    content.append("        This BARANGAY CLEARANCE is being issued upon the request of the\n");
    content.append("above-named person for whatever legal purpose it may serve.\n\n");

    content.append("        ISSUED this _____ day of _______________, ")
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
}
