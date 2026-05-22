package edu.cit.ortizano.BrgyGO.features.payment.service;

import edu.cit.ortizano.BrgyGO.features.documentrequest.model.DocumentRequest;
import edu.cit.ortizano.BrgyGO.features.documentrequest.model.DocumentStatus;
import edu.cit.ortizano.BrgyGO.features.documentrequest.repository.DocumentRequestRepository;
import edu.cit.ortizano.BrgyGO.features.payment.dto.PaymentDto;
import edu.cit.ortizano.BrgyGO.features.payment.model.Payment;
import edu.cit.ortizano.BrgyGO.features.payment.model.Payment.PaymentMethod;
import edu.cit.ortizano.BrgyGO.features.payment.model.Payment.PaymentStatus;
import edu.cit.ortizano.BrgyGO.features.payment.repository.PaymentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final DocumentRequestRepository documentRequestRepository;

    public PaymentService(PaymentRepository paymentRepository,
                          DocumentRequestRepository documentRequestRepository) {
        this.paymentRepository         = paymentRepository;
        this.documentRequestRepository = documentRequestRepository;
    }

    // ── Submit online payment ────────────────────────────────────────────────
    public PaymentDto submitOnlinePayment(Long requestId,
                                          String methodStr,
                                          String referenceNumber,
                                          BigDecimal amount,
                                          MultipartFile proofScreenshot) throws IOException {
        DocumentRequest request = findRequest(requestId);
        PaymentMethod method    = parseMethod(methodStr);

        if (method == PaymentMethod.CASH) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Use the cash endpoint for CASH payments.");
        }

        Payment payment = new Payment();
        payment.setDocumentRequest(request);
        payment.setPaymentMethod(method);
        payment.setReferenceNumber(referenceNumber);
        payment.setAmount(amount);
        payment.setProofScreenshot(encodeScreenshot(proofScreenshot));
        payment.setStatus(PaymentStatus.PENDING);

        return toDto(paymentRepository.save(payment));
    }

    // ── Submit cash payment ──────────────────────────────────────────────────
    public PaymentDto submitCashPayment(Long requestId, BigDecimal amount) {
        DocumentRequest request = findRequest(requestId);

        Payment payment = new Payment();
        payment.setDocumentRequest(request);
        payment.setPaymentMethod(PaymentMethod.CASH);
        payment.setAmount(amount);
        payment.setStatus(PaymentStatus.PENDING);

        return toDto(paymentRepository.save(payment));
    }

    // ── Staff: verify or reject ──────────────────────────────────────────────
    public PaymentDto verifyPayment(Long paymentId, boolean approve, String staffUsername) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Payment not found: " + paymentId));

        payment.setStatus(approve ? PaymentStatus.VERIFIED : PaymentStatus.REJECTED);
        payment.setVerifiedAt(LocalDateTime.now());
        payment.setVerifiedBy(staffUsername);
        paymentRepository.save(payment);

        if (approve) {
            DocumentRequest req = payment.getDocumentRequest();
            approveDocumentRequest(req);
            documentRequestRepository.save(req);
        }

        return toDto(payment);
    }

    private void approveDocumentRequest(DocumentRequest req) {
        req.setStatus(DocumentStatus.APPROVED);
    }

    // ── Queries ──────────────────────────────────────────────────────────────
    public List<PaymentDto> getPaymentsForRequest(Long requestId) {
        return paymentRepository
                .findByDocumentRequestIdOrderByCreatedAtDesc(requestId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public PaymentDto getLatestPaymentForRequest(Long requestId) {
        return paymentRepository
                .findTopByDocumentRequestIdOrderByCreatedAtDesc(requestId)
                .map(this::toDto)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "No payment found for request: " + requestId));
    }

    public boolean isPaymentVerified(Long requestId) {
        return paymentRepository
                .findTopByDocumentRequestIdOrderByCreatedAtDesc(requestId)
                .map(p -> p.getStatus() == PaymentStatus.VERIFIED)
                .orElse(false);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────
    private DocumentRequest findRequest(Long requestId) {
        return documentRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Document request not found: " + requestId));
    }

    private PaymentMethod parseMethod(String method) {
        try {
            return PaymentMethod.valueOf(method.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Invalid payment method: " + method);
        }
    }

    private String encodeScreenshot(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) return null;
        String mime = file.getContentType() != null ? file.getContentType() : "image/jpeg";
        String b64  = Base64.getEncoder().encodeToString(file.getBytes());
        return "data:" + mime + ";base64," + b64;
    }

    private PaymentDto toDto(Payment p) {
        PaymentDto dto = new PaymentDto();
        dto.setId(p.getId());
        dto.setDocumentRequestId(p.getDocumentRequest().getId());
        dto.setReferenceNumber(p.getReferenceNumber());
        dto.setPaymentMethod(p.getPaymentMethod().name());
        dto.setStatus(p.getStatus().name());
        dto.setAmount(p.getAmount());
        dto.setHasProof(p.getProofScreenshot() != null);
        dto.setCreatedAt(p.getCreatedAt());
        dto.setVerifiedAt(p.getVerifiedAt());
        dto.setVerifiedBy(p.getVerifiedBy());
        return dto;
    }
}