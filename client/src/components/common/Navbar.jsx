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

export default function Navbar({ cartCount = 0 }) {
    const [accountOpen, setAccountOpen] = useState(false);
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

    return (
        <nav className="grid grid-cols-3 items-center gap-4 px-6 md:px-10 py-5 bg-white sticky top-0 z-40 border-b border-[#2D3329]/5">
            <div className="flex items-center gap-6">
                <img src={logo} alt="Mother's Love" className="h-9 w-auto object-contain cursor-pointer" onClick={() => navigate('/')} />
                <div className="hidden md:flex items-center gap-6 text-[#2D3329] text-sm font-avenir font-light">
                    {navLinks.map((link, i) => {
                        const paths = { Home: '/', Shop: '/shop', About: '#', Contact: '#' };
                        return (
                            <a 
                                key={i} 
                                onClick={(e) => { e.preventDefault(); navigate(paths[link] || '#'); }} 
                                href="#" 
                                className={`cursor-pointer hover:text-[#A96142] transition-colors`}
                            >
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
                    {user ? `Hi, ${displayName}` : 'Account'}
                    <ChevronIcon size={14} className={`transition-transform ${accountOpen ? 'rotate-180' : ''}`} />
                </button>
                {accountOpen && (
                    <div className="absolute top-8 right-14 bg-white border border-[#2D3329]/10 shadow-lg py-2 w-40 text-sm z-50">
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
                    <BagIcon size={20} />
                    {cartCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-[#A96142] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{cartCount}</span>
                    )}
                </button>
            </div>
        </nav>
    );
}
