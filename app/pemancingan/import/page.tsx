'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import FileUpload from '@/components/FileUpload';
import { FishStock } from '@/types/report';
import { parseToFishStock, validateFishStock, getPemancingTemplate } from '@/lib/importUtils';
import { ArrowLeft, CheckCircle, AlertCircle, FileSpreadsheet } from 'lucide-react';
import Link from 'next/link';

export default function ImportPemancingPage() {
  const router = useRouter();
  const [fishType, setFishType] = useState<'lele' | 'nila'>('lele');
  const [importedData, setImportedData] = useState<FishStock[]>([]);
  const [validationResult, setValidationResult] = useState<{
    valid: FishStock[];
    invalid: { row: number; reason: string }[];
  } | null>(null);
  const [showValidation, setShowValidation] = useState(false);

  const handleFileUpload = (data: any[]) => {
    try {
      const fishStocks = parseToFishStock(data, fishType);
      const validation = validateFishStock(fishStocks);
      
      setImportedData(fishStocks);
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
    const storageKey = `imported_fish_${fishType}`;
    const existingData = localStorage.getItem(storageKey);
    const existing = existingData ? JSON.parse(existingData) : [];
    const combined = [...existing, ...validationResult.valid];
    localStorage.setItem(storageKey, JSON.stringify(combined));

    alert(`${validationResult.valid.length} data stok ${fishType} berhasil disimpan!`);
    router.push(`/pemancingan/${fishType}`);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-cyan-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/pemancingan"
            className="inline-flex items-center gap-2 text-cyan-600 hover:text-cyan-800 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Kembali ke Dashboard Pemancingan
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Import Data Stok Ikan</h1>
          <p className="text-gray-600">Upload file Excel atau CSV untuk import data stok ikan lele atau nila</p>
        </div>

        {/* Fish Type Selector */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Pilih Jenis Ikan</h3>
          <div className="flex gap-4">
            <button
              onClick={() => setFishType('lele')}
              className={`flex-1 py-4 px-6 rounded-lg font-semibold transition-all ${
                fishType === 'lele'
                  ? 'bg-green-600 text-white shadow-lg scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🐟 Lele (Catfish)
            </button>
            <button
              onClick={() => setFishType('nila')}
              className={`flex-1 py-4 px-6 rounded-lg font-semibold transition-all ${
                fishType === 'nila'
                  ? 'bg-blue-600 text-white shadow-lg scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🐠 Nila (Tilapia)
            </button>
          </div>
        </div>

        {/* File Upload Component */}
        <FileUpload
          onFileUpload={handleFileUpload}
          acceptedFormats={['.xlsx', '.xls', '.csv']}
          title={`Upload File Stok ${fishType.toUpperCase()}`}
          description={`Drag & drop atau pilih file Excel/CSV berisi data stok ikan ${fishType}`}
          templateData={getPemancingTemplate()}
          templateFilename={`template_stok_${fishType}.xlsx`}
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
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Tipe</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Berat (kg)</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Harga/kg</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Total</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Keterangan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {validationResult.valid.slice(0, 10).map((stock, index) => (
                        <tr key={index} className="border-t border-gray-200 hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {new Date(stock.date).toLocaleDateString('id-ID')}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                stock.type === 'in'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {stock.type === 'in' ? 'Masuk' : 'Keluar'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">{stock.quantity}</td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">
                            {stock.price ? `Rp ${stock.price.toLocaleString('id-ID')}` : '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                            {stock.total ? `Rp ${stock.total.toLocaleString('id-ID')}` : '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{stock.reason}</td>
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
                  Simpan {validationResult.valid.length} Data Stok
                </button>
              </div>
            )}
          </div>
        )}

        {/* Format Guide */}
        <div className="mt-8 bg-linear-to-r from-cyan-50 to-blue-50 rounded-xl p-6 border border-cyan-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">📋 Format File Excel/CSV</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold text-gray-900 mb-2">Kolom yang Diperlukan:</p>
              <ul className="space-y-1 text-gray-700">
                <li>• <strong>tanggal</strong> - Format: YYYY-MM-DD atau DD/MM/YYYY</li>
                <li>• <strong>tipe</strong> - in/out atau masuk/keluar</li>
                <li>• <strong>berat_kg</strong> - Berat ikan dalam kilogram (angka)</li>
                <li>• <strong>harga_per_kg</strong> - Harga per kilogram (angka)</li>
                <li>• <strong>keterangan</strong> - Keterangan transaksi</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-2">Kolom Opsional:</p>
              <ul className="space-y-1 text-gray-700">
                <li>• <strong>berat_per_ekor</strong> - Berat per ekor (gram)</li>
                <li>• <strong>jumlah_ikan</strong> - Total jumlah ikan (ekor)</li>
                <li>• <strong>supplier</strong> - Nama supplier/pemasok</li>
                <li>• <strong>referensi</strong> - Nomor referensi/invoice</li>
              </ul>
              <div className="mt-4 p-3 bg-cyan-100 rounded-lg">
                <p className="text-cyan-900 text-xs">
                  💡 <strong>Tip:</strong> Download template untuk format yang benar
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
