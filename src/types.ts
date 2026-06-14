export interface SandboxParams {
  planetMass: number; // in 10^24 kg
  orbitalRadius: number; // in 1000 km
  satelliteMass: number; // in kg
}

export interface FormulaBlock {
  id: string;
  expression: string;
  description: string;
  stepType: 'groundwork' | 'manipulation' | 'precision' | 'incorrect';
}

export interface RubricCriterion {
  id: string;
  title: string;
  mark: string;
  description: string;
  math: string;
  examinerTip: string;
  badge: 'Groundwork' | 'Manipulation' | 'Precision';
}
