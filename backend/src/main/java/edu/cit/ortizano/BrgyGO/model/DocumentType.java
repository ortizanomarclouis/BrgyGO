package edu.cit.ortizano.BrgyGO.model;

/**
 * Enum for available document types in BrgyGO
 */
public enum DocumentType {
    BARANGAY_CLEARANCE("Barangay Clearance"),
    CERTIFICATE_OF_INDIGENCY("Certificate of Indigency"),
    CERTIFICATE_OF_RESIDENCY("Certificate of Residency"),
    BARANGAY_ID("Barangay ID Application");

    private final String displayName;

    DocumentType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
