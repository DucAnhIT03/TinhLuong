export const BASE_SALARY = 2340000;
export const PERSONAL_DEDUCTION = 15500000;
export const DEPENDENT_DEDUCTION = 6200000;

export const REGIONAL_MINIMUM_WAGE = {
  I: 5280000,
  II: 4700000,
  III: 4160000,
  IV: 3700000,
};


export const INSURANCE_RATES = {
  SOCIAL: 0.08,
  HEALTH: 0.015,
  UNEMPLOYMENT: 0.01,
  TOTAL: 0.105,
};

export const MAX_SOCIAL_INSURANCE_SALARY = BASE_SALARY * 20;

export const TAX_BRACKETS = [
  { min: 0, max: 10_000_000, rate: 0.05 },
  { min: 10_000_000, max: 30_000_000, rate: 0.1 },
  { min: 30_000_000, max: 60_000_000, rate: 0.2 },
  { min: 60_000_000, max: 100_000_000, rate: 0.3 },
  { min: 100_000_000, max: Infinity, rate: 0.35 },
];

export const REGULATIONS = {
  FROM_2025_07_01: {
    label: 'Từ 01/07/2025 - 31/12/2025',
    value: '2025-07-01',
  },
  FROM_2026_01_01: {
    label: 'Từ 01/01/2026 (Mới nhất)',
    value: '2026-01-01',
  },
};

export const REGIONS = ['I', 'II', 'III', 'IV'];

