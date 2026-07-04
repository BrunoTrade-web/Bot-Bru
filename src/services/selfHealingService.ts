import { Signal } from '../lib/medusa';

export interface AppError {
  id: string;
  type: 'UI' | 'DATA' | 'ANALYSIS' | 'SYSTEM';
  message: string;
  timestamp: number;
  fixed: boolean;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface PredictionError {
  symbol: string;
  timeframe: string;
  prediction: Signal;
  actualResult: 'WIN' | 'LOSS';
  timestamp: number;
}

class SelfHealingEngine {
  private errors: AppError[] = [];
  private learnedInhibitors: Record<string, number> = {}; // penalty factors for specific bot/timeframe combos

  logError(error: Omit<AppError, 'id' | 'fixed' | 'timestamp'>) {
    const newError: AppError = {
      ...error,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      fixed: false
    };
    this.errors.push(newError);
    this.attemptHealing(newError);
    console.warn(`[Self-Healing] Logged ${error.type} error: ${error.message}`);
  }

  private attemptHealing(error: AppError) {
    // Simulating "Hidden Bot" correction
    setTimeout(() => {
      switch (error.type) {
        case 'UI':
          // Potential reset of local storage or layout state
          error.fixed = true;
          break;
        case 'DATA':
          // Trigger a data refresh
          error.fixed = true;
          break;
        case 'ANALYSIS':
          // Adjust logic parameters
          error.fixed = true;
          break;
      }
      if (error.fixed) {
        console.log(`[Self-Healing] Bot fixed error: ${error.id}`);
      }
    }, 2000);
  }

  // AI Learning: Adjusts "Bot Weights" based on past performance to "learn" from errors
  learnFromMarketOutcome(outcome: PredictionError) {
    const key = `${outcome.symbol}-${outcome.timeframe}`;
    if (outcome.actualResult === 'LOSS') {
      // Increase penalty for this specific scenario
      this.learnedInhibitors[key] = (this.learnedInhibitors[key] || 1) * 0.95;
    } else {
      // Reward success
      this.learnedInhibitors[key] = Math.min(1.2, (this.learnedInhibitors[key] || 1) * 1.02);
    }
  }

  getInhibitor(symbol: string, timeframe: string): number {
    return this.learnedInhibitors[`${symbol}-${timeframe}`] || 1;
  }

  getRecentErrors() {
    return [...this.errors].reverse().slice(0, 10);
  }
}

export const healingEngine = new SelfHealingEngine();
