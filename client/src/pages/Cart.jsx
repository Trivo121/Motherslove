import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

/* ---------- Icons ---------- */
const Icon = ({ children, size = 20, className = '' }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        {children}
    </svg>
);
const ChevronIcon = (props) => <Icon {...props}><path d="M6 9l6 6 6-6" /></Icon>;
const BagIcon = (props) => <Icon {...props}><path d="M6 7h12l1 13H5L6 7z" /><path d="M9 7a3 3 0 016 0" /></Icon>;
const ArrowLeftIcon = (props) => <Icon {...props}><path d="M19 12H5M12 19l-7-7 7-7" /></Icon>;

/* ---------- Nav ---------- */
function Nav() {
    const [accountOpen, setAccountOpen] = useState(false);
    const navigate = useNavigate();
    const navLinks = ['Home', 'Women', 'Men', 'Shop', 'About'];

    return (
        <>
            <div className="bg-[#FDF6F3] text-center py-2 text-xs md:text-sm font-avenir text-[#2D3329] tracking-wide">
                Free Delivery Over $75&nbsp;&nbsp;|&nbsp;&nbsp;Free Returns
            </div>
            <nav className="grid grid-cols-3 items-center gap-4 px-6 md:px-10 py-5 bg-white sticky top-0 z-40 border-b border-[#2D3329]/5">
                <div className="flex items-center gap-6">
                    <img src={logo} alt="Mother's Love" className="h-9 w-auto object-contain" />
                    <div className="hidden md:flex items-center gap-6 text-[#2D3329] text-sm font-avenir font-light">
                        {navLinks.map((link) => (
                            <a key={link} onClick={(e) => { e.preventDefault(); if (link === 'Shop') navigate('/shop'); }} href="#" className={`cursor-pointer hover:text-[#A96142] transition-colors`}>
                                {link}
                            </a>
                        ))}
                    </div>
                </div>
                <button onClick={() => navigate('/')} className="font-avenir text-xl md:text-2xl font-light tracking-widest text-[#2D3329] text-center hover:text-[#A96142] transition-colors">
                    MOTHER'S LOVE
                </button>
                <div className="flex items-center gap-6 justify-end text-[#2D3329] text-sm font-avenir font-light relative">
                    <button onClick={() => setAccountOpen(!accountOpen)} className="flex items-center gap-1 hover:text-[#A96142] transition-colors">
                        Account<ChevronIcon size={14} className={`transition-transform ${accountOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {accountOpen && (
                        <div className="absolute top-8 right-14 bg-white border border-[#2D3329]/10 shadow-lg py-2 w-40 text-sm z-50">
                            <a href="#" className="block px-4 py-2 hover:bg-[#FDF6F3] hover:text-[#A96142]">Sign In</a>
                            <a href="#" className="block px-4 py-2 hover:bg-[#FDF6F3] hover:text-[#A96142]">My Orders</a>
                        </div>
                    )}
                    <button onClick={() => navigate('/cart')} aria-label="Shopping cart" className="relative text-[#A96142] transition-colors">
                        <BagIcon size={20} />
                        <span className="absolute -top-2 -right-2 bg-[#A96142] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">0</span>
                    </button>
                </div>
            </nav>
        </>
    );
}

export default function CartPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#F8F7F5] font-avenir flex flex-col">
            <Nav />
            <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-16">
                <div className="flex items-center justify-between mb-10">
                    <h1 className="font-poppins text-4xl font-light text-[#2D3329]">Your Cart</h1>
                    <button onClick={() => navigate('/shop')} className="flex items-center gap-2 text-sm text-[#A96142] hover:text-[#8f5237] transition-colors">
                        <ArrowLeftIcon size={16} /> Continue Shopping
                    </button>
                </div>
                
                <div className="bg-white border border-[#2D3329]/8 py-24 flex flex-col items-center gap-4 text-[#737373]">
                    <BagIcon size={48} className="opacity-20 mb-2" />
                    <p className="font-poppins text-xl font-light text-[#2D3329]">Your cart is currently empty</p>
                    <p className="text-sm">Before proceeding to checkout you must add some products to your shopping cart.</p>
                    <button onClick={() => navigate('/shop')} className="mt-4 px-8 py-3 bg-[#A96142] text-white font-avenir text-sm hover:bg-[#8f5237] transition-colors">
                        Return to Shop
                    </button>
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