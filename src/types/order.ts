// ============ STATUS TYPES ============
export type RunStatus = "pending" | "completed" | "cancelled" | "retrying";

export type OrderStatus =
  | "running"
  | "paused"
  | "cancelled"
  | "completed"
  | "processing"
  | "failed"
  | "pending";

export type PatternType =
  | "smooth-s-curve"
  | "rocket-launch"
  | "sunset-fade"
  | "viral-spike"
  | "micro-burst"
  | "heartbeat"
  | "sawtooth"
  | "fibonacci-spiral"
  | "natural-decay"
  | "exponential"
  | "steady-climb"
  | "wave-pattern"
  | "manual";

export type QuickPatternPreset =
  | "viral-boost"
  | "fast-start"
  | "trending-push"
  | "slow-burn";

// ============ CONFIG TYPES ============
export interface DeliveryOption {
  mode: "auto" | "preset" | "custom";
  hours: number;
  label: string;
}

export interface OrderConfig {
  postUrl: string;
  totalViews: number;
  startDelayHours: number;
  includeLikes: boolean;
  includeShares: boolean;
  includeSaves: boolean;
  includeComments: boolean;
  variancePercent: number;
  peakHoursBoost: boolean;
  quickPreset: QuickPatternPreset | null;
  delivery: DeliveryOption;
  minViewsPerRun: number;
}

// ============ RUN TYPES ============
// RunStep = used by original site
// PatternRun = alias used by copied site
// They are identical - we keep both names
export interface RunStep {
  run: number;
  at: Date;
  minutesFromStart: number;
  views: number;
  likes: number;
  shares: number;
  saves: number;
  comments: number;
  cumulativeViews: number;
  cumulativeLikes: number;
  cumulativeShares: number;
  cumulativeSaves: number;
  cumulativeComments: number;
}

// Alias so both sites work
export type PatternRun = RunStep;

// ============ PATTERN PLAN ============
export interface PatternPlan {
  patternId: number;
  patternName: string;
  patternType: PatternType;
  totalRuns: number;
  approximateIntervalMin: number;
  finishTime: Date;
  estimatedDurationHours: number;
  risk: "Safe" | "Medium" | "High" | "Risk";
  runs: RunStep[];
}

// ============ API TYPES ============
export interface ApiService {
  id: string;
  name: string;
  type: string;
  rate: string;
  min: number;
  max: number;
}

export interface ApiPanel {
  id: string;
  name: string;
  url: string;
  key: string;
  status: "Active" | "Inactive";
  services: ApiService[];
  lastFetchAt?: string;
  lastFetchError?: string;
}

export interface Bundle {
  id: string;
  apiId: string;
  name: string;
  serviceIds: {
    views: string;
    likes: string;
    shares: string;
    saves: string;
    comments: string;
  };
}

// ============ BACKEND RUN INFO ============
// Full version from original site with all retry fields
export interface BackendRunInfo {
  id: string | number;
  label: string;
  quantity: number;
  time: string;
  status: string;
  done?: boolean;
  cancelled?: boolean;
  error: string | null;
  lastError?: string | null;
  retryCount?: number;
  retryReason?: string | null;
  originalTime?: string;
  currentTime?: string;
  executedAt: string | null;
  smmOrderId: string | number | null;
}

// ============ CREATED ORDER ============
export interface CreatedOrder {
  id: string;
  name: string;
  batchId?: string;
  batchIndex?: number;
  batchTotal?: number;
  schedulerOrderId?: string;
  smmOrderId: string;
  link: string;
  totalViews: number;
  startDelayHours: number;
  patternType: PatternType;
  patternName: string;
  runs: RunStep[];
  engagement: {
    likes: number;
    shares: number;
    saves: number;
    comments: number;
  };
  serviceId: string;
  selectedAPI: string | null;
  selectedBundle: string;
  status: OrderStatus;
  completedRuns: number;
  runStatuses: RunStatus[];
  runErrors?: string[];
  runRetries?: number[];
  runOriginalTimes?: string[];
  runCurrentTimes?: string[];
  runReasons?: string[];
  runActualExecutedTimes?: (string | null)[];
  errorMessage?: string;
  createdAt: string;
  lastUpdatedAt?: string;
  backendRuns?: BackendRunInfo[];
}
