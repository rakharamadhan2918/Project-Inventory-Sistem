import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

const TIPE_KOREKSI = [
  { value: 'rusak', label: 'Rusak', color: 'text-red-600', bg: 'bg-red-50 border-red-200', icon: 'broken_image' },
  { value: 'hilang', label: 'Hilang', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200', icon: 'search_off' },
  { value: 'koreksi', label: 'Koreksi Manual', color: 'text-gray-600', bg: 'bg-gray-50 border-gray-200', icon: 'tune' },
]

export default function KoreksiStok() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [riwayat, setRiwayat] = useState([])
  const [form, setForm] = useState({ itemId: '', tipe: '', quantity: '', note: '' })
  const [selectedItem, setSelectedItem] = useState(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('isLogin')) navigate('/login')
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [itemsRes, riwayatRes] = await Promise.all([
        api.get('/items'),
        api.get('/adjustments')
      ])
      setItems(itemsRes.data)
      setRiwayat(riwayatRes.data)
    } catch (err) {
      console.error('Gagal fetch:', err)
    }
  }

  const handleItemChange = (itemId) => {
    const found = items.find(i => i.id === itemId)
    setSelectedItem(found || null)
    setForm({ ...form, itemId, quantity: '' })
  }

  const handleSimpan = () => {
    if (!form.itemId || !form.tipe || !form.quantity || !form.note)
      return alert('Semua field wajib diisi!')
    if (form.note.length < 10)
      return alert('Alasan minimal 10 karakter!')
    if (parseInt(form.quantity) > selectedItem.stock_level)
      return alert('Jumlah koreksi tidak boleh melebihi stok saat ini!')
    setShowConfirm(true)
  }

  const handleKonfirmasi = async () => {
    setLoading(true)
    try {
      await api.post('/adjustments', {
        item_id: form.itemId,
        type: form.tipe,
        quantity: parseInt(form.quantity),
        note: form.note
      })
      await fetchData()
      setShowConfirm(false)
      setSuccess(true)
      setForm({ itemId: '', tipe: '', quantity: '', note: '' })
      setSelectedItem(null)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      alert('Gagal menyimpan koreksi!')
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
              <h1 className="text-xl font-bold">Koreksi Stok</h1>
              <p className="text-xs text-blue-100/70">Penyesuaian Data Inventaris</p>
            </div>
          </div>
          <button onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 hover:bg-white/10 px-3 py-2 rounded-lg transition-colors text-sm">
            <span className="material-symbols-outlined">arrow_back</span>
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
          <span className="text-sm font-medium text-[#1F3864]">Koreksi Stok</span>
        </div>

        {/* Warning Banner */}
        <div className="mb-6 p-4 bg-orange-50 border border-orange-300 rounded-xl flex items-start gap-3">
          <span className="material-symbols-outlined text-orange-500 mt-0.5">warning</span>
          <div>
            <p className="font-bold text-orange-800">Perhatian — Fitur Sensitif</p>
            <p className="text-sm text-orange-700">Setiap koreksi stok tersimpan permanen sebagai audit trail dan tidak dapat dihapus.</p>
          </div>
        </div>

        {/* Sukses */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-300 text-green-700 rounded-xl flex items-center gap-3">
            <span className="material-symbols-outlined">check_circle</span>
            <p className="font-medium">Koreksi stok berhasil disimpan! Audit trail tercatat.</p>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
          <div className="p-6 border-b border-orange-100 bg-orange-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500">
                <span className="material-symbols-outlined">tune</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Form Koreksi Stok</h2>
                <p className="text-sm text-slate-500">Catat penyesuaian stok barang rusak, hilang, atau koreksi manual.</p>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-5">

            {/* Pilih Barang */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">Pilih Barang</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">inventory_2</span>
                <select value={form.itemId} onChange={e => handleItemChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none appearance-none">
                  <option value="">-- Pilih Barang --</option>
                  {items.map(i => <option key={i.id} value={i.id}>{i.item_name} (Stok: {i.stock_level})</option>)}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
              </div>
              {selectedItem && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                  Stok saat ini: <b>{selectedItem.stock_level} unit</b> | Kategori: {selectedItem.category}
                </div>
              )}
            </div>

            {/* Tipe Koreksi */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">Tipe Koreksi</label>
              <div className="grid grid-cols-3 gap-3">
                {TIPE_KOREKSI.map(t => (
                  <button key={t.value} type="button"
                    onClick={() => setForm({...form, tipe: t.value})}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${form.tipe === t.value ? `${t.bg} border-current ${t.color} font-bold` : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                    <span className={`material-symbols-outlined block text-2xl mb-1 ${form.tipe === t.value ? t.color : ''}`}>{t.icon}</span>
                    <span className="text-sm">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Jumlah */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">
                Jumlah yang Dikoreksi
                {selectedItem && <span className="text-slate-400 font-normal"> (maks. {selectedItem.stock_level} unit)</span>}
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">numbers</span>
                <input type="number" min="1" max={selectedItem?.stock_level || 999}
                  value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-400 outline-none"
                  placeholder="0" />
              </div>
            </div>

            {/* Alasan */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">
                Alasan / Keterangan <span className="text-red-500">*</span>
              </label>
              <textarea value={form.note} onChange={e => setForm({...form, note: e.target.value})}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-400 outline-none"
                placeholder="Jelaskan alasan koreksi stok (min. 10 karakter)..." rows="3" />
              <p className={`text-xs ${form.note.length >= 10 ? 'text-green-600' : 'text-slate-400'}`}>
                {form.note.length}/10 karakter minimum
              </p>
            </div>

            {/* Tombol */}
            <button onClick={handleSimpan} disabled={loading}
              className="w-full py-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-50">
              <span className="material-symbols-outlined">save</span>
              Simpan Koreksi
            </button>
          </div>
        </div>

        {/* Tabel Riwayat */}
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-orange-500">history</span>
            Riwayat Koreksi Stok (Audit Trail)
          </h3>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#1F3864] text-white">
                <tr>
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3">Barang</th>
                  <th className="px-4 py-3">Tipe</th>
                  <th className="px-4 py-3">Jumlah</th>
                  <th className="px-4 py-3">Alasan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {riwayat.length === 0 ? (
                  <tr><td colSpan="5" className="px-4 py-8 text-center text-slate-400">Belum ada riwayat koreksi</td></tr>
                ) : (
                  riwayat.map(r => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-xs text-slate-500">{new Date(r.created_at).toLocaleString('id-ID')}</td>
                      <td className="px-4 py-3 font-medium">{r.item_name}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                          r.type === 'rusak' ? 'bg-red-100 text-red-700' :
                          r.type === 'hilang' ? 'bg-orange-100 text-orange-700' :
                          'bg-gray-100 text-gray-700'}`}>
                          {r.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-red-600">-{r.quantity} unit</td>
                      <td className="px-4 py-3 text-slate-600 max-w-xs truncate">{r.note}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* Modal Konfirmasi */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm mx-4 text-center">
            <div className="text-5xl mb-3">⚠️</div>
            <h2 className="text-lg font-bold text-slate-800 mb-2">Konfirmasi Koreksi Stok</h2>
            <p className="text-sm text-slate-500 mb-2">
              Kurangi stok <b>{selectedItem?.item_name}</b> sebanyak <b>{form.quantity} unit</b>
            </p>
            <p className="text-xs text-orange-600 font-medium mb-5">
              ⚠️ Tindakan ini tidak dapat dibatalkan!
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)}
                className="flex-1 border border-slate-300 text-slate-700 py-2 rounded-lg text-sm font-medium hover:bg-slate-50">
                Batal
              </button>
              <button onClick={handleKonfirmasi} disabled={loading}
                className="flex-1 bg-orange-500 text-white py-2 rounded-lg text-sm font-bold hover:bg-orange-600 disabled:opacity-50">
                {loading ? 'Menyimpan...' : 'Ya, Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="mt-12 py-6 border-t border-slate-200 text-center text-slate-400 text-sm">
        © 2024 Inventory System v2.1.0 - All Rights Reserved.
      </footer>
    </div>
  )
}