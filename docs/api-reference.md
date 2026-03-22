# DPMS API Reference

Complete API reference for the Discretionary Powers Management System. All endpoints are under the `/api` path prefix.

Base URL: `http://localhost:5000/api`

## Authentication

All endpoints require a JWT Bearer token in the `Authorization` header unless marked as **Public**.

```
Authorization: Bearer <token>
```

Errors follow the RFC 7807 Problem Details format.

---

## Auth

### POST /api/auth/login

Authenticate a user and receive a JWT token.

**Auth**: Public

**Request body**:

```json
{
  "email": "minister@gov.vg",
  "password": "password"
}
```

**Response** `200 OK`:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "minister@gov.vg",
    "name": "Hon. Minister",
    "role": "minister",
    "ministryId": "660e8400-e29b-41d4-a716-446655440001",
    "ministryName": "Ministry of Finance",
    "active": true,
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z"
  }
}
```

**Errors**:
- `401 Unauthorized` -- Invalid email or password, or account deactivated

---

### GET /api/auth/me

Get the currently authenticated user's profile.

**Auth**: Required

**Response** `200 OK`:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "minister@gov.vg",
  "name": "Hon. Minister",
  "role": "minister",
  "ministryId": "660e8400-e29b-41d4-a716-446655440001"
}
```

---

## Decisions

### POST /api/decisions

Create a new decision.

**Auth**: Required (CanCreateDecision policy)

**Request body**:

```json
{
  "title": "Licensing Application for XYZ Corp",
  "description": "Review of business licensing application submitted by XYZ Corp.",
  "ministryId": "660e8400-e29b-41d4-a716-446655440001",
  "decisionType": "licensing",
  "deadline": "2026-04-30T00:00:00Z"
}
```

**Response** `201 Created`:

```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "referenceNumber": "DPMS-2026-0042",
  "title": "Licensing Application for XYZ Corp",
  "description": "Review of business licensing application submitted by XYZ Corp.",
  "status": "draft",
  "decisionType": "licensing",
  "ministryId": "660e8400-e29b-41d4-a716-446655440001",
  "deadline": "2026-04-30T00:00:00Z",
  "currentStep": 1,
  "createdAt": "2026-03-22T10:30:00Z",
  "updatedAt": "2026-03-22T10:30:00Z"
}
```

**Errors**:
- `400 Bad Request` -- Validation error
- `403 Forbidden` -- Insufficient permissions

---

### GET /api/decisions

List decisions with filtering and pagination.

**Auth**: Required

**Query parameters**:

| Parameter  | Type   | Description                              |
| ---------- | ------ | ---------------------------------------- |
| `limit`    | int    | Number of results (default: 20)          |
| `offset`   | int    | Pagination offset (default: 0)           |
| `status`   | string | Filter by status                         |
| `ministryId` | guid | Filter by ministry                       |
| `type`     | string | Filter by decision type                  |

**Response** `200 OK`:

```json
{
  "items": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "referenceNumber": "DPMS-2026-0042",
      "title": "Licensing Application for XYZ Corp",
      "status": "in_progress",
      "decisionType": "licensing",
      "currentStep": 3,
      "deadline": "2026-04-30T00:00:00Z",
      "createdAt": "2026-03-22T10:30:00Z"
    }
  ],
  "total": 42,
  "limit": 20,
  "offset": 0
}
```

---

### GET /api/decisions/{id}

Get a single decision by ID.

**Auth**: Required

**Response** `200 OK`: Full decision object including steps.

**Errors**:
- `404 Not Found` -- Decision does not exist

---

### POST /api/decisions/{id}/advance-step

Complete or skip a workflow step.

**Auth**: Required

**Request body**:

```json
{
  "stepNumber": 1,
  "action": "complete",
  "notes": "Authority confirmed under Section 12 of the Business Licensing Act.",
  "data": {
    "statutoryProvision": "Business Licensing Act, Section 12"
  },
  "skipReason": null
}
```

The `action` field accepts:
- `"complete"` -- mark the step as completed
- `"skip"` -- skip the step (requires `skipReason`)

**Response** `200 OK`: Updated decision object.

**Errors**:
- `400 Bad Request` -- Invalid step number, missing required fields, or invalid action

---

### POST /api/decisions/{id}/approve

Approve a decision that has completed all 10 steps.

**Auth**: Required (CanApproveDecision policy -- Minister only)

**Request body**:

```json
{
  "notes": "Reviewed and approved. All procedural requirements satisfied."
}
```

**Response** `200 OK`:

```json
{
  "success": true
}
```

**Errors**:
- `400 Bad Request` -- Decision is not in Under Review status
- `403 Forbidden` -- Only Ministers can approve

---

### POST /api/decisions/{id}/publish

Publish an approved decision to the public portal.

**Auth**: Required (CanApproveDecision policy -- Minister only)

**Response** `200 OK`:

```json
{
  "success": true
}
```

**Errors**:
- `400 Bad Request` -- Decision is not in Approved status
- `403 Forbidden` -- Only Ministers can publish

---

### POST /api/decisions/{id}/flag-for-review

Flag a decision for judicial review.

**Auth**: Required (CanFlagForReview policy)

**Request body**:

```json
{
  "ground": "illegality",
  "notes": "The decision-maker exceeded their statutory authority under Section 12."
}
```

**Response** `200 OK`: Updated decision with challenged status.

**Errors**:
- `400 Bad Request` -- Invalid ground or decision cannot be flagged

---

### GET /api/decisions/stats

Get aggregate decision statistics.

**Auth**: Required

**Response** `200 OK`:

```json
{
  "total": 142,
  "draft": 12,
  "inProgress": 45,
  "underReview": 8,
  "approved": 30,
  "published": 40,
  "challenged": 5,
  "withdrawn": 2,
  "overdue": 7
}
```

---

### GET /api/decisions/public

List published decisions for the public transparency portal.

**Auth**: Public

**Response** `200 OK`: Array of published decisions with redacted document references.

---

### GET /api/decisions/public/{id}

Get a single published decision for public viewing.

**Auth**: Public

**Response** `200 OK`: Public decision details.

**Errors**:
- `404 Not Found` -- Decision not found or not published

---

### GET /api/decisions/{id}/export

Export a decision in the specified format.

**Auth**: Required

**Query parameters**:

| Parameter | Type   | Description                          |
| --------- | ------ | ------------------------------------ |
| `format`  | string | `json`, `csv`, or `html` (default: `json`) |

**Response**: File download with appropriate Content-Type header.

**Errors**:
- `400 Bad Request` -- Unsupported format

---

## Documents

### POST /api/documents/upload-url

Request a pre-signed upload URL for document upload.

**Auth**: Required

**Request body**:

```json
{
  "decisionId": "770e8400-e29b-41d4-a716-446655440002",
  "filename": "business-license-application.pdf",
  "contentType": "application/pdf",
  "classification": "evidence"
}
```

Classification values: `evidence`, `legalOpinion`, `correspondence`, `publicNotice`, `internalMemo`

**Response** `200 OK`:

```json
{
  "documentId": "880e8400-e29b-41d4-a716-446655440003",
  "uploadUrl": "http://localhost:9000/documents/...",
  "expiresAt": "2026-03-22T11:00:00Z"
}
```

---

### POST /api/documents/{documentId}/confirm-upload

Confirm that a document upload has completed.

**Auth**: Required

**Request body**:

```json
{
  "sizeBytes": 245760
}
```

**Response** `200 OK`: Document details including `decisionId`.

---

### GET /api/documents

List documents for a decision.

**Auth**: Required

**Query parameters**:

| Parameter    | Type | Description            |
| ------------ | ---- | ---------------------- |
| `decisionId` | guid | Required. Decision ID  |

**Response** `200 OK`: Array of document objects.

---

### GET /api/documents/{documentId}/download-url

Get a pre-signed download URL for a document.

**Auth**: Required

**Response** `200 OK`:

```json
{
  "downloadUrl": "http://localhost:9000/documents/...",
  "expiresAt": "2026-03-22T11:00:00Z"
}
```

**Errors**:
- `404 Not Found` -- Document does not exist

---

### DELETE /api/documents/{documentId}

Delete a document.

**Auth**: Required

**Response** `200 OK`:

```json
{
  "success": true
}
```

**Errors**:
- `404 Not Found` -- Document does not exist

---

### PUT /api/documents/{documentId}/redact

Mark a document as redacted for public release.

**Auth**: Required (CanRedactDocument policy)

**Request body**:

```json
{
  "isRedacted": true,
  "redactionNotes": "Personal information redacted under Data Protection Act."
}
```

**Response** `200 OK`:

```json
{
  "success": true
}
```

**Errors**:
- `404 Not Found` -- Document does not exist
- `403 Forbidden` -- Insufficient permissions

---

## Comments

### POST /api/comments

Create a comment on a decision.

**Auth**: Required

**Request body**:

```json
{
  "decisionId": "770e8400-e29b-41d4-a716-446655440002",
  "content": "Legal review completed. No issues found.",
  "isInternal": true
}
```

**Response** `200 OK`: Comment object with id, author details, and timestamps.

---

### GET /api/comments

List comments for a decision.

**Auth**: Required

**Query parameters**:

| Parameter    | Type | Description           |
| ------------ | ---- | --------------------- |
| `decisionId` | guid | Required. Decision ID |

Internal comments are excluded for users with the Public role.

**Response** `200 OK`: Array of comment objects.

---

### GET /api/comments/count

Get the comment count for a decision.

**Auth**: Required

**Query parameters**:

| Parameter    | Type | Description           |
| ------------ | ---- | --------------------- |
| `decisionId` | guid | Required. Decision ID |

**Response** `200 OK`:

```json
{
  "count": 5
}
```

---

### DELETE /api/comments/{id}

Delete a comment. Users can delete their own comments. Permanent Secretaries can delete any comment.

**Auth**: Required

**Response** `200 OK`:

```json
{
  "success": true
}
```

**Errors**:
- `404 Not Found` -- Comment does not exist
- `403 Forbidden` -- Cannot delete another user's comment

---

## Notifications

### GET /api/notifications

List notifications for the current user.

**Auth**: Required

**Query parameters**:

| Parameter | Type | Description                     |
| --------- | ---- | ------------------------------- |
| `limit`   | int  | Number of results (default: 20) |
| `offset`  | int  | Pagination offset (default: 0)  |

**Response** `200 OK`: Array of notification objects.

---

### GET /api/notifications/unread-count

Get the unread notification count for the current user.

**Auth**: Required

**Response** `200 OK`:

```json
{
  "count": 3
}
```

---

### PUT /api/notifications/{id}/read

Mark a single notification as read.

**Auth**: Required

**Response** `200 OK`:

```json
{
  "success": true
}
```

---

### PUT /api/notifications/read-all

Mark all notifications as read for the current user.

**Auth**: Required

**Response** `200 OK`:

```json
{
  "success": true
}
```

---

### DELETE /api/notifications/{id}

Delete a notification.

**Auth**: Required

**Response** `200 OK`:

```json
{
  "success": true
}
```

---

## Users

### GET /api/users

List all users.

**Auth**: Required (CanManageUsers policy)

**Query parameters**:

| Parameter    | Type   | Description           |
| ------------ | ------ | --------------------- |
| `ministryId` | guid   | Filter by ministry    |
| `role`       | string | Filter by role        |

**Response** `200 OK`: Array of user objects.

---

### GET /api/users/{id}

Get a user by ID.

**Auth**: Required

**Response** `200 OK`:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "minister@gov.vg",
  "name": "Hon. Minister",
  "role": "minister",
  "ministryId": "660e8400-e29b-41d4-a716-446655440001",
  "ministryName": "Ministry of Finance",
  "active": true,
  "createdAt": "2026-01-15T10:00:00Z",
  "updatedAt": "2026-01-15T10:00:00Z"
}
```

**Errors**:
- `404 Not Found` -- User does not exist

---

### POST /api/users

Create a new user.

**Auth**: Required (CanManageUsers policy)

**Request body**:

```json
{
  "email": "newuser@gov.vg",
  "name": "Jane Smith",
  "password": "securepassword123",
  "role": "legaladvisor",
  "ministryId": "660e8400-e29b-41d4-a716-446655440001"
}
```

**Response** `201 Created`: User object.

**Errors**:
- `400 Bad Request` -- Invalid role
- `409 Conflict` -- Email already exists

---

### PUT /api/users/{id}

Update a user's details.

**Auth**: Required (CanManageUsers policy)

**Request body** (all fields optional):

```json
{
  "name": "Jane Smith-Jones",
  "email": "jane.smith@gov.vg",
  "role": "permanentsecretary",
  "ministryId": "660e8400-e29b-41d4-a716-446655440001",
  "active": true
}
```

**Response** `200 OK`: Updated user object.

---

### POST /api/users/{id}/deactivate

Deactivate a user account. The user will no longer be able to log in.

**Auth**: Required (CanManageUsers policy)

**Response** `200 OK`:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "active": false
}
```

---

## Ministries

### GET /api/ministries

List all active ministries.

**Auth**: Required

**Response** `200 OK`:

```json
[
  {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "name": "Ministry of Finance",
    "code": "MOF",
    "active": true,
    "createdAt": "2026-01-01T00:00:00Z",
    "updatedAt": "2026-01-01T00:00:00Z"
  }
]
```

---

### GET /api/ministries/{id}

Get a ministry by ID.

**Auth**: Required

**Errors**:
- `404 Not Found` -- Ministry does not exist

---

### POST /api/ministries

Create a new ministry.

**Auth**: Required (CanManageUsers policy)

**Request body**:

```json
{
  "name": "Ministry of Health",
  "code": "MOH"
}
```

**Response** `201 Created`: Ministry object.

---

### PUT /api/ministries/{id}

Update a ministry.

**Auth**: Required (CanManageUsers policy)

**Request body** (all fields optional):

```json
{
  "name": "Ministry of Health and Social Development",
  "code": "MOHSD",
  "active": true
}
```

**Response** `200 OK`: Updated ministry object.

---

## Audit

### GET /api/audit/decisions/{decisionId}

Get audit trail entries for a specific decision.

**Auth**: Required (CanViewAuditTrail policy)

**Query parameters**:

| Parameter | Type | Description                     |
| --------- | ---- | ------------------------------- |
| `limit`   | int  | Number of results (default: 50) |
| `offset`  | int  | Pagination offset (default: 0)  |

**Response** `200 OK`: Array of audit entry objects with cryptographic chain hashes.

---

### GET /api/audit

Get all audit trail entries across all decisions.

**Auth**: Required (CanViewAllAudit policy)

**Query parameters**: Same as above.

---

### POST /api/audit/verify-chain

Verify the integrity of the cryptographic audit chain.

**Auth**: Required (CanViewAllAudit policy)

**Response** `200 OK`:

```json
{
  "valid": true,
  "checkedCount": 1523,
  "firstInvalidId": null
}
```

---

## Search

### GET /api/search

Search across decisions and documents.

**Auth**: Required

**Query parameters**:

| Parameter | Type   | Description                                   |
| --------- | ------ | --------------------------------------------- |
| `q`       | string | Search query                                  |
| `type`    | string | `all`, `decisions`, or `documents` (default: `all`) |
| `limit`   | int    | Max results per type (default: 20, max: 50)   |

**Response** `200 OK`:

```json
{
  "decisions": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "referenceNumber": "DPMS-2026-0042",
      "title": "Licensing Application for XYZ Corp",
      "status": "in_progress"
    }
  ],
  "documents": [
    {
      "id": "880e8400-e29b-41d4-a716-446655440003",
      "filename": "business-license-application.pdf",
      "classification": "evidence",
      "decisionId": "770e8400-e29b-41d4-a716-446655440002"
    }
  ]
}
```

---

## Statistics

### GET /api/statistics/public

Get public statistics about decisions.

**Auth**: Public

**Response** `200 OK`: Same format as `GET /api/decisions/stats`.

---

## Health

### GET /api/health

Health check endpoint.

**Auth**: Public

**Response** `200 OK`:

```json
{
  "status": "healthy",
  "timestamp": "2026-03-22T12:00:00Z"
}
```
