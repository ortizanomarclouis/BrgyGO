package edu.cit.ortizano.BrgyGO.features.payment.controller;

import edu.cit.ortizano.BrgyGO.features.payment.dto.PaymentDto;
import edu.cit.ortizano.BrgyGO.features.payment.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * REST endpoints for the payment flow.
 *
 * Public-facing  →  POST /api/payments            (resident submits)
 * Staff          →  POST /api/payments/{id}/verify (staff verifies)
 *                   GET  /api/payments/request/{requestId}
 */
@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    // ── Resident: submit payment ─────────────────────────────────────────────

    /**
     * Accepts both online (multipart) and cash (JSON) submissions via a
     * single endpoint.  The frontend sends:
     *
     *   Online  →  multipart/form-data
     *              requestId, paymentMethod (GCASH|PAYMAYA), referenceNumber,
     *              amount, proofScreenshot (file)
     *
     *   Cash    →  application/json
     *              { requestId, paymentMethod: "CASH", amount }
     */
    @PostMapping(consumes = { "multipart/form-data", "application/json" })
    public ResponseEntity<PaymentDto> submitPayment(
            // multipart params (online)
            @RequestParam(required = false) Long requestId,
            @RequestParam(required = false) String paymentMethod,
            @RequestParam(required = false) String referenceNumber,
            @RequestParam(required = false) BigDecimal amount,
            @RequestParam(required = false) MultipartFile proofScreenshot,
            // JSON body fallback (cash)
            @RequestBody(required = false) Map<String, Object> body
    ) throws IOException {

        // Merge JSON body into variables when it's a JSON request
        if (body != null) {
            if (requestId    == null) requestId    = toLong(body.get("requestId"));
            if (paymentMethod == null) paymentMethod = (String) body.get("paymentMethod");
            if (amount       == null) amount       = toBigDecimal(body.get("amount"));
        }

        if ("CASH".equalsIgnoreCase(paymentMethod)) {
            return ResponseEntity.ok(paymentService.submitCashPayment(requestId, amount));
        }

        return ResponseEntity.ok(
                paymentService.submitOnlinePayment(
                        requestId, paymentMethod, referenceNumber, amount, proofScreenshot));
    }

    // ── Staff: verify or reject ──────────────────────────────────────────────

    /**
     * Body: { "approve": true }
     */
    @PostMapping("/{paymentId}/verify")
    public ResponseEntity<PaymentDto> verifyPayment(
            @PathVariable Long paymentId,
            @RequestBody Map<String, Boolean> body,
            Authentication auth
    ) {
        boolean approve = Boolean.TRUE.equals(body.get("approve"));
        String  staff   = auth != null ? auth.getName() : "staff";
        return ResponseEntity.ok(paymentService.verifyPayment(paymentId, approve, staff));
    }

    // ── Staff: query ─────────────────────────────────────────────────────────

    @GetMapping("/request/{requestId}")
    public ResponseEntity<List<PaymentDto>> getPaymentsForRequest(
            @PathVariable Long requestId) {
        return ResponseEntity.ok(paymentService.getPaymentsForRequest(requestId));
    }

    @GetMapping("/request/{requestId}/latest")
    public ResponseEntity<PaymentDto> getLatestPayment(@PathVariable Long requestId) {
        return ResponseEntity.ok(paymentService.getLatestPaymentForRequest(requestId));
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private Long toLong(Object o) {
        if (o == null) return null;
        if (o instanceof Number) return ((Number) o).longValue();
        try { return Long.parseLong(o.toString()); } catch (NumberFormatException e) { return null; }
    }

    private BigDecimal toBigDecimal(Object o) {
        if (o == null) return null;
        if (o instanceof Number) return BigDecimal.valueOf(((Number) o).doubleValue());
        try { return new BigDecimal(o.toString()); } catch (NumberFormatException e) { return null; }
    }
}