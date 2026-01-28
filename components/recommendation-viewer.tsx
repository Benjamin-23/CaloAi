'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Clock, Zap, Volume2, Square } from 'lucide-react';
import { useTextToSpeech } from '@/hooks/use-text-to-speech';

interface Evaluation {
  safety_score: number;
  personalization_score: number;
  feasibility_score: number;
  compliance_issues: string[];
  has_pii: boolean;
  reasoning: string;
}

interface AggregateScore {
  avg_safety_score: number;
  avg_personalization_score: number;
  avg_feasibility_score: number;
  pii_detection_rate: number;
  total_compliance_issues: number;
  unique_issues: string[];
}

interface RecommendationViewerProps {
  recommendation: {
    title: string;
    description: string;
    duration: number;
    difficulty: string;
    instructions: string[];
    safety_warnings: string[];
    modifications?: string[];
  };
  evaluation?: {
    individual_evals: {
      safety: Evaluation;
      personalization: Evaluation;
      feasibility: Evaluation;
      compliance: Evaluation;
    };
    aggregate: AggregateScore;
  };
  runId?: string;
}

const ScoreBar = ({ score, label }: { score: number; label: string }) => {
  const percentage = score;
  const color = percentage >= 80 ? 'bg-green-500' : percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold">{score}%</span>
      </div>
      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
        <div className={`h-full ${color} transition-all`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
};

export function RecommendationViewer({ recommendation, evaluation, runId }: RecommendationViewerProps) {
  const { isSpeaking, speak, stop } = useTextToSpeech();

  const handleSpeak = () => {
    if (isSpeaking) {
      stop();
    } else {
      const textToRead = `
        ${recommendation.title}. 
        ${recommendation.description}. 
        Duration: ${recommendation.duration} minutes. 
        Difficulty: ${recommendation.difficulty}. 
        Instructions: ${recommendation.instructions.join('. ')}.
        ${recommendation.safety_warnings.length > 0 ? 'Safety warning: ' + recommendation.safety_warnings.join('. ') : ''}
      `;
      speak(textToRead);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'hard':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4 w-full max-w-4xl">
      {/* Main Recommendation Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between sm:justify-start gap-3">
                <CardTitle className="text-2xl">{recommendation.title}</CardTitle>
                <Badge className={`${getDifficultyColor(recommendation.difficulty)} sm:hidden`}>
                  {recommendation.difficulty.charAt(0).toUpperCase() + recommendation.difficulty.slice(1)}
                </Badge>
              </div>
              <CardDescription>{recommendation.description}</CardDescription>
            </div>
            <div className="flex items- center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSpeak}
                className="gap-2 flex-1 sm:flex-none"
              >
                {isSpeaking ? (
                  <>
                    <Square className="w-4 h-4 text-red-500" /> Stop Reading
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4" /> Read Aloud
                  </>
                )}
              </Button>
              <Badge className={`${getDifficultyColor(recommendation.difficulty)} hidden sm:inline-flex`}>
                {recommendation.difficulty.charAt(0).toUpperCase() + recommendation.difficulty.slice(1)}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-semibold">{recommendation.duration} minutes</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Intensity</p>
                <p className="font-semibold">{recommendation.difficulty}</p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div>
            <h3 className="font-semibold mb-3">Instructions</h3>
            <ol className="space-y-2 text-sm">
              {recommendation.instructions.map((instruction, idx) => (
                <li key={idx} className="flex gap-3">
                  <span className="font-semibold text-primary min-w-6">{idx + 1}.</span>
                  <span>{instruction}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Safety Warnings */}
          {recommendation.safety_warnings.length > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Safety Notes</h4>
                  <ul className="space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
                    {recommendation.safety_warnings.map((warning, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span>•</span>
                        <span>{warning}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Modifications */}
          {recommendation.modifications && recommendation.modifications.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Modifications & Alternatives</h3>
              <ul className="space-y-2 text-sm">
                {recommendation.modifications.map((mod, idx) => (
                  <li key={idx} className="flex gap-2 text-muted-foreground">
                    <span>→</span>
                    <span>{mod}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Run ID */}
          {runId && (
            <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
              Trace ID: <code className="text-xs">{runId}</code>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Evaluation Scores */}
      {evaluation && (
        <Card>
          <CardHeader>
            <CardTitle>Opik Evaluation Scores</CardTitle>
            <CardDescription>AI-powered multi-dimensional assessment of recommendation quality</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Aggregate Scores */}
            <div className="space-y-4">
              <h3 className="font-semibold">Overall Quality Metrics</h3>
              <ScoreBar score={evaluation.aggregate.avg_safety_score} label="Safety Score" />
              <ScoreBar score={evaluation.aggregate.avg_personalization_score} label="Personalization" />
              <ScoreBar score={evaluation.aggregate.avg_feasibility_score} label="Feasibility" />
            </div>

            {/* Compliance Summary */}
            <div className="border-t pt-4 space-y-3">
              <h3 className="font-semibold">Compliance Check</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">PII Detection</p>
                  <div className="flex items-center gap-2">
                    {evaluation.aggregate.pii_detection_rate === 0 ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <span className="font-semibold text-green-600">No PII Detected</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <span className="font-semibold text-red-600">{evaluation.aggregate.pii_detection_rate}% Risk</span>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Compliance Issues</p>
                  <p className="font-semibold">{evaluation.aggregate.total_compliance_issues} issues found</p>
                </div>
              </div>

              {evaluation.aggregate.unique_issues.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-sm font-semibold text-red-800 dark:text-red-200 mb-2">Issues Detected:</p>
                  <ul className="space-y-1 text-sm text-red-700 dark:text-red-300">
                    {evaluation.aggregate.unique_issues.map((issue, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span>•</span>
                        <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Individual Evaluations */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-4">Detailed Evaluations</h3>
              <div className="space-y-4">
                {Object.entries(evaluation.individual_evals).map(([key, evaluationItem]) => (
                  <div key={key} className="bg-muted/50 rounded-lg p-3">
                    <h4 className="font-semibold text-sm capitalize mb-2">{key} Evaluation</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{evaluationItem.reasoning}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
