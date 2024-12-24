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

  async getCategoryWiseExpenses(
    startDate: Date,
    endDate: Date,
    userId: string,
  ) {
    const categories = await this.prisma.expense.groupBy({
      by: ['category'],
      _sum: { amount: true },
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    return categories.map((item) => ({
      category: item.category,
      totalAmount: item._sum.amount || 0,
    }));
  }

  async getMonthlyTotals(startDate: Date, endDate: Date, userId: string) {
    const expenses = await this.prisma.expense.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const groupedByMonth = expenses.reduce((acc, expense) => {
      const month = new Date(expense.date).toLocaleString('default', {
        month: 'long',
      });
      acc[month] = (acc[month] || 0) + expense.amount;
      return acc;
    }, {});

    return Object.entries(groupedByMonth).map(([month, totalAmount]) => ({
      month,
      totalAmount,
    }));
  }

  async getPaymentSourceDistribution(
    startDate: Date,
    endDate: Date,
    userId: string,
  ) {
    const sources = await this.prisma.expense.groupBy({
      by: ['paymentSource'],
      _count: { paymentSource: true },
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    return sources.map((item) => ({
      paymentSource: item.paymentSource || 'Unknown',
      count: item._count.paymentSource || 0,
    }));
  }

  async getExpenseTrends(startDate: Date, endDate: Date, userId: string) {
    const expenses = await this.prisma.expense.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    return expenses.map((expense) => ({
      date: new Date(expense.date).toISOString().split('T')[0],
      amount: expense.amount,
    }));
  }

  async getSummary(startDate: Date, endDate: Date, userId: string) {
    const totalExpenses = await this.prisma.expense.aggregate({
      _sum: { amount: true },
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const categories = await this.prisma.expense.groupBy({
      by: ['category'],
      _sum: { amount: true },
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const paymentSources = await this.prisma.expense.groupBy({
      by: ['paymentSource'],
      _count: { paymentSource: true },
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const mostSpentCategory =
      categories.sort((a, b) => b._sum.amount - a._sum.amount)[0]?.category ||
      'N/A';
    const mostUsedPaymentSource =
      paymentSources.sort(
        (a, b) => b._count.paymentSource - a._count.paymentSource,
      )[0]?.paymentSource || 'N/A';

    return {
      totalExpenses: totalExpenses._sum.amount || 0,
      totalCategories: categories.length,
      mostSpentCategory,
      mostUsedPaymentSource,
    };
  }

  async getWeeklyTotals(startDate: Date, endDate: Date, userId: string) {
    const expenses = await this.prisma.expense.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const groupedByWeek = expenses.reduce((acc, expense) => {
      const week = `Week-${Math.ceil(new Date(expense.date).getDate() / 7)}`;
      acc[week] = (acc[week] || 0) + expense.amount;
      return acc;
    }, {});

    return Object.entries(groupedByWeek).map(([week, totalAmount]) => ({
      week,
      totalAmount,
    }));
  }

  async getDailyTotals(startDate: Date, endDate: Date, userId: string) {
    const expenses = await this.prisma.expense.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const groupedByDay = expenses.reduce((acc, expense) => {
      const day = new Date(expense.date).toISOString().split('T')[0]; // Format as YYYY-MM-DD
      acc[day] = (acc[day] || 0) + expense.amount;
      return acc;
    }, {});

    return Object.entries(groupedByDay).map(([day, totalAmount]) => ({
      day,
      totalAmount,
    }));
  }
}
