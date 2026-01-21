export interface GrossToNetRequestDto {
  grossSalary: number;
  insuranceSalary?: number;
  dependents?: number;
  regulation?: string;
  region?: string;
}
