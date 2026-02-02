# CaloAi: Wellness AI Evaluation System - Opik Showcase

## 🏆 Project Overview

**CaloAi** is a comprehensive wellness recommendation system that uses **Opik** for advanced observability and evaluation. It leverages tracing and automated assessment to ensure every AI-generated plan is safe, personalized, and effective. Traces and evaluation metrics are seamlessly synced to the [Comet.com / Opik dashboard](https://www.comet.com/site/products/opik/) for real-time monitoring.

This project was built to demonstrate that **AI reliability is not an accident**—it's the result of rigorous evaluation, continuous monitoring, and data-driven experimentation.

## 🚀 Key Features

### 1. 📱 **Modern & Responsive Design**
- **Mobile-First Experience**: Fully responsive interface with a seamless mobile navigation menu.
- **Elegant UI**: Built with Shadcn UI and Tailwind CSS for a premium look and feel.
- **Dynamic Interactions**: Smooth transitions and interactive elements.

### 2. 🧘 **Personalized Wellness Recommendations**
Generate AI-powered guidance using Gemini 3.0 Flash:
- **Workout Plans**: Fitness level-aware routines with modifications.
- **Meditation Guides**: Stress and goal-aligned guided sessions.
- **Sleep Optimization**: Evidence-based sleep improvement plans.
- **Medical Insights**: General wellness advice based on symptoms (with safety guardrails).
- **Nutrition Advice**: Personalized meal planning and dietary tips.

### 3. 🛡️ **Multi-Dimensional LLM-as-Judge Evaluation**
Every recommendation is evaluated across **four dimensions** before being shown to the user:
- **Safety Score**: Checks for medical accuracy and dangerous advice.
- **Personalization Score**: Ensures alignment with user fitness level and goals.
- **Feasibility Score**: Verifies realistic capability match and time constraints.
- **Compliance Check**: Automated PII detection and health content validation.

### 4. 🔍 **Advanced Tracing & Observability**
- **External Monitoring**: All interactions are traced and evaluated using Opik, with data available on your Comet.com dashboard.
- **Run Tracing**: Inspect every step of the AI generation process for debugging and quality control.
- **Compliance Monitoring**: Automatically flag potential PII or safety issues.

### 5. 🧪 **Systematic Experimentation**
- **A/B Testing**: Run multi-variant experiments to compare different prompt strategies.
- **Data-Driven Improvement**: Identify the winning approach based on concrete evaluation metrics.

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **AI Model**: Gemini 3.0 Flash
- **Evaluation**: Opik (LLM-as-Judge, Tracing, Experimentation)
- **UI Component Library**: Shadcn/ui
- **Styling**: Tailwind CSS v4
- **State Management**: React Hooks

## 🏃 Getting Started

### 1. Set Environment Variables
Add your Google AI API key via Vercel or a `.env.local` file:
```
GOOGLE_GENERATIVE_AI_API_KEY=your_key_here
OPIK_API_KEY=your_opik_key_here
```

### 2. Run the Application
```bash
npm run dev
```

Visit `http://localhost:3000` to see the app in action.

### 3. Try It Out
1.  **Generate Recommendations**: Fill in your wellness profile and see the AI generate personalized advice with real-time evaluation scores.
2.  **Run Experiments**: Go to the "Run Experiments" tab to test different AI variants against each other.
3.  **Monitor Progress**: View detailed traces and historical performance metrics on the Comet.com dashboard.

## 📂 Project Structure

```
/
├── components/
│   ├── ui/               # Reusable UI components (buttons, sheets, etc.)
│   ├── mobile-nav.tsx    # Mobile navigation menu
│   ├── wellness-form.tsx # User input form
│   └── ...
├── lib/
│   ├── opik.ts           # Opik SDK integration
│   ├── evaluator.ts      # LLM-as-Judge logic
│   └── ...
├── app/                  # Next.js App Router pages
└── ...
```

## 📚 Documentation

- **[QUICK_START.md](./QUICK_START.md)** - Get running in 5 minutes
- **[SYSTEM_OVERVIEW.md](./SYSTEM_OVERVIEW.md)** - Complete system architecture
- **[DASHBOARD_GUIDE.md](./DASHBOARD_GUIDE.md)** - Understand the observability dashboard
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Technical deep dive

---

**Built for the Opik Hackathon** demonstrating the power of rigorous AI evaluation and observability.
