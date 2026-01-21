import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SalaryModule } from './modules/salary/salary.module';

@Module({
  imports: [SalaryModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}