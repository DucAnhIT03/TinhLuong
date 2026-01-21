export interface NetToGrossRequestDto {
  netSalary: number;
  insuranceSalary?: number;
  dependents?: number;
  useGrossAsInsuranceBase?: boolean;
  regulation?: string;
  region?: string;
}
