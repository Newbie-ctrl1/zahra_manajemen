'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatCurrency } from '@/lib/reportUtils';

interface StockInput {
  tanggal: string;
  produk: string;
  tipe: 'in' | 'out';
  qty: number;
  harga: number;
  total: number;
}

export default function InputStokPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<StockInput>({
    tanggal: new Date().toISOString().split('T')[0],
    produk: '',
    tipe: 'in',
    qty: 0,
    harga: 0,
    total: 0,
  });

  // Auto-calculate total when qty or harga changes
  useEffect(() => {
    const calculatedTotal = formData.qty * formData.harga;
    setFormData(prev => ({ ...prev, total: calculatedTotal }));
  }, [formData.qty, formData.harga]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'qty' || name === 'harga' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!formData.produk || formData.qty <= 0 || formData.harga <= 0) {
      alert('Mohon lengkapi semua field dengan benar');
      return;
    }

    // Get existing data from localStorage
    const stored = localStorage.getItem('imported_stock_movements');
    const existingData = stored ? JSON.parse(stored) : [];

    // Create new stock movement
    const newMovement = {
      id: `STK-${Date.now()}`,
      date: new Date(formData.tanggal),
      productName: formData.produk,
      type: formData.tipe,
      quantity: formData.qty,
      price: formData.harga,
      total: formData.total,
      category: 'Manual Input',
    };

    // Add to existing data
    const updatedData = [...existingData, newMovement];

    // Save to localStorage
    localStorage.setItem('imported_stock_movements', JSON.stringify(updatedData));

    // Show success message
    alert('Data stok berhasil ditambahkan!');

    // Reset form
    setFormData({
      tanggal: new Date().toISOString().split('T')[0],
      produk: '',
      tipe: 'in',
      qty: 0,
      harga: 0,
      total: 0,
    });

    // Redirect to stock page
    setTimeout(() => {
      router.push('/laporan/stok');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Input Stok Manual</h1>
          <Link
            href="/laporan/stok"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tanggal */}
            <div>
              <label htmlFor="tanggal" className="block text-sm font-semibold text-gray-700 mb-2">
                Tanggal <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="tanggal"
                name="tanggal"
                value={formData.tanggal}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                required
              />
            </div>

            {/* Produk */}
            <div>
              <label htmlFor="produk" className="block text-sm font-semibold text-gray-700 mb-2">
                Nama Produk <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="produk"
                name="produk"
                value={formData.produk}
                onChange={handleInputChange}
                placeholder="Contoh: Mie Instan"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                required
              />
            </div>

            {/* Tipe Stok */}
            <div>
              <label htmlFor="tipe" className="block text-sm font-semibold text-gray-700 mb-2">
                Tipe Transaksi <span className="text-red-500">*</span>
              </label>
              <select
                id="tipe"
                name="tipe"
                value={formData.tipe}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                required
              >
                <option value="in">Stok Masuk</option>
                <option value="out">Stok Keluar</option>
              </select>
            </div>

            {/* Qty */}
            <div>
              <label htmlFor="qty" className="block text-sm font-semibold text-gray-700 mb-2">
                Jumlah (Qty) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="qty"
                name="qty"
                value={formData.qty || ''}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                step="1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                required
              />
            </div>

            {/* Harga */}
            <div>
              <label htmlFor="harga" className="block text-sm font-semibold text-gray-700 mb-2">
                Harga Satuan <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="harga"
                name="harga"
                value={formData.harga || ''}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                required
              />
            </div>

            {/* Total (Auto-calculated) */}
            <div>
              <label htmlFor="total" className="block text-sm font-semibold text-gray-700 mb-2">
                Total Harga
              </label>
              <div className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 font-semibold text-lg">
                {formatCurrency(formData.total)}
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Otomatis dihitung: Qty × Harga
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-lg flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Simpan Data Stok
              </button>
              <Link
                href="/laporan/stok"
                className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold text-lg"
              >
                Batal
              </Link>
            </div>
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-2">ℹ️ Informasi</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Data yang diinput akan tersimpan di laporan stok keluar masuk</li>
            <li>• Pilih <strong>Stok Masuk</strong> untuk penambahan stok atau <strong>Stok Keluar</strong> untuk pengurangan stok</li>
            <li>• Total harga akan dihitung otomatis (Qty × Harga)</li>
            <li>• Semua field bertanda <span className="text-red-500">*</span> wajib diisi</li>
            <li>• Data tersimpan secara lokal di browser Anda</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
