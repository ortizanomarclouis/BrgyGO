package edu.cit.ortizano.BrgyGO.features.payment.repository;

import edu.cit.ortizano.BrgyGO.features.payment.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    /** Find the latest payment for a given document request. */
    Optional<Payment> findTopByDocumentRequestIdOrderByCreatedAtDesc(Long documentRequestId);

    /** All payments for a document request (useful for history). */
    List<Payment> findByDocumentRequestIdOrderByCreatedAtDesc(Long documentRequestId);
}