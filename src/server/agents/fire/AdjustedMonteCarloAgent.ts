import { DeterministicAgent } from '../core/Agent';
import { SessionState, type FireSessionState } from '../core/SessionState';
import { FIRE_DEFAULT_ITERATIONS, FIRE_DEFAULT_SEED, runMonteCarlo } from '../utils/fire';

/**
 * Runs AFTER Stage2 (MonteCarlo + SipGlidepath + InsuranceGap).
 * Re-runs Monte Carlo with the *required SIP* from SipGlidepathAgent
 * so the user sees a meaningful success probability — not 0% when their
 * current SIP is zero.
 *
 * Stores both "current SIP" and "with required SIP" results so the
 * RoadmapBuilder can present a comparative view.
 */
export class AdjustedMonteCarloAgent extends DeterministicAgent<FireSessionState> {
  constructor() {
    super('AdjustedMonteCarloEngine', 2);
  }

  protected async run(state: SessionState<FireSessionState>): Promise<void> {
    const fireInputs = state.get('fire_inputs');
    const macroParameters = state.get('macro_parameters');
    const sipPlan = state.get('sip_plan');
    const currentMcResults = state.get('monte_carlo_results');

    if (!fireInputs || !macroParameters || !sipPlan) {
      throw new Error('Stage2 agents must complete before AdjustedMonteCarloEngine.');
    }

    // If the user already has a meaningful SIP (current MC success > 0), skip re-run
    if (currentMcResults && currentMcResults.successProbability > 5) {
      console.log(
        `[Agent: ${this.name}] Current SIP already yields ${currentMcResults.successProbability.toFixed(1)}% success — no adjustment needed.`,
      );
      return;
    }

    const requiredSip = sipPlan.medianSipRequired;
    if (requiredSip <= 0) {
      console.log(`[Agent: ${this.name}] Required SIP is ₹0 — existing corpus is sufficient.`);
      return;
    }

    console.log(
      `[Agent: ${this.name}] Re-running ${FIRE_DEFAULT_ITERATIONS} simulations with required SIP ₹${requiredSip.toLocaleString('en-IN')}/month...`,
    );

    const adjustedResults = runMonteCarlo(fireInputs, macroParameters, {
      iterations: FIRE_DEFAULT_ITERATIONS,
      seed: FIRE_DEFAULT_SEED,
      monthlySipOverride: requiredSip,
    });

    // Preserve original results as "baseline", update main results to adjusted
    if (currentMcResults) {
      state.set('baseline_monte_carlo' as keyof FireSessionState, currentMcResults as FireSessionState[keyof FireSessionState]);
    }
    state.set('monte_carlo_results', adjustedResults);

    console.log(
      `[Agent: ${this.name}] Adjusted success probability: ${adjustedResults.successProbability.toFixed(1)}% (with ₹${requiredSip.toLocaleString('en-IN')}/mo SIP)`,
    );
  }
}
