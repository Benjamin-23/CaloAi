import { NextRequest, NextResponse } from 'next/server';
import { generateMedicalPlan, MedicalContext } from '@/lib/medical-engine';
import { UserProfile } from '@/lib/wellness-engine';
import { getOpikClient } from '@/lib/opik';
import { MCPStore } from '@/lib/mcp-store';

export async function POST(req: NextRequest) {
    try {
        const { userProfile, medicalContext, userId } = await req.json();

        const opik = getOpikClient();
        const runId = `run-medical-${Date.now()}-${Math.random().toString(36).slice(2)}`;

        opik.startRun(runId, {
            type: 'medical_plan',
            userProfile,
            medicalContext,
            timestamp: new Date().toISOString(),
        });

        const startGen = Date.now();
        const result = await generateMedicalPlan(userProfile as UserProfile, medicalContext as MedicalContext);
        const genTime = Date.now() - startGen;

        opik.addSpan(
            runId,
            'generate_medical_plan',
            { userProfile, medicalContext },
            { result },
            { duration_ms: genTime }
        );

        opik.endRun(runId, {
            result,
            has_symptoms: medicalContext.symptomLog.length > 0
        });

        await opik.flush();

        // Persist to Supabase
        if (result) {
            await MCPStore.saveRecommendation({
                user_profile: userProfile,
                recommendation_type: 'medical_plan',
                recommendation: {
                    title: `Medical Action Plan - ${new Date().toLocaleDateString()}`,
                    description: result.symptomAnalysis,
                    duration: 0,
                    difficulty: 'moderate',
                    instructions: [
                        `Suggested Action: ${result.suggestedAction}`,
                        ...result.screeningsNeeded.map(s => `Screening: ${s.name} (${s.urgency}) - ${s.reason}`),
                        "Questions for Doctor:",
                        ...result.questionsForDoctor
                    ],
                    safety_warnings: ["Always consult with a qualified healthcare professional before making any medical decisions."],
                    modifications: []
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
        console.error('[medical-api] Error:', error);
        return NextResponse.json(
            { error: 'Failed to generate medical plan', details: String(error) },
            { status: 500 }
        );
    }
}
