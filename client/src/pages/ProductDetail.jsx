import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext.jsx';
import { useParams, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.PNG';
import Navbar from '../components/common/Navbar.jsx';

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
// NEW — used for placeholder thumbnails
const ImageIcon = (p) => (
    <Icon {...p}>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
    </Icon>
);



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
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export default function ProductPage() {
    const { id } = useParams();
    const routerNavigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const { cartItems, addToCart } = useCart();
    const [qty, setQty] = useState(1);
    const [selectedSize, setSelectedSize] = useState('M');
    const [addedMsg, setAddedMsg] = useState('');
    const [activeImgIndex, setActiveImgIndex] = useState(0);
    const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

    const [chatOpen, setChatOpen] = useState(false);
    const [chatMessage, setChatMessage] = useState('');
    const [messages, setMessages] = useState([
        { sender: 'bot', text: 'Hi! Let us know if you have any questions about our sustainable collections.' }
    ]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!chatMessage.trim()) return;
        const userMsg = { sender: 'user', text: chatMessage };
        setMessages(prev => [...prev, userMsg]);
        setChatMessage('');
        setTimeout(() => {
            setMessages(prev => [...prev, {
                sender: 'bot',
                text: "Thanks for checking in! Our customer love team will text you back within 5 minutes."
            }]);
        }, 1000);
    };

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
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
                        color: p.category || 'Standard'
                    }));
                    setAllProducts(mapped);

                    const found = mapped.find(p => String(p.id) === String(id));
                    setProduct(found || mapped[0]);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [id]);

    useEffect(() => {
        if (product) {
            setQty(1);
            setSelectedSize(product.sizes?.[0] || 'M');
            setAddedMsg('');
            setActiveImgIndex(0);
        }
    }, [product]);

    if (loading) {
        return <div className="min-h-screen bg-white flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#A96142] border-t-transparent rounded-full animate-spin"></div></div>;
    }

    if (!product) {
        return <div className="min-h-screen bg-white flex items-center justify-center">Product not found</div>;
    }

    const images = product.image_urls?.length
        ? [...product.image_urls, null, null, null].slice(0, 4)
        : [product.img, null, null, null];

    const currentIndex = allProducts.findIndex(p => p.id === product.id);
    const prevId = allProducts[(currentIndex - 1 + allProducts.length) % allProducts.length]?.id;
    const nextId = allProducts[(currentIndex + 1) % allProducts.length]?.id;

    function goToProduct(newId) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        routerNavigate(`/product/${newId}`);
    }

    function handleAddToCart() {
        addToCart(product, selectedSize, qty, product.color || 'Standard');
        setAddedMsg(`${qty} × ${product.name} (${selectedSize}) added!`);
        setTimeout(() => setAddedMsg(''), 3000);
    }

    return (
        <div className="min-h-screen bg-white">
            <Navbar cartCount={cartCount} />

            {/* Breadcrumb + Prev/Next */}
            <div className="px-6 md:px-10 py-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#2D3329]/8">
                <nav className="flex flex-wrap items-center gap-2 text-sm font-avenir text-[#737373]">
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
                {/* Left — image gallery */}
                <div>
                    {/* ── Main viewer ── */}
                    <div className="aspect-[4/5] overflow-hidden bg-[#FDF6F3] relative">
                        {product.badge && (
                            <span className="absolute top-4 left-4 z-10 bg-[#A96142] text-white text-xs font-avenir tracking-wide px-3 py-1">
                                {product.badge}
                            </span>
                        )}
                        {images[activeImgIndex] ? (
                            <img
                                key={activeImgIndex}
                                src={images[activeImgIndex]}
                                alt={product.name}
                                className="w-full h-full object-cover transition-opacity duration-300"
                            />
                        ) : (
                            /* Placeholder shown when the image slot is still null */
                            <div className="w-full h-full flex flex-col items-center justify-center bg-[#F0EBE8]">
                                <ImageIcon size={48} className="text-[#2D3329]/20" />
                                <p className="font-avenir text-sm text-[#2D3329]/30 mt-3">Image Coming Soon</p>
                            </div>
                        )}
                    </div>

                    {/* ── Thumbnail strip (4 slots) ── */}
                    <div className="grid grid-cols-4 gap-2 mt-3">
                        {images.map((img, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveImgIndex(i)}
                                className={`aspect-square overflow-hidden border-2 transition-colors ${activeImgIndex === i
                                    ? 'border-[#A96142]'
                                    : 'border-transparent hover:border-[#2D3329]/20'
                                    }`}
                            >
                                {img ? (
                                    <img
                                        src={img}
                                        alt={`View ${i + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-[#F0EBE8] flex items-center justify-center">
                                        <ImageIcon size={16} className="text-[#2D3329]/25" />
                                    </div>
                                )}
                            </button>
                        ))}
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
                    <p className="font-avenir text-xl text-[#A96142] mt-5">
                        {product.on_sale && product.salePriceFormatted ? (
                            <>
                                <span className="line-through text-[#737373] mr-3 text-lg">{product.priceFormatted || product.price}</span>
                                <span>{product.salePriceFormatted}</span>
                            </>
                        ) : (
                            product.priceFormatted || product.price
                        )}
                    </p>

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
                            className="w-full border border-[#A96142] text-[#A96142] font-avenir py-3 hover:bg-[#A96142] hover:text-white transition-colors uppercase tracking-widest text-xs font-semibold duration-300"
                        >
                            Add to Cart
                        </button>
                        <button 
                            onClick={() => { addToCart(product, selectedSize, qty, product.color || 'Standard'); routerNavigate('/checkout'); }} 
                            className="w-full bg-[#A96142] text-white border border-[#A96142] font-avenir py-3 hover:bg-white hover:text-[#A96142] transition-colors uppercase tracking-widest text-xs font-semibold duration-300"
                        >
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
                            <p>We accept returns within 14 days of delivery for unused, unwashed items in their original packaging. Sale items are final sale. To start a return, email <span className="text-[#A96142]">sunnusunnu649@gmail.com</span> with your order number.</p>
                        </Accordion>
                        <Accordion title="Shipping Info">
                            <ul className="space-y-1 list-none">
                                <li>Standard delivery: 5–7 business days</li>
                                <li>Express delivery: 2–3 business days</li>
                            </ul>
                        </Accordion>
                    </div>
                </div>
            </div>

            {/* You may also like */}
            <section className="bg-white px-6 md:px-10 py-16 border-t border-[#FDF6F3]">
                <h2 className="font-poppins text-2xl font-light text-[#2D3329] text-center mb-10">You May Also Like</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
                    {allProducts.filter((p) => p.id !== product.id).slice(0, 4).map((p, idx) => {
                        const backgrounds = ['bg-[#E3DDD6]', 'bg-[#D5D0C8]', 'bg-[#CDD6CE]', 'bg-[#D9D5C9]'];
                        const cardBg = backgrounds[idx % backgrounds.length];
                        return (
                            <button
                                key={p.id}
                                onClick={() => goToProduct(p.id)}
                                className="group text-left"
                            >
                                <div className={`aspect-[3/4] overflow-hidden ${cardBg} transition-transform duration-300 hover:shadow-sm`}>
                                    <img
                                        src={p.img}
                                        alt={p.name}
                                        className="w-full h-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105 group-hover:opacity-100"
                                    />
                                </div>
                                <p className="mt-3 font-avenir text-[#2D3329] text-sm group-hover:text-[#A96142] transition-colors">{p.name}</p>
                                <p className="font-avenir text-[#A96142] text-sm mt-1">{p.priceFormatted || p.price}</p>
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-[#2D3329] text-[#737373] px-6 md:px-10 py-16 border-t border-white/5">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm font-avenir">
                    <span className="tracking-widest text-white font-semibold font-cinzel">MOTHER'S LOVE</span>
                    <span className="text-[#737373]/60">© 2026 Mother's Love. All rights reserved.</span>
                </div>
            </footer>

            {/* Chat Widget Button & Dialog */}
            <div className="fixed bottom-6 right-6 z-50">
                {!chatOpen ? (
                    <button 
                        onClick={() => setChatOpen(true)}
                        className="w-14 h-14 bg-[#A96142] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform duration-300 border border-[#A96142]"
                        aria-label="Open chat"
                    >
                        <svg viewBox="0 0 24 24" width={24} height={24} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                    </button>
                ) : (
                    <div className="w-80 h-96 bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden border border-[#2D3329]/10">
                        {/* Chat Header */}
                        <div className="bg-[#A96142] text-white px-4 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                                <span className="font-avenir text-sm font-semibold tracking-wide">Support Chat</span>
                            </div>
                            <button onClick={() => setChatOpen(false)} className="text-white/80 hover:text-white">
                                <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                        {/* Chat Messages */}
                        <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 bg-[#FDF6F3]/30">
                            {messages.map((msg, i) => (
                                <div key={i} className={`max-w-[80%] p-2.5 rounded-lg text-xs font-avenir ${msg.sender === 'bot' ? 'bg-white text-[#2D3329] self-start shadow-sm border border-[#2D3329]/5' : 'bg-[#A96142] text-white self-end shadow-sm'}`}>
                                    {msg.text}
                                </div>
                            ))}
                        </div>
                        {/* Chat Input */}
                        <form onSubmit={handleSendMessage} className="p-3 border-t border-[#2D3329]/10 flex gap-2 bg-white">
                            <input
                                type="text"
                                value={chatMessage}
                                onChange={(e) => setChatMessage(e.target.value)}
                                placeholder="Write a message..."
                                className="flex-grow border border-[#2D3329]/10 rounded px-3 py-1.5 text-xs font-avenir focus:outline-none focus:border-[#A96142]"
                            />
                            <button type="submit" className="bg-[#A96142] text-white px-3 py-1.5 rounded text-xs font-avenir hover:bg-[#8f5237] transition-colors">
                                Send
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}