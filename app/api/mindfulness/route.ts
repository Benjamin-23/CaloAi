import { NextRequest, NextResponse } from 'next/server';
import { generateIntervention, StressContext } from '@/lib/mindfulness-engine';
import { UserProfile } from '@/lib/wellness-engine';
import { getOpikClient } from '@/lib/opik';

export async function POST(req: NextRequest) {
    try {
        const { userProfile, stressContext } = await req.json();

        const opik = getOpikClient();
        const runId = `run-mindfulness-${Date.now()}-${Math.random().toString(36).slice(2)}`;

        opik.startRun(runId, {
            type: 'mindfulness_intervention',
            userProfile,
            stressContext,
            timestamp: new Date().toISOString(),
        });

        const startGen = Date.now();
        const result = await generateIntervention(userProfile as UserProfile, stressContext as StressContext);
        const genTime = Date.now() - startGen;

        opik.addSpan(
            runId,
            'generate_intervention',
            { userProfile, stressContext },
            { result },
            { duration_ms: genTime }
        );

        opik.endRun(runId, {
            result,
            detected_state: result.detectedStressState
        });

        await opik.flush();

        return NextResponse.json({
            success: true,
            runId,
            result
        });

    } catch (error) {
        console.error('[mindfulness-api] Error:', error);
        return NextResponse.json(
            { error: 'Failed to generate intervention', details: String(error) },
            { status: 500 }
        );
    }
}
