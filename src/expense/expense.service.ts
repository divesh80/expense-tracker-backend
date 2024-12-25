import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Expense } from '@prisma/client';

@Injectable()
export class ExpenseService {
  constructor(private prisma: PrismaService) {}

  async getAllExpenses(userId: string) {
    return this.prisma.expense.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });
  }

  async createExpense(
    data: {
      title: string;
      amount: number;
      date: string;
      category: string;
      paymentSource: string;
    },
    userId: string,
  ) {
    // Validate and convert date
    const formattedDate = new Date(data.date).toISOString();

    return this.prisma.expense.create({
      data: {
        ...data,
        date: formattedDate,
        userId,
      },
    });
  }

  async updateExpense(
    id: string,
    data: Partial<{
      title: string;
      amount: number;
      date: string;
      category: string;
      paymentSource: string;
    }>,
  ): Promise<Expense> {
    const expense = await this.prisma.expense.findUnique({ where: { id } });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    const updateData: Partial<Expense> = {
      ...data,
      date: data.date ? new Date(data.date) : undefined,
    };

    return this.prisma.expense.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteExpense(expenseId: string, userId: string) {
    const expense = await this.prisma.expense.findFirst({
      where: { id: expenseId, userId },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found or unauthorized');
    }

    return this.prisma.expense.delete({ where: { id: expenseId } });
  }
}
