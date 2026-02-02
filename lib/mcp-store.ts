/**
 * MCP Store (Model Context Protocol Store)
 * Manages persistence for wellness recommendations and evaluations
 */

import { supabase } from './supabase';
import { UserProfile, WellnessRecommendation } from './wellness-engine';

export interface EvaluationResult {
    safety_score: number;
    personalization_score: number;
    feasibility_score: number;
    compliance_checked: boolean;
    pii_detected: boolean;
    medical_claims_detected: boolean;
}

export interface StoredRecommendation {
    id?: string;
    created_at?: string;
    user_profile: UserProfile;
    recommendation_type: string;
    recommendation: WellnessRecommendation;
    evaluation?: EvaluationResult;
    opik_run_id?: string;
    user_id?: string;
}

export interface StoredExperiment {
    id?: string;
    created_at?: string;
    name: string;
    type: string;
    variants: any[];
    winner_id?: string;
    opik_experiment_id?: string;
    user_id?: string;
}

export const MCPStore = {
    /**
     * Save a single recommendation and its evaluation
     */
    async saveRecommendation(data: StoredRecommendation) {
        try {
            const insertData: any = {
                user_profile: data.user_profile,
                recommendation_type: data.recommendation_type,
                recommendation: data.recommendation,
                opik_run_id: data.opik_run_id,
                user_id: data.user_id,
            };

            if (data.evaluation) {
                insertData.evaluation = data.evaluation;
            } else {
                // Default evaluation for items without auto-eval
                insertData.evaluation = {
                    safety_score: 100,
                    personalization_score: 100,
                    feasibility_score: 100,
                    compliance_checked: false,
                    pii_detected: false,
                    medical_claims_detected: false,
                };
            }

            const { data: result, error } = await supabase
                .from('recommendations')
                .insert([insertData])
                .select();

            if (error) throw error;
            return result[0];
        } catch (error) {
            console.error('[mcp-store] Error saving recommendation:', error);
            return null;
        }
    },

    /**
     * Get recent recommendations
     */
    async getRecentRecommendations(limit: number = 10) {
        try {
            const { data, error } = await supabase
                .from('recommendations')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data as StoredRecommendation[];
        } catch (error) {
            console.error('[mcp-store] Error fetching recommendations:', error);
            return [];
        }
    },

    /**
     * Save an experiment with multiple variants
     */
    async saveExperiment(experimentData: {
        name: string;
        type: string;
        variants: any[];
        winner_id?: string;
        opik_experiment_id?: string;
        user_id?: string;
    }) {
        try {
            const { data: result, error } = await supabase
                .from('experiments')
                .insert([
                    {
                        name: experimentData.name,
                        type: experimentData.type,
                        variants: experimentData.variants,
                        winner_id: experimentData.winner_id,
                        opik_experiment_id: experimentData.opik_experiment_id,
                        user_id: experimentData.user_id,
                    },
                ])
                .select();
            if (error) throw error;
            return result[0];
        } catch (error) {
            console.error('[mcp-store] Error saving experiment:', error);
            return null;
        }
    },

    /**
     * Get recommendations for a specific user
     */
    async getUserRecommendations(userId: string) {
        try {
            const { data, error } = await supabase
                .from('recommendations')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as StoredRecommendation[];
        } catch (error) {
            console.error('[mcp-store] Error fetching user recommendations:', error);
            return [];
        }
    },
};
