import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { STATUS_STEPS, STATUS_CONFIG } from './orderData';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

/* ---------- Icons ---------- */
const I = ({ children, size = 18, className = '' }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor"
        strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        {children}
    </svg>
);
const SearchIcon = (p) => <I {...p}><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></I>;
const ChevronIcon = (p) => <I {...p}><path d="M9 18l6-6-6-6" /></I>;
const EmptyIcon = (p) => <I {...p}><path d="M6 7h12l1 13H5L6 7z" /><path d="M9 7a3 3 0 016 0" /><path d="M10 12h4" /></I>;
const XIcon = (p) => <I {...p}><path d="M18 6L6 18M6 6l12 12" /></I>;

/* ---------- Helpers ---------- */
function orderTotal(order) {
    return order.total_amount;
}

function fmtAmount(n) {
    return `₹${n.toLocaleString('en-IN')}`;
}

function fmtDate(iso) {
    return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function itemSummary(order) {
    if (!order.items || order.items.length === 0) return 'No items';
    const total = order.items.reduce((s, i) => s + i.quantity, 0);
    const first = order.items[0].product ? order.items[0].product.name : 'Product';
    return total <= 1 ? first : `${first} + ${total - 1} more`;
}

/* ---------- Status badge ---------- */
function StatusBadge({ status }) {
    const c = STATUS_CONFIG[status] ?? {};
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-avenir border rounded-sm ${c.bg} ${c.text} ${c.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
            {status}
        </span>
    );
}

/* ---------- Status tabs ---------- */
function Tabs({ orders, active, onChange }) {
    const all = ['All', ...STATUS_STEPS];
    return (
        <div className="flex gap-1 overflow-x-auto pb-px scrollbar-hide">
            {all.map((s) => {
                const count = s === 'All' ? orders.length : orders.filter((o) => o.status === s).length;
                const isActive = active === s;
                return (
                    <button
                        key={s}
                        onClick={() => onChange(s)}
                        className={`flex items-center gap-2 px-4 py-2.5 text-xs font-avenir whitespace-nowrap border-b-2 transition-colors ${isActive
                                ? 'border-[#A96142] text-[#A96142]'
                                : 'border-transparent text-[#737373] hover:text-[#2D3329]'
                            }`}
                    >
                        {s}
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${isActive ? 'bg-[#A96142] text-white' : 'bg-[#2D3329]/10 text-[#2D3329]'}`}>
                            {count}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}

/* ---------- Desktop table row ---------- */
function TableRow({ order, onClick }) {
    return (
        <tr
            onClick={onClick}
            className="border-b border-[#2D3329]/5 hover:bg-[#FDF6F3] cursor-pointer transition-colors group"
        >
            <td className="px-6 py-4">
                <span className="font-avenir text-sm text-[#A96142] group-hover:underline underline-offset-2">
                    #{order.id.split('-')[0].toUpperCase()}
                </span>
            </td>
            <td className="px-6 py-4">
                <p className="font-avenir text-sm text-[#2D3329]">{order.shipping_name}</p>
                <p className="font-avenir text-xs text-[#737373]">{order.shipping_email}</p>
            </td>
            <td className="px-6 py-4 font-avenir text-sm text-[#737373] whitespace-nowrap">{fmtDate(order.created_at)}</td>
            <td className="px-6 py-4 font-avenir text-sm text-[#2D3329] max-w-[180px] truncate">{itemSummary(order)}</td>
            <td className="px-6 py-4 font-avenir text-sm text-[#2D3329] whitespace-nowrap">{fmtAmount(orderTotal(order))}</td>
            <td className="px-6 py-4"><StatusBadge status={order.status} /></td>
            <td className="px-6 py-4">
                <ChevronIcon size={16} className="text-[#737373] group-hover:text-[#A96142] transition-colors" />
            </td>
        </tr>
    );
}

/* ---------- Mobile card ---------- */
function OrderCard({ order, onClick }) {
    return (
        <div
            onClick={onClick}
            className="bg-white border border-[#2D3329]/8 p-4 cursor-pointer hover:border-[#A96142]/40 transition-colors group"
        >
            <div className="flex items-start justify-between mb-3">
                <div>
                    <p className="font-avenir text-sm text-[#A96142]">#{order.id.split('-')[0].toUpperCase()}</p>
                    <p className="font-avenir text-base text-[#2D3329]">{order.shipping_name}</p>
                </div>
                <StatusBadge status={order.status} />
            </div>
            <div className="flex items-end justify-between">
                <div>
                    <p className="font-avenir text-xs text-[#737373]">{itemSummary(order)}</p>
                    <p className="font-avenir text-xs text-[#737373] mt-0.5">{fmtDate(order.created_at)}</p>
                </div>
                <div className="flex items-center gap-1">
                    <p className="font-poppins text-lg font-light text-[#2D3329]">{fmtAmount(orderTotal(order))}</p>
                    <ChevronIcon size={16} className="text-[#737373] group-hover:text-[#A96142] transition-colors" />
                </div>
            </div>
        </div>
    );
}

/* ---------- Page ---------- */
export default function AdminOrders() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState('All');
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        async function fetchOrders() {
            try {
                const res = await fetch(`${API_URL}/orders`);
                if (res.ok) {
                    const data = await res.json();
                    setOrders(data);
                }
            } catch (err) {
                console.error("Failed to fetch orders:", err);
            }
        }
        fetchOrders();
    }, []);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return orders.filter((o) => {
            const matchTab = activeTab === 'All' || o.status === activeTab;
            const matchSearch = !q || o.id.toLowerCase().includes(q) || o.shipping_name.toLowerCase().includes(q);
            return matchTab && matchSearch;
        });
    }, [search, activeTab, orders]);

    function goToOrder(id) { navigate(`/admin/orders/${id}`); }

    return (
        <div className="space-y-6">

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-1 max-w-sm">
                    <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737373]" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by order ID or customer…"
                        className="w-full pl-9 pr-9 py-2.5 border border-[#2D3329]/20 font-avenir text-sm text-[#2D3329] placeholder:text-[#737373] focus:outline-none focus:border-[#A96142] transition-colors"
                    />
                    {search && (
                        <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#2D3329]">
                            <XIcon size={14} />
                        </button>
                    )}
                </div>

                <p className="sm:ml-auto font-avenir text-sm text-[#737373] self-center">
                    {filtered.length} {filtered.length === 1 ? 'order' : 'orders'}
                </p>
            </div>

            {/* Main card */}
            <div className="bg-white border border-[#2D3329]/8">

                {/* Status tabs */}
                <div className="border-b border-[#2D3329]/8 px-4">
                    <Tabs orders={orders} active={activeTab} onChange={setActiveTab} />
                </div>

                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm font-avenir">
                        <thead>
                            <tr className="border-b border-[#2D3329]/8">
                                {['Order ID', 'Customer', 'Date', 'Items', 'Total', 'Status', ''].map((h) => (
                                    <th key={h} className="px-6 py-3 text-left font-light text-xs text-[#737373] uppercase tracking-wider whitespace-nowrap">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((o) => (
                                <TableRow key={o.id} order={o} onClick={() => goToOrder(o.id)} />
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile cards */}
                <div className="md:hidden divide-y divide-[#2D3329]/5">
                    {filtered.map((o) => (
                        <div key={o.id} className="p-3">
                            <OrderCard order={o} onClick={() => goToOrder(o.id)} />
                        </div>
                    ))}
                </div>

                {/* Empty state */}
                {filtered.length === 0 && (
                    <div className="py-20 flex flex-col items-center gap-3 text-[#737373]">
                        <EmptyIcon size={36} className="opacity-30" />
                        <p className="font-avenir text-sm">No orders match your search.</p>
                        <button onClick={() => { setSearch(''); setActiveTab('All'); }}
                            className="font-avenir text-xs text-[#A96142] underline underline-offset-2">
                            Clear filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}