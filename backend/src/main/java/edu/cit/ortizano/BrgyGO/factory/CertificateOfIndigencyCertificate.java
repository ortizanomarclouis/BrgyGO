package edu.cit.ortizano.BrgyGO.factory;

import edu.cit.ortizano.BrgyGO.model.DocumentType;
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
        content.append("═══════════════════════════════════════════\n");
        content.append("       REPUBLIC OF THE PHILIPPINES\n");
        content.append("       CERTIFICATE OF INDIGENCY\n");
        content.append("═══════════════════════════════════════════\n\n");
        
        content.append("Certificate No.: ").append(certificationNumber).append("\n");
        content.append("Issued Date: ").append(issuedDate).append("\n");
        content.append("Expiration Date: ").append(expirationDate).append("\n\n");
        
        content.append("TO WHOM IT MAY CONCERN:\n\n");
        
        content.append("This is to certify that ").append(residentName).append(",\n");
        content.append("Address: ").append(address).append("\n");
        content.append("is a bonafide resident of this barangay and belongs to\n");
        content.append("the economically disadvantaged sector of the community.\n\n");
        
        content.append("Household Information:\n");
        content.append("Monthly Income: ").append(monthlyIncome != null ? monthlyIncome : "Undisclosed").append("\n");
        content.append("Number of Dependents: ").append(numberOfDependents != null ? numberOfDependents : "Not Specified").append("\n\n");
        
        content.append("This certificate is issued for purposes of scholarship,\n");
        content.append("medical assistance, financial aid, and other social\n");
        content.append("welfare programs.\n\n");
        
        content.append("Verified by: ").append(verifiedBy != null ? verifiedBy : "Barangay Official").append("\n");
        content.append("Authorized to sign\n");
        
        content.append("\n═══════════════════════════════════════════\n");

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
