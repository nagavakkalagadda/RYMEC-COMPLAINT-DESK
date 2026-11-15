# 🏛️ RYMEC GRIEVANCE DESK
### Official Institutional Grievance & Redressal Helpdesk Platform
**Institution:** Rao Bahadur Y. Mahabaleswarappa Engineering College (RYMEC), Ballari, Karnataka  
**Managed by:** Veerasaiva Vidyavardhaka (V.V.) Sangha, Ballari (Estd. 1980)  
**Accreditation:** NAAC A+ Grade • NBA Accredited Programs • Affiliated to VTU Belagavi • AICTE Approved  
**Live Production URL:** [https://rymec-complaint-desk.vercel.app](https://rymec-complaint-desk.vercel.app)  
**Repository:** [https://github.com/nagavakkalagadda/RYMEC-COMPLAINT-DESK](https://github.com/nagavakkalagadda/RYMEC-COMPLAINT-DESK)

---

## 📋 Table of Contents
1. [Executive Summary & Problem Statement](#-1-executive-summary--problem-statement)
2. [Complete System Block Diagram](#-2-complete-system-block-diagram)
3. [Grievance Lifecycle & Escalation Chain Diagram](#-3-grievance-lifecycle--escalation-chain-diagram)
4. [6-Digit Circular Orbit OTP Verification System (Component 89)](#-4-6-digit-circular-orbit-otp-verification-system)
5. [Forgot Password & Institutional Gmail Gateway](#-5-forgot-password--institutional-gmail-gateway)
6. [Core Technical Architecture & Tech Stack](#-6-core-technical-architecture--tech-stack)
7. [Six Multi-Tier User Roles & RBAC Matrix](#-7-six-multi-tier-user-roles--rbac-matrix)
8. [Intelligent Automated Triage & Safety Engines](#-8-intelligent-automated-triage--safety-engines)
9. [Apple iOS Liquid Glass & Pebble Design System](#-9-apple-ios-liquid-glass--pebble-design-system)
10. [Database Schema & Relational Architecture](#-10-database-schema--relational-architecture)
11. [REST API Endpoints Specification](#-11-rest-api-endpoints-specification)
12. [Installation & Local Deployment Guide](#-12-installation--local-deployment-guide)
13. [End-to-End Evaluation Walkthrough](#-13-end-to-end-evaluation-walkthrough)

---

## 🎯 1. Executive Summary & Problem Statement

In academic and residential engineering campuses, student grievances submitted through informal channels (verbal complaints, physical paper registers, unmonitored WhatsApp groups) suffer from:
* **Zero Real-Time Tracking:** Complainants have no visibility into who owns their issue or when it will be fixed.
* **Lack of Time-Bound Accountability:** Complaints often linger for weeks without enforceable resolution deadlines.
* **Fear of Victimization:** Students hesitate to report sensitive issues (ragging, hostel sanitation, lab issues, harassment) due to fear of exposure.
* **Departmental Silos:** Complaints sent to the wrong department are delayed or dropped without routing.

**RYMEC GRIEVANCE DESK** is a full-stack, enterprise-grade institutional grievance management platform. Built with an **Apple iOS Liquid Glass + Pebble UI**, it delivers guaranteed SLA turnaround tracking, cryptographic anonymous reporting, live Amazon/FedEx-style milestone tracking, systemic 5+ keyword trend alerts, automated Level-1 (HOD) and Level-2 (Principal) escalations, and a 6-digit circular curling orbit OTP verification system.

---

## 🧩 2. Complete System Block Diagram

```mermaid
graph TD
    subgraph Client Layer [Frontend Presentation Layer - React 18 + Vite + Tailwind CSS]
        UI[Apple Liquid Glass & Pebble UI]
        NAV[Floating Liquid Bottom Nav & Header]
        ORBIT[6-Digit Circular Orbit OTP Module]
        TRACK[Live Package-Style Milestone Tracker]
        WALL[Public Transparency Wall Feed]
        CHAT[Interactive Policy & FAQ Bot]
    end

    subgraph CDN & Edge Layer [Deployment Infrastructure]
        VCL[Vercel Serverless Platform]
        ROUTE[Path Rewriter /api/* -> Backend Functions]
    end

    subgraph Application Layer [Backend Microservices - Node.js + Express.js]
        AUTH[JWT Authentication & Role Middleware]
        OTP_ENGINE[Cryptographic 6-Digit OTP Generator & Validator]
        ROUTER[Department Auto-Router & Triage Engine]
        SLA[SLA Countdown & Auto-Escalation Engine]
        DUPE[Tokenized Jaccard Duplicate Detector]
        TREND[7-Day 5+ Systemic Pattern Detector]
        AUDIT[Immutable Event Audit Logger]
    end

    subgraph Data & Storage Layer
        DB[(PostgreSQL Database - Neon Cloud Serverless)]
        MEM[(Resilient In-Memory Fallback Cache)]
        UPLOADS[(Multer Encrypted File System)]
    end

    subgraph External Notification Gateway
        SMTP[Gmail SMTP Gateway: rymec.ismart12@gmail.com]
        QR_GEN[Dynamic QR Code SVG Generator]
    end

    UI --> ROUTE
    NAV --> ROUTE
    ORBIT --> ROUTE
    TRACK --> ROUTE
    WALL --> ROUTE
    CHAT --> ROUTE

    ROUTE --> VCL
    VCL --> AUTH
    VCL --> OTP_ENGINE
    VCL --> ROUTER
    VCL --> SLA
    VCL --> DUPE
    VCL --> TREND
    VCL --> AUDIT

    AUTH --> DB
    ROUTER --> DB
    SLA --> DB
    DUPE --> DB
    TREND --> DB
    AUDIT --> DB
    DB -.-> MEM

    OTP_ENGINE --> SMTP
    SLA --> SMTP
    ROUTER --> QR_GEN
    VCL --> UPLOADS
```

---

## 🔄 3. Grievance Lifecycle & Escalation Chain Diagram

```mermaid
sequenceDiagram
    autonumber
    actor S as Student / Complainant
    participant F as Frontend (Liquid Glass UI)
    participant B as Backend Triage API
    participant AI as NLP & Duplicate Engine
    participant DB as PostgreSQL (Neon Cloud)
    actor W as Warden / Lecturer (Level 0)
    actor H as HOD (Level 1 Escalation)
    actor P as Principal (Level 2 Escalation)

    S->>F: Submit Grievance (Title, Description, Evidence, Anon Flag)
    F->>AI: Evaluate Keywords & Jaccard Similarity
    alt Duplicate Detected (>65% similarity within 14d)
        AI-->>F: Display Existing Active Complaint Warning
    end
    AI->>B: Categorize (Hostel, Academic, Safety, Admin) & Calculate SLA (24h/72h/7d)
    B->>DB: Persist Complaint Record & Generate Tracking ID (GRV-2026-XXXXX)
    B-->>F: Return Tracking ID, Dynamic QR Code & Target Milestone
    F-->>S: Celebrate with Confetti & Provide Instant QR Tracking

    rect rgb(20, 30, 50)
        Note over B, W: Level 0: Standard Department Resolution Window
        B->>W: Assign to Responsible Officer Desk (e.g. Warden)
        alt Resolved within SLA
            W->>B: Submit Action-Taken Report & Mark Resolved
            B->>DB: Timestamp Resolution & Update Public Wall
            B-->>S: Notify Resolution (Invite 1-5 Star Rating)
        else SLA Deadline Breached (Exceeded Window)
            Note over B, H: Auto-Escalation Level 1
            B->>DB: Set is_escalated = true, escalation_level = 1
            B->>H: Push Overdue Alert to HOD Dashboard
        end
    end

    rect rgb(40, 20, 30)
        Note over B, P: Level 2: Executive Escalation
        alt HOD Resolves Complaint
            H->>B: Close with Administrative Sanction
        else Breaches Additional 48h Escalation Window
            B->>DB: Set escalation_level = 2 (Principal Jurisdiction)
            B->>P: Push Executive Overdue Ticket to Principal Desk
            P->>B: Executive Direct Resolution & Audit Log Commit
        end
    end

    opt Reopening Allowed (Max 2 times)
        S->>F: Unsatisfied with resolution? Click "Reopen Complaint"
        F->>B: Reopen with Required Written Justification
        B->>DB: Increment reopening_count, Reset Status to Under Review
    end
```

---

## 🌀 4. 6-Digit Circular Orbit OTP Verification System

Implemented directly from the viral **Component 89 (Gyre Architecture)** with zero external animation libraries (100% pure React + CSS transforms at 60 FPS):

```mermaid
stateDiagram-v2
    [*] --> HorizontalRow: Initial Focus on Box 0
    HorizontalRow --> TypingDigits: Numeric Keypress (0-9)
    TypingDigits --> AutoAdvance: Auto-advance to Index + 1
    AutoAdvance --> TypingDigits: Next Digit Entered
    AutoAdvance --> HorizontalRow: Backspace Navigation

    state "6th Digit Entered" as Complete
    TypingDigits --> Complete: All 6 Slots Filled

    state "Circular Curling & Orbit Transition" as CurlingState {
        Complete --> OrbitTrack: Transform Origin set to Hub (0,0)
        OrbitTrack --> DottedGuide: Position on Radius R=52px
        DottedGuide --> OrbitSpin: 360° Ring Spin (@keyframes otp-spin-ring)
        OrbitSpin --> CounterSpin: Digit Counter-Spin (@keyframes otp-counter-spin)
    }

    CurlingState --> BackendCall: POST /api/auth/verify-otp

    state "Verification Result" as Result
    BackendCall --> Result

    state "Success: Single Squircle Collapse" as SuccessFlow {
        Result --> NeonGreenGlow: All 6 Boxes Light Up (#2EE6A8)
        NeonGreenGlow --> InwardCollapse: Translate to (0,0) & Scale to 0.2
        InwardCollapse --> CenterSquircle: Single 56px Squircle Emerges
        CenterSquircle --> CheckmarkDraw: Animated SVG Checkmark Draws
        CheckmarkDraw --> FloatingParticles: 6 Green Particles Pulse
        FloatingParticles --> ContinueBadge: 'Verified and secure' + Continue
    }

    state "Failure: Shake & Reset" as FailureFlow {
        Result --> RadiantRed: All Boxes Flash (#FF4D6A)
        RadiantRed --> ShakeKeyframes: Horizontal Shake (@keyframes otp-error-shake)
        ShakeKeyframes --> UncurlToRow: Smooth Reversal back to Row
        UncurlToRow --> ClearAndFocus: Clear Digits & Focus Box 0
    }

    SuccessFlow --> [*]: Advance to Authenticated State
    FailureFlow --> HorizontalRow: Retry
```

### Key Mathematical & CSS Attributes
* **Dotted Guide Track:** `<svg><circle r="52" stroke-dasharray="2 8" stroke-width="1.5"/></svg>` with a physical center hub point dot.
* **Six Coordinate Offsets ($R=52\text{px}$):**
  * Box 0: $\Delta X = +120\text{px}, \Delta Y = -52\text{px}$ ($-90^\circ$ Top Center)
  * Box 1: $\Delta X = +117\text{px}, \Delta Y = -26\text{px}$ ($-30^\circ$ Top Right)
  * Box 2: $\Delta X = +21\text{px},  \Delta Y = +26\text{px}$ ($+30^\circ$ Bottom Right)
  * Box 3: $\Delta X = -24\text{px},  \Delta Y = +52\text{px}$ ($+90^\circ$ Bottom Center)
  * Box 4: $\Delta X = -117\text{px}, \Delta Y = +26\text{px}$ ($+150^\circ$ Bottom Left)
  * Box 5: $\Delta X = -165\text{px}, \Delta Y = -26\text{px}$ ($+210^\circ$ Top Left)
* **Real-Time Counter-Rotation:** While the outer ring rotates $0^\circ \rightarrow 360^\circ$, inner text spans rotate $0^\circ \rightarrow -360^\circ$ so that digits remain vertical.
* **Collapse Finale:** Boxes merge into a single central squircle box with an animated checkmark and floating particle dots (`#2EE6A8`).

---

## 🔒 5. Forgot Password & Institutional Gmail Gateway

To guarantee that only genuine campus constituents can recover credentials, password resets are mediated through the official **RYMEC-iSMART SMTP Gateway** (`rymec.ismart12@gmail.com`).

```mermaid
sequenceDiagram
    autonumber
    actor U as User (Student or Staff)
    participant UI as Login Modal / Profile View
    participant API as Auth Controller (/api/auth)
    participant DB as PostgreSQL (Neon Cloud)
    participant SMTP as Gmail Gateway (rymec.ismart12@gmail.com)
    participant INBOX as User's Gmail Inbox

    U->>UI: Click "Forgot password?" & Supply Registered Email
    UI->>API: POST /api/auth/forgot-password { email }
    API->>DB: Verify User Existence & Generate 6-Digit Crypto OTP
    API->>DB: Store reset_code & reset_expires (NOW() + 10 min)
    API->>SMTP: Dispatch Collegiate HTML Email Template
    SMTP-->>INBOX: Deliver Official RYMEC Security Notice with 40px Monospace OTP
    API-->>UI: 200 OK (OTP Dispatched)
    UI->>U: Launch 6-Digit Circular Orbit OTP Verification Screen

    U->>UI: Enter 6 Digits (Triggers Circular Curling Animation)
    UI->>API: POST /api/auth/verify-reset-otp { email, code }
    alt OTP Matches & Within 10-Minute Expiry
        API-->>UI: { valid: true }
        UI->>U: Collapse to Green Squircle & Reveal "Set New Password" Form
        U->>UI: Enter New Password (min 6 chars with Strength Meter)
        UI->>API: POST /api/auth/reset-password { email, code, new_password }
        API->>DB: bcrypt.hash(new_password, 10), Clear reset_code, Audit Log
        API->>SMTP: Dispatch Password Change Confirmation Advisory
        API-->>UI: 200 OK Password Updated
        UI-->>U: Prompt Sign In with Updated Credentials
    else Incorrect Code or Expired
        API-->>UI: 400 Bad Request
        UI->>U: Shake Boxes in Red & Reset Focus
    end
```

### Institutional Email Template Design Features
* **Veerasaiva Vidyavardhaka Sangha (V.V. Sangha)** gold trust header.
* **Rao Bahadur Y. Mahabaleswarappa Engineering College** official identity.
* **NAAC A+ Accredited** institutional stamp.
* **Cyan Monospace Display Box:** 40px Consolas font with 14px letter spacing and neon glow (`#60A5FA`).
* **10-Minute Expiry Notice:** Explicit expiry warning with security guidance never to disclose OTPs.
* **Campus Footer:** Physical address in Cantonment, Ballari - 583104, Karnataka.

---

## 💻 6. Core Technical Architecture & Tech Stack

| Layer | Technologies | Purpose |
|---|---|---|
| **Frontend Framework** | React 18, TypeScript, Vite 6 | High-performance SPA with client-side routing |
| **Styling & Motion** | Tailwind CSS 3, Framer Motion, Lucide Icons | Liquid Glass blur, spring physics, squircle curvature |
| **Backend Runtime** | Node.js, Express.js | Microservices REST API with modular routers |
| **Cloud Database** | PostgreSQL 16 on Neon Cloud Serverless | ACID relational storage, pooled connections |
| **Authentication** | JSON Web Tokens (JWT), bcryptjs (salt 10) | Stateless sessions, password hashing |
| **Email Gateway** | Nodemailer, Google Gmail SMTP API | OTP dispatch (`rymec.ismart12@gmail.com`) |
| **File Processing** | Multer, Sharp | Evidence upload (PDF, PNG, JPG) with size guards |
| **Analytics Engine** | Recharts, Custom Aggregation Pipelines | Department performance, resolution velocity |
| **Hosting & CI/CD** | Vercel Platform, GitHub Actions | Zero-downtime automated deployment on `main` push |

---

## 👥 7. Six Multi-Tier User Roles & RBAC Matrix

| Capability / Permission | 1. Student | 2. Lecturer | 3. Warden | 4. HOD | 5. Mentor | 6. Principal |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **File Grievances (Public or Anonymous)** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Evidence Attachment & QR Code Pass** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Reopen Closed Issues (Max 2 times)** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Submit 1-5 Star Satisfaction Ratings** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Academic Grievance Resolution Desk** | ❌ | ✅ | ❌ | ✅ | ❌ | ✅ |
| **Hostel, Mess & Water Redressal Desk** | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| **Level-1 Department Escalations** | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| **Personal Counseling & Welfare Desk** | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Level-2 Executive Escalation Review** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Campus Telemetry & Department KPIs** | ❌ | ❌ | ❌ | Partial | ❌ | ✅ |
| **Immutable System Audit Trail Access** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 🧠 8. Intelligent Automated Triage & Safety Engines

1. **AI Semantic Keyword Triage:**
   Scans complaint vocabulary across weighted dictionaries:
   * `hostel` $\rightarrow$ water, geyser, mess, food, warden, room, washroom, electricity
   * `academic` $\rightarrow$ marks, lab, lecturer, attendance, syllabus, exam, hall ticket
   * `harassment` $\rightarrow$ ragging, bullying, safety, mental harassment, physical threat
   * `admin` $\rightarrow$ fee, scholarship, bus, transport, id card, bonafide, library
2. **Automated Urgency Assessment:**
   * **URGENT (24-Hour SLA):** Triggered by critical safety and harassment indicators (`ragging`, `harassment`, `electric shock`, `fire`).
   * **HIGH (72-Hour SLA):** Triggered by hygiene or severe facilities breakdown (`drinking water`, `food poisoning`).
   * **MEDIUM (5-Day SLA):** Standard operational and academic concerns.
   * **LOW (7-Day SLA):** General amenity requests and suggestions.
3. **Jaccard Duplicate Detection Engine:**
   Calculates n-gram token overlap against all complaints logged within the last 14 days in the same department. Prevents redundant queue cluttering while alerting students to existing investigations.
4. **5+ Systemic Pattern Detector:**
   Analyzes 7-day clustering across categories. If 3 to 5+ distinct students file grievances around identical facilities (e.g., *"Aryabhata block 3rd floor water purifier"*), a persistent warning banner alerts staff to systemic infrastructure failures.
5. **Cryptographic Identity Shield:**
   When "File as Anonymous Grievance" is selected, the database sets `is_anonymous = true`. All staff, HOD, and reviewer views receive sanitized metadata (`Complainant: Anonymous Student`) with masked USN, protecting the student from bias or retaliation.

---

## 💎 9. Apple iOS Liquid Glass & Pebble Design System

```mermaid
graph LR
    subgraph Design Foundations
        A[Translucent Glass Material] --- B[Specular Dynamic Highlights]
        C[Unified Squircle Geometries] --- D[Pebble-Pill Interactive States]
    end

    A --> E[Multi-layered backdrop blur: 28px saturate 200%]
    B --> F[Top border specular glare: inset 0 1px 1.5px rgba 255,255,255,0.35]
    C --> G[All selects, cards & modals: rounded-2xl to rounded-3xl]
    D --> H[All pills, buttons & status tags: rounded-full]
```

* **Frosted Translucency:** `rgba(11, 19, 43, 0.58)` background with `backdrop-filter: blur(28px) saturate(200%)`.
* **Universal Squircle Standard:** Enforced via [index.css](frontend/src/index.css) so dropdowns, selects, textareas, and input fields share `border-radius: 1rem` (`rounded-2xl`).
* **Universal Pebble Standard:** Enforced via `.pebble-pill` with `border-radius: 9999px !important`.
* **Centered Dashboard Symmetry:** Dashboard settings, password management, and institutional profile records are centered using `max-w-md mx-auto` and `max-w-2xl mx-auto`.

---

## 🗄️ 10. Database Schema & Relational Architecture

```mermaid
erDiagram
    DEPARTMENTS ||--o{ USERS : "employs / assigns"
    DEPARTMENTS ||--o{ COMPLAINTS : "manages"
    USERS ||--o{ COMPLAINTS : "files (student)"
    USERS ||--o{ COMPLAINTS : "assigned_to (staff)"
    COMPLAINTS ||--o{ COMPLAINT_ATTACHMENTS : "includes"
    COMPLAINTS ||--o{ COMPLAINT_TIMELINE : "logs events"
    COMPLAINTS ||--o{ COMPLAINT_RATINGS : "evaluated by"
    USERS ||--o{ NOTIFICATIONS : "receives"
    USERS ||--o{ AUDIT_LOGS : "triggers"

    DEPARTMENTS {
        int id PK
        string name
        string code
        string category_mapping
        string contact_email
        string description
    }

    USERS {
        int id PK
        string full_name
        string email UK
        string password_hash
        string role
        string usn_roll
        string department
        string branch
        string section
        string academic_year
        string hostel_block
        string designation
        string reset_code
        timestamp reset_expires
        boolean is_verified
        timestamp created_at
    }

    COMPLAINTS {
        int id PK
        string complaint_number UK
        int student_id FK
        boolean is_anonymous
        string student_name_snapshot
        string title
        text description
        string category
        int department_id FK
        string priority
        string status
        int assigned_to FK
        timestamp sla_deadline
        boolean is_escalated
        int escalation_level
        int reopening_count
        timestamp resolved_at
        timestamp created_at
    }

    COMPLAINT_ATTACHMENTS {
        int id PK
        int complaint_id FK
        string file_name
        string file_url
        int file_size
        string mime_type
    }

    COMPLAINT_TIMELINE {
        int id PK
        int complaint_id FK
        int action_by FK
        string action_role
        string status
        text remark
        boolean is_internal
        timestamp created_at
    }

    COMPLAINT_RATINGS {
        int id PK
        int complaint_id FK
        int student_id FK
        int rating
        text feedback
        timestamp created_at
    }

    NOTIFICATIONS {
        int id PK
        int user_id FK
        string title
        text message
        string link
        boolean is_read
        timestamp created_at
    }

    AUDIT_LOGS {
        int id PK
        int user_id FK
        string action
        string entity_type
        int entity_id
        jsonb details
        timestamp created_at
    }
```

---

## 📡 11. REST API Endpoints Specification

### Authentication & Account Recovery (`/api/auth`)
* `POST /api/auth/register` — Registers new student/staff account with hashed password and triggers 6-digit registration OTP.
* `POST /api/auth/verify-otp` — Verifies 6-digit registration code and marks account verified.
* `POST /api/auth/resend-otp` — Dispatches fresh 6-digit verification code with 60s cooldown.
* `POST /api/auth/login` — Authenticates credentials and returns JWT bearer token and user profile.
* `POST /api/auth/forgot-password` — Dispatches 6-digit institutional reset code via Gmail SMTP.
* `POST /api/auth/verify-reset-otp` — Validates reset code against 10-minute expiry window.
* `POST /api/auth/reset-password` — Updates password with bcrypt hashing and logs security audit.
* `PUT  /api/auth/profile` — Updates branch, section, academic year, and accommodation settings.
* `PUT  /api/auth/change-password` — Verifies current password and updates to new password.

### Grievances & Redressal (`/api/complaints`)
* `POST /api/complaints` — Submits grievance with title, category, priority, anon flag, and Multer file upload.
* `GET  /api/complaints/track/:complaint_number` — Public tracking endpoint returning milestones, SLA countdown, and QR code.
* `GET  /api/complaints/my` — Returns personal complaints logged by the authenticated student.
* `GET  /api/complaints/staff-queue` — Role-scoped inbox for Lecturer, Warden, HOD, and Principal.
* `PUT  /api/complaints/:id/status` — Updates status (`in_progress`, `resolved`, `rejected`) with mandatory remark.
* `POST /api/complaints/:id/reopen` — Reopens closed grievance (capped at 2 times) with written rationale.
* `POST /api/complaints/:id/rate` — Submits post-resolution 1-5 star satisfaction feedback.
* `GET  /api/complaints/transparency-wall` — Public feed of resolved grievances with anonymized resolution metrics.

### System Analytics & Audit (`/api/analytics`, `/api/audit`)
* `GET  /api/analytics/overview` — High-level resolution rates, average turnaround days, and active tickets.
* `GET  /api/analytics/category-distribution` — Volume distribution by category for Recharts visualization.
* `GET  /api/analytics/trends` — 7-day systemic clustering alerts (5+ keyword pattern detector).
* `GET  /api/audit/logs` — Immutable audit trail of administrative actions (Principal only).

---

## 🚀 12. Installation & Local Deployment Guide

### Prerequisites
* **Node.js:** v18.x or v20.x installed.
* **Git:** Version control CLI.
* **PostgreSQL:** Neon Cloud Serverless Database or local PostgreSQL 14+.

### 1. Clone the Repository
```bash
git clone https://github.com/nagavakkalagadda/RYMEC-COMPLAINT-DESK.git
cd RYMEC-COMPLAINT-DESK
```

### 2. Environment Configuration
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
DATABASE_URL=postgresql://username:password@ep-raspy-river-ar9edhbp.us-east-2.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=your_super_secret_jwt_key_2026
GMAIL_USER=rymec.ismart12@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password
NODE_ENV=production
```

### 3. Run Backend Server
```bash
cd backend
npm install
npm run dev
# Server initiates on http://localhost:5000
```

### 4. Run Frontend Client
```bash
cd ../frontend
npm install
npm run dev
# Vite client initiates on http://localhost:5173
```

---

## 🧪 13. End-to-End Evaluation Walkthrough

For campus viva evaluations and administrative review:

1. **Explore the Public Portal:**
   * Visit [https://rymec-complaint-desk.vercel.app](https://rymec-complaint-desk.vercel.app).
   * Observe the verified campus photograph, `NAAC A+` pill badge, and liquid glass cards.
2. **Test 1-Click Demo Login:**
   * Click **Sign In** in the top navigation.
   * Click any test role badge (**Student**, **Lecturer**, **Warden**, **HOD**, **Mentor**, **Principal**) to instantly load credentials (`password123`).
3. **Test the 6-Digit Circular Orbit OTP System:**
   * Click **Register Account** or **Forgot password?**.
   * Supply an email address and click **Send Verification Code**.
   * Observe the dotted circular guide track with the center hub point.
   * Type the 6-digit code: observe the row curl into a circular orbit with rotating numbers.
   * On confirmation, observe the ring light up green, collapse into a single center squircle box with an animated checkmark, floating particles, and a *"Verified and secure"* badge.
4. **Submit a Complaint with Anonymous Protection:**
   * Click **Submit Grievance**.
   * Check **File as Anonymous Grievance**. Enter subject: *"Water purifier filter replacement in Aryabhata hostel 2nd floor"*.
   * Notice the automated category classification (`Hostel`) and SLA calculation.
   * Click **Submit** to view confetti, tracking ID generation (`GRV-2026-XXXXX`), and scannable QR code.
5. **Staff Resolution & Student Satisfaction:**
   * Log in as **Warden**, open the ticket, and set status to `Resolved` with an action-taken remark.
   * Return to **Student** view, inspect the updated milestone timeline, and rate the resolution 5 stars.
6. **Principal Oversight & Systemic Pattern Detection:**
   * Log in as **Principal**.
   * Inspect the systemic trend alert banner, category charts, and audit logs.

---

### 🏛️ Institutional Credit & Governance
**Rao Bahadur Y. Mahabaleswarappa Engineering College (RYMEC)**  
*Affiliated to Visvesvaraya Technological University (VTU), Belagavi • Approved by AICTE, New Delhi • Accredited by NAAC with 'A+' Grade*  
**Campus:** Cantonment, Ballari — 583 104, Karnataka, India  
**Parent Management:** Veerasaiva Vidyavardhaka Sangha, Ballari (Estd. 1916 / College Estd. 1980)  
**Official Email Gateway:** `rymec.ismart12@gmail.com`
