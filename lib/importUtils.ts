import { Transaction, FishStock } from '@/types/report';

/**
 * Parse uploaded data to Transaction format for Warung
 */
export function parseToTransactions(data: any[]): Transaction[] {
  const transactions = data
    .map((row, index) => {
      try {
        // Support multiple column name variations
        const date = row.tanggal || row.date || row.Tanggal || row.Date;
        const productId = row.id_produk || row.product_id || row.productId || row.ProductId || `PRD-${index}`;
        const productName = row.produk || row.product || row.Produk || row.Product || row.nama_produk || row.productName;
        const category = row.kategori || row.category || row.Kategori || row.Category;
        const quantity = parseInt(row.jumlah || row.quantity || row.Jumlah || row.Quantity || '0');
        const price = parseFloat(row.harga || row.price || row.Harga || row.Price || '0');
        const total = parseFloat(row.total || row.Total || '0') || (quantity * price);
        const type = (row.tipe || row.type || row.Tipe || row.Type || 'sale').toLowerCase();

        if (!date || !productName) {
          console.warn(`Row ${index + 1}: Missing required fields (tanggal, produk)`);
          return null;
        }

        // Parse date
        let parsedDate: Date;
        if (typeof date === 'number') {
          // Excel date serial number
          parsedDate = excelDateToJSDate(date);
        } else if (typeof date === 'string') {
          parsedDate = new Date(date);
        } else {
          parsedDate = new Date();
        }

        if (isNaN(parsedDate.getTime())) {
          console.warn(`Row ${index + 1}: Invalid date format`);
          return null;
        }

        // Normalize type
        let transactionType: 'sale' | 'stock_in' | 'stock_out' = 'sale';
        if (type === 'masuk' || type === 'stock_in') transactionType = 'stock_in';
        else if (type === 'keluar' || type === 'stock_out') transactionType = 'stock_out';

        return {
          id: `import-${Date.now()}-${index}`,
          date: parsedDate,
          productId: String(productId).trim(),
          productName: String(productName).trim(),
          category: category ? String(category).trim() : 'Umum',
          quantity: isNaN(quantity) ? 0 : quantity,
          price: isNaN(price) ? 0 : price,
          total: isNaN(total) ? 0 : total,
          type: transactionType,
        };
      } catch (error) {
        console.error(`Error parsing row ${index + 1}:`, error);
        return null;
      }
    })
    .filter((transaction): transaction is Transaction => transaction !== null);
  
  return transactions;
}

/**
 * Parse uploaded data to FishStock format for Pemancingan
 */
export function parseToFishStock(data: any[], fishType: 'lele' | 'nila'): FishStock[] {
  const stocks = data
    .map((row, index) => {
      try {
        const date = row.tanggal || row.date || row.Tanggal || row.Date;
        const type = (row.tipe || row.type || row.Tipe || row.Type || '').toLowerCase();
        const quantity = parseFloat(row.berat_kg || row.quantity || row.Berat || row.Quantity || '0');
        const weight = parseFloat(row.berat_per_ekor || row.weight || row.Weight || '0');
        const totalFish = parseInt(row.jumlah_ikan || row.total_fish || row.Jumlah || row.TotalFish || '0');
        const pricePerKg = parseFloat(row.harga_per_kg || row.price || row.Harga || row.Price || '0');
        const total = parseFloat(row.total || row.Total || '0') || (quantity * pricePerKg);
        const reason = row.keterangan || row.reason || row.Keterangan || row.Reason || '';
        const supplier = row.supplier || row.Supplier || row.pemasok || row.Pemasok || '';
        const reference = row.referensi || row.reference || row.Referensi || row.Reference || '';

        if (!date) {
          console.warn(`Row ${index + 1}: Missing required field (tanggal)`);
          return null;
        }

        if (!['in', 'out', 'masuk', 'keluar'].includes(type)) {
          console.warn(`Row ${index + 1}: Invalid type (must be: in/out/masuk/keluar)`);
          return null;
        }

        // Parse date
        let parsedDate: Date;
        if (typeof date === 'number') {
          parsedDate = excelDateToJSDate(date);
        } else if (typeof date === 'string') {
          parsedDate = new Date(date);
        } else {
          parsedDate = new Date();
        }

        if (isNaN(parsedDate.getTime())) {
          console.warn(`Row ${index + 1}: Invalid date format`);
          return null;
        }

        // Normalize type
        const normalizedType = (type === 'masuk' ? 'in' : type === 'keluar' ? 'out' : type) as 'in' | 'out';

        const fishStock: FishStock = {
          id: `import-${Date.now()}-${index}`,
          date: parsedDate,
          fishType,
          type: normalizedType,
          quantity: isNaN(quantity) ? 0 : quantity,
          weight: isNaN(weight) ? undefined : weight,
          totalFish: isNaN(totalFish) ? undefined : totalFish,
          price: isNaN(pricePerKg) ? undefined : pricePerKg,
          total: isNaN(total) ? undefined : total,
          reason: String(reason).trim(),
          supplier: String(supplier).trim() || undefined,
          reference: String(reference).trim() || undefined,
        };
        
        return fishStock;
      } catch (error) {
        console.error(`Error parsing row ${index + 1}:`, error);
        return null;
      }
    })
    .filter((stock): stock is FishStock => stock !== null);
  
  return stocks;
}

/**
 * Convert Excel date serial number to JavaScript Date
 * Excel stores dates as serial numbers (days since 1900-01-01)
 */
function excelDateToJSDate(serial: number): Date {
  const utcDays = Math.floor(serial - 25569);
  const utcValue = utcDays * 86400;
  const dateInfo = new Date(utcValue * 1000);
  return new Date(dateInfo.getFullYear(), dateInfo.getMonth(), dateInfo.getDate());
}

/**
 * Validate Transaction data
 */
export function validateTransactions(transactions: Transaction[]): {
  valid: Transaction[];
  invalid: { row: number; reason: string }[];
} {
  const valid: Transaction[] = [];
  const invalid: { row: number; reason: string }[] = [];

  transactions.forEach((transaction, index) => {
    const errors: string[] = [];

    if (!transaction.date) errors.push('Tanggal kosong');
    if (!transaction.productName) errors.push('Produk kosong');
    if (transaction.quantity <= 0) errors.push('Jumlah harus > 0');
    if (transaction.price <= 0) errors.push('Harga harus > 0');
    if (transaction.total <= 0) errors.push('Total harus > 0');

    if (errors.length > 0) {
      invalid.push({ row: index + 1, reason: errors.join(', ') });
    } else {
      valid.push(transaction);
    }
  });

  return { valid, invalid };
}

/**
 * Validate FishStock data
 */
export function validateFishStock(stocks: FishStock[]): {
  valid: FishStock[];
  invalid: { row: number; reason: string }[];
} {
  const valid: FishStock[] = [];
  const invalid: { row: number; reason: string }[] = [];

  stocks.forEach((stock, index) => {
    const errors: string[] = [];

    if (!stock.date) errors.push('Tanggal kosong');
    if (!['in', 'out'].includes(stock.type)) errors.push('Tipe harus in/out');
    if (stock.quantity <= 0) errors.push('Berat (kg) harus > 0');
    if (stock.price && stock.price <= 0) errors.push('Harga per kg harus > 0');

    if (errors.length > 0) {
      invalid.push({ row: index + 1, reason: errors.join(', ') });
    } else {
      valid.push(stock);
    }
  });

  return { valid, invalid };
}

/**
 * Generate template data for Warung transactions
 */
export function getWarungTemplate(): any[] {
  return [
    {
      tanggal: '2025-01-15',
      produk: 'Mie Instan',
      kategori: 'Makanan',
      jumlah: 10,
      harga: 3000,
      total: 30000,
    },
    {
      tanggal: '2025-01-15',
      produk: 'Kopi',
      kategori: 'Minuman',
      jumlah: 5,
      harga: 4000,
      total: 20000,
    },
  ];
}

/**
 * Generate template data for Pemancingan
 */
export function getPemancingTemplate(): any[] {
  return [
    {
      tanggal: '2025-01-15',
      tipe: 'in',
      berat_kg: 50,
      berat_per_ekor: 120,
      jumlah_ikan: 416,
      harga_per_kg: 25000,
      total: 1250000,
      keterangan: 'Pembelian bibit',
      supplier: 'CV Mina Jaya',
      referensi: 'INV-001',
    },
    {
      tanggal: '2025-01-20',
      tipe: 'out',
      berat_kg: 20,
      berat_per_ekor: 150,
      jumlah_ikan: 133,
      harga_per_kg: 35000,
      total: 700000,
      keterangan: 'Penjualan',
      supplier: '',
      referensi: 'SO-001',
    },
  ];
}
