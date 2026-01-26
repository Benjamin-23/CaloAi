# Wellness AI Evaluation System - Opik Showcase

A comprehensive demonstration of **Opik-powered evaluation and observability** in an AI application, showcasing systematic quality measurement, compliance monitoring, and multi-variant experimentation.

## System Architecture

### Core Components

#### 1. **Opik Integration Layer** (`/lib/opik.ts`)
- **Run Tracking**: Each recommendation generation creates a traced run with unique ID
- **Span Management**: Automatically captures spans for different operations (generation, evaluation)
- **Experiment Orchestration**: Groups multiple runs into structured experiments
- **Metadata Capture**: Records execution context, timing, and results

```
Run (generation + evaluation)
├── Span: generate_recommendation
│   ├── Input: user profile
│   ├── Output: recommendation
│   └── Metadata: duration, type
├── Span: evaluate_recommendation
│   ├── Input: recommendation text
│   ├── Output: evaluation scores
│   └── Metadata: eval count, duration
└── Result: quality_score, recommendation, evaluation
```

#### 2. **Gemini-Powered Recommendation Engine** (`/lib/wellness-engine.ts`)
Generates personalized wellness recommendations using Gemini 2.0 Flash with structured output:
- **Workout Plans**: Fitness level-aware routines with modifications
- **Meditation Guides**: Stress-level and goal-aligned meditation sessions
- **Sleep Optimization**: Evidence-based sleep improvement plans

Uses AI SDK's `generateObject()` for reliable structured outputs matching the `recommendationSchema`.

#### 3. **LLM-as-Judge Evaluation System** (`/lib/evaluator.ts`)
Multi-dimensional evaluation framework that scores recommendations:

**Four Evaluation Dimensions:**
1. **Safety Scoring** (0-100)
   - Medical accuracy validation
   - Detection of dangerous advice
   - Appropriateness for health conditions
   
2. **Personalization Scoring** (0-100)
   - Alignment with user's fitness level
   - Goal relevance
   - Condition accommodation
   
3. **Feasibility Scoring** (0-100)
   - Realistic for the user's capability
   - Fits available time
   - No unrealistic equipment requirements
   
4. **Compliance Checking**
   - **PII Detection**: Flags personal identifiable information
   - **Medical Claims**: Validates unsubstantiated health claims
   - **Regulatory Compliance**: Checks health content regulations
   - **Privacy Concerns**: HIPAA and data protection validation

**Aggregate Metrics:**
- Average scores across all dimensions
- PII detection rate (%) - tracks false positive tradeoff
- Compliance issue tracking and categorization

#### 4. **Experiment Framework** (`/app/api/experiments/route.ts`)
Systematic variant comparison for continuous improvement:

**Experiment Workflow:**
1. Generate multiple recommendation variants (default: 3)
2. Evaluate each variant independently across all 4 dimensions
3. Aggregate scores for each variant
4. Identify winner based on combined quality score
5. Store all runs in Opik for analysis

**Use Cases:**
- A/B test different recommendation strategies
- Validate model updates
- Optimize for specific user profiles
- Measure improvement over time

#### 5. **API Layer**
- **POST /api/recommendations**: Single recommendation with tracing + evaluation
- **POST /api/experiments**: Multi-variant comparison with Opik experiment tracking
- **GET /api/opik**: Observability metrics and dashboard data

#### 6. **Observability Dashboard** (`/components/opik-dashboard.tsx`)
Real-time metrics visualization:
- Total runs and completion rates
- Average quality scores
- Experiment counts and variant comparisons
- Evaluation span density
- Recent run history
- Experiment timeline

### Data Flow

```
User Profile
    ↓
Wellness Form Input
    ↓
API Request (Recommendation)
    ↓
Opik Run Created
    ├─ Span: Gemini Generation
    │  └─ Structured Output
    ├─ Span: Multi-eval Assessment
    │  ├─ Safety Evaluation
    │  ├─ Personalization Evaluation
    │  ├─ Feasibility Evaluation
    │  └─ Compliance Evaluation
    └─ Run Complete with Results
         ↓
    Recommendation Viewer + Evaluation Scores
         ↓
    Opik Dashboard Updated
```

## Key Features

### 1. Tracing & Observability
- Every recommendation generation is automatically traced
- Each evaluation creates a separate span for granular observability
- Full execution timeline available for debugging and analysis
- Span metadata captures operation-specific context

### 2. Systematic Quality Measurement
- **Multi-dimensional scoring**: Not just one metric, but four independent quality dimensions
- **Confidence through consensus**: Multiple evaluation types create a comprehensive quality picture
- **Safety-first approach**: Safety scores are prioritized in recommendations
- **Fairness tracking**: PII detection rate helps monitor false positive tradeoff

### 3. Compliance & Safety Monitoring
- **Automated PII detection**: Flags sensitive information in recommendations
- **Medical accuracy validation**: Checks for supported health claims
- **Regulatory alignment**: Ensures content meets health regulations
- **Privacy protection**: HIPAA-aligned compliance checking
- **Dashboard visibility**: Compliance metrics prominently displayed

### 4. A/B Testing & Experimentation
- **Variant generation**: Create multiple recommendation approaches
- **Systematic comparison**: Evaluate all variants under identical conditions
- **Winner identification**: Data-driven selection of best approach
- **Regression testing**: Track quality across model versions
- **Historical comparison**: Full experiment archive for trend analysis

### 5. Real-time Observability
- **Live dashboard**: Real-time metrics and run history
- **Auto-refresh**: 3-second refresh interval for current activity
- **Detailed run history**: Last 5 runs with quality scores and timing
- **Experiment tracking**: All experiments with run counts and metadata

## Usage Examples

### Example 1: Generate and Evaluate a Workout Plan
```bash
curl -X POST http://localhost:3000/api/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "userProfile": {
      "age": 35,
      "fitnessLevel": "intermediate",
      "goals": ["Build muscle", "Improve endurance"],
      "availableTime": 45,
      "healthConditions": [],
      "stressLevel": 6,
      "sleepQuality": 7,
      "preferences": ["Home-based", "No equipment"]
    },
    "recommendationType": "workout",
    "evaluateResult": true
  }'
```

**Response includes:**
- Generated workout recommendation with instructions
- Individual evaluations (safety, personalization, feasibility, compliance)
- Aggregate quality metrics
- Opik run ID for tracing

### Example 2: Run A/B Experiment on Meditation Guides
```bash
curl -X POST http://localhost:3000/api/experiments \
  -H "Content-Type: application/json" \
  -d '{
    "userProfile": {
      "age": 28,
      "fitnessLevel": "beginner",
      "goals": ["Stress relief"],
      "availableTime": 20,
      "healthConditions": ["Anxiety"],
      "stressLevel": 8,
      "sleepQuality": 5,
      "preferences": ["Low impact"]
    },
    "recommendationType": "meditation",
    "variantCount": 3,
    "experimentName": "Anxiety-focused meditation comparison"
  }'
```

**Response includes:**
- All 3 variants with individual quality scores
- Winner identification with combined score
- Detailed evaluation breakdown per variant
- Experiment ID for tracking

### Example 3: Monitor Observability Metrics
```bash
curl http://localhost:3000/api/opik
```

**Response includes:**
- Aggregate metrics (total runs, quality, completion rate)
- Recent runs (last 5) with details
- Recent experiments (last 5) with run counts
- Total span count and evaluation density

## Opik Capabilities Demonstrated

1. **Run Tracing** ✓
   - Automatic run creation with metadata
   - Span-based operation tracking
   - Execution timeline with timing

2. **Structured Evaluation** ✓
   - Multi-dimensional quality scoring
   - Custom evaluation prompts
   - Compliance checking and PII detection
   - Aggregate metrics calculation

3. **Experiment Management** ✓
   - Multi-run experiment grouping
   - Variant comparison infrastructure
   - Winner identification
   - Historical experiment tracking

4. **Observability Dashboard** ✓
   - Real-time metrics visualization
   - Run and experiment history
   - Quality trend tracking
   - Compliance monitoring

5. **Data-Driven Insights** ✓
   - Quality score aggregation
   - Experiment result analysis
   - Compliance rate monitoring
   - Performance trend tracking

## Compliance & Safety Features

### PII Detection
- Monitors for personally identifiable information in recommendations
- Tracks detection rate as a percentage
- Dashboard shows PII risk level

### Safety Scoring
- Validates medical accuracy
- Checks for dangerous advice
- Ensures age/condition appropriateness

### Regulatory Alignment
- Health content compliance validation
- Medical claim substantiation
- Privacy regulation adherence (HIPAA-like)

### Compliance Dashboard
- Issues detected and categorized
- False positive rate visibility
- Trend monitoring over time

## Performance Metrics

- **Average Generation Time**: ~2-3 seconds (Gemini)
- **Evaluation Time**: ~1-2 seconds per evaluation type
- **Total Request Time**: ~3-5 seconds (generation + 4 evaluations)
- **Experiment Run Time**: ~15-20 seconds (3 variants × 5 seconds each)
- **Span Count per Run**: 2 (generation + evaluation)
- **Evaluation Span Density**: ~2-4 spans per run

## Architecture Benefits

1. **Systematic Quality Control**: Multi-dimensional scoring prevents single-metric bias
2. **Safety First**: Compliance and safety checks are first-class citizens
3. **Transparency**: Full tracing and evaluation visibility for stakeholders
4. **Experimentation**: Built-in A/B testing infrastructure
5. **Observability**: Real-time dashboard for monitoring system health
6. **Scalability**: Opik handles trace volume and metric aggregation

## Integration with Vercel AI SDK

Uses AI SDK 6.0 with Gemini 2.0 Flash:
- `generateObject()` for structured recommendation generation
- `generateText()` for evaluation prompt responses
- Built-in error handling and retries
- Compatible with Vercel AI Gateway

## Next Steps for Production

1. **Persistence Layer**: Add database to store runs, experiments, and evaluations
2. **Advanced Filtering**: Query experiments by date range, model version, user cohort
3. **Regression Testing**: Automated variant testing on fixed datasets
4. **Model Optimization**: Use Opik Agent Optimizer for prompt tuning
5. **Alert System**: Notify on quality drops or compliance violations
6. **Custom Metrics**: Add domain-specific evaluation criteria
7. **User Feedback Loop**: Incorporate real user ratings into evaluation data

This system demonstrates how Opik can systematically track, evaluate, and improve AI applications with data-driven insights.
