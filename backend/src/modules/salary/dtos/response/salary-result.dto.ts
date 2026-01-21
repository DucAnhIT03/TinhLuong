export interface SalaryTaxBracket {
  min: number;
  max: number;
  rate: number;
  taxableAmount: number;
  taxAmount: number;
}

export interface SalaryResult {
  grossSalary: number;
  insuranceSalary: number;
  insurance: {
    socialInsurance: number;
    healthInsurance: number;
    unemploymentInsurance: number;
    totalInsurance: number;
  };
  incomeBeforeTax: number;
  personalDeduction: number;
  dependentDeduction: number;
  totalDeduction: number;
  taxableIncome: number;
  personalIncomeTax: number;
  taxBrackets: SalaryTaxBracket[];
  netSalary: number;
  dependents: number;
  employerCosts: {
    grossSalary: number;
    socialInsurance: number;
    healthInsurance: number;
    unemploymentInsurance: number;
    occupationalAccident: number;
    totalCost: number;
  };
  baseSalary: number;
}
