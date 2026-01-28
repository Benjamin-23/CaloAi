import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { UserProfile } from './wellness-engine';

export interface ScheduleContext {
    currentDate: string;
    availableSlots: string[]; // e.g., ["Monday 07:00", "Tuesday 18:00"]
    missedWorkouts: number; // count of missed sessions this week
    lastWorkoutDate?: string;
}

const scheduledWorkoutSchema = z.object({
    planName: z.string(),
    rationale: z.string().describe("Why this plan was chosen given the missed workouts and schedule"),
    schedule: z.array(z.object({
        day: z.string(),
        time: z.string(),
        activity: z.string(),
        duration: z.number(),
        bookingAction: z.enum(['book_class', 'set_reminder', 'self_guided']).describe("Action to take"),
        location: z.string().optional()
    })),
    adjustmentNote: z.string().optional().describe("Note about how the plan was adjusted due to missed sessions"),
});

export type ScheduledWorkout = z.infer<typeof scheduledWorkoutSchema>;

export async function generateScheduledWorkout(
    userProfile: UserProfile,
    scheduleContext: ScheduleContext
): Promise<ScheduledWorkout> {
    const prompt = `You are an intelligent fitness assistant. 
  
  User Profile:
  - Fitness Level: ${userProfile.fitnessLevel}
  - Goals: ${userProfile.goals.join(', ')}
  - Preferences: ${userProfile.preferences.join(', ')}
  
  Schedule Context:
  - Current Date: ${scheduleContext.currentDate}
  - Available Slots: ${scheduleContext.availableSlots.join(', ') || "Flexible"}
  - Missed Workouts This Week: ${scheduleContext.missedWorkouts}
  - Last Workout: ${scheduleContext.lastWorkoutDate || "Unknown"}
  
  Task:
  1. Generate a workout schedule for the upcoming slots.
  2. If they missed workouts, ADJUST the intensity or frequency to get them back on track without overwhelming them.
  3. Decide if a slot should be a "book_class" (if it fits preferences like Yoga/Spin), "set_reminder" (for runs/gym), or "self_guided".
  4. Provide a rationale for the adjustment.`;

    try {
        const result = await generateObject({
            model: google('gemini-3-flash-preview'),
            schema: scheduledWorkoutSchema,
            prompt,
        });
        return result.object;
    } catch (error) {
        console.error("Error generating scheduled workout", error);
        // Fallback
        return {
            planName: "Recovery Logic Failed",
            rationale: "Could not generate custom plan.",
            schedule: [],
            adjustmentNote: "Error occurred."
        }
    }
}
