import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.PNG';
import Navbar from '../components/common/Navbar.jsx';
import { PRODUCTS } from '../data/products.js';

/* ---------- Icons ---------- */
const Icon = ({ children, size = 20, className = '' }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        {children}
    </svg>
);
const ChevronIcon = (p) => <Icon {...p}><path d="M6 9l6 6 6-6" /></Icon>;
const ChevronLeftIcon = (p) => <Icon {...p}><path d="M15 18l-6-6 6-6" /></Icon>;
const ChevronRightIcon = (p) => <Icon {...p}><path d="M9 18l6-6-6-6" /></Icon>;
const BagIcon = (p) => <Icon {...p}><path d="M6 7h12l1 13H5L6 7z" /><path d="M9 7a3 3 0 016 0" /></Icon>;
const ChatIcon = (p) => <Icon {...p}><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" /></Icon>;
const PlusIcon = (p) => <Icon {...p}><path d="M12 5v14M5 12h14" /></Icon>;
const MinusIcon = (p) => <Icon {...p}><path d="M5 12h14" /></Icon>;



/* ---------- Accordion row ---------- */
function Accordion({ title, children, defaultOpen = false }) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="border-t border-[#2D3329]/15 py-5">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center justify-between w-full text-left group"
            >
                <span className="font-avenir text-sm tracking-widest text-[#2D3329] uppercase group-hover:text-[#A96142] transition-colors">
                    {title}
                </span>
                <span className="text-[#2D3329] group-hover:text-[#A96142] transition-colors">
                    {open
                        ? <MinusIcon size={16} />
                        : <PlusIcon size={16} />}
                </span>
            </button>
            {open && (
                <div className="mt-4 font-avenir text-[#737373] text-sm leading-relaxed">
                    {children}
                </div>
            )}
        </div>
    );
}

/* ---------- Size picker ---------- */
function SizePicker({ sizes, selected, onSelect }) {
    return (
        <div>
            <p className="font-avenir text-sm text-[#2D3329] mb-3">
                Size <span className="text-[#A96142]">{selected}</span>
            </p>
            <div className="flex flex-wrap gap-2">
                {sizes.map((s) => (
                    <button
                        key={s}
                        onClick={() => onSelect(s)}
                        className={`w-11 h-11 border text-sm font-avenir transition-colors ${selected === s
                            ? 'bg-[#2D3329] border-[#2D3329] text-white'
                            : 'border-[#2D3329]/30 text-[#2D3329] hover:border-[#A96142] hover:text-[#A96142]'
                            }`}
                    >
                        {s}
                    </button>
                ))}
            </div>
        </div>
    );
}

/* ---------- Main page ---------- */
export default function ProductPage() {
    const { id } = useParams();
    const routerNavigate = useNavigate();
    
    const productId = Number(id);
    const product = PRODUCTS.find(p => p.id === productId) ?? PRODUCTS[0];

    const [qty, setQty] = useState(1);
    const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
    const [cartCount, setCartCount] = useState(0);
    const [addedMsg, setAddedMsg] = useState('');

    // Reset state when product changes
    useEffect(() => {
        setQty(1);
        setSelectedSize(product.sizes[0]);
        setAddedMsg('');
    }, [product]);

    const prevId = (productId - 1 + PRODUCTS.length) % PRODUCTS.length;
    const nextId = (productId + 1) % PRODUCTS.length;

    function goToProduct(newId) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        routerNavigate(`/product/${newId}`);
    }

    function handleAddToCart() {
        setCartCount((c) => c + qty);
        setAddedMsg(`${qty} × ${product.name} (${selectedSize}) added!`);
        setTimeout(() => setAddedMsg(''), 3000);
    }

    return (
        <div className="min-h-screen bg-white">
            <Navbar cartCount={cartCount} />

            {/* Breadcrumb + Prev/Next */}
            <div className="px-6 md:px-10 py-5 flex items-center justify-between border-b border-[#2D3329]/8">
                <nav className="flex items-center gap-2 text-sm font-avenir text-[#737373]">
                    <a href="#" className="hover:text-[#A96142] transition-colors">Home</a>
                    <ChevronRightIcon size={14} />
                    <a href="#" className="hover:text-[#A96142] transition-colors">All Products</a>
                    <ChevronRightIcon size={14} />
                    <span className="text-[#2D3329]">{product.name}</span>
                </nav>
                <div className="flex items-center gap-4 text-sm font-avenir text-[#2D3329]">
                    <button
                        onClick={() => goToProduct(prevId)}
                        className="flex items-center gap-1 hover:text-[#A96142] transition-colors"
                    >
                        <ChevronLeftIcon size={14} /> Prev
                    </button>
                    <span className="text-[#2D3329]/25">|</span>
                    <button
                        onClick={() => goToProduct(nextId)}
                        className="flex items-center gap-1 hover:text-[#A96142] transition-colors"
                    >
                        Next <ChevronRightIcon size={14} />
                    </button>
                </div>
            </div>

            {/* Main content */}
            <div className="max-w-6xl mx-auto px-6 md:px-10 py-14 grid grid-cols-1 md:grid-cols-2 gap-14 md:gap-20">
                {/* Left — image */}
                <div>
                    <div className="aspect-[4/5] overflow-hidden bg-[#FDF6F3] relative">
                        {product.badge && (
                            <span className="absolute top-4 left-4 z-10 bg-[#A96142] text-white text-xs font-avenir tracking-wide px-3 py-1">
                                {product.badge}
                            </span>
                        )}
                        <img
                            key={product.id}
                            src={product.img}
                            alt={product.name}
                            className="w-full h-full object-cover transition-opacity duration-300"
                        />
                    </div>
                    {/* Caption below image */}
                    <p className="mt-5 font-avenir text-sm text-[#737373] leading-relaxed">
                        {product.description}
                    </p>
                </div>

                {/* Right — details */}
                <div className="flex flex-col">
                    <h1 className="font-poppins text-3xl md:text-4xl font-light text-[#2D3329] leading-snug">
                        {product.name}
                    </h1>
                    <p className="font-avenir text-sm text-[#737373] mt-2">{product.sku}</p>
                    <p className="font-avenir text-xl text-[#A96142] mt-5">{product.price}</p>

                    <div className="mt-7">
                        <SizePicker
                            sizes={product.sizes}
                            selected={selectedSize}
                            onSelect={setSelectedSize}
                        />
                    </div>

                    {/* Quantity */}
                    <div className="mt-7">
                        <p className="font-avenir text-sm text-[#2D3329] mb-3">Quantity</p>
                        <div className="flex items-center border border-[#2D3329]/25 w-fit">
                            <button
                                onClick={() => setQty((q) => Math.max(1, q - 1))}
                                className="w-11 h-11 flex items-center justify-center text-[#2D3329] hover:text-[#A96142] transition-colors"
                                aria-label="Decrease quantity"
                            >
                                <MinusIcon size={16} />
                            </button>
                            <span className="w-11 h-11 flex items-center justify-center font-avenir text-[#2D3329]">
                                {qty}
                            </span>
                            <button
                                onClick={() => setQty((q) => q + 1)}
                                className="w-11 h-11 flex items-center justify-center text-[#2D3329] hover:text-[#A96142] transition-colors"
                                aria-label="Increase quantity"
                            >
                                <PlusIcon size={16} />
                            </button>
                        </div>
                    </div>

                    {/* CTAs */}
                    <div className="flex flex-col gap-3 mt-8">
                        {addedMsg && (
                            <p className="font-avenir text-sm text-[#A96142]">{addedMsg}</p>
                        )}
                        <button
                            onClick={handleAddToCart}
                            className="w-full border border-[#A96142] text-[#A96142] font-avenir py-3 hover:bg-[#A96142] hover:text-white transition-colors"
                        >
                            Add to Cart
                        </button>
                        <button onClick={() => routerNavigate('/checkout')} className="w-full bg-[#2D3329] text-white font-avenir py-3 hover:bg-[#3f4a39] transition-colors">
                            Buy Now
                        </button>
                    </div>

                    {/* Accordion info panels */}
                    <div className="mt-10">
                        <Accordion title="Product Info" defaultOpen>
                            <p className="mb-3">{product.description}</p>
                            <p><span className="text-[#2D3329]">Material:</span> {product.material}</p>
                        </Accordion>
                        <Accordion title="Return &amp; Refund Policy">
                            <p>We accept returns within 14 days of delivery for unused, unwashed items in their original packaging. Sale items are final sale. To start a return, email <span className="text-[#A96142]">hello@motherslove.in</span> with your order number.</p>
                        </Accordion>
                        <Accordion title="Shipping Info">
                            <ul className="space-y-1 list-none">
                                <li>Standard delivery: 5–7 business days</li>
                                <li>Express delivery: 2–3 business days</li>
                                <li>Free delivery on orders over ₹1,500</li>
                                <li>All orders ship from Chennai, Tamil Nadu</li>
                            </ul>
                        </Accordion>
                    </div>
                </div>
            </div>

            {/* You may also like */}
            <section className="bg-[#FDF6F3] px-6 md:px-10 py-16">
                <h2 className="font-poppins text-2xl font-light text-[#2D3329] text-center mb-10">You May Also Like</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
                    {PRODUCTS.filter((p) => p.id !== product.id).slice(0, 4).map((p) => (
                        <button
                            key={p.id}
                            onClick={() => goToProduct(p.id)}
                            className="group text-left"
                        >
                            <div className="aspect-[3/4] overflow-hidden bg-white">
                                <img
                                    src={p.img}
                                    alt={p.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            </div>
                            <p className="mt-3 font-avenir text-[#2D3329] text-sm">{p.name}</p>
                            <p className="font-avenir text-[#A96142] text-sm">{p.price}</p>
                        </button>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-[#2D3329] text-white px-6 md:px-10 py-10">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm font-avenir">
                    <span className="tracking-widest">MOTHER'S LOVE</span>
                    <span className="text-white/60">© 2026 Mother's Love. All rights reserved.</span>
                </div>
            </footer>

            {/* Chat widget */}
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