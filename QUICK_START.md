# Wellness AI Evaluation System - Quick Start

## Overview

This is an **Opik showcase application** demonstrating systematic AI evaluation and observability. It generates personalized wellness recommendations (workouts, meditation, sleep) and evaluates them using LLM-as-Judge across four dimensions: safety, personalization, feasibility, and compliance.

## Key Features

1. **Gemini-Powered Recommendations**: Personalized fitness, meditation, and sleep guidance
2. **LLM-as-Judge Evaluation**: Multi-dimensional quality assessment with scoring
3. **Compliance Monitoring**: PII detection and health content validation
4. **Opik Experiments**: A/B testing framework for variant comparison
5. **Real-time Dashboard**: Observability metrics and run history

## Getting Started

### 1. Set Environment Variables

You need a Google AI (Gemini) API key via Vercel AI Gateway:

In the **Vars** section of the v0 sidebar (or your environment):
```
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
```

### 2. Install Dependencies

The app comes with all required packages. If you need to reinstall:
```bash
npm install
```

Key dependencies:
- `ai@6.0.0` - Vercel AI SDK
- `@ai-sdk/google` - Gemini provider
- `zod` - Data validation

### 3. Run the Application

```bash
npm run dev
```

Visit `http://localhost:3000`

## How to Use

### Generate a Single Recommendation

1. **Go to "Generate Recommendations" tab**
2. **Select recommendation type**:
   - Personalized Workout Plan
   - Meditation & Mindfulness Guide
   - Sleep Optimization Plan
3. **Complete wellness profile**:
   - Age, fitness level, goals
   - Available time per day
   - Health conditions
   - Stress level (1-10)
   - Sleep quality (1-10)
   - Preferences (equipment, location, etc)
4. **Click "Get Wellness Recommendation"**

The system will:
- Generate a personalized recommendation using Gemini
- Evaluate it across 4 dimensions (safety, personalization, feasibility, compliance)
- Show Opik trace ID for full tracing
- Display all evaluation scores and reasoning

### Run a Variant Comparison Experiment

1. **Go to "Run Experiments" tab**
2. **Select recommendation type**
3. **Complete wellness profile** (same as above)
4. **Click to run experiment**

The system will:
- Generate 3 variants of the recommendation
- Evaluate each variant independently
- Identify the "winner" based on combined quality score
- Show detailed scores for each variant
- Store all runs in Opik

### View Observability Dashboard

1. **Go to "Opik Dashboard" tab**
2. **View real-time metrics**:
   - Total runs and completion rate
   - Average quality scores
   - Experiment counts
   - Recent run history
   - Recent experiments

Metrics auto-refresh every 3 seconds.

## Understanding Evaluation Scores

### Safety Score (0-100)
- Medical accuracy validation
- Detection of dangerous advice
- Appropriateness for user's conditions
- **Good score**: 80+

### Personalization Score (0-100)
- How tailored to user's specific profile
- Relevance to stated goals
- Accommodation of health conditions
- **Good score**: 75+

### Feasibility Score (0-100)
- Realistic for user's capability level
- Achievable with available time/resources
- No unrealistic equipment needs
- **Good score**: 80+

### Compliance Check
- **PII Detection**: Ensures no personal data exposed
- **Compliance Issues**: Counts total problems found
- **Green**: No PII detected
- **Red**: Issues detected with description

## Architecture Highlights

### Opik Integration
- **Runs**: Each recommendation gets a unique trace ID
- **Spans**: Generation and evaluation are separate spans
- **Experiments**: Multi-run comparisons are grouped experiments
- **Metadata**: User profile, type, and timing captured

### Gemini Integration
- **Recommendation Generation**: Uses `generateObject()` for structured output
- **Evaluation**: Uses LLM-as-Judge pattern with structured evaluation
- **Compliance Checking**: Custom evaluation prompts for safety/compliance

### Dashboard
- **Metrics**: Total runs, completion rate, quality scores
- **History**: Recent runs with timing and quality
- **Experiments**: Tracked variant comparisons

## API Endpoints

### POST /api/recommendations
Generates and evaluates a single recommendation.

**Request:**
```json
{
  "userProfile": {
    "age": 30,
    "fitnessLevel": "intermediate",
    "goals": ["Build muscle"],
    "availableTime": 45,
    "healthConditions": [],
    "stressLevel": 5,
    "sleepQuality": 7,
    "preferences": ["Home-based"]
  },
  "recommendationType": "workout",
  "evaluateResult": true
}
```

**Response:**
```json
{
  "success": true,
  "runId": "run-xyz...",
  "recommendation": { ... },
  "evaluation": {
    "individual_evals": { ... },
    "aggregate": { ... }
  },
  "trace": {
    "run_id": "run-xyz...",
    "spans_count": 2,
    "total_duration_ms": 5000
  }
}
```

### POST /api/experiments
Runs a multi-variant experiment with Opik tracking.

**Request:**
```json
{
  "userProfile": { ... },
  "recommendationType": "workout",
  "variantCount": 3,
  "experimentName": "Workout variants"
}
```

**Response:**
```json
{
  "success": true,
  "experimentId": "exp-xyz...",
  "winner": {
    "variant_index": 1,
    "title": "Progressive Strength Training",
    "combined_score": 82
  },
  "all_variants": [
    {
      "variant_index": 0,
      "title": "Full Body Workout",
      "scores": { "safety": 85, "personalization": 78, "feasibility": 80 },
      "pii_detected": false
    },
    ...
  ]
}
```

### GET /api/opik
Fetches observability metrics for dashboard.

**Response:**
```json
{
  "success": true,
  "metrics": {
    "total_runs": 15,
    "completed_runs": 14,
    "failed_runs": 1,
    "avg_quality_score": 78.5,
    "total_experiments": 3,
    "total_spans": 32
  },
  "recentRuns": [ ... ],
  "recentExperiments": [ ... ]
}
```

## Example Workflows

### Workflow 1: Single Recommendation (Basic)
1. Fill in wellness profile
2. Get workout/meditation/sleep recommendation
3. Review evaluation scores
4. See Opik trace ID for tracing

### Workflow 2: Variant Comparison (A/B Testing)
1. Run experiment with 3 variants
2. View winner and all variant scores
3. Compare safety/personalization/feasibility across options
4. Use experiment ID to track comparison

### Workflow 3: Monitor System Health
1. Go to dashboard
2. Check quality score trends
3. Review recent runs
4. Monitor experiment activity
5. Track completion rates

## Compliance Features

### PII Protection
- Automatically detects personal information
- Flags in compliance evaluation
- Shows detection rate on dashboard

### Medical Accuracy
- Validates health recommendations
- Checks for dangerous advice
- Ensures age-appropriate guidance

### Regulatory Compliance
- HIPAA-aligned compliance checking
- Health content validation
- Privacy protection

## Performance

- **Generation**: ~2-3 seconds (Gemini)
- **Evaluation**: ~1-2 seconds per evaluation
- **Total**: ~3-5 seconds per recommendation
- **Experiment**: ~15-20 seconds (3 variants)

## Troubleshooting

### Issue: "AI_GATEWAY_API_KEY is not set"
**Solution**: Add your Google AI API key to environment variables via Vars section

### Issue: Evaluation scores are very low
- Check user profile for conflicting data
- Try with different user profiles
- May indicate issues with specific combinations

### Issue: API taking too long
- Gemini generation can take 2-3 seconds
- Evaluations add 1-2 seconds each
- Normal behavior for 4 concurrent evaluations

### Issue: Dashboard showing no data
- Click refresh or wait for next auto-update (3 seconds)
- Run a recommendation first to generate data

## Next Steps

1. **Experiment**: Try different user profiles and see how recommendations change
2. **Run Variants**: Compare recommendations to understand A/B testing
3. **Monitor Quality**: Track how system quality evolves over time
4. **Add Custom Logic**: Extend evaluators with domain-specific checks
5. **Integrate Data**: Connect to database for persistence

## Key Files

- `/lib/opik.ts` - Opik tracing and experiment orchestration
- `/lib/evaluator.ts` - LLM-as-Judge evaluation framework
- `/lib/wellness-engine.ts` - Gemini recommendation generation
- `/app/api/recommendations/route.ts` - Single recommendation endpoint
- `/app/api/experiments/route.ts` - Experiment execution endpoint
- `/app/api/opik/route.ts` - Observability metrics endpoint
- `/components/wellness-form.tsx` - User input form
- `/components/recommendation-viewer.tsx` - Results with evaluation display
- `/components/opik-dashboard.tsx` - Real-time metrics dashboard

## Learn More

- [SYSTEM_OVERVIEW.md](./SYSTEM_OVERVIEW.md) - Detailed architecture and implementation
- [Vercel AI SDK](https://sdk.vercel.ai)
- [Gemini API](https://ai.google.dev)

Happy evaluating!
