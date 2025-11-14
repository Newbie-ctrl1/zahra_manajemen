import { Transaction, ProductReport, DailyReport, DateRange } from '@/types/report';

export function filterTransactionsByDate(
  transactions: Transaction[],
  dateRange: DateRange
): Transaction[] {
  if (!dateRange.startDate && !dateRange.endDate) {
    return transactions;
  }

  return transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);
    transactionDate.setHours(0, 0, 0, 0);

    if (dateRange.startDate && dateRange.endDate) {
      const start = new Date(dateRange.startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(dateRange.endDate);
      end.setHours(23, 59, 59, 999);
      return transactionDate >= start && transactionDate <= end;
    }

    if (dateRange.startDate) {
      const start = new Date(dateRange.startDate);
      start.setHours(0, 0, 0, 0);
      return transactionDate >= start;
    }

    if (dateRange.endDate) {
      const end = new Date(dateRange.endDate);
      end.setHours(23, 59, 59, 999);
      return transactionDate <= end;
    }

    return true;
  });
}

export function calculateDailyReport(transactions: Transaction[]): DailyReport[] {
  const dailyMap = new Map<string, DailyReport>();

  transactions
    .filter((t) => t.type === 'sale')
    .forEach((transaction) => {
      const dateKey = new Date(transaction.date).toISOString().split('T')[0];

      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, {
          date: dateKey,
          totalSales: 0,
          transactionCount: 0,
          transactions: [],
        });
      }

      const report = dailyMap.get(dateKey)!;
      report.totalSales += transaction.total;
      report.transactionCount += 1;
      report.transactions.push(transaction);
    });

  return Array.from(dailyMap.values()).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function calculateProductReport(transactions: Transaction[]): ProductReport[] {
  const productMap = new Map<string, ProductReport>();

  transactions
    .filter((t) => t.type === 'sale')
    .forEach((transaction) => {
      if (!productMap.has(transaction.productId)) {
        productMap.set(transaction.productId, {
          productId: transaction.productId,
          productName: transaction.productName,
          category: transaction.category,
          totalQuantity: 0,
          totalRevenue: 0,
          transactionCount: 0,
        });
      }

      const report = productMap.get(transaction.productId)!;
      report.totalQuantity += transaction.quantity;
      report.totalRevenue += transaction.total;
      report.transactionCount += 1;
    });

  return Array.from(productMap.values()).sort(
    (a, b) => b.totalRevenue - a.totalRevenue
  );
}

export function getTopProducts(
  transactions: Transaction[],
  limit: number = 5
): ProductReport[] {
  const productReports = calculateProductReport(transactions);
  return productReports.slice(0, limit);
}

export function getWeeklyReport(transactions: Transaction[]) {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const weeklyTransactions = transactions.filter(
    (t) => t.type === 'sale' && new Date(t.date) >= oneWeekAgo
  );

  const totalSales = weeklyTransactions.reduce((sum, t) => sum + t.total, 0);
  const transactionCount = weeklyTransactions.length;

  return {
    totalSales,
    transactionCount,
    averageTransaction: transactionCount > 0 ? totalSales / transactionCount : 0,
    transactions: weeklyTransactions,
  };
}

export function getMonthlyReport(transactions: Transaction[]) {
  const now = new Date();
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const monthlyTransactions = transactions.filter(
    (t) => t.type === 'sale' && new Date(t.date) >= oneMonthAgo
  );

  const totalSales = monthlyTransactions.reduce((sum, t) => sum + t.total, 0);
  const transactionCount = monthlyTransactions.length;

  return {
    totalSales,
    transactionCount,
    averageTransaction: transactionCount > 0 ? totalSales / transactionCount : 0,
    transactions: monthlyTransactions,
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}
