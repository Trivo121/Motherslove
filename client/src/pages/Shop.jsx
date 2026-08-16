import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import Navbar from '../components/common/Navbar.jsx';
import Footer from '../components/common/Footer.jsx';
import { buildShopFilters, matchesCategory, categoryLabel } from '../data/categories.js';

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





/* ---------- Filter bar ---------- */

/* Hover-to-open is a desktop-only nicety: touch browsers fire a synthetic
   mouseenter immediately before click, which would toggle the sub-menu
   straight back shut. So only wire hover up where hovering is real. */
const CAN_HOVER =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(hover: hover) and (pointer: fine)').matches;

function FilterPill({ item, activeFilter, onSelect }) {
    const [open, setOpen] = useState(false);
    const wrapRef = useRef(null);

    /* The sub-menu now opens on tap, so it also has to close again on a tap
       outside it (or on Escape) — there's no mouseleave to rely on. */
    useEffect(() => {
        if (!open) return;
        function handlePointerDown(e) {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
        }
        function handleKeyDown(e) {
            if (e.key === 'Escape') setOpen(false);
        }
        document.addEventListener('pointerdown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('pointerdown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [open]);

    if (item.subItems) {
        /* The parent pill is selectable in its own right: picking "T-Shirts"
           shows every t-shirt, and the sub-items narrow that down. */
        const isActive = activeFilter === item.key || item.subItems.some(sub => sub.key === activeFilter);
        return (
            <div
                ref={wrapRef}
                className="relative"
                onMouseEnter={CAN_HOVER ? () => setOpen(true) : undefined}
                onMouseLeave={CAN_HOVER ? () => setOpen(false) : undefined}
            >
                <button
                    onClick={() => { onSelect(item.key); setOpen((prev) => !prev); }}
                    aria-expanded={open}
                    className={`flex shrink-0 whitespace-nowrap items-center gap-2 px-6 py-3 border font-avenir text-sm tracking-wide transition-colors ${isActive
                        ? 'bg-[#A96142] border-[#A96142] text-white'
                        : 'bg-white border-[#2D3329]/25 text-[#2D3329] hover:border-[#A96142] hover:text-[#A96142]'
                        }`}
                >
                    {item.label}
                    <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={`ml-1 opacity-60 transition-transform ${open ? 'rotate-180' : ''}`}><path d="M6 9l6 6 6-6" /></svg>
                </button>
                <div className={`absolute left-0 top-full w-48 bg-white border border-[#2D3329]/15 shadow-lg transition-all duration-200 z-50 flex-col ${open ? 'opacity-100 visible flex' : 'opacity-0 invisible hidden'}`}>
                    {item.subItems.map(sub => (
                        <button
                            key={sub.key}
                            onClick={() => { onSelect(sub.key); setOpen(false); }}
                            className={`text-left px-4 py-3 text-sm font-avenir hover:bg-[#FDF6F3] transition-colors ${activeFilter === sub.key ? 'text-[#A96142] font-semibold' : 'text-[#2D3329]'}`}
                        >
                            {sub.label}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    const active = activeFilter === item.key;
    return (
        <button
            onClick={() => onSelect(item.key)}
            className={`flex shrink-0 whitespace-nowrap items-center gap-2 px-6 py-3 border font-avenir text-sm tracking-wide transition-colors ${active
                ? 'bg-[#A96142] border-[#A96142] text-white'
                : 'bg-white border-[#2D3329]/25 text-[#2D3329] hover:border-[#A96142] hover:text-[#A96142]'
                }`}
        >
            {item.label}
        </button>
    );
}


function ProductCard({ product, index }) {
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const backgrounds = ['bg-[#E3DDD6]', 'bg-[#D5D0C8]', 'bg-[#CDD6CE]', 'bg-[#D9D5C9]'];
    const cardBg = backgrounds[index % backgrounds.length];
    return (
        <div className="group block relative">
            <Link to={`/product/${product.id}`} className="block">
                <div className={`relative aspect-[3/4] overflow-hidden ${cardBg}`}>
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
                <p className="font-avenir text-[#A96142] mt-1">
                    {product.on_sale && product.salePriceFormatted ? (
                        <>
                            <span className="line-through text-[#737373] mr-2">{product.priceFormatted || product.price}</span>
                            <span>{product.salePriceFormatted}</span>
                        </>
                    ) : (
                        product.priceFormatted || product.price
                    )}
                </p>
            </Link>
            <button 
                onClick={(e) => { e.preventDefault(); addToCart(product, product.sizes?.[0] || 'M', 1, product.color || 'Standard'); navigate('/checkout'); }}
                className="mt-3 w-full bg-white border border-[#2D3329] text-[#2D3329] font-avenir py-2 text-sm hover:bg-[#2D3329] hover:text-white transition-colors"
            >
                Buy Now
            </button>
        </div>
    );
}

/* ---------- Page ---------- */
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export default function AllProductsPage() {
    const location = useLocation();
    const [activeFilter, setActiveFilter] = useState(location.state?.category || 'all');

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
        async function fetchProducts() {
            try {
                const res = await fetch(`${API_URL}/products`);
                if (res.ok) {
                    const data = await res.json();
                    const mapped = data.map(p => ({
                        ...p,
                        img: p.image_url,
                        priceFormatted: `₹${p.price.toLocaleString('en-IN')}.00`,
                        salePriceFormatted: p.sale_price ? `₹${p.sale_price.toLocaleString('en-IN')}.00` : null,
                        badge: p.tags && p.tags.length > 0 ? p.tags[0] : '',
                        color: categoryLabel(p.category)
                    }));
                    setProducts(mapped);
                }
            } catch (err) {
                console.error("Failed to fetch products:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchProducts();
    }, []);

    React.useEffect(() => {
        if (location.state?.category) {
            setActiveFilter(location.state.category);
        }
    }, [location.state?.category]);

    const filters = useMemo(() => buildShopFilters(products), [products]);

    const visibleProducts = useMemo(
        () => products.filter((p) => matchesCategory(p.category, activeFilter)),
        [products, activeFilter],
    );

    return (
        <div className="min-h-screen bg-white font-avenir">
            <Navbar />

            <header className="px-6 md:px-10 pt-16 pb-10 text-center">
                <h1 className="font-poppins text-5xl md:text-6xl font-light text-[#2D3329]">All Products</h1>
                <div className="w-16 h-px bg-[#2D3329]/30 mx-auto mt-6" />
            </header>

            <div className="flex flex-wrap items-center justify-center gap-3 px-6 md:px-10 pb-12">
                {filters.map((f) => (
                    <FilterPill key={f.key} item={f} activeFilter={activeFilter} onSelect={setActiveFilter} />
                ))}
            </div>

            <section className="px-6 md:px-10 pb-24">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-8 h-8 border-2 border-[#A96142] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-12 max-w-6xl mx-auto">
                        {visibleProducts.map((product, idx) => (
                            <ProductCard key={product.id} product={product} index={idx} />
                        ))}
                    </div>
                    {visibleProducts.length === 0 && (
                        <p className="text-center text-[#737373] py-12">No products in this category yet.</p>
                    )}
                </>
            )}
            </section>

            <Footer />


        </div>
    );
}