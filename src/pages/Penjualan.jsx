import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

export default function Penjualan() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [todaySales, setTodaySales] = useState([])
  const [form, setForm] = useState({ itemId: '', quantity: '' })
  const [selectedItem, setSelectedItem] = useState(null)
  const [stockStatus, setStockStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('isLogin')) navigate('/login')
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [itemsRes, salesRes] = await Promise.all([
        api.get('/items'),
        api.get('/sales')
      ])
      setItems(itemsRes.data)
      const today = new Date().toISOString().split('T')[0]
      setTodaySales(salesRes.data.filter(s => s.sale_date === today))
    } catch (err) {
      console.error('Gagal fetch:', err)
    }
  }

  const handleItemChange = (itemId) => {
    const found = items.find(i => i.id === itemId)
    setSelectedItem(found || null)
    setStockStatus(null)
    setForm({ ...form, itemId })
  }

  const handleCekStok = () => {
    if (!form.itemId || !form.quantity) return alert('Pilih barang dan isi jumlah dulu!')
    setStockStatus(parseInt(form.quantity) <= selectedItem.stock_level ? 'cukup' : 'kurang')
  }

  const handleSimpan = async () => {
    if (!form.itemId || !form.quantity) return alert('Pilih barang dan isi jumlah dulu!')
    const qty = parseInt(form.quantity)
    if (qty > selectedItem.stock_level) {
      setStockStatus('kurang')
      return
    }
    setLoading(true)
    try {
      const today = new Date().toISOString().split('T')[0]
      await api.post('/sales', {
        item_id: form.itemId,
        quantity: qty,
        sale_date: today,
        stock_before: selectedItem.stock_level,
        stock_after: selectedItem.stock_level - qty
      })
      setStockStatus('cukup')
      await fetchData()
      setForm({ itemId: '', quantity: '' })
      setSelectedItem(null)
      setTimeout(() => setStockStatus(null), 3000)
    } catch (err) {
      alert('Gagal menyimpan transaksi!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f8f6f6] font-sans">

      {/* Header */}
      <header className="flex items-center justify-between bg-[#1F3864] px-10 py-4 shadow-md">
        <div className="flex items-center gap-4 text-white">
          <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-white/10">
            <img src="/logo.png" className="h-8 w-8 object-contain" alt="Logo" />
          </div>
          <h2 className="text-xl font-bold">Penjualan & Keluar Barang</h2>
        </div>
        <button onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors text-sm font-medium">
          <span className="material-symbols-outlined text-xl">arrow_back</span>
          Kembali
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center py-8 px-4 sm:px-10">
        <div className="w-full max-w-[960px] flex flex-col gap-6">

          {/* Hero */}
          <div className="flex flex-col md:flex-row rounded-xl shadow-sm bg-white border border-slate-200 overflow-hidden">
            <div className="w-full md:w-1/3 bg-[#1F3864]/10 flex items-center justify-center p-8">
              <span className="material-symbols-outlined text-[80px] text-[#1F3864]">shopping_cart</span>
            </div>
            <div className="flex flex-col justify-center gap-1 py-6 px-6">
              <h3 className="text-slate-900 text-2xl font-bold">Form Penjualan Barang</h3>
              <p className="text-slate-500 text-base">Silahkan isi detail penjualan untuk memperbarui inventaris.</p>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Pilih Barang */}
                <div className="flex flex-col gap-2">
                  <label className="text-slate-700 text-sm font-semibold">Pilih Barang</label>
                  <div className="relative">
                    <select value={form.itemId} onChange={e => handleItemChange(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 h-12 px-4 focus:ring-2 focus:ring-[#1F3864] outline-none appearance-none bg-white">
                      <option value="">Cari sparepart...</option>
                      {items.map(i => (
                        <option key={i.id} value={i.id}>{i.item_name} — Stok: {i.stock_level}</option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
                  </div>
                </div>

                {/* Kategori */}
                <div className="flex flex-col gap-2">
                  <label className="text-slate-700 text-sm font-semibold">Kategori</label>
                  <input value={selectedItem ? selectedItem.category : ''} readOnly
                    placeholder="Otomatis terisi"
                    className="w-full rounded-xl border border-slate-200 h-12 px-4 bg-slate-50 text-slate-500 outline-none" />
                </div>

                {/* Info stok */}
                {selectedItem && (
                  <div className="md:col-span-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                    Stok saat ini: <b>{selectedItem.stock_level} unit</b> | Kategori: {selectedItem.category}
                  </div>
                )}

                {/* Jumlah + Cek Stok */}
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-slate-700 text-sm font-semibold">Jumlah yang Dijual</label>
                  <div className="flex gap-3">
                    <input type="number" min="1" value={form.quantity}
                      onChange={e => { setForm({...form, quantity: e.target.value}); setStockStatus(null) }}
                      className="flex-1 rounded-xl border border-slate-300 h-12 px-4 focus:ring-2 focus:ring-[#1F3864] outline-none"
                      placeholder="0" />
                    <button type="button" onClick={handleCekStok}
                      className="flex items-center justify-center gap-2 px-6 rounded-xl bg-[#1F3864] text-white font-semibold hover:bg-blue-900 transition-all shadow-sm">
                      <span className="material-symbols-outlined">inventory_2</span>
                      Cek Stok
                    </button>
                  </div>
                </div>
              </div>

              {/* Tombol Simpan */}
              <div className="pt-2">
                <button type="button" onClick={handleSimpan} disabled={loading}
                  className="w-full flex items-center justify-center gap-2 h-14 bg-emerald-600 hover:bg-emerald-700 text-white text-lg font-bold rounded-xl transition-all shadow-lg active:scale-[0.98] disabled:opacity-50">
                  <span className="material-symbols-outlined">save</span>
                  {loading ? 'Menyimpan...' : 'Simpan Data Penjualan'}
                </button>
              </div>
            </div>
          </div>

          {/* Alert Stok */}
          {stockStatus === 'cukup' && (
            <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800">
              <span className="material-symbols-outlined">check_circle</span>
              <p className="font-medium">✅ Transaksi berhasil! Stok berkurang otomatis.</p>
            </div>
          )}
          {stockStatus === 'kurang' && (
            <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800">
              <span className="material-symbols-outlined">error</span>
              <p className="font-medium">❌ Stok Tidak Cukup! Tersedia: <b>{selectedItem?.stock_level} unit</b></p>
            </div>
          )}

          {/* Tabel Transaksi Hari Ini */}
          <div className="border-t border-slate-200 pt-6">
            <h4 className="text-slate-900 text-lg font-bold mb-4">Ringkasan Transaksi Hari Ini</h4>
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-4">Item</th>
                    <th className="px-6 py-4">Kategori</th>
                    <th className="px-6 py-4">Jumlah</th>
                    <th className="px-6 py-4">Stok Sebelum</th>
                    <th className="px-6 py-4">Stok Sesudah</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {todaySales.length === 0 ? (
                    <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-400">Belum ada transaksi hari ini</td></tr>
                  ) : (
                    todaySales.map(s => (
                      <tr key={s.id}>
                        <td className="px-6 py-4 font-medium">{s.item_name}</td>
                        <td className="px-6 py-4">{s.category}</td>
                        <td className="px-6 py-4 font-bold text-orange-600">{s.quantity} unit</td>
                        <td className="px-6 py-4">{s.stock_before}</td>
                        <td className="px-6 py-4">{s.stock_after}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>

      <footer className="mt-auto py-6 px-10 border-t border-slate-200 text-center text-slate-500 text-sm">
        © 2026 Inventory System Pro. All rights reserved.
      </footer>
    </div>
  )
}