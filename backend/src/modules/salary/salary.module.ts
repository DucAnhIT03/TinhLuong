import { Module } from '@nestjs/common';
import { SalaryService } from './services/salary.service';
import { SalaryController } from './controllers/salary.controller';

@Module({
  providers: [SalaryService],
  controllers: [SalaryController],
})
export class SalaryModule {}
