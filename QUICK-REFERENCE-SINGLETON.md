# ⚡ Quick Reference - Singleton Pattern Implementation

## What Was Done? ✅

### Pattern: **SINGLETON** - Print Queue Manager

**Problem Solved:** 
- Avoid duplicate print jobs
- Centralize print queue management
- Prevent resource conflicts

**Solution:**
- One PrintQueueManager instance across entire app
- Manages all document printing sequentially
- Thread-safe implementation

---

## 3 Files Involved

### 1️⃣ **PrintQueueManager.java** (NEW)
- **What**: Singleton print queue manager
- **Why**: Only one instance should manage printing
- **How**: Spring `@Component` + synchronized methods
- **Use**: Inject into services that need printing

```java
@Component
public class PrintQueueManager {
    private final Queue<PrintJob> printQueue = new LinkedQueue<>();
    
    public synchronized String addPrintJob(...) { ... }
    public synchronized PrintJob processPrintJob() { ... }
    public synchronized int getQueueSize() { ... }
}
```

### 2️⃣ **DocumentRequestService.java** (UPDATED)
- **What**: Now uses the PrintQueueManager singleton
- **Why**: When documents are approved, queue them for printing
- **How**: Inject PrintQueueManager, call its methods
- **New Methods**:
  - `approveAndQueueForPrinting()` - Approve + queue
  - `getPrintQueueStatus()` - Check queue size

```java
@Service
public class DocumentRequestService {
    private final PrintQueueManager printQueueManager; // ADDED
    
    @Transactional
    public DocumentRequest approveAndQueueForPrinting(...) {
        // Set status to APPROVED
        String jobId = printQueueManager.addPrintJob(...);
        // Save and return
    }
}
```

### 3️⃣ **DocumentRequestControllerWithSingletonExample.java** (REFERENCE)
- **What**: Shows how to use the new methods
- **Why**: Example for developers
- **How**: Call the new service methods from endpoints
- **New Endpoints**:
  - `POST /api/requests/{id}/approve-and-print`
  - `GET /api/requests/print-queue-status`

```java
@PostMapping("/{id}/approve-and-print")
public ResponseEntity<?> approveAndQueueForPrinting(@PathVariable Long id) {
    // Uses singleton internally through service
    DocumentRequest updated = documentRequestService.approveAndQueueForPrinting(id, staff);
    return ResponseEntity.ok(response);
}
```

---

## Key Points to Remember

| Point | Details |
|-------|---------|
| **@Component** | Spring automatically creates singleton |
| **synchronized** | Methods are thread-safe |
| **Injection** | Inject PrintQueueManager where needed |
| **One Instance** | Same instance used everywhere in app |
| **Benefits** | No duplicates, centralized, sequential |

---

## Testing Checklist

- [ ] Application compiles without errors
- [ ] PrintQueueManager can be injected into services
- [ ] approveAndQueueForPrinting() method exists
- [ ] getPrintQueueStatus() method exists
- [ ] New endpoints accessible
- [ ] Print queue size increases when document approved
- [ ] Only ONE PrintQueueManager instance (verify in logs)

---

## Commit Summary

**2 Commits needed:**

```bash
# Commit 1: Add the singleton
git add backend/src/main/java/edu/cit/ortizano/BrgyGO/service/PrintQueueManager.java
git commit -m "feat: Implement SINGLETON pattern - PrintQueueManager"

# Commit 2: Update service
git add backend/src/main/java/edu/cit/ortizano/BrgyGO/service/DocumentRequestService.java
git commit -m "refactor: Integrate PrintQueueManager singleton into service"
```

---

## Next Pattern: Factory Method 🏭

**When ready**, implement Pattern #2 which will:
- Create different document types programmatically
- Add new document types without changing existing code
- Factory decides which type to create based on input

**Example:**
```java
DocumentFactory factory = new DocumentFactory();
Document barangayClearance = factory.createDocument(DocumentType.BARANGAY_CLEARANCE);
Document certificate = factory.createDocument(DocumentType.CERTIFICATE_OF_RESIDENCY);
```

---

## Status: ✅ Pattern #1 COMPLETE

**Files Created:** 2
**Files Modified:** 1  
**New Methods:** 2
**New Endpoints:** 2
**Breaking Changes:** 0
**Backward Compatible:** ✅ Yes

---

## 📞 Questions?

- See `PATTERN-1-SINGLETON-IMPLEMENTATION.md` for detailed docs
- See `FILES-MODIFIED-SINGLETON.md` for all file changes
- See `DocumentRequestControllerWithSingletonExample.java` for usage examples

**Ready for Pattern #2? Let me know!** 🚀
