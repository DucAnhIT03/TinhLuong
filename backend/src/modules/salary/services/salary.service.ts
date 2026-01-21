import { Injectable, BadRequestException } from '@nestjs/common';
import {
  BASE_SALARY,
  DEPENDENT_DEDUCTION,
  EMPLOYER_RATES,
  INSURANCE_RATES,
  MAX_SOCIAL_INSURANCE_SALARY,
  PERSONAL_DEDUCTION,
  REGIONAL_MINIMUM_WAGE,
  REGIONS,
  REGULATIONS,
  TAX_BRACKETS,
} from '../../../common/constants/salary.constants';
import { GrossToNetRequestDto, NetToGrossRequestDto } from '../dtos/request';
import { SalaryResult, SalaryTaxBracket } from '../dtos/response';

@Injectable()
export class SalaryService {
  getMeta() {
    return {
      baseSalary: BASE_SALARY,
      personalDeduction: PERSONAL_DEDUCTION,
      dependentDeduction: DEPENDENT_DEDUCTION,
      regionalMinimumWage: REGIONAL_MINIMUM_WAGE,
      regulations: REGULATIONS,
      regions: REGIONS,
      taxBrackets: TAX_BRACKETS,
      insuranceRates: INSURANCE_RATES,
      employerRates: EMPLOYER_RATES,
      maxSocialInsuranceSalary: MAX_SOCIAL_INSURANCE_SALARY,
    };
  }

  calculateGrossToNet(payload: GrossToNetRequestDto): SalaryResult {
    const grossSalary = this.ensurePositiveNumber(payload.grossSalary, 'grossSalary');
    const dependents = this.ensureNonNegativeInteger(payload.dependents ?? 0, 'dependents');
    const insuranceSalary = this.ensurePositiveNumber(payload.insuranceSalary ?? grossSalary, 'insuranceSalary');

    const insurance = this.calculateInsurance(insuranceSalary);
    const incomeBeforeTax = grossSalary - insurance.totalInsurance;

    const personalDeduction = PERSONAL_DEDUCTION;
    const dependentDeduction = dependents * DEPENDENT_DEDUCTION;
    const totalDeduction = personalDeduction + dependentDeduction;

    const taxableIncome = Math.max(0, incomeBeforeTax - totalDeduction);
    const taxResult = this.calculatePersonalIncomeTax(taxableIncome);

    const netSalary = incomeBeforeTax - taxResult.totalTax;
    const employerCosts = this.calculateEmployerCosts(grossSalary);

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
      baseSalary: BASE_SALARY,
    };
  }

  calculateNetToGross(payload: NetToGrossRequestDto): SalaryResult {
    const netSalary = this.ensurePositiveNumber(payload.netSalary, 'netSalary');
    const dependents = this.ensureNonNegativeInteger(payload.dependents ?? 0, 'dependents');
    const useGrossAsInsuranceBase = payload.useGrossAsInsuranceBase ?? false;

    const insuranceSalaryInput = payload.insuranceSalary ?? 0;
    if (!useGrossAsInsuranceBase && insuranceSalaryInput <= 0) {
      throw new BadRequestException('insuranceSalary must be positive when useGrossAsInsuranceBase is false');
    }

    let low = netSalary;
    let high = netSalary * 2;
    let bestResult: SalaryResult | null = null;
    let bestDifference = Number.POSITIVE_INFINITY;
    const tolerance = 1;

    for (let i = 0; i < 200 && high - low > tolerance; i++) {
      const mid = (low + high) / 2;
      const insuranceSalary = useGrossAsInsuranceBase ? mid : insuranceSalaryInput;
      const result = this.calculateGrossToNet({ grossSalary: mid, insuranceSalary, dependents });
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
    }

    if (!bestResult) {
      const fallbackGross = (low + high) / 2;
      const insuranceSalary = useGrossAsInsuranceBase ? fallbackGross : insuranceSalaryInput;
      bestResult = this.calculateGrossToNet({ grossSalary: fallbackGross, insuranceSalary, dependents });
    }

    if (!bestResult) {
      throw new Error('Unable to calculate salary');
    }

    return bestResult;
  }

  private calculateInsurance(salary: number) {
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
  }

  private calculatePersonalIncomeTax(taxableIncome: number) {
    let totalTax = 0;
    const brackets: SalaryTaxBracket[] = [];
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
        taxableAmount,
        taxAmount,
      });
    }

    return { totalTax: Math.round(totalTax), brackets };
  }

  private calculateEmployerCosts(grossSalary: number) {
    const socialInsurance = Math.round(grossSalary * EMPLOYER_RATES.SOCIAL);
    const healthInsurance = Math.round(grossSalary * EMPLOYER_RATES.HEALTH);
    const unemploymentInsurance = Math.round(grossSalary * EMPLOYER_RATES.UNEMPLOYMENT);
    const occupationalAccident = Math.round(grossSalary * EMPLOYER_RATES.OCCUPATIONAL);
    const totalCost = grossSalary + socialInsurance + healthInsurance + unemploymentInsurance + occupationalAccident;

    return {
      grossSalary,
      socialInsurance,
      healthInsurance,
      unemploymentInsurance,
      occupationalAccident,
      totalCost,
    };
  }

  private ensurePositiveNumber(value: number, field: string) {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue) || numericValue <= 0) {
      throw new BadRequestException(`${field} must be a positive number`);
    }
    return numericValue;
  }

  private ensureNonNegativeInteger(value: number, field: string) {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue) || numericValue < 0) {
      throw new BadRequestException(`${field} must be a non-negative number`);
    }
    return Math.floor(numericValue);
  }
}
