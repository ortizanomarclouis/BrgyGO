package edu.cit.ortizano.BrgyGO.factory;

import edu.cit.ortizano.BrgyGO.model.DocumentType;

/**
 * DESIGN PATTERN: FACTORY METHOD
 * 
 * Concrete Factory Implementation for Barangay Clearance
 * 
 * This factory is responsible for creating Barangay Clearance certificates.
 * 
 * CHANGES FROM ORIGINAL:
 * - NEW FILE: Handles creation of Barangay Clearance documents
 * - Provides certificate template specific to Barangay Clearance
 * - Can be extended with additional logic for this specific document type
 */
public class BarangayClearanceFactory implements CertificateFactory {

    @Override
    public Certificate createCertificate() {
        // FACTORY METHOD: Returns a new BarangayClearanceCertificate instance
        return new BarangayClearanceCertificate();
    }

    @Override
    public DocumentType getDocumentType() {
        return DocumentType.BARANGAY_CLEARANCE;
    }

    @Override
    public String getCertificateTemplate() {
        return "BARANGAY CLEARANCE - Certification of Good Moral Character";
    }
}
