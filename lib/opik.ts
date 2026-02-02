import { Opik, Trace } from 'opik';

/**
 * Opik Integration for Wellness AI System
 * Provides tracing, evaluation, and experiment tracking via the official Comet Opik SDK
 */

interface OpikConfig {
  projectName: string;
  apiKey?: string;
  workspaceName?: string;
}

class OpikClient {
  private opik: Opik;
  private traces: Map<string, Trace> = new Map();

  constructor(config: OpikConfig) {
    this.opik = new Opik({
      projectName: config.projectName,
      apiKey: config.apiKey,
      workspaceName: config.workspaceName
    });
  }

  /**
   * Start a new traced run (Trace in Opik)
   */
  startRun(runId: string, metadata: Record<string, any> = {}) {
    const trace = this.opik.trace({
      name: runId,
      metadata
    });
    this.traces.set(runId, trace);

    // Return a compatible object for existing API
    return {
      id: runId,
      projectName: this.opik.config.projectName,
      startTime: Date.now(),
      metadata,
      spans: [],
      status: 'running',
    };
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
    const trace = this.traces.get(runId);
    if (!trace) return;

    const span = trace.span({
      name: spanName,
      input,
      output,
      metadata,
    });

    // In our simplified API, we end the span immediately as it's logged after completion
    span.end();
  }

  /**
   * End a run and calculate metrics
   */
  endRun(runId: string, result?: Record<string, any>) {
    const trace = this.traces.get(runId);
    if (!trace) return;

    if (result) {
      trace.update({
        metadata: { result }
      });
    }

    trace.end();
    this.traces.delete(runId);

    return {
      status: 'completed',
      endTime: Date.now(),
      result
    };
  }

  /**
   * Create an experiment for comparing multiple runs
   * Note: Official Opik SDK requires a dataset for experiments.
   * We'll use a default dataset if none is relevant.
   */
  async createExperiment(
    experimentId: string,
    name: string,
    description: string = ''
  ) {
    try {
      // Ensure a dataset exists for the experiment
      const datasetName = 'wellness-variants';
      await this.opik.getOrCreateDataset(datasetName);

      const experiment = await this.opik.createExperiment({
        datasetName,
        name: name || experimentId,
        experimentConfig: { description }
      });

      return {
        id: experiment.id,
        name: name || experimentId,
        description,
        runs: [],
        createdAt: Date.now(),
      };
    } catch (error) {
      console.error('[OpikClient] Error creating experiment:', error);
      // Fallback for non-blocking
      return { id: experimentId, name, description, runs: [], createdAt: Date.now() };
    }
  }

  /**
   * Add a run to an experiment
   */
  async addRunToExperiment(experimentId: string, runId: string) {
    // In the official SDK, linking runs to experiments is usually done via traces 
    // and experiment items. For now we log it as a trace property.
    const trace = this.traces.get(runId);
    if (trace) {
      trace.update({
        metadata: { experiment_id: experimentId }
      });
    }
  }

  /**
   * Flush all logs to Comet.com
   */
  async flush() {
    await this.opik.flush();
  }
}

// Global Opik instance
let opikInstance: OpikClient | null = null;

export function getOpikClient(): OpikClient {
  if (!opikInstance) {
    opikInstance = new OpikClient({
      projectName: process.env.OPIK_PROJECT_NAME || 'wellness-ai-evaluation',
      apiKey: process.env.OPIK_API_KEY,
      workspaceName: process.env.OPIK_WORKSPACE_NAME || process.env.OPIK_WORKSPACE
    });
  }
  return opikInstance;
}

export { OpikClient };
