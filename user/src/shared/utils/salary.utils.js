import {
  BASE_SALARY,
  PERSONAL_DEDUCTION,
  DEPENDENT_DEDUCTION,
  TAX_BRACKETS,
  INSURANCE_RATES,
  MAX_SOCIAL_INSURANCE_SALARY,
} from '../constants/salary.constants.js';

export const calculateInsurance = (salary) => {
  const socialInsuranceSalary = Math.min(salary, MAX_SOCIAL_INSURANCE_SALARY);
  
  const socialInsurance = Math.round(socialInsuranceSalary * INSURANCE_RATES.SOCIAL);
  const healthInsurance = Math.round(salary * INSURANCE_RATES.HEALTH);
  const unemploymentInsurance = Math.round(salary * INSURANCE_RATES.UNEMPLOYMENT);
  const totalInsurance = socialInsurance + healthInsurance + unemploymentInsurance;

  return {
    socialInsurance,
    healthInsurance,
    unemploymentInsurance,
    totalInsurance,
  };
};

export const calculatePersonalIncomeTax = (taxableIncome) => {
  let totalTax = 0;
  const brackets = [];
  let remainingIncome = taxableIncome;

  for (let i = TAX_BRACKETS.length - 1; i >= 0; i--) {
    const bracket = TAX_BRACKETS[i];
    
    let taxableAmount = 0;
    let taxAmount = 0;

    if (remainingIncome > bracket.min) {
      const bracketRange = bracket.max === Infinity ? Infinity : bracket.max - bracket.min;
      taxableAmount = Math.min(remainingIncome - bracket.min, bracketRange);
      taxAmount = Math.round(taxableAmount * bracket.rate);
      totalTax += taxAmount;
      remainingIncome = bracket.min;
    }

    brackets.unshift({
      min: bracket.min,
      max: bracket.max === Infinity ? 0 : bracket.max,
      rate: bracket.rate,
      taxableAmount: taxableAmount,
      taxAmount: taxAmount,
    });
  }

  return {
    totalTax: Math.round(totalTax),
    brackets: brackets,
  };
};

export const calculateEmployerCosts = (grossSalary) => {
  const socialInsurance = Math.round(grossSalary * 0.17);
  const healthInsurance = Math.round(grossSalary * 0.03);
  const unemploymentInsurance = Math.round(grossSalary * 0.01);
  const occupationalAccident = Math.round(grossSalary * 0.005);
  const totalCost = grossSalary + socialInsurance + healthInsurance + unemploymentInsurance + occupationalAccident;

  return {
    grossSalary,
    socialInsurance,
    healthInsurance,
    unemploymentInsurance,
    occupationalAccident,
    totalCost,
  };
};

export const calculateGrossToNet = (grossSalary, insuranceSalary, dependents = 0) => {
  const insurance = calculateInsurance(insuranceSalary);
  
  const incomeBeforeTax = grossSalary - insurance.totalInsurance;
  
  const totalDeduction = PERSONAL_DEDUCTION + (dependents * DEPENDENT_DEDUCTION);
  const personalDeduction = PERSONAL_DEDUCTION;
  const dependentDeduction = dependents * DEPENDENT_DEDUCTION;
  
  const taxableIncome = Math.max(0, incomeBeforeTax - totalDeduction);
  
  const taxResult = calculatePersonalIncomeTax(taxableIncome);
  
  const netSalary = incomeBeforeTax - taxResult.totalTax;

  const employerCosts = calculateEmployerCosts(grossSalary);

  return {
    grossSalary,
    insuranceSalary,
    insurance,
    incomeBeforeTax,
    personalDeduction,
    dependentDeduction,
    totalDeduction,
    taxableIncome,
    personalIncomeTax: taxResult.totalTax,
    taxBrackets: taxResult.brackets,
    netSalary,
    dependents,
    employerCosts,
  };
};

export const calculateNetToGross = (netSalary, insuranceSalary, dependents = 0, useGrossAsInsuranceBase = false) => {
  let low = netSalary;
  let high = netSalary * 2;
  let maxIterations = 200;
  let iteration = 0;
  let tolerance = 1;
  let bestResult = null;
  let bestDifference = Infinity;

  while (iteration < maxIterations && (high - low) > tolerance) {
    const mid = (low + high) / 2;
    const actualInsuranceSalary = useGrossAsInsuranceBase ? mid : insuranceSalary;
    const result = calculateGrossToNet(mid, actualInsuranceSalary, dependents);
    const difference = result.netSalary - netSalary;

    if (Math.abs(difference) < Math.abs(bestDifference)) {
      bestDifference = difference;
      bestResult = result;
    }

    if (Math.abs(difference) <= tolerance) {
      return result;
    }

    if (difference > 0) {
      high = mid;
    } else {
      low = mid;
    }

    iteration++;
  }

  const finalMid = (low + high) / 2;
  const finalInsuranceSalary = useGrossAsInsuranceBase ? finalMid : insuranceSalary;
  const finalResult = bestResult || calculateGrossToNet(finalMid, finalInsuranceSalary, dependents);
  return finalResult;
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN').format(Math.round(amount || 0));
};
