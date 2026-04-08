import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

const CATEGORIES = ['Oli & Pelumas', 'Kelistrikan', 'Rem', 'Mesin', 'Body & Frame', 'Filter', 'Transmisi', 'Lainnya']

export default function KelolaBarang() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [form, setForm] = useState({ item_name: '', category: '', stock_level: '', supplier_id: '' })
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('isLogin')) navigate('/login')
    fetchItems()
    fetchSuppliers()
  }, [])

  const fetchItems = async () => {
    try {
      const res = await api.get('/items')
      setItems(res.data)
    } catch (err) {
      console.error('Gagal fetch items:', err)
    }
  }

  const fetchSuppliers = async () => {
    try {
      const res = await api.get('/suppliers')
      setSuppliers(res.data)
    } catch (err) {
      console.error('Gagal fetch suppliers:', err)
    }
  }

  const handleSubmit = async () => {
    if (!form.item_name || !form.category || form.stock_level === '')
      return alert('Semua field wajib diisi!')
    setLoading(true)
    try {
      if (editItem) {
        await api.put(`/items/${editItem.id}`, form)
      } else {
        const id = Date.now().toString().slice(-8).padStart(8, '0')
        await api.post('/items', { ...form, id })
      }
      await fetchItems()
      setShowForm(false)
      setEditItem(null)
      setForm({ item_name: '', category: '', stock_level: '', supplier_id: '' })
    } catch (err) {
      alert('Gagal menyimpan data!')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (item) => {
    setEditItem(item)
    setForm({
      item_name: item.item_name,
      category: item.category,
      stock_level: item.stock_level,
      supplier_id: item.supplier_id || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/items/${id}`)
      await fetchItems()
      setDeleteId(null)
    } catch (err) {
      alert('Gagal menghapus data!')
    }
  }

  const filtered = items.filter(i =>
    i.item_name.toLowerCase().includes(search.toLowerCase()) ||
    i.category.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="bg-[#f8f6f6] min-h-screen font-sans">

      {/* Header */}
      <header className="bg-[#1F3864] text-white px-6 py-4 shadow-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/10 p-2 rounded-lg">
              <img src="/logo.png" className="h-8 w-8 object-contain" alt="Logo" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Kelola Data Barang</h1>
              <p className="text-xs text-blue-100/70">Master Database Inventaris</p>
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
        <div className="mb-6 flex items-center gap-2 text-slate-500">
          <span className="material-symbols-outlined text-sm">home</span>
          <span className="text-sm cursor-pointer hover:text-[#ec5b13]" onClick={() => navigate('/dashboard')}>Dashboard</span>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-sm font-medium text-[#1F3864]">Kelola Data Barang</span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm">
            <div className="bg-blue-100 p-3 rounded-full">
              <span className="material-symbols-outlined text-blue-600">inventory_2</span>
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Jenis Barang</p>
              <p className="text-2xl font-bold text-slate-800">{items.length}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm">
            <div className="bg-green-100 p-3 rounded-full">
              <span className="material-symbols-outlined text-green-600">check_circle</span>
            </div>
            <div>
              <p className="text-sm text-slate-500">Stok Aman</p>
              <p className="text-2xl font-bold text-green-600">{items.filter(i => i.stock_level >= 5).length}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm">
            <div className="bg-red-100 p-3 rounded-full">
              <span className="material-symbols-outlined text-red-600">warning</span>
            </div>
            <div>
              <p className="text-sm text-slate-500">Stok Menipis</p>
              <p className="text-2xl font-bold text-red-600">{items.filter(i => i.stock_level < 5).length}</p>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input type="text" placeholder="Cari nama atau kategori barang..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1F3864]" />
          </div>
          <button onClick={() => { setEditItem(null); setForm({ item_name: '', category: '', stock_level: '', supplier_id: '' }); setShowForm(true) }}
            className="bg-[#1F3864] hover:bg-blue-900 text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm">
            <span className="material-symbols-outlined text-sm">add</span>
            Tambah Barang Baru
          </button>
        </div>

        {/* Tabel */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#1F3864] text-white">
              <tr>
                <th className="px-5 py-4">No</th>
                <th className="px-5 py-4">Nama Barang</th>
                <th className="px-5 py-4">Kategori</th>
                <th className="px-5 py-4">Stok</th>
                <th className="px-5 py-4">Supplier</th>
                <th className="px-5 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-400">
                    <span className="material-symbols-outlined text-5xl block mb-2">inventory_2</span>
                    {search ? 'Barang tidak ditemukan' : 'Belum ada data barang'}
                  </td>
                </tr>
              ) : (
                filtered.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 text-slate-400 text-xs">{String(idx + 1).padStart(3, '0')}</td>
                    <td className="px-5 py-4 font-semibold text-slate-800">{item.item_name}</td>
                    <td className="px-5 py-4">
                      <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">{item.category}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`font-bold text-sm px-2 py-1 rounded-lg ${item.stock_level < 5 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                        {item.stock_level} unit
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-500">{item.supplier_name || '-'}</td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2 justify-center">
                        <button onClick={() => handleEdit(item)}
                          className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded-lg font-medium">
                          <span className="material-symbols-outlined text-sm">edit</span>Edit
                        </button>
                        <button onClick={() => setDeleteId(item.id)}
                          className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1.5 rounded-lg font-medium">
                          <span className="material-symbols-outlined text-sm">delete</span>Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {filtered.length > 0 && (
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-500">
              Menampilkan {filtered.length} dari {items.length} barang
            </div>
          )}
        </div>
      </main>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#1F3864] flex items-center gap-2">
                <span className="material-symbols-outlined">{editItem ? 'edit' : 'add_box'}</span>
                {editItem ? 'Edit Data Barang' : 'Tambah Barang Baru'}
              </h2>
              <button onClick={() => { setShowForm(false); setEditItem(null) }} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1">Nama Barang <span className="text-red-500">*</span></label>
                <input value={form.item_name} onChange={e => setForm({...form, item_name: e.target.value})}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: Oli Shell Helix 1L" />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1">Kategori <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none">
                    <option value="">-- Pilih Kategori --</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-sm">expand_more</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1">Stok <span className="text-red-500">*</span></label>
                <input type="number" min="0" value={form.stock_level} onChange={e => setForm({...form, stock_level: e.target.value})}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0" />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1">Supplier</label>
                <div className="relative">
                  <select value={form.supplier_id} onChange={e => setForm({...form, supplier_id: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none">
                    <option value="">-- Pilih Supplier --</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.supplier_name}</option>)}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-sm">expand_more</span>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 flex gap-3">
              <button onClick={() => { setShowForm(false); setEditItem(null) }}
                className="flex-1 border border-slate-300 text-slate-700 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-50">
                Batal
              </button>
              <button onClick={handleSubmit} disabled={loading}
                className="flex-1 bg-[#1F3864] text-white py-2.5 rounded-lg text-sm font-bold hover:bg-blue-900 disabled:opacity-50">
                {loading ? 'Menyimpan...' : editItem ? 'Simpan Perubahan' : 'Tambah Barang'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Hapus */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm text-center p-6">
            <div className="text-5xl mb-3">🗑️</div>
            <h2 className="text-lg font-bold text-slate-800 mb-2">Hapus Data Barang?</h2>
            <p className="text-sm text-slate-500 mb-5">Data yang dihapus tidak dapat dikembalikan.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 border border-slate-300 text-slate-700 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-50">
                Batal
              </button>
              <button onClick={() => handleDelete(deleteId)}
                className="flex-1 bg-red-600 text-white py-2.5 rounded-lg text-sm font-bold hover:bg-red-700">
                Ya, Hapus
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