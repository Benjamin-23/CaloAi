# Quick Reference Guide - Wellness AI System

## API Endpoints Summary

### POST /api/recommendations
Generate and evaluate a single recommendation.

```bash
curl -X POST http://localhost:3000/api/recommendations \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

**Response:**
```json
{
  "success": true,
  "runId": "run-1705340400000-0.xxx",
  "recommendation": {
    "title": "...",
    "description": "...",
    "duration": 45,
    "difficulty": "moderate",
    "instructions": [...],
    "safety_warnings": [...],
    "modifications": [...]
  },
  "evaluation": {
    "individual_evals": {
      "safety": { score: 88, reasoning: "..." },
      "personalization": { score: 82, reasoning: "..." },
      "feasibility": { score: 85, reasoning: "..." },
      "compliance": { has_pii: false, issues: [] }
    },
    "aggregate": {
      "avg_safety_score": 88,
      "avg_personalization_score": 82,
      "avg_feasibility_score": 85,
      "pii_detection_rate": 0,
      "total_compliance_issues": 0
    }
  },
  "trace": {
    "run_id": "run-xxx",
    "spans_count": 2,
    "total_duration_ms": 4521
  }
}
```

---

### POST /api/experiments
Run multi-variant experiment comparing 3 recommendation approaches.

```bash
curl -X POST http://localhost:3000/api/experiments \
  -H "Content-Type: application/json" \
  -d '{
    "userProfile": { ... },
    "recommendationType": "meditation",
    "variantCount": 3,
    "experimentName": "Stress-relief meditation comparison"
  }'
```

**Response:**
```json
{
  "success": true,
  "experimentId": "exp-1705340400000-0.xxx",
  "experiment_name": "Stress-relief meditation comparison",
  "winner": {
    "variant_index": 0,
    "title": "Body Scan Meditation",
    "combined_score": 85
  },
  "all_variants": [
    {
      "variant_index": 0,
      "title": "Body Scan Meditation",
      "duration": 15,
      "difficulty": "easy",
      "scores": {
        "safety": 88,
        "personalization": 82,
        "feasibility": 85
      },
      "aggregated": { ... },
      "pii_detected": false
    },
    { ... },
    { ... }
  ],
  "opik_data": {
    "experiment_id": "exp-xxx",
    "total_runs": 3,
    "created_at": "2024-01-15T14:30:00Z"
  }
}
```

---

### GET /api/opik
Fetch observability metrics and dashboard data.

```bash
curl http://localhost:3000/api/opik
```

**Response:**
```json
{
  "success": true,
  "metrics": {
    "total_runs": 24,
    "completed_runs": 23,
    "failed_runs": 1,
    "avg_quality_score": 78.5,
    "total_experiments": 5,
    "total_spans": 62
  },
  "recentRuns": [
    {
      "id": "run-xxx",
      "status": "completed",
      "type": "workout",
      "quality_score": 82,
      "duration_ms": 3245,
      "timestamp": "2024-01-15T14:30:00Z"
    },
    { ... }
  ],
  "recentExperiments": [
    {
      "id": "exp-xxx",
      "name": "Workout variants",
      "runs_count": 3,
      "created_at": "2024-01-15T14:30:00Z"
    },
    { ... }
  ]
}
```

---

## Recommendation Types

### Workout Plans
**Best for:** Fitness goals, strength, endurance, flexibility  
**Duration:** 30-60 minutes  
**Includes:** Warm-up, exercises, modifications, safety warnings

**Example goals:** Build muscle, improve endurance, lose weight, increase flexibility

### Meditation Guides
**Best for:** Stress relief, sleep prep, anxiety management, focus  
**Duration:** 10-30 minutes  
**Includes:** Step-by-step instructions, breathing guidance, visualizations

**Example goals:** Stress relief, anxiety management, better focus, emotional balance

### Sleep Optimization
**Best for:** Sleep quality improvement, sleep onset, wake-up issues  
**Duration:** Evening routine (30-60 min) + tips  
**Includes:** Evening schedule, tips, environmental suggestions, habits

**Example goals:** Better sleep, earlier bedtime, reduced wake-ups, deeper rest

---

## Evaluation Scoring Guide

| Score | Safety | Personalization | Feasibility | Meaning |
|-------|--------|-----------------|-------------|---------|
| 90-100| ✓✓ Best practices | ✓✓ Highly tailored | ✓✓ Very achievable | Excellent |
| 80-89 | ✓ Safe | ✓ Well matched | ✓ Achievable | Good |
| 70-79 | Adequate | Moderate | With effort | Fair |
| 60-69 | Concerns | Generic | Challenging | Poor |
| <60   | ⚠ Dangerous | ✗ Wrong fit | ✗ Unrealistic | Unacceptable |

---

## Dashboard Metrics at a Glance

### Key Performance Indicators

```
Total Runs
├─ Completed: [count]
├─ Failed: [count]
└─ Success Rate: [%]

Average Quality Score
├─ Safety: [avg]
├─ Personalization: [avg]
└─ Feasibility: [avg]

Experiments
├─ Total: [count]
└─ Winners: [most recent]

System Health
├─ Eval Density: [spans/run]
├─ Completion Rate: [%]
└─ Last Update: [time]
```

### What the Numbers Mean

**Completion Rate >95%**: System is reliable  
**Quality Score 75-85**: Good, target range  
**PII Detection 0%**: Safe, no data leaks  
**Eval Density ~2.0**: Normal tracing level

---

## User Profile Fields

```json
{
  "age": 18-80,                           // Integer
  "fitnessLevel": "beginner|intermediate|advanced",  // Enum
  "goals": ["Build muscle", "Lose weight", ...],    // Array
  "availableTime": 10-120,                // Minutes per day
  "healthConditions": ["Arthritis", ...], // Array (can be empty)
  "stressLevel": 1-10,                    // Numeric scale
  "sleepQuality": 1-10,                   // Numeric scale  
  "preferences": ["Home-based", ...]      // Array
}
```

**Valid Goal Options:**
- Weight loss
- Build muscle
- Improve endurance
- Increase flexibility
- Stress relief
- Better sleep
- Improve focus
- Increase energy

**Valid Preference Options:**
- No equipment
- Home-based
- Outdoors
- High intensity
- Low impact
- Guided
- Solo
- Group

**Valid Health Conditions:**
- None
- Lower back pain
- Knee issues
- Asthma
- High blood pressure
- Arthritis
- Anxiety
- Diabetes

---

## Common Workflows

### Workflow 1: Get a Recommendation
```
1. Select recommendation type
2. Complete wellness profile
3. Click "Get Wellness Recommendation"
4. Review recommendation and scores
5. Check trace ID for full details
```

### Workflow 2: Run A/B Test
```
1. Go to "Run Experiments"
2. Select recommendation type
3. Complete wellness profile
4. Click to run experiment
5. Review all 3 variants
6. Note which variant won and why
```

### Workflow 3: Monitor System Health
```
1. Go to "Opik Dashboard"
2. Check quality score trend
3. Review recent runs
4. Look for failures or low scores
5. Check experiment winners
```

---

## Performance Expectations

### Timing
| Operation | Time | Notes |
|-----------|------|-------|
| Recommendation generation | 2-3s | Gemini API call |
| Single evaluation | 1-1.5s | One dimension |
| 4 evaluations | 1-2s | Concurrent |
| Total recommendation | 3-5s | Gen + evals |
| 3-variant experiment | 12-15s | 3×4-5s each |

### Tokens (Approximate)
- Single recommendation: ~2,750 tokens
- 3-variant experiment: ~8,250 tokens

### Error Rates (Target)
- Generation success: >98%
- Evaluation success: >99%
- Overall success: >95%

---

## Troubleshooting

| Problem | Likely Cause | Solution |
|---------|--------------|----------|
| "API key not set" | Missing env var | Add to Vars section |
| Scores very low (<50) | Complex profile | Try simpler profile |
| Recommendations generic | Personalization issue | Check if goals conflict |
| Slow requests (>6s) | Gemini latency | Retry or check API status |
| Failed runs | Invalid profile | Verify profile fields |
| Dashboard empty | No runs yet | Generate a recommendation |
| Experiment takes >20s | High load | Normal during peak |

---

## Debug Tips

### Check a Specific Run
```bash
curl "http://localhost:3000/api/opik?action=get-run&id=run-xyz"
```

### Check an Experiment
```bash
curl "http://localhost:3000/api/opik?action=get-experiment&id=exp-xyz"
```

### Validate User Profile
Profile should include all required fields:
- age: number (18-80)
- fitnessLevel: string ("beginner"|"intermediate"|"advanced")
- goals: array (at least 1)
- availableTime: number (10-120)
- healthConditions: array (can be empty or ["None"])
- stressLevel: number (1-10)
- sleepQuality: number (1-10)
- preferences: array (at least 1)

### Check Response Format
Every successful response includes:
- success: true
- runId or experimentId
- recommendation or variants
- evaluation or aggregate scores
- trace information

---

## File Locations

| File | Purpose |
|------|---------|
| `/lib/opik.ts` | Opik tracing infrastructure |
| `/lib/evaluator.ts` | LLM-as-Judge evaluation |
| `/lib/wellness-engine.ts` | Gemini recommendations |
| `/app/api/recommendations/route.ts` | Recommendation API |
| `/app/api/experiments/route.ts` | Experiment API |
| `/app/api/opik/route.ts` | Observability API |
| `/app/page.tsx` | Main application UI |
| `/components/wellness-form.tsx` | User input form |
| `/components/recommendation-viewer.tsx` | Results display |
| `/components/opik-dashboard.tsx` | Dashboard component |

---

## Component Props Reference

### WellnessForm
```typescript
<WellnessForm
  onSubmit={(profile: UserProfile) => void}
  loading?: boolean
/>
```

### RecommendationViewer
```typescript
<RecommendationViewer
  recommendation={{
    title, description, duration, difficulty,
    instructions, safety_warnings, modifications
  }}
  evaluation={{
    individual_evals: { safety, personalization, feasibility, compliance },
    aggregate: { avg_safety_score, ... }
  }}
  runId?: string
/>
```

### OpikDashboard
```typescript
<OpikDashboard
  autoRefresh?: boolean  // Default: true
  refreshInterval?: number  // Default: 5000ms
/>
```

---

## Environment Variables

### Required
```
GOOGLE_GENERATIVE_AI_API_KEY=sk-...
```

### Optional
None - system uses sensible defaults

---

## Quick Stats

- **Components**: 3 main (form, viewer, dashboard) + 11 UI components
- **API Routes**: 3 endpoints
- **Libraries**: AI SDK, Zod, Shadcn UI, Recharts
- **Lines of Code**: ~2,500 core logic
- **Supported Profiles**: Unlimited (unique profiles tested)
- **Recommendation Types**: 3 (workout, meditation, sleep)
- **Evaluation Dimensions**: 4 (safety, personalization, feasibility, compliance)
- **Parallel Evaluations**: 4 concurrent per recommendation
- **Experiment Variants**: 3 per experiment (configurable)
- **Dashboard Refresh**: Every 3 seconds
- **Data Retention**: Session-scoped (in-memory)

---

## Resources

- [QUICK_START.md](./QUICK_START.md) - Getting started
- [SYSTEM_OVERVIEW.md](./SYSTEM_OVERVIEW.md) - Feature overview
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Technical details
- [DASHBOARD_GUIDE.md](./DASHBOARD_GUIDE.md) - Dashboard guide
- [EVALUATION_EXAMPLES.md](./EVALUATION_EXAMPLES.md) - Example outputs
- [COMPLIANCE_FRAMEWORK.md](./COMPLIANCE_FRAMEWORK.md) - Safety & compliance

---

## Support

For issues or questions:
1. Check the relevant documentation
2. Review example outputs
3. Check API response format
4. Verify environment variables
5. See troubleshooting section

---

**Last Updated:** January 2024  
**Version:** 1.0  
**Status:** Production-ready demonstration

This system showcases Opik's evaluation and observability capabilities for AI applications.
