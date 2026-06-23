import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.PNG';
import unique1 from '../assets/unique/Unique1.PNG';
import unique2 from '../assets/unique/unique2.PNG';
import unique3 from '../assets/unique/unique3.PNG';
import unique4 from '../assets/unique/unique 4.PNG';
import uniqCover from '../assets/unique/uniq cover.PNG';
import formalCover from '../assets/formal/formal cover.JPEG';
import { PRODUCTS } from '../data/products.js';

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

const BagIcon = (props) => (
    <Icon {...props}>
        <path d="M7 8h10l1 12H6L7 8z" />
        <path d="M9 8a3 3 0 0 1 6 0" />
    </Icon>
);
const ChevronIcon = (props) => (
    <Icon {...props}>
        <path d="M5 8l7 7 7-7" />
    </Icon>
);
const ChatIcon = (props) => (
    <Icon {...props}>
        <path d="M4 5h16v10H10l-5 4v-4H4V5z" />
    </Icon>
);
const ArrowIcon = (props) => (
    <Icon {...props}>
        <path d="M7 17L17 7M7 7h10v10" />
    </Icon>
);
const LeafIcon = (props) => (
    <Icon {...props}>
        <path d="M5 21c8 0 13-5 13-15-10 0-13 6-13 15z" />
        <path d="M5 21c1-5 4-9 8-12" />
    </Icon>
);
const BadgeIcon = (props) => (
    <Icon {...props}>
        <circle cx="12" cy="12" r="9" />
        <path d="M8 12l3 3 5-6" />
    </Icon>
);
const TruckIcon = (props) => (
    <Icon {...props}>
        <path d="M3 16V7h10v9" />
        <path d="M13 10h4l4 4v2h-8" />
        <circle cx="7" cy="18" r="1.5" />
        <circle cx="17" cy="18" r="1.5" />
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

const HomePage = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [accountOpen, setAccountOpen] = useState(false);
    const navigate = useNavigate();

    // Mount fade-in approximates the "in" half of the site's out-in page transition
    useEffect(() => {
        setIsVisible(true);
    }, []);

    const navLinks = ['Home', 'Shop', 'About', 'Contact'];

    const categories = [
        {
            label: 'Shop Unique Prints',
            img: uniqCover,
            target: 'unique',
        },
        {
            label: 'Shop Formal Prints',
            img: formalCover,
            target: 'formal',
        },
    ];

    const featuredProducts = PRODUCTS.slice(0, 4);

    return (
        <div className={`min-h-screen bg-white transition-opacity duration-700 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@200;300&family=Nunito+Sans:wght@300;400;600&display=swap');
        .font-poppins { font-family: 'Poppins', sans-serif; }
        .font-avenir { font-family: 'Nunito Sans', 'Helvetica Neue', Arial, sans-serif; }
      `}</style>

            {/* Utility bar */}
            <div className="bg-[#FDF6F3] text-[#2D3329] text-sm font-avenir font-light py-2.5 text-center tracking-wide border-b border-[#2D3329]/10">
                Free Delivery Over $75&nbsp;&nbsp;|&nbsp;&nbsp;Free Returns
            </div>

            {/* Nav: logo + links left, brand centered, account/cart right */}
            <nav className="grid grid-cols-3 items-center gap-4 px-6 md:px-10 py-5 bg-white sticky top-0 z-40 border-b border-[#2D3329]/5">
                <div className="flex items-center gap-6">
                    <img src={logo} alt="Mother's Love" className="h-9 w-auto object-contain" />
                    <div className="hidden md:flex items-center gap-6 text-[#2D3329] text-sm font-avenir font-light">
                        {navLinks.map((link, i) => {
                            const paths = { Home: '/', Shop: '/shop', About: '#', Contact: '#' };
                            return (
                                <a key={i} onClick={(e) => { e.preventDefault(); navigate(paths[link] || '#'); }} href="#" className={`cursor-pointer hover:text-[#A96142] transition-colors ${link === 'Shop' ? 'text-[#A96142]' : ''}`}>
                                    {link}
                                </a>
                            );
                        })}
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
                            <button onClick={() => window.dispatchEvent(new CustomEvent('open-auth-modal', { detail: { view: 'login' } }))} className="block w-full text-left px-4 py-2 hover:bg-[#FDF6F3] hover:text-[#A96142]">Sign In</button>
                            <button onClick={() => window.dispatchEvent(new CustomEvent('open-auth-modal', { detail: { view: 'signup' } }))} className="block w-full text-left px-4 py-2 hover:bg-[#FDF6F3] hover:text-[#A96142]">Sign Up</button>
                        </div>
                    )}
                    <button onClick={() => navigate('/cart')} aria-label="Shopping cart" className="relative hover:text-[#A96142] transition-colors">
                        <BagIcon size={20} />
                        <span className="absolute -top-2 -right-2 bg-[#A96142] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">0</span>
                    </button>
                </div>
            </nav>

            {/* Hero */}
            <header className="px-6 md:px-10 py-16 text-center">
                <h1 className="font-poppins font-extralight text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-[#2D3329] leading-tight">
                    Sustainable. Beautiful. Ethical.
                </h1>
                <div className="h-px max-w-lg mx-auto my-7 bg-gradient-to-r from-transparent via-[#2D3329]/25 to-transparent" />
                <p className="font-avenir font-light text-xl text-[#737373] max-w-xl mx-auto mb-9">
                    Mindfully crafted essentials, designed to last a lifetime.
                </p>
                <PrimaryButton onClick={() => navigate('/shop')}>Shop Now</PrimaryButton>
            </header>

            {/* Split grid - Women / Men */}
            <section className="grid grid-cols-1 md:grid-cols-2">
                {categories.map((cat) => (
                    <div key={cat.label} onClick={() => navigate('/shop', { state: { category: cat.target } })} className="group relative h-[480px] md:h-[620px] overflow-hidden block bg-[#737373]/20 cursor-pointer">
                        <img
                            src={cat.img}
                            alt={cat.label}
                            className="absolute inset-0 w-full h-full object-cover opacity-95 group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500" />
                        <div className="absolute left-8 bottom-8 flex items-center gap-2 text-white font-avenir text-sm tracking-widest uppercase">
                            {cat.label}
                            <ArrowIcon size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </div>
                    </div>
                ))}
            </section>

            {/* Ethically Made */}
            <section className="bg-[#FDF6F3] py-20 px-6 text-center">
                <h2 className="font-poppins font-extralight text-3xl md:text-4xl text-[#2D3329] mb-5">Ethically Made</h2>
                <p className="font-avenir font-light text-base text-[#737373] max-w-2xl mx-auto leading-relaxed mb-14">
                    Every piece is designed with intention. We use only sustainable materials and partner with
                    fair-trade certified factories to keep our footprint as light as possible.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 max-w-3xl mx-auto">
                    <div className="flex flex-col items-center gap-3">
                        <LeafIcon size={28} className="text-[#A96142]" />
                        <p className="font-avenir text-sm text-[#2D3329]">Organic Materials</p>
                    </div>
                    <div className="flex flex-col items-center gap-3">
                        <BadgeIcon size={28} className="text-[#A96142]" />
                        <p className="font-avenir text-sm text-[#2D3329]">Fair-Trade Certified</p>
                    </div>
                    <div className="flex flex-col items-center gap-3">
                        <TruckIcon size={28} className="text-[#A96142]" />
                        <p className="font-avenir text-sm text-[#2D3329]">Carbon-Neutral Shipping</p>
                    </div>
                </div>
            </section>

            {/* New Arrivals */}
            <section className="px-6 md:px-10 py-20">
                <div className="flex items-end justify-between mb-10">
                    <h2 className="font-poppins font-extralight text-3xl text-[#2D3329]">New Arrivals</h2>
                    <button onClick={() => navigate('/shop')} className="font-avenir text-sm text-[#A96142] hover:underline flex items-center gap-1 cursor-pointer">
                        View All <ArrowIcon size={14} />
                    </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                    {featuredProducts.map((p) => (
                        <div key={p.id} onClick={() => navigate(`/product/${p.id}`)} className="group cursor-pointer">
                            <div className="relative h-72 overflow-hidden bg-[#FDF6F3] mb-3">
                                <img src={p.img} alt={p.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                {p.badge && (
                                    <span className="absolute top-3 left-3 bg-black text-white text-[10px] tracking-wider px-2 py-1 font-avenir">{p.badge}</span>
                                )}
                            </div>
                            <h3 className="font-avenir text-sm text-[#2D3329]">{p.name}</h3>
                            <p className="font-avenir text-sm text-[#737373]">{p.price}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Newsletter */}
            <section className="bg-[#FDF6F3] py-16 px-6 text-center">
                <h2 className="font-poppins font-extralight text-2xl md:text-3xl text-[#2D3329] mb-3">Join the Movement</h2>
                <p className="font-avenir font-light text-sm text-[#737373] mb-7">Sign up for early access to new drops and sustainability stories.</p>
                <form className="flex max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
                    <input
                        type="email"
                        placeholder="Your email address"
                        className="flex-1 border border-[#2D3329]/20 bg-white px-4 py-3 text-sm font-avenir focus:outline-none focus:border-[#A96142]"
                    />
                    <button className="px-6 bg-[#A96142] text-white border border-[#A96142] text-sm uppercase tracking-widest font-avenir hover:bg-white hover:text-[#A96142] transition-colors">
                        Join
                    </button>
                </form>
            </section>

            {/* Footer */}
            <footer className="bg-[#2D3329] text-[#FDF6F3] pt-16 pb-8 px-6 md:px-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10 max-w-6xl mx-auto mb-12">
                    <div>
                        <h3 className="font-avenir text-xl tracking-widest mb-3">MOTHER'S LOVE</h3>
                        <p className="font-avenir font-light text-sm text-[#FDF6F3]/70 leading-relaxed">Mindfully crafted essentials for a more sustainable wardrobe.</p>
                    </div>
                    <div>
                        <h4 className="font-avenir text-xs tracking-widest uppercase mb-4 text-[#FDF6F3]/60">Shop</h4>
                        <ul className="space-y-2 font-avenir font-light text-sm">
                            <li><button onClick={() => navigate('/shop')} className="hover:text-[#A96142] cursor-pointer">Unique Prints</button></li>
                            <li><button onClick={() => navigate('/shop')} className="hover:text-[#A96142] cursor-pointer">Formal Prints</button></li>
                            <li><button onClick={() => navigate('/shop')} className="hover:text-[#A96142] cursor-pointer">New Arrivals</button></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-avenir text-xs tracking-widest uppercase mb-4 text-[#FDF6F3]/60">Help</h4>
                        <ul className="space-y-2 font-avenir font-light text-sm">
                            <li><a href="#" className="hover:text-[#A96142]">Shipping &amp; Returns</a></li>
                            <li><a href="#" className="hover:text-[#A96142]">Contact Us</a></li>
                            <li><a href="#" className="hover:text-[#A96142]">FAQ</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-avenir text-xs tracking-widest uppercase mb-4 text-[#FDF6F3]/60">Follow</h4>
                        <ul className="space-y-2 font-avenir font-light text-sm">
                            <li><a href="#" className="hover:text-[#A96142]">Instagram</a></li>
                            <li><a href="#" className="hover:text-[#A96142]">Pinterest</a></li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-[#FDF6F3]/15 pt-6 text-center font-avenir font-light text-xs text-[#FDF6F3]/60">
                    © 2026 Mother's Love. All rights reserved.
                </div>
            </footer>

            {/* Chat widget */}
            <button className="fixed bottom-6 right-6 flex items-center gap-2 bg-[#A96142] text-white pl-4 pr-5 py-3 rounded-full shadow-lg hover:bg-[#8f5037] transition-colors font-avenir text-sm z-50">
                <ChatIcon size={18} />
                Let's Chat!
            </button>
        </div>
    );
};

export default HomePage;