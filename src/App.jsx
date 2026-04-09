import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import BarangMasuk from './pages/BarangMasuk'
import Penjualan from './pages/Penjualan'
import KelolaBarang from './pages/KelolaBarang'
import KoreksiStok from './pages/KoreksiStok'
import Laporan from './pages/Laporan'

// Komponen untuk proteksi halaman
function PrivateRoute({ children }) {
  const token = localStorage.getItem('token')
  const isLogin = localStorage.getItem('isLogin')
  if (!token || !isLogin) return <Navigate to="/login" />
  return children
}

function App() {
  const token = localStorage.getItem('token')
  const isLogin = localStorage.getItem('isLogin')

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={token && isLogin ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
        <Route path="/login" element={token && isLogin ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/barang-masuk" element={<PrivateRoute><BarangMasuk /></PrivateRoute>} />
        <Route path="/penjualan" element={<PrivateRoute><Penjualan /></PrivateRoute>} />
        <Route path="/kelola-barang" element={<PrivateRoute><KelolaBarang /></PrivateRoute>} />
        <Route path="/koreksi-stok" element={<PrivateRoute><KoreksiStok /></PrivateRoute>} />
        <Route path="/laporan" element={<PrivateRoute><Laporan /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App