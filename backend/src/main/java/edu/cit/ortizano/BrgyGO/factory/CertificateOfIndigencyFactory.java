package edu.cit.ortizano.BrgyGO.factory;

import edu.cit.ortizano.BrgyGO.model.DocumentType;

/**
 * DESIGN PATTERN: FACTORY METHOD
 * 
 * Concrete Factory Implementation for Certificate of Indigency
 * 
 * This factory is responsible for creating Certificate of Indigency documents.
 */
public class CertificateOfIndigencyFactory implements CertificateFactory {

    @Override
    public Certificate createCertificate() {
        // FACTORY METHOD: Returns a new CertificateOfIndigencyCertificate instance
        return new CertificateOfIndigencyCertificate();
    }

    @Override
    public DocumentType getDocumentType() {
        return DocumentType.CERTIFICATE_OF_INDIGENCY;
    }

    @Override
    public String getCertificateTemplate() {
        return "CERTIFICATE OF INDIGENCY - Proof of Economic Status";
    }
}
