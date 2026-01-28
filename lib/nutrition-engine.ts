import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { UserProfile } from './wellness-engine';

export interface NutritionContext {
    fridgeContents: string[]; // List of items
    mealsToPlan: number; // e.g. 3
    dietaryRestrictions: string[];
}

const mealPlanSchema = z.object({
    planName: z.string(),
    meals: z.array(z.object({
        name: z.string(),
        ingredients: z.array(z.string()),
        instructions: z.string(),
        calories: z.number(),
        missingIngredients: z.array(z.string()).describe("Ingredients not in fridge"),
    })),
    groceryList: z.array(z.string()).describe("aggregated list of missing ingredients"),
    nutritionalSummary: z.string()
});

export type MealPlan = z.infer<typeof mealPlanSchema>;

export async function generateMealPlan(
    userProfile: UserProfile,
    nutritionContext: NutritionContext
): Promise<MealPlan> {
    const prompt = `You are a nutritionist.
  
  User:
  - Goals: ${userProfile.goals.join(', ')}
  - Preferences: ${userProfile.preferences.join(', ')}
  - Restrictions: ${nutritionContext.dietaryRestrictions.join(', ')}
  
  Fridge Contents: ${nutritionContext.fridgeContents.join(', ')}
  
  Task:
  1. Create a meal plan for ${nutritionContext.mealsToPlan} meals using as many fridge ingredients as possible.
  2. List missing ingredients for the grocery list.
  3. Ensure meals align with user goals.`;

    try {
        const result = await generateObject({
            model: google('gemini-3-flash-preview'),
            schema: mealPlanSchema,
            prompt,
        });
        return result.object;
    } catch (error) {
        console.error("Error generating meal plan", error);
        return {
            planName: "Basic Healthy Plan",
            meals: [],
            groceryList: [],
            nutritionalSummary: "Error generating plan."
        }
    }
}
