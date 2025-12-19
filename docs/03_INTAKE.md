# Contract Intake & Legal Helpdesk

This document details the Legal Intake feature - a centralized portal for contract requests, document submissions, and legal helpdesk inquiries.

## Overview

### What is Legal Intake?

Legal Intake is a **self-service portal** that enables business users to interact with the legal team through three main channels:

1. **📤 Upload Documents** - Submit contracts and legal documents for review
2. **💬 Ask Helpdesk** - Get legal guidance on questions and issues
3. **📋 My Requests** - Track all submitted requests and their status

### Key Benefits

**For Business Users**:
- ✅ **Self-Service** - Submit requests without emails or meetings
- ✅ **Centralized** - One place for all legal interactions
- ✅ **Tracked** - Monitor request status in real-time
- ✅ **Fast** - Streamlined submission process
- ✅ **Organized** - Documents automatically routed to correct team

**For Legal Team**:
- ✅ **Prioritization** - See all requests in one queue
- ✅ **Automation** - Auto-categorization and routing
- ✅ **Visibility** - Track response times and workload
- ✅ **Integration** - Connects with CLM and repository
- ✅ **Audit Trail** - Complete history of all requests

### User Interface

The Intake page features **three tabs**:

```
┌─────────────────────────────────────────────┐
│ Legal Intake                                │
├─────────────────────────────────────────────┤
│ [Ask Helpdesk] [Upload Documents] [My Requests] │
├─────────────────────────────────────────────┤
│                                             │
│         [Tab Content Area]                  │
│                                             │
└─────────────────────────────────────────────┘
```

---

## Upload Documents

### Purpose

The **Upload Documents** tab enables users to submit contracts and legal documents for:
- Legal review and approval
- Contract lifecycle management (CLM)
- Repository storage
- Risk assessment
- Compliance checking

### Upload Process

#### Step 1: Select File

Users can upload files via:

**Drag & Drop**:
```
┌─────────────────────────────────────────┐
│                                         │
│         📤 Upload Icon                  │
│                                         │
│  Drop your file here or click to browse│
│                                         │
│     PDF, DOC, DOCX up to 50MB          │
│                                         │
└─────────────────────────────────────────┘
```

**Click to Browse**:
- Click anywhere in the upload area
- Select file from file picker
- Supports: `.pdf`, `.doc`, `.docx`

**File Size Limit**: 50 MB

---

#### Step 2: Select Destination

After file selection, choose the destination directory:

```
┌─────────────────────────────────────────────┐
│ Select Destination                          │
├─────────────────────────────────────────────┤
│                                             │
│ File: Supplier_Agreement_Acme.pdf           │
│ Size: 2,345 KB                             │
│                                             │
│ Select Directory *                          │
│ [▼ Legal                              ]     │
│   - Legal                                   │
│   - Procurement                             │
│   - HR                                      │
│   - Shared                                  │
│                                             │
│              [Cancel] [Upload to Legal →]   │
└─────────────────────────────────────────────┘
```

**Available Directories**:

1. **Legal** (default)
   - Standard legal contracts
   - NDAs, service agreements
   - Partnership agreements
   - General legal documents

2. **Procurement**
   - Supplier agreements
   - Purchase orders
   - Vendor contracts
   - Procurement-related documents

3. **HR**
   - Employment contracts
   - Offer letters
   - HR policies
   - Personnel agreements

4. **Shared**
   - Cross-functional documents
   - Templates
   - General resources
   - Collaborative documents

---

#### Step 3: Upload & Confirmation

During upload:
```
┌─────────────────────────────────────────────┐
│                                             │
│         🔄 Loading Spinner                  │
│                                             │
│       Uploading file...                     │
│                                             │
└─────────────────────────────────────────────┘
```

After successful upload:
```
┌─────────────────────────────────────────────┐
│ ✅ File Uploaded Successfully               │
├─────────────────────────────────────────────┤
│                                             │
│ 📄 Supplier_Agreement_Acme.pdf              │
│    2,345 KB • Uploaded at 10:30:45 AM      │
│                                             │
│ File URL:                                   │
│ https://storage.blob.azure.com/...          │
│                                             │
│     [Upload Another] [Create Request →]     │
└─────────────────────────────────────────────┘
```

---

#### Step 4: Create CLM Request

After upload, users can:

**Option 1: Create Request**
- Click "Create Request" button
- Document is submitted to legal team
- Request appears in "My Requests" tab
- Legal team is notified

**Option 2: Upload Another**
- Click "Upload Another" button
- Returns to upload interface
- Previous file remains uploaded

---

### Upload States

The upload interface has **5 states**:

1. **Initial State** - Drop zone visible
   ```tsx
   <Upload icon>
   Drop your file here or click to browse
   PDF, DOC, DOCX up to 50MB
   ```

2. **File Selected** - Destination selection
   ```tsx
   <FileText icon>
   Select Destination
   [Dropdown: Legal, Procurement, HR, Shared]
   [Cancel] [Upload]
   ```

3. **Uploading** - Progress indication
   ```tsx
   <Loader icon spinning>
   Uploading file...
   ```

4. **Upload Success** - Confirmation
   ```tsx
   <CheckCircle icon green>
   File Uploaded Successfully
   [File details and URL]
   [Upload Another] [Create Request]
   ```

5. **Upload Error** - Error handling
   ```tsx
   <AlertCircle icon red>
   Upload Failed
   [Error message]
   [Try Again]
   ```

---

### Technical Implementation

#### Frontend Upload Logic

```typescript
async function handleFileUpload(file: File, directory: DirectoryType) {
  if (!file) return;

  setUploading(true);
  setUploadError(null);
  setUploadedFile(null);

  const result = await apiClient.files.upload(file, directory);

  if (result.success && result.data) {
    setUploadedFile({
      name: file.name,
      size: file.size,
      url: result.data.url,
      uploadedAt: new Date(),
    });
    setUploading(false);
  } else {
    setUploadError(result.error || 'Upload failed. Please try again.');
    setUploading(false);
  }
}
```

#### Backend API Endpoint

**POST `/api/files/upload`**

Request (multipart/form-data):
```
file: [binary file data]
directory: "legal" | "procurement" | "hr" | "shared"
```

Response (200 OK):
```json
{
  "success": true,
  "data": {
    "url": "https://storage.blob.azure.com/legal-documents/legal/filename.pdf",
    "filename": "Supplier_Agreement_Acme.pdf",
    "size": 2345678,
    "mimeType": "application/pdf",
    "uploadedAt": "2024-12-19T10:30:45Z"
  },
  "message": "File uploaded successfully"
}
```

---

## Ask Legal Helpdesk

### Purpose

The **Ask Helpdesk** tab enables users to submit legal questions and receive guidance from the legal team without formal contract review.


### Question Submission Interface

```
┌─────────────────────────────────────────────────┐
│ Ask the Legal Helpdesk                          │
├─────────────────────────────────────────────────┤
│                                                 │
│ Submit questions to the legal team for guidance │
│ on contracts, compliance, or legal matters.     │
│                                                 │
│ Your Question *                                 │
│ ┌─────────────────────────────────────────────┐│
│ │ Example: What are the key clauses I should ││
│ │ review in a supplier agreement for the     ││
│ │ DACH region?                               ││
│ │                                            ││
│ │                                            ││
│ │                                            ││
│ └─────────────────────────────────────────────┘│
│                                                 │
│ Typical response time: 1-2 business days        │
│                                                 │
│                         [Submit Question →]     │
└─────────────────────────────────────────────────┘
```


## File Organization

### Directory Structure

Files uploaded via Intake are organized in Azure Blob Storage:

```
legal-documents/
├── legal/
│   ├── contracts/
│   ├── ndas/
│   ├── agreements/
│   └── misc/
├── procurement/
│   ├── supplier-contracts/
│   ├── purchase-orders/
│   └── vendor-agreements/
├── hr/
│   ├── employment-contracts/
│   ├── offer-letters/
│   └── policies/
└── shared/
    ├── templates/
    ├── resources/
    └── collaborative/
```

Each uploaded file stores metadata:

```json
{
  "file_id": "file-uuid",
  "original_name": "Supplier Agreement.pdf",
  "stored_name": "legal_Supplier_Agreement_20241219103045.pdf",
  "url": "https://storage.blob.azure.com/...",
  "size": 2345678,
  "mime_type": "application/pdf",
  "category": "legal",
  "uploaded_by": "user-uuid",
  "uploaded_at": "2024-12-19T10:30:45Z",
  "request_id": "request-uuid",
  "status": "pending_review"
}
```

