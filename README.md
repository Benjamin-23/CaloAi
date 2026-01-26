# Wellness AI Evaluation System - Opik Showcase

A comprehensive demonstration of **Opik-powered evaluation, observability, and experimentation** in an AI-driven wellness recommendation system. Shows how to systematically measure, monitor, and improve AI application quality.

## What This Is

This is an **Opik feature showcase** that demonstrates:

1. ✓ **Systematic Run Tracing** - Every recommendation generation creates traced runs with spans
2. ✓ **LLM-as-Judge Evaluation** - Multi-dimensional quality scoring (safety, personalization, feasibility, compliance)
3. ✓ **Compliance Monitoring** - Automated PII detection and health content validation
4. ✓ **Multi-Variant Experiments** - A/B testing framework with systematic comparison
5. ✓ **Real-time Observability** - Live dashboard with metrics and run history
6. ✓ **Data-Driven Insights** - Quality trends and experiment analysis

**Built with:**
- Gemini 2.0 Flash (personalized recommendations)
- Vercel AI SDK (structured outputs)
- Next.js 16 (full-stack application)
- Shadcn UI (elegant interface)

## Quick Links

- 📖 **[QUICK_START.md](./QUICK_START.md)** - Get running in 5 minutes
- 🏗️ **[SYSTEM_OVERVIEW.md](./SYSTEM_OVERVIEW.md)** - Complete system architecture
- 📊 **[DASHBOARD_GUIDE.md](./DASHBOARD_GUIDE.md)** - Understand the observability dashboard
- 💻 **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Technical deep dive
- 📋 **[EVALUATION_EXAMPLES.md](./EVALUATION_EXAMPLES.md)** - Real example outputs

## Core Features

### 1. Personalized Wellness Recommendations

Generate AI-powered guidance using Gemini:
- **Workout Plans**: Fitness level-aware routines with modifications
- **Meditation Guides**: Stress and goal-aligned guided sessions
- **Sleep Optimization**: Evidence-based sleep improvement plans

Each recommendation is **personalized** to user profile:
- Age, fitness level, health conditions
- Available time, goals, preferences
- Stress level and sleep quality

### 2. Multi-Dimensional LLM-as-Judge Evaluation

Every recommendation is evaluated across **four dimensions**:

```
┌─────────────────────────────────────────┐
│ Safety Score (0-100)                    │
│ ✓ Medical accuracy                      │
│ ✓ Dangerous advice detection            │
│ ✓ Condition appropriateness             │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Personalization Score (0-100)           │
│ ✓ Tailored to fitness level             │
│ ✓ Goal alignment                        │
│ ✓ Condition accommodation               │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Feasibility Score (0-100)               │
│ ✓ Realistic capability match            │
│ ✓ Time constraint fit                   │
│ ✓ Equipment requirements                │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Compliance Check                        │
│ ✓ PII detection & prevention            │
│ ✓ Medical accuracy validation           │
│ ✓ Regulatory alignment                  │
└─────────────────────────────────────────┘
```

### 3. Automated Compliance & Safety

- **PII Detection**: Automatically flags personal data exposure
- **Medical Validation**: Checks for harmful or unsubstantiated claims
- **Regulatory Compliance**: Ensures health content meets standards
- **Dashboard Visibility**: Safety metrics prominently displayed

### 4. Systematic Experimentation

Compare multiple recommendation approaches with A/B testing:

```
Run Experiment (3 variants)
│
├─ Variant 0: [Evaluate] → Score: 87%
├─ Variant 1: [Evaluate] → Score: 78%
└─ Variant 2: [Evaluate] → Score: 76%
         │
         └─ Winner: Variant 0 ✓
```

Perfect for:
- Testing new recommendation strategies
- Validating model updates
- Optimizing for specific user segments
- Continuous improvement cycles

### 5. Real-time Observability

Live dashboard showing:
- **Metrics**: Total runs, completion rate, avg quality
- **History**: Recent runs with scores and timing
- **Experiments**: Tracked variant comparisons
- **Compliance**: PII detection and issue counts

Auto-refreshes every 3 seconds for current activity.

## Architecture at a Glance

```
┌────────────────────────┐
│   React Frontend       │
│ (Forms + Dashboard)    │
└───────────┬────────────┘
            │
┌───────────▼────────────┐
│   Next.js API Routes   │
│ (/recommendations      │
│  /experiments          │
│  /opik)                │
└───────────┬────────────┘
            │
┌───────────▼────────────────────────┐
│   Opik Layer                        │
│ (Tracing + Run Management)          │
└───────────┬────────────────────────┘
            │
    ┌───────┼────────┐
    │       │        │
┌───▼──┐ ┌─▼──────┐ ┌▼───────┐
│Gemini│ │Evaluator│ │ Storage │
│      │ │ (Judge) │ │(In-mem) │
└──────┘ └────────┘ └────────┘
```

## Usage Examples

### Generate a Workout Recommendation
```bash
# Go to "Generate Recommendations" tab
# 1. Select "Personalized Workout Plan"
# 2. Fill wellness profile
# 3. Click "Get Wellness Recommendation"
# Result: Personalized workout with 4 evaluation scores + trace ID
```

### Run A/B Experiment
```bash
# Go to "Run Experiments" tab
# 1. Select recommendation type
# 2. Fill wellness profile
# 3. Click to run experiment
# Result: 3 variants evaluated, winner identified, detailed scores
```

### Monitor System Health
```bash
# Go to "Opik Dashboard" tab
# View real-time metrics:
# - Total runs and completion rate
# - Average quality scores
# - Recent run history
# - Experiment activity
```

## Key Metrics

### Quality Scoring
- **0-49**: Poor quality - review generation/evaluation
- **50-74**: Fair quality - acceptable but improvements needed
- **75-84**: Good quality - target range for production
- **85+**: Excellent quality - best practices

### Performance
- **Generation**: 2-3 seconds (Gemini)
- **Evaluation**: 1-2 seconds per evaluation (4 concurrent)
- **Total per recommendation**: 3-5 seconds
- **Experiment (3 variants)**: 12-15 seconds

### Reliability
- **Target completion rate**: >95%
- **Target quality score**: >78%
- **Average spans per run**: 2.0-2.5

## Files & Structure

```
/
├── lib/
│   ├── opik.ts              # Opik tracing + experiment framework
│   ├── evaluator.ts         # LLM-as-Judge evaluation system
│   ├── wellness-engine.ts   # Gemini recommendation generation
│   └── utils.ts
├── app/
│   ├── api/
│   │   ├── recommendations/  # Single recommendation endpoint
│   │   ├── experiments/      # Experiment execution endpoint
│   │   └── opik/            # Observability metrics endpoint
│   ├── page.tsx             # Main application
│   ├── layout.tsx           # Root layout
│   └── globals.css          # Styling
├── components/
│   ├── wellness-form.tsx    # User profile input
│   ├── recommendation-viewer.tsx  # Results + scores
│   └── opik-dashboard.tsx   # Real-time metrics
└── public/
    └── (app icons)
```

## Getting Started

### 1. Set Environment Variables
Add your Google AI API key via Vercel:
```
GOOGLE_GENERATIVE_AI_API_KEY=your_key_here
```

### 2. Run the Application
```bash
npm run dev
```

Visit `http://localhost:3000`

### 3. Try It Out
1. Go to "Generate Recommendations"
2. Fill in your wellness profile
3. Get a personalized recommendation with evaluation scores
4. View Opik traces and metrics on dashboard

## Documentation

| Document | Purpose |
|----------|---------|
| **QUICK_START.md** | Get running and basic usage |
| **SYSTEM_OVERVIEW.md** | Complete feature description |
| **ARCHITECTURE.md** | Technical implementation details |
| **DASHBOARD_GUIDE.md** | Understanding observability metrics |
| **EVALUATION_EXAMPLES.md** | Real example outputs and scoring |

## Opik Capabilities Demonstrated

### ✓ Run Tracing
- Automatic run creation with metadata
- Span-based operation tracking  
- Execution timeline with timing

### ✓ Structured Evaluation
- Multi-dimensional quality scoring
- Custom evaluation prompts
- Compliance checking and safety validation
- Aggregate metrics calculation

### ✓ Experiment Management
- Multi-run experiment grouping
- Variant comparison infrastructure
- Winner identification
- Historical tracking

### ✓ Observability
- Real-time metrics dashboard
- Run and experiment history
- Quality trend tracking
- Compliance monitoring

### ✓ Data-Driven Insights
- Quality score aggregation
- Experiment result analysis
- Performance trend tracking
- Safety/fairness tradeoff monitoring

## Safety & Compliance

This system is designed with safety as a first-class concern:

1. **PII Protection**: Automatically detects and flags personal information
2. **Medical Safety**: Validates recommendations for dangerous advice
3. **Compliance**: Checks health content against regulatory standards
4. **Transparency**: All evaluations and reasoning are visible
5. **Auditability**: Full trace history for compliance review

## Performance Characteristics

- **Recommendation generation**: 2-3 seconds
- **Multi-dimensional evaluation**: 1-2 seconds (4 concurrent)
- **Total per request**: 3-5 seconds
- **Experiment (3 variants)**: 12-15 seconds
- **Token efficiency**: ~2,750 tokens per recommendation

## Scaling & Production

Current implementation uses **in-memory storage** suitable for:
- Demonstrations and prototypes
- Single-session operation
- Feature showcases

For production, add:
- Database persistence (PostgreSQL, MongoDB, etc)
- Request queuing for rate limiting
- Caching for similar user profiles
- Advanced filtering and analytics
- Real-time alerting

## Next Steps

1. **Explore**: Try different user profiles and see recommendations vary
2. **Experiment**: Run A/B tests to compare approaches
3. **Monitor**: Check dashboard for quality trends
4. **Extend**: Add custom evaluation criteria
5. **Deploy**: Add persistence and scale to production

## Technology Stack

- **Language**: TypeScript
- **Framework**: Next.js 16 (App Router)
- **UI**: React 19 + Shadcn/ui
- **Styling**: Tailwind CSS v4
- **AI**: Vercel AI SDK v6 + Gemini 2.0
- **Validation**: Zod
- **Data**: In-memory (production: database)

## Learn More

- [Vercel AI SDK Documentation](https://sdk.vercel.ai)
- [Gemini API](https://ai.google.dev)
- [Opik Documentation](https://docs.opik.com)
- [Next.js Documentation](https://nextjs.org)

## Key Insights

This system demonstrates:

1. **Systematic Quality Control**: Multi-dimensional scoring prevents single-metric bias
2. **Safety First**: Compliance and safety are built-in, not afterthoughts
3. **Transparency**: Full tracing and evaluation visibility for stakeholders
4. **Experimentation Culture**: Built-in A/B testing infrastructure
5. **Observable Systems**: Real-time dashboards for system health monitoring
6. **Data-Driven Decisions**: All improvements backed by metrics and experiments

Perfect for showcasing how to build production-grade AI applications with systematic evaluation and observability.

---

**Ready to get started?** See [QUICK_START.md](./QUICK_START.md) for setup instructions.

**Want to understand how it works?** Check [SYSTEM_OVERVIEW.md](./SYSTEM_OVERVIEW.md) for a complete feature walkthrough.

**Need technical details?** Read [ARCHITECTURE.md](./ARCHITECTURE.md) for implementation specifics.
