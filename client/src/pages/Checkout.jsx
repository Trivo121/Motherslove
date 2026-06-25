import React, { useState } from 'react';
import { useCart } from '../context/CartContext.jsx';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.PNG';
import Navbar from '../components/common/Navbar.jsx';

/* =========================================================================
   ROUTER — add to your App.jsx:

   import CheckoutPage from './pages/Checkout';
   <Route path="/checkout" element={<CheckoutPage />} />

   From CartPage, navigate to '/checkout' after verifying the cart isn't empty.
   ========================================================================= */





const FREE_SHIPPING_THRESHOLD = 999;
const SHIPPING_COST = 99;

/* ---------- Indian states ---------- */
const INDIAN_STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh',
    'Jammu & Kashmir', 'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh',
    'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim',
    'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand',
    'West Bengal',
];

/* ---------- Icons ---------- */
const Icon = ({ children, size = 20, className = '' }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor"
        strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        {children}
    </svg>
);
const ChevronIcon = (p) => <Icon {...p}><path d="M6 9l6 6 6-6" /></Icon>;
const BagIcon = (p) => <Icon {...p}><path d="M6 7h12l1 13H5L6 7z" /><path d="M9 7a3 3 0 016 0" /></Icon>;
const ArrowLeftIcon = (p) => <Icon {...p}><path d="M19 12H5M12 19l-7-7 7-7" /></Icon>;
const LockIcon = (p) => <Icon {...p}><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></Icon>;
const CheckIcon = (p) => <Icon {...p}><path d="M20 6L9 17l-5-5" /></Icon>;
const ShieldIcon = (p) => <Icon {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></Icon>;
const TruckIcon = (p) => <Icon {...p}><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></Icon>;
const RefreshIcon = (p) => <Icon {...p}><path d="M23 4v6h-6M1 20v-6h6" /><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" /></Icon>;



/* ---------- Reusable form components ---------- */
function InputField({ label, required, error, id, ...props }) {
    return (
        <div className="space-y-1.5">
            <label htmlFor={id} className="block font-avenir text-xs uppercase tracking-wider text-[#737373]">
                {label}{required && <span className="text-[#A96142] ml-0.5">*</span>}
            </label>
            <input
                id={id}
                className={`w-full px-4 py-3 border font-avenir text-sm text-[#2D3329] placeholder:text-[#737373]/40 focus:outline-none transition-colors bg-white ${error
                    ? 'border-red-400 focus:border-red-400'
                    : 'border-[#2D3329]/20 focus:border-[#A96142]'
                    }`}
                {...props}
            />
            {error && <p className="font-avenir text-xs text-red-500">{error}</p>}
        </div>
    );
}

function SelectField({ label, required, error, id, children, ...props }) {
    return (
        <div className="space-y-1.5">
            <label htmlFor={id} className="block font-avenir text-xs uppercase tracking-wider text-[#737373]">
                {label}{required && <span className="text-[#A96142] ml-0.5">*</span>}
            </label>
            <div className="relative">
                <select
                    id={id}
                    className={`w-full px-4 py-3 pr-10 border font-avenir text-sm text-[#2D3329] focus:outline-none transition-colors bg-white appearance-none ${error ? 'border-red-400' : 'border-[#2D3329]/20 focus:border-[#A96142]'
                        }`}
                    {...props}
                >
                    {children}
                </select>
                <ChevronIcon size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737373] pointer-events-none" />
            </div>
            {error && <p className="font-avenir text-xs text-red-500">{error}</p>}
        </div>
    );
}

/* ---------- Numbered form section ---------- */
function FormSection({ step, title, children }) {
    return (
        <div className="bg-white border border-[#2D3329]/8">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-[#2D3329]/8">
                <span className="w-6 h-6 flex items-center justify-center bg-[#A96142] text-white font-avenir text-xs shrink-0">
                    {step}
                </span>
                <h2 className="font-avenir text-sm uppercase tracking-widest text-[#2D3329]">{title}</h2>
            </div>
            <div className="px-6 py-6 space-y-5">
                {children}
            </div>
        </div>
    );
}

/* ---------- Order summary panel ---------- */
function OrderSummary({ cart, total, subtotal, shipping }) {
    return (
        <div className="bg-white border border-[#2D3329]/8 lg:sticky lg:top-24 self-start">

            {/* Header */}
            <div className="px-6 py-4 border-b border-[#2D3329]/8">
                <h2 className="font-avenir text-sm uppercase tracking-widest text-[#2D3329]">
                    Order Summary
                </h2>
            </div>

            {/* Items */}
            <div className="divide-y divide-[#2D3329]/5">
                {cart.map((item) => {
                    let priceNum = typeof item.price === 'string' ? parseFloat(item.price.replace(/[^0-9.]/g, '')) || 0 : item.price || 0;
                    return (
                    <div key={`${item.id}-${item.size}`} className="flex items-center gap-4 px-6 py-4">
                        {/* Thumbnail */}
                        <div className="w-16 h-16 shrink-0 bg-[#FDF6F3] flex items-center justify-center overflow-hidden relative">
                            {item.img
                                ? <img src={item.img} alt={item.name} className="w-full h-full object-contain" />
                                : <span className="font-poppins text-2xl font-light text-[#A96142]/30 select-none">
                                    {item.name.charAt(0)}
                                </span>
                            }
                            {/* Qty badge */}
                            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#2D3329] text-white text-[10px] font-avenir rounded-full flex items-center justify-center">
                                {item.qty}
                            </span>
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                            <p className="font-avenir text-sm text-[#2D3329] truncate leading-snug">
                                {item.name}
                            </p>
                            <p className="font-avenir text-xs text-[#737373] mt-0.5">
                                {item.color} · Size {item.size}
                            </p>
                        </div>

                        {/* Line total */}
                        <p className="font-avenir text-sm text-[#2D3329] shrink-0">
                            ₹{(priceNum * item.qty).toLocaleString('en-IN')}
                        </p>
                    </div>
                )})}
            </div>

            {/* Totals */}
            <div className="px-6 py-5 border-t border-[#2D3329]/8 space-y-2.5">
                <div className="flex justify-between font-avenir text-sm text-[#737373]">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-avenir text-sm text-[#737373]">
                    <span>Shipping</span>
                    <span className={shipping === 0 ? 'text-emerald-600' : ''}>
                        {shipping === 0 ? 'Free' : `₹${shipping}`}
                    </span>
                </div>
                {shipping === 0 && (
                    <p className="font-avenir text-xs text-emerald-600/80">
                        ✓ You've qualified for free delivery
                    </p>
                )}
                <div className="pt-3 border-t border-[#2D3329]/8 flex justify-between">
                    <span className="font-poppins text-base font-light text-[#2D3329]">Total</span>
                    <span className="font-poppins text-lg font-light text-[#A96142]">
                        ₹{total.toLocaleString('en-IN')}
                    </span>
                </div>
            </div>

            {/* Trust signals */}
            <div className="px-6 pb-5 space-y-2 border-t border-[#2D3329]/8 pt-4">
                <div className="flex items-center gap-2.5 text-[#737373]">
                    <TruckIcon size={13} className="shrink-0" />
                    <span className="font-avenir text-xs">Estimated Delivery in 5-7 days</span>
                </div>
            </div>
        </div>
    );
}

/* ---------- Page ---------- */
export default function CheckoutPage() {
    const navigate = useNavigate();
    const { cartItems, clearCart } = useCart();

    /* — Form state — */
    const [form, setForm] = useState({
        name: '', email: '', phone: '',
        flat: '', street: '', city: '', state: '', pincode: '',
        
    });
    const [errors, setErrors] = useState({});
    const [placing, setPlacing] = useState(false);
    const [placed, setPlaced] = useState(false);

    /* — Calculations — */
    const subtotal = cartItems.reduce((sum, item) => {
        let priceNum = typeof item.price === 'string' ? parseFloat(item.price.replace(/[^0-9.]/g, '')) || 0 : item.price || 0;
        return sum + (priceNum * item.qty);
    }, 0);
    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_COST;
    const total = subtotal + shipping;
    const cartCount = cartItems.reduce((sum, item) => sum + item.qty, 0);

    function setField(key, value) {
        setForm((prev) => ({ ...prev, [key]: value }));
        if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
    }

    function validate() {
        const errs = {};
        if (!form.name.trim())
            errs.name = 'Full name is required.';
        if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))
            errs.email = 'Enter a valid email address.';
        if (!form.phone.trim() || !/^[6-9]\d{9}$/.test(form.phone.replace(/\s/g, '')))
            errs.phone = 'Enter a valid 10-digit mobile number.';
        if (!form.flat.trim())
            errs.flat = 'House / flat number is required.';
        if (!form.street.trim())
            errs.street = 'Street or area is required.';
        if (!form.city.trim())
            errs.city = 'City is required.';
        if (!form.state)
            errs.state = 'Please select a state.';
        if (!form.pincode.trim() || !/^\d{6}$/.test(form.pincode))
            errs.pincode = 'Enter a valid 6-digit pincode.';
        return errs;
    }

    async function handlePayment() {
        const errs = validate();
        if (Object.keys(errs).length) {
            setErrors(errs);
            const firstId = Object.keys(errs)[0];
            document.getElementById(firstId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        setPlacing(true);

        try {
            const payload = {
                shipping_name: form.name,
                shipping_email: form.email,
                shipping_phone: form.phone,
                shipping_flat: form.flat,
                shipping_street: form.street,
                shipping_city: form.city,
                shipping_state: form.state,
                shipping_pincode: form.pincode,
                items: cartItems.map(item => ({
                    product_id: item.id,
                    quantity: item.qty,
                    size: item.size,
                    color: item.color
                }))
            };

            const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
            const res = await fetch(`${API_URL}/orders/checkout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errorData = await res.json();
                let errMsg = errorData.detail || 'Failed to validate order';
                if (Array.isArray(errMsg)) {
                    errMsg = errMsg.map(e => `${e.loc.join('.')}: ${e.msg}`).join(', ');
                }
                throw new Error(errMsg);
            }

            const orderData = await res.json();
            
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: total * 100, // paise
                currency: "INR",
                name: "Mother's Love",
                description: "Purchase from Mother's Love",
                order_id: orderData.razorpay_order_id,
                handler: async function (response) {
                    try {
                        const verifyRes = await fetch(`${API_URL}/orders/verify-payment`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                order_id: orderData.id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_signature: response.razorpay_signature
                            })
                        });

                        if (!verifyRes.ok) {
                            throw new Error("Payment verification failed");
                        }
                        
                        const orderState = {
                            id: orderData.id,
                            date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                            customer: {
                                name: form.name,
                                email: form.email,
                                phone: form.phone
                            },
                            items: cartItems.map(item => ({
                                name: item.name,
                                price: item.price,
                                color: item.color,
                                size: item.size,
                                qty: item.qty,
                                img: item.img
                            })),
                            note: '',
                            subtotal: subtotal,
                            shipping: shipping,
                            total: total,
                            deliveryAddress: {
                                name: form.name,
                                flat: form.flat,
                                street: form.street,
                                city: form.city,
                                state: form.state,
                                pincode: form.pincode,
                                phone: form.phone
                            },
                            billingAddress: {
                                name: form.name,
                                flat: form.flat,
                                street: form.street,
                                city: form.city,
                                state: form.state,
                                pincode: form.pincode,
                                phone: form.phone
                            },
                            estimatedDelivery: '3–5 Business Days',
                            paymentMethod: 'Razorpay'
                        };
                        clearCart();
                        navigate('/order-confirmation', { state: { order: orderState } });
                    } catch (err) {
                        alert("Payment verification error: " + err.message);
                    } finally {
                        setPlacing(false);
                    }
                },
                prefill: {
                    name: form.name,
                    email: form.email,
                    contact: form.phone
                },
                theme: {
                    color: "#A96142"
                },
                modal: {
                    ondismiss: function() {
                        setPlacing(false);
                    }
                }
            };
            
            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response){
                alert("Payment Failed: " + response.error.description);
                setPlacing(false);
            });
            rzp.open();
            
            // We don't setPlacing(false) here because the modal is open.
            // It will be set in ondismiss or handler.
            return;
        } catch (err) {
            console.error(err);
            alert("Checkout Error: " + err.message);
        } finally {
            setPlacing(false);
        }
    }

    /* ─── Main checkout layout ─── */
    return (
        <div className="min-h-screen bg-[#F8F7F5] font-avenir flex flex-col">
            <Navbar cartCount={cartCount} />

            <div className="flex-1 max-w-6xl mx-auto w-full px-6 md:px-10 py-10">

                {/* Breadcrumb + back */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2 font-avenir text-xs text-[#737373]">
                        <button onClick={() => navigate('/cart')} className="hover:text-[#A96142] transition-colors">
                            Cart
                        </button>
                        <span>/</span>
                        <span className="text-[#A96142]">Checkout</span>
                    </div>
                    <button
                        onClick={() => navigate('/cart')}
                        className="flex items-center gap-1.5 text-sm text-[#737373] hover:text-[#2D3329] transition-colors"
                    >
                        <ArrowLeftIcon size={14} />
                        Back to Cart
                    </button>
                </div>

                <h1 className="font-poppins text-3xl md:text-4xl font-light text-[#2D3329] mb-8">
                    Checkout
                </h1>

                {/* Two-column grid */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 lg:gap-8 items-start">

                    {/* ──────────── LEFT: Form sections ──────────── */}
                    <div className="space-y-4 min-w-0">

                        {/* Step 1 — Contact */}
                        <FormSection step={1} title="Contact Information">
                            <InputField
                                id="name"
                                label="Full Name"
                                required
                                type="text"
                                placeholder="e.g. Priya Sharma"
                                autoComplete="name"
                                value={form.name}
                                onChange={(e) => setField('name', e.target.value)}
                                error={errors.name}
                            />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InputField
                                    id="email"
                                    label="Email Address"
                                    required
                                    type="email"
                                    placeholder="you@example.com"
                                    autoComplete="email"
                                    value={form.email}
                                    onChange={(e) => setField('email', e.target.value)}
                                    error={errors.email}
                                />
                                <InputField
                                    id="phone"
                                    label="Phone Number"
                                    required
                                    type="tel"
                                    placeholder="10-digit mobile number"
                                    autoComplete="tel"
                                    maxLength={10}
                                    value={form.phone}
                                    onChange={(e) => setField('phone', e.target.value.replace(/\D/g, ''))}
                                    error={errors.phone}
                                />
                            </div>
                        </FormSection>

                        {/* Step 2 — Delivery Address */}
                        <FormSection step={2} title="Delivery Address">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InputField
                                    id="flat"
                                    label="House / Flat No."
                                    required
                                    type="text"
                                    placeholder="e.g. 4B, Sunrise Apartments"
                                    autoComplete="address-line1"
                                    value={form.flat}
                                    onChange={(e) => setField('flat', e.target.value)}
                                    error={errors.flat}
                                />
                                <InputField
                                    id="street"
                                    label="Street / Area"
                                    required
                                    type="text"
                                    placeholder="e.g. MG Road, Indiranagar"
                                    autoComplete="address-line2"
                                    value={form.street}
                                    onChange={(e) => setField('street', e.target.value)}
                                    error={errors.street}
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <InputField
                                    id="city"
                                    label="City"
                                    required
                                    type="text"
                                    placeholder="e.g. Bengaluru"
                                    autoComplete="address-level2"
                                    value={form.city}
                                    onChange={(e) => setField('city', e.target.value)}
                                    error={errors.city}
                                />
                                <SelectField
                                    id="state"
                                    label="State"
                                    required
                                    value={form.state}
                                    onChange={(e) => setField('state', e.target.value)}
                                    error={errors.state}
                                >
                                    <option value="">Select State</option>
                                    {INDIAN_STATES.map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </SelectField>
                                <InputField
                                    id="pincode"
                                    label="Pincode"
                                    required
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="6-digit pincode"
                                    maxLength={6}
                                    autoComplete="postal-code"
                                    value={form.pincode}
                                    onChange={(e) => setField('pincode', e.target.value.replace(/\D/g, ''))}
                                    error={errors.pincode}
                                />
                            </div>
                        </FormSection>

                        {/* Step 3 — Payment */}
                        <FormSection step={3} title="Payment">

                            <div className="flex items-center gap-4 p-4 bg-[#FDF6F3] border border-[#A96142]/20 mb-4">
                                <div className="flex-1">
                                    <p className="font-avenir text-sm text-[#2D3329]">Secure Checkout via Razorpay</p>
                                    <p className="font-avenir text-xs text-[#737373] mt-0.5">
                                        Cards, UPI, Netbanking & Wallets accepted
                                    </p>
                                </div>
                                <div className="w-5 h-5 rounded-full border-2 border-[#A96142] flex items-center justify-center shrink-0">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#A96142]" />
                                </div>
                            </div>

                            {/* Pay button */}
                            <button
                                onClick={handlePayment}
                                disabled={placing}
                                className="w-full flex items-center justify-center gap-3 py-4 bg-[#A96142] text-white font-avenir text-sm tracking-wide hover:bg-[#8f5237] transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-1"
                            >
                                <LockIcon size={15} />
                                {placing
                                    ? 'Initializing Payment…'
                                    : `Pay ₹${total.toLocaleString('en-IN')}`}
                            </button>

                            {/* Security note */}
                            <p className="flex items-center justify-center gap-2 font-avenir text-xs text-[#737373]/60">
                                <LockIcon size={11} />
                                256-bit SSL encrypted · Secured by Paytm
                            </p>
                        </FormSection>
                    </div>

                    {/* ──────────── RIGHT: Order summary ──────────── */}
                    <OrderSummary
                        cart={cartItems}
                        subtotal={subtotal}
                        shipping={shipping}
                        total={total}
                    />
                </div>
            </div>

            <footer className="bg-[#2D3329] text-white px-6 md:px-10 py-10 mt-10">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm font-avenir">
                    <span className="tracking-widest">MOTHER'S LOVE</span>
                    <span className="text-white/60">© 2026 Mother's Love. All rights reserved.</span>
                </div>
            </footer>
        </div>
    );
}