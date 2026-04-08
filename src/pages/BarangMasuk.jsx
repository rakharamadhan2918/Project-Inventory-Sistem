import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

export default function BarangMasuk() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [recentLogs, setRecentLogs] = useState([])
  const [form, setForm] = useState({ itemId: '', quantity: '', date: '', supplier_id: '', note: '' })
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('isLogin')) navigate('/login')
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [itemsRes, suppliersRes, logsRes] = await Promise.all([
        api.get('/items'),
        api.get('/suppliers'),
        api.get('/stock-in')
      ])
      setItems(itemsRes.data)
      setSuppliers(suppliersRes.data)
      setRecentLogs(logsRes.data.slice(0, 3))
    } catch (err) {
      console.error('Gagal fetch data:', err)
    }
  }

  const selectedItem = items.find(i => i.id === form.itemId)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.itemId || !form.quantity || !form.date)
      return alert('Nama barang, jumlah, dan tanggal wajib diisi!')

    setLoading(true)
    try {
      await api.post('/stock-in', {
        item_id: form.itemId,
        supplier_id: form.supplier_id || null,
        quantity: parseInt(form.quantity),
        entry_date: form.date,
        note: form.note
      })
      setSuccess(true)
      setForm({ itemId: '', quantity: '', date: '', supplier_id: '', note: '' })
      await fetchData()
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      alert('Gagal menyimpan data!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#f8f6f6] min-h-screen font-sans">

      {/* Header */}
      <header className="bg-[#1F3864] text-white px-6 py-4 shadow-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/10 p-2 rounded-lg">
              <img src="/logo.png" className="h-8 w-8 object-contain" alt="Logo" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Tambah Barang Masuk</h1>
              <p className="text-xs text-blue-100/70">Manajemen Stok Inventaris</p>
            </div>
          </div>
          <button onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 hover:bg-white/10 px-3 py-2 rounded-lg transition-colors text-sm">
            <span className="material-symbols-outlined text-xl">arrow_back</span>
            Kembali
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 md:p-8">

        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-slate-500">
          <span className="material-symbols-outlined text-sm">home</span>
          <span className="text-sm cursor-pointer hover:text-[#ec5b13]" onClick={() => navigate('/dashboard')}>Dashboard</span>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-sm font-medium text-[#1F3864]">Stok Masuk</span>
        </div>

        {/* Sukses */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-300 text-green-700 rounded-xl flex items-center gap-3 font-medium">
            <span className="material-symbols-outlined">check_circle</span>
            Data barang masuk berhasil disimpan! Stok otomatis diperbarui.
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#ec5b13]/10 rounded-lg text-[#ec5b13]">
                <span className="material-symbols-outlined">add_box</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Formulir Input Barang</h2>
                <p className="text-sm text-slate-500">Pastikan data sesuai dengan surat jalan/invoice.</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Pilih Barang */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700">Nama Barang</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">inventory_2</span>
                  <select value={form.itemId} onChange={e => setForm({...form, itemId: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#ec5b13]/20 focus:border-[#ec5b13] outline-none appearance-none">
                    <option value="">-- Pilih Barang --</option>
                    {items.map(i => <option key={i.id} value={i.id}>{i.item_name} (Stok: {i.stock_level})</option>)}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
                </div>
                {items.length === 0 && (
                  <p className="text-xs text-orange-500">⚠️ Belum ada barang. <span className="underline cursor-pointer" onClick={() => navigate('/kelola-barang')}>Tambah barang dulu</span></p>
                )}
              </div>

              {/* Kategori auto */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700">Kategori</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">category</span>
                  <input value={selectedItem ? selectedItem.category : ''}
                    readOnly className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 outline-none"
                    placeholder="Otomatis terisi" />
                </div>
              </div>

              {/* Jumlah */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700">Jumlah (Qty)</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">numbers</span>
                  <input type="number" min="1" value={form.quantity}
                    onChange={e => setForm({...form, quantity: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#ec5b13]/20 focus:border-[#ec5b13] outline-none"
                    placeholder="0" />
                </div>
              </div>

              {/* Tanggal */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700">Tanggal Masuk</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">calendar_today</span>
                  <input type="date" value={form.date}
                    onChange={e => setForm({...form, date: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#ec5b13]/20 focus:border-[#ec5b13] outline-none" />
                </div>
              </div>

              {/* Supplier */}
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-sm font-semibold text-slate-700">Pemasok (Vendor)</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">store</span>
                  <select value={form.supplier_id} onChange={e => setForm({...form, supplier_id: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#ec5b13]/20 focus:border-[#ec5b13] outline-none appearance-none">
                    <option value="">-- Pilih Supplier --</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.supplier_name}</option>)}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
                </div>
              </div>

              {/* Catatan */}
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-sm font-semibold text-slate-700">Catatan Tambahan (Opsional)</label>
                <textarea value={form.note} onChange={e => setForm({...form, note: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#ec5b13]/20 focus:border-[#ec5b13] outline-none"
                  placeholder="Tambahkan keterangan jika perlu..." rows="3" />
              </div>
            </div>

            {/* Tombol */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-end gap-3">
              <button type="button" onClick={() => navigate('/dashboard')}
                className="px-6 py-3 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors">
                Batal
              </button>
              <button type="submit" disabled={loading}
                className="px-8 py-3 rounded-lg bg-green-500 hover:bg-green-600 text-white font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-50">
                <span className="material-symbols-outlined">save</span>
                {loading ? 'Menyimpan...' : 'Simpan Data'}
              </button>
            </div>
          </form>
        </div>

        {/* Info Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <span className="material-symbols-outlined text-blue-500">info</span>
            <div>
              <h4 className="text-sm font-bold text-blue-900">Validasi Data</h4>
              <p className="text-xs text-blue-700 mt-1">Sistem akan otomatis memperbarui jumlah stok setelah data disimpan.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-[#ec5b13]/5 rounded-xl border border-[#ec5b13]/10">
            <span className="material-symbols-outlined text-[#ec5b13]">history</span>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Baru Saja Diinput</h4>
              {recentLogs.length === 0 ? (
                <p className="text-xs text-slate-500 mt-1">Belum ada riwayat</p>
              ) : (
                <p className="text-xs text-slate-600 mt-1">{recentLogs[0].item_name} ({recentLogs[0].quantity} Unit)</p>
              )}
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="material-symbols-outlined text-slate-500">help_outline</span>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Bantuan</h4>
              <p className="text-xs text-slate-600 mt-1">Barang belum ada? Tambah dulu di menu Kelola Data Barang.</p>
            </div>
          </div>
        </div>

      </main>

      <footer className="mt-12 py-6 px-6 text-center text-slate-400 text-sm border-t border-slate-200">
        © 2026 Inventory System v2.1.0 - All Rights Reserved.
      </footer>
    </div>
  )
}