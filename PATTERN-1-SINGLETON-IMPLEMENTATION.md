# 🎯 Design Pattern #1: SINGLETON - Print Queue Manager

## ✅ IMPLEMENTATION COMPLETE

### What Changed?

#### **NEW FILES CREATED:**
1. **`PrintQueueManager.java`** 
   - Location: `backend/src/main/java/edu/cit/ortizano/BrgyGO/service/`
   - A singleton that ensures only ONE print queue exists app-wide
   - Manages all document printing jobs in FIFO order
   - Thread-safe operations with synchronized methods

---

### **MODIFIED FILES:**

#### 1. **DocumentRequestService.java**
   **Changes:**
   - Added `PrintQueueManager` field injection
   - Updated constructor to accept PrintQueueManager
   - Added new method: `approveAndQueueForPrinting()`
   - Added new method: `getPrintQueueStatus()`

   **What it does:**
   ```java
   // NEW: When a document is approved, it's automatically added to print queue
   DocumentRequest approveAndQueueForPrinting(Long requestId, User staffMember)
   
   // NEW: Check how many documents are waiting to print
   int getPrintQueueStatus()
   ```

#### 2. **DocumentRequestControllerWithSingletonExample.java** (Reference)
   - Shows how to call the new Singleton methods from the controller
   - Two new endpoints:
     - `POST /api/requests/{id}/approve-and-print` - Approve and queue
     - `GET /api/requests/print-queue-status` - Check queue size

---

## 🔍 How It Works

### Singleton Pattern Flow:

```
1. Application starts
   ↓
2. Spring creates ONE PrintQueueManager instance (@Component)
   ↓
3. DocumentRequestService injects that ONE instance
   ↓
4. When document approved → printQueueManager.addPrintJob()
   ↓
5. Print queue updates (only one queue exists app-wide)
   ↓
6. All print jobs managed sequentially
```

### Example Usage in Code:

```java
// In DocumentRequestService
DocumentRequest approveAndQueueForPrinting(Long requestId, User staffMember) {
    // ... set document status to APPROVED ...
    
    // Uses the SINGLETON to add to print queue
    String printJobId = printQueueManager.addPrintJob(
        doc.getDocumentType().getDisplayName(),
        doc.getId(),
        doc.getUser().getId()
    );
    
    // Saves updated document
    return documentRequestRepository.save(doc);
}
```

---

## ✨ Benefits

| Benefit | Explanation |
|---------|-------------|
| **Single Instance** | Only ONE print queue exists - prevents duplicate jobs |
| **Centralization** | All printing managed in one place - easier to debug |
| **Thread-Safe** | `synchronized` methods prevent race conditions |
| **No Conflicts** | Sequential printing - documents print in order |
| **Resource Efficient** | No wasted resources from multiple queue instances |

---

## 📝 Commits to GitHub

### Commit #1: Implement Singleton Pattern
```bash
git add backend/src/main/java/edu/cit/ortizano/BrgyGO/service/PrintQueueManager.java

git commit -m "feat: Implement SINGLETON pattern - PrintQueueManager

- Add PrintQueueManager singleton for centralized print queue management
- Ensures only one print queue exists app-wide
- Provides thread-safe operations for adding/processing print jobs
- Prevents duplicate print commands

Design Pattern: SINGLETON
- Problem: Multiple instances could cause duplicate print jobs
- Solution: Single instance manages all printing tasks
- Benefit: Centralized management, no conflicts, thread-safe"
```

### Commit #2: Integrate Singleton into DocumentRequestService
```bash
git add backend/src/main/java/edu/cit/ortizano/BrgyGO/service/DocumentRequestService.java

git commit -m "refactor: Integrate SINGLETON PrintQueueManager into DocumentRequestService

- Inject PrintQueueManager singleton
- Add approveAndQueueForPrinting() method
- Add getPrintQueueStatus() method to check queue size
- Documents automatically queued for printing when approved

Changes:
- Constructor now accepts PrintQueueManager
- New method: approveAndQueueForPrinting(requestId, staffMember)
- New method: getPrintQueueStatus() returns queue size"
```

---

## 🧪 Testing the Singleton

### Test with curl:

```bash
# 1. Approve document and queue for printing
curl -X POST http://localhost:8080/api/requests/1/approve-and-print

# Expected response:
{
  "message": "Document approved and queued for printing",
  "document": { ... },
  "printQueueSize": 1
}

# 2. Check print queue status
curl -X GET http://localhost:8080/api/requests/print-queue-status

# Expected response:
{
  "message": "Current print queue status",
  "documentsWaitingToPrint": 1
}
```

---

## 📂 Files Structure After Implementation

```
backend/src/main/java/edu/cit/ortizano/BrgyGO/
├── service/
│   ├── PrintQueueManager.java ✨ NEW
│   ├── DocumentRequestService.java ✏️ MODIFIED
│   ├── IssueService.java
│   ├── AnnouncementService.java
│   └── UserService.java
├── controller/
│   ├── DocumentRequestController.java
│   └── DocumentRequestControllerWithSingletonExample.java ✨ REFERENCE
├── model/
├── repository/
└── ...
```

---

## 🚀 Next Steps

Ready to implement **Pattern #2: Factory Method**?

The Factory Method Pattern will:
- Create different document types (Barangay Clearance, Certificate of Indigency, etc.)
- Without changing existing code
- Make it easy to add new document types in the future

**Stay tuned for Pattern #2!** 🏭

---

## 📚 Key Concepts

### What is Singleton?
A creational pattern where a class has only ONE instance throughout the application. Useful for managing shared resources.

### Real-world analogy:
Like a single print server in an office - only ONE printer manager, all documents sent to it, printed in order.

### When to use:
- Single shared resource (database connection, logger, print queue)
- Need centralized management
- Want to prevent duplicate instances
- Thread-safe operations required

---

**Pattern #1 Status: ✅ COMPLETE**
**Next Pattern: Factory Method (will be started after you review this)**
