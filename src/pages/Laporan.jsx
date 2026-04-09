import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

const JENIS_LAPORAN = [
  { value: 'stok', label: 'Laporan Stok', icon: 'inventory_2', color: 'bg-blue-500' },
  { value: 'masuk', label: 'Laporan Masuk', icon: 'move_to_inbox', color: 'bg-green-500' },
  { value: 'keluar', label: 'Laporan Keluar', icon: 'shopping_cart', color: 'bg-orange-500' },
  { value: 'koreksi', label: 'Laporan Koreksi', icon: 'tune', color: 'bg-red-500' },
]

export default function Laporan() {
  const navigate = useNavigate()
  const [aktif, setAktif] = useState('stok')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('isLogin')) navigate('/login')
    loadData('stok')
  }, [])

  const loadData = async (jenis) => {
    setAktif(jenis)
    setLoading(true)
    try {
      let res
      if (jenis === 'stok') res = await api.get('/items')
      else if (jenis === 'masuk') res = await api.get('/stock-in')
      else if (jenis === 'keluar') res = await api.get('/sales')
      else if (jenis === 'koreksi') res = await api.get('/adjustments')
      setData(res.data)
    } catch (err) {
      console.error('Gagal fetch laporan:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCetak = () => window.print()

  const aktifInfo = JENIS_LAPORAN.find(j => j.value === aktif)

  const getHeaders = () => {
    if (aktif === 'stok') return ['No', 'Nama Barang', 'Kategori', 'Stok', 'Supplier']
    if (aktif === 'masuk') return ['No', 'Nama Barang', 'Kategori', 'Jumlah Masuk', 'Supplier', 'Tanggal']
    if (aktif === 'keluar') return ['No', 'Nama Barang', 'Kategori', 'Jumlah Keluar', 'Stok Sebelum', 'Stok Sesudah', 'Tanggal']
    if (aktif === 'koreksi') return ['No', 'Nama Barang', 'Tipe', 'Jumlah', 'Alasan', 'Waktu']
  }

  const renderRows = () => {
    if (loading) return (
      <tr><td colSpan="10" className="px-6 py-12 text-center text-slate-400">
        <span className="material-symbols-outlined animate-spin text-3xl block mb-2">refresh</span>
        Memuat data...
      </td></tr>
    )

    if (data.length === 0) return (
      <tr><td colSpan="10" className="px-6 py-12 text-center text-slate-400">
        <span className="material-symbols-outlined text-5xl block mb-2">description</span>
        Belum ada data untuk laporan ini
      </td></tr>
    )

    if (aktif === 'stok') return data.map((item, i) => (
      <tr key={item.id} className="hover:bg-slate-50 border-b border-slate-100">
        <td className="px-5 py-3 text-slate-400 text-xs">{i + 1}</td>
        <td className="px-5 py-3 font-medium">{item.item_name}</td>
        <td className="px-5 py-3">
          <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">{item.category}</span>
        </td>
        <td className="px-5 py-3">
          <span className={`font-bold text-sm px-2 py-1 rounded-lg ${item.stock_level < 5 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
            {item.stock_level} unit
          </span>
        </td>
        <td className="px-5 py-3 text-slate-500">{item.supplier_name || '-'}</td>
      </tr>
    ))

    if (aktif === 'masuk') return data.map((item, i) => (
      <tr key={item.id} className="hover:bg-slate-50 border-b border-slate-100">
        <td className="px-5 py-3 text-slate-400 text-xs">{i + 1}</td>
        <td className="px-5 py-3 font-medium">{item.item_name}</td>
        <td className="px-5 py-3">
          <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">{item.category}</span>
        </td>
        <td className="px-5 py-3 font-bold text-green-600">+{item.quantity} unit</td>
        <td className="px-5 py-3 text-slate-500">{item.supplier_name || '-'}</td>
        <td className="px-5 py-3 text-slate-500">{item.entry_date?.split('T')[0]}</td>
      </tr>
    ))

    if (aktif === 'keluar') return data.map((item, i) => (
      <tr key={item.id} className="hover:bg-slate-50 border-b border-slate-100">
        <td className="px-5 py-3 text-slate-400 text-xs">{i + 1}</td>
        <td className="px-5 py-3 font-medium">{item.item_name}</td>
        <td className="px-5 py-3">
          <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">{item.category}</span>
        </td>
        <td className="px-5 py-3 font-bold text-orange-600">-{item.quantity} unit</td>
        <td className="px-5 py-3 text-slate-500">{item.stock_before}</td>
        <td className="px-5 py-3 text-slate-500">{item.stock_after}</td>
        <td className="px-5 py-3 text-slate-500">{item.sale_date}</td>
      </tr>
    ))

    if (aktif === 'koreksi') return data.map((item, i) => (
      <tr key={item.id} className="hover:bg-slate-50 border-b border-slate-100">
        <td className="px-5 py-3 text-slate-400 text-xs">{i + 1}</td>
        <td className="px-5 py-3 font-medium">{item.item_name}</td>
        <td className="px-5 py-3">
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${
            item.type === 'rusak' ? 'bg-red-100 text-red-700' :
            item.type === 'hilang' ? 'bg-orange-100 text-orange-700' :
            'bg-gray-100 text-gray-700'}`}>
            {item.type}
          </span>
        </td>
        <td className="px-5 py-3 font-bold text-red-600">-{item.quantity} unit</td>
        <td className="px-5 py-3 text-slate-500 max-w-xs truncate">{item.note}</td>
        <td className="px-5 py-3 text-slate-500 text-xs">{new Date(item.created_at).toLocaleString('id-ID')}</td>
      </tr>
    ))
  }

  return (
    <div className="bg-[#f8f6f6] min-h-screen font-sans">

      {/* Header */}
      <header className="bg-[#1F3864] text-white px-6 py-4 shadow-md sticky top-0 z-50 print:hidden">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/10 p-2 rounded-lg">
              <img src="/logo.png" className="h-8 w-8 object-contain" alt="Logo" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Laporan Inventaris</h1>
              <p className="text-xs text-blue-100/70">Report Center</p>
            </div>
          </div>
          <button onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 hover:bg-white/10 px-3 py-2 rounded-lg transition-colors text-sm">
            <span className="material-symbols-outlined">arrow_back</span>
            Kembali
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 md:p-8">

        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-slate-500 print:hidden">
          <span className="material-symbols-outlined text-sm">home</span>
          <span className="text-sm cursor-pointer hover:text-[#ec5b13]" onClick={() => navigate('/dashboard')}>Dashboard</span>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-sm font-medium text-[#1F3864]">Laporan</span>
        </div>

        {/* Pilih Jenis */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 print:hidden">
          {JENIS_LAPORAN.map(j => (
            <button key={j.value} onClick={() => loadData(j.value)}
              className={`p-4 rounded-xl border-2 text-left transition-all shadow-sm ${aktif === j.value ? 'border-[#1F3864] bg-[#1F3864] text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-[#1F3864]/40'}`}>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${aktif === j.value ? 'bg-white/20' : j.color + '/10'}`}>
                <span className={`material-symbols-outlined ${aktif === j.value ? 'text-white' : j.color.replace('bg-', 'text-')}`}>{j.icon}</span>
              </div>
              <p className="font-bold text-sm">{j.label}</p>
              <p className={`text-xs mt-0.5 ${aktif === j.value ? 'text-blue-200' : 'text-slate-400'}`}>
                {aktif === j.value ? `${data.length} data` : ''}
              </p>
            </button>
          ))}
        </div>

        {/* Tabel */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between print:hidden">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${aktifInfo?.color}/10`}>
                <span className={`material-symbols-outlined ${aktifInfo?.color.replace('bg-', 'text-')}`}>{aktifInfo?.icon}</span>
              </div>
              <div>
                <h2 className="font-bold text-slate-800">{aktifInfo?.label}</h2>
                <p className="text-xs text-slate-500">{data.length} data ditemukan</p>
              </div>
            </div>
            <button onClick={handleCetak}
              className="flex items-center gap-2 bg-[#1F3864] hover:bg-blue-900 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
              <span className="material-symbols-outlined text-sm">print</span>
              Cetak / Print
            </button>
          </div>

          {/* Print Header */}
          <div className="hidden print:block p-6 border-b">
            <div className="flex items-center gap-3 mb-2">
              <img src="/logo.png" className="h-12 w-12 object-contain" alt="Logo" />
              <div>
                <h1 className="text-xl font-bold">Bengkel Jaya Motor Sbahar</h1>
                <p className="text-sm text-slate-500">Sistem Inventory Sparepart Motor</p>
              </div>
            </div>
            <h2 className="text-lg font-bold mt-3">{aktifInfo?.label}</h2>
            <p className="text-sm text-slate-500">Dicetak: {new Date().toLocaleString('id-ID')}</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#1F3864] text-white">
                <tr>
                  {getHeaders().map(h => (
                    <th key={h} className="px-5 py-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>{renderRows()}</tbody>
            </table>
          </div>

          {data.length > 0 && (
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 print:hidden">
              Total: {data.length} data
            </div>
          )}
        </div>

      </main>

      <footer className="mt-12 py-6 border-t border-slate-200 text-center text-slate-400 text-sm print:hidden">
        © 2024 Inventory System v2.1.0 - All Rights Reserved.
      </footer>
    </div>
  )
}