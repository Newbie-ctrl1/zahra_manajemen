'use client';

import { useState, useMemo } from 'react';
import DateFilter from '@/components/DateFilter';
import ExportButtons from '@/components/ExportButtons';
import { DateRange } from '@/types/report';
import { mockStockMovements } from '@/lib/mockData';
import { formatDate } from '@/lib/reportUtils';

export default function LaporanStokPage() {
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: null,
    endDate: null,
  });
  const [filterType, setFilterType] = useState<'all' | 'in' | 'out'>('all');

  const filteredMovements = useMemo(() => {
    let filtered = mockStockMovements;

    // Filter by date
    if (dateRange.startDate || dateRange.endDate) {
      filtered = filtered.filter((movement) => {
        const movementDate = new Date(movement.date);
        movementDate.setHours(0, 0, 0, 0);

        if (dateRange.startDate && dateRange.endDate) {
          const start = new Date(dateRange.startDate);
          start.setHours(0, 0, 0, 0);
          const end = new Date(dateRange.endDate);
          end.setHours(23, 59, 59, 999);
          return movementDate >= start && movementDate <= end;
        }

        if (dateRange.startDate) {
          const start = new Date(dateRange.startDate);
          start.setHours(0, 0, 0, 0);
          return movementDate >= start;
        }

        if (dateRange.endDate) {
          const end = new Date(dateRange.endDate);
          end.setHours(23, 59, 59, 999);
          return movementDate <= end;
        }

        return true;
      });
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter((m) => m.type === filterType);
    }

    return filtered;
  }, [dateRange, filterType]);

  const totalIn = useMemo(
    () =>
      filteredMovements
        .filter((m) => m.type === 'in')
        .reduce((sum, m) => sum + m.quantity, 0),
    [filteredMovements]
  );

  const totalOut = useMemo(
    () =>
      filteredMovements
        .filter((m) => m.type === 'out')
        .reduce((sum, m) => sum + m.quantity, 0),
    [filteredMovements]
  );

  const netChange = totalIn - totalOut;

  const exportToPDF = async () => {
    const jsPDF = (await import('jspdf')).default;
    const autoTable = (await import('jspdf-autotable')).default;

    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Laporan Stok Masuk & Keluar', 14, 20);
    
    doc.setFontSize(11);
    doc.text(`Total Stok Masuk: ${totalIn} unit`, 14, 30);
    doc.text(`Total Stok Keluar: ${totalOut} unit`, 14, 37);
    doc.text(`Net Change: ${netChange} unit`, 14, 44);

    const tableData = filteredMovements.map((m) => [
      formatDate(m.date),
      m.productName,
      m.type === 'in' ? 'Masuk' : 'Keluar',
      m.quantity.toString(),
      m.reason,
      m.reference || '-',
    ]);

    autoTable(doc, {
      startY: 50,
      head: [['Tanggal', 'Produk', 'Tipe', 'Quantity', 'Keterangan', 'Referensi']],
      body: tableData,
    });

    doc.save('laporan-stok.pdf');
  };

  const exportToExcel = async () => {
    const XLSX = await import('xlsx');
    
    const wsData: any[][] = [
      ['Laporan Stok Masuk & Keluar'],
      [],
      ['Total Stok Masuk', `${totalIn} unit`],
      ['Total Stok Keluar', `${totalOut} unit`],
      ['Net Change', `${netChange} unit`],
      [],
      ['Tanggal', 'Produk', 'Tipe', 'Quantity', 'Keterangan', 'Referensi'],
    ];

    filteredMovements.forEach((m) => {
      wsData.push([
        formatDate(m.date),
        m.productName,
        m.type === 'in' ? 'Masuk' : 'Keluar',
        m.quantity,
        m.reason,
        m.reference || '-',
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Laporan Stok');
    XLSX.writeFile(wb, 'laporan-stok.xlsx');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Laporan Stok Masuk & Keluar
        </h1>

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Stok Masuk</p>
                <p className="text-2xl font-bold text-green-600">{totalIn} unit</p>
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
                <p className="text-sm text-gray-600 mb-1">Total Stok Keluar</p>
                <p className="text-2xl font-bold text-red-600">{totalOut} unit</p>
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
                <p className="text-sm text-gray-600 mb-1">Net Change</p>
                <p
                  className={`text-2xl font-bold ${
                    netChange >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {netChange > 0 ? '+' : ''}
                  {netChange} unit
                </p>
              </div>
              <div className={`${netChange >= 0 ? 'bg-green-600' : 'bg-red-600'} p-3 rounded-full text-white`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
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
                    Produk
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipe
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Keterangan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Referensi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMovements.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      Tidak ada data pergerakan stok
                    </td>
                  </tr>
                ) : (
                  filteredMovements.map((movement) => (
                    <tr key={movement.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(movement.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {movement.productName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                            movement.type === 'in'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {movement.type === 'in' ? 'Masuk' : 'Keluar'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {movement.quantity}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {movement.reason}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {movement.reference || '-'}
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
