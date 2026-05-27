# 🛡️ Dhoraiya De (ধরাইয়া দে) — Whistleblower Web Platform

**Dhoraiya De** is an anonymous anti-corruption platform designed to empower citizens to safely report public grafts, bribery, environmental devastation, and institutional malpractices across Bangladesh. Leveraging a sleek cyberpunk dark terminal aesthetic, the system features an interactive Leaflet open-source regional map, secure media uploads, and server-side **Google Gemini AI** powered audit, threat verification, and priority classification.

---

## 🛠️ System Architecture Overview

```
             ┌────────────────────────────────────────────────────────┐
             │                   React 19 / Vite SPA                  │
             │           (Leaflet Map Engine, Cyber Accent)           │
             └───────────────────────────┬────────────────────────────┘
                                         │  Secure POST/GET Requests
                                         ▼
             ┌────────────────────────────────────────────────────────┐
             │                  Express Full-Stack Server             │
             │          (Asset Compilation & API Orchestration)       │
             └──────┬──────────────────────────────────────────┬──────┘
                    │                                          │
                    │ AI Integrity Scans                       │ Persistence Handshake
                    ▼                                          ▼
     ┌──────────────────────────────┐          ┌──────────────────────────────┐
     │      Google Gemini AI        │          │       Storage Engine         │
     │      (3.5-flash Engine)      │          │ Dev: reports-db.json         │
     └──────────────────────────────┘          │ Prod: Managed DB / Firestore │
                                               └──────────────────────────────┘
```

---

## 📂 Project Directory Structure

```
dhoraiya-de/
├── .github/
│   ├── workflows/
│   │   └── ci.yml             # Github Actions: Automates Typescript & Production compile
│   └── SECURITY.md            # Guidelines for disclosing vulnerabilities & Key Hygiene
├── src/
│   ├── components/
│   │   ├── MapBangladesh.tsx  # Free Open-source Leaflet map (No Google Key required!)
│   │   ├── ReportSubmission.tsx# Whistleblower reporting panel
│   │   ├── AudioAlerts.ts     # Sound playback logic (Sonar sweep alert indicators)
│   │   └── ...
│   ├── types.ts               # Shared TypeScript structures (Enums, Interfaces)
│   └── App.tsx                # Master Dashboard UI
├── server.ts                  # Safe Server-side API & Vite pipeline initialization
├── reports-db.json            # Development Local flat JSON Database file
├── LICENSE                    # Production-ready MIT Open-Source license
└── package.json               # Package manifests & bundlers
```

---

## 🗄️ Database Management Manual (Development ➡️ Production)

Currently, the web application operates on a lightweight, zero-configuration local server-side database saved inside `reports-db.json` using the Node.js `fs` file system module. This is outstanding for immediate local coding and testing. However, to transition to **Professional Production Grade**, you should migrate to a resilient database system.

Below are the blueprints and guides for migrating your platform to production-ready database engines.

### Option A: PostgreSQL with Prisma ORM (Recommended for Relational Data)

This configuration structure is optimal if you want to perform detailed analytics, audit trails, and maintain strict relationships between reports and timeline verification events.

1. **Install database dependencies**:
   ```bash
   npm install @prisma/client
   npm install -D prisma
   ```

2. **Initialize Prisma schema file (`prisma/schema.prisma`)**:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }

   generator client {
     provider = "prisma-client-js"
   }

   model Report {
     id             String   @id @default(uuid())
     title          String
     category       String
     ministry       String
     district       String
     division       String
     location       String
     date           String
     involvedPeople String
     description    String   @db.Text
     isAnonymous    Boolean  @default(true)
     reporterName   String?
     upvotes        Int      @default(0)
     downvotes      Int      @default(0)
     status         String   @default("PENDING") // PENDING, AI_VERIFIED, UNDER_INVESTIGATION, APPROVED
     lat            Float?
     lng            Float?
     createdAt      DateTime @default(now())
     
     // Embedded JSON fields for AI Assessment details & timeline
     aiAnalysis     Json?    // Stores audit scores, spam risk, & priority
     timeline       Json     // Stores state sequence array
   }
   ```

3. **Transition Express database getters in `server.ts`**:
   Replace local helper definitions with standard non-blocking queries:
   ```typescript
   import { PrismaClient } from '@prisma/client';
   const prisma = new PrismaClient();

   // Asynchronous Fetch All Reports
   app.get("/api/reports", async (req, res) => {
     try {
       const reports = await prisma.report.findMany({
         orderBy: { createdAt: 'desc' }
       });
       res.json(reports);
     } catch (err) {
       res.status(500).json({ error: "Failed to read database records." });
     }
   });

   // Asynchronous Save Report
   app.post("/api/reports", async (req, res) => {
     try {
       const newReport = await prisma.report.create({
         data: { ...req.body }
       });
       res.status(201).json(newReport);
     } catch (err) {
       res.status(500).json({ error: "Failed to persist whistleblower claim to primary database." });
     }
   });
   ```

---

### Option B: Firebase Firestore NoSQL Database (Highly Scalable document model)

Highly optimized for rapid deployment and absolute reliability without administering any database machines yourself.

1. **Setup Google Cloud Firestore Config with credentials**:
   ```typescript
   import { initializeApp } from "firebase/app";
   import { getFirestore, collection, addDoc, getDocs, orderBy, query } from "firebase/firestore";

   const firebaseConfig = {
     apiKey: process.env.FIREBASE_API_KEY,
     authDomain: "dhoraiya-de.firebaseapp.com",
     projectId: "dhoraiya-de",
     storageBucket: "dhoraiya-de.appspot.com",
     messagingSenderId: "1234567890",
     appId: "1:1234:web:abcd"
   };

   const firebaseApp = initializeApp(firebaseConfig);
   const db = getFirestore(firebaseApp);
   ```

2. **Fetch and Save Firestore Records inside `server.ts`**:
   ```typescript
   app.get("/api/reports", async (req, res) => {
     try {
       const colRef = collection(db, "reports");
       const q = query(colRef, orderBy("createdAt", "desc"));
       const snapshot = await getDocs(q);
       const dataList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
       res.json(dataList);
     } catch (err) {
       res.status(500).json({ error: err.message });
     }
   });
   ```

---

## 🚀 DevOps & CI/CD Pipelines

### 🛡️ GitHub Actions (Continuous Integration Audits)
The pipeline is pre-configured to execute in **`.github/workflows/ci.yml`**. On every `push` or `pull_request` to `main` / `master` branches, GitHub's virtualization containers will:
1. Boot a virtual Ubuntu Node.js runner environment.
2. Clean-install runtime and development modules utilizing fast caching hooks.
3. Validate strict code and type compatibility using `npm run lint`.
4. Validate bundle asset compilation compliance using `npm run build`.

This triggers automatic feedback rings on PRs, eliminating broken code deployments.

---

## ⚡ Quick Start: Running Platform Locally

Prerequisite: Make sure you have Node.js (version 20+) installed on your laptop/server system.

1. **Clone project and trigger package install**:
   ```bash
   git clone https://github.com/yourusername/dhoraiya-de.git
   cd dhoraiya-de
   npm install
   ```

2. **Provide your server configuration secrets**:
   Create a `.env` in the root (matching `.env.example` structure) and bind keys:
   ```env
   # Configure your Gemini authorization secret for live whistle audits
   GEMINI_API_KEY=AIzaSyD-YourActualGoogleGeminiTokenHere
   ```

3. **Boot development server (concurrent hot-swapping compilation)**:
   ```bash
   npm run dev
   ```
   Open **`http://localhost:3000`** in your browser!

---

## 📦 Deploying to Production (SaaS Platforms)

The platform is optimized for seamless deployment to container clouds (Google Cloud Run) or static fullstack hosts (Render, Heroku, Dokku):

1. **Configure Environment Variables**:
   Configure these parameters in your cloud dashboard:
   - `GEMINI_API_KEY`: Secret string credentials for your anti-spam auditor.
   - `NODE_ENV`: Set to `production`.

2. **Trigger Build Lifecycle**:
   Your host should run `npm run build` during step processing, then launch the compiled CJS artifacts via `npm start`.

---

## 🔒 Security Auditing & Safe Guidelines
Please review **`.github/SECURITY.md`** to learn how to disclose vulnerabilities properly. Always guard client credentials safely and enforce proxy-shield APIs.
License information is found inside the root **`LICENSE`** file.
