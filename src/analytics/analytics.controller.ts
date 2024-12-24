import {
  BadRequestException,
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ExpenseService } from 'src/expense/expense.service';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly expenseService: ExpenseService) {}

  // Utility to parse and validate date ranges
  private parseDateRange(
    startDate?: string,
    endDate?: string,
  ): { startDate: Date; endDate: Date } {
    const parsedStartDate = startDate
      ? new Date(startDate)
      : new Date(new Date().getFullYear(), 0, 1); // Default to Jan 1 of current year
    const parsedEndDate = endDate ? new Date(endDate) : new Date(); // Default to today

    if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
      throw new BadRequestException('Invalid date range provided.');
    }

    return { startDate: parsedStartDate, endDate: parsedEndDate };
  }

  @Get('category-wise')
  async getCategoryWiseExpenses(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Request() req,
  ) {
    const { startDate: validStartDate, endDate: validEndDate } =
      this.parseDateRange(startDate, endDate);
    const userId = req.user.userId; // Extract user ID from the request

    const data = await this.expenseService.getCategoryWiseExpenses(
      validStartDate,
      validEndDate,
      userId,
    );
    return {
      data,
      metadata: {
        startDate: validStartDate,
        endDate: validEndDate,
      },
    };
  }

  @Get('monthly-totals')
  async getMonthlyTotals(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Request() req,
  ) {
    const { startDate: validStartDate, endDate: validEndDate } =
      this.parseDateRange(startDate, endDate);
    const userId = req.user.userId;

    const data = await this.expenseService.getMonthlyTotals(
      validStartDate,
      validEndDate,
      userId,
    );
    return {
      data,
      metadata: {
        startDate: validStartDate,
        endDate: validEndDate,
      },
    };
  }

  @Get('payment-source-distribution')
  async getPaymentSourceDistribution(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Request() req,
  ) {
    const { startDate: validStartDate, endDate: validEndDate } =
      this.parseDateRange(startDate, endDate);
    const userId = req.user.userId;

    const data = await this.expenseService.getPaymentSourceDistribution(
      validStartDate,
      validEndDate,
      userId,
    );
    return {
      data,
      metadata: {
        startDate: validStartDate,
        endDate: validEndDate,
      },
    };
  }

  @Get('expense-trends')
  async getExpenseTrends(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Request() req,
  ) {
    const { startDate: validStartDate, endDate: validEndDate } =
      this.parseDateRange(startDate, endDate);
    const userId = req.user.userId;

    const data = await this.expenseService.getExpenseTrends(
      validStartDate,
      validEndDate,
      userId,
    );
    return {
      data,
      metadata: {
        startDate: validStartDate,
        endDate: validEndDate,
      },
    };
  }

  @Get('summary')
  async getSummary(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Request() req,
  ) {
    const { startDate: validStartDate, endDate: validEndDate } =
      this.parseDateRange(startDate, endDate);
    const userId = req.user.userId;

    const data = await this.expenseService.getSummary(
      validStartDate,
      validEndDate,
      userId,
    );
    return {
      data,
      metadata: {
        startDate: validStartDate,
        endDate: validEndDate,
      },
    };
  }

  @Get('weekly-totals')
  async getWeeklyTotals(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Request() req,
  ) {
    const { startDate: validStartDate, endDate: validEndDate } =
      this.parseDateRange(startDate, endDate);
    const userId = req.user.userId;

    const data = await this.expenseService.getWeeklyTotals(
      validStartDate,
      validEndDate,
      userId,
    );
    return {
      data,
      metadata: {
        startDate: validStartDate,
        endDate: validEndDate,
      },
    };
  }

  @Get('daily-totals')
  async getDailyTotals(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Request() req,
  ) {
    const { startDate: validStartDate, endDate: validEndDate } =
      this.parseDateRange(startDate, endDate);
    const userId = req.user.userId;

    const data = await this.expenseService.getDailyTotals(
      validStartDate,
      validEndDate,
      userId,
    );
    return {
      data,
      metadata: {
        startDate: validStartDate,
        endDate: validEndDate,
      },
    };
  }
}
