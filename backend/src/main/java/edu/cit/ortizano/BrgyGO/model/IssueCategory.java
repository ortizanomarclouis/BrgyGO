package edu.cit.ortizano.BrgyGO.model;

/**
 * Enum for issue categories in BrgyGO
 */
public enum IssueCategory {
    INFRASTRUCTURE("Infrastructure"),
    SAFETY_AND_SECURITY("Safety and Security"),
    SANITATION("Sanitation"),
    NOISE_DISTURBANCE("Noise Disturbance"),
    OTHERS("Others");

    private final String displayName;

    IssueCategory(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
