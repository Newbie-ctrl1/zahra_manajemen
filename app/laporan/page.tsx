'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { mockTransactions } from '@/lib/mockData';
import { formatCurrency, getTopProducts } from '@/lib/reportUtils';

export default function LaporanPage() {
  const todayTransactions = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return mockTransactions.filter((t) => {
      const transactionDate = new Date(t.date);
      transactionDate.setHours(0, 0, 0, 0);
      return t.type === 'sale' && transactionDate.getTime() === today.getTime();
    });
  }, []);

  const todaySales = useMemo(
    () => todayTransactions.reduce((sum, t) => sum + t.total, 0),
    [todayTransactions]
  );

  const topProducts = useMemo(() => getTopProducts(mockTransactions, 3), []);

  const menuItems = [
    {
      title: 'Laporan Harian',
      description: 'Lihat total penjualan dan jumlah transaksi per hari',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
      link: '/laporan/harian',
      color: 'from-blue-500 to-blue-700',
    },
    {
      title: 'Laporan Mingguan/Bulanan',
      description: 'Analisis penjualan per minggu atau bulan',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
      link: '/laporan/periode',
      color: 'from-green-500 to-green-700',
    },
    {
      title: 'Laporan Per Produk',
      description: 'Lihat performa penjualan setiap produk',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
      ),
      link: '/laporan/produk',
      color: 'from-purple-500 to-purple-700',
    },
    {
      title: 'Produk Terlaris',
      description: 'Ranking produk berdasarkan penjualan',
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ),
      link: '/laporan/terlaris',
      color: 'from-yellow-500 to-yellow-700',
    },
    {
      title: 'Stok Masuk & Keluar',
      description: 'Monitor pergerakan stok barang',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
          />
        </svg>
      ),
      link: '/laporan/stok',
      color: 'from-red-500 to-red-700',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-linear-to-r from-blue-600 to-purple-600 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Dashboard Laporan Penjualan</h1>
          <p className="text-lg opacity-90">
            Sistem pelaporan lengkap untuk manajemen penjualan dan inventory
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">Penjualan Hari Ini</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(todaySales)}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              {todayTransactions.length} transaksi
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">Total Transaksi</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mockTransactions.filter((t) => t.type === 'sale').length}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
            </div>
            <p className="text-sm text-gray-500">Semua periode</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">Produk Terlaris</p>
                <p className="text-xl font-bold text-gray-900">
                  {topProducts[0]?.productName || 'N/A'}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <svg
                  className="w-8 h-8 text-yellow-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              {topProducts[0]?.totalQuantity || 0} unit terjual
            </p>
          </div>
        </div>

        {/* Menu Grid */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Jenis Laporan</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {menuItems.map((item) => (
            <Link
              key={item.title}
              href={item.link}
              className="group bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              <div className={`bg-linear-to-r ${item.color} p-6 text-white`}>
                <div className="flex items-center justify-between mb-4">
                  {item.icon}
                  <svg
                    className="w-6 h-6 transform group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
              </div>
              <div className="p-6">
                <p className="text-gray-600">{item.description}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Features */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Fitur Lengkap Sistem Laporan
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Filter Tanggal</h3>
                <p className="text-gray-600">
                  Filter laporan berdasarkan rentang tanggal custom atau preset
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Export PDF & Excel</h3>
                <p className="text-gray-600">
                  Download laporan dalam format PDF atau Excel untuk arsip
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Analisis Detail</h3>
                <p className="text-gray-600">
                  Lihat statistik lengkap dan breakdown per produk atau periode
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <svg
                  className="w-6 h-6 text-yellow-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Top Products</h3>
                <p className="text-gray-600">
                  Identifikasi produk terlaris dengan ranking dan visualisasi
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
