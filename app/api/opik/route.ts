import { NextRequest, NextResponse } from 'next/server';
import { getOpikClient } from '@/lib/opik';

/**
 * Get all Opik runs and experiments for dashboard
 */
export async function GET(req: NextRequest) {
  try {
    const opik = getOpikClient();
    const action = req.nextUrl.searchParams.get('action');
    const id = req.nextUrl.searchParams.get('id');

    if (action === 'get-run' && id) {
      const run = opik.getRun(id);
      return NextResponse.json({ run });
    }

    if (action === 'get-experiment' && id) {
      const experiment = opik.getExperiment(id);
      return NextResponse.json({ experiment });
    }

    // Default: return all runs and experiments
    const runs = opik.getAllRuns();
    const experiments = opik.getAllExperiments();

    // Calculate metrics
    const totalRuns = runs.length;
    const completedRuns = runs.filter((r) => r.status === 'completed').length;
    const avgQualityScore =
      runs.length > 0 ? runs.reduce((sum, r) => sum + ((r.result?.quality_score || 0) as number), 0) / runs.length : 0;

    const metrics = {
      total_runs: totalRuns,
      completed_runs: completedRuns,
      failed_runs: runs.filter((r) => r.status === 'failed').length,
      avg_quality_score: Math.round(avgQualityScore * 100) / 100,
      total_experiments: experiments.length,
      total_spans: runs.reduce((sum, r) => sum + r.spans.length, 0),
    };

    // Recent runs (last 5)
    const recentRuns = runs.slice(-5).map((r) => ({
      id: r.id,
      status: r.status,
      type: r.metadata.type,
      quality_score: r.result?.quality_score || 0,
      duration_ms: (r.endTime || Date.now()) - r.startTime,
      timestamp: new Date(r.startTime).toISOString(),
    }));

    // Recent experiments (last 5)
    const recentExperiments = experiments.slice(-5).map((e) => ({
      id: e.id,
      name: e.name,
      runs_count: e.runs.length,
      created_at: new Date(e.createdAt).toISOString(),
    }));

    return NextResponse.json(
      {
        success: true,
        metrics,
        recentRuns,
        recentExperiments,
        totalDataPoints: {
          runs: totalRuns,
          experiments: experiments.length,
          spans: metrics.total_spans,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[opik-api] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Opik data', details: String(error) },
      { status: 500 }
    );
  }
}
