import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.PNG';
import { useAuth } from '../../context/AuthContext';

const Icon = ({ children, size = 20, className = '' }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        {children}
    </svg>
);

const BagIcon = (props) => (
    <Icon {...props}>
        <path d="M6 7h12l1 13H5L6 7z" />
        <path d="M9 7a3 3 0 016 0" />
    </Icon>
);

const ChevronIcon = (props) => (
    <Icon {...props}>
        <path d="M6 9l6 6 6-6" />
    </Icon>
);

const MenuIcon = (props) => (
    <Icon {...props}>
        <path d="M4 6h16M4 12h16M4 18h16" />
    </Icon>
);

const CloseIcon = (props) => (
    <Icon {...props}>
        <path d="M18 6L6 18M6 6l12 12" />
    </Icon>
);

const UserIcon = (props) => (
    <Icon {...props}>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </Icon>
);

export default function Navbar({ cartCount = 0 }) {
    const [accountOpen, setAccountOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();
    const navLinks = ['Home', 'Shop', 'About', 'Contact'];
    
    // Consume Auth context
    const { user, profile, signOut } = useAuth();
    
    // Get user's name for display (prefer profile name, fallback to email prefix)
    const displayName = profile?.name || user?.user_metadata?.full_name || (user?.email ? user.email.split('@')[0] : 'Account');

    const handleSignOut = async () => {
        await signOut();
        setAccountOpen(false);
        // Optionally reload or navigate home
        window.location.href = '/';
    };

    const currentPath = window.location.pathname;
    const isActive = (link) => {
        const paths = { Home: '/', Shop: '/shop', About: '#', Contact: '#' };
        const targetPath = paths[link];
        if (targetPath === '/') return currentPath === '/';
        if (targetPath === '#') return false;
        return currentPath.startsWith(targetPath);
    };

    return (
        <div className="sticky top-0 z-40 w-full pt-[env(safe-area-inset-top)] bg-white">
            {/* Utility Bar */}
            <div className="bg-[#FDF6F3] text-[#737373] text-[10px] sm:text-[11px] font-avenir tracking-widest py-2 px-4 md:px-10 flex justify-between items-center border-b border-[#2D3329]/5">
                <span className="font-light">SALE ONGOING</span>
                <span className="hidden sm:inline font-light">UP TO 50% OFF ON SELECTED PRODUCTS</span>
                <button onClick={() => navigate('/shop')} className="hover:text-[#A96142] transition-colors uppercase font-light text-[10px] cursor-pointer">Shop Sale</button>
            </div>

            <nav className="grid grid-cols-3 items-center px-4 md:px-10 py-4 md:py-5 bg-white border-b border-[#2D3329]/5 relative">
                <div className="flex items-center gap-4">
                    <button className="md:hidden text-[#2D3329] hover:text-[#A96142] transition-colors" onClick={() => setMenuOpen(true)}>
                        <MenuIcon size={24} />
                    </button>
                    <img src={logo} alt="Mother's Love" className="hidden sm:block h-7 md:h-9 w-auto object-contain cursor-pointer" onClick={() => navigate('/')} />
                    <div className="hidden md:flex items-center gap-6 text-[#2D3329] text-sm font-avenir font-light">
                        {navLinks.map((link, i) => {
                            const paths = { Home: '/', Shop: '/shop', About: '#', Contact: '#' };
                            const active = isActive(link);
                            return (
                                <a 
                                    key={i} 
                                    onClick={(e) => { e.preventDefault(); navigate(paths[link] || '#'); }} 
                                    href="#" 
                                    className={`cursor-pointer transition-colors ${active ? 'text-[#A96142] font-semibold' : 'hover:text-[#A96142]'}`}
                                >
                                    {link}
                                </a>
                            );
                        })}
                    </div>
                </div>

                <button onClick={() => navigate('/')} className="font-cinzel text-lg md:text-2xl font-light tracking-widest text-[#2D3329] text-center hover:text-[#A96142] transition-colors justify-self-center truncate w-full">
                    MOTHER'S LOVE
                </button>

                <div className="flex items-center gap-4 md:gap-6 justify-end text-[#2D3329] text-sm font-avenir font-light relative">
                    <button onClick={() => setAccountOpen(!accountOpen)} className="flex items-center gap-1 hover:text-[#A96142] transition-colors">
                        <span className="hidden md:inline">{user ? `Hi, ${displayName}` : 'Account'}</span>
                        <span className="md:hidden"><UserIcon size={22} /></span>
                        <ChevronIcon size={14} className={`hidden md:block transition-transform ${accountOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {accountOpen && (
                        <div className="absolute top-8 right-12 md:right-14 bg-white border border-[#2D3329]/10 shadow-lg py-2 w-48 text-sm z-50">
                            {user ? (
                                <>
                                    <div className="px-4 py-2 border-b border-[#2D3329]/10 text-[#737373] text-xs break-all mb-1">
                                        {user.email}
                                    </div>
                                    {profile?.role === 'admin' && (
                                        <button onClick={() => { setAccountOpen(false); navigate('/admin'); }} className="block w-full text-left px-4 py-2 hover:bg-[#FDF6F3] hover:text-[#A96142]">Admin Dashboard</button>
                                    )}
                                    <button onClick={() => { setAccountOpen(false); navigate('/profile'); }} className="block w-full text-left px-4 py-2 hover:bg-[#FDF6F3] hover:text-[#A96142]">My Profile</button>
                                    <button onClick={handleSignOut} className="block w-full text-left px-4 py-2 hover:bg-[#FDF6F3] hover:text-[#A96142]">Sign Out</button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => window.dispatchEvent(new CustomEvent('open-auth-modal', { detail: { view: 'login' } }))} className="block w-full text-left px-4 py-2 hover:bg-[#FDF6F3] hover:text-[#A96142]">Sign In</button>
                                    <button onClick={() => window.dispatchEvent(new CustomEvent('open-auth-modal', { detail: { view: 'signup' } }))} className="block w-full text-left px-4 py-2 hover:bg-[#FDF6F3] hover:text-[#A96142]">Sign Up</button>
                                </>
                            )}
                        </div>
                    )}
                    <button onClick={() => navigate('/cart')} aria-label="Shopping cart" className="relative hover:text-[#A96142] transition-colors">
                        <BagIcon size={22} />
                        {cartCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-[#A96142] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{cartCount}</span>
                        )}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            {menuOpen && (
                <div className="fixed inset-0 z-50 flex md:hidden">
                    <div className="absolute inset-0 bg-black/40 transition-opacity" onClick={() => setMenuOpen(false)} />
                    <div className="relative w-64 max-w-[80%] bg-white h-full shadow-2xl flex flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
                        <div className="flex items-center justify-between p-4 border-b border-[#2D3329]/10">
                            <span className="font-cinzel text-lg tracking-widest text-[#2D3329]">MENU</span>
                            <button onClick={() => setMenuOpen(false)} className="text-[#737373] hover:text-[#A96142] p-1">
                                <CloseIcon size={24} />
                            </button>
                        </div>
                        <div className="flex flex-col py-2 overflow-y-auto">
                            {navLinks.map((link, i) => {
                                const paths = { Home: '/', Shop: '/shop', About: '#', Contact: '#' };
                                const active = isActive(link);
                                return (
                                    <a
                                        key={i}
                                        onClick={(e) => { e.preventDefault(); navigate(paths[link] || '#'); setMenuOpen(false); }}
                                        href="#"
                                        className={`px-6 py-4 font-avenir text-base transition-colors ${active ? 'text-[#A96142] font-semibold bg-[#FDF6F3]' : 'text-[#2D3329] hover:bg-[#FDF6F3] hover:text-[#A96142]'}`}
                                    >
                                        {link}
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
