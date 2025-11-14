'use client';

import { useState, useMemo } from 'react';
import DateFilter from '@/components/DateFilter';
import ExportButtons from '@/components/ExportButtons';
import { DateRange } from '@/types/report';
import { mockLeleStock } from '@/lib/mockData';
import { formatDate, formatCurrency } from '@/lib/reportUtils';

export default function StokLelePage() {
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: null,
    endDate: null,
  });
  const [filterType, setFilterType] = useState<'all' | 'in' | 'out'>('all');

  const filteredStock = useMemo(() => {
    let filtered = mockLeleStock;

    // Filter by date
    if (dateRange.startDate || dateRange.endDate) {
      filtered = filtered.filter((stock) => {
        const stockDate = new Date(stock.date);
        stockDate.setHours(0, 0, 0, 0);

        if (dateRange.startDate && dateRange.endDate) {
          const start = new Date(dateRange.startDate);
          start.setHours(0, 0, 0, 0);
          const end = new Date(dateRange.endDate);
          end.setHours(23, 59, 59, 999);
          return stockDate >= start && stockDate <= end;
        }

        if (dateRange.startDate) {
          const start = new Date(dateRange.startDate);
          start.setHours(0, 0, 0, 0);
          return stockDate >= start;
        }

        if (dateRange.endDate) {
          const end = new Date(dateRange.endDate);
          end.setHours(23, 59, 59, 999);
          return stockDate <= end;
        }

        return true;
      });
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter((s) => s.type === filterType);
    }

    return filtered;
  }, [dateRange, filterType]);

  const totalIn = useMemo(
    () =>
      filteredStock
        .filter((s) => s.type === 'in')
        .reduce((sum, s) => sum + s.quantity, 0),
    [filteredStock]
  );

  const totalOut = useMemo(
    () =>
      filteredStock
        .filter((s) => s.type === 'out')
        .reduce((sum, s) => sum + s.quantity, 0),
    [filteredStock]
  );

  const currentStock = totalIn - totalOut;

  const totalRevenue = useMemo(
    () =>
      filteredStock
        .filter((s) => s.type === 'out')
        .reduce((sum, s) => sum + (s.total || 0), 0),
    [filteredStock]
  );

  const totalPurchase = useMemo(
    () =>
      filteredStock
        .filter((s) => s.type === 'in')
        .reduce((sum, s) => sum + (s.total || 0), 0),
    [filteredStock]
  );

  const profit = totalRevenue - totalPurchase;

  const exportToPDF = async () => {
    const jsPDF = (await import('jspdf')).default;
    const autoTable = (await import('jspdf-autotable')).default;

    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Laporan Stok Lele', 14, 20);
    
    doc.setFontSize(11);
    doc.text(`Stok Masuk: ${totalIn} kg`, 14, 30);
    doc.text(`Stok Keluar: ${totalOut} kg`, 14, 37);
    doc.text(`Stok Saat Ini: ${currentStock} kg`, 14, 44);
    doc.text(`Total Pembelian: ${formatCurrency(totalPurchase)}`, 14, 51);
    doc.text(`Total Penjualan: ${formatCurrency(totalRevenue)}`, 14, 58);
    doc.text(`Keuntungan: ${formatCurrency(profit)}`, 14, 65);

    const tableData = filteredStock.map((s) => [
      formatDate(s.date),
      s.type === 'in' ? 'Masuk' : 'Keluar',
      `${s.quantity} kg`,
      `${s.totalFish || '-'} ekor`,
      `${s.weight || '-'}g`,
      formatCurrency(s.price || 0),
      formatCurrency(s.total || 0),
      s.reason,
    ]);

    autoTable(doc, {
      startY: 72,
      head: [['Tanggal', 'Tipe', 'Berat', 'Jumlah', 'Berat/ekor', 'Harga/kg', 'Total', 'Keterangan']],
      body: tableData,
      styles: { fontSize: 8 },
    });

    doc.save('stok-lele.pdf');
  };

  const exportToExcel = async () => {
    const XLSX = await import('xlsx');
    
    const wsData: any[][] = [
      ['Laporan Stok Lele'],
      [],
      ['Stok Masuk', `${totalIn} kg`],
      ['Stok Keluar', `${totalOut} kg`],
      ['Stok Saat Ini', `${currentStock} kg`],
      ['Total Pembelian', totalPurchase],
      ['Total Penjualan', totalRevenue],
      ['Keuntungan', profit],
      [],
      ['Tanggal', 'Tipe', 'Berat (kg)', 'Jumlah Ekor', 'Berat per Ekor (g)', 'Harga per kg', 'Total', 'Keterangan', 'Supplier/Referensi'],
    ];

    filteredStock.forEach((s) => {
      wsData.push([
        formatDate(s.date),
        s.type === 'in' ? 'Masuk' : 'Keluar',
        s.quantity,
        s.totalFish || '',
        s.weight || '',
        s.price || 0,
        s.total || 0,
        s.reason,
        s.supplier || s.reference || '',
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Stok Lele');
    XLSX.writeFile(wb, 'stok-lele.xlsx');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Stok Lele</h1>
          <p className="text-gray-600 mt-2">Monitoring stok ikan lele masuk dan keluar</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="flex gap-4">
            <button
              onClick={() => setFilterType('all')}
              className={`px-6 py-3 rounded-md font-medium transition ${
                filterType === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setFilterType('in')}
              className={`px-6 py-3 rounded-md font-medium transition ${
                filterType === 'in'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Stok Masuk
            </button>
            <button
              onClick={() => setFilterType('out')}
              className={`px-6 py-3 rounded-md font-medium transition ${
                filterType === 'out'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Stok Keluar
            </button>
          </div>
        </div>

        <DateFilter onFilterChange={setDateRange} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Stok Masuk</p>
                <p className="text-2xl font-bold text-green-600">{totalIn} kg</p>
              </div>
              <div className="bg-green-600 p-3 rounded-full text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Stok Keluar</p>
                <p className="text-2xl font-bold text-red-600">{totalOut} kg</p>
              </div>
              <div className="bg-red-600 p-3 rounded-full text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Stok Saat Ini</p>
                <p className={`text-2xl font-bold ${currentStock >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {currentStock} kg
                </p>
              </div>
              <div className="bg-blue-600 p-3 rounded-full text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Keuntungan</p>
                <p className={`text-xl font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(profit)}
                </p>
              </div>
              <div className={`${profit >= 0 ? 'bg-green-600' : 'bg-red-600'} p-3 rounded-full text-white`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
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
                    Tipe
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Berat (kg)
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jumlah Ekor
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Berat/Ekor
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Harga/kg
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Keterangan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Supplier/Ref
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStock.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                      Tidak ada data stok lele
                    </td>
                  </tr>
                ) : (
                  filteredStock.map((stock) => (
                    <tr key={stock.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(stock.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                            stock.type === 'in'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {stock.type === 'in' ? 'Masuk' : 'Keluar'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                        {stock.quantity} kg
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {stock.totalFish || '-'} ekor
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                        {stock.weight ? `${stock.weight}g` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {formatCurrency(stock.price || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                        {formatCurrency(stock.total || 0)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {stock.reason}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {stock.supplier || stock.reference || '-'}
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
