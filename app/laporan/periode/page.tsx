'use client';

import { useState, useMemo, useEffect } from 'react';
import DateFilter from '@/components/DateFilter';
import ExportButtons from '@/components/ExportButtons';
import StatsCard from '@/components/StatsCard';
import { DateRange, Transaction } from '@/types/report';
import {
  filterTransactionsByDate,
  getWeeklyReport,
  getMonthlyReport,
  formatCurrency,
  formatDate,
} from '@/lib/reportUtils';
import Link from 'next/link';

type ReportType = 'weekly' | 'monthly';

export default function LaporanPeriodePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [reportType, setReportType] = useState<ReportType>('weekly');
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

  const report = useMemo(() => {
    if (reportType === 'weekly') {
      return getWeeklyReport(filteredTransactions);
    }
    return getMonthlyReport(filteredTransactions);
  }, [reportType, filteredTransactions]);

  const exportToPDF = async () => {
    const jsPDF = (await import('jspdf')).default;
    const autoTable = (await import('jspdf-autotable')).default;

    const doc = new jsPDF();
    const title = reportType === 'weekly' ? 'Laporan Mingguan' : 'Laporan Bulanan';
    
    doc.setFontSize(18);
    doc.text(title, 14, 20);
    
    doc.setFontSize(11);
    doc.text(`Total Penjualan: ${formatCurrency(report.totalSales)}`, 14, 30);
    doc.text(`Jumlah Transaksi: ${report.transactionCount}`, 14, 37);
    doc.text(`Rata-rata Transaksi: ${formatCurrency(report.averageTransaction)}`, 14, 44);

    const tableData = report.transactions.map((t) => [
      formatDate(t.date),
      t.id,
      t.productName,
      t.quantity.toString(),
      formatCurrency(t.price),
      formatCurrency(t.total),
    ]);

    autoTable(doc, {
      startY: 50,
      head: [['Tanggal', 'ID Transaksi', 'Produk', 'Qty', 'Harga', 'Total']],
      body: tableData,
    });

    doc.save(`laporan-${reportType}.pdf`);
  };

  const exportToExcel = async () => {
    const XLSX = await import('xlsx');
    const title = reportType === 'weekly' ? 'Laporan Mingguan' : 'Laporan Bulanan';
    
    const wsData = [
      [title],
      [],
      ['Total Penjualan', formatCurrency(report.totalSales)],
      ['Jumlah Transaksi', report.transactionCount],
      ['Rata-rata Transaksi', formatCurrency(report.averageTransaction)],
      [],
      ['Tanggal', 'ID Transaksi', 'Produk', 'Kategori', 'Qty', 'Harga', 'Total'],
    ];

    report.transactions.forEach((t) => {
      wsData.push([
        formatDate(t.date),
        t.id,
        t.productName,
        t.category,
        t.quantity,
        t.price,
        t.total,
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, title);
    XLSX.writeFile(wb, `laporan-${reportType}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Laporan Mingguan & Bulanan
        </h1>

        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="flex gap-4">
            <button
              onClick={() => setReportType('weekly')}
              className={`px-6 py-3 rounded-md font-medium transition ${
                reportType === 'weekly'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Laporan Mingguan (7 Hari)
            </button>
            <button
              onClick={() => setReportType('monthly')}
              className={`px-6 py-3 rounded-md font-medium transition ${
                reportType === 'monthly'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Laporan Bulanan (30 Hari)
            </button>
          </div>
        </div>

        <DateFilter onFilterChange={setDateRange} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <StatsCard
            title="Total Penjualan"
            value={report.totalSales}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            bgColor="bg-green-600"
          />
          <StatsCard
            title="Jumlah Transaksi"
            value={report.transactionCount.toString()}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
            bgColor="bg-blue-600"
          />
          <StatsCard
            title="Rata-rata Transaksi"
            value={report.averageTransaction}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
            bgColor="bg-purple-600"
          />
        </div>

        <ExportButtons onExportPDF={exportToPDF} onExportExcel={exportToExcel} />

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID Transaksi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produk
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Qty
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Harga
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {report.transactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      Tidak ada data transaksi
                    </td>
                  </tr>
                ) : (
                  report.transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(transaction.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.productName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {transaction.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {formatCurrency(transaction.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                        {formatCurrency(transaction.total)}
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
