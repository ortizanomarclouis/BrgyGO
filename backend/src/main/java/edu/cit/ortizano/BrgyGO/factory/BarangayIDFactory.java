package edu.cit.ortizano.BrgyGO.factory;

import edu.cit.ortizano.BrgyGO.model.DocumentType;

/**
 * DESIGN PATTERN: FACTORY METHOD
 * 
 * Concrete Factory Implementation for Barangay ID
 * 
 * This factory is responsible for creating Barangay ID certificate documents.
 */
public class BarangayIDFactory implements CertificateFactory {

    @Override
    public Certificate createCertificate() {
        // FACTORY METHOD: Returns a new BarangayIDCertificate instance
        return new BarangayIDCertificate();
    }

    @Override
    public DocumentType getDocumentType() {
        return DocumentType.BARANGAY_ID;
    }

    @Override
    public String getCertificateTemplate() {
        return "BARANGAY ID - Official Identification Card";
    }
}
