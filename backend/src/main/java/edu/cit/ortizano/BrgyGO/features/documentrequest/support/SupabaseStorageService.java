package edu.cit.ortizano.BrgyGO.features.documentrequest.support;

import java.util.Base64;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/**
 * Service for handling file uploads - stores files as base64 in the database
 */
@Service
public class SupabaseStorageService {

    /**
     * Convert file to base64 string for database storage
     *
     * @param file the file to convert
     * @param folder the folder path (not used for database storage)
     * @return the base64 encoded string with file info
     */
    public String uploadFile(MultipartFile file, String folder) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        // Validate file size (max 10MB)
        long maxFileSize = 10485760; // 10MB
        if (file.getSize() > maxFileSize) {
            throw new IllegalArgumentException("File size exceeds maximum allowed size of 10MB");
        }

        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || !isValidImageType(contentType)) {
            throw new IllegalArgumentException("Invalid file type. Only images are allowed (JPEG, PNG, GIF, WebP)");
        }

        try {
            // Convert file to base64
            byte[] fileBytes = file.getBytes();
            String base64String = Base64.getEncoder().encodeToString(fileBytes);
            
            // Store with metadata: filename|filetype|base64data
            String fileName = file.getOriginalFilename();
            String fileInfo = fileName + "|" + contentType + "|" + base64String;
            
            System.out.println("File converted to base64: " + fileName + " (" + file.getSize() + " bytes)");
            
            return fileInfo;
        } catch (Exception e) {
            throw new RuntimeException("Error processing file: " + e.getMessage(), e);
        }
    }

    /**
     * Validate if the file type is an image
     */
    private boolean isValidImageType(String contentType) {
        return contentType.startsWith("image/jpeg") ||
                contentType.startsWith("image/png") ||
                contentType.startsWith("image/jpg") ||
                contentType.startsWith("image/gif") ||
                contentType.startsWith("image/webp");
    }
}
