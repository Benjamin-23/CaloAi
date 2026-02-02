import { NextRequest, NextResponse } from 'next/server';
import { generateIntervention, StressContext } from '@/lib/mindfulness-engine';
import { UserProfile } from '@/lib/wellness-engine';
import { getOpikClient } from '@/lib/opik';
import { MCPStore } from '@/lib/mcp-store';

export async function POST(req: NextRequest) {
    try {
        const { userProfile, stressContext, userId } = await req.json();

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

        // Persist to Supabase
        if (result) {
            await MCPStore.saveRecommendation({
                user_profile: userProfile,
                recommendation_type: 'mindfulness_intervention',
                recommendation: {
                    title: result.title,
                    description: result.description,
                    duration: Math.ceil(result.durationSeconds / 60),
                    difficulty: 'easy',
                    instructions: result.steps || [],
                    safety_warnings: [],
                    modifications: [`Detected State: ${result.detectedStressState}`]
                } as any,
                opik_run_id: runId,
                user_id: userId,
            });
        }

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
