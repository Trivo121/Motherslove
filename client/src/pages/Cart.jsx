import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.PNG';
import Navbar from '../components/common/Navbar.jsx';

/* ---------- Icons ---------- */
const Icon = ({ children, size = 20, className = '' }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        {children}
    </svg>
);
const ChevronIcon = (props) => <Icon {...props}><path d="M6 9l6 6 6-6" /></Icon>;
const BagIcon = (props) => <Icon {...props}><path d="M6 7h12l1 13H5L6 7z" /><path d="M9 7a3 3 0 016 0" /></Icon>;
const ArrowLeftIcon = (props) => <Icon {...props}><path d="M19 12H5M12 19l-7-7 7-7" /></Icon>;

import { useCart } from '../context/CartContext.jsx';

export default function CartPage() {
    const navigate = useNavigate();
    const { cartItems, updateQuantity, removeFromCart } = useCart();
    
    const subtotal = cartItems.reduce((acc, item) => {
        let priceNum = 0;
        if (typeof item.price === 'string') {
            priceNum = parseInt(item.price.replace(/\D/g, '')) || 0;
        } else {
            priceNum = item.price || 0;
        }
        return acc + (priceNum * item.qty);
    }, 0);
    
    const shipping = subtotal > 999 || subtotal === 0 ? 0 : 99;
    const total = subtotal + shipping;

    return (
        <div className="min-h-screen bg-[#F8F7F5] font-avenir flex flex-col">
            <Navbar cartCount={cartItems.reduce((acc, item) => acc + item.qty, 0)} />
            <div className="flex-1 max-w-6xl mx-auto w-full px-6 py-16">
                <div className="flex items-center justify-between mb-10">
                    <h1 className="font-poppins text-4xl font-light text-[#2D3329]">Your Cart</h1>
                    <button onClick={() => navigate('/shop')} className="flex items-center gap-2 text-sm text-[#A96142] hover:text-[#8f5237] transition-colors">
                        <ArrowLeftIcon size={16} /> Continue Shopping
                    </button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 overflow-x-auto">
                        <table className="w-full text-left font-avenir min-w-[500px]">
                            <thead>
                                <tr className="border-b border-[#2D3329]/10 text-[#737373] text-sm uppercase tracking-widest">
                                    <th className="pb-4 font-normal">Product</th>
                                    <th className="pb-4 font-normal text-center">Quantity</th>
                                    <th className="pb-4 font-normal text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cartItems.map((item, idx) => {
                                    let priceNum = typeof item.price === 'string' ? parseInt(item.price.replace(/\D/g, '')) || 0 : item.price || 0;
                                    return (
                                    <tr key={idx} className="border-b border-[#2D3329]/10">
                                        <td className="py-6 flex items-center gap-4">
                                            <div className="w-20 h-24 bg-white shrink-0 p-1 border border-[#2D3329]/10">
                                                {item.img ? <img src={item.img} alt={item.name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-[#FDF6F3]" />}
                                            </div>
                                            <div>
                                                <p className="text-[#2D3329] text-base">{item.name}</p>
                                                <p className="text-[#737373] text-sm mt-1">Size: {item.size}</p>
                                                <p className="text-[#A96142] text-sm mt-1">₹{priceNum.toLocaleString('en-IN')}</p>
                                                <button onClick={() => removeFromCart(item.id, item.size, item.color)} className="text-[#A96142] text-xs underline mt-2 hover:text-red-600 transition-colors">Remove</button>
                                            </div>
                                        </td>
                                        <td className="py-6 text-center">
                                            <div className="flex items-center justify-center border border-[#2D3329]/25 w-fit mx-auto">
                                                <button onClick={() => updateQuantity(item.id, item.size, item.color, item.qty - 1)} className="w-8 h-8 flex items-center justify-center text-[#2D3329] hover:text-[#A96142] transition-colors">-</button>
                                                <span className="text-[#2D3329] font-avenir w-8 flex items-center justify-center">{item.qty}</span>
                                                <button onClick={() => updateQuantity(item.id, item.size, item.color, item.qty + 1)} className="w-8 h-8 flex items-center justify-center text-[#2D3329] hover:text-[#A96142] transition-colors">+</button>
                                            </div>
                                        </td>
                                        <td className="py-6 text-right text-[#2D3329] text-lg">
                                            ₹{(priceNum * item.qty).toLocaleString('en-IN')}
                                        </td>
                                    </tr>
                                )})}
                            </tbody>
                        </table>
                    </div>
                    <div className="bg-white border border-[#2D3329]/8 p-8 self-start">
                        <h2 className="font-avenir uppercase tracking-widest text-[#2D3329] text-sm mb-6">Order Summary</h2>
                        <div className="flex justify-between text-[#737373] text-sm mb-4">
                            <span>Subtotal</span>
                            <span>₹{subtotal.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-[#737373] text-sm mb-6 border-b border-[#2D3329]/10 pb-6">
                            <span>Shipping</span>
                            <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
                        </div>
                        <div className="flex justify-between text-[#2D3329] text-lg mb-8">
                            <span>Total</span>
                            <span className="font-poppins text-[#A96142]">₹{total.toLocaleString('en-IN')}</span>
                        </div>
                        <button onClick={() => navigate('/checkout')} className="w-full bg-[#A96142] text-white font-avenir py-4 text-sm hover:bg-[#8f5237] transition-colors uppercase tracking-widest disabled:opacity-50" disabled={cartItems.length === 0}>
                            Proceed to Checkout
                        </button>
                    </div>
                </div>
            </div>

            <footer className="bg-[#2D3329] text-white px-6 md:px-10 py-10 mt-auto">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm font-avenir">
                    <span className="tracking-widest">MOTHER'S LOVE</span>
                    <span className="text-white/60">© 2026 Mother's Love. All rights reserved.</span>
                </div>
            </footer>
        </div>
    );
}