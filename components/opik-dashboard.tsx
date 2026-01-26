'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, BarChart3, Clock, Database, TrendingUp } from 'lucide-react';

interface OpikMetrics {
  total_runs: number;
  completed_runs: number;
  failed_runs: number;
  avg_quality_score: number;
  total_experiments: number;
  total_spans: number;
}

interface RecentRun {
  id: string;
  status: string;
  type: string;
  quality_score: number;
  duration_ms: number;
  timestamp: string;
}

interface RecentExperiment {
  id: string;
  name: string;
  runs_count: number;
  created_at: string;
}

interface OpikDashboardProps {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function OpikDashboard({ autoRefresh = true, refreshInterval = 5000 }: OpikDashboardProps) {
  const [metrics, setMetrics] = useState<OpikMetrics | null>(null);
  const [recentRuns, setRecentRuns] = useState<RecentRun[]>([]);
  const [recentExperiments, setRecentExperiments] = useState<RecentExperiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchOpikData = async () => {
    try {
      const response = await fetch('/api/opik');
      const data = await response.json();

      if (data.success) {
        setMetrics(data.metrics);
        setRecentRuns(data.recentRuns);
        setRecentExperiments(data.recentExperiments);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('[opik-dashboard] Error fetching Opik data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpikData();

    if (autoRefresh) {
      const interval = setInterval(fetchOpikData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  if (loading) {
    return (
      <div className="space-y-4 w-full">
        <div className="h-12 bg-muted rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Opik Observability Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Track evaluation metrics, runs, and experiments in real-time
          </p>
        </div>
        {lastUpdated && (
          <div className="text-xs text-muted-foreground">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Metrics Grid */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Total Runs */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Runs</p>
                  <p className="text-3xl font-bold">{metrics.total_runs}</p>
                  <p className="text-xs text-green-600 mt-2">
                    {metrics.completed_runs} completed, {metrics.failed_runs} failed
                  </p>
                </div>
                <Database className="w-8 h-8 text-blue-500/50" />
              </div>
            </CardContent>
          </Card>

          {/* Quality Score */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Avg Quality Score</p>
                  <p className="text-3xl font-bold">{metrics.avg_quality_score.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground mt-2">LLM-as-Judge consensus</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500/50" />
              </div>
            </CardContent>
          </Card>

          {/* Total Experiments */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Experiments</p>
                  <p className="text-3xl font-bold">{metrics.total_experiments}</p>
                  <p className="text-xs text-muted-foreground mt-2">Variant comparisons</p>
                </div>
                <BarChart3 className="w-8 h-8 text-purple-500/50" />
              </div>
            </CardContent>
          </Card>

          {/* Total Spans */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Spans</p>
                  <p className="text-3xl font-bold">{metrics.total_spans}</p>
                  <p className="text-xs text-muted-foreground mt-2">Traced operations</p>
                </div>
                <Clock className="w-8 h-8 text-orange-500/50" />
              </div>
            </CardContent>
          </Card>

          {/* Completion Rate */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Completion Rate</p>
                  <p className="text-3xl font-bold">
                    {metrics.total_runs > 0
                      ? Math.round((metrics.completed_runs / metrics.total_runs) * 100)
                      : 0}
                    %
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">Success rate</p>
                </div>
                <BarChart3 className="w-8 h-8 text-emerald-500/50" />
              </div>
            </CardContent>
          </Card>

          {/* Evaluation Span Ratio */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Eval Density</p>
                  <p className="text-3xl font-bold">
                    {metrics.total_runs > 0
                      ? (metrics.total_spans / metrics.total_runs).toFixed(1)
                      : 0}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">spans per run</p>
                </div>
                <TrendingUp className="w-8 h-8 text-indigo-500/50" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Runs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Runs</CardTitle>
          <CardDescription>Last 5 recommendation generations and evaluations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentRuns.length > 0 ? (
              recentRuns.map((run) => (
                <div key={run.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={run.status === 'completed' ? 'default' : 'destructive'}>
                        {run.status}
                      </Badge>
                      <span className="text-sm font-medium capitalize">{run.type}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{new Date(run.timestamp).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-primary">{run.quality_score.toFixed(1)}</p>
                    <p className="text-xs text-muted-foreground">{Math.round(run.duration_ms)}ms</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No runs yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Experiments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Experiments</CardTitle>
          <CardDescription>Latest variant comparison experiments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentExperiments.length > 0 ? (
              recentExperiments.map((exp) => (
                <div key={exp.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{exp.name}</p>
                    <p className="text-xs text-muted-foreground">ID: {exp.id.slice(0, 12)}...</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{exp.runs_count} runs</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(exp.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No experiments yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
