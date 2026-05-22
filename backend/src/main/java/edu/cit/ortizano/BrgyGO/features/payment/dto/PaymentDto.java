package edu.cit.ortizano.BrgyGO.features.payment.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/** Read-only response DTO returned to the frontend. */
public class PaymentDto {

    private Long id;
    private Long documentRequestId;
    private String referenceNumber;
    private String paymentMethod;
    private String status;
    private BigDecimal amount;
    private boolean hasProof;
    private LocalDateTime createdAt;
    private LocalDateTime verifiedAt;
    private String verifiedBy;

    /* ── getters & setters ── */

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getDocumentRequestId() { return documentRequestId; }
    public void setDocumentRequestId(Long documentRequestId) { this.documentRequestId = documentRequestId; }

    public String getReferenceNumber() { return referenceNumber; }
    public void setReferenceNumber(String referenceNumber) { this.referenceNumber = referenceNumber; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public boolean isHasProof() { return hasProof; }
    public void setHasProof(boolean hasProof) { this.hasProof = hasProof; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getVerifiedAt() { return verifiedAt; }
    public void setVerifiedAt(LocalDateTime verifiedAt) { this.verifiedAt = verifiedAt; }

    public String getVerifiedBy() { return verifiedBy; }
    public void setVerifiedBy(String verifiedBy) { this.verifiedBy = verifiedBy; }
}