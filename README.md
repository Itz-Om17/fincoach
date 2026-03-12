#  FinCoach – Your Intelligent Financial Companion

> **Hackstreak 2.0 Hackathon** | Team: **Status 200**

**FinCoach** is a comprehensive full-stack personal finance management platform designed to help users take control of their financial future. By combining robust transaction tracking with cutting-edge **Groq-powered AI insights**, FinCoach provides personalized recommendations, predictive forecasting, and interactive financial coaching.

The mission of FinCoach is to make financial literacy and management accessible, intuitive, and data-driven for everyone.

---

## ✨ Features

### 🤖 AI Financial Coach
- **Groq-Powered Insights:** Get real-time advice and answers to your financial queries using the high-performance Groq Llama3 model.
- **Smart Recommendations:** Receive personalized tips on budgeting and saving based on your actual spending patterns.
- **Interactive Chat:** A dedicated AI interface to discuss your financial goals and get instant feedback.

### 📊 Dynamic Financial Dashboard
- **Visual Analytics:** Real-time charts and graphs powered by **Recharts** to visualize income vs. expenses.
- **Goal Tracking:** Set, monitor, and achieve your financial milestones with visual progress bars.
- **Spending Heatmaps:** Identify where your money goes with categorized transaction breakdowns.

### 📈 Predictive Forecasting
- **Future Projections:** AI-driven forecasting to predict your month-end balance and potential savings.
- **Historical Analysis:** Deep dives into your past data to identify trends and anomalies.

### 💸 Transaction Management
- **Seamless Tracking:** Easily log income and expenses with precise categorization.
- **CSV Support:** Batch import transactions using **PapaParse** for a complete financial picture.
- **Smart Alerts:** Instant notifications for low balances or approaching budget limits.

### 🔒 Secure & Private
- **JWT Authentication:** Secure industry-standard login and signup flows.
- **Data Integrity:** MongoDB persistence ensures your financial history is safe and always available.

---

## 🛠️ Technology Stack

| Domain | Tech Used |
| :--- | :--- |
| **Frontend** | React 18 (Vite), TypeScript, Tailwind CSS |
| **UI Components** | Shadcn UI, Framer Motion, Lucide React |
| **Charts** | Recharts |
| **State Management** | TanStack Query (React Query) |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (via Mongoose) |
| **AI Engine** | Groq SDK (Llama-3-70b/8b) |
| **Authentication** | JWT, Bcryptjs |
| **Parsing** | PapaParse, XLSX |

---

## 🏗️ System Architecture

1. **Frontend:** A modern Vite-powered React SPA using TypeScript for type safety and Shadcn UI for a premium, responsive interface.
2. **Backend:** An Express.js REST API layer that handles business logic, database interactions, and integrations with the Groq AI SDK.
3. **AI Layer:** 
   * The backend communicates with **Groq's high-speed inference engine**.
   * User financial data is contextually structured and sent to the LLM to generate actionable, personalized insights.
4. **Data Flow:**
   * React (Frontend) → Express API (Backend) → MongoDB (Persistence)
   * AI Analysis: User Data + Prompt → Groq SDK → Structured JSON/Text Response → Dashboard Update.

---

## 📁 Project Structure

```text
fincoach/
├── client/                         # React Frontend (Vite + TS)
│   ├── src/
│   │   ├── components/             # Reusable UI components (Shadcn)
│   │   ├── pages/                  # Dashboard, Transactions, AI Coach, etc.
│   │   ├── lib/                    # API services and utility functions
│   │   └── hooks/                  # Custom React hooks (React Query)
│   └── package.json
│
├── backend/                        # Node.js + Express Backend
│   ├── src/
│   │   ├── routes/                 # API Endpoints (Auth, Chat, Goals, etc.)
│   │   ├── models/                 # Mongoose Schemas (User, Transaction, Goal)
│   │   ├── middleware/             # Auth guards and validation
│   │   └── index.ts                # Server entry point
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js** (v18 or higher)
* **MongoDB** (Local or Atlas)
* **Groq API Key** ([Get one here](https://console.groq.com/keys))

### Installation

1. **Clone the Repository**
   ```bash
   git clone <your-repo-link>
   cd fincoach
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend` directory:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   GROQ_API_KEY=your_groq_api_key
   ```

3. **Frontend Setup**
   ```bash
   cd ../client
   npm install
   ```

4. **Run the Application**
   ```bash
   # Terminal 1 — Backend
   cd backend
   npm run dev

   # Terminal 2 — Frontend
   cd client
   npm run dev
   ```

---

## 🔄 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | Register a new user |
| `POST` | `/api/auth/signin` | Login and receive JWT token |
| `GET` | `/api/dashboard` | Fetch aggregated financial summary |
| `GET` | `/api/transactions` | Retrieve all user transactions |
| `POST` | `/api/chat` | Send message to FinCoach AI |
| `GET` | `/api/goals` | Manage and track financial goals |

---

## 🧠 Learning Outcomes
* Building a **MERN Stack** application with **TypeScript** across the full stack.
* Integrating **High-Performance AI** using the Groq SDK for real-time coaching.
* Implementing **Data Visualization at scale with Recharts and TanStack Query.
* Mastering **Component-Driven Development** with Shadcn UI and Tailwind CSS.
* Designing a secure **Token-Based Authentication** system.

---

## 🔮 Future Enhancements
* 🏦 **Bank Sync:** Direct integration with financial institutions for automated tracking.
* 💳 **Smart Budgeting:** Auto-category detection for expenses using ML.
* 📈 **Tax Optimization:** AI-driven suggestions for tax-saving investments.
* 📱 **Mobile App:** A dedicated React Native version for on-the-go tracking.
