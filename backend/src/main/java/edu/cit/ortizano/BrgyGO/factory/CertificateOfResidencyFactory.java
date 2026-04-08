package edu.cit.ortizano.BrgyGO.factory;

import edu.cit.ortizano.BrgyGO.model.DocumentType;

/**
 * DESIGN PATTERN: FACTORY METHOD
 * 
 * Concrete Factory Implementation for Certificate of Residency
 * 
 * This factory is responsible for creating Certificate of Residency documents.
 */
public class CertificateOfResidencyFactory implements CertificateFactory {

    @Override
    public Certificate createCertificate() {
        // FACTORY METHOD: Returns a new CertificateOfResidencyCertificate instance
        return new CertificateOfResidencyCertificate();
    }

    @Override
    public DocumentType getDocumentType() {
        return DocumentType.CERTIFICATE_OF_RESIDENCY;
    }

    @Override
    public String getCertificateTemplate() {
        return "CERTIFICATE OF RESIDENCY - Proof of Residency";
    }
}
