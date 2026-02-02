import { NextRequest, NextResponse } from 'next/server';
import { generateScheduledWorkout, ScheduleContext } from '@/lib/exercise-engine';
import { UserProfile } from '@/lib/wellness-engine';
import { getOpikClient } from '@/lib/opik';
import { MCPStore } from '@/lib/mcp-store';

export async function POST(req: NextRequest) {
    try {
        const { userProfile, scheduleContext, userId } = await req.json();

        const opik = getOpikClient();
        const runId = `run-exercise-${Date.now()}-${Math.random().toString(36).slice(2)}`;

        // Start Opik tracing
        opik.startRun(runId, {
            type: 'exercise_schedule',
            userProfile,
            scheduleContext,
            timestamp: new Date().toISOString(),
        });

        const startGen = Date.now();
        const result = await generateScheduledWorkout(userProfile as UserProfile, scheduleContext as ScheduleContext);
        const genTime = Date.now() - startGen;

        opik.addSpan(
            runId,
            'generate_exercise_schedule',
            { userProfile, scheduleContext },
            { result },
            { duration_ms: genTime }
        );

        opik.endRun(runId, {
            result,
            adjustment_made: scheduleContext.missedWorkouts > 0
        });

        await opik.flush();

        // Persist to Supabase
        if (result) {
            await MCPStore.saveRecommendation({
                user_profile: userProfile,
                recommendation_type: 'exercise_schedule',
                recommendation: {
                    title: result.planName,
                    description: result.rationale,
                    duration: 0,
                    difficulty: 'moderate',
                    instructions: result.schedule.map(s => `${s.day} ${s.time}: ${s.activity} (${s.duration} mins)`),
                    safety_warnings: [],
                    modifications: result.adjustmentNote ? [result.adjustmentNote] : []
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
        console.error('[exercise-api] Error:', error);
        return NextResponse.json(
            { error: 'Failed to generate schedule', details: String(error) },
            { status: 500 }
        );
    }
}
