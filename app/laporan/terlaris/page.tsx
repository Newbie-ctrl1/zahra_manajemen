'use client';

import { useState, useMemo, useEffect } from 'react';
import DateFilter from '@/components/DateFilter';
import ExportButtons from '@/components/ExportButtons';
import { DateRange, Transaction } from '@/types/report';
import {
  filterTransactionsByDate,
  getTopProducts,
  formatCurrency,
} from '@/lib/reportUtils';

export default function LaporanTerlarisPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: null,
    endDate: null,
  });
  const [topLimit, setTopLimit] = useState(10);

  // Load data from localStorage on mount
  useEffect(() => {
    const loadData = () => {
      const stored = localStorage.getItem('imported_transactions');
      if (stored) {
        const parsed = JSON.parse(stored);
        const withDates = parsed.map((item: any) => ({
          ...item,
          date: new Date(item.date),
        }));
        setTransactions(withDates);
      }
    };
    
    loadData();
    window.addEventListener('focus', loadData);
    return () => window.removeEventListener('focus', loadData);
  }, []);

  const filteredTransactions = useMemo(
    () => filterTransactionsByDate(transactions, dateRange),
    [transactions, dateRange]
  );

  const topProducts = useMemo(
    () => getTopProducts(filteredTransactions, topLimit),
    [filteredTransactions, topLimit]
  );

  const exportToPDF = async () => {
    const jsPDF = (await import('jspdf')).default;
    const autoTable = (await import('jspdf-autotable')).default;

    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text(`Top ${topLimit} Produk Terlaris`, 14, 20);

    const tableData = topProducts.map((p, index) => [
      (index + 1).toString(),
      p.productName,
      p.category,
      p.totalQuantity.toString(),
      p.transactionCount.toString(),
      formatCurrency(p.totalRevenue),
    ]);

    autoTable(doc, {
      startY: 30,
      head: [['Rank', 'Produk', 'Kategori', 'Total Qty', 'Transaksi', 'Total Revenue']],
      body: tableData,
    });

    doc.save('laporan-terlaris.pdf');
  };

  const exportToExcel = async () => {
    const XLSX = await import('xlsx');
    
    const wsData: any[][] = [
      [`Top ${topLimit} Produk Terlaris`],
      [],
      ['Rank', 'Produk', 'Kategori', 'Total Qty', 'Jumlah Transaksi', 'Total Revenue'],
    ];

    topProducts.forEach((p, index) => {
      wsData.push([
        index + 1,
        p.productName,
        p.category,
        p.totalQuantity,
        p.transactionCount,
        p.totalRevenue,
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Produk Terlaris');
    XLSX.writeFile(wb, 'laporan-terlaris.xlsx');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Laporan Produk Terlaris</h1>

        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tampilkan Top:
          </label>
          <select
            value={topLimit}
            onChange={(e) => setTopLimit(Number(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={5}>Top 5</option>
            <option value={10}>Top 10</option>
            <option value={20}>Top 20</option>
            <option value={50}>Top 50</option>
          </select>
        </div>

        <DateFilter onFilterChange={setDateRange} />

        <ExportButtons onExportPDF={exportToPDF} onExportExcel={exportToExcel} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {topProducts.slice(0, 3).map((product, index) => (
            <div
              key={product.productId}
              className={`bg-linear-to-br ${
                index === 0
                  ? 'from-yellow-400 to-yellow-600'
                  : index === 1
                  ? 'from-gray-300 to-gray-500'
                  : 'from-orange-400 to-orange-600'
              } text-white p-6 rounded-lg shadow-lg`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-4xl font-bold">#{index + 1}</span>
                <svg
                  className="w-12 h-12"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">{product.productName}</h3>
              <p className="text-sm opacity-90 mb-4">{product.category}</p>
              <div className="space-y-2">
                <p className="text-sm">
                  Total Terjual: <span className="font-bold">{product.totalQuantity} unit</span>
                </p>
                <p className="text-sm">
                  Transaksi: <span className="font-bold">{product.transactionCount}x</span>
                </p>
                <p className="text-lg font-bold">
                  {formatCurrency(product.totalRevenue)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produk
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Terjual
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jumlah Transaksi
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      Tidak ada data produk
                    </td>
                  </tr>
                ) : (
                  topProducts.map((product, index) => (
                    <tr
                      key={product.productId}
                      className={`hover:bg-gray-50 ${
                        index < 3 ? 'bg-yellow-50' : ''
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                            index === 0
                              ? 'bg-yellow-400 text-white'
                              : index === 1
                              ? 'bg-gray-400 text-white'
                              : index === 2
                              ? 'bg-orange-400 text-white'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {index + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {product.productName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {product.totalQuantity} unit
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {product.transactionCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                        {formatCurrency(product.totalRevenue)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
