import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import api from '../api'

export default function Dashboard() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [todaySales, setTodaySales] = useState(0)
  const [lowStockItems, setLowStockItems] = useState([])

  useEffect(() => {
    if (!localStorage.getItem('isLogin')) navigate('/login')
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await api.get('/items')
      const allItems = res.data
      setItems(allItems)
      setLowStockItems(allItems.filter(i => i.stock_level < 5))

      const salesRes = await api.get('/sales')
      const today = new Date().toISOString().split('T')[0]
      setTodaySales(salesRes.data.filter(s => s.sale_date === today).length)
    } catch (err) {
      console.error('Gagal fetch data:', err)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('isLogin')
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    navigate('/login')
  }

  const menus = [
    { label: 'Tambah Barang Masuk', sub: 'Manajemen Logistik', icon: 'move_to_inbox', path: '/barang-masuk' },
    { label: 'Penjualan & Keluar', sub: 'Point of Sales', icon: 'shopping_cart', path: '/penjualan' },
    { label: 'Kelola Data Barang', sub: 'Master Database', icon: 'database', path: '/kelola-barang' },
    { label: 'Koreksi Stok', sub: 'Penyesuaian Data', icon: 'minor_crash', path: '/koreksi-stok', highlight: true },
    { label: 'Lihat Laporan', sub: 'Analitik & Dokumen', icon: 'bar_chart', path: '/laporan' },
  ]

  return (
    <div className="bg-[#f8f6f6] min-h-screen">

      {/* Header */}
      <header className="bg-[#1F3864] text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <img src="/logo.png" alt="Logo" className="h-10 w-10 rounded-lg bg-white p-1 object-contain" />
              <h1 className="text-xl font-bold tracking-tight">Sistem Inventory Bengkel Jaya Motor</h1>
            </div>
            <div className="flex items-center gap-6">
              <div className="hidden md:flex flex-col items-end mr-2">
                <span className="text-xs text-blue-200">Logged in as</span>
                <span className="text-sm font-semibold">Owner</span>
              </div>
              <button onClick={handleLogout}
                className="bg-[#ec5b13] hover:bg-orange-600 text-white px-5 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">logout</span>
                Keluar
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Statistik */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Total Barang</p>
                <p className="text-3xl font-bold mt-1">{items.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                <span className="material-symbols-outlined text-3xl">inventory_2</span>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Transaksi Hari Ini</p>
                <p className="text-3xl font-bold mt-1">{todaySales}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full text-green-600">
                <span className="material-symbols-outlined text-3xl">receipt_long</span>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Barang Hampir Habis</p>
                <p className="text-3xl font-bold mt-1 text-red-600">{lowStockItems.length}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full text-red-600">
                <span className="material-symbols-outlined text-3xl">warning</span>
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-red-500 font-bold">
              Requires immediate action
            </div>
          </div>
        </div>

        {/* Menu */}
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined">grid_view</span>
          Menu Navigasi Utama
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
          {menus.map((menu) => (
            <button key={menu.path} onClick={() => navigate(menu.path)}
              className={`bg-white p-5 rounded-xl border shadow-sm hover:shadow-md transition-all group text-left ${menu.highlight ? 'border-l-4 border-[#ec5b13]/30 hover:border-[#ec5b13]' : 'border-slate-200 hover:border-[#ec5b13]/50'}`}>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-colors ${menu.highlight ? 'bg-[#ec5b13]/10' : 'bg-slate-100 group-hover:bg-[#ec5b13]/10'}`}>
                <span className={`material-symbols-outlined ${menu.highlight ? 'text-[#ec5b13]' : 'text-slate-600 group-hover:text-[#ec5b13]'}`}>{menu.icon}</span>
              </div>
              <h3 className="font-bold text-sm">{menu.label}</h3>
              <p className="text-xs text-slate-500 mt-1">{menu.sub}</p>
            </button>
          ))}
        </div>

        {/* Low Stock Alert */}
        <div className="bg-red-50 border border-red-200 rounded-xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-red-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-red-500 text-white p-2 rounded-lg animate-pulse">
                <span className="material-symbols-outlined">notifications_active</span>
              </div>
              <div>
                <h3 className="font-bold text-red-900">Peringatan Stok Rendah</h3>
                <p className="text-xs text-red-700">Barang dengan ketersediaan di bawah 5 Unit</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-red-200 text-red-800 text-xs font-bold rounded-full">
              {lowStockItems.length} Barang Perlu Reorder
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-red-100/50 text-red-900 text-sm font-semibold">
                <tr>
                  <th className="px-6 py-4">Nama Barang</th>
                  <th className="px-6 py-4">Kategori</th>
                  <th className="px-6 py-4">Sisa Stok</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-100">
                {lowStockItems.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-6 text-center text-green-600 font-medium">
                      ✅ Semua stok aman (di atas 5 unit)
                    </td>
                  </tr>
                ) : (
                  lowStockItems.map((item) => (
                    <tr key={item.id} className="hover:bg-red-100/30 transition-colors">
                      <td className="px-6 py-4 font-medium">{item.item_name}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{item.category}</td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-red-600">{item.stock_level} Units</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${item.stock_level <= 2 ? 'bg-red-200 text-red-800' : 'bg-orange-200 text-orange-800'}`}>
                          {item.stock_level <= 2 ? 'Kritis' : 'Rendah'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => navigate('/barang-masuk')}
                          className="bg-[#ec5b13] text-white text-xs font-bold px-4 py-2 rounded shadow hover:bg-orange-600 transition-colors">
                          Reorder
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-white/50 text-center">
            <button className="text-sm font-bold text-[#ec5b13] hover:underline">
              Lihat Semua Peringatan Stok
            </button>
          </div>
        </div>

      </main>

      <footer className="mt-auto py-6 border-t border-slate-200 text-center text-slate-500 text-sm">
        <p>© 2024 Bengkel Jaya Motor - Professional Inventory Management System</p>
      </footer>
    </div>
  )
}