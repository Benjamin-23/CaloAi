import { NextRequest, NextResponse } from 'next/server';
import { generateWorkoutPlan, generateMeditationGuide, generateSleepPlan, UserProfile } from '@/lib/wellness-engine';
import { evaluateRecommendation, aggregateEvaluations } from '@/lib/evaluator';
import { getOpikClient } from '@/lib/opik';

export async function POST(req: NextRequest) {
  try {
    const { userProfile, recommendationType, evaluateResult = true } = await req.json();

    const opik = getOpikClient();
    const runId = `run-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    // Start Opik tracing
    const run = opik.startRun(runId, {
      type: recommendationType,
      userProfile,
      timestamp: new Date().toISOString(),
    });

    let recommendation;
    const generatorMap = {
      workout: generateWorkoutPlan,
      meditation: generateMeditationGuide,
      sleep: generateSleepPlan,
    };

    const generator = generatorMap[recommendationType as keyof typeof generatorMap];
    if (!generator) {
      return NextResponse.json(
        { error: 'Invalid recommendation type' },
        { status: 400 }
      );
    }

    // Generate recommendation with Opik span
    const startGen = Date.now();
    recommendation = await generator(userProfile as UserProfile);
    const genTime = Date.now() - startGen;

    opik.addSpan(
      runId,
      'generate_recommendation',
      { type: recommendationType, userProfile },
      { recommendation },
      { duration_ms: genTime }
    );

    let evaluation = null;

    if (evaluateResult) {
      // Evaluate with multiple evaluation types and aggregate
      const startEval = Date.now();
      const evaluations = await Promise.all([
        evaluateRecommendation(recommendation.description, userProfile, 'safety'),
        evaluateRecommendation(recommendation.description, userProfile, 'personalization'),
        evaluateRecommendation(recommendation.description, userProfile, 'feasibility'),
        evaluateRecommendation(recommendation.description, userProfile, 'compliance'),
      ]);
      const evalTime = Date.now() - startEval;

      evaluation = {
        individual_evals: {
          safety: evaluations[0],
          personalization: evaluations[1],
          feasibility: evaluations[2],
          compliance: evaluations[3],
        },
        aggregate: aggregateEvaluations(evaluations),
      };

      opik.addSpan(
        runId,
        'evaluate_recommendation',
        { recommendation: recommendation.description },
        { evaluation },
        { duration_ms: evalTime, eval_count: evaluations.length }
      );
    }

    // End run with results
    opik.endRun(runId, {
      recommendation,
      evaluation,
      quality_score: evaluation?.aggregate.avg_safety_score || 0,
    });

    return NextResponse.json(
      {
        success: true,
        runId,
        recommendation,
        evaluation,
        trace: {
          run_id: runId,
          spans_count: run.spans.length + (evaluateResult ? 1 : 0),
          total_duration_ms: Date.now() - run.startTime,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[recommendations-api] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendation', details: String(error) },
      { status: 500 }
    );
  }
}
