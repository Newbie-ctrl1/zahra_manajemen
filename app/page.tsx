import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-600 via-purple-600 to-pink-600">
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-5xl w-full">
          <div className="text-center text-white mb-12">
            <h1 className="text-6xl font-bold mb-4">Zahra Management</h1>
            <p className="text-2xl opacity-90">Sistem Manajemen Warung & Pemancingan</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              href="/laporan"
              className="group bg-white rounded-2xl shadow-2xl p-8 hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex items-center justify-between mb-6">
                <svg
                  className="w-16 h-16 text-blue-600"
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
                <svg
                  className="w-8 h-8 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-2 transition-all"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Laporan Warung</h2>
              <p className="text-gray-600 text-lg">
                Laporan penjualan harian, mingguan, bulanan, per produk, dan barang terlaris
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  Export PDF
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                  Export Excel
                </span>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                  Filter Tanggal
                </span>
              </div>
            </Link>

            <Link
              href="/pemancingan"
              className="group bg-white rounded-2xl shadow-2xl p-8 hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex items-center justify-between mb-6">
                <svg
                  className="w-16 h-16 text-cyan-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
                <svg
                  className="w-8 h-8 text-gray-400 group-hover:text-cyan-600 group-hover:translate-x-2 transition-all"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Pemancingan</h2>
              <p className="text-gray-600 text-lg">
                Monitoring stok ikan lele dan nila - tracking masuk, keluar, dan keuntungan
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                  Stok Lele
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  Stok Nila
                </span>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                  Tracking Profit
                </span>
              </div>
            </Link>
          </div>

          <div className="mt-12 text-center">
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6 inline-block">
              <h3 className="text-white text-lg font-semibold mb-3">Fitur Sistem</h3>
              <div className="flex flex-wrap gap-4 justify-center text-white">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Real-time Data</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Responsive Design</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Export Data</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
