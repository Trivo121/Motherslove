import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { PRODUCTS } from '../data/products.js';
import Navbar from '../components/common/Navbar.jsx';

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

const ChatIcon = (props) => <Icon {...props}><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" /></Icon>;



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
        </button>
    );
}


function ProductCard({ product }) {
    const navigate = useNavigate();
    return (
        <div className="group block relative">
            <Link to={`/product/${product.id}`} className="block">
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
                <h3 className="mt-4 font-avenir text-[#2D3329] text-base truncate">{product.name}</h3>
                <p className="font-avenir text-sm text-[#737373]">{product.color}</p>
                <p className="font-avenir text-[#A96142] mt-1">{product.price}</p>
            </Link>
            <button 
                onClick={(e) => { e.preventDefault(); navigate('/checkout'); }}
                className="mt-3 w-full bg-white border border-[#2D3329] text-[#2D3329] font-avenir py-2 text-sm hover:bg-[#2D3329] hover:text-white transition-colors"
            >
                Buy Now
            </button>
        </div>
    );
}

/* ---------- Page ---------- */
export default function AllProductsPage() {
    const location = useLocation();
    const [activeFilter, setActiveFilter] = useState(location.state?.category || 'all');

    React.useEffect(() => {
        if (location.state?.category) {
            setActiveFilter(location.state.category);
        }
    }, [location.state?.category]);

    const filters = [
        { key: 'all', label: 'All Products' },
        { key: 'unique', label: 'Unique' },
        { key: 'formal', label: 'Formal' },
    ];

    const visibleProducts =
        activeFilter === 'all' ? PRODUCTS : PRODUCTS.filter((p) => p.category === activeFilter);

    return (
        <div className="min-h-screen bg-white font-avenir">
            <Navbar />

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