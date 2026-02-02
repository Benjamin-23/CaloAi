import { NextRequest, NextResponse } from 'next/server';
import { generateMealPlan, NutritionContext } from '@/lib/nutrition-engine';
import { UserProfile } from '@/lib/wellness-engine';
import { getOpikClient } from '@/lib/opik';

export async function POST(req: NextRequest) {
    try {
        const { userProfile, nutritionContext } = await req.json();

        const opik = getOpikClient();
        const runId = `run-nutrition-${Date.now()}-${Math.random().toString(36).slice(2)}`;

        opik.startRun(runId, {
            type: 'nutrition_plan',
            userProfile,
            nutritionContext,
            timestamp: new Date().toISOString(),
        });

        const startGen = Date.now();
        const result = await generateMealPlan(userProfile as UserProfile, nutritionContext as NutritionContext);
        const genTime = Date.now() - startGen;

        opik.addSpan(
            runId,
            'generate_meal_plan',
            { userProfile, nutritionContext },
            { result },
            { duration_ms: genTime }
        );

        opik.endRun(runId, {
            result,
            items_used: nutritionContext.fridgeContents.length
        });

        await opik.flush();

        return NextResponse.json({
            success: true,
            runId,
            result
        });

    } catch (error) {
        console.error('[nutrition-api] Error:', error);
        return NextResponse.json(
            { error: 'Failed to generate meal plan', details: String(error) },
            { status: 500 }
        );
    }
}
