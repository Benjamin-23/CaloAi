import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { UserProfile } from './wellness-engine';

export interface MedicalContext {
    symptomLog: string[]; // e.g. "Headache 3 days ago", "Fever yesterday"
    lastCheckupDate?: string;
}

const medicalActionSchema = z.object({
    screeningsNeeded: z.array(z.object({
        name: z.string(),
        reason: z.string(),
        urgency: z.enum(['routine', 'soon', 'urgent']),
        frequency: z.string()
    })),
    symptomAnalysis: z.string().describe("Analysis of trends in symptoms"),
    suggestedAction: z.string(),
    questionsForDoctor: z.array(z.string()).describe("Prepared questions for next appointment"),
    followUpRequired: z.boolean()
});

export type MedicalActionPlan = z.infer<typeof medicalActionSchema>;

export async function generateMedicalPlan(
    userProfile: UserProfile,
    medicalContext: MedicalContext
): Promise<MedicalActionPlan> {
    const prompt = `You are a proactive medical advocate.
  
  User Profile:
  - Age: ${userProfile.age}
  - Health Conditions: ${userProfile.healthConditions.join(', ')}
  
  Medical Context:
  - Symptom Log: ${medicalContext.symptomLog.join('; ') || "None"}
  - Last Checkup: ${medicalContext.lastCheckupDate || "Unknown"}
  
  Task:
  1. Identify age/condition-appropriate preventive screenings (e.g. skin chekws, blood pressure, etc).
  2. Analyze the symptom log for worrying trends.
  3. Prepare questions for the doctor.
  4. Suggest next steps (schedule appointment, monitor, etc).`;

    try {
        const result = await generateObject({
            model: google('gemini-3-flash-preview'),
            schema: medicalActionSchema,
            prompt,
        });
        return result.object;
    } catch (error) {
        console.error("Error generating medical plan", error);
        return {
            screeningsNeeded: [],
            symptomAnalysis: "Could not analyze symptoms.",
            suggestedAction: "Consult a doctor.",
            questionsForDoctor: ["How can I improve my general health?"],
            followUpRequired: true
        }
    }
}
