import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/common/Navbar.jsx';

/* =========================================================================
   ROUTER — add to App.jsx:

   import OrderConfirmation from './pages/OrderConfirmation';
   <Route path="/order-confirmation" element={<OrderConfirmation />} />

   PASSING DATA FROM CHECKOUT (after Paytm callback confirms success):
     navigate('/order-confirmation', {
       state: {
         order: {
           id, date, customer: { name, email, phone },
           items: [{ name, price, color, size, qty, img }],
           note, subtotal, shipping, total,
           deliveryAddress: { name, flat, street, city, state, pincode, phone },
           billingAddress:  { name, flat, street, city, state, pincode, phone },
         }
       }
     });

   SUPABASE — alternatively, fetch by ID:
     const { data: order } = await supabase
       .from('orders')
       .select('*, order_items(*)')
       .eq('id', orderId)
       .single();
   ========================================================================= */

/* ---------- Mock order (replace with location.state or Supabase fetch) ---------- */
const MOCK_ORDER = {
    id: 'ML-10000',
    date: '25 Jun 2026',
    customer: {
        name: 'Priya Sharma',
        email: 'priya.sharma@email.com',
        phone: '+91 98765 43210',
    },
    items: [
        { name: 'Classic Crew Neck Tee', price: 550, color: 'Sand', size: 'M', qty: 1, img: null },
        { name: 'Striped Boatneck Tee', price: 680, color: 'Navy', size: 'S', qty: 1, img: null },
    ],
    note: '',
    subtotal: 1230,
    shipping: 0,
    total: 1230,
    deliveryAddress: {
        name: 'Priya Sharma',
        flat: '4B, Sunrise Apartments',
        street: 'MG Road, Indiranagar',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560038',
        phone: '+91 98765 43210',
    },
    billingAddress: {
        name: 'Priya Sharma',
        flat: '4B, Sunrise Apartments',
        street: 'MG Road, Indiranagar',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560038',
        phone: '+91 98765 43210',
    },
    estimatedDelivery: '3–5 Business Days',
    paymentMethod: 'UPI (Paytm)',
};

/* ---------- Icons ---------- */
const Icon = ({ children, size = 20, className = '' }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor"
        strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        {children}
    </svg>
);
const CheckIcon = (p) => <Icon {...p}><path d="M20 6L9 17l-5-5" /></Icon>;
const BagIcon = (p) => <Icon {...p}><path d="M6 7h12l1 13H5L6 7z" /><path d="M9 7a3 3 0 016 0" /></Icon>;
const TruckIcon = (p) => <Icon {...p}><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></Icon>;
const MailIcon = (p) => <Icon {...p}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></Icon>;
const MapPinIcon = (p) => <Icon {...p}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></Icon>;
const ClockIcon = (p) => <Icon {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></Icon>;
const PrinterIcon = (p) => <Icon {...p}><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></Icon>;

/* ---------- Page ---------- */
export default function OrderConfirmation() {
    const navigate = useNavigate();
    const location = useLocation();

    /* Read order from navigation state, fallback to mock */
    const order = location.state?.order ?? MOCK_ORDER;

    /* Staggered mount animation */
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 60);
        return () => clearTimeout(t);
    }, []);

    const firstName = order.customer.name.split(' ')[0];

    return (
        <div className="min-h-screen bg-[#F8F7F5] font-avenir flex flex-col">

            <style>{`
                @keyframes popIn {
                    0%   { transform: scale(0.4); opacity: 0; }
                    72%  { transform: scale(1.12); opacity: 1; }
                    100% { transform: scale(1); }
                }
                @keyframes riseUp {
                    0%   { transform: translateY(18px); opacity: 0; }
                    100% { transform: translateY(0);    opacity: 1; }
                }
                .anim-pop  { animation: popIn  0.52s cubic-bezier(0.34,1.56,0.64,1) both; }
                .anim-rise { animation: riseUp 0.45s ease both; }
                .delay-1   { animation-delay: 0.12s; }
                .delay-2   { animation-delay: 0.24s; }
                .delay-3   { animation-delay: 0.36s; }
                .delay-4   { animation-delay: 0.48s; }
                @media print {
                    .no-print { display: none !important; }
                    body { background: white; }
                }
            `}</style>

            <div className="no-print"><Navbar /></div>

            <div className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 md:px-10 py-10 md:py-16">

                {/* ── Success hero ── */}
                <div className={`text-center mb-10 transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}>

                    {/* Animated check */}
                    <div className="anim-pop w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mx-auto mb-6">
                        <CheckIcon size={28} className="text-emerald-600" />
                    </div>

                    {/* Heading */}
                    <h1 className="anim-rise delay-1 font-poppins text-3xl md:text-4xl font-light text-[#2D3329] mb-3">
                        Thank you, {firstName}!
                    </h1>

                    {/* Confirmation line */}
                    <p className="anim-rise delay-2 font-avenir text-sm text-[#737373] mb-1">
                        You'll receive a confirmation email at{' '}
                        <span className="text-[#2D3329]">{order.customer.email}</span>
                    </p>

                    {/* Order meta */}
                    <div className="anim-rise delay-3 flex flex-wrap items-center justify-center gap-2 mt-3 font-avenir text-xs text-[#737373]">
                        <span>
                            Order number:{' '}
                            <span className="text-[#A96142] font-light">{order.id}</span>
                        </span>
                        <span className="text-[#2D3329]/20 hidden sm:inline">·</span>
                        <span>{order.date}</span>
                        <span className="text-[#2D3329]/20 hidden sm:inline">·</span>
                        <span>{order.paymentMethod}</span>
                    </div>

                    {/* Divider */}
                    <div className="anim-rise delay-4 h-px max-w-sm mx-auto mt-8 bg-gradient-to-r from-transparent via-[#2D3329]/15 to-transparent" />
                </div>

                {/* ── Order summary card ── */}
                <div className={`bg-white border border-[#2D3329]/8 transition-all duration-700 delay-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                    style={{ transitionProperty: 'opacity, transform' }}>

                    {/* Card header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-[#2D3329]/8">
                        <h2 className="font-avenir text-xs uppercase tracking-widest text-[#2D3329]">
                            Order Summary
                        </h2>
                        <span className="font-avenir text-xs text-[#737373]">
                            {order.items.reduce((s, i) => s + i.qty, 0)}{' '}
                            {order.items.reduce((s, i) => s + i.qty, 0) === 1 ? 'item' : 'items'}
                        </span>
                    </div>

                    {/* Items */}
                    <div className="divide-y divide-[#2D3329]/5">
                        {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-start gap-4 px-6 py-5">

                                {/* Thumbnail */}
                                <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 bg-[#FDF6F3] flex items-center justify-center overflow-hidden">
                                    {item.img
                                        ? <img src={item.img} alt={item.name} className="w-full h-full object-contain" />
                                        : <span className="font-poppins text-2xl font-light text-[#A96142]/30 select-none">
                                            {item.name.charAt(0)}
                                        </span>
                                    }
                                </div>

                                {/* Details */}
                                <div className="flex-1 min-w-0">
                                    <p className="font-avenir text-sm text-[#2D3329] leading-snug truncate">
                                        {item.name}
                                    </p>
                                    <p className="font-avenir text-sm text-[#A96142] mt-1">
                                        ₹{item.price.toLocaleString('en-IN')}
                                    </p>
                                    <div className="mt-1.5 space-y-0.5">
                                        <p className="font-avenir text-xs text-[#737373]">
                                            Colour: {item.color}
                                        </p>
                                        <p className="font-avenir text-xs text-[#737373]">
                                            Size: {item.size}
                                        </p>
                                    </div>
                                </div>

                                {/* Qty */}
                                <div className="shrink-0 text-right">
                                    <p className="font-avenir text-xs text-[#737373] uppercase tracking-wider">Qty</p>
                                    <p className="font-avenir text-sm text-[#2D3329] mt-0.5">{item.qty}</p>
                                    <p className="font-avenir text-sm text-[#2D3329] mt-1">
                                        ₹{(item.price * item.qty).toLocaleString('en-IN')}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Note + Pricing — side by side on md, stacked on mobile */}
                    <div className="border-t border-[#2D3329]/8 grid grid-cols-1 md:grid-cols-2">

                        {/* Note */}
                        <div className="px-6 py-5 border-b border-[#2D3329]/8 md:border-b-0 md:border-r md:border-[#2D3329]/8">
                            <p className="font-avenir text-xs uppercase tracking-wider text-[#737373] mb-2">Note</p>
                            <p className="font-avenir text-sm text-[#737373]/60 italic leading-relaxed">
                                {order.note || 'No note added.'}
                            </p>
                        </div>

                        {/* Pricing */}
                        <div className="px-6 py-5 space-y-2.5">
                            <div className="flex justify-between font-avenir text-sm text-[#737373]">
                                <span>Subtotal</span>
                                <span>₹{order.subtotal.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between font-avenir text-sm text-[#737373]">
                                <span>Delivery</span>
                                <span className={order.shipping === 0 ? 'text-emerald-600' : ''}>
                                    {order.shipping === 0 ? 'Free' : `₹${order.shipping}`}
                                </span>
                            </div>
                            <div className="pt-3 border-t border-[#2D3329]/8 flex justify-between items-baseline">
                                <span className="font-poppins text-base font-light text-[#2D3329]">Total:</span>
                                <span className="font-poppins text-xl font-light text-[#A96142]">
                                    ₹{order.total.toLocaleString('en-IN')}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── What happens next ── */}
                <div className={`mt-4 bg-white border border-[#2D3329]/8 px-6 py-5 transition-all duration-700 delay-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                    style={{ transitionProperty: 'opacity, transform' }}>
                    <p className="font-avenir text-xs uppercase tracking-widest text-[#2D3329] mb-4">What's Next</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            { Icon: MailIcon, label: 'Confirmation email', sub: 'Check your inbox for your order receipt' },
                            {
                                Icon: TruckIcon, label: 'Shipping update', sub: "We'll email you a tracking link when it ships" },
                            { Icon: ClockIcon, label: order.estimatedDelivery, sub: 'Estimated time from dispatch date' },
                        ].map(({ Icon, label, sub }) => (
                                    <div key={label} className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-[#FDF6F3] flex items-center justify-center shrink-0 mt-0.5">
                                            <Icon size={15} className="text-[#A96142]" />
                                        </div>
                                        <div>
                                            <p className="font-avenir text-sm text-[#2D3329]">{label}</p>
                                            <p className="font-avenir text-xs text-[#737373] mt-0.5 leading-relaxed">{sub}</p>
                                        </div>
                                    </div>
                                ))}
                    </div>
                </div>

                {/* ── Delivery + Billing addresses ── */}
                <div className={`mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 transition-all duration-700 delay-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                    style={{ transitionProperty: 'opacity, transform' }}>

                    {/* Delivery address */}
                    <div className="bg-white border border-[#2D3329]/8 px-6 py-5">
                        <div className="flex items-center gap-2 mb-4">
                            <MapPinIcon size={14} className="text-[#A96142] shrink-0" />
                            <p className="font-avenir text-xs uppercase tracking-widest text-[#2D3329]">
                                Delivery Address
                            </p>
                        </div>
                        <div className="font-avenir text-sm text-[#2D3329] space-y-0.5 leading-relaxed">
                            <p>{order.deliveryAddress.name}</p>
                            <p className="text-[#737373]">{order.deliveryAddress.flat}</p>
                            <p className="text-[#737373]">{order.deliveryAddress.street}</p>
                            <p className="text-[#737373]">
                                {order.deliveryAddress.city}, {order.deliveryAddress.state}
                            </p>
                            <p className="text-[#737373]">{order.deliveryAddress.pincode}</p>
                            <p className="text-[#737373] mt-1">{order.deliveryAddress.phone}</p>
                        </div>
                        <div className="mt-4 pt-4 border-t border-[#2D3329]/8 flex items-center gap-1.5">
                            <TruckIcon size={13} className="text-[#A96142] shrink-0" />
                            <span className="font-avenir text-xs text-[#A96142]">
                                {order.estimatedDelivery}
                            </span>
                        </div>
                    </div>

                    {/* Billing address */}
                    <div className="bg-white border border-[#2D3329]/8 px-6 py-5">
                        <div className="flex items-center gap-2 mb-4">
                            <MapPinIcon size={14} className="text-[#737373] shrink-0" />
                            <p className="font-avenir text-xs uppercase tracking-widest text-[#2D3329]">
                                Billing Address
                            </p>
                        </div>
                        <div className="font-avenir text-sm text-[#2D3329] space-y-0.5 leading-relaxed">
                            <p>{order.billingAddress.name}</p>
                            <p className="text-[#737373]">{order.billingAddress.flat}</p>
                            <p className="text-[#737373]">{order.billingAddress.street}</p>
                            <p className="text-[#737373]">
                                {order.billingAddress.city}, {order.billingAddress.state}
                            </p>
                            <p className="text-[#737373]">{order.billingAddress.pincode}</p>
                            <p className="text-[#737373] mt-1">{order.billingAddress.phone}</p>
                        </div>
                        <div className="mt-4 pt-4 border-t border-[#2D3329]/8">
                            <span className="font-avenir text-xs text-[#737373]">
                                Payment via {order.paymentMethod}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── Action buttons ── */}
                <div className={`mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 transition-all duration-700 delay-700 ${visible ? 'opacity-100' : 'opacity-0'}`}>
                    <button
                        onClick={() => navigate('/shop')}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-[#A96142] text-white font-avenir text-sm hover:bg-[#8f5237] transition-colors"
                    >
                        <BagIcon size={16} />
                        Continue Shopping
                    </button>
                    <button
                        onClick={() => navigate('/profile', { state: { tab: 'orders' } })}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 border border-[#2D3329]/20 text-[#737373] font-avenir text-sm hover:text-[#2D3329] hover:border-[#2D3329]/40 transition-colors"
                    >
                        View Order History
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="no-print w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 border border-[#2D3329]/20 text-[#737373] font-avenir text-sm hover:text-[#2D3329] hover:border-[#2D3329]/40 transition-colors"
                        title="Print or save as PDF"
                    >
                        <PrinterIcon size={15} />
                        Print
                    </button>
                </div>

                {/* ── Footer note ── */}
                <p className={`mt-8 text-center font-avenir text-xs text-[#737373]/60 transition-opacity duration-700 delay-700 ${visible ? 'opacity-100' : 'opacity-0'}`}>
                    Questions? Email us at{' '}
                    <a href="mailto:hello@motherslove.in" className="text-[#A96142] hover:underline underline-offset-2">
                        hello@motherslove.in
                    </a>
                </p>
            </div>

            {/* Footer */}
            <footer className="bg-[#2D3329] text-white px-6 md:px-10 py-10 mt-8 no-print">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm font-avenir">
                    <span className="tracking-widest">MOTHER'S LOVE</span>
                    <span className="text-white/60">© 2026 Mother's Love. All rights reserved.</span>
                </div>
            </footer>
        </div>
    );
}