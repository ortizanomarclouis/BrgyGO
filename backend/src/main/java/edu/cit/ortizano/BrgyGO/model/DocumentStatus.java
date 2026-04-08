package edu.cit.ortizano.BrgyGO.model;

/**
 * Enum for document request status workflow
 */
public enum DocumentStatus {
    SUBMITTED("Submitted"),
    UNDER_REVIEW("Under Review"),
    ADDITIONAL_DOCUMENTS_REQUIRED("Additional Documents Required"),
    APPROVED("Approved"),
    READY_FOR_RELEASE("Ready for Release"),
    COMPLETED("Completed"),
    REJECTED("Rejected"),
    CANCELLED("Cancelled");

    private final String displayName;

    DocumentStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
