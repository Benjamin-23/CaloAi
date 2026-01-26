'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WellnessForm } from '@/components/wellness-form';
import { RecommendationViewer } from '@/components/recommendation-viewer';
import { OpikDashboard } from '@/components/opik-dashboard';
import { AlertCircle, Zap, BarChart3 } from 'lucide-react';

interface UserProfile {
  age: number;
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  goals: string[];
  availableTime: number;
  healthConditions: string[];
  stressLevel: number;
  sleepQuality: number;
  preferences: string[];
}

interface RecommendationData {
  recommendation: any;
  evaluation: any;
  runId: string;
}

export default function Home() {
  const [recommendationType, setRecommendationType] = useState('workout');
  const [loading, setLoading] = useState(false);
  const [recommendationData, setRecommendationData] = useState<RecommendationData | null>(null);
  const [experimentResults, setExperimentResults] = useState<any>(null);
  const [experimentLoading, setExperimentLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleWellnessSubmit = async (userProfile: UserProfile) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userProfile,
          recommendationType,
          evaluateResult: true,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setRecommendationData({
          recommendation: data.recommendation,
          evaluation: data.evaluation,
          runId: data.runId,
        });
      } else {
        setError(data.error || 'Failed to generate recommendation');
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRunExperiment = async (userProfile: UserProfile) => {
    setExperimentLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/experiments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userProfile,
          recommendationType,
          variantCount: 3,
          experimentName: `${recommendationType} comparison`,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setExperimentResults(data);
      } else {
        setError(data.error || 'Failed to run experiment');
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setExperimentLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-8">
      <div className="container max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Wellness AI Evaluation System</h1>
          <p className="text-lg text-muted-foreground">
            Opik-powered personalized wellness recommendations with systematic quality evaluation
          </p>
        </div>

        {/* Info Alert */}
        <Alert className="mb-6 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950">
          <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            This system demonstrates Opik's capabilities: LLM-as-Judge evaluation with safety/personalization/feasibility scoring, 
            compliance monitoring with PII detection, multi-variant experiments, and comprehensive tracing.
          </AlertDescription>
        </Alert>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Tabs */}
        <Tabs defaultValue="generate" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="generate">Generate Recommendations</TabsTrigger>
            <TabsTrigger value="experiments">Run Experiments</TabsTrigger>
            <TabsTrigger value="dashboard">Opik Dashboard</TabsTrigger>
          </TabsList>

          {/* Generate Tab */}
          <TabsContent value="generate" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Choose Recommendation Type</CardTitle>
                <CardDescription>Select the type of wellness recommendation you want to receive</CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={recommendationType} onValueChange={setRecommendationType}>
                  <SelectTrigger className="w-full md:w-[300px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="workout">Personalized Workout Plan</SelectItem>
                    <SelectItem value="meditation">Meditation & Mindfulness Guide</SelectItem>
                    <SelectItem value="sleep">Sleep Optimization Plan</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <WellnessForm onSubmit={handleWellnessSubmit} loading={loading} />
              </div>

              <div className="lg:col-span-2">
                {recommendationData ? (
                  <RecommendationViewer
                    recommendation={recommendationData.recommendation}
                    evaluation={recommendationData.evaluation}
                    runId={recommendationData.runId}
                  />
                ) : (
                  <Card className="h-full flex items-center justify-center">
                    <CardContent className="text-center py-12">
                      <p className="text-muted-foreground mb-4">Complete the wellness profile to generate a personalized recommendation</p>
                      <p className="text-sm text-muted-foreground">
                        Your recommendation will be evaluated by our LLM-as-Judge system across safety, personalization, and feasibility.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Experiments Tab */}
          <TabsContent value="experiments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Run Variant Comparison Experiment</CardTitle>
                <CardDescription>
                  Compare multiple recommendation variants to find the best approach. Opik will evaluate each variant and identify the winner.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Recommendation Type</label>
                  <Select value={recommendationType} onValueChange={setRecommendationType}>
                    <SelectTrigger className="w-full md:w-[300px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="workout">Personalized Workout Plan</SelectItem>
                      <SelectItem value="meditation">Meditation & Mindfulness Guide</SelectItem>
                      <SelectItem value="sleep">Sleep Optimization Plan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <WellnessForm 
                  onSubmit={(profile) => handleRunExperiment(profile)} 
                  loading={experimentLoading}
                />
              </div>

              <div className="lg:col-span-2">
                {experimentResults ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Experiment Results</CardTitle>
                      <CardDescription>Opik variant comparison complete</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Winner */}
                      <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                        <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">Winner</h3>
                        <p className="text-lg font-bold text-green-700 dark:text-green-300">
                          {experimentResults.winner.title}
                        </p>
                        <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                          Combined Quality Score: {experimentResults.winner.combined_score}%
                        </p>
                      </div>

                      {/* All Variants */}
                      <div>
                        <h3 className="font-semibold mb-3">All Variants Evaluated</h3>
                        <div className="space-y-3">
                          {experimentResults.all_variants.map((variant: any, idx: number) => (
                            <div key={idx} className="border rounded-lg p-3 space-y-2">
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="font-medium">{variant.title}</p>
                                  <p className="text-xs text-muted-foreground">Variant {variant.variant_index + 1}</p>
                                </div>
                                <span className="text-lg font-bold text-primary">{Math.round((variant.scores.safety + variant.scores.personalization + variant.scores.feasibility) / 3)}%</span>
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-xs">
                                <div>Safety: {variant.scores.safety}%</div>
                                <div>Personalization: {variant.scores.personalization}%</div>
                                <div>Feasibility: {variant.scores.feasibility}%</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Opik Metadata */}
                      <div className="border-t pt-4 text-xs text-muted-foreground">
                        <p>Experiment ID: {experimentResults.experimentId}</p>
                        <p>Created: {experimentResults.opik_data.created_at}</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="h-full flex items-center justify-center">
                    <CardContent className="text-center py-12">
                      <BarChart3 className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                      <p className="text-muted-foreground mb-2">Run an experiment to compare recommendation variants</p>
                      <p className="text-sm text-muted-foreground">
                        Opik will generate and evaluate multiple versions to find the best approach for your profile.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <OpikDashboard autoRefresh={true} refreshInterval={3000} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
