package edu.cit.ortizano.BrgyGO.service;

import java.time.LocalDateTime;
import java.util.LinkedQueue;
import java.util.Queue;
import java.util.UUID;
import org.springframework.stereotype.Component;

/**
 * DESIGN PATTERN: SINGLETON
 * 
 * Problem it solves:
 * The application needs only ONE print queue manager to avoid conflicts,
 * duplicate print commands, and wasted resources. Multiple instances could
 * lead to the same document being printed multiple times.
 * 
 * How it works:
 * - Private constructor prevents instantiation from outside
 * - Static instance is created once when class loads
 * - Public method returns the same instance every time
 * - Spring @Component makes it a singleton bean automatically
 * 
 * Real-world example:
 * A database connection pool shared across all app modules
 * 
 * Use case in Barangay System:
 * Print queue manager only one instance manages document printing jobs
 * to avoid duplicate print commands and ensure sequential printing.
 * 
 * CHANGES FROM ORIGINAL:
 * - NEW FILE: This singleton manages all printing tasks
 * - Can be injected into DocumentRequestController when document is approved
 * - Centralizes all print job management
 */
@Component  // Spring makes this a singleton bean by default
public class PrintQueueManager {

    // Thread-safe queue to store print jobs
    private final Queue<PrintJob> printQueue = new LinkedQueue<>();
    
    // Counter for tracking print jobs
    private int printJobCounter = 0;
    
    /**
     * Private constructor prevents instantiation outside the class
     * This is part of the Singleton pattern
     */
    public PrintQueueManager() {
        System.out.println("🖨️ PrintQueueManager initialized (SINGLETON - Only one instance exists)");
    }

    /**
     * Adds a print job to the queue
     * @param documentType the type of document to print (e.g., "Barangay Clearance")
     * @param documentId the ID of the document
     * @param userId the ID of the user requesting the print
     * @return the print job ID
     */
    public synchronized String addPrintJob(String documentType, Long documentId, Long userId) {
        String jobId = "PRINT-" + UUID.randomUUID().toString().substring(0, 8);
        
        PrintJob job = new PrintJob(
            ++printJobCounter,
            jobId,
            documentType,
            documentId,
            userId,
            LocalDateTime.now()
        );
        
        printQueue.add(job);
        System.out.println("✅ Print job added to queue: " + jobId + " (Queue size: " + printQueue.size() + ")");
        
        return jobId;
    }

    /**
     * Processes the next print job in the queue
     * @return the print job that was processed, or null if queue is empty
     */
    public synchronized PrintJob processPrintJob() {
        PrintJob job = printQueue.poll();
        
        if (job != null) {
            job.setProcessedAt(LocalDateTime.now());
            System.out.println("🖨️ Processing print job: " + job.getJobId());
            // In a real system, this would send to actual printer
        } else {
            System.out.println("⏳ No print jobs in queue");
        }
        
        return job;
    }

    /**
     * Gets the current size of the print queue
     * @return number of jobs waiting to be printed
     */
    public synchronized int getQueueSize() {
        return printQueue.size();
    }

    /**
     * Clears all print jobs from the queue
     * (Only for admin emergency use)
     */
    public synchronized void clearQueue() {
        printQueue.clear();
        System.out.println("🗑️ Print queue cleared");
    }

    /**
     * INNER CLASS: PrintJob represents a single print task
     */
    public static class PrintJob {
        private int sequence;
        private String jobId;
        private String documentType;
        private Long documentId;
        private Long userId;
        private LocalDateTime createdAt;
        private LocalDateTime processedAt;

        public PrintJob(int sequence, String jobId, String documentType, Long documentId, Long userId, LocalDateTime createdAt) {
            this.sequence = sequence;
            this.jobId = jobId;
            this.documentType = documentType;
            this.documentId = documentId;
            this.userId = userId;
            this.createdAt = createdAt;
        }

        // Getters and Setters
        public int getSequence() { return sequence; }
        public String getJobId() { return jobId; }
        public String getDocumentType() { return documentType; }
        public Long getDocumentId() { return documentId; }
        public Long getUserId() { return userId; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public LocalDateTime getProcessedAt() { return processedAt; }
        public void setProcessedAt(LocalDateTime processedAt) { this.processedAt = processedAt; }
    }
}
