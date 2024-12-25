import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('expenses')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAll(@Request() req) {
    try {
      return await this.expenseService.getAllExpenses(req.user.userId);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body()
    body: {
      title: string;
      amount: number;
      date: string;
      category: string;
      paymentSource: string;
    },
    @Request() req,
  ) {
    const userId = req.user?.userId;
    if (!userId) {
      throw new BadRequestException('User ID is missing');
    }

    return this.expenseService.createExpense(body, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateExpense(
    @Param('id') id: string,
    @Body()
    data: {
      title?: string;
      amount?: number;
      date?: string;
      category?: string;
      paymentSource?: string;
    },
  ) {
    try {
      return await this.expenseService.updateExpense(id, data);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteExpense(@Param('id') id: string, @Request() req) {
    try {
      return await this.expenseService.deleteExpense(id, req.user.userId);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
