package edu.cit.ortizano.BrgyGO.features.auth.service;

import edu.cit.ortizano.BrgyGO.features.auth.model.User;
import edu.cit.ortizano.BrgyGO.features.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class OtpService {

    private final JavaMailSender mailSender;
    private final UserRepository userRepository;

    @Value("${app.otp.expiry-minutes:10}")
    private int otpExpiryMinutes;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public OtpService(JavaMailSender mailSender, UserRepository userRepository) {
        this.mailSender = mailSender;
        this.userRepository = userRepository;
    }

    /**
     * Generate a random 6-digit OTP, save it to the user, and send an email.
     */
    @Transactional
    public void sendOtp(User user) {
        String otp = generateOtp();
        user.setOtpCode(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(otpExpiryMinutes));
        user.setEmailVerified(false);
        userRepository.save(user);

        sendOtpEmail(user.getEmail(), user.getFullName(), otp);
    }

    /**
     * Verify the OTP entered by the user.
     * Returns true if correct and not expired; false otherwise.
     */
    @Transactional
    public boolean verifyOtp(String email, String enteredOtp) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) return false;

        User user = userOpt.get();

        if (user.getOtpCode() == null || user.getOtpExpiry() == null) return false;
        if (LocalDateTime.now().isAfter(user.getOtpExpiry())) return false;
        if (!user.getOtpCode().equals(enteredOtp.trim())) return false;

        // OTP is valid — mark email as verified and clear the code
        user.setEmailVerified(true);
        user.setOtpCode(null);
        user.setOtpExpiry(null);
        userRepository.save(user);
        return true;
    }

    /**
     * Resend a fresh OTP to the same email.
     */
    @Transactional
    public boolean resendOtp(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) return false;
        sendOtp(userOpt.get());
        return true;
    }

    // ── Helpers ──────────────────────────────────────────────────────────

    private String generateOtp() {
        SecureRandom random = new SecureRandom();
        int code = 100000 + random.nextInt(900000); // always 6 digits
        return String.valueOf(code);
    }

    private void sendOtpEmail(String toEmail, String fullName, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("BrgyGO — Your Verification Code");
        message.setText(
            "Hello " + fullName + ",\n\n" +
            "Your BrgyGO verification code is:\n\n" +
            "  " + otp + "\n\n" +
            "This code expires in " + otpExpiryMinutes + " minutes.\n\n" +
            "If you did not create a BrgyGO account, please ignore this email.\n\n" +
            "— BrgyGO Team"
        );
        mailSender.send(message);
    }
}