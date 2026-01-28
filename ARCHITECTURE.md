# Technical Architecture - Wellness AI Evaluation System

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client (React/Next.js)                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │ Wellness Form    │  │ Recommendation   │  │    Opik      │  │
│  │ (User Profile)   │  │ Viewer + Scores  │  │  Dashboard   │  │
│  └──────────────────┘  └──────────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴──────────┐
                    │   HTTP/JSON APIs   │
                    └─────────┬──────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                      API Layer (Next.js)                         │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │ /recommendations │  │  /experiments    │  │   /opik      │  │
│  │    (POST)        │  │      (POST)      │  │    (GET)     │  │
│  └──────────────────┘  └──────────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴──────────┐
                    │  Orchestration     │
                    └─────────┬──────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                    Opik Integration Layer                        │
│  ┌──────────────┐  ┌──────────────────┐  ┌────────────────┐    │
│  │ Run Creation │  │  Span Management │  │  Experiment    │    │
│  │  + Metadata  │  │  + Timing Data   │  │  Orchestration │    │
│  └──────────────┘  └──────────────────┘  └────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┼──────────┐
                    │         │          │
                    ▼         ▼          ▼
          ┌──────────────┐ ┌──────────────┐ ┌────────────────┐
          │   Gemini     │ │  Evaluator   │ │  Opik Store    │
          │  (Generation)│ │  (LLM Judge) │ │  (In-memory)   │
          └──────────────┘ └──────────────┘ └────────────────┘
```

## Core Components

### 1. Opik Integration Layer (`/lib/opik.ts`)

#### Data Structures

```typescript
interface OpikRun {
  id: string;                      // Unique run identifier
  projectName: string;             // "wellness-ai-evaluation"
  startTime: number;               // Timestamp when run started
  endTime?: number;                // Timestamp when run completed
  status: 'running' | 'completed' | 'failed';
  metadata: Record<string, any>;   // User profile, type, etc
  spans: OpikSpan[];               // List of traced operations
  result?: Record<string, any>;    // Final result with quality score
}

interface OpikSpan {
  name: string;                    // Operation name
  startTime: number;               // When operation started
  input: Record<string, any>;      // Operation input
  output: Record<string, any>;     // Operation output
  metadata: Record<string, any>;   // Duration, eval count, etc
}

interface OpikExperiment {
  id: string;
  name: string;
  description: string;
  runs: OpikRun[];                // All runs in this experiment
  createdAt: number;
}
```

#### Key Methods

```typescript
// Create a new traced run
startRun(runId: string, metadata: {...})

// Record a traced operation within a run
addSpan(runId: string, spanName: string, input, output, metadata)

// Mark run as complete with final results
endRun(runId: string, result: {...})

// Create an experiment to group multiple runs
createExperiment(id: string, name: string, description: string)

// Add a run to an experiment
addRunToExperiment(experimentId: string, run: OpikRun)

// Query runs and experiments
getRun(runId: string)
getExperiment(experimentId: string)
getAllRuns()
getAllExperiments()
```

#### Implementation Notes

- **In-memory storage**: Uses `Map<string, OpikRun>` and `Map<string, OpikExperiment>`
- **Production consideration**: Should persist to database
- **Global instance**: Singleton pattern via `getOpikClient()`
- **No async overhead**: All operations are synchronous

---

### 2. Gemini Recommendation Engine (`/lib/wellness-engine.ts`)

#### Architecture

```
User Profile Input
      │
      ▼
Prompt Engineering (customized per recommendation type)
      │
      ▼
generateObject() [AI SDK]
      │
      ▼
Gemini 3 Flash Preview API Call
      │
      ▼
Structured Output (recommendationSchema)
      │
      ▼
WellnessRecommendation Object
```

#### Schema Definition

```typescript
const recommendationSchema = z.object({
  title: z.string(),
  description: z.string(),
  duration: z.number(),
  difficulty: z.enum(['easy', 'moderate', 'hard']),
  instructions: z.array(z.string()),
  safety_warnings: z.array(z.string()),
  estimated_calories: z.number().optional(),
  modifications: z.array(z.string()),
});
```

#### Recommendation Generation

```typescript
// Type-specific generators
generateWorkoutPlan(userProfile)      // 45+ minute structured workout
generateMeditationGuide(userProfile)  // Guided meditation with steps
generateSleepPlan(userProfile)        // Evening routine + sleep tips

// Core implementation
async function generateRecommendation(prompt: string) {
  return generateObject({
    model: google('gemini-3-flash-preview'),
    schema: recommendationSchema,
    prompt: customizedPrompt,
  });
}

// Variants for A/B testing
generateRecommendationVariants(profile, type, count=3)
```

#### Prompt Engineering Strategy

Each prompt includes:
1. **Context**: "You are an expert fitness coach"
2. **User profile**: Age, fitness level, goals, constraints
3. **Requirements**: Specific, actionable, safe, personalized
4. **Format**: Structured output expectations

Example structure:
```
You are an expert [domain].
Generate a personalized [recommendation type].

User Profile: [JSON]

Create a specific [output] that:
1. [Requirement 1]
2. [Requirement 2]
3. [Requirement 3]
4. [Requirement 4]
```

---

### 3. Evaluation Framework (`/lib/evaluator.ts`)

#### Four Evaluation Dimensions

```
Recommendation Text
      │
      ├─────────────────┬─────────────┬──────────────┐
      │                 │             │              │
      ▼                 ▼             ▼              ▼
   Safety         Personalization   Feasibility   Compliance
   Evaluator      Evaluator         Evaluator     Evaluator
      │                 │             │              │
      ▼                 ▼             ▼              ▼
   Safety Score    Pers Score      Feas Score    PII + Issues
   (0-100)         (0-100)         (0-100)       (Boolean + Array)
      │                 │             │              │
      └─────────────────┴─────────────┴──────────────┘
                        │
                        ▼
            Aggregate Metrics Calculation
```

#### Evaluation Process

```typescript
async function evaluateRecommendation(
  recommendation: string,
  userProfile: UserProfile,
  evaluationType: 'safety' | 'personalization' | 'feasibility' | 'compliance'
) {
  // 1. Construct specialized evaluation prompt
  const prompt = evalPrompts[evaluationType]
    .replace('[USER_PROFILE]', JSON.stringify(userProfile))
    .replace('[RECOMMENDATION]', recommendation);
  
  // 2. Call Gemini with evaluation schema
  const result = await generateObject({
    model: google('gemini-3-flash-preview'),
    schema: evaluationSchema,
    prompt: prompt,
  });
  
  // 3. Return structured evaluation
  return result.object; // { score, reasoning, issues, etc }
}
```

#### Batch Evaluation

```typescript
async function batchEvaluate(recommendations: string[], userProfile, type) {
  // Parallel evaluation across all recommendations
  return Promise.all(
    recommendations.map(rec => evaluateRecommendation(rec, userProfile, type))
  );
}
```

#### Aggregate Metrics

```typescript
function aggregateEvaluations(evaluations: EvaluationResult[]) {
  return {
    avg_safety_score: average(evaluations.map(e => e.safety_score)),
    avg_personalization_score: average(...),
    avg_feasibility_score: average(...),
    pii_detection_rate: percentage of evaluations with PII,
    total_compliance_issues: count of all issues,
    unique_issues: deduplicated issue list,
  };
}
```

---

### 4. API Routes

#### POST /api/recommendations

```
Request Flow:
1. Validate user profile
2. Create Opik run with metadata
3. Add input span to run
4. Call wellness-engine (generateWorkoutPlan, etc)
5. Add generation span to run
6. Call evaluator (4 evaluation types in parallel)
7. Add evaluation span to run
8. Calculate aggregate metrics
9. End run with results
10. Return recommendation + evaluation + traceId

Timing:
- Generation: 2-3 seconds
- Evaluations: 1-2 seconds each (4 concurrent)
- Total: 3-5 seconds
```

#### POST /api/experiments

```
Request Flow:
1. Create Opik experiment with ID
2. Loop for each variant (default 3):
   a. Create variant run
   b. Generate recommendation variant
   c. Evaluate variant (3 types: safety, personalization, feasibility)
   d. Record scores
   e. End variant run
   f. Add to experiment
3. Compare all variants
4. Identify winner (highest combined score)
5. Return all results + winner

Winner Calculation:
combined_score = (safety + personalization + feasibility) / 3

Timing:
- Per variant: ~4-5 seconds
- Total 3 variants: 12-15 seconds
```

#### GET /api/opik

```
Metrics Calculation:
- Total runs: count all runs
- Completed runs: filter status === 'completed'
- Failed runs: filter status === 'failed'
- Avg quality score: average of all run results.quality_score
- Total experiments: count all experiments
- Total spans: sum of spans across all runs

Returns:
{
  metrics: { total_runs, completed_runs, ... },
  recentRuns: last 5 runs with details,
  recentExperiments: last 5 experiments with details
}
```

---

## Data Flow in Request Cycle

### Single Recommendation Request

```
1. Client Request
   POST /api/recommendations
   {
     userProfile: { age, fitness, goals, ... },
     recommendationType: 'workout',
     evaluateResult: true
   }
   
2. API Handler
   - Parse request
   - Create Opik run (startTime: t0)
   
3. Generate Phase
   - Call generateWorkoutPlan(userProfile)
   - Gemini returns structured recommendation (t1 - t0 = ~2-3s)
   - Add span: "generate_recommendation"
   
4. Evaluate Phase (Parallel)
   - Call evaluateRecommendation(..., 'safety')
   - Call evaluateRecommendation(..., 'personalization')
   - Call evaluateRecommendation(..., 'feasibility')
   - Call evaluateRecommendation(..., 'compliance')
   - All complete in ~1-2s (concurrent)
   - Add span: "evaluate_recommendation"
   
5. Aggregation
   - Calculate aggregate metrics
   - Determine quality_score
   
6. End Run
   - endRun(runId, { recommendation, evaluation, quality_score })
   - Set endTime: t2
   
7. Response
   {
     success: true,
     runId: 'run-abc...',
     recommendation: { title, description, instructions, ... },
     evaluation: { individual_evals, aggregate },
     trace: { run_id, spans_count: 2, duration_ms: t2-t0 }
   }
```

---

## Multi-Variant Experiment Flow

```
1. Create Experiment
   createExperiment(id, name, description)
   
2. For each variant (0, 1, 2):
   a. startRun(`variant-${experimentId}-${i}`)
   b. Generate variant with modified prompt
   c. Evaluate variant (safety, personalization, feasibility)
   d. Calculate aggregate scores
   e. endRun(runId, variant data)
   f. addRunToExperiment(experimentId, run)
   
3. Compare Results
   - Safety scores: [85, 78, 82]
   - Personalization: [88, 76, 71]
   - Feasibility: [90, 80, 75]
   - Combined: [87.7, 78, 76]
   - Winner: Variant 0
   
4. Response
   {
     experimentId,
     winner: { variant_index, title, score },
     all_variants: [ { index, scores, pii_detected }, ... ]
   }
```

---

## Gemini Integration

### Model Selection
- **Model**: `gemini-3-flash-preview` (latest fast model)
- **Reason**: Ideal balance of speed and quality for structured outputs
- **Rate Limits**: Standard Vercel AI Gateway limits apply

### Structured Output
Uses AI SDK's `generateObject()` with Zod schemas:

```typescript
// Recommendation generation
const result = await generateObject({
  model: google('gemini-3-flash-preview'),
  schema: recommendationSchema,  // Zod schema
  prompt: customPrompt,
});
// Returns: { object: WellnessRecommendation }

// Evaluation
const eval = await generateObject({
  model: google('gemini-3-flash-preview'),
  schema: evaluationSchema,
  prompt: evaluationPrompt,
});
// Returns: { object: EvaluationResult }
```

### Error Handling
- Fallback responses for generation failures
- Graceful degradation for evaluation errors
- Detailed error logging for debugging

---

## Storage & Persistence

### Current Implementation
- **Type**: In-memory (JavaScript Maps)
- **Lifecycle**: Session-scoped (cleared on server restart)
- **Use case**: Development and demonstration

### Production Architecture
Should implement:

```typescript
interface PersistenceLayer {
  // Runs
  saveRun(run: OpikRun): Promise<void>;
  getRun(id: string): Promise<OpikRun | null>;
  listRuns(filters: {}): Promise<OpikRun[]>;
  
  // Experiments
  saveExperiment(exp: OpikExperiment): Promise<void>;
  getExperiment(id: string): Promise<OpikExperiment | null>;
  listExperiments(filters: {}): Promise<OpikExperiment[]>;
  
  // Analytics
  getMetrics(): Promise<SystemMetrics>;
  getRunsByDateRange(from, to): Promise<OpikRun[]>;
}
```

Options:
- PostgreSQL + Prisma ORM
- MongoDB for document storage
- DynamoDB for serverless
- Opik Cloud API for native integration

---

## Performance Characteristics

### Request Latency
```
Recommendation Request:
- Generation: 2-3 seconds (Gemini)
- Safety eval: 1-1.5 seconds
- Personalization eval: 1-1.5 seconds  (parallel)
- Feasibility eval: 1-1.5 seconds      (parallel)
- Compliance eval: 1-1.5 seconds       (parallel)
- Total: ~3-5 seconds (generation sequential, evals parallel)

Experiment Request:
- 3 variants × 4-5 seconds each: ~12-15 seconds
```

### Token Usage (Approximate)
```
Single Recommendation:
- Generation prompt: ~200 tokens
- Generation output: ~150 tokens
- 4 evaluation prompts: ~400 tokens each = 1,600
- 4 evaluation outputs: ~200 tokens each = 800
- Total: ~2,750 tokens per recommendation

3-Variant Experiment:
- ~8,250 tokens (3× single)
```

### Scaling Considerations
- Sequential processing: Each request is independent
- Parallel evaluations: 4 evals happen concurrently
- No caching: Each request generates new content
- Memory-bounded: ~1-10MB per 100 runs in memory

---

## Testing & Validation

### Unit Tests
```typescript
// Test evaluation schema
const mockEval = {
  safety_score: 85,
  personalization_score: 80,
  feasibility_score: 90,
  compliance_issues: [],
  has_pii: false,
  reasoning: "Test"
};
expect(evaluationSchema.parse(mockEval)).toBeDefined();

// Test recommendation schema
const mockRec = {
  title: "Test Workout",
  description: "Test description",
  duration: 30,
  difficulty: "moderate",
  instructions: ["Step 1", "Step 2"],
  safety_warnings: ["Warning 1"],
  modifications: ["Mod 1"]
};
expect(recommendationSchema.parse(mockRec)).toBeDefined();
```

### Integration Tests
```typescript
// Test full recommendation flow
const profile: UserProfile = { ... };
const rec = await generateWorkoutPlan(profile);
expect(rec.title).toBeDefined();
expect(rec.duration).toBeGreaterThan(0);

// Test evaluation flow
const eval = await evaluateRecommendation(
  rec.description,
  profile,
  'safety'
);
expect(eval.safety_score).toBeGreaterThanOrEqual(0);
expect(eval.safety_score).toBeLessThanOrEqual(100);
```

---

## Deployment Considerations

### Environment Variables
```
GOOGLE_GENERATIVE_AI_API_KEY=sk-...
```

### Vercel Deployment
- Works with Vercel's Edge Runtime
- Gemini calls via Vercel AI Gateway (no additional config)
- In-memory storage resets on deployment

### Scalability
- Stateless API routes (no session affinity needed)
- In-memory storage not suitable for multi-instance
- Migrate to database for production multi-instance setup

---

## Future Enhancements

1. **Persistence**: Add database backend
2. **Caching**: Cache evaluations for similar profiles
3. **Advanced Filtering**: Query runs by type, date, quality
4. **Custom Metrics**: Domain-specific evaluation criteria
5. **Feedback Loop**: Incorporate user ratings into training
6. **Optimization**: Opik Agent Optimizer for prompt tuning
7. **Webhooks**: Real-time alerts on quality drops
8. **Analytics Dashboard**: More sophisticated trend analysis

This architecture demonstrates how to build systematic AI evaluation and observability into your applications using Opik.
