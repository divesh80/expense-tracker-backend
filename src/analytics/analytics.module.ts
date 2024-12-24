import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { ExpenseModule } from '../expense/expense.module'; // Import ExpenseModule

@Module({
  imports: [ExpenseModule],
  controllers: [AnalyticsController],
})
export class AnalyticsModule {}
