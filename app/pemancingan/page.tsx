'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { mockLeleStock, mockNilaStock } from '@/lib/mockData';
import { formatCurrency } from '@/lib/reportUtils';

export default function PemancingPage() {
  const leleStats = useMemo(() => {
    const totalIn = mockLeleStock
      .filter((s) => s.type === 'in')
      .reduce((sum, s) => sum + s.quantity, 0);
    const totalOut = mockLeleStock
      .filter((s) => s.type === 'out')
      .reduce((sum, s) => sum + s.quantity, 0);
    const currentStock = totalIn - totalOut;
    const revenue = mockLeleStock
      .filter((s) => s.type === 'out')
      .reduce((sum, s) => sum + (s.total || 0), 0);
    const purchase = mockLeleStock
      .filter((s) => s.type === 'in')
      .reduce((sum, s) => sum + (s.total || 0), 0);
    
    return { totalIn, totalOut, currentStock, revenue, purchase, profit: revenue - purchase };
  }, []);

  const nilaStats = useMemo(() => {
    const totalIn = mockNilaStock
      .filter((s) => s.type === 'in')
      .reduce((sum, s) => sum + s.quantity, 0);
    const totalOut = mockNilaStock
      .filter((s) => s.type === 'out')
      .reduce((sum, s) => sum + s.quantity, 0);
    const currentStock = totalIn - totalOut;
    const revenue = mockNilaStock
      .filter((s) => s.type === 'out')
      .reduce((sum, s) => sum + (s.total || 0), 0);
    const purchase = mockNilaStock
      .filter((s) => s.type === 'in')
      .reduce((sum, s) => sum + (s.total || 0), 0);
    
    return { totalIn, totalOut, currentStock, revenue, purchase, profit: revenue - purchase };
  }, []);

  const totalProfit = leleStats.profit + nilaStats.profit;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-linear-to-r from-cyan-600 to-blue-600 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Dashboard Pemancingan</h1>
          <p className="text-lg opacity-90">
            Sistem monitoring stok ikan lele dan nila
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">Total Stok Lele</p>
                <p className="text-2xl font-bold text-gray-900">
                  {leleStats.currentStock} kg
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              Keuntungan: {formatCurrency(leleStats.profit)}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">Total Stok Nila</p>
                <p className="text-2xl font-bold text-gray-900">
                  {nilaStats.currentStock} kg
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              Keuntungan: {formatCurrency(nilaStats.profit)}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">Total Keuntungan</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalProfit)}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              Dari semua jenis ikan
            </p>
          </div>
        </div>

        {/* Menu Grid */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Menu Stok Ikan</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Stok Lele Card */}
          <Link
            href="/pemancingan/lele"
            className="group bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            <div className="bg-linear-to-r from-green-500 to-green-700 p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <svg
                  className="w-6 h-6 transform group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-2">Stok Lele</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Stok Saat Ini</p>
                  <p className="text-xl font-bold text-gray-900">{leleStats.currentStock} kg</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Keuntungan</p>
                  <p className="text-xl font-bold text-green-600">{formatCurrency(leleStats.profit)}</p>
                </div>
              </div>
              <p className="text-gray-600">
                Monitoring stok masuk, keluar, dan keuntungan penjualan ikan lele
              </p>
            </div>
          </Link>

          {/* Stok Nila Card */}
          <Link
            href="/pemancingan/nila"
            className="group bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            <div className="bg-linear-to-r from-blue-500 to-blue-700 p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <svg
                  className="w-6 h-6 transform group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-2">Stok Nila</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Stok Saat Ini</p>
                  <p className="text-xl font-bold text-gray-900">{nilaStats.currentStock} kg</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Keuntungan</p>
                  <p className="text-xl font-bold text-green-600">{formatCurrency(nilaStats.profit)}</p>
                </div>
              </div>
              <p className="text-gray-600">
                Monitoring stok masuk, keluar, dan keuntungan penjualan ikan nila
              </p>
            </div>
          </Link>
        </div>

        {/* Features */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Fitur Sistem Pemancingan
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Tracking Stok Masuk</h3>
                <p className="text-gray-600">
                  Catat pembelian ikan dengan detail berat, jumlah ekor, harga, dan supplier
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-red-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Tracking Stok Keluar</h3>
                <p className="text-gray-600">
                  Monitor penjualan ikan dengan harga jual dan keuntungan otomatis
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Laporan & Analisis</h3>
                <p className="text-gray-600">
                  Lihat stok real-time, keuntungan, dan export data ke PDF/Excel
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Filter Tanggal</h3>
                <p className="text-gray-600">
                  Filter data berdasarkan periode waktu dengan quick filters
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
