'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import FileUpload from '@/components/FileUpload';
import { Transaction } from '@/types/report';
import { parseToTransactions, validateTransactions, getWarungTemplate } from '@/lib/importUtils';
import { ArrowLeft, CheckCircle, AlertCircle, FileSpreadsheet } from 'lucide-react';
import Link from 'next/link';

export default function ImportWarungPage() {
  const router = useRouter();
  const [importedData, setImportedData] = useState<Transaction[]>([]);
  const [validationResult, setValidationResult] = useState<{
    valid: Transaction[];
    invalid: { row: number; reason: string }[];
  } | null>(null);
  const [showValidation, setShowValidation] = useState(false);

  const handleFileUpload = (data: any[]) => {
    try {
      const transactions = parseToTransactions(data);
      const validation = validateTransactions(transactions);
      
      setImportedData(transactions);
      setValidationResult(validation);
      setShowValidation(true);
    } catch (error) {
      console.error('Error processing upload:', error);
      alert('Terjadi kesalahan saat memproses file');
    }
  };

  const handleSaveData = () => {
    if (!validationResult || validationResult.valid.length === 0) {
      alert('Tidak ada data valid untuk disimpan');
      return;
    }

    // In a real app, this would save to database
    // For now, we'll just store in localStorage as an example
    const existingData = localStorage.getItem('imported_transactions');
    const existing = existingData ? JSON.parse(existingData) : [];
    const combined = [...existing, ...validationResult.valid];
    localStorage.setItem('imported_transactions', JSON.stringify(combined));

    alert(`${validationResult.valid.length} transaksi berhasil disimpan!`);
    router.push('/laporan');
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/laporan"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Kembali ke Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Import Data Warung</h1>
          <p className="text-gray-600">Upload file Excel atau CSV untuk import transaksi penjualan</p>
        </div>

        {/* File Upload Component */}
        <FileUpload
          onFileUpload={handleFileUpload}
          acceptedFormats={['.xlsx', '.xls', '.csv']}
          title="Upload File Transaksi"
          description="Drag & drop atau pilih file Excel/CSV berisi data transaksi warung"
          templateData={getWarungTemplate()}
          templateFilename="template_transaksi_warung.xlsx"
        />

        {/* Validation Results */}
        {showValidation && validationResult && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
                <div className="flex items-center gap-3 mb-2">
                  <FileSpreadsheet className="w-8 h-8 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Total Data</h3>
                </div>
                <p className="text-3xl font-bold text-blue-600">{importedData.length}</p>
                <p className="text-sm text-gray-600">Baris diproses</p>
              </div>

              <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Data Valid</h3>
                </div>
                <p className="text-3xl font-bold text-green-600">{validationResult.valid.length}</p>
                <p className="text-sm text-gray-600">Siap disimpan</p>
              </div>

              <div className="bg-red-50 rounded-xl p-6 border-2 border-red-200">
                <div className="flex items-center gap-3 mb-2">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Data Error</h3>
                </div>
                <p className="text-3xl font-bold text-red-600">{validationResult.invalid.length}</p>
                <p className="text-sm text-gray-600">Perlu diperbaiki</p>
              </div>
            </div>

            {/* Invalid Data Table */}
            {validationResult.invalid.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-red-600 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-6 h-6" />
                  Data dengan Error ({validationResult.invalid.length})
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-red-50">
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Baris</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Alasan Error</th>
                      </tr>
                    </thead>
                    <tbody>
                      {validationResult.invalid.map((item, index) => (
                        <tr key={index} className="border-t border-gray-200">
                          <td className="px-4 py-3 text-sm text-gray-900">{item.row}</td>
                          <td className="px-4 py-3 text-sm text-red-600">{item.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Valid Data Preview */}
            {validationResult.valid.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-green-600 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-6 h-6" />
                  Preview Data Valid ({validationResult.valid.length})
                </h3>
                <div className="overflow-x-auto mb-6">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-green-50">
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Tanggal</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Produk</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Kategori</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Qty</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Harga</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {validationResult.valid.slice(0, 10).map((transaction, index) => (
                        <tr key={index} className="border-t border-gray-200 hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {new Date(transaction.date).toLocaleDateString('id-ID')}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">{transaction.productName}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{transaction.category}</td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">{transaction.quantity}</td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">
                            Rp {transaction.price.toLocaleString('id-ID')}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                            Rp {transaction.total.toLocaleString('id-ID')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {validationResult.valid.length > 10 && (
                  <p className="text-sm text-gray-600 mb-4">
                    Menampilkan 10 dari {validationResult.valid.length} data valid
                  </p>
                )}

                <button
                  onClick={handleSaveData}
                  className="w-full md:w-auto px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-lg flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-6 h-6" />
                  Simpan {validationResult.valid.length} Transaksi
                </button>
              </div>
            )}
          </div>
        )}

        {/* Format Guide */}
        <div className="mt-8 bg-linear-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">📋 Format File Excel/CSV</h3>
          <div className="space-y-4 text-sm">
            <div>
              <p className="font-semibold text-gray-900 mb-2">Kolom yang Diperlukan:</p>
              <ul className="space-y-1 text-gray-700">
                <li>• <strong>tanggal</strong> - Format: YYYY-MM-DD atau DD/MM/YYYY</li>
                <li>• <strong>produk</strong> - Nama produk</li>
                <li>• <strong>kategori</strong> - Kategori produk</li>
                <li>• <strong>jumlah</strong> - Kuantitas (angka)</li>
                <li>• <strong>harga</strong> - Harga satuan (angka)</li>
                <li>• <strong>total</strong> - Total harga (angka)</li>
              </ul>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <p className="text-blue-900 text-xs">
                💡 <strong>Tip:</strong> Download template untuk format yang benar
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
