import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/Home.jsx'
import AuthModal from './pages/Login.jsx'
import AllProductsPage from './pages/Cart.jsx'
import ProductPage from './pages/ProductDetail.jsx'
import AdminLayout from './pages/Admin/Adminlayout.jsx'
import AdminDashboard from './pages/Admin/AdminDashboard.jsx'
import AdminOrders from './pages/Admin/Adminorders.jsx'
import AdminOrderDetails from './pages/Admin/AdminOrderDetails.jsx'
import AdminProducts from './pages/Admin/Products.jsx'
import AdminProductForm from './pages/Admin/ProductForm.jsx'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/cart" element={<AllProductsPage />} />
        <Route path="/product/:id" element={<ProductPage />} />
        
        {/* Admin Routes (No auth protection yet for previewing purposes) */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="orders/:orderId" element={<AdminOrderDetails />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/new" element={<AdminProductForm />} />
          <Route path="products/:productId/edit" element={<AdminProductForm />} />
        </Route>
      </Routes>
      <AuthModal />
    </>
  )
}

export default App
