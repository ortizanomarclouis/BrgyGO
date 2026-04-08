package edu.cit.ortizano.BrgyGO.factory;

import edu.cit.ortizano.BrgyGO.model.DocumentType;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

/**
 * DESIGN PATTERN: FACTORY METHOD
 * 
 * Concrete implementation: Barangay ID Application
 * 
 * Barangay ID serves as an identification document issued by the barangay.
 * It contains resident information and serves as a valid ID within the barangay.
 * 
 * CHANGES FROM ORIGINAL:
 * - NEW FILE: Concrete certificate type for Barangay ID
 * - Specific content generation for ID card format
 * - Include resident photo reference (optional)
 * - 5-year validity period (standard ID expiration)
 */
public class BarangayIDCertificate extends Certificate {

    private String idNumber;
    private String dateOfBirth;
    private String gender;
    private String civilStatus;
    private String photoUrl;

    public BarangayIDCertificate() {
        super(DocumentType.BARANGAY_ID);
        // Barangay ID typically expires in 5 years
        this.expirationDate = LocalDateTime.now().plus(5, ChronoUnit.YEARS);
    }

    @Override
    public String generateContent() {
        if (!isValid()) {
            throw new IllegalStateException("Cannot generate content: incomplete certificate data");
        }

        StringBuilder content = new StringBuilder();
        content.append("═══════════════════════════════════════════\n");
        content.append("       BARANGAY IDENTIFICATION CARD\n");
        content.append("═══════════════════════════════════════════\n\n");
        
        content.append("ID Number: ").append(idNumber).append("\n");
        content.append("Issued Date: ").append(issuedDate).append("\n");
        content.append("Expiration Date: ").append(expirationDate).append("\n\n");
        
        content.append("PERSONAL INFORMATION:\n");
        content.append("Name: ").append(residentName).append("\n");
        content.append("Address: ").append(address).append("\n");
        content.append("Date of Birth: ").append(dateOfBirth != null ? dateOfBirth : "Not Provided").append("\n");
        content.append("Gender: ").append(gender != null ? gender : "Not Specified").append("\n");
        content.append("Civil Status: ").append(civilStatus != null ? civilStatus : "Not Specified").append("\n\n");
        
        content.append("This ID card is issued by the Barangay\n");
        content.append("and is valid within the jurisdiction of the barangay.\n\n");
        
        if (photoUrl != null && !photoUrl.isEmpty()) {
            content.append("Photo ID: ").append(photoUrl).append("\n\n");
        }
        
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
               idNumber != null && !idNumber.isEmpty() &&
               issuedBy != null && !issuedBy.isEmpty();
    }

    // Getters and Setters
    public String getIdNumber() { return idNumber; }
    public void setIdNumber(String idNumber) { this.idNumber = idNumber; }

    public String getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(String dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getCivilStatus() { return civilStatus; }
    public void setCivilStatus(String civilStatus) { this.civilStatus = civilStatus; }

    public String getPhotoUrl() { return photoUrl; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }
}
