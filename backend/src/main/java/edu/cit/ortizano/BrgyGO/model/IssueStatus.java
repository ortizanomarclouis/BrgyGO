package edu.cit.ortizano.BrgyGO.model;

/**
 * Enum for issue report status workflow
 */
public enum IssueStatus {
    REPORTED("Reported"),
    ACKNOWLEDGED("Acknowledged"),
    IN_PROGRESS("In Progress"),
    RESOLVED("Resolved"),
    CLOSED("Closed"),
    INVALID("Invalid");

    private final String displayName;

    IssueStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
