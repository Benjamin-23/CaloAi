import { NextRequest, NextResponse } from 'next/server';
import { generateMedicalPlan, MedicalContext } from '@/lib/medical-engine';
import { UserProfile } from '@/lib/wellness-engine';
import { getOpikClient } from '@/lib/opik';

export async function POST(req: NextRequest) {
    try {
        const { userProfile, medicalContext } = await req.json();

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
