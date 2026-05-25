package edu.cit.ortizano.BrgyGO.features.payment.controller;

import edu.cit.ortizano.BrgyGO.features.payment.dto.PaymentDto;
import edu.cit.ortizano.BrgyGO.features.payment.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    /**
     * Single JSON-only endpoint — no multipart, no @RequestParam conflict.
     * Frontend sends: { requestId, method, referenceNumber, amount }
     */
    @PostMapping(consumes = "application/json")
    public ResponseEntity<?> submitPayment(@RequestBody Map<String, Object> body) {
        try {
            Long       requestId       = toLong(body.get("requestId"));
            String     method          = toString(body.get("method"));
            String     referenceNumber = toString(body.get("referenceNumber"));
            BigDecimal amount          = toBigDecimal(body.get("amount"));

            System.out.println("=== PAYMENT SUBMIT ===");
            System.out.println("requestId      : " + requestId);
            System.out.println("method         : " + method);
            System.out.println("referenceNumber: " + referenceNumber);
            System.out.println("amount         : " + amount);

            if (requestId == null)
                return ResponseEntity.badRequest().body(Map.of("error", "requestId is required"));

            // Defaults
            if (amount == null) amount = BigDecimal.ZERO;
            if (method == null || method.isBlank()) method = "CASH";

            // Map frontend values → enum values the service understands
            // Frontend sends: "ONLINE", "FREE", "CASH"
            // Enum accepts:   "GCASH",  "GCASH", "CASH"
            String serviceMethod;
            switch (method.toUpperCase()) {
                case "ONLINE":
                case "FREE":
                case "GCASH":
                    serviceMethod = "GCASH";
                    break;
                case "MAYA":
                case "PAYMAYA":
                    serviceMethod = "PAYMAYA";
                    break;
                default:
                    serviceMethod = "CASH";
                    break;
            }

            // Placeholder ref for samples
            if ((referenceNumber == null || referenceNumber.isBlank())
                    && !"CASH".equals(serviceMethod)) {
                referenceNumber = "SAMPLE-" + System.currentTimeMillis();
            }

            PaymentDto result;
            if ("CASH".equals(serviceMethod)) {
                result = paymentService.submitCashPayment(requestId, amount);
            } else {
                result = paymentService.submitOnlinePayment(
                        requestId, serviceMethod, referenceNumber, amount, null);
            }

            System.out.println("=== PAYMENT SAVED id=" + result.getId() + " ===");
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            System.out.println("=== PAYMENT ERROR: " + e.getMessage() + " ===");
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // ── Staff: verify or reject ───────────────────────────────────────────────
    @PostMapping("/{paymentId}/verify")
    public ResponseEntity<PaymentDto> verifyPayment(
            @PathVariable Long paymentId,
            @RequestBody Map<String, Boolean> body,
            Authentication auth) {
        boolean approve = Boolean.TRUE.equals(body.get("approve"));
        String  staff   = auth != null ? auth.getName() : "staff";
        return ResponseEntity.ok(paymentService.verifyPayment(paymentId, approve, staff));
    }

    // ── Queries ───────────────────────────────────────────────────────────────
    @GetMapping("/request/{requestId}")
    public ResponseEntity<List<PaymentDto>> getPaymentsForRequest(@PathVariable Long requestId) {
        return ResponseEntity.ok(paymentService.getPaymentsForRequest(requestId));
    }

    @GetMapping("/request/{requestId}/latest")
    public ResponseEntity<PaymentDto> getLatestPayment(@PathVariable Long requestId) {
        return ResponseEntity.ok(paymentService.getLatestPaymentForRequest(requestId));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    private Long toLong(Object o) {
        if (o == null) return null;
        if (o instanceof Number) return ((Number) o).longValue();
        try { return Long.parseLong(o.toString()); } catch (Exception e) { return null; }
    }

    private BigDecimal toBigDecimal(Object o) {
        if (o == null) return null;
        if (o instanceof Number) return BigDecimal.valueOf(((Number) o).doubleValue());
        try { return new BigDecimal(o.toString()); } catch (Exception e) { return null; }
    }

    private String toString(Object o) {
        return o == null ? null : o.toString();
    }
}