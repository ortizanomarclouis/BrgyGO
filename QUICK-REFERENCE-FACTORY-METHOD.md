# ⚡ Quick Reference - Factory Method Pattern Implementation

## What Was Done? ✅

### Pattern: **FACTORY METHOD** - Certificate Factory

**Problem Solved:** 
- Avoid if-else chains for creating different certificate types
- Easy to add new certificate types without changing existing code
- Each certificate has custom format and validation

**Solution:**
- One CertificateFactory interface with multiple implementations
- DocumentFactory coordinates all factory usage
- Each certificate type has its own factory class

---

## 11 Files Created ✨

### Interfaces & Base Classes:
1. **CertificateFactory.java** (Interface)
   - Contract for all factories
   - Methods: createCertificate(), getDocumentType(), getCertificateTemplate()

2. **Certificate.java** (Abstract Base)
   - Common properties for all certificates
   - Abstract methods: generateContent(), isValid()

### Concrete Certificates:
3. **BarangayClearanceCertificate.java** - Good moral certificate
4. **CertificateOfIndigencyCertificate.java** - Poverty certification
5. **CertificateOfResidencyCertificate.java** - Residency proof
6. **BarangayIDCertificate.java** - Official ID card

### Concrete Factories:
7. **BarangayClearanceFactory.java**
8. **CertificateOfIndigencyFactory.java**
9. **CertificateOfResidencyFactory.java**
10. **BarangayIDFactory.java**

### Main Factory:
11. **DocumentFactory.java** - Central factory coordinator

### Example:
12. **DocumentRequestControllerWithFactoryExample.java** - Shows usage

---

## Files Modified ✏️

### DocumentRequestService.java
```java
// ADDED FIELD
private final DocumentFactory documentFactory;

// ADDED METHODS
public Certificate generateCertificate(Long requestId) {
    // Uses factory to create appropriate certificate
    Certificate cert = documentFactory.createCertificate(documentType);
}

public String getCertificateTemplate(DocumentType documentType) {
    // Gets template from factory
}

public boolean isSupportedDocumentType(DocumentType documentType) {
    // Checks if factory supports type
}
```

---

## How It Works

**Factory decides which class to instantiate:**
```
DocumentFactory.createCertificate(DocumentType.BARANGAY_CLEARANCE)
         ↓
Returns BarangayClearanceFactory
         ↓
Creates BarangayClearanceCertificate
         ↓
User receives formatted certificate
```

---

## Usage Example

```java
// FACTORY METHOD - Clean one-liner
Document request → Document type: BARANGAY_CLEARANCE
                ↓
DocumentFactory.createCertificate(BARANGAY_CLEARANCE)
                ↓
BarangayClearanceCertificate created
                ↓
Certificate formatted and returned
```

---

## Key Improvements

| Before | After |
|--------|-------|
| ❌ If-else chains | ✅ Factory decides |
| ❌ Scattered code | ✅ Centralized |
| ❌ Hard to extend | ✅ Easy to extend |
| ❌ Mixed concerns | ✅ Separated concerns |

---

## Adding New Certificate Types

**Only 3 steps:**

1. Create new certificate class (extends Certificate)
2. Create new factory class (implements CertificateFactory)
3. Add case to DocumentFactory.getFactory()

**No other code changes needed!**

---

## New Endpoints

### Three new API endpoints added:

1. **POST /api/documents/{id}/generate-certificate**
   - Generates certificate for a request
   - Factory creates appropriate type

2. **GET /api/documents/certificate-template/{type}**
   - Shows template for each type
   - Factory provides template

3. **GET /api/documents/supported-types**
   - Lists available certificate types
   - Factory validates support

---

## Commit Summary

**Multiple commits recommended:**

```bash
# Commit 1: Add factory interface and base class
git add backend/src/main/java/edu/cit/ortizano/BrgyGO/factory/CertificateFactory.java
git add backend/src/main/java/edu/cit/ortizano/BrgyGO/factory/Certificate.java
git commit -m "feat(factory): Add CertificateFactory interface and Certificate base class"

# Commit 2: Add concrete certificate implementations
git add backend/src/main/java/edu/cit/ortizano/BrgyGO/factory/*Certificate.java
git commit -m "feat(factory): Add concrete certificate implementations

- BarangayClearanceCertificate
- CertificateOfIndigencyCertificate
- CertificateOfResidencyCertificate
- BarangayIDCertificate"

# Commit 3: Add concrete factory implementations
git add backend/src/main/java/edu/cit/ortizano/BrgyGO/factory/*Factory.java
git commit -m "feat(factory): Add concrete factory implementations

- BarangayClearanceFactory
- CertificateOfIndigencyFactory
- CertificateOfResidencyFactory
- BarangayIDFactory"

# Commit 4: Add main DocumentFactory
git add backend/src/main/java/edu/cit/ortizano/BrgyGO/factory/DocumentFactory.java
git commit -m "feat(factory): Add DocumentFactory - main factory coordinator

- Central factory for all certificate creation
- Eliminates if-else chains
- Easy to add new document types"

# Commit 5: Integrate factory into service
git add backend/src/main/java/edu/cit/ortizano/BrgyGO/service/DocumentRequestService.java
git commit -m "refactor(factory): Integrate DocumentFactory into DocumentRequestService

- Inject DocumentFactory
- Add generateCertificate() method
- Add getCertificateTemplate() method
- Add isSupportedDocumentType() method"

# Commit 6: Add example and documentation
git add backend/src/main/java/edu/cit/ortizano/BrgyGO/controller/DocumentRequestControllerWithFactoryExample.java
git add PATTERN-2-FACTORY-METHOD-IMPLEMENTATION.md
git commit -m "docs(factory): Add Factory Method example and comprehensive documentation"
```

---

## Status: ✅ Pattern #2 COMPLETE

**Statistics:**
- New Files: 11
- Modified Files: 1
- Lines Added: ~900
- Certificate Types: 4
- Breaking Changes: 0
- Backward Compatible: ✅ Yes

---

## Next Pattern: Strategy Pattern 🎯

**When ready**, implement Pattern #3:
- **Fee Calculator with different strategies**
  - Regular resident: standard fee
  - Senior citizen: 50% discount
  - Non-resident: higher fee
  
- eliminates if-else fee calculation
- Easy to add new fee types

---

## 📞 Quick Links

📄 Full documentation: `PATTERN-2-FACTORY-METHOD-IMPLEMENTATION.md`
📁 Factory files: `backend/src/main/java/.../factory/`
🎯 Example: `DocumentRequestControllerWithFactoryExample.java`

**Pattern #2: ✅ FACTORY METHOD - COMPLETE**
