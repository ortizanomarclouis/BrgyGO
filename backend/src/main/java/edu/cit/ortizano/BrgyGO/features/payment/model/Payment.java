package edu.cit.ortizano.BrgyGO.features.payment.model;
 
import edu.cit.ortizano.BrgyGO.features.documentrequest.model.DocumentRequest;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
 
@Entity
@Table(name = "payments")
public class Payment {
 
    public enum PaymentMethod { GCASH, PAYMAYA, CASH }
    public enum PaymentStatus { PENDING, VERIFIED, REJECTED }
 
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
 
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_request_id", nullable = false)
    private DocumentRequest documentRequest;
 
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentMethod paymentMethod;
 
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentStatus status = PaymentStatus.PENDING;
 
    private String referenceNumber;   // online payments
 
    @Column(precision = 10, scale = 2)
    private BigDecimal amount;
 
    /** Base64-encoded proof screenshot (online payments only) */
    @Column(columnDefinition = "TEXT")
    private String proofScreenshot;
 
    private LocalDateTime createdAt  = LocalDateTime.now();
    private LocalDateTime verifiedAt;
 
    private String verifiedBy;        // staff username who verified
 
    /* ── getters & setters ── */
 
    public Long getId() { return id; }
 
    public DocumentRequest getDocumentRequest() { return documentRequest; }
    public void setDocumentRequest(DocumentRequest documentRequest) { this.documentRequest = documentRequest; }
 
    public PaymentMethod getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; }
 
    public PaymentStatus getStatus() { return status; }
    public void setStatus(PaymentStatus status) { this.status = status; }
 
    public String getReferenceNumber() { return referenceNumber; }
    public void setReferenceNumber(String referenceNumber) { this.referenceNumber = referenceNumber; }
 
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
 
    public String getProofScreenshot() { return proofScreenshot; }
    public void setProofScreenshot(String proofScreenshot) { this.proofScreenshot = proofScreenshot; }
 
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
 
    public LocalDateTime getVerifiedAt() { return verifiedAt; }
    public void setVerifiedAt(LocalDateTime verifiedAt) { this.verifiedAt = verifiedAt; }
 
    public String getVerifiedBy() { return verifiedBy; }
    public void setVerifiedBy(String verifiedBy) { this.verifiedBy = verifiedBy; }
}