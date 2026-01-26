# Opik Dashboard Guide - Understanding System Observability

The Opik Dashboard provides real-time visibility into your wellness recommendation system's performance and quality.

## Dashboard Overview

### Key Metrics Section

The dashboard displays 6 primary metrics cards:

#### 1. Total Runs
```
Display: 24
Breakdown: 23 completed, 1 failed
```

**What it means:**
- Total number of recommendation generation and evaluation runs
- Shows successful vs failed executions
- Tracks system reliability

**How to improve:**
- Failed runs indicate errors in generation or evaluation
- Check error logs for failed runs
- May indicate Gemini API issues or invalid user profiles

---

#### 2. Avg Quality Score
```
Display: 78.5
```

**What it means:**
- Average combined score across all recommendations (0-100)
- Calculated from aggregate of safety, personalization, and feasibility scores
- Directly reflects recommendation quality

**How to improve:**
- Score below 75: Review generation prompts, user profiles may be conflicting
- Score 75-85: Solid quality, look for edge cases to improve
- Score 85+: Excellent performance, maintain current approach

**Factors affecting score:**
- User profile variety (diverse profiles lead to lower average)
- Recommendation type (some types naturally score higher)
- Model version (Gemini updates may affect scoring)

---

#### 3. Total Experiments
```
Display: 5
```

**What it means:**
- Number of multi-variant experiments completed
- Each experiment compares 3 recommendations side-by-side
- Tracks A/B testing and variant evaluation activity

**How to interpret:**
- Low count: Limited A/B testing, fewer data-driven decisions
- High count: Active experimentation, good for optimization
- Trend upward: Increasing investment in quality improvement

---

#### 4. Total Spans
```
Display: 62
```

**What it means:**
- Total individual traced operations across all runs
- Spans = generation + evaluation operations
- Higher spans = more detailed tracing

**How to interpret:**
- Expected spans: 2 per run (generation + evaluation)
- 62 spans ÷ 24 runs ≈ 2.6 spans/run (normal)
- Helps track system complexity and operation volume

---

#### 5. Completion Rate
```
Display: 95.8%
```

**What it means:**
- Percentage of runs that completed successfully (not failed)
- Important reliability indicator

**Target rates:**
- Below 90%: System reliability issue, investigate
- 90-95%: Good, but track failures
- 95%+: Excellent reliability

---

#### 6. Eval Density
```
Display: 2.6 spans/run
```

**What it means:**
- Average number of spans (operations) per run
- Typical: 2.0 (generation + evaluation)
- Higher values indicate more detailed tracing

---

## Recent Runs Section

Shows last 5 recommendation runs with details:

```
┌─────────────────────────────────────────────────┐
│ [completed] Workout  | Quality: 82 | 3,245 ms  │
│ Jan 15, 2024 2:30 PM                            │
├─────────────────────────────────────────────────┤
│ [completed] Sleep    | Quality: 76 | 4,120 ms  │
│ Jan 15, 2024 2:25 PM                            │
├─────────────────────────────────────────────────┤
│ [failed]   Meditation| Quality: 0  | 2,100 ms  │
│ Jan 15, 2024 2:20 PM                            │
├─────────────────────────────────────────────────┤
│ [completed] Workout  | Quality: 88 | 3,890 ms  │
│ Jan 15, 2024 2:15 PM                            │
├─────────────────────────────────────────────────┤
│ [completed] Sleep    | Quality: 79 | 3,567 ms  │
│ Jan 15, 2024 2:10 PM                            │
└─────────────────────────────────────────────────┘
```

### Reading Recent Runs

**Status indicator:**
- `[completed]`: Run finished successfully
- `[failed]`: Run encountered an error

**Type:** Recommendation type (workout, meditation, sleep)

**Quality score:**
- 0-49: Poor quality - review generation/evaluation
- 50-74: Fair quality - acceptable but room for improvement
- 75-84: Good quality - target range
- 85+: Excellent quality - best practices

**Duration:** Execution time in milliseconds
- 2,000-3,000 ms: Generation only
- 3,000-5,000 ms: Generation + evaluation
- 5,000+: Slower than expected, check Gemini API latency

### Analyzing Run Trends

**Pattern: Decreasing quality scores**
- May indicate model drift
- Check if user profiles are more complex
- Consider testing with fixed dataset

**Pattern: Increasing duration**
- Gemini API latency issues
- More complex user profiles
- Network connectivity concerns

**Pattern: Failed runs clustered**
- Check API rate limits
- Verify Gemini API key validity
- Look for specific user profile patterns causing failures

---

## Recent Experiments Section

Shows last 5 multi-variant experiments:

```
┌──────────────────────────────────────────┐
│ Stress-relief meditation comparison       │
│ exp-2024-01-15-med-123 | 3 runs         │
│ Jan 15, 2024                             │
├──────────────────────────────────────────┤
│ Workout variants - beginner focus        │
│ exp-2024-01-15-work-456 | 3 runs       │
│ Jan 15, 2024                             │
├──────────────────────────────────────────┤
│ Sleep protocol comparison                │
│ exp-2024-01-15-sleep-789 | 3 runs      │
│ Jan 15, 2024                             │
└──────────────────────────────────────────┘
```

### Interpreting Experiments

**Runs per experiment:** Typically 3 (default variant count)

**When to run experiments:**
- Testing prompt changes
- Validating model updates
- Comparing recommendation strategies
- A/B testing for specific user segments

**After experiment analysis:**
1. Compare winner quality score to other variants
2. Analyze if improvement is significant (>5% difference)
3. Consider running additional experiments if differences are small
4. Document winning approach for future reference

---

## Dashboard Monitoring Checklist

### Daily Health Check

- [ ] **Quality Score Trend**: Is avg quality score stable or declining?
- [ ] **Completion Rate**: Still above 95%?
- [ ] **Recent Failures**: Are there patterns in failed runs?
- [ ] **Run Duration**: Are requests completing in <5 seconds?
- [ ] **Experiment Activity**: Are A/B tests producing clear winners?

### Weekly Analysis

- [ ] **Quality Consistency**: How much variation in individual run scores?
- [ ] **Experiment Insights**: Did experiments identify improvements?
- [ ] **Peak Usage**: Which recommendation types are most used?
- [ ] **Failure Root Cause**: Have all failed runs been investigated?

### Monthly Review

- [ ] **Trend Analysis**: Is quality improving or declining over time?
- [ ] **Experiment ROI**: Have A/B tests led to meaningful improvements?
- [ ] **Cost Analysis**: Calculate cost per recommendation (API calls)
- [ ] **Model Performance**: Compare metrics across different Gemini versions?

---

## Debugging Common Dashboard Issues

### Issue: Quality Score Suddenly Drops

**Possible causes:**
1. User profile complexity increased
2. Gemini model output changed
3. Evaluation criteria became stricter
4. Increased variety in recommendation requests

**Solutions:**
- Run experiment with consistent user profile to isolate issue
- Check Gemini API change logs for model updates
- Review failed evaluation reasoning in recent runs
- Compare scores from week before vs now

---

### Issue: High Failed Run Rate

**Possible causes:**
1. Gemini API key invalid or expired
2. Rate limits hit (too many concurrent requests)
3. Invalid user profile data
4. Network connectivity issues

**Solutions:**
- Verify API key is current in environment variables
- Add request queueing for rate limit handling
- Validate user profile schema in requests
- Check network connectivity

---

### Issue: Very High Duration (>6 seconds)

**Possible causes:**
1. Gemini API latency spike
2. Concurrent request backlog
3. Complex user profiles taking longer to evaluate
4. Network issues

**Solutions:**
- Check Gemini API status dashboard
- Implement request caching for similar profiles
- Add client-side timeouts
- Review and optimize evaluation prompts

---

### Issue: Misleading Quality Scores

**When scores don't match reality:**
1. All scores are very high (90+) - evaluators may be too lenient
2. All scores are very low (30-40) - evaluators too strict
3. No variation - evaluators may not be discriminating properly

**Solutions:**
- Review evaluation reasoning in recent runs
- Compare evaluator output against manual review
- Adjust evaluation prompts if systematic bias found
- Test with known good/bad recommendations

---

## Advanced Analytics

### Quality Distribution

Track how many runs fall into each quality band:

```
Excellent (85-100):  8 runs (33%)
Good (75-84):       12 runs (50%)
Fair (60-74):        4 runs (17%)
Poor (<60):          0 runs (0%)
```

**What it means:**
- Healthy distribution: Most scores in "good" range
- Concerning: Skewed to low or high (indicates calibration issue)

---

### Performance by Recommendation Type

Compare quality across different recommendation types:

```
Workout:    82.3 (avg)  | 8 runs | 0 failures
Meditation: 76.1 (avg)  | 9 runs | 1 failure
Sleep:      79.4 (avg)  | 7 runs | 0 failures
```

**Insights:**
- Which types consistently score higher?
- Which types have more failures?
- Should prompts be adjusted by type?

---

### Experiment Success Rate

Track how often variant A wins vs B vs C:

```
Variant 0: 2 wins (40%)
Variant 1: 2 wins (40%)
Variant 2: 1 win  (20%)
```

**Insights:**
- Equal distribution: Variants are similar quality
- Clear winner: Variant 0 strategy is superior
- Need more experiments: Unclear patterns

---

## Best Practices for Dashboard Usage

1. **Check regularly**: Daily for production systems
2. **Set baselines**: Know your normal quality score
3. **Alert on drops**: Setup monitoring for quality <70
4. **Track experiments**: Document which A/B tests produced winners
5. **Root cause failures**: Investigate every failed run
6. **Monitor duration**: Set timeout alerts for slow requests
7. **Archive data**: Export dashboard data monthly for trend analysis

---

## Metrics to Track Over Time

### Weekly Report Template

```
Week of Jan 8-14:
- Avg Quality: 78.2 (↑0.5 from prev week)
- Completion Rate: 96.2% (stable)
- Total Runs: 142 (↑12%)
- Failed Runs: 5 (cause: 4 API timeouts, 1 invalid profile)
- Experiments: 3 (winner: variant 1, avg improvement: 3.2%)
- Duration: 3.8s avg (↓0.2s from optimization)

Key Insights:
- Quality slightly improving despite higher volume
- API timeout issues need investigation
- Variant 1 approach showing promise
```

---

This guide helps you leverage the Opik Dashboard for continuous system monitoring and improvement. Regular dashboard review ensures your recommendation system maintains high quality and reliability.
