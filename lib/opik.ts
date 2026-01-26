/**
 * Opik Integration for Wellness AI System
 * Provides tracing, evaluation, and experiment tracking
 */

interface OpikConfig {
  projectName: string;
  apiKey?: string;
  endpoint?: string;
}

class OpikClient {
  private projectName: string;
  private runs: Map<string, OpikRun> = new Map();
  private experiments: Map<string, OpikExperiment> = new Map();

  constructor(config: OpikConfig) {
    this.projectName = config.projectName;
  }

  /**
   * Start a new traced run
   */
  startRun(runId: string, metadata: Record<string, any> = {}) {
    const run: OpikRun = {
      id: runId,
      projectName: this.projectName,
      startTime: Date.now(),
      metadata,
      spans: [],
      status: 'running',
    };
    this.runs.set(runId, run);
    return run;
  }

  /**
   * Add a span (traced operation) to current run
   */
  addSpan(
    runId: string,
    spanName: string,
    input: Record<string, any>,
    output: Record<string, any>,
    metadata: Record<string, any> = {}
  ) {
    const run = this.runs.get(runId);
    if (!run) return;

    const span: OpikSpan = {
      name: spanName,
      startTime: Date.now(),
      input,
      output,
      metadata,
    };
    run.spans.push(span);
  }

  /**
   * End a run and calculate metrics
   */
  endRun(runId: string, result?: Record<string, any>) {
    const run = this.runs.get(runId);
    if (!run) return;

    run.status = 'completed';
    run.endTime = Date.now();
    run.result = result;
    return run;
  }

  /**
   * Create an experiment for comparing multiple runs
   */
  createExperiment(
    experimentId: string,
    name: string,
    description: string = ''
  ) {
    const experiment: OpikExperiment = {
      id: experimentId,
      name,
      description,
      runs: [],
      createdAt: Date.now(),
    };
    this.experiments.set(experimentId, experiment);
    return experiment;
  }

  /**
   * Add a run to an experiment
   */
  addRunToExperiment(experimentId: string, run: OpikRun) {
    const experiment = this.experiments.get(experimentId);
    if (experiment) {
      experiment.runs.push(run);
    }
  }

  /**
   * Get run data
   */
  getRun(runId: string): OpikRun | undefined {
    return this.runs.get(runId);
  }

  /**
   * Get experiment data
   */
  getExperiment(experimentId: string): OpikExperiment | undefined {
    return this.experiments.get(experimentId);
  }

  /**
   * Get all runs
   */
  getAllRuns(): OpikRun[] {
    return Array.from(this.runs.values());
  }

  /**
   * Get all experiments
   */
  getAllExperiments(): OpikExperiment[] {
    return Array.from(this.experiments.values());
  }
}

export interface OpikSpan {
  name: string;
  startTime: number;
  input: Record<string, any>;
  output: Record<string, any>;
  metadata: Record<string, any>;
}

export interface OpikRun {
  id: string;
  projectName: string;
  startTime: number;
  endTime?: number;
  status: 'running' | 'completed' | 'failed';
  metadata: Record<string, any>;
  spans: OpikSpan[];
  result?: Record<string, any>;
}

export interface OpikExperiment {
  id: string;
  name: string;
  description: string;
  runs: OpikRun[];
  createdAt: number;
}

// Global Opik instance
let opikInstance: OpikClient | null = null;

export function getOpikClient(): OpikClient {
  if (!opikInstance) {
    opikInstance = new OpikClient({
      projectName: 'wellness-ai-evaluation',
    });
  }
  return opikInstance;
}

export { OpikClient };
