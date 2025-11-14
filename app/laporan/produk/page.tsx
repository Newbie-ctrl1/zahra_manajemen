'use client';

import { useState, useMemo, useEffect } from 'react';
import DateFilter from '@/components/DateFilter';
import ExportButtons from '@/components/ExportButtons';
import { DateRange, Transaction } from '@/types/report';
import {
  filterTransactionsByDate,
  calculateProductReport,
  formatCurrency,
} from '@/lib/reportUtils';
import Link from 'next/link';

export default function LaporanProdukPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: null,
    endDate: null,
  });

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

  const productReports = useMemo(
    () => calculateProductReport(filteredTransactions),
    [filteredTransactions]
  );

  const exportToPDF = async () => {
    const jsPDF = (await import('jspdf')).default;
    const autoTable = (await import('jspdf-autotable')).default;

    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Laporan Per Produk', 14, 20);

    const tableData = productReports.map((p, index) => [
      (index + 1).toString(),
      p.productName,
      p.category,
      p.totalQuantity.toString(),
      p.transactionCount.toString(),
      formatCurrency(p.totalRevenue),
    ]);

    autoTable(doc, {
      startY: 30,
      head: [['No', 'Produk', 'Kategori', 'Total Qty', 'Transaksi', 'Total Revenue']],
      body: tableData,
    });

    doc.save('laporan-produk.pdf');
  };

  const exportToExcel = async () => {
    const XLSX = await import('xlsx');
    
    const wsData: any[][] = [
      ['Laporan Per Produk'],
      [],
      ['No', 'Produk', 'Kategori', 'Total Qty', 'Jumlah Transaksi', 'Total Revenue'],
    ];

    productReports.forEach((p, index) => {
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
    XLSX.utils.book_append_sheet(wb, ws, 'Laporan Produk');
    XLSX.writeFile(wb, 'laporan-produk.xlsx');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Laporan Per Produk</h1>

        <DateFilter onFilterChange={setDateRange} />

        <ExportButtons onExportPDF={exportToPDF} onExportExcel={exportToExcel} />

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produk
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Qty
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jumlah Transaksi
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Revenue
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rata-rata per Transaksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {productReports.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      Tidak ada data produk
                    </td>
                  </tr>
                ) : (
                  productReports.map((product, index) => (
                    <tr key={product.productId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {product.productName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {product.totalQuantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {product.transactionCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                        {formatCurrency(product.totalRevenue)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                        {formatCurrency(product.totalRevenue / product.transactionCount)}
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
