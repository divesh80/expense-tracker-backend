import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

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
        isDeleted: false,
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
        isDeleted: false,
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

    return Object.entries(groupedByMonth)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([month, totalAmount]) => ({
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
        isDeleted: false,
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
        isDeleted: false,
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
        isDeleted: false,
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
        isDeleted: false,
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
        isDeleted: false,
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
        isDeleted: false,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const groupedByWeek = expenses.reduce((acc, expense) => {
      const expenseDate = new Date(expense.date);
      const weekStart = new Date(
        expenseDate.getFullYear(),
        expenseDate.getMonth(),
        expenseDate.getDate() - expenseDate.getDay(),
      ); // Start of the week (Sunday)

      const weekEnd = new Date(
        weekStart.getFullYear(),
        weekStart.getMonth(),
        weekStart.getDate() + 6,
      ); // End of the week (Saturday)

      const weekRange = `${weekStart.toISOString().split('T')[0]} to ${
        weekEnd.toISOString().split('T')[0]
      }`;

      acc[weekRange] = (acc[weekRange] || 0) + expense.amount;
      return acc;
    }, {});

    return Object.entries(groupedByWeek)
      .sort(
        ([a], [b]) =>
          new Date(a.split(' to ')[0]).getTime() -
          new Date(b.split(' to ')[0]).getTime(),
      )
      .map(([weekRange, totalAmount]) => ({
        week: weekRange,
        totalAmount,
      }));
  }

  async getDailyTotals(startDate: Date, endDate: Date, userId: string) {
    const expenses = await this.prisma.expense.findMany({
      where: {
        userId,
        isDeleted: false,
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

    return Object.entries(groupedByDay)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([day, totalAmount]) => ({
        day,
        totalAmount,
      }));
  }
}
