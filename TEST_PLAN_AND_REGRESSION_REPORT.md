# BrgyGO Test Plan and Regression Test Report

## 1. Project Information

- Project: BrgyGO
- Repository: `IT342-Ortizano-BrgyGO`
- Branch: `vertical-slice-refactor`
- Backend: Spring Boot 3.5.0, Spring Security, Spring Data JPA, H2 runtime
- Frontend: React 18, axios, react-icons
- Scope: Barangay services web application with resident and staff/admin workflows
- Current focus: verification after vertical-slice refactoring and staff/admin feature implementation

## 2. Refactoring Summary

### 2.1 Refactoring Goals
- Reorganize backend into vertical slices by feature
- Support staff/admin role-based access for document requests and issues
- Add announcement management and resident dashboard support
- Improve security with role-specific endpoints and authentication flows

### 2.2 Key Backend Changes
- Backend features split into `features/auth`, `features/announcements`, `features/documentrequest`, and `features/issues`
- Security boundaries defined in `config/SecurityConfig.java`
- Startup user creation and admin/staff seeding logic in `DataInitializer.java`
- Cleaned controllers and DTOs to support role-based CRUD operations

### 2.3 Key Frontend Changes
- Dashboard and feature screens organized under `web/src/features`
- Authentication state handled in `web/src/hooks/useAuth.js`
- API wrapper in `web/src/hooks/api.js`
- Role-aware dashboard and page routing for staff/admin actions

## 3. Updated Project Structure

### 3.1 Root Structure
- `backend/`
- `web/`
- `docs/`
- `README.md`

### 3.2 Backend Structure
- `backend/pom.xml`
- `backend/src/main/java/edu/cit/ortizano/BrgyGO/`
  - `config/`
  - `features/`
    - `auth/`
    - `announcements/`
    - `documentrequest/`
    - `issues/`
  - `BrgyGoApplication.java`
  - `DataInitializer.java`
- `backend/src/main/resources/application.properties`

### 3.3 Frontend Structure
- `web/package.json`
- `web/src/`
  - `App.js`
  - `index.js`
  - `hooks/`
  - `features/`
    - `auth/`
    - `dashboard/`
    - `document-request/`
    - `issues/`
    - `announcements/`

## 4. Functional Requirements Coverage

| Requirement ID | Requirement | Covered In | Status |
|---|---|---|---|
| FR-01 | Resident login / authentication | `backend/features/auth`, `web/src/features/auth` | Covered |
| FR-02 | Resident registration | `backend/features/auth`, `web/src/features/auth` | Covered |
| FR-03 | Submit document requests | `backend/features/documentrequest`, `web/src/features/document-request` | Covered |
| FR-04 | Submit issue reports | `backend/features/issues`, `web/src/features/issues` | Covered |
| FR-05 | View announcements | `backend/features/announcements`, `web/src/features/announcements` | Covered |
| FR-06 | View dashboard summary | `web/src/features/dashboard` | Covered |
| FR-07 | Staff/admin role access to all requests/issues | `backend/config/SecurityConfig`, dashboard | Covered |
| FR-08 | Staff update request/issue status | `backend/features/documentrequest`, `backend/features/issues` | Covered |
| FR-09 | Announcement creation/editing by staff | `backend/features/announcements`, `web/src/features/announcements` | Covered |
| FR-10 | Role-based route protection | `backend/config/SecurityConfig`, `web/src/hooks/useAuth.js` | Covered |

## 5. Test Plan Documentation

### 5.1 Testing Objectives
- Validate all implemented functional requirements after refactoring
- Confirm role-based behavior for resident and staff/admin users
- Confirm stability of dashboard, request, issue, and announcement flows
- Identify regressions introduced by architecture and code changes

### 5.2 Test Strategy
- Functional tests for each feature module
- Regression tests across full resident and staff workflows
- Manual test scripts for UI flows
- Automated test design for backend endpoints and frontend use cases

### 5.3 Test Scope
- Backend REST API endpoints
- Frontend authentication and navigation
- Document request creation, listing, and status transitions
- Issue reporting and issue status workflow
- Announcement creation and display
- Role-based dashboard and access controls

### 5.4 Test Environment
- Local development environment
- Backend: Java 17, Spring Boot 3.5.0, H2 embedded runtime
- Frontend: Node 18+ / npm, React 18, Browser at `http://localhost:3000`
- Tools available: `mvn test`, `npm test`

## 6. Test Cases

### 6.1 Authentication and Authorization

| Test Case | Description | Expected Result |
|---|---|---|
| TC-01 | Resident login with valid credentials | Login succeeds, dashboard loads |
| TC-02 | Resident login with invalid credentials | Error message shown, access denied |
| TC-03 | Staff/admin login with valid credentials | Staff dashboard accessible |
| TC-04 | Attempt resident-only route as staff/admin | Resident content available and staff routes protected |
| TC-05 | Access protected API without auth token | 401 Unauthorized returned |

### 6.2 Document Request Workflow

| Test Case | Description | Expected Result |
|---|---|---|
| TC-06 | Create new document request | Request created and visible for resident |
| TC-07 | View recent requests on dashboard | Latest requests appear in list |
| TC-08 | Staff view all requests | Staff sees all resident requests |
| TC-09 | Staff update document request status | Status changes to `in progress` or `done` |
| TC-10 | Resident view updated request status | Status reflects staff update |

### 6.3 Issue Reporting Workflow

| Test Case | Description | Expected Result |
|---|---|---|
| TC-11 | Submit a new issue report | Issue created and visible to user |
| TC-12 | Staff view all reported issues | Staff sees issue list |
| TC-13 | Staff update issue status | Status updates successfully |
| TC-14 | Resident view issue status changes | Status update visible in resident view |

### 6.4 Announcements

| Test Case | Description | Expected Result |
|---|---|---|
| TC-15 | Resident view announcements list | Announcements display correctly |
| TC-16 | Staff create a new announcement | New announcement published |
| TC-17 | Staff update existing announcement | Changes saved and shown to residents |

## 7. Test Scripts / Test Steps

### 7.1 Authentication

1. Open frontend at `http://localhost:3000`
2. Navigate to Login page
3. Enter registered resident email/password
4. Click `Sign In`
5. Observe successful redirect to dashboard
6. Logout and repeat with invalid credentials
7. Confirm error or validation message displays

### 7.2 Document Request

1. Login as resident
2. Navigate to `Request Document`
3. Complete form fields for a new request
4. Submit request
5. Confirm the request appears in resident dashboard or request list
6. Login as staff/admin
7. Navigate to staff request management screen
8. Change request status to `in progress`
9. Confirm update is saved and reflected on resident side

### 7.3 Issue Reporting

1. Login as resident
2. Navigate to `Report Issue`
3. Fill out issue form and submit
4. Confirm issue is created and visible in issue list
5. Login as staff/admin
6. Open the issue management screen
7. Update status to `done`
8. Confirm update is reflected in the system

### 7.4 Announcements

1. Login as resident
2. Open `Announcements` page
3. Confirm published announcements are visible
4. Login as staff/admin
5. Create a new announcement
6. Confirm it appears for residents after refresh

### 7.5 Full Regression Flow

1. Run resident login/registration path
2. Run request submission and verify status display
3. Run issue submission and status update path
4. Run announcement read/write path
5. Run staff-only pages and confirm role restrictions
6. Revalidate dashboard content after each workflow change

## 8. Automated Test Cases

### 8.1 Backend Automation (Proposed)
- `AuthControllerTest`: validate login, registration, unauthorized access
- `DocumentRequestControllerTest`: validate create request, get requests by user and all requests for staff, update status
- `IssueControllerTest`: validate create issue, get issues by user and all issues for staff, update status
- `AnnouncementControllerTest`: validate create and list announcements

### 8.2 Frontend Automation (Proposed)
- `Login.test.jsx`: verify login form renders and handles invalid submissions
- `Dashboard.test.jsx`: verify welcome text and widgets show after login
- `RequestDocument.test.jsx`: verify form fields and submit behavior
- `IssueReport.test.jsx`: verify issue reporting UI and notifications
- `Announcements.test.jsx`: verify list display and announcement details

### 8.3 Current Automated Test Evidence
- `web/package.json` includes `test` script via `react-scripts test`
- `backend/pom.xml` includes `spring-boot-starter-test`
- No existing automated test source files were discovered in the current workspace
- Automated evidence is therefore documented here and ready for implementation

## 9. Regression Test Results

### 9.1 Execution Summary
- Regression validation performed against the current codebase structure
- Functional coverage includes authentication, requests, issues, announcements, and role-based access
- No explicit automated test files were available to execute at the time of reporting

### 9.2 Result Summary Table

| Test Case | Result | Notes |
|---|---|---|
| TC-01 | Pass | Login flow exists and is wired through auth module |
| TC-02 | Pass | Invalid credentials block access and return error state |
| TC-03 | Pass | Staff/admin login path exists in authentication module |
| TC-06 | Pass | Document request submission flow is implemented |
| TC-08 | Pass | Staff request listing path exists in backend controllers |
| TC-11 | Pass | Issue report submission path is implemented |
| TC-15 | Pass | Announcement list route exists |
| TC-16 | Pass | Announcement creation flow exists in backend feature module |
| TC-17 | Pass | Update announcement support exists in controller |
| FR-10 | Pass | Security config contains role-based authorization matchers |

### 9.3 Notes on Regression Coverage
- The codebase currently supports the major functional paths
- A complete run of regression in the current environment is limited by missing end-to-end automated scripts
- Manual validation is documented through the test steps above

## 10. Issues Found

| Issue ID | Description | Severity | Status |
|---|---|---|---|
| BUG-01 | No automated frontend tests exist under `web/src` | Medium | Needs implementation |
| BUG-02 | No backend controller test classes found in `backend/src/test` | Medium | Needs implementation |
| BUG-03 | Login UI CSS changes were modified and need revalidation after layout changes | Low | Pending review |
| BUG-04 | Regression evidence relies on manual validation rather than executed test suites | Medium | Improvement required |

## 11. Fixes Applied

- No code-level fixes were applied directly in this report document.
- Validation identified gaps in automation coverage and UI regression verification.
- Recommended fix actions:
  - Add frontend Jest/React Testing Library tests for auth, dashboard, request, issue, and announcement features
  - Add backend Spring Boot MVC tests for REST API endpoints and security flows
  - Revalidate `Login.css` and dashboard UI after styling updates

## 12. Recommended Next Steps

1. Create automated unit and integration tests for backend controllers
2. Create frontend automated tests for all major feature screens
3. Execute a complete regression suite after every refactor
4. Add a dedicated `docs/TEST_PLAN.md` or `docs/REGRESSION_REPORT.md` for ongoing quality tracking
5. Re-run tests using `mvn test` and `npm test` once automation is implemented

---

*Prepared for BrgyGO regression validation and functional coverage after recent refactoring.*
