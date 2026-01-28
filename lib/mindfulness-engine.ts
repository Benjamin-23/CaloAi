import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { UserProfile } from './wellness-engine';

export interface StressContext {
    calendarDensity: 'high' | 'medium' | 'low';
    typingSpeed: 'normal' | 'fast' | 'erratic';
    connectedDeviceScore: number; // Oura readiness etc. 0-100
    currentTime: string;
}

const interventionSchema = z.object({
    detectedStressState: z.enum(['relaxed', 'focused', 'stressed', 'overwhelmed']),
    interventionType: z.enum(['none', 'breathing', 'stretch', 'walk', 'music']),
    title: z.string(),
    description: z.string(),
    steps: z.array(z.string()).optional(),
    durationSeconds: z.number(),
    audioPrompt: z.string().describe("Text to be read aloud for guidance")
});

export type MindfulnessIntervention = z.infer<typeof interventionSchema>;

export async function generateIntervention(
    userProfile: UserProfile,
    stressContext: StressContext
): Promise<MindfulnessIntervention> {
    const prompt = `You are an empathethic wellness assistant.
  
  User Profile:
  - Stress Level (Self-Reported): ${userProfile.stressLevel}
  
  Real-time Signals:
  - Calendar Density: ${stressContext.calendarDensity}
  - Typing Behavior: ${stressContext.typingSpeed}
  - Device Readiness Score: ${stressContext.connectedDeviceScore} (Lower is worse)
  - Time: ${stressContext.currentTime}
  
  Task:
  1. Determine the user's likely stress state.
  2. Prescribe a micro-intervention if needed (Breathing, Stretch, etc).
  3. If they are relaxed, maybe just suggest staying focused or a light stretch.
  4. Provide a soothing audio prompt script.`;

    try {
        const result = await generateObject({
            model: google('gemini-3-flash-preview'),
            schema: interventionSchema,
            prompt,
        });
        return result.object;
    } catch (error) {
        console.error("Error generating intervention", error);
        return {
            detectedStressState: "stressed",
            interventionType: "breathing",
            title: "Quick Reset",
            description: "Take a moment to reset.",
            steps: ["Inhale deeply", "Hold", "Exhale slowly"],
            durationSeconds: 60,
            audioPrompt: "Let's take a deep breath together."
        }
    }
}
