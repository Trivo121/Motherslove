import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.PNG';

/* =========================================================================
   ROUTER — add to your App.jsx:

   import CheckoutPage from './pages/Checkout';
   <Route path="/checkout" element={<CheckoutPage />} />

   From CartPage, navigate to '/checkout' after verifying the cart isn't empty.
   ========================================================================= */

/* ─────────────────────────────────────────────────────────────────────────
   PAYTM UPI PAYMENT — INTEGRATION PLACEHOLDER
   ─────────────────────────────────────────────────────────────────────────

   Step 1 — Add the Paytm JS SDK to your /public/index.html <head>:

     Staging:
       <script src="https://securegw-stage.paytm.in/merchantpgpui/checkoutjs/merchants/{YOUR_MID}.js" />
     Production:
       <script src="https://securegw.paytm.in/merchantpgpui/checkoutjs/merchants/{YOUR_MID}.js" />

   Step 2 — Create a backend endpoint /api/create-paytm-order that:
     · Accepts  { orderId, amount, customerId }
     · Generates a Paytm transaction token using paytmchecksum
     · Returns  { txnToken, mid, orderId }

     npm install paytmchecksum (Node.js backend)

   Step 3 — Replace the TODO block inside handlePayment() below:

     const res = await fetch('/api/create-paytm-order', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
         orderId:    `ML-${Date.now()}`,
         amount:     total.toString(),
         customerId: form.email,
       }),
     });
     const { txnToken, mid, orderId } = await res.json();

     const config = {
       root: "",
       flow: "DEFAULT",
       merchant: {
         mid,
         name:     "Mother's Love",
         logo:     "https://yourdomain.com/logo.png",
         redirect: false,
       },
       transactionToken: txnToken,
       orderId,
       amount: total.toString(),
       payMode: {
         labels:          {},
         savedCardLength: 0,
         order:           ["UPI"],   // ← restricts to UPI only
       },
       userDetail: {
         mobileNumber: form.phone,
         name:         form.name,
       },
       website:     "WEBSTAGING",    // → "DEFAULT" in production
       callbackUrl: `https://securegw-stage.paytm.in/theia/paytmCallback?ORDER_ID=${orderId}`,
     };
     new window.Paytm.CheckoutJS.invoke(config);

   Step 4 — Verify the callback on your backend:
     POST /api/paytm-callback
     Use paytmchecksum to verify the response checksum.
     On success → mark order as PAID in your database.

   Docs: https://developer.paytm.com/docs/payment-gateway/web-integration/
   ─────────────────────────────────────────────────────────────────────────
*/

/* ---------- Mock cart (swap with your cart context / Supabase state) ---------- */
const MOCK_CART = [
    { id: 'P001', name: 'Classic Crew Neck Tee', color: 'Sand', size: 'M', qty: 1, price: 550, img: null },
    { id: 'P003', name: 'Striped Boatneck Tee', color: 'Navy', size: 'S', qty: 2, price: 680, img: null },
];

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

/* ---------- Nav (identical to the rest of the site) ---------- */
function Nav({ cartCount }) {
    const [accountOpen, setAccountOpen] = useState(false);
    const navigate = useNavigate();
    const navLinks = ['Home', 'Shop', 'About', 'Contact'];

    return (
        <>
            <div className="bg-[#FDF6F3] text-center py-2 text-xs md:text-sm font-avenir text-[#2D3329] tracking-wide">
                Free Delivery Over ₹{FREE_SHIPPING_THRESHOLD.toLocaleString('en-IN')}&nbsp;&nbsp;|&nbsp;&nbsp;Free Returns
            </div>
            <nav className="grid grid-cols-3 items-center gap-4 px-6 md:px-10 py-5 bg-white sticky top-0 z-40 border-b border-[#2D3329]/5">
                <div className="flex items-center gap-6">
                    <img src={logo} alt="Mother's Love" className="h-9 w-auto object-contain" />
                    <div className="hidden md:flex items-center gap-6 text-[#2D3329] text-sm font-avenir font-light">
                        {navLinks.map((link) => {
                            const paths = { Home: '/', Shop: '/shop', About: '#', Contact: '#' };
                            return (
                                <a key={link}
                                    onClick={(e) => { e.preventDefault(); navigate(paths[link] || '#'); }}
                                    href="#"
                                    className="cursor-pointer hover:text-[#A96142] transition-colors">
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
                        <span className="absolute -top-2 -right-2 bg-[#A96142] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                            {cartCount}
                        </span>
                    </button>
                </div>
            </nav>
        </>
    );
}

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
                {cart.map((item) => (
                    <div key={`${item.id}-${item.size}`} className="flex items-center gap-4 px-6 py-4">
                        {/* Thumbnail */}
                        <div className="w-16 h-16 shrink-0 bg-[#FDF6F3] flex items-center justify-center overflow-hidden relative">
                            {item.img
                                ? <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
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
                            ₹{(item.price * item.qty).toLocaleString('en-IN')}
                        </p>
                    </div>
                ))}
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
                {[
                    { Icon: ShieldIcon, text: 'SSL-encrypted, secure checkout' },
                    { Icon: TruckIcon, text: 'Estimated delivery in 3–5 days' },
                    { Icon: RefreshIcon, text: 'Free returns within 30 days' },
                ].map(({ Icon, text }) => (
                    <div key={text} className="flex items-center gap-2.5 text-[#737373]">
                        <Icon size={13} className="shrink-0" />
                        <span className="font-avenir text-xs">{text}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ---------- Page ---------- */
export default function CheckoutPage() {
    const navigate = useNavigate();

    /* — Form state — */
    const [form, setForm] = useState({
        name: '', email: '', phone: '',
        flat: '', street: '', city: '', state: '', pincode: '',
        upiId: '',
    });
    const [errors, setErrors] = useState({});
    const [placing, setPlacing] = useState(false);
    const [placed, setPlaced] = useState(false);

    /* — Calculations — */
    const subtotal = MOCK_CART.reduce((sum, item) => sum + item.price * item.qty, 0);
    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
    const total = subtotal + shipping;
    const cartCount = MOCK_CART.reduce((sum, item) => sum + item.qty, 0);

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

        /* ── TODO: Replace this block with the Paytm integration ─────────────
           (See the detailed step-by-step at the top of this file)

           const res = await fetch('/api/create-paytm-order', { ... });
           const { txnToken, mid, orderId } = await res.json();
           new window.Paytm.CheckoutJS.invoke({ ...config });
           ─────────────────────────────────────────────────────────────────── */

        // Simulated delay — remove once Paytm is wired up:
        await new Promise((r) => setTimeout(r, 1500));

        setPlacing(false);
        setPlaced(true);
    }

    /* ─── Order placed confirmation ─── */
    if (placed) {
        return (
            <div className="min-h-screen bg-[#F8F7F5] font-avenir flex flex-col">
                <Nav cartCount={cartCount} />
                <div className="flex-1 flex items-center justify-center px-6 py-24">
                    <div className="text-center space-y-6 max-w-sm">
                        <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto">
                            <CheckIcon size={26} className="text-emerald-600" />
                        </div>
                        <div>
                            <h2 className="font-poppins text-3xl font-light text-[#2D3329] mb-2">
                                Order Placed!
                            </h2>
                            <p className="font-avenir text-sm text-[#737373] leading-relaxed">
                                Thank you, {form.name.split(' ')[0] || 'there'}. A confirmation has been sent to{' '}
                                <span className="text-[#2D3329]">{form.email}</span>.
                            </p>
                        </div>
                        <div className="pt-2 border-t border-[#2D3329]/8">
                            <p className="font-avenir text-xs text-[#737373] mb-4">
                                Expected delivery in 3–5 business days.
                            </p>
                            <button
                                onClick={() => navigate('/shop')}
                                className="px-8 py-3 bg-[#A96142] text-white font-avenir text-sm hover:bg-[#8f5237] transition-colors"
                            >
                                Continue Shopping
                            </button>
                        </div>
                    </div>
                </div>
                <footer className="bg-[#2D3329] text-white px-6 md:px-10 py-10">
                    <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm font-avenir">
                        <span className="tracking-widest">MOTHER'S LOVE</span>
                        <span className="text-white/60">© 2026 Mother's Love. All rights reserved.</span>
                    </div>
                </footer>
            </div>
        );
    }

    /* ─── Main checkout layout ─── */
    return (
        <div className="min-h-screen bg-[#F8F7F5] font-avenir flex flex-col">
            <Nav cartCount={cartCount} />

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

                        {/* Step 3 — Payment (UPI via Paytm) */}
                        <FormSection step={3} title="Payment">

                            {/* UPI method card */}
                            <div className="flex items-center gap-4 p-4 bg-[#FDF6F3] border border-[#A96142]/20">
                                {/* UPI wordmark */}
                                <div className="px-3 py-2 bg-white border border-[#2D3329]/10 shrink-0">
                                    <p className="font-avenir text-[11px] font-light tracking-[0.2em] text-[#2D3329] uppercase">
                                        UPI
                                    </p>
                                </div>
                                <div className="flex-1">
                                    <p className="font-avenir text-sm text-[#2D3329]">Pay via UPI</p>
                                    <p className="font-avenir text-xs text-[#737373] mt-0.5">
                                        Powered by Paytm · GPay, PhonePe, BHIM &amp; all UPI apps accepted
                                    </p>
                                </div>
                                <div className="w-5 h-5 rounded-full border-2 border-[#A96142] flex items-center justify-center shrink-0">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#A96142]" />
                                </div>
                            </div>

                            {/* Optional UPI ID pre-fill */}
                            <InputField
                                id="upiId"
                                label="UPI ID"
                                type="text"
                                placeholder="yourname@paytm  (optional)"
                                value={form.upiId}
                                onChange={(e) => setField('upiId', e.target.value)}
                                error={errors.upiId}
                            />
                            <p className="font-avenir text-xs text-[#737373] -mt-2">
                                Enter your UPI ID above or choose any UPI app inside the Paytm checkout that opens next.
                            </p>

                            {/* Pay button */}
                            <button
                                onClick={handlePayment}
                                disabled={placing}
                                className="w-full flex items-center justify-center gap-3 py-4 bg-[#A96142] text-white font-avenir text-sm tracking-wide hover:bg-[#8f5237] transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-1"
                            >
                                <LockIcon size={15} />
                                {placing
                                    ? 'Connecting to Paytm…'
                                    : `Pay ₹${total.toLocaleString('en-IN')} via Paytm`}
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
                        cart={MOCK_CART}
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