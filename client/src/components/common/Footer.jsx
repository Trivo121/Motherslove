import React from 'react';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
    const navigate = useNavigate();

    return (
        <footer className="bg-[#2D3329] text-[#737373] pt-16 pb-8 px-6 md:px-10 border-t border-white/5">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-10 max-w-6xl mx-auto mb-12">
                <div>
                    <h3 className="font-cinzel text-xl tracking-widest mb-3 text-[#E3DDD6]">MOTHER'S LOVE</h3>
                    <p className="font-avenir font-light text-sm text-[#737373] leading-relaxed">Mindfully crafted essentials for a more<br/>sustainable wardrobe.</p>
                </div>
                <div>
                    <h4 className="font-avenir text-xs tracking-widest uppercase mb-4 text-[#737373]/60">Shop</h4>
                    <ul className="space-y-2 font-avenir font-light text-sm">
                        <li><button onClick={() => navigate('/shop')} className="hover:text-[#E3DDD6] transition-colors cursor-pointer text-[#737373]">Unique Prints</button></li>
                        <li><button onClick={() => navigate('/shop')} className="hover:text-[#E3DDD6] transition-colors cursor-pointer text-[#737373]">Official Prints</button></li>
                        <li><button onClick={() => navigate('/shop')} className="hover:text-[#E3DDD6] transition-colors cursor-pointer text-[#737373]">New Arrivals</button></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-avenir text-xs tracking-widest uppercase mb-4 text-[#737373]/60">Help</h4>
                    <ul className="space-y-2 font-avenir font-light text-sm">
                        <li><a href="#" className="hover:text-[#A96142] transition-colors text-[#737373]">Shipping &amp; Returns</a></li>
                        <li><a href="#" className="hover:text-[#A96142] transition-colors text-[#737373]">Contact Us</a></li>
                        <li><a href="#" className="hover:text-[#A96142] transition-colors text-[#737373]">FAQ</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-avenir text-xs tracking-widest uppercase mb-4 text-[#737373]/60">Follow</h4>
                    <ul className="space-y-2 font-avenir font-light text-sm">
                        <li><a href="#" className="hover:text-[#A96142] transition-colors text-[#737373]">Instagram</a></li>
                        <li><a href="#" className="hover:text-[#A96142] transition-colors text-[#737373]">Pinterest</a></li>
                    </ul>
                </div>
            </div>
            <div className="border-t border-[#737373]/10 pt-6 text-center font-avenir font-light text-xs text-[#737373]/60">
                © 2026 Mother's Love. All rights reserved.
            </div>
        </footer>
    );
};

export default Footer;
