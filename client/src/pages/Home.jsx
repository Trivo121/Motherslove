import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.PNG';
import unique1 from '../assets/unique/Unique1.PNG';
import unique2 from '../assets/unique/unique2.PNG';
import unique3 from '../assets/unique/unique3.PNG';
import unique4 from '../assets/unique/unique 4.PNG';
import uniqCover from '../assets/unique/justice.PNG';
import formalCover from '../assets/formal/formal cover.JPEG';
import Navbar from '../components/common/Navbar.jsx';
import Footer from '../components/common/Footer.jsx';

/* ---------- Inline icons (no external icon package) ---------- */
const Icon = ({ children, size = 20, className = '' }) => (
    <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        {children}
    </svg>
);



const ArrowIcon = (props) => (
    <Icon {...props}>
        <path d="M7 17L17 7M7 7h10v10" />
    </Icon>
);
const PaletteIcon = (props) => (
    <Icon {...props}>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c.88 0 1.63-.75 1.63-1.63 0-.41-.15-.8-.43-1.12-.27-.3-.44-.71-.44-1.15 0-.88.72-1.6 1.6-1.6H16c3.31 0 6-2.69 6-6 0-4.96-4.48-9-10-9z" />
        <circle cx="7.5" cy="10.5" r="1.5" fill="currentColor" />
        <circle cx="11.5" cy="7.5" r="1.5" fill="currentColor" />
        <circle cx="16.5" cy="9.5" r="1.5" fill="currentColor" />
    </Icon>
);
const ShirtIcon = (props) => (
    <Icon {...props}>
        <path d="M20.37 4.65l-2.7-1.35c-.18-.09-.38-.15-.59-.15H15c0 1.66-1.34 3-3 3s-3-1.34-3-3H6.92c-.21 0-.41.06-.59.15l-2.7 1.35C3.25 4.84 3 5.22 3 5.65v5.7c0 .48.34.89.81.97l2.19.37V20c0 .55.45 1 1 1h10c.55 0 1-.45 1-1v-7.31l2.19-.37c.47-.08.81-.49.81-.97V5.65c0-.43-.25-.81-.63-1z" />
    </Icon>
);
const SproutIcon = (props) => (
    <Icon {...props}>
        <path d="M12 22V10m0 0a5 5 0 0 1 5-5h2a1 1 0 0 1 1 1v1a5 5 0 0 1-5 5h-3zm0 0a5 5 0 0 0-5-5H5a1 1 0 0 0-1 1v1a5 5 0 0 0 5 5h3z" />
    </Icon>
);

/* ---------- Reusable primary button (default/hover states per spec) ---------- */
const PrimaryButton = ({ children, className = '', ...props }) => (
    <button
        className={`px-9 py-3.5 bg-[#A96142] text-white border border-[#A96142] text-sm uppercase tracking-widest font-avenir hover:bg-white hover:text-[#A96142] transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A96142] focus-visible:ring-offset-2 ${className}`}
        {...props}
    >
        {children}
    </button>
);

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const HomePage = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [chatOpen, setChatOpen] = useState(false);
    const [chatMessage, setChatMessage] = useState('');
    const [messages, setMessages] = useState([
        { sender: 'bot', text: 'Hi! Let us know if you have any questions about our sustainable collections.' }
    ]);
    const navigate = useNavigate();

    // Mount fade-in approximates the "in" half of the site's out-in page transition
    useEffect(() => {
        setIsVisible(true);
    }, []);

    const categories = [
        {
            label: 'Shop Unique Prints',
            img: uniqCover,
            target: 'unique',
            bgColor: 'bg-[#8A8B78]',
        },
        {
            label: 'Shop Official Prints',
            img: formalCover,
            target: 'formal',
            bgColor: 'bg-[#98A4AC]',
        },
    ];

    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
                        color: p.category || 'Standard'
                    }));
                    setFeaturedProducts(mapped.slice(0, 4));
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchProducts();
    }, []);

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

    return (
        <div className={`min-h-screen bg-white transition-opacity duration-700 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}>


            {/* Navbar */}
            <Navbar />

            {/* Hero */}
            <header className="px-6 md:px-10 py-24 text-center bg-white">
                <h1 className="font-poppins font-extralight text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-[#2D3329] leading-tight">
                    Simple. Meaningful. Yours.
                </h1>
                <div className="h-px max-w-lg mx-auto my-7 bg-gradient-to-r from-transparent via-[#2D3329]/25 to-transparent" />
                <p className="font-avenir font-light text-xl text-[#737373] max-w-xl mx-auto mb-9">
                    A small brand creating comfortable clothes that feel like home.
                </p>
                <PrimaryButton onClick={() => navigate('/shop')}>Shop Now</PrimaryButton>
            </header>

            {/* Split grid - Sage / Steel */}
            <section className="grid grid-cols-1 md:grid-cols-2">
                {categories.map((cat) => (
                    <div 
                        key={cat.label} 
                        onClick={() => navigate('/shop', { state: { category: cat.target } })} 
                        className={`group relative h-[480px] md:h-[620px] overflow-hidden block ${cat.bgColor} cursor-pointer`}
                    >
                        <img
                            src={cat.img}
                            alt={cat.label}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                        <div className="absolute left-8 bottom-8 flex items-center gap-2 text-white font-avenir text-sm tracking-widest uppercase font-normal z-10">
                            {cat.label}
                            <ArrowIcon size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </div>
                    </div>
                ))}
            </section>

            {/* Woven With Love */}
            <section className="bg-[#FDF6F3] py-20 px-6 text-center border-y border-[#FDF6F3]/5">
                <h2 className="font-poppins font-extralight text-3xl md:text-4xl text-[#2D3329] mb-5">Woven With Love</h2>
                <p className="font-avenir font-light text-sm text-[#737373] max-w-2xl mx-auto leading-relaxed mb-14">
                    MothersLove is a small brand born from a cherished memory. We design bold prints and classic
                    solids meant to bring comfort and heart to your everyday life.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 max-w-2xl mx-auto">
                    <div className="flex flex-col items-center gap-3">
                        <PaletteIcon size={28} className="text-[#A96142]" />
                        <p className="font-avenir text-sm text-[#2D3329]">Unique Prints</p>
                    </div>
                    <div className="flex flex-col items-center gap-3">
                        <ShirtIcon size={28} className="text-[#A96142]" />
                        <p className="font-avenir text-sm text-[#2D3329]">Official Solids</p>
                    </div>
                    <div className="flex flex-col items-center gap-3">
                        <SproutIcon size={28} className="text-[#A96142]" />
                        <p className="font-avenir text-sm text-[#2D3329]">Meaningful Roots</p>
                    </div>
                </div>
            </section>

            {/* New Arrivals */}
            <section className="px-6 md:px-10 py-24 bg-white border-t border-[#FDF6F3]">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-end justify-between mb-10">
                        <h2 className="font-poppins font-extralight text-3xl text-[#2D3329]">New Arrivals</h2>
                        <button onClick={() => navigate('/shop')} className="font-avenir text-sm text-[#A96142] hover:underline flex items-center gap-1 cursor-pointer">
                            View All <ArrowIcon size={14} />
                        </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                        {featuredProducts.map((p) => (
                            <div key={p.id} onClick={() => navigate(`/product/${p.id}`)} className="group cursor-pointer">
                                <div className="relative aspect-[4/5] overflow-hidden mb-4 transition-transform duration-300 shadow-sm border border-black/5">
                                    <img src={p.img} alt={p.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all duration-700 ease-out" />
                                    {p.badge && (
                                        <span className="absolute top-3 left-3 bg-[#A96142] text-white text-[10px] tracking-wider px-2.5 py-1 font-avenir">{p.badge}</span>
                                    )}
                                </div>
                                <h3 className="font-avenir text-sm text-[#2D3329] group-hover:text-[#A96142] transition-colors">{p.name}</h3>
                                <p className="font-avenir text-sm mt-1">
                                    {p.on_sale && p.salePriceFormatted ? (
                                        <>
                                            <span className="line-through text-[#737373]/60 mr-2">{p.priceFormatted || p.price}</span>
                                            <span className="text-[#A96142]">{p.salePriceFormatted}</span>
                                        </>
                                    ) : (
                                        <span className="text-[#737373]">{p.priceFormatted || p.price}</span>
                                    )}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Newsletter */}
            <section className="bg-[#FDF6F3] py-20 px-6 text-center">
                <h2 className="font-poppins font-extralight text-2xl md:text-3xl text-[#2D3329] mb-3">Join the Movement</h2>
                <p className="font-avenir font-light text-sm text-[#737373] mb-7 max-w-md mx-auto">Sign up for early access to new drops and sustainability stories.</p>
                <form className="flex max-w-md mx-auto shadow-sm" onSubmit={(e) => e.preventDefault()}>
                    <input
                        type="email"
                        placeholder="Your email address"
                        className="flex-1 border border-white bg-white px-4 py-3.5 text-base md:text-sm font-avenir text-[#2D3329] placeholder:text-[#737373]/60 focus:outline-none focus:border-[#A96142]"
                    />
                    <button className="px-8 bg-[#A96142] text-white text-sm uppercase tracking-widest font-avenir font-medium hover:bg-[#8f5237] transition-colors duration-300">
                        JOIN
                    </button>
                </form>
            </section>

            {/* Footer */}
            <Footer />

            {/* Chat Widget Button */}
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
                    <div className="w-80 h-96 bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden border border-[#2D3329]/10 animate-fade-in">
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
                                className="flex-grow border border-[#2D3329]/10 rounded px-3 py-1.5 text-base md:text-xs font-avenir focus:outline-none focus:border-[#A96142]"
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
};

export default HomePage;