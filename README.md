# CaloAi: Wellness AI Evaluation System - Opik Showcase

## 🏆 Project Overview

**CaloAi** is a comprehensive demonstration of **Opik-powered evaluation, observability, and experimentation** in an AI-driven wellness recommendation system. It showcases how to systematically measure, monitor, and improve AI application quality in a sensitive domain like health and wellness.

This project was built to demonstrate that **AI reliability is not an accident**—it's the result of rigorous evaluation, continuous monitoring, and data-driven experimentation.

## 🚀 Key Features

### 1. 📱 **Modern & Responsive Design**
- **Mobile-First Experience**: Fully responsive interface with a seamless mobile navigation menu.
- **Elegant UI**: Built with Shadcn UI and Tailwind CSS for a premium look and feel.
- **Dynamic Interactions**: Smooth transitions and interactive elements.

### 2. 🧘 **Personalized Wellness Recommendations**
Generate AI-powered guidance using Gemini 2.0 Flash:
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

### 4. 🔍 **Real-time Observability with Opik**
- **Live Dashboard**: View metrics, total runs, and quality scores in real-time.
- **Run Tracing**: Inspect every step of the AI generation process.
- **Compliance Monitoring**: Automatically flag potential PII or safety issues.

### 5. 🧪 **Systematic Experimentation**
- **A/B Testing**: Run multi-variant experiments to compare different prompt strategies.
- **Data-Driven Improvement**: Identify the winning approach based on concrete evaluation metrics.

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **AI Model**: Gemini 2.0 Flash
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
3.  **Monitor Dashboard**: Check the "Opik Dashboard" to see live metrics and traces of your interactions.

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
