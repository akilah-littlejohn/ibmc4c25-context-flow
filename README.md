


# 🌊 ContextFlow

**🚀 Transforming Customer Support Emails with AI + RAG using IBM Watsonx.ai**

## 🔍 Overview

Customer service teams receive countless emails daily — sorting them manually is slow, expensive, and inconsistent.

**ContextFlow** is an intelligent backend service (with an Angular demo frontend) that:

1. **Analyzes** customer support emails using IBM Watsonx.ai.
2. **Enriches** them with contextual data (RAG).
3. **Outputs** structured JSON ready for automation.

Built for the IBM Hackathon, ContextFlow advances the theme:
**“The Future of Customer Experience.”**

---

## ✨ Core Features

* **Email Analysis:** Understands the email’s intent, urgency, and sentiment using IBM Watsonx.ai.
* **RAG Context Injection:** Adds relevant customer data (simulated in the PoC).
* **Structured JSON Output:** Generates predictable JSON for downstream automation.
* **Automation-Ready:** Includes a list of `automation_tasks` for ticketing, routing, and prioritization.
* **Modern Stack:** NestJS backend, Angular 19 + Material frontend.
* **Frontend Demo:** View results and simulate automation steps in a clean Angular UI.
The Problem
Every day, customers face long delays and generic responses after sending support emails, often receiving little acknowledgment or help. Urgent issues like billing disputes or service outages are treated as routine, while emails frequently land in the wrong department, forcing customers to start over. Lacking access to context like account history or prior interactions, agents make customers repeat information, adding to frustration. The support experience becomes inconsistent and unpredictable, hinging on which agent receives the email. This creates a broken system where even simple problems require multiple follow-ups, and complex issues often go unresolved.

The Solution
ContextFlow is an intelligent email automation engine that transforms customer emails into structured JSON blueprints, orchestrating enterprise processes in real time. By leveraging IBM Watsonx.ai and Retrieval-Augmented Generation (RAG), it enriches each email with contextual data like CRM history and product knowledge to understand intent, sentiment, and urgency. The system then outputs automation-ready JSON, triggering workflows across platforms like Zendesk, Salesforce, and Slack. Designed for support managers and operations teams, ContextFlow puts companies in the position to have real-time dashboards, intelligent routing, and unlike traditional categorization tools, it directly converts natural language into executable business logic, creating a scalable, AI-powered operations layer.


---

## 🛠️ Tech Stack

**Backend:**

* NestJS + TypeScript
* IBM Watsonx.ai (`/ml/v1/text/chat`)
* Simulated RAG service

**Frontend:**

* Angular 19 + Angular Material

---

## 🧱 Architecture

```
Angular UI ➜ NestJS API ➜ Prompt Builder ➜ IBM Watsonx.ai ➜ JSON Output
                            ⬑ RAG Context (mocked)
```

1. User submits email ➜
2. Backend adds RAG context + builds prompt ➜
3. Watsonx.ai analyzes and returns structured JSON ➜
4. JSON shown in UI with simulated task execution

---

## 🚀 Get Started

### Prerequisites

* Node.js (v18+), npm/yarn
* Angular CLI

### Backend Setup

```bash
cd contextflow-backend
cp .env.example .env
# Fill in your IBM Watsonx credentials
npm install
npm run start:dev
# Runs on http://localhost:3000
```

### Frontend Setup

```bash
cd contextflow-frontend
npm install
ng serve --open
# Opens http://localhost:4200
```

---

## 🧪 Try It Out

### 1. From Angular UI

* Paste or select an email
* Click **“Analyze with Watsonx AI”**
* View structured output and see simulated task actions

### 2. From API (via Postman/curl)

```json
POST http://localhost:3000/ai/parse-email
Headers: Content-Type: application/json
Body:
{
  "email": "Subject: Urgent Billing Issue...\nHi, I was overcharged..."
}
```

---

## 💡 Why It’s Unique

* 🔍 **Dynamic Prompting:** Tailors output using multiple schemas (billing, support, sales, etc.)
* 🧠 **Simulated RAG:** Adds customer-specific insight (mocked for PoC)
* 🔄 **Automation-Ready JSON:** Easily hooks into ticketing, RPA, or CRMs
* 🏗️ **Enterprise Stack:** Built on NestJS + Angular for scalability and clarity

---

## 🔮 Future Plans

* Live RAG from CRMs, databases, or vector search
* Role-based access and analytics dashboard
* Execute real automation (Zendesk, Jira, etc.)
* Feedback loop for improving AI outputs over time

---

## 🏆 Hackathon Notes

* **Theme Fit:** Improves customer experience through smarter support
* **Watsonx.ai:** Core engine for analysis and structure generation
* **RAG:** Simulated now, designed for live enterprise data

---

## 👤 About the Developer

**Akilah Littlejohn**
*Passionate about building AI tools that simplify work and enhance human focus.*
\[https://www.linkedin.com/in/akilah-littlejohn-426b5bb8/]


