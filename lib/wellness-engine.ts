/**
 * Gemini-Powered Wellness Recommendation Engine
 * Generates personalized fitness, meditation, and sleep recommendations
 */

import { generateText, generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

export interface UserProfile {
  age: number;
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  goals: string[];
  availableTime: number; // minutes per day
  healthConditions: string[];
  stressLevel: number; // 1-10
  sleepQuality: number; // 1-10
  preferences: string[];
}

const recommendationSchema = z.object({
  title: z.string(),
  description: z.string(),
  duration: z.number().describe('Duration in minutes'),
  difficulty: z.enum(['easy', 'moderate', 'hard']),
  instructions: z.array(z.string()),
  safety_warnings: z.array(z.string()),
  estimated_calories: z.number().optional(),
  modifications: z.array(z.string()).describe('Alternative modifications for different levels'),
});

export type WellnessRecommendation = z.infer<typeof recommendationSchema>;

/**
 * Generate personalized workout recommendation
 */
export async function generateWorkoutPlan(userProfile: UserProfile): Promise<WellnessRecommendation> {
  const prompt = `You are an expert fitness coach. Generate a personalized workout plan based on this user profile:

Age: ${userProfile.age}
Fitness Level: ${userProfile.fitnessLevel}
Goals: ${userProfile.goals.join(', ')}
Available Time: ${userProfile.availableTime} minutes per day
Health Conditions: ${userProfile.healthConditions.length > 0 ? userProfile.healthConditions.join(', ') : 'None'}
Preferences: ${userProfile.preferences.join(', ')}

Create a specific, actionable workout that:
1. Matches their fitness level
2. Fits within their available time
3. Accounts for any health conditions
4. Works toward their stated goals
5. Includes proper form cues and modifications`;

  return generateRecommendation(prompt);
}

/**
 * Generate personalized meditation guide
 */
export async function generateMeditationGuide(userProfile: UserProfile): Promise<WellnessRecommendation> {
  const prompt = `You are a meditation and mindfulness expert. Generate a personalized meditation guide based on this user profile:

Age: ${userProfile.age}
Stress Level: ${userProfile.stressLevel}/10
Goals: ${userProfile.goals.join(', ')}
Available Time: ${userProfile.availableTime} minutes
Preferences: ${userProfile.preferences.join(', ')}

Create a specific meditation guide that:
1. Matches their stress level and needs
2. Fits within their available time
3. Uses techniques suited to their preferences
4. Includes step-by-step instructions
5. Accounts for beginner-friendly alternatives`;

  return generateRecommendation(prompt);
}

/**
 * Generate personalized sleep optimization plan
 */
export async function generateSleepPlan(userProfile: UserProfile): Promise<WellnessRecommendation> {
  const prompt = `You are a sleep specialist. Generate a personalized sleep optimization plan based on this user profile:

Age: ${userProfile.age}
Current Sleep Quality: ${userProfile.sleepQuality}/10
Stress Level: ${userProfile.stressLevel}/10
Goals: ${userProfile.goals.join(', ')}
Health Conditions: ${userProfile.healthConditions.length > 0 ? userProfile.healthConditions.join(', ') : 'None'}
Preferences: ${userProfile.preferences.join(', ')}

Create a specific sleep improvement plan that:
1. Targets their specific sleep issues
2. Includes actionable evening routines
3. Accounts for their health conditions
4. Considers their lifestyle constraints
5. Provides evidence-based recommendations`;

  return generateRecommendation(prompt);
}

/**
 * Core recommendation generation using structured output
 */
async function generateRecommendation(prompt: string): Promise<WellnessRecommendation> {
  try {
    const result = await generateObject({
      model: google('gemini-3-flash-preview'),
      schema: recommendationSchema,
      prompt,
    });

    return result.object;
  } catch (error) {
    console.error('[wellness-engine] Recommendation generation failed:', error);
    return {
      title: 'Default Wellness Recommendation',
      description: 'A balanced approach to wellness',
      duration: 30,
      difficulty: 'moderate',
      instructions: ['Start slowly', 'Listen to your body', 'Consistency is key'],
      safety_warnings: ['Consult healthcare provider if you have medical conditions'],
      modifications: ['Low intensity version available', 'Shorter duration option available'],
    };
  }
}

/**
 * Generate multiple recommendation variants for A/B testing
 */
export async function generateRecommendationVariants(
  userProfile: UserProfile,
  type: 'workout' | 'meditation' | 'sleep',
  count: number = 3
): Promise<WellnessRecommendation[]> {
  const generators = {
    workout: generateWorkoutPlan,
    meditation: generateMeditationGuide,
    sleep: generateSleepPlan,
  };

  const generator = generators[type];
  const variants: WellnessRecommendation[] = [];

  // Generate variants with different approaches
  for (let i = 0; i < count; i++) {
    const profile = {
      ...userProfile,
      goals: userProfile.goals.slice(i % userProfile.goals.length),
    };
    variants.push(await generator(profile));
  }

  return variants;
}
