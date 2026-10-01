# 🚀 Automated Micro-Influencer Outreach System

An end-to-end full-stack web application for discovering micro-influencers, qualifying them against engagement and follower criteria, enriching profile data, generating context-aware AI collaboration emails/DMs using Gemini LLM, and managing human-in-the-loop outreach workflows.

---

## 📸 Key Features

- **📊 Visual Dashboard**: Real-time analytics on conversion funnels, qualified ratio, platform breakdown, and outreach states using Recharts.
- **📥 Data Ingestion & Discovery**: Drag-and-drop CSV importer with Zod schema validation, handle deduplication, and batch error reporting.
- **🎯 Dynamic Qualification Engine**: Configurable threshold rules (Followers: 10K–100K, Engagement Rate ≥ 2.5%, Approved Niches) with granular pass/fail diagnostic logs.
- **🔎 Profile Data Enrichment**: Automated enrichment pipeline simulating post metrics, audience growth, top hashtags, and recent content themes.
- **🤖 AI Personalization Engine**: Google Gemini LLM integration with intelligent prompt templating, length constraint verification (Email < 150 words, DM < 60 words), tone customization, and robust fallback generator.
- **✉️ Outreach Approval Workflow**: Human-in-the-loop approval mechanism (`draft` ➔ `approved` ➔ `sent`/`simulated`) with inline message editing, character/word counters, and SMTP/sandbox delivery modes.

---

## 🛠️ Architecture & Tech Stack

```
[ CSV Ingestion ] ──> [ Filtering Engine ] ──> [ Data Enrichment ]
                                                      │
[ Frontend Dashboard ] <── [ Express API ] <─── [ Gemini AI Service ]
     (React + Vite)          (TypeScript)           (Google Gen AI)
```

- **Frontend**: React 18, TypeScript, Vite, TanStack Query (React Query), Recharts, Lucide Icons.
- **Backend**: Node.js, Express, TypeScript, Mongoose / MongoDB (with SQLite/In-memory options).
- **AI & Automation**: Google Gemini 1.5 Flash API (`@google/generative-ai`), custom prompt template engine.
- **Testing**: Vitest unit test suite covering qualification rules and edge cases.

---

## ⚙️ Quick Start Guide

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### 1. Installation

Clone the repository and install dependencies in both server and client:

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Environment Setup

Create a `.env` file in the `server` directory (or copy from `.env.example`):

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/micro_influencers
GEMINI_API_KEY=your_gemini_api_key_here
ENABLE_SIMULATED_EMAIL=true
```

> **Note**: If `GEMINI_API_KEY` is not provided, the system seamlessly uses a high-quality deterministic fallback prompt generator for testing without an API key.

### 3. Generate Sample Data

Generate sample micro-influencer CSV data:

```bash
cd server
npx tsx ../data/sample/generate_demo_csv.ts
```

### 4. Running the Application

Run server and client concurrently from the root directory:

```bash
# Run both frontend and backend concurrently
npm run dev
```

- **Frontend Application**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000/api`

---

## 🧪 Testing

Run the Vitest test suite for qualification rules:

```bash
cd server
npm test
```

---

## 📑 API Endpoints Reference

### Influencers
- `GET /api/influencers` - List influencers (supports search, platform filter, status filter, pagination)
- `GET /api/influencers/:id` - Fetch single influencer profile details
- `POST /api/influencers/import` - Upload and parse influencer CSV file
- `DELETE /api/influencers/:id` - Remove influencer profile

### Filtering & Qualification
- `POST /api/filter/run` - Run qualification engine on pending profiles
- `GET /api/filter/results` - Get latest qualification results and pass/fail reasons

### Data Enrichment
- `POST /api/enrichment/run` - Run batch profile enrichment
- `POST /api/enrichment/:id` - Enrich specific profile

### Personalization & Outreach
- `POST /api/personalization/generate/:id` - Generate AI email & Instagram DM
- `POST /api/personalization/regenerate/:id` - Regenerate AI outreach message
- `GET /api/outreach` - List outreach records
- `POST /api/outreach/:id/approve` - Approve outreach draft
- `POST /api/outreach/:id/send` - Send outreach email (SMTP or Sandbox mode)
- `POST /api/outreach/:id/simulate` - Simulate DM / Email dispatch

### Dashboard
- `GET /api/dashboard/stats` - Fetch overall aggregate metrics and breakdown charts

---

## 🎨 System Highlights

1. **Strict Constraint Enforcement**: Email and DM outputs are automatically evaluated for word limits (<150 words for emails, <60 words for DMs).
2. **Resilient AI Pipeline**: Includes JSON format parsing, sanitization, and automatic fallback handling.
3. **Production Design System**: Fully custom responsive CSS design with dark-mode aesthetic, micro-animations, accessible badges, and status progression indicators.
