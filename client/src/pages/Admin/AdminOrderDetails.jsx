import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ORDERS, STATUS_STEPS, STATUS_FLOW, STATUS_CONFIG } from './orderData';

/* ---------- Icons ---------- */
const I = ({ children, size = 18, className = '' }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor"
        strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        {children}
    </svg>
);
const ArrowLIcon = (p) => <I {...p}><path d="M19 12H5M12 19l-7-7 7-7" /></I>;
const ChevLIcon = (p) => <I {...p}><path d="M15 18l-6-6 6-6" /></I>;
const ChevRIcon = (p) => <I {...p}><path d="M9 18l6-6-6-6" /></I>;
const CheckIcon = (p) => <I {...p}><path d="M20 6L9 17l-5-5" /></I>;
const UserIcon = (p) => <I {...p}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></I>;
const MailIcon = (p) => <I {...p}><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M2 8l10 7 10-7" /></I>;
const PhoneIcon = (p) => <I {...p}><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" /></I>;
const PinIcon = (p) => <I {...p}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></I>;
const AlertIcon = (p) => <I {...p}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><path d="M12 9v4M12 17h.01" /></I>;

/* ---------- Helpers ---------- */
function orderTotal(order) {
    return order.items.reduce((s, i) => s + i.price * i.qty, 0);
}
function fmt(n) { return `₹${n.toLocaleString('en-IN')}`; }
function fmtDate(iso, opts = {}) {
    return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric', ...opts });
}
function fmtTime(iso) {
    return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

/* ---------- Status badge ---------- */
function StatusBadge({ status, large }) {
    const c = STATUS_CONFIG[status] ?? {};
    return (
        <span className={`inline-flex items-center gap-1.5 border rounded-sm font-avenir ${large ? 'px-3 py-1.5 text-sm' : 'px-2.5 py-1 text-xs'} ${c.bg} ${c.text} ${c.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
            {status}
        </span>
    );
}

/* ---------- Status timeline ---------- */
function StatusTimeline({ currentStatus }) {
    const currentIdx = STATUS_STEPS.indexOf(currentStatus);
    return (
        <div className="overflow-x-auto pb-2">
            <div className="flex items-start min-w-[520px]">
                {STATUS_STEPS.map((step, i) => {
                    const done = i < currentIdx;
                    const current = i === currentIdx;
                    return (
                        <React.Fragment key={step}>
                            <div className="flex flex-col items-center flex-shrink-0 w-24">
                                {/* Circle */}
                                <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors ${done ? 'bg-[#A96142] border-[#A96142]' :
                                        current ? 'bg-white border-[#A96142]' :
                                            'bg-white border-[#2D3329]/20'
                                    }`}>
                                    {done && <CheckIcon size={12} className="text-white" />}
                                    {current && <div className="w-2.5 h-2.5 rounded-full bg-[#A96142]" />}
                                </div>
                                {/* Label */}
                                <p className={`font-avenir text-[11px] text-center mt-2 leading-tight ${current ? 'text-[#A96142] font-medium' :
                                        done ? 'text-[#2D3329]' : 'text-[#737373]'
                                    }`}>{step}</p>
                            </div>
                            {/* Connector */}
                            {i < STATUS_STEPS.length - 1 && (
                                <div className={`flex-1 h-px mt-3.5 mx-1 transition-colors ${done ? 'bg-[#A96142]' : 'bg-[#2D3329]/15'}`} />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
}

/* ---------- Confirmation modal ---------- */
function ConfirmModal({ nextStatus, orderId, onConfirm, onCancel }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D3329]/50"
            onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
            <div className="bg-white w-full max-w-sm p-8 shadow-xl">
                <div className="w-10 h-10 bg-amber-50 flex items-center justify-center mb-5">
                    <AlertIcon size={20} className="text-amber-600" />
                </div>
                <h3 className="font-poppins text-xl font-light text-[#2D3329] mb-2">Confirm status update</h3>
                <p className="font-avenir text-sm text-[#737373] mb-8">
                    You're about to mark order <span className="text-[#2D3329] font-medium">#{orderId}</span> as{' '}
                    <span className="text-[#A96142]">{nextStatus}</span>. This action cannot be undone automatically.
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 border border-[#2D3329]/25 font-avenir text-sm text-[#2D3329] py-2.5 hover:border-[#2D3329]/50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 bg-[#A96142] border border-[#A96142] font-avenir text-sm text-white py-2.5 hover:bg-white hover:text-[#A96142] transition-colors"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ---------- Success toast ---------- */
function Toast({ message, onDone }) {
    useEffect(() => {
        const t = setTimeout(onDone, 3000);
        return () => clearTimeout(t);
    }, [onDone]);
    return (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#2D3329] text-white px-5 py-3 shadow-lg animate-slide-in-right">
            <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckIcon size={11} className="text-white" />
            </div>
            <p className="font-avenir text-sm">{message}</p>
        </div>
    );
}

/* ---------- Info row (customer detail) ---------- */
function InfoRow({ icon: Icon, label, value }) {
    return (
        <div className="flex items-start gap-3">
            <Icon size={16} className="text-[#A96142] mt-0.5 flex-shrink-0" />
            <div>
                <p className="font-avenir text-xs text-[#737373]">{label}</p>
                <p className="font-avenir text-sm text-[#2D3329]">{value}</p>
            </div>
        </div>
    );
}

/* ---------- Section card ---------- */
function Card({ title, children }) {
    return (
        <div className="bg-white border border-[#2D3329]/8">
            <div className="px-6 py-4 border-b border-[#2D3329]/8">
                <h2 className="font-avenir text-xs uppercase tracking-widest text-[#2D3329]">{title}</h2>
            </div>
            <div className="p-6">{children}</div>
        </div>
    );
}

/* ---------- Page ---------- */
export default function AdminOrderDetail() {
    const { orderId } = useParams();
    const navigate = useNavigate();

    const order = ORDERS.find((o) => o.id === orderId);
    const orderIdx = ORDERS.findIndex((o) => o.id === orderId);

    /* Local status state — replace setState with a Supabase update later:
       await supabase.from('orders').update({ status: next }).eq('id', orderId);  */
    const [status, setStatus] = useState(order?.status ?? 'Confirmed');
    const [showConfirm, setShowConfirm] = useState(false);
    const [toast, setToast] = useState('');

    if (!order) {
        return (
            <div className="py-24 text-center">
                <p className="font-poppins text-2xl font-light text-[#2D3329] mb-2">Order not found</p>
                <button onClick={() => navigate('/admin/orders')} className="font-avenir text-sm text-[#A96142] underline underline-offset-2">
                    ← Back to orders
                </button>
            </div>
        );
    }

    const nextStatus = STATUS_FLOW[status];
    const subtotal = orderTotal(order);
    const shipping = subtotal >= 999 ? 0 : 99;
    const total = subtotal + shipping;

    const prevOrder = ORDERS[orderIdx - 1];
    const nextOrder = ORDERS[orderIdx + 1];

    function handleConfirmStatus() {
        setStatus(nextStatus);
        setShowConfirm(false);
        setToast(`Status updated to "${nextStatus}"`);
    }

    return (
        <>
            <div className="space-y-6">

                {/* Breadcrumb + prev/next */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <button onClick={() => navigate('/admin/orders')}
                        className="flex items-center gap-2 font-avenir text-sm text-[#737373] hover:text-[#2D3329] transition-colors">
                        <ArrowLIcon size={16} /> All Orders
                    </button>
                    <div className="flex items-center gap-1 font-avenir text-xs text-[#737373]">
                        <button
                            disabled={!prevOrder}
                            onClick={() => navigate(`/admin/orders/${prevOrder?.id}`)}
                            className="flex items-center gap-1 px-3 py-1.5 border border-[#2D3329]/15 hover:border-[#2D3329]/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevLIcon size={14} /> Prev
                        </button>
                        <button
                            disabled={!nextOrder}
                            onClick={() => navigate(`/admin/orders/${nextOrder?.id}`)}
                            className="flex items-center gap-1 px-3 py-1.5 border border-[#2D3329]/15 hover:border-[#2D3329]/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            Next <ChevRIcon size={14} />
                        </button>
                    </div>
                </div>

                {/* Order header */}
                <div className="bg-white border border-[#2D3329]/8 px-6 py-5 flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <p className="font-avenir text-xs text-[#737373] uppercase tracking-widest mb-1">Order</p>
                        <h1 className="font-poppins text-2xl font-light text-[#2D3329]">#{order.id}</h1>
                        <p className="font-avenir text-xs text-[#737373] mt-1">
                            {fmtDate(order.date)} at {fmtTime(order.date)}
                        </p>
                    </div>
                    <StatusBadge status={status} large />
                </div>

                {/* Status timeline */}
                <Card title="Order Progress">
                    <StatusTimeline currentStatus={status} />
                </Card>

                {/* Two-column: customer + status update */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                    {/* Customer details (wider) */}
                    <div className="lg:col-span-3">
                        <Card title="Customer Details">
                            <div className="space-y-4">
                                <InfoRow icon={UserIcon} label="Name" value={order.customer.name} />
                                <InfoRow icon={MailIcon} label="Email" value={order.customer.email} />
                                <InfoRow icon={PhoneIcon} label="Phone" value={order.customer.phone} />
                                <div className="border-t border-[#2D3329]/8 pt-4">
                                    <div className="flex items-start gap-3">
                                        <PinIcon size={16} className="text-[#A96142] mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="font-avenir text-xs text-[#737373] mb-1">Shipping Address</p>
                                            <p className="font-avenir text-sm text-[#2D3329] leading-relaxed">
                                                {order.customer.address.line1}
                                                {order.customer.address.line2 && <><br />{order.customer.address.line2}</>}
                                                <br />
                                                {order.customer.address.city}, {order.customer.address.state} — {order.customer.address.pin}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Status update (narrower) */}
                    <div className="lg:col-span-2">
                        <Card title="Update Status">
                            <div className="space-y-4">
                                <div>
                                    <p className="font-avenir text-xs text-[#737373] mb-2">Current status</p>
                                    <StatusBadge status={status} large />
                                </div>

                                {nextStatus ? (
                                    <div className="pt-2">
                                        <p className="font-avenir text-xs text-[#737373] mb-3">Next step</p>
                                        <button
                                            onClick={() => setShowConfirm(true)}
                                            className="w-full flex items-center justify-center gap-2 bg-[#A96142] border border-[#A96142] text-white font-avenir text-sm py-3 hover:bg-white hover:text-[#A96142] transition-colors group"
                                        >
                                            <CheckIcon size={15} />
                                            Mark as {nextStatus}
                                        </button>
                                        <p className="font-avenir text-xs text-[#737373] mt-3 leading-relaxed">
                                            Only the next step is available to prevent accidental jumps in the order lifecycle.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="pt-2 text-center py-6">
                                        <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-2">
                                            <CheckIcon size={18} className="text-emerald-600" />
                                        </div>
                                        <p className="font-avenir text-sm text-[#2D3329]">Order complete</p>
                                        <p className="font-avenir text-xs text-[#737373] mt-1">This order has been delivered.</p>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Items ordered */}
                <Card title="Items Ordered">
                    <div className="overflow-x-auto">
                        <table className="w-full font-avenir text-sm">
                            <thead>
                                <tr className="border-b border-[#2D3329]/8">
                                    {['Product', 'Size', 'Colour', 'Qty', 'Unit Price', 'Line Total'].map((h) => (
                                        <th key={h} className="pb-3 text-left font-light text-xs text-[#737373] uppercase tracking-wider pr-6 whitespace-nowrap">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {order.items.map((item, i) => (
                                    <tr key={i} className="border-b border-[#2D3329]/5 last:border-0">
                                        {/* Product */}
                                        <td className="py-4 pr-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-14 bg-[#FDF6F3] flex-shrink-0 overflow-hidden">
                                                    <img src={item.img} alt={item.name}
                                                        className="w-full h-full object-contain" />
                                                </div>
                                                <p className="text-[#2D3329]">{item.name}</p>
                                            </div>
                                        </td>
                                        {/* Size */}
                                        <td className="py-4 pr-6">
                                            <span className="inline-block border border-[#2D3329]/25 px-2.5 py-0.5 text-xs text-[#2D3329] font-medium">
                                                {item.size}
                                            </span>
                                        </td>
                                        {/* Colour */}
                                        <td className="py-4 pr-6 text-[#737373]">{item.color}</td>
                                        {/* Qty */}
                                        <td className="py-4 pr-6 text-[#2D3329]">× {item.qty}</td>
                                        {/* Unit price */}
                                        <td className="py-4 pr-6 text-[#2D3329]">{fmt(item.price)}</td>
                                        {/* Line total */}
                                        <td className="py-4 text-[#2D3329] font-medium">{fmt(item.price * item.qty)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals */}
                    <div className="mt-6 border-t border-[#2D3329]/8 pt-4 flex justify-end">
                        <div className="w-full max-w-xs space-y-2">
                            <div className="flex justify-between font-avenir text-sm">
                                <span className="text-[#737373]">Subtotal</span>
                                <span className="text-[#2D3329]">{fmt(subtotal)}</span>
                            </div>
                            <div className="flex justify-between font-avenir text-sm">
                                <span className="text-[#737373]">Shipping</span>
                                <span className={shipping === 0 ? 'text-emerald-600' : 'text-[#2D3329]'}>
                                    {shipping === 0 ? 'Free' : fmt(shipping)}
                                </span>
                            </div>
                            <div className="flex justify-between font-avenir text-base border-t border-[#2D3329]/8 pt-2 mt-2">
                                <span className="text-[#2D3329] font-medium">Total</span>
                                <span className="font-poppins text-lg font-light text-[#A96142]">{fmt(total)}</span>
                            </div>
                        </div>
                    </div>
                </Card>

            </div>

            {/* Confirmation modal */}
            {showConfirm && (
                <ConfirmModal
                    nextStatus={nextStatus}
                    orderId={order.id}
                    onConfirm={handleConfirmStatus}
                    onCancel={() => setShowConfirm(false)}
                />
            )}

            {/* Success toast */}
            {toast && <Toast message={toast} onDone={() => setToast('')} />}
        </>
    );
}