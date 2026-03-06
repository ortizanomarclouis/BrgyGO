package edu.cit.ortizano.BrgyGO.service;

import java.util.List;
import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import edu.cit.ortizano.BrgyGO.model.User;
import edu.cit.ortizano.BrgyGO.repository.UserRepository;

/**
 * Service class for User operations
 */
@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Register a new user
     * @param user the user to register
     * @return the saved user
     */
    @Transactional
    public User registerUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("User with email already exists: " + user.getEmail());
        }

        // Encode password before saving
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    /**
     * Find user by email
     * @param email the email to search for
     * @return Optional containing the user if found
     */
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    /**
     * Get all users
     * @return list of all users
     */
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    /**
     * Get user by ID
     * @param id the user ID
     * @return Optional containing the user if found
     */
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    /**
     * Update user information
     * @param id the user ID
     * @param updatedUser the updated user data
     * @return the updated user
     */
    @Transactional
    public User updateUser(Long id, User updatedUser) {
        Optional<User> existingUserOpt = userRepository.findById(id);
        if (existingUserOpt.isEmpty()) {
            throw new RuntimeException("User not found with id: " + id);
        }

        User existingUser = existingUserOpt.get();

        // Update fields (excluding password and email for security)
        existingUser.setFullName(updatedUser.getFullName());
        existingUser.setContactNumber(updatedUser.getContactNumber());
        existingUser.setCompleteAddress(updatedUser.getCompleteAddress());
        existingUser.setRole(updatedUser.getRole());
        existingUser.setIsActive(updatedUser.getIsActive());

        return userRepository.save(existingUser);
    }

    /**
     * Delete user by ID
     * @param id the user ID
     */
    @Transactional
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }

    /**
     * Authenticate user (for login)
     * @param email the user's email
     * @param rawPassword the raw password
     * @return Optional containing the user if authentication successful
     */
    public Optional<User> authenticate(String email, String rawPassword) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (passwordEncoder.matches(rawPassword, user.getPassword()) && user.getIsActive()) {
                return Optional.of(user);
            }
        }
        return Optional.empty();
    }
}