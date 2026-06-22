import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import { PRODUCTS } from '../data/products.js';

/* =========================================================================
   Note on the filename: this is the "All Products" catalog/shop page from
   your screenshot (image grid + category filters), not a checkout cart with
   line items. Keeping the name Cart.jsx as requested — just flagging it in
   case you later want a separate page for an actual shopping cart and would
   rather rename this one to Shop.jsx / Products.jsx to avoid confusing the two.
   ========================================================================= */

/* ---------- Icons ---------- */
const Icon = ({ children, size = 20, className = '' }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        {children}
    </svg>
);
const ChevronIcon = (props) => <Icon {...props}><path d="M6 9l6 6 6-6" /></Icon>;
const BagIcon = (props) => <Icon {...props}><path d="M6 7h12l1 13H5L6 7z" /><path d="M9 7a3 3 0 016 0" /></Icon>;
const ChatIcon = (props) => <Icon {...props}><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" /></Icon>;

/* ---------- Nav (same header used across the site) ---------- */
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
                            <a key={link} href="#" className={`hover:text-[#A96142] transition-colors ${link === 'Shop' ? 'text-[#A96142]' : ''}`}>
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
                        Account
                        <ChevronIcon size={14} className={`transition-transform ${accountOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {accountOpen && (
                        <div className="absolute top-8 right-14 bg-white border border-[#2D3329]/10 shadow-lg py-2 w-40 text-sm z-50">
                            <a href="#" className="block px-4 py-2 hover:bg-[#FDF6F3] hover:text-[#A96142]">Sign In</a>
                            <a href="#" className="block px-4 py-2 hover:bg-[#FDF6F3] hover:text-[#A96142]">My Orders</a>
                        </div>
                    )}
                    <button onClick={() => navigate('/cart')} aria-label="Shopping cart" className="relative hover:text-[#A96142] transition-colors">
                        <BagIcon size={20} />
                        <span className="absolute -top-2 -right-2 bg-[#A96142] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">0</span>
                    </button>
                </div>
            </nav>
        </>
    );
}

/* ---------- Filter bar ---------- */
function FilterPill({ label, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-6 py-3 border font-avenir text-sm tracking-wide transition-colors ${active
                ? 'bg-[#A96142] border-[#A96142] text-white'
                : 'bg-white border-[#2D3329]/25 text-[#2D3329] hover:border-[#A96142] hover:text-[#A96142]'
                }`}
        >
            {label}
            <ChevronIcon size={14} />
        </button>
    );
}


function ProductCard({ product }) {
    return (
        <Link to={`/product/${product.id}`} className="group block">
            <div className="relative aspect-[3/4] overflow-hidden bg-[#FDF6F3]">
                {product.badge && (
                    <span className="absolute top-3 left-3 z-10 bg-[#A96142] text-white text-xs font-avenir tracking-wide px-3 py-1">
                        {product.badge}
                    </span>
                )}
                <img
                    src={product.img}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
            </div>
            <h3 className="mt-4 font-avenir text-[#2D3329] text-base">{product.name}</h3>
            <p className="font-avenir text-sm text-[#737373]">{product.color}</p>
            <p className="font-avenir text-[#A96142] mt-1">{product.price}</p>
        </Link>
    );
}

/* ---------- Page ---------- */
export default function AllProductsPage() {
    const [activeFilter, setActiveFilter] = useState('all');

    const filters = [
        { key: 'all', label: 'All Products' },
        { key: 'unique', label: 'Unique' },
        { key: 'formal', label: 'Formal' },
    ];

    const visibleProducts =
        activeFilter === 'all' ? PRODUCTS : PRODUCTS.filter((p) => p.category === activeFilter);

    return (
        <div className="min-h-screen bg-white font-avenir">
            <Nav />

            <header className="px-6 md:px-10 pt-16 pb-10 text-center">
                <h1 className="font-poppins text-5xl md:text-6xl font-light text-[#2D3329]">All Products</h1>
                <div className="w-16 h-px bg-[#2D3329]/30 mx-auto mt-6" />
            </header>

            <div className="flex flex-wrap items-center justify-center gap-3 px-6 md:px-10 pb-12">
                {filters.map((f) => (
                    <FilterPill key={f.key} label={f.label} active={activeFilter === f.key} onClick={() => setActiveFilter(f.key)} />
                ))}
            </div>

            <section className="px-6 md:px-10 pb-24">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-12 max-w-6xl mx-auto">
                    {visibleProducts.map((product) => (
                        <ProductCard key={product.name} product={product} />
                    ))}
                </div>
                {visibleProducts.length === 0 && (
                    <p className="text-center text-[#737373] py-12">No products in this category yet.</p>
                )}
            </section>

            <footer className="bg-[#2D3329] text-white px-6 md:px-10 py-10">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm font-avenir">
                    <span className="tracking-widest">MOTHER'S LOVE</span>
                    <span className="text-white/60">© 2026 Mother's Love. All rights reserved.</span>
                </div>
            </footer>

            <button
                aria-label="Open chat"
                className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#A96142] text-white px-5 py-3 rounded-full shadow-lg hover:bg-[#8f5237] transition-colors"
            >
                <ChatIcon size={18} />
                <span className="font-avenir text-sm">Let's Chat!</span>
            </button>
        </div>
    );
}