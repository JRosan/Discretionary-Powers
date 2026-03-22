# DPMS User Guide

Guide for government staff using the Discretionary Powers Management System (DPMS).

---

## Getting Started

### Logging In

1. Navigate to the DPMS portal (e.g., `https://dpms.gov.vg`)
2. Enter your government email address and password
3. Click **Sign In**

If you cannot log in, contact your system administrator to verify your account is active.

### Dashboard Overview

After logging in, the dashboard displays:

- **Statistics cards** -- total decisions, in-progress, overdue, and published counts
- **Recent decisions** -- the latest decisions you have access to
- **Overdue alerts** -- decisions that have passed their deadline without completion
- **Workflow progress** -- visual indicators of where decisions are in the 10-step process

### Navigation

The sidebar menu provides access to:

| Menu Item       | Description                                      |
| --------------- | ------------------------------------------------ |
| Dashboard       | Overview statistics and recent activity           |
| Decisions       | List, create, and manage decisions                |
| Reports         | Analytics and data export                         |
| Notifications   | View alerts and updates                           |
| User Management | Manage users and roles (Admin only)               |

---

## Creating a Decision

1. Click **New Decision** from the Decisions page or dashboard
2. Fill in the required fields:
   - **Title** -- a clear, descriptive name for the decision
   - **Description** -- detailed explanation of what the decision involves
   - **Ministry** -- select the responsible ministry
   - **Decision Type** -- choose one of: Regulatory, Licensing, Planning, Financial, Appointment, Policy, Enforcement, or Other
   - **Deadline** -- the date by which the decision must be completed
3. Click **Create**

The decision is created in **Draft** status at Step 1 of the workflow.

---

## The 10-Step Workflow

Every decision follows the BVI's 10-step framework for the lawful exercise of discretionary powers. Each step must be completed (or skipped with a documented reason) before the decision can be submitted for approval.

### Step 1: Confirm Authority

Verify that the decision-maker has the legal authority to make this decision.

- **Required**: Identify the statutory provision granting authority
- **Evidence**: Upload the relevant legislation or delegation instrument
- **Notes**: Explain the source and scope of authority

### Step 2: Follow Procedures

Confirm that all mandatory procedures have been identified and will be followed.

- **Required**: List the procedural requirements that apply
- **Evidence**: Reference any procedural guidelines or standing orders
- **Notes**: Document any procedural considerations

### Step 3: Gather Information

Collect all relevant information needed to make an informed decision.

- **Required**: Document what information has been gathered
- **Evidence**: Upload supporting documents, reports, or data
- **Notes**: Identify any gaps in information and how they were addressed

### Step 4: Evaluate Evidence

Assess the quality and relevance of the evidence collected.

- **Required**: Provide an evaluation of the evidence
- **Evidence**: Upload any expert opinions or assessments
- **Notes**: Document the weight given to different pieces of evidence

### Step 5: Standard of Proof

Determine and apply the appropriate standard of proof.

- **Required**: State the standard of proof being applied
- **Notes**: Explain why this standard is appropriate for this type of decision

### Step 6: Fairness

Ensure the decision is fair and free from bias.

- **Required**: Document consideration of fairness
- **Notes**: Address any potential conflicts of interest or bias

### Step 7: Procedural Fairness

Ensure affected parties have been given the opportunity to be heard.

- **Required**: Document how procedural fairness was provided
- **Evidence**: Upload any submissions received from affected parties
- **Notes**: Record how submissions were considered

### Step 8: Consider Merits

Make the decision based on the merits of the case.

- **Required**: Document the merits-based analysis
- **Notes**: Explain how the evidence supports the decision

### Step 9: Communicate

Communicate the decision to all affected parties.

- **Required**: Document how and when the decision was communicated
- **Evidence**: Upload copies of communications sent
- **Notes**: List all parties notified

### Step 10: Record

Ensure the decision and its reasoning are properly recorded.

- **Required**: Confirm that complete records have been created
- **Notes**: Summarise the decision and key reasons

### Navigating Between Steps

- Use the **Next** and **Previous** buttons to move between steps
- The step indicator at the top shows your progress through all 10 steps
- Steps can be completed in order or revisited at any time before submission
- To skip a step, select **Skip** and provide a mandatory skip reason

### Step Actions

For each step, you can:

- **Complete** -- mark the step as done after filling in the required fields
- **Skip** -- skip the step (requires a documented reason explaining why)
- **Save as draft** -- save your progress without completing the step

---

## Managing Documents

### Uploading Documents

1. Navigate to the decision's detail page
2. Go to the **Documents** section
3. Either drag and drop files or click **Upload** to use the file picker
4. Select a **classification** for each document:
   - **Evidence** -- supporting evidence for the decision
   - **Legal Opinion** -- legal advice or opinions
   - **Correspondence** -- letters, emails, or other communications
   - **Public Notice** -- notices published to the public
   - **Internal Memo** -- internal government communications

### Viewing and Downloading

- Click on any document to view its details
- Click **Download** to save a copy to your device

### Redacting Documents

Authorised users can redact documents before public release:

1. Select the document
2. Click **Redact**
3. Mark the document as redacted and provide redaction notes explaining what was removed and why
4. The redacted version will be used for any public-facing access

---

## Approving and Publishing

### Approval Process

Only users with the **Minister** role can approve and publish decisions.

1. The decision must have completed all 10 steps (status changes to **Under Review**)
2. The Minister reviews the complete decision record
3. Click **Approve** and optionally add approval notes
4. The decision status changes to **Approved**

### Publishing

After approval, the Minister can publish the decision:

1. From the approved decision, click **Publish**
2. The decision becomes visible on the **Public Portal**
3. The decision status changes to **Published**

Published decisions are accessible to the public at the transparency portal without authentication.

### Flagging for Review

Authorised users (e.g., Legal Advisors, Auditors) can flag a decision for judicial review:

1. Open the decision
2. Click **Flag for Review**
3. Select the review ground and provide notes
4. The decision status changes to **Challenged**

---

## Comments

### Adding Comments

1. Open a decision's detail page
2. Scroll to the **Comments** section
3. Type your comment in the text field
4. Choose visibility:
   - **Internal** -- visible only to authenticated government staff
   - **Public** -- visible to anyone, including on the public portal
5. Click **Post**

### Viewing Comments

Comments are displayed in chronological order. Internal comments are marked with an indicator and are only visible to staff users.

### Deleting Comments

You can delete your own comments. Permanent Secretaries can delete any comment.

---

## Reports and Analytics

### Dashboard Charts

The reports page provides visual analytics:

- **Decision volume over time** -- track how many decisions are being created
- **Status breakdown** -- see the distribution of decisions across statuses
- **Ministry breakdown** -- compare decision volumes by ministry
- **Workflow bottleneck analysis** -- identify which steps take the longest

### Filtering

Use the filter controls to narrow results by:

- Date range (start and end dates)
- Ministry
- Decision type
- Status

### Exporting Data

Export decision data in multiple formats:

1. Navigate to a decision or the reports page
2. Click **Export**
3. Choose a format:
   - **JSON** -- structured data for programmatic use
   - **CSV** -- spreadsheet-compatible format
   - **HTML** -- formatted report for printing or sharing

---

## Notifications

### In-App Notifications

- Click the **bell icon** in the top navigation bar to view notifications
- A badge shows the count of unread notifications
- Click a notification to navigate to the relevant decision
- Click **Mark All Read** to clear all unread indicators

### Notification Types

| Type            | Triggered When                                    |
| --------------- | ------------------------------------------------- |
| Assignment      | You are assigned to a decision                    |
| Approval Needed | A decision requires your approval                 |
| Overdue         | A decision has passed its deadline                |
| Status Change   | A decision's status has changed                   |
| Comment         | A new comment is posted on a decision you follow  |
| Judicial Review | A decision is flagged for judicial review         |

### Email Notifications

The system sends email notifications for important events. These are sent to the email address associated with your account.

---

## Search

### Global Search

- Press **Ctrl+K** (Windows) or **Cmd+K** (Mac) to open the search dialog
- Type your query to search across decisions and documents
- Results are grouped by type (decisions and documents)
- Click a result to navigate directly to it

### Search Filters

- **Decisions** -- searches titles, descriptions, and reference numbers
- **Documents** -- searches filenames

### Recent Searches

The search dialog remembers your recent searches for quick access.

---

## User Management (Admin)

User management is available to Permanent Secretaries and other admin-level roles.

### Viewing Users

Navigate to **User Management** to see all system users, filterable by ministry and role.

### Creating a New User

1. Click **Create User**
2. Fill in:
   - **Name** -- the user's full name
   - **Email** -- their government email address
   - **Password** -- initial password
   - **Role** -- one of: Minister, Permanent Secretary, Legal Advisor, Auditor
   - **Ministry** -- assign to a ministry
3. Click **Create**

### Roles

| Role                 | Permissions                                            |
| -------------------- | ------------------------------------------------------ |
| Minister             | Approve, publish decisions; full access                |
| Permanent Secretary  | Create decisions, manage users, view audit trails      |
| Legal Advisor        | Create decisions, flag for review, provide legal input |
| Auditor              | View all decisions and audit trails, flag for review   |

### Deactivating a User

1. Select the user from the user list
2. Click **Deactivate**
3. The user can no longer log in but their records are preserved

---

## Decision Statuses

| Status       | Meaning                                                  |
| ------------ | -------------------------------------------------------- |
| Draft        | Decision created, not yet started                        |
| In Progress  | At least one step has been started                       |
| Under Review | All 10 steps completed, awaiting approval                |
| Approved     | Approved by a Minister                                   |
| Published    | Published to the public transparency portal              |
| Challenged   | Flagged for judicial review                              |
| Withdrawn    | Decision has been withdrawn                              |
