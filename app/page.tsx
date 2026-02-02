'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WellnessForm } from '@/components/wellness-form';
import { RecommendationViewer } from '@/components/recommendation-viewer';
import AuthForm from '@/components/auth-form';
import { useAuth } from '@/hooks/use-auth';
import { MCPStore } from '@/lib/mcp-store';
import { AlertCircle, Zap, BarChart3, History, User, LogOut, Loader2, Brain } from 'lucide-react';

import { motion } from 'framer-motion';
import Image from 'next/image';

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
  const { user, loading: authLoading, signOut } = useAuth();
  const [recommendationType, setRecommendationType] = useState('workout');
  const [loading, setLoading] = useState(false);
  const [recommendationData, setRecommendationData] = useState<RecommendationData | null>(null);
  const [experimentResults, setExperimentResults] = useState<any>(null);
  const [experimentLoading, setExperimentLoading] = useState(false);
  const [userHistory, setUserHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    if (!user) return;
    setHistoryLoading(true);
    try {
      const history = await MCPStore.getUserRecommendations(user.id);
      setUserHistory(history);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

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
          userId: user?.id,
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
          userId: user?.id,
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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4 bg-[url('/images/landing.png')] bg-cover bg-center">
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
        <div className="relative z-10 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">CaloAi</h1>
            <p className="text-muted-foreground italic">Your Personal Wellness Companion</p>
          </div>
          <AuthForm />
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container max-w-7xl mx-auto px-4"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">CaloAi</h1>
            <p className="text-lg text-muted-foreground">
              Wellness AI Evaluation & Observability System
            </p>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-4 bg-background/50 backdrop-blur-sm p-2 px-4 rounded-full border border-primary/20">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium hidden sm:inline-block">
                    {user.email?.split('@')[0]}
                  </span>
                </div>
                <Button variant="ghost" size="icon" onClick={signOut} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="hidden md:block">
                {/* Auth form will be shown in tabs or as a trigger */}
              </div>
            )}
          </div>
        </div>

        {/* Info Alert */}
        <Alert className="mb-6 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950">
          <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            CaloAi uses advanced LLM evaluation to ensure the safety and personalization of your wellness plans.
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
          <TabsList className="grid w-full grid-cols-1 h-auto md:grid-cols-3 mb-6 gap-2 md:gap-0">
            <TabsTrigger value="generate" className="h-10">Generate Recommendations</TabsTrigger>
            <TabsTrigger value="history" onClick={fetchHistory} className="h-10">
              <History className="w-4 h-4 mr-2" /> History
            </TabsTrigger>
            <TabsTrigger value="experiments" className="h-10">Run Experiments</TabsTrigger>
          </TabsList>

          {/* Login Fallback for History */}
          <TabsContent value="history" className="space-y-6">
            {!user ? (
              <div className="flex flex-col items-center justify-center py-12">
                <AuthForm />
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Your Wellness History</CardTitle>
                  <CardDescription>Review your past searches and AI evaluations</CardDescription>
                </CardHeader>
                <CardContent>
                  {historyLoading ? (
                    <div className="py-20 text-center text-muted-foreground">Loading history...</div>
                  ) : userHistory.length === 0 ? (
                    <div className="py-20 text-center text-muted-foreground">
                      No history found. Try generating a recommendation first!
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {['workout', 'meditation', 'sleep', 'exercise_schedule', 'medical_plan', 'mindfulness_intervention', 'nutrition_plan'].map((category) => {
                        const items = userHistory.filter(h =>
                          h.recommendation_type === category ||
                          (category === 'workout' && h.recommendation_type === 'workout')
                        );

                        if (items.length === 0) return null;

                        const categoryLabel = category.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

                        return (
                          <div key={category} className="space-y-3">
                            <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 px-1">
                              {category === 'workout' && <Zap className="w-4 h-4 text-orange-500" />}
                              {category === 'meditation' && <Brain className="w-4 h-4 text-pink-500" />}
                              {category === 'sleep' && <History className="w-4 h-4 text-blue-500" />}
                              {category === 'exercise_schedule' && <BarChart3 className="w-4 h-4 text-violet-500" />}
                              {category === 'medical_plan' && <AlertCircle className="w-4 h-4 text-blue-500" />}
                              {category === 'mindfulness_intervention' && <Brain className="w-4 h-4 text-pink-500" />}
                              {category === 'nutrition_plan' && <Zap className="w-4 h-4 text-emerald-500" />}
                              {categoryLabel}
                            </h3>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                              {items.map((item, idx) => (
                                <Card key={idx} className="border-primary/10 hover:border-primary/30 transition-all hover:shadow-md cursor-pointer group" onClick={() => {
                                  setRecommendationData({
                                    recommendation: item.recommendation,
                                    evaluation: item.evaluation ? { aggregate: item.evaluation } : null,
                                    runId: item.opik_run_id || 'manual-entry'
                                  });
                                  // Switch to generate tab to view
                                  const generateTab = document.querySelector('[value="generate"]') as HTMLElement;
                                  generateTab?.click();
                                }}>
                                  <CardHeader className="p-4 space-y-2">
                                    <div className="flex items-center justify-between">
                                      <CardTitle className="text-sm font-bold line-clamp-1 group-hover:text-primary transition-colors">
                                        {item.recommendation.title}
                                      </CardTitle>
                                      {item.evaluation && (
                                        <div className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                          {item.evaluation.safety_score}%
                                        </div>
                                      )}
                                    </div>
                                    <CardDescription className="text-[10px] flex items-center justify-between">
                                      <span>{new Date(item.created_at).toLocaleDateString()}</span>
                                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-primary font-medium">View Plan →</span>
                                    </CardDescription>
                                  </CardHeader>
                                </Card>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

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
                  <Card className="h-full overflow-hidden border-dashed">
                    <CardContent className="h-full flex flex-col items-center justify-center p-8 text-center">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="relative w-64 h-64 mb-6"
                      >
                        <Image
                          src="/images/landing.png"
                          alt="Wellness Dashboard"
                          fill
                          className="object-contain"
                          priority
                        />
                      </motion.div>
                      <h3 className="text-lg font-semibold mb-2">Awaiting Your Input</h3>
                      <p className="text-muted-foreground mb-4 max-w-md">Complete the wellness profile to generate a personalized recommendation tailored to your goals.</p>
                      <p className="text-sm text-muted-foreground/60 max-w-sm">
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
                  Compare multiple recommendation variants to find the best approach. Our system will evaluate each variant and identify the winner.
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
                      <CardDescription>Variant comparison complete</CardDescription>
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

                      {/* Evaluation Metadata */}
                      <div className="border-t pt-4 text-xs text-muted-foreground">
                        <p>Experiment ID: {experimentResults.experimentId}</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="h-full flex items-center justify-center">
                    <CardContent className="text-center py-12">
                      <BarChart3 className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                      <p className="text-muted-foreground mb-2">Run an experiment to compare recommendation variants</p>
                      <p className="text-sm text-muted-foreground">
                        Our system will generate and evaluate multiple versions to find the best approach for your profile.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

        </Tabs>
      </motion.div>
    </main >
  );
}
