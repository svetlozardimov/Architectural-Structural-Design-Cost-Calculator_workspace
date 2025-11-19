
export interface StructuralFormState {
  projectType: string;
  area: number;
  wallSections: number;
  additionalLength: number;
  objectName: string;
  currencyDisplay: 'eur' | 'bgn' | 'both';
  hasCrane: boolean;
  hasComplexity: boolean;
  complexityPercentage: number;
  isAccelerated: boolean;
  includeSupervision: boolean;
}

export interface ArchFormState {
  objectName: string;
  currencyDisplay: 'eur' | 'bgn' | 'both';
  // New Buildings
  toggleNewBuildings: boolean;
  buildingType: string; // '0' | '1' | ...
  area: number;
  phase: number; // 0-4
  // PUP
  toggleDevelopmentPlans: boolean;
  planType: string; // '0' | '1' | '2' | '3'
  plotCount: number;
  plotArea: string; // '0' | '1' | '2' | '3' | '4'
  // Hourly
  toggleHourlyRate: boolean;
  designerType: string; // Value is price string
  hours: number;
  // Coefficients
  difficultyPercent: number;
  difficultyNotes: string;
  coefVariant: boolean;
  repetitions: number;
  coefReconstructionExisting: boolean;
  coefReconstructionMissing: boolean;
  coefAccelerated: boolean;
}

export type FormState = StructuralFormState | ArchFormState;

export interface CalculationResult {
  currentTotal: number;
  log: string[];
  error: boolean;
  hintMessages?: string[];
}

export type ConstructionType = {
  name: string;
  basePrice: number;
  type: 'fixed' | 'per_m2' | 'retaining_wall';
  minArea?: number;
  maxArea?: number;
};

export interface SavedProject {
  id: string;
  name: string;
  lastModified: number;
  type: 'structural' | 'architectural';
  data: any; // Holds either form state
  isArchived?: boolean;
}
