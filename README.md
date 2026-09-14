# NyayaSetu (न्यायसेतु • நியாயசேது)
> *A Bridge to Legal Clarity for Everyday People*
> **PromptWars Virtual Hackathon — Challenge:** AI for Legal Assistance & Access

---

## 1. Chosen Vertical & Persona

### The Target Persona: Priya, First-Time Tenant in Chennai
Every day, thousands of ordinary people sign binding legal agreements without having a lawyer on retainer. Consider **Priya Natarajan**, a 24-year-old software engineer relocating from Madurai to Chennai. Upon finding a 2BHK flat in Velachery, her landlord hands her an 11-month rental agreement filled with dense legalese.

Tucked inside standard-looking clauses are severe, one-sided pitfalls:
- **10-Month Security Deposit (Rs. 2,60,000/-)** — completely locking up her savings, with refunds delayed up to 90 days.
- **7-Day Sudden Eviction Clause** — allowing the landlord to throw her out without cause in just one week.
- **Total Deposit Forfeiture** — losing her entire Rs. 2.6L deposit if she leaves before 11 months.
- **Mandatory 1-Month Painting Deduction** — regardless of actual wall wear and tear.
- **Unannounced Landlord Inspection & Surrender of Master Key** — violating her right to domestic privacy and peaceful enjoyment.
- **Attempt to Override Statutory Tenancy Laws** — attempting to contract out of the Tamil Nadu Regulation of Rights and Responsibilities of Landlords and Tenants Act (TNRRRL Act 2017).

Like most tenants, Priya doesn't have an advocate on speed dial, cannot afford Rs. 5,000–10,000 in legal consultation fees for a rental lease, and fears jeopardizing the rental by asking questions incorrectly.

### Supported Document Verticals
While Priya's rental agreement is our primary spotlight persona, NyayaSetu handles everyday non-lawyer consumer agreements:
1. **Residential Rental Agreements** (11-month leases, security deposit disputes, eviction terms, maintenance liability).
2. **Employment Offer Letters & Contracts** (2-year post-employment non-competes, bonus clawbacks, notice period buyouts, IP assignment).
3. **Freelancer & Vendor Service Contracts** (unlimited indemnities, delayed payment terms, intellectual property waivers).
4. **Consumer Terms of Service & NDAs** (unilateral modification, binding arbitration, data privacy concessions).

---

## 2. Approach & Architecture

### Privacy-First, Zero-Persistence Guarantee
Legal contracts contain sensitive personal information (salaries, home addresses, phone numbers, identification details). **NyayaSetu never writes document text to disk or a database.** 
- All files (PDFs or pasted text) are processed transiently in server memory during the request.
- The Gemini API key is stored strictly server-side in `.env.local` and never exposed client-side.
- In-memory sliding window rate limiting prevents abuse without recording user identities.
- No third-party tracking scripts or analytics are loaded.

### Unified Analysis Pipeline (Single-Prompt Gemini Schema)
Rather than making multiple sequential LLM calls (which increases latency and cost), NyayaSetu uses a single structured Gemini 2.0 Flash prompt returning typed JSON:
1. **Clause Deconstruction**: Decomposes the contract into numbered/titled clauses.
2. **Category Grouping**: Maps every clause into five intuitive human buckets:
   - *"What you're agreeing to"*
   - *"Money"*
   - *"Termination"*
   - *"Your obligations"*
   - *"Their obligations"*
3. **Multilingual Plain-Language Rewriting**:
   - Plain English (jargon-free explanation)
   - Plain Hindi (हिंदी अनुवाद)
   - Plain Tamil (தமிழ் விளக்கம்)
4. **Risk / Red-Flag Detector**:
   - Classifies each clause as **Safe**, **Low Risk**, **Medium Risk**, or **High Risk**.
   - Generates a concise 1-line plain reason why the term is dangerous.
   - Provides an actionable counter-negotiation script (what Priya should say or propose).
   - Grounds flags in statutory Indian jurisprudence (e.g. TNRRRL Act 2017 deposit caps, Section 27 Indian Contract Act 1872 voiding non-competes).
5. **Contract Risk Index**: Calculates an overall risk score from 0 to 100.
6. **Negotiation Action Plan**: Formulates a copyable 5-point negotiation checklist ready to paste into WhatsApp or email to the counterparty.

### Compare Mode
NyayaSetu lets users paste or upload two contract drafts (e.g., Draft 1: Landlord's Original vs Draft 2: Negotiated Counter-Offer):
- Evaluates side-by-side clause differences.
- Determines who each material change favors (*"Favors You (Tenant)"*, *"Favors Counterparty"*, or *"Neutral"*).
- Visualizes the risk shift (e.g. Priya's Draft 1 risk of 82/100 dropping to 24/100 in Draft 2).

### Grounded Q&A Assistant (Ask-The-Document)
- The Q&A chatbot is strictly grounded in the document text.
- If a question cannot be answered from the document, it explicitly declines to hallucinate external facts.
- Returns verifiable citations with exact clause quotes.
- Every response and view prominently includes the mandatory legal disclaimer:
  > *"This is general information, not legal advice — consult a licensed advocate for your specific situation."*

### Zero-Key Evaluator Fallback Engine
If an evaluator runs the repo locally without configuring a `GEMINI_API_KEY`, or in offline environments, NyayaSetu automatically falls back to an internal deterministic legal analysis engine encoded with real Indian statutory rules. The evaluator experiences full interactivity, multi-language toggles, risk scoring, compare mode, and grounded Q&A immediately.

---

## 3. How the Solution Works (Setup & Walkthrough)

### Prerequisites
- Node.js 18.17+ or 20+ (tested on Node v20 and v24)
- npm or pnpm

### Quick Setup

```bash
# 1. Clone the repository
git clone https://github.com/Joseph-Gabriel008/NyayaSetu.git
cd NyayaSetu

# 2. Install dependencies
npm install

# 3. Configure environment variables (Optional - works out of the box with offline engine)
cp .env.example .env.local
# Edit .env.local and add your GEMINI_API_KEY from Google AI Studio:
# GEMINI_API_KEY=AIzaSy...

# 4. Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### User Flow Walkthrough

```
[ Step 1: Input Document ]
  ├── 1-Click Persona Demo: "Priya's Chennai Lease"
  ├── Or Paste Custom Agreement Text
  └── Or Drag & Drop PDF / TXT File
           │
           ▼
[ Step 2: In-Memory Processing & Sanitization ]
  ├── Client IP Rate Check (Sliding Window)
  ├── Prompt Injection Defanging & Size Validation
  └── Gemini 2.0 Flash Structured Extraction
           │
           ▼
[ Step 3: Interactive Legal Clarity Workspace ]
  ├── Risk Radar: Score (0-100), Red Flags, 5-Point Action Plan
  ├── Summary Cards: 5 Category Buckets (English, Hindi, Tamil)
  └── Grounded Q&A: Chatbot citing exact clause snippets
           │
           ▼
[ Step 4: Compare Mode (/compare) ]
  ├── Side-by-Side Diff (Draft 1 vs Draft 2)
  ├── Material Shift & Favorability Badges
  └── Pre-loaded Demo: Priya's Draft 1 vs Negotiated Draft 2
```

---

## 4. Accessibility (WCAG 2.1 AA Compliant)

Accessibility is a core priority:
- **Language Toggles**: Switch between English, हिन्दी (Hindi), and தமிழ் (Tamil) for plain language summaries.
- **Font Scaling**: Dynamic text size adjustments (`A-`, `A`, `A+`, `A++`) across the entire app.
- **High-Contrast Mode**: 1-click toggle for WCAG AAA ultra-high contrast dark mode with vivid yellow borders and focus indicators.
- **Keyboard Navigation**: Full tab ordering, skip-to-content link, and distinct visible focus rings (`focus:ring-2 focus:ring-amber-500`).
- **Screen Reader Support**: ARIA landmarks, `aria-live="polite"` chat regions, semantic headers, and descriptive button labels.

---

## 5. Assumptions & Scope

1. **Jurisdiction Focus (India)**: NyayaSetu specifically recognizes Indian legal frameworks commonly encountered by consumers (e.g. Model Tenancy Act, Tamil Nadu Tenancy Act / TNRRRL Act 2017, Section 27 of the Indian Contract Act 1872 regarding non-competes).
2. **Informational Nature**: NyayaSetu does not provide formal legal advice, legal representation, or file court pleadings. It is designed to bridge the comprehension gap for non-lawyers.
3. **Language**: The source documents analyzed are primarily in English (standard in Indian corporate and rental agreements), with plain-language rewrites available in English, Hindi, and Tamil.
4. **Lightweight Repository**: Repo size is kept strictly under 10MB by gitignoring `node_modules`, `.next`, and build artifacts.

---

## 6. Testing & Manual Checklist

### Automated Unit Tests
Run the test suite powered by Vitest:

```bash
npm run test
```

The test suite validates:
- `tests/parser.test.ts`: Text sanitization, length bounds, and defanging prompt injections.
- `tests/risk-detector.test.ts`: Accurate risk scoring and red-flag identification for Chennai rental agreements and employment non-competes.
- `tests/compare.test.ts`: Contract diffing, favorability tagging, and risk shift calculations.
- `tests/rate-limit.test.ts`: In-memory sliding window rate limiter thresholds.

### Manual Test Checklist for Evaluators
- [ ] **1. Load Persona Demo**: On the home page, click **"Load Priya's Lease"** under the Persona Spotlight. Click **"Analyze Clauses & Detect Risks"**.
- [ ] **2. Verify Red Flags**: Check that **10 Months Security Deposit** (High Risk) and **7-Day Eviction** (High Risk) appear with reasons and counter-measures.
- [ ] **3. Copy Action Plan**: Click **"Copy Checklist"** on the 5-point negotiation plan and verify clipboard confirmation.
- [ ] **4. Test Plain-Language Translations**: Click the **"Plain-Language Clauses"** tab. In the top accessibility bar, click **"हिन्दी"** or **"தமிழ்"** to see instant localized summaries.
- [ ] **5. Test Grounded Q&A**: Click the **"Ask-The-Document"** tab. Click the suggested query *"Can the landlord evict me with just 7 days notice?"*. Verify that the response cites Clause 7 and displays the mandatory legal disclaimer.
- [ ] **6. Test Compare Mode**: Navigate to **"Compare Drafts"** in the top navigation. Click **"Load Priya's Before/After Comparison"**. Verify that Draft 2 shows a significant risk reduction (82 -> 24) and highlights *"Favors You (Tenant)"* badges.
- [ ] **7. Test Accessibility**: Click **"High Contrast"** in the accessibility bar to verify WCAG AAA styling. Click `A+` to test dynamic font scaling.

---

## 7. Tech Stack & Dependencies

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS (custom Nyaya blue/gold palette + high-contrast mode)
- **AI**: Google Gemini API (`gemini-2.0-flash`) via `@google/generative-ai`
- **PDF Extraction**: `pdf-parse` (in-memory server-side parsing)
- **Icons**: `lucide-react`
- **Test Suite**: `vitest`

---

## License
MIT License. Built with ❤️ for **PromptWars Virtual: AI for Legal Assistance & Access**.