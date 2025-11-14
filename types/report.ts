// Types untuk sistem laporan

export interface Transaction {
  id: string;
  date: Date;
  productId: string;
  productName: string;
  category: string;
  quantity: number;
  price: number;
  total: number;
  type: 'sale' | 'stock_in' | 'stock_out';
}

export interface DailyReport {
  date: string;
  totalSales: number;
  transactionCount: number;
  transactions: Transaction[];
}

export interface ProductReport {
  productId: string;
  productName: string;
  category: string;
  totalQuantity: number;
  totalRevenue: number;
  transactionCount: number;
}

export interface StockMovement {
  id: string;
  date: Date;
  productId: string;
  productName: string;
  type: 'in' | 'out';
  quantity: number;
  reason: string;
  reference?: string;
}

export interface FishStock {
  id: string;
  date: Date;
  fishType: 'lele' | 'nila';
  type: 'in' | 'out';
  quantity: number; // dalam kg
  weight?: number; // berat per ekor (gram)
  totalFish?: number; // jumlah ekor
  price?: number; // harga per kg
  total?: number; // total harga
  reason: string;
  supplier?: string;
  reference?: string;
}

export interface FishStockSummary {
  fishType: 'lele' | 'nila';
  totalIn: number;
  totalOut: number;
  currentStock: number;
  totalRevenue: number;
  averagePrice: number;
}

export interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

export interface ReportSummary {
  totalSales: number;
  totalTransactions: number;
  averageTransaction: number;
  topProducts: ProductReport[];
}
