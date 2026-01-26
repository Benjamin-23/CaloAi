import { NextRequest, NextResponse } from 'next/server';
import { generateRecommendationVariants, UserProfile } from '@/lib/wellness-engine';
import { evaluateRecommendation, aggregateEvaluations } from '@/lib/evaluator';
import { getOpikClient, OpikRun } from '@/lib/opik';

/**
 * Run an Opik experiment comparing multiple recommendation variants
 */
export async function POST(req: NextRequest) {
  try {
    const { userProfile, recommendationType, variantCount = 3, experimentName } = await req.json();

    const opik = getOpikClient();
    const experimentId = `exp-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    // Create experiment in Opik
    const experiment = opik.createExperiment(
      experimentId,
      experimentName || `${recommendationType} variants`,
      `Comparing ${variantCount} variants of ${recommendationType} recommendations`
    );

    // Generate recommendation variants
    const variants = await generateRecommendationVariants(
      userProfile as UserProfile,
      recommendationType as 'workout' | 'meditation' | 'sleep',
      variantCount
    );

    const experimentRuns: OpikRun[] = [];
    const evaluatedVariants: any[] = [];

    // Evaluate each variant
    for (let i = 0; i < variants.length; i++) {
      const variant = variants[i];
      const runId = `variant-${experimentId}-${i}`;

      // Start run for this variant
      const run = opik.startRun(runId, {
        variant_index: i,
        experiment_id: experimentId,
        type: recommendationType,
      });

      // Evaluate this variant across all dimensions
      const evaluations = await Promise.all([
        evaluateRecommendation(variant.description, userProfile, 'safety'),
        evaluateRecommendation(variant.description, userProfile, 'personalization'),
        evaluateRecommendation(variant.description, userProfile, 'feasibility'),
      ]);

      const aggregated = aggregateEvaluations(evaluations);

      // Add evaluation span
      opik.addSpan(
        runId,
        'evaluate_variant',
        { variant: variant.title },
        { evaluations, aggregated },
        { variant_index: i }
      );

      // End run
      opik.endRun(runId, {
        variant: variant.title,
        aggregated_scores: aggregated,
      });

      experimentRuns.push(run);

      evaluatedVariants.push({
        variant_index: i,
        title: variant.title,
        duration: variant.duration,
        difficulty: variant.difficulty,
        scores: {
          safety: evaluations[0].safety_score,
          personalization: evaluations[1].personalization_score,
          feasibility: evaluations[2].feasibility_score,
        },
        aggregated,
        pii_detected: evaluations[3].has_pii,
      });

      // Add run to experiment
      opik.addRunToExperiment(experimentId, run);
    }

    // Calculate winner (best overall score)
    const winner = evaluatedVariants.reduce((best, current) => {
      const bestScore = (best.scores.safety + best.scores.personalization + best.scores.feasibility) / 3;
      const currentScore =
        (current.scores.safety + current.scores.personalization + current.scores.feasibility) / 3;
      return currentScore > bestScore ? current : best;
    });

    return NextResponse.json(
      {
        success: true,
        experimentId,
        experiment_name: experiment.name,
        variants_evaluated: evaluatedVariants.length,
        winner: {
          variant_index: winner.variant_index,
          title: winner.title,
          combined_score: Math.round(
            (winner.scores.safety + winner.scores.personalization + winner.scores.feasibility) / 3
          ),
        },
        all_variants: evaluatedVariants,
        opik_data: {
          experiment_id: experimentId,
          total_runs: experimentRuns.length,
          created_at: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[experiments-api] Error:', error);
    return NextResponse.json(
      { error: 'Failed to run experiment', details: String(error) },
      { status: 500 }
    );
  }
}
