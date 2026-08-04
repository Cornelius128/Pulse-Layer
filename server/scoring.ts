export interface AccountRawData {
  account_id: string;
  created_at: string;
  lifespan_days: number;
  tx_count: number;
  active_days: number;
  success_rate: number; // 0.0 - 1.0
  xlm_balance: number;
  trustlines_count: number;
  funder?: string;
  tx_per_day_max?: number;
  dormant_burst_detected?: boolean;
  low_score_counterparty_ratio?: number; // 0.0 - 1.0
  counterparty_scores?: number[];
  recent_scores?: number[];
}

export interface SignalItem {
  id: string;
  type: 'positive' | 'negative' | 'neutral';
  category: 'Consistency' | 'Lifespan' | 'Interaction' | 'Risk' | 'Balance';
  title: string;
  description: string;
  delta: number;
}

export interface ScoreBreakdown {
  consistency: number; // 0-100
  lifespan: number; // 0-100
  interaction_quality: number; // 0-100
  risk_exposure: number; // 0-100 (100 = best, 0 = extreme risk)
}

export interface CalculatedTrustScore {
  account: string;
  score: number;
  trend: 'up' | 'down' | 'stable';
  confidence: number;
  anomaly_flag: boolean;
  risk_level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  lifespan_days: number;
  tx_count: number;
  active_days: number;
  success_rate: number;
  xlm_balance: number;
  trustlines_count: number;
  funder?: string;
  last_updated: string;
  breakdown: ScoreBreakdown;
  signals: SignalItem[];
}

/**
 * Deterministic Trust Scoring Model for Stellar Accounts
 */
export function calculateTrustScore(data: AccountRawData): CalculatedTrustScore {
  let score = 50.0;
  const signals: SignalItem[] = [];

  // 1. Account Lifespan Bonus (Max +15)
  const lifespanDays = Math.max(1, data.lifespan_days);
  const lifespanBonus = Math.min(15, Math.floor(lifespanDays / 24));
  if (lifespanBonus > 0) {
    score += lifespanBonus;
    signals.push({
      id: 'lifespan_bonus',
      type: 'positive',
      category: 'Lifespan',
      title: 'Established On-Chain History',
      description: `Account has been active on Stellar for ${lifespanDays} days (+${lifespanBonus} pts).`,
      delta: lifespanBonus,
    });
  } else {
    signals.push({
      id: 'new_account',
      type: 'neutral',
      category: 'Lifespan',
      title: 'Recent Creation',
      description: `Account is newly created (${lifespanDays} days old).`,
      delta: 0,
    });
  }

  // 2. Consistency & Active Days (Max +15)
  const activeDaysRatio = Math.min(1.0, data.active_days / Math.max(1, Math.min(lifespanDays, 365)));
  const consistencyBonus = Math.min(15, Math.round(activeDaysRatio * 15 + Math.min(5, data.tx_count / 20)));
  if (consistencyBonus > 0) {
    score += consistencyBonus;
    signals.push({
      id: 'consistency_bonus',
      type: 'positive',
      category: 'Consistency',
      title: 'Consistent Activity Pattern',
      description: `Active across ${data.active_days} distinct days with ${data.tx_count} transactions (+${consistencyBonus} pts).`,
      delta: consistencyBonus,
    });
  }

  // 3. Interaction Quality & Assets (Max +15)
  const trustlinesBonus = Math.min(8, data.trustlines_count * 2);
  let counterpartyQualityBonus = 0;
  if (data.counterparty_scores && data.counterparty_scores.length > 0) {
    const avgCPScore = data.counterparty_scores.reduce((a, b) => a + b, 0) / data.counterparty_scores.length;
    if (avgCPScore >= 70) {
      counterpartyQualityBonus = 7;
    } else if (avgCPScore >= 55) {
      counterpartyQualityBonus = 4;
    }
  } else if (data.tx_count > 5) {
    counterpartyQualityBonus = 5;
  }

  const interactionBonus = Math.min(15, trustlinesBonus + counterpartyQualityBonus);
  if (interactionBonus > 0) {
    score += interactionBonus;
    signals.push({
      id: 'interaction_bonus',
      type: 'positive',
      category: 'Interaction',
      title: 'High Counterparty & Asset Diversity',
      description: `Maintains ${data.trustlines_count} asset trustlines and interacts with verified entities (+${interactionBonus} pts).`,
      delta: interactionBonus,
    });
  }

  // 4. Reserve Balance (Max +5)
  const balanceBonus = Math.min(5, Math.floor(data.xlm_balance / 100));
  if (balanceBonus > 0) {
    score += balanceBonus;
    signals.push({
      id: 'balance_bonus',
      type: 'positive',
      category: 'Balance',
      title: 'Substantial XLM Reserve',
      description: `Holds ${data.xlm_balance.toLocaleString()} XLM reserve (+${balanceBonus} pts).`,
      delta: balanceBonus,
    });
  }

  // ---------------- RISKS & PENALTIES ----------------

  let anomalyFlag = false;

  // 5. Activity Spikes / Velocity (-15 max)
  const maxTxPerDay = data.tx_per_day_max || (data.lifespan_days > 0 ? data.tx_count / data.lifespan_days : data.tx_count);
  if (maxTxPerDay > 30) {
    const velocityPenalty = -15;
    score += velocityPenalty;
    anomalyFlag = true;
    signals.push({
      id: 'velocity_spike',
      type: 'negative',
      category: 'Risk',
      title: 'High Velocity Spike Detected',
      description: `Unusual transaction burst rate (${Math.round(maxTxPerDay)} tx/day) (${velocityPenalty} pts).`,
      delta: velocityPenalty,
    });
  } else if (maxTxPerDay > 15) {
    const velocityPenalty = -8;
    score += velocityPenalty;
    signals.push({
      id: 'velocity_moderate',
      type: 'negative',
      category: 'Risk',
      title: 'Moderate Activity Burst',
      description: `Elevated transaction volume per day (${Math.round(maxTxPerDay)} tx/day) (${velocityPenalty} pts).`,
      delta: velocityPenalty,
    });
  }

  // 6. Dormant -> Burst Behavior (-20 max)
  if (data.dormant_burst_detected) {
    const dormantPenalty = -20;
    score += dormantPenalty;
    anomalyFlag = true;
    signals.push({
      id: 'dormant_burst',
      type: 'negative',
      category: 'Risk',
      title: 'Dormant to Burst Pattern',
      description: `Account was dormant for 30+ days followed by immediate multi-op burst (${dormantPenalty} pts).`,
      delta: dormantPenalty,
    });
  }

  // 7. Low-Score Counterparty Ratio (-15 max)
  const lowScoreRatio = data.low_score_counterparty_ratio || 0;
  if (lowScoreRatio > 0.4) {
    const cpPenalty = -15;
    score += cpPenalty;
    anomalyFlag = true;
    signals.push({
      id: 'low_score_exposure',
      type: 'negative',
      category: 'Interaction',
      title: 'Suspicious Counterparty Exposure',
      description: `${Math.round(lowScoreRatio * 100)}% of interactions are with unverified or low-trust accounts (${cpPenalty} pts).`,
      delta: cpPenalty,
    });
  } else if (lowScoreRatio > 0.2) {
    const cpPenalty = -8;
    score += cpPenalty;
    signals.push({
      id: 'low_score_moderate',
      type: 'negative',
      category: 'Interaction',
      title: 'Minor Low-Trust Counterparty Exposure',
      description: `${Math.round(lowScoreRatio * 100)}% of counterparties are low-scored accounts (${cpPenalty} pts).`,
      delta: cpPenalty,
    });
  }

  // 8. Transaction Failure Penalty (-10 max)
  if (data.success_rate < 0.8 && data.tx_count >= 5) {
    const failPenalty = Math.max(-10, -Math.round((1.0 - data.success_rate) * 25));
    score += failPenalty;
    signals.push({
      id: 'failed_tx_ratio',
      type: 'negative',
      category: 'Risk',
      title: 'High Operation Failure Rate',
      description: `${Math.round((1 - data.success_rate) * 100)}% of submitted on-chain operations failed (${failPenalty} pts).`,
      delta: failPenalty,
    });
  }

  // Clamp final score between 0 and 100
  const finalScore = Math.max(0, Math.min(100, Math.round(score)));

  // Calculate Trend
  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (data.recent_scores && data.recent_scores.length >= 2) {
    const prev = data.recent_scores[data.recent_scores.length - 2];
    if (finalScore - prev >= 3) trend = 'up';
    else if (prev - finalScore >= 3) trend = 'down';
  }

  // Confidence Calculation
  const confidence = Math.min(0.99, Math.max(0.45, 0.40 + (data.tx_count / 100) * 0.35 + (lifespanDays / 365) * 0.24));

  // Risk Level Assignment
  let risk_level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'MODERATE';
  if (finalScore >= 75) risk_level = 'LOW';
  else if (finalScore >= 55) risk_level = 'MODERATE';
  else if (finalScore >= 35) risk_level = 'HIGH';
  else risk_level = 'CRITICAL';

  // Sub-breakdowns
  const consistencyScore = Math.min(100, Math.round((consistencyBonus / 15) * 100));
  const lifespanScore = Math.min(100, Math.round((lifespanBonus / 15) * 100));
  const interactionScore = Math.min(100, Math.round((interactionBonus / 15) * 100));
  const riskPenaltySum = Math.abs(signals.filter(s => s.type === 'negative').reduce((acc, s) => acc + s.delta, 0));
  const riskExposureScore = Math.max(0, 100 - Math.round((riskPenaltySum / 40) * 100));

  return {
    account: data.account_id,
    score: finalScore,
    trend,
    confidence: Number(confidence.toFixed(2)),
    anomaly_flag: anomalyFlag,
    risk_level,
    lifespan_days: data.lifespan_days,
    tx_count: data.tx_count,
    active_days: data.active_days,
    success_rate: data.success_rate,
    xlm_balance: data.xlm_balance,
    trustlines_count: data.trustlines_count,
    funder: data.funder,
    last_updated: new Date().toISOString(),
    breakdown: {
      consistency: consistencyScore,
      lifespan: lifespanScore,
      interaction_quality: interactionScore,
      risk_exposure: riskExposureScore,
    },
    signals,
  };
}
