package edu.cit.ortizano.BrgyGO.factory;

import edu.cit.ortizano.BrgyGO.model.DocumentType;

/**
 * DESIGN PATTERN: FACTORY METHOD
 * 
 * Problem it solves:
 * The system needs to create different types of certificates (Barangay Clearance,
 * Certificate of Indigency, Certificate of Residency, Barangay ID) without changing
 * existing code every time a new document type is added.
 * 
 * How it works:
 * - DefineFactory interface with createCertificate() method
 * - Each document type has its own factory implementation
 * - Factory decides which certificate to create based on DocumentType
 * - New document types can be added without changing existing code
 * 
 * Real-world example:
 * A car factory creates different car models (Honda, Toyota, Nissan) without
 * changing the factory code itself.
 * 
 * Use case in Barangay System:
 * CertificateFactory creates Barangay Clearance, Certificate of Indigency,
 * Certificate of Residency, or Barangay ID based on document request type.
 * 
 * CHANGES FROM ORIGINAL:
 * - NEW FILE: Factory interface defining certificate creation contract
 * - Enable adding new document types without modifying existing code
 * - Centralize document creation logic
 */
public interface CertificateFactory {

    /**
     * Creates a certificate based on the factory implementation
     * @return a new certificate instance
     */
    Certificate createCertificate();

    /**
     * Gets the document type this factory creates
     * @return the document type
     */
    DocumentType getDocumentType();

    /**
     * Gets the certificate template with specific fields
     * @return formatted certificate content template
     */
    String getCertificateTemplate();
}
