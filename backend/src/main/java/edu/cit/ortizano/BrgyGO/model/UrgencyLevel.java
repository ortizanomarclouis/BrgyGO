package edu.cit.ortizano.BrgyGO.model;

/**
 * Enum for issue urgency levels
 */
public enum UrgencyLevel {
    LOW("Low"),
    MEDIUM("Medium"),
    HIGH("High");

    private final String displayName;

    UrgencyLevel(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
