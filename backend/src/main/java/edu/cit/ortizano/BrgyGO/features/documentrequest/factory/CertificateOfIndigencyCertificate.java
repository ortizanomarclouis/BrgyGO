package edu.cit.ortizano.BrgyGO.features.documentrequest.factory;

import edu.cit.ortizano.BrgyGO.features.documentrequest.model.DocumentType;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

/**
 * DESIGN PATTERN: FACTORY METHOD
 * 
 * Concrete implementation: Certificate of Indigency
 * 
 * Certificate of Indigency is a document proving that the person
 * belongs to the indigenous/poor sector of society, often used for
 * tuition assistance, medical assistance, or financial aid.
 * 
 * CHANGES FROM ORIGINAL:
 * - NEW FILE: Concrete certificate type for Certificate of Indigency
 * - Specific content generation for poverty certification
 * - Different validation rules (economic status confirmation)
 * - 6-month expiration period (may need renewal)
 */
public class CertificateOfIndigencyCertificate extends Certificate {

    private String monthlyIncome;
    private String numberOfDependents;
    private String verifiedBy;

    public CertificateOfIndigencyCertificate() {
        super(DocumentType.CERTIFICATE_OF_INDIGENCY);
        // Certificate of Indigency typically expires in 6 months
        this.expirationDate = LocalDateTime.now().plus(6, ChronoUnit.MONTHS);
    }

    @Override
public String generateContent() {
    if (!isValid()) {
        throw new IllegalStateException("Cannot generate content: incomplete certificate data");
    }

    StringBuilder content = new StringBuilder();
    content.append("REPUBLIC OF THE PHILIPPINES\n\n");
    content.append("OFFICE OF THE BARANGAY CAPTAIN\n\n");
    content.append("CERTIFICATE OF INDIGENCY\n\n");
    content.append("Certificate No.: ").append(certificationNumber).append("\n");
    content.append("Date Issued: ").append(issuedDate.toLocalDate()).append("\n\n");

    content.append("TO WHOM IT MAY CONCERN:\n\n");

    content.append("        THIS IS TO CERTIFY that ").append(residentName)
           .append(", of legal age, Filipino citizen,\n");
    content.append("and a bonafide resident of this barangay located at ").append(address).append(",\n");
    content.append("belongs to the INDIGENT sector of this community.\n\n");

    if (monthlyIncome != null && !monthlyIncome.isEmpty()) {
        content.append("        The declared household monthly income is ").append(monthlyIncome)
               .append(", which is\n");
        content.append("below the Regional Poverty Threshold as determined by NEDA.\n\n");
    }

    if (numberOfDependents != null && !numberOfDependents.isEmpty()) {
        content.append("        Number of dependents: ").append(numberOfDependents).append(".\n\n");
    }

    content.append("        This CERTIFICATION is issued upon request of the above-named person\n");
    content.append("for purposes of scholarship, medical assistance, financial aid, and other\n");
    content.append("social welfare programs, given this ")
           .append(issuedDate.getDayOfMonth())
           .append(" day of ")
           .append(issuedDate.getMonth().toString())
           .append(" ")
           .append(issuedDate.getYear())
           .append(".\n\n\n");

    content.append("Issued by: ").append(issuedBy).append("\n");
    content.append("Punong Barangay\n");
    content.append("(Not valid without the Barangay Dry Seal)\n\n");
    content.append("Valid until: ").append(expirationDate.toLocalDate()).append("\n");

    this.content = content.toString();
    return this.content;
}

    @Override
    public boolean isValid() {
        return residentName != null && !residentName.isEmpty() &&
               address != null && !address.isEmpty() &&
               certificationNumber != null && !certificationNumber.isEmpty();
    }

    // Getters and Setters for specific fields
    public String getMonthlyIncome() { return monthlyIncome; }
    public void setMonthlyIncome(String monthlyIncome) { this.monthlyIncome = monthlyIncome; }

    public String getNumberOfDependents() { return numberOfDependents; }
    public void setNumberOfDependents(String numberOfDependents) { this.numberOfDependents = numberOfDependents; }

    public String getVerifiedBy() { return verifiedBy; }
    public void setVerifiedBy(String verifiedBy) { this.verifiedBy = verifiedBy; }
}
