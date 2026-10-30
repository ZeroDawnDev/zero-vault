# ◈ ZERO VAULT

### Your money, in focus.

**Zero Vault** is an AI-powered personal finance management platform developed under **ZeroDawn**. It aims to simplify financial tracking by combining transaction management, intelligent categorization, financial analytics, and automated expense collection into one unified dashboard.

Built with a focus on privacy, simplicity, and a premium user experience.

---

## ◈ Vision

Managing personal finances should not require manually tracking every transaction.

Zero Vault aims to transform traditional expense tracking into an intelligent financial management experience.

The long-term vision is to build a system that understands spending patterns, identifies financial habits, and provides meaningful insights to help users make better financial decisions.

---

## ✦ Features

### 1. Financial Dashboard

* Total balance overview.
* Income and expense summaries.
* Monthly financial statistics.
* Recent transaction activity.
* Visual financial analytics.

### 2. Transaction Management

* Add, edit, and delete transactions.
* Track income and expenses.
* Categorize transactions.
* Record transaction dates and payment methods.
* Support for Japanese Yen (JPY).

### 3. Financial Analytics

* Spending visualization.
* Category-based expense analysis.
* Monthly financial trends.
* Income versus expense comparisons.

### 4. Gmail Integration

* Connect Gmail for financial transaction collection.
* Identify transaction-related emails.
* Extract merchant and transaction information.
* Convert extracted information into financial records.
* Reduce manual expense entry.

### 5. Intelligent Categorization

* Organize transactions by category.
* Identify uncategorized transactions.
* Support future AI-powered financial classification.

---

## ◈ Technology Stack

| Component                  | Technology       |
| -------------------------- | ---------------- |
| Frontend                   | React            |
| Language                   | TypeScript       |
| Styling                    | CSS              |
| Charts                     | Recharts         |
| Icons                      | Lucide React     |
| Backend                    | Python           |
| API Framework              | FastAPI          |
| Database                   | SQLite           |
| Authentication Integration | Google OAuth 2.0 |
| Email Integration          | Gmail API        |
| Version Control            | Git              |

---

## ◈ Architecture

Zero Vault follows a frontend-backend architecture.

```text
ZERO-VAULT/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── types/
│   │
│   └── package.json
│
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── models/
│   ├── schemas/
│   ├── routes/
│   ├── services/
│   └── imports/
│
├── data/
│   └── zero_vault.db
│
├── .gitignore
└── README.md
```

---

## ◈ Getting Started

### Prerequisites

* Python 3.12+
* Node.js 22+
* npm
* Git

### 1. Clone the Repository

```bash
git clone YOUR_REPOSITORY_URL
cd zerovault
```

### 2. Backend Setup

```bash
cd backend

python -m venv .venv
```

Activate the virtual environment on Windows:

```powershell
.venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install fastapi uvicorn sqlalchemy
```

Start the backend:

```bash
uvicorn main:app --reload
```

Backend API:

```text
http://127.0.0.1:8000
```

API Documentation:

```text
http://127.0.0.1:8000/docs
```

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend

npm install
```

Start the development server:

```bash
npm run dev
```

---

## ◈ Design Philosophy

Zero Vault follows a minimal, futuristic fintech design philosophy.

* Dark interface.
* Premium glassmorphism.
* Minimal visual distractions.
* Clear financial information hierarchy.
* Interactive financial visualizations.
* Consistent and intuitive navigation.

**Brand:** ZeroDawn
**Product:** Zero Vault
**Tagline:** Your money, in focus.

---

## ◈ Development Roadmap

| Feature                          | Status         |
| -------------------------------- | -------------- |
| Project foundation               | Completed      |
| Backend API foundation           | Completed      |
| SQLite integration               | In Development |
| Financial dashboard              | In Development |
| Transaction management           | In Development |
| Financial analytics              | In Development |
| Gmail integration                | Prototype      |
| Automated transaction extraction | Prototype      |
| AI-powered categorization        | Planned        |
| Intelligent spending insights    | Planned        |
| Budget prediction                | Planned        |
| Advanced financial intelligence  | Planned        |

---

## ◈ Future Vision

Zero Vault is intended to evolve beyond a traditional expense tracker.

Future development will explore:

* AI-based spending analysis.
* Automatic expense categorization.
* Personalized financial recommendations.
* Spending pattern detection.
* Budget forecasting.
* Intelligent financial assistance.
* Privacy-focused financial intelligence.

---

## ◈ Privacy & Security

Financial information is sensitive.

Zero Vault is being developed with privacy and security as important design considerations.

Future development will focus on:

* Secure OAuth authentication.
* Protected API endpoints.
* Secure handling of financial data.
* Controlled access to connected services.
* Local data storage options.

---

## ◈ Part of ZeroDawn

Zero Vault is an independent product developed under **ZeroDawn**, a technology initiative focused on building intelligent software systems and AI-driven applications.

---

**ZeroDawn**
*Building beyond conventional software.*
