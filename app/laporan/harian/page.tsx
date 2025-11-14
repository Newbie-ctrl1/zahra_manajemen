'use client';

import { useState, useMemo, useEffect, Fragment } from 'react';
import DateFilter from '@/components/DateFilter';
import ExportButtons from '@/components/ExportButtons';
import StatsCard from '@/components/StatsCard';
import { DateRange, Transaction } from '@/types/report';
import {
  filterTransactionsByDate,
  calculateDailyReport,
  formatCurrency,
  formatDate,
} from '@/lib/reportUtils';
import Link from 'next/link';

export default function LaporanHarianPage() {
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

  const dailyReports = useMemo(
    () => calculateDailyReport(filteredTransactions),
    [filteredTransactions]
  );

  const totalSales = useMemo(
    () => filteredTransactions
      .filter(t => t.type === 'sale')
      .reduce((sum, t) => sum + t.total, 0),
    [filteredTransactions]
  );

  const totalTransactions = useMemo(
    () => filteredTransactions.filter(t => t.type === 'sale').length,
    [filteredTransactions]
  );

  const averageTransaction = totalTransactions > 0 ? totalSales / totalTransactions : 0;

  const exportToPDF = async () => {
    // Dynamic import untuk menghindari error di server-side
    const jsPDF = (await import('jspdf')).default;
    const autoTable = (await import('jspdf-autotable')).default;

    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Laporan Harian Penjualan', 14, 20);
    
    doc.setFontSize(11);
    doc.text(`Total Penjualan: ${formatCurrency(totalSales)}`, 14, 30);
    doc.text(`Jumlah Transaksi: ${totalTransactions}`, 14, 37);
    doc.text(`Rata-rata Transaksi: ${formatCurrency(averageTransaction)}`, 14, 44);

    const tableData = dailyReports.flatMap((daily) =>
      daily.transactions.map((t) => [
        formatDate(t.date),
        t.id,
        t.productName,
        t.quantity.toString(),
        formatCurrency(t.price),
        formatCurrency(t.total),
      ])
    );

    autoTable(doc, {
      startY: 50,
      head: [['Tanggal', 'ID Transaksi', 'Produk', 'Qty', 'Harga', 'Total']],
      body: tableData,
    });

    doc.save('laporan-harian.pdf');
  };

  const exportToExcel = async () => {
    const XLSX = await import('xlsx');
    
    const wsData = [
      ['Laporan Harian Penjualan'],
      [],
      ['Total Penjualan', formatCurrency(totalSales)],
      ['Jumlah Transaksi', totalTransactions],
      ['Rata-rata Transaksi', formatCurrency(averageTransaction)],
      [],
      ['Tanggal', 'ID Transaksi', 'Produk', 'Kategori', 'Qty', 'Harga', 'Total'],
    ];

    dailyReports.forEach((daily) => {
      daily.transactions.forEach((t) => {
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
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Laporan Harian');
    XLSX.writeFile(wb, 'laporan-harian.xlsx');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Laporan Harian</h1>
          <Link
            href="/laporan/import"
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Import Data
          </Link>
        </div>

        {transactions.length === 0 ? (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-12 text-center">
            <svg className="w-20 h-20 text-yellow-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Belum Ada Data Transaksi</h3>
            <p className="text-gray-600 mb-6">Upload file Excel/CSV untuk melihat laporan harian penjualan</p>
            <Link
              href="/laporan/import"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              Upload Data Transaksi
            </Link>
          </div>
        ) : (
          <>
            <DateFilter onFilterChange={setDateRange} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <StatsCard
            title="Total Penjualan"
            value={totalSales}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            bgColor="bg-green-600"
          />
          <StatsCard
            title="Jumlah Transaksi"
            value={totalTransactions.toString()}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
            bgColor="bg-blue-600"
          />
          <StatsCard
            title="Rata-rata Transaksi"
            value={averageTransaction}
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
                {dailyReports.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      Tidak ada data transaksi
                    </td>
                  </tr>
                ) : (
                  dailyReports.map((daily) => (
                    <Fragment key={daily.date}>
                      <tr className="bg-gray-100">
                        <td colSpan={7} className="px-6 py-3 font-semibold">
                          {formatDate(daily.date)} - {daily.transactionCount} transaksi - Total: {formatCurrency(daily.totalSales)}
                        </td>
                      </tr>
                      {daily.transactions.map((transaction) => (
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
                      ))}
                    </Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        </>
        )}
      </div>
    </div>
  );
}
