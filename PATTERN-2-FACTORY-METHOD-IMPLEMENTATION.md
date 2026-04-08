# 🏭 Design Pattern #2: FACTORY METHOD - Certificate Factory

## ✅ IMPLEMENTATION COMPLETE

### What Changed?

#### **NEW FILES CREATED:**

1. **`CertificateFactory.java`** (Interface)
   - Defines contract for all certificate factories
   - Methods: `createCertificate()`, `getDocumentType()`, `getCertificateTemplate()`

2. **`Certificate.java`** (Abstract Base Class)
   - Base class for all certificates
   - Common properties: certificationNumber, residentName, address, etc.
   - Abstract methods: `generateContent()`, `isValid()`

3. **Concrete Certificate Classes:**
   - `BarangayClearanceCertificate.java` - Good moral character certificate (1 year validity)
   - `CertificateOfIndigencyCertificate.java` - Poverty certification (6 month validity)
   - `CertificateOfResidencyCertificate.java` - Residency proof (1 year validity)
   - `BarangayIDCertificate.java` - Official ID card (5 year validity)

4. **Concrete Factory Classes:**
   - `BarangayClearanceFactory.java` - Creates BarangayClearanceCertificate
   - `CertificateOfIndigencyFactory.java` - Creates CertificateOfIndigencyCertificate
   - `CertificateOfResidencyFactory.java` - Creates CertificateOfResidencyCertificate
   - `BarangayIDFactory.java` - Creates BarangayIDCertificate

5. **Main Factory:**
   - `DocumentFactory.java` - Central factory that coordinates all certificate creation
     - `getFactory(DocumentType)` - Returns appropriate factory
     - `createCertificate(DocumentType)` - Creates certificate directly
     - `getCertificateTemplate(DocumentType)` - Gets template info
     - `isSupported(DocumentType)` - Checks support

6. **Example Controller:**
   - `DocumentRequestControllerWithFactoryExample.java` - Shows how to use the factory

---

### **MODIFIED FILES:**

#### **DocumentRequestService.java**
   **Changes:**
   - Added `DocumentFactory documentFactory` field
   - Updated constructor to inject DocumentFactory
   - Added `generateCertificate(requestId)` method - Uses factory to create certificates
   - Added `getCertificateTemplate(documentType)` method - Gets template from factory
   - Added `isSupportedDocumentType(documentType)` method - Checks if type is supported

---

## 🔍 How It Works

### Factory Method Pattern Flow:

```
User requests Document (e.g., Barangay Clearance)
         ↓
DocumentFactory.createCertificate(DocumentType.BARANGAY_CLEARANCE)
         ↓
DocumentFactory decides which factory to use
         ↓
BarangayClearanceFactory.createCertificate()
         ↓
Returns new BarangayClearanceCertificate instance
         ↓
Certificate populated with data
         ↓
Certificate.generateContent() creates formatted output
         ↓
User receives formatted certificate
```

### Code Example:

**Before Factory Pattern (❌ NOT RECOMMENDED):**
```java
if (documentType == DocumentType.BARANGAY_CLEARANCE) {
    cert = new BarangayClearanceCertificate();
} else if (documentType == DocumentType.CERTIFICATE_OF_INDIGENCY) {
    cert = new CertificateOfIndigencyCertificate();
} else if (documentType == DocumentType.CERTIFICATE_OF_RESIDENCY) {
    cert = new CertificateOfResidencyCertificate();
}
// ... and so on - CHANGES needed every time new type added
```

**After Factory Pattern (✅ RECOMMENDED):**
```java
// FACTORY METHOD: Clean one-liner
Certificate cert = documentFactory.createCertificate(documentType);

// Factory handles everything - no if-else chains
// Easy to add new types - just add new factory class
```

---

## ✨ Benefits

| Benefit | Explanation |
|---------|-------------|
| **No If-Else Chains** | Factory decides, not scattered conditions |
| **Open/Closed Principle** | Open to new types, closed to modification |
| **Easy to Extend** | Add new doc types without changing existing code |
| **Centralized Logic** | All creation logic in one place |
| **Type Safety** | Each certificate has its own validation |
| **Template Flexibility** | Each certificate has custom format |

---

## 📝 Adding New Certificate Types

### To add a new document type (e.g., "Business Permit"):

**Step 1: Create Certificate Class**
```java
public class BusinessPermitCertificate extends Certificate {
    public BusinessPermitCertificate() {
        super(DocumentType.BUSINESS_PERMIT);
        this.expirationDate = LocalDateTime.now().plus(1, ChronoUnit.YEARS);
    }
    
    @Override
    public String generateContent() {
        // Custom format for business permit
    }
    
    @Override
    public boolean isValid() {
        // Validation logic
    }
}
```

**Step 2: Create Factory Class**
```java
public class BusinessPermitFactory implements CertificateFactory {
    @Override
    public Certificate createCertificate() {
        return new BusinessPermitCertificate();
    }
    
    @Override
    public DocumentType getDocumentType() {
        return DocumentType.BUSINESS_PERMIT;
    }
    
    @Override
    public String getCertificateTemplate() {
        return "BUSINESS PERMIT - Official Authorization";
    }
}
```

**Step 3: Update DocumentFactory**
```java
@Override
public CertificateFactory getFactory(DocumentType documentType) {
    switch (documentType) {
        // ... existing cases ...
        case BUSINESS_PERMIT:
            return new BusinessPermitFactory();  // ADD THIS
        default:
            throw new IllegalArgumentException(...);
    }
}
```

**That's it! No other code needs changes** ✨

---

## 📊 Files Structure After Implementation

```
backend/src/main/java/edu/cit/ortizano/BrgyGO/
├── factory/
│   ├── CertificateFactory.java ✨ NEW (Interface)
│   ├── Certificate.java ✨ NEW (Abstract)
│   ├── BarangayClearanceCertificate.java ✨ NEW
│   ├── CertificateOfIndigencyCertificate.java ✨ NEW
│   ├── CertificateOfResidencyCertificate.java ✨ NEW
│   ├── BarangayIDCertificate.java ✨ NEW
│   ├── BarangayClearanceFactory.java ✨ NEW
│   ├── CertificateOfIndigencyFactory.java ✨ NEW
│   ├── CertificateOfResidencyFactory.java ✨ NEW
│   ├── BarangayIDFactory.java ✨ NEW
│   └── DocumentFactory.java ✨ NEW (Main Factory)
├── service/
│   ├── DocumentRequestService.java ✏️ MODIFIED
│   ├── PrintQueueManager.java (from Pattern #1)
│   └── ...
├── controller/
│   ├── DocumentRequestControllerWithFactoryExample.java ✨ REFERENCE
│   └── ...
└── ...
```

---

## 🧪 Testing the Factory

### Example API Calls:

```bash
# 1. Get supported certificate types
curl -X GET http://localhost:8080/api/documents/supported-types

# Response:
{
  "message": "Available certificate types",
  "count": 4,
  "types": [
    {
      "type": "BARANGAY_CLEARANCE",
      "displayName": "Barangay Clearance",
      "template": "BARANGAY CLEARANCE - Certification of Good Moral Character"
    },
    // ... other types
  ]
}

# 2. Get certificate template
curl -X GET http://localhost:8080/api/documents/certificate-template/BARANGAY_CLEARANCE

# Response:
{
  "documentType": "Barangay Clearance",
  "template": "BARANGAY CLEARANCE - Certification of Good Moral Character",
  "isSupported": true
}

# 3. Generate certificate for a request
curl -X POST http://localhost:8080/api/documents/1/generate-certificate

# Response:
{
  "message": "Certificate generated successfully",
  "certificateType": "Barangay Clearance",
  "certificationNumber": "CERT-1712500800000",
  "residentName": "John Doe",
  "address": "123 Main Street",
  "content": "═════════════════════════════════...",
  "issuedDate": "2026-04-08T13:00:00",
  "expirationDate": "2027-04-08T13:00:00"
}
```

---

## 📚 Key Concepts

### What is Factory Method?
A creational pattern where object creation is delegated to a factory method instead of creating objects directly. The factory decides which concrete class to instantiate.

### Real-world analogy:
Like a car assembly line that can produce different car models. You request a model, the factory decides the production process, and the car comes out.

### When to use:
- Multiple related classes need to be created
- Subclasses decide which class to instantiate
- Adding new types happens frequently
- Want to avoid if-else chains

---

## 🎯 Summary

**Pattern #2 Status: ✅ COMPLETE**

| Metric | Count |
|--------|-------|
| New Files | 11 |
| Modified Files | 1 |
| Lines Added | ~900 |
| New Methods | 3 |
| New Endpoints | 3 |
| Certificate Types | 4 |

**Achievements:**
✅ Clean certificate creation without if-else chains
✅ Easy to add new certificate types
✅ Each certificate has custom format
✅ Factory validates document support
✅ Comprehensive example usage

---

## 🚀 Next Steps

Ready for **Pattern #3: Strategy Pattern**?

The Strategy Pattern will implement:
- **Fee Calculation Strategies:**
  - Regular Resident Fee (standard price)
  - Senior Citizen Fee (50% discount)
  - Non-Resident Fee (higher price)
  
This avoids if-else chains and makes fee calculation flexible and extensible.

**Ready to proceed?** 🎯

---

**Pattern #2: ✅ FACTORY METHOD - COMPLETE**
