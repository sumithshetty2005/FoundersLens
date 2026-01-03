# FoundersLens: Your Autonomous AI Co-Founder

FoundersLens is an AI-powered market intelligence platform designed to democratize startup validation for entrepreneurs and students. By deploying a fleet of autonomous AI agents, the system transforms raw ideas into data-driven strategies in seconds, eliminating the expensive "Validation Tax" typically associated with professional market research.


---

### The Vision
> "Validate your startup idea in seconds, not weeks, with autonomous AI agents."

---

### Key Capabilities

* **Instant Viability Scoring**: Receive a real-time risk assessment score (0-100) for any business concept.
* **Autonomous Intelligence**: Specialist agents actively search the live web to ensure all insights are grounded in current data rather than static training sets.
* **Interactive Data Dashboard**: Explore visual risk assessments, dynamic market share charts, and comprehensive SWOT analyses.
* **Strategic Roadmap**: Access a generated, step-by-step Go-to-Market (GTM) plan tailored specifically to identified market gaps.
* **Financial Projections**: Review AI-estimated revenue per user, break-even points, and projected growth rates.
* **Professional Reporting**: The system automatically synthesizes research into a structured "Investment Memo" style report.

---

### Technical Architecture & Google Integration

FoundersLens is built on a high-performance stack optimized for agentic workflows, utilizing modern Google technologies for reliability and speed.

#### Development & Orchestration
* **Google Antigravity IDE**: Our core development environment used to build and optimize complex autonomous agent logic.
* **Google Agent Development Kit**: The primary framework used to manage multi-agent workflows and enable seamless communication between system components.

#### AI & Data Stack
* **Google Gemini 2.5 Flash**: Our core reasoning engine, selected for high-speed synthesis and cost-effective processing.
* **Google Search Tool**: Provides grounding for AI responses, ensuring they are based on real-world, live facts.

#### Full Stack Technologies
* **Frontend**: Built with React, Vite, TypeScript, and Tailwind CSS for a responsive, modern interface.
* **Backend**: A Python Flask API serves as the orchestration layer for our AI agents.
* **Visualization**: Utilizes Recharts for data visualization and Mermaid.js for dynamic flowcharts.

---

### How the Agents Work

Using the **Google Agent Development Kit**, our system employs a "Master-Worker" architecture:

1. **Master Agent**: Defines the research scope, manages the workflow, and synthesizes the final strategic report.
2. **Search Agent**: A specialist tool-user that queries Google Search to ground every insight in real-time market data.

---

### Installation & Setup

#### Prerequisites
* **Node.js**: Required for the frontend environment and package management.
* **Python 3.10+**: Required for backend logic.
* **Google Gemini API Key**: Required for AI processing.

#### Setup Steps

1. **Clone the Repository**
   ```bash
   git clone [https://github.com/sumithshetty2005/FoundersLens.git](https://github.com/sumithshetty2005/FoundersLens.git)
   cd FoundersLens

2.  **Frontend Setup (Node.js):**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

3.  **Backend Setup (Python):**
    ```bash
    cd backend
    pip install -r requirements.txt
    python app.py
    ```

---
