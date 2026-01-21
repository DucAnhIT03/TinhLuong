import { Body, Controller, Get, Post } from '@nestjs/common';
import { SalaryService } from '../services/salary.service';
import { GrossToNetRequestDto } from '../dtos/request/gross-to-net.dto';
import { NetToGrossRequestDto } from '../dtos/request/net-to-gross.dto';

@Controller('salary')
export class SalaryController {
  constructor(private readonly salaryService: SalaryService) {}

  @Get('meta')
  meta() {
    return this.salaryService.getMeta();
  }

  @Post('gross-to-net')
  grossToNet(@Body() body: Partial<GrossToNetRequestDto>) {
    const payload: GrossToNetRequestDto = {
      grossSalary: Number(body.grossSalary),
      insuranceSalary: body.insuranceSalary !== undefined ? Number(body.insuranceSalary) : undefined,
      dependents: body.dependents !== undefined ? Number(body.dependents) : undefined,
      regulation: body.regulation,
      region: body.region,
    };

    return this.salaryService.calculateGrossToNet(payload);
  }

  @Post('net-to-gross')
  netToGross(@Body() body: Partial<NetToGrossRequestDto>) {
    const payload: NetToGrossRequestDto = {
      netSalary: Number(body.netSalary),
      insuranceSalary: body.insuranceSalary !== undefined ? Number(body.insuranceSalary) : undefined,
      dependents: body.dependents !== undefined ? Number(body.dependents) : undefined,
      useGrossAsInsuranceBase: body.useGrossAsInsuranceBase,
      regulation: body.regulation,
      region: body.region,
    };

    return this.salaryService.calculateNetToGross(payload);
  }
}
