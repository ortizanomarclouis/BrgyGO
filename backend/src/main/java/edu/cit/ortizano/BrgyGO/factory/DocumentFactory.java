package edu.cit.ortizano.BrgyGO.factory;

import edu.cit.ortizano.BrgyGO.model.DocumentType;
import org.springframework.stereotype.Component;

/**
 * DESIGN PATTERN: FACTORY METHOD
 * 
 * Main Document Factory - Central Factory for Creating Certificates
 * 
 * Problem it solves:
 * Instead of having if-else statements scattered throughout the code
 * to create different certificate types, we have ONE place that
 * decides which factory to use.
 * 
 * How it works:
 * - Receives a DocumentType
 * - Returns the appropriate CertificateFactory based on that type
 * - The factory then creates the specific certificate
 * 
 * Benefit of Factory Method:
 * - Easy to add new document types (just add a new factory)
 * - No existing code changes needed
 * - Clear separation of concerns
 * - Each factory handles its own certificate creation
 * 
 * CHANGES FROM ORIGINAL:
 * - NEW FILE: Central factory that coordinates all certificate creation
 * - Enables adding new document types without modifying existing code
 * - Cleaner code with no massive if-else chains
 * 
 * Example usage:
 * DocumentFactory factory = new DocumentFactory();
 * CertificateFactory barangayFactory = factory.getFactory(DocumentType.BARANGAY_CLEARANCE);
 * Certificate cert = barangayFactory.createCertificate();
 */
@Component
public class DocumentFactory {

    /**
     * Returns the appropriate factory for a given document type
     * 
     * FACTORY METHOD PATTERN:
     * This method decides which factory to use without changing existing code
     * 
     * @param documentType the type of document to create
     * @return the factory for creating that document type
     * @throws IllegalArgumentException if document type is not supported
     */
    public CertificateFactory getFactory(DocumentType documentType) {
        switch (documentType) {
            case BARANGAY_CLEARANCE:
                return new BarangayClearanceFactory();
                
            case CERTIFICATE_OF_INDIGENCY:
                return new CertificateOfIndigencyFactory();
                
            case CERTIFICATE_OF_RESIDENCY:
                return new CertificateOfResidencyFactory();
                
            case BARANGAY_ID:
                return new BarangayIDFactory();
                
            default:
                throw new IllegalArgumentException("Unsupported document type: " + documentType);
        }
    }

    /**
     * Creates a certificate directly from a document type
     * Convenience method that combines factory retrieval and certificate creation
     * 
     * @param documentType the type of document to create
     * @return a new certificate instance
     */
    public Certificate createCertificate(DocumentType documentType) {
        CertificateFactory factory = getFactory(documentType);
        return factory.createCertificate();
    }

    /**
     * Gets the certificate template for a given document type
     * Useful for displaying to users what each certificate looks like
     * 
     * @param documentType the type of document
     * @return the certificate template description
     */
    public String getCertificateTemplate(DocumentType documentType) {
        return getFactory(documentType).getCertificateTemplate();
    }

    /**
     * Checks if a document type is supported by this factory
     * 
     * @param documentType the type to check
     * @return true if supported, false otherwise
     */
    public boolean isSupported(DocumentType documentType) {
        try {
            getFactory(documentType);
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }
}
