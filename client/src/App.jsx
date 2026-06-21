import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/Home.jsx'
import AuthModal from './pages/Login.jsx'
import AllProductsPage from './pages/Cart.jsx'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/cart" element={<AllProductsPage />} />
      </Routes>
      <AuthModal />
    </>
  )
}

export default App
