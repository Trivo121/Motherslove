import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../Login'; // re-use your existing client

/* =========================================================================
   SUPABASE WIRING (replace mock data with real fetches)

   Dashboard stats → pull from your `orders` and `products` tables:

   const { data: orders } = await supabase
     .from('orders')
     .select('id, status, total, created_at')
     .order('created_at', { ascending: false })
     .limit(5);

   const { count: todayCount } = await supabase
     .from('orders')
     .select('id', { count: 'exact' })
     .gte('created_at', new Date().toISOString().slice(0, 10));

   const { data: products } = await supabase
     .from('products')
     .select('id, name, stock')
     .lt('stock', 5); // low-stock threshold

   Until your tables are set up, the page renders with mock data below.
   ========================================================================= */

/* ---------- Icons ---------- */
const I = ({ children, size = 20, className = '' }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor"
        strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        {children}
    </svg>
);
const BagIcon = (p) => <I {...p}><path d="M6 7h12l1 13H5L6 7z" /><path d="M9 7a3 3 0 016 0" /></I>;
const ClockIcon = (p) => <I {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></I>;
const RupeeIcon = (p) => <I {...p}><path d="M6 3h12M6 8h12M15 13l-6 8M9 8a4 4 0 010 5h6" /></I>;
const BoxIcon = (p) => <I {...p}><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /><path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" /></I>;
const PlusIcon = (p) => <I {...p}><path d="M12 5v14M5 12h14" /></I>;
const ArrowIcon = (p) => <I {...p}><path d="M5 12h14M12 5l7 7-7 7" /></I>;
const AlertIcon = (p) => <I {...p}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><path d="M12 9v4M12 17h.01" /></I>;
const TrendUpIcon = (p) => <I {...p}><path d="M23 6l-9.5 9.5-5-5L1 18" /><path d="M17 6h6v6" /></I>;
const TrendDnIcon = (p) => <I {...p}><path d="M23 18l-9.5-9.5-5 5L1 6" /><path d="M17 18h6v-6" /></I>;

/* ---------- Mock data (swap with Supabase fetches above) ---------- */
const MOCK_STATS = {
    todayOrders: 12,
    todayDelta: '+4 from yesterday',
    trendUp: true,
    pendingOrders: 5,
    pendingDelta: '2 need urgent action',
    revenue: '₹48,320',
    revenueDelta: '+₹6,200 this week',
    revenueUp: true,
    totalProducts: 6,
    lowStockCount: 2,
};

const MOCK_ORDERS = [
    { id: '#ORD-1021', customer: 'Meera S.', product: 'Polo Collar Tee', amount: '₹720', status: 'Pending', date: 'Today, 10:14 AM' },
    { id: '#ORD-1020', customer: 'Rahul K.', product: 'Striped Boatneck Tee × 2', amount: '₹1,360', status: 'Processing', date: 'Today, 9:02 AM' },
    { id: '#ORD-1019', customer: 'Ananya R.', product: 'Organic Cotton Tee', amount: '₹650', status: 'Shipped', date: 'Yesterday' },
    { id: '#ORD-1018', customer: 'Dev M.', product: 'Relaxed Jersey Tee', amount: '₹600', status: 'Delivered', date: 'Jun 20' },
    { id: '#ORD-1017', customer: 'Priya T.', product: 'Classic Crew Neck Tee × 3', amount: '₹1,650', status: 'Delivered', date: 'Jun 19' },
];

const MOCK_LOW_STOCK = [
    { name: 'Polo Collar Tee', color: 'White', stock: 2 },
    { name: 'Striped Boatneck Tee', color: 'Navy', stock: 4 },
];

/* ---------- Status badge ---------- */
const STATUS_STYLES = {
    Pending: 'bg-amber-50   text-amber-700   border border-amber-200',
    Processing: 'bg-blue-50    text-blue-700    border border-blue-200',
    Shipped: 'bg-[#FDF6F3]  text-[#A96142]  border border-[#A96142]/25',
    Delivered: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
};

function StatusBadge({ status }) {
    return (
        <span className={`inline-block px-2.5 py-0.5 font-avenir text-xs rounded-sm ${STATUS_STYLES[status] ?? ''}`}>
            {status}
        </span>
    );
}

/* ---------- Stat card ---------- */
function StatCard({ icon: Icon, label, value, delta, trendUp, accent }) {
    return (
        <div className="bg-white border border-[#2D3329]/8 p-6 flex flex-col gap-4 hover:border-[#A96142]/40 transition-colors group relative overflow-hidden">
            {/* Terracotta left accent on hover */}
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#A96142] opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="flex items-start justify-between">
                <div className={`w-10 h-10 flex items-center justify-center ${accent ?? 'bg-[#FDF6F3]'}`}>
                    <Icon size={20} className="text-[#A96142]" />
                </div>
                {trendUp !== undefined && (
                    trendUp
                        ? <TrendUpIcon size={16} className="text-emerald-500 mt-1" />
                        : <TrendDnIcon size={16} className="text-red-400 mt-1" />
                )}
            </div>

            <div>
                <p className="font-avenir text-xs text-[#737373] uppercase tracking-wider mb-1">{label}</p>
                <p className="font-poppins text-3xl font-light text-[#2D3329]">{value}</p>
                {delta && <p className="font-avenir text-xs text-[#737373] mt-1">{delta}</p>}
            </div>
        </div>
    );
}

/* ---------- Quick action button ---------- */
function QuickAction({ icon: Icon, label, onClick }) {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-3 px-5 py-3 border border-[#A96142] text-[#A96142] font-avenir text-sm hover:bg-[#A96142] hover:text-white transition-colors group"
        >
            <Icon size={16} />
            {label}
            <ArrowIcon size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
    );
}

/* ---------- Section shell ---------- */
function Section({ title, children, action }) {
    return (
        <div className="bg-white border border-[#2D3329]/8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#2D3329]/8">
                <h2 className="font-avenir text-sm uppercase tracking-widest text-[#2D3329]">{title}</h2>
                {action}
            </div>
            {children}
        </div>
    );
}

/* ---------- Dashboard ---------- */
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState(MOCK_STATS);
    const [orders, setOrders] = useState(MOCK_ORDERS);
    const [lowStock, setLowStock] = useState(MOCK_LOW_STOCK);

    useEffect(() => {
        async function fetchProducts() {
            try {
                const res = await fetch(`${API_URL}/products`);
                if (res.ok) {
                    const data = await res.json();

                    setStats(prev => ({
                        ...prev,
                        totalProducts: data.length,
                        lowStockCount: data.filter(p => p.stock < 5).length
                    }));

                    const mappedLowStock = data.filter(p => p.stock < 5).map(p => ({
                        name: p.name,
                        color: p.category || 'Standard',
                        stock: p.stock
                    }));
                    setLowStock(mappedLowStock);
                }
            } catch (err) {
                console.error("Failed to fetch products:", err);
            }
        }
        fetchProducts();
    }, []);

    /* Swap for real fetch:
    useEffect(() => {
      async function load() {
        const { data } = await supabase.from('orders')
          .select('id, status, total, created_at, customer_name, product_name')
          .order('created_at', { ascending: false }).limit(5);
        setOrders(data ?? []);
      }
      load();
    }, []); */

    const today = new Date().toLocaleDateString('en-IN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

    return (
        <div className="space-y-8">

            {/* Greeting */}
            <div>
                <p className="font-avenir text-xs text-[#737373] uppercase tracking-widest mb-1">{today}</p>
                <h2 className="font-poppins text-2xl font-light text-[#2D3329]">Hello, Sunnu M4....</h2>
            </div>

            {/* Stat grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard
                    icon={BagIcon}
                    label="Orders today"
                    value={stats.todayOrders}
                    delta={stats.todayDelta}
                    trendUp={stats.trendUp}
                />
                <StatCard
                    icon={ClockIcon}
                    label="Pending orders"
                    value={stats.pendingOrders}
                    delta={stats.pendingDelta}
                    trendUp={false}
                />
                <StatCard
                    icon={BoxIcon}
                    label="Total products"
                    value={stats.totalProducts}
                    delta={`${stats.lowStockCount} low in stock`}
                />
            </div>

            {/* Quick actions */}
            <div className="flex flex-wrap gap-3">
                <QuickAction icon={PlusIcon} label="Add new product" onClick={() => navigate('/admin/products')} />
                <QuickAction icon={BagIcon} label="View all orders" onClick={() => navigate('/admin/orders')} />
            </div>

            {/* Two-col: recent orders + low stock */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* Recent orders (wider) */}
                <div className="xl:col-span-2">
                    <Section
                        title="Recent Orders"
                        action={
                            <button
                                onClick={() => navigate('/admin/orders')}
                                className="font-avenir text-xs text-[#A96142] hover:underline underline-offset-2 flex items-center gap-1"
                            >
                                View all <ArrowIcon size={12} />
                            </button>
                        }
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm font-avenir">
                                <thead>
                                    <tr className="border-b border-[#2D3329]/8">
                                        {['Order', 'Customer', 'Product', 'Amount', 'Status', 'Date'].map((h) => (
                                            <th key={h} className="px-6 py-3 text-left font-light text-xs text-[#737373] uppercase tracking-wider whitespace-nowrap">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((o, i) => (
                                        <tr
                                            key={o.id}
                                            onClick={() => navigate(`/admin/orders/${o.id.replace('#', '')}`)}
                                            className="border-b border-[#2D3329]/5 hover:bg-[#FDF6F3] cursor-pointer transition-colors"
                                        >
                                            <td className="px-6 py-4 text-[#A96142] font-light whitespace-nowrap">{o.id}</td>
                                            <td className="px-6 py-4 text-[#2D3329] whitespace-nowrap">{o.customer}</td>
                                            <td className="px-6 py-4 text-[#737373] max-w-[160px] truncate">{o.product}</td>
                                            <td className="px-6 py-4 text-[#2D3329] whitespace-nowrap">{o.amount}</td>
                                            <td className="px-6 py-4"><StatusBadge status={o.status} /></td>
                                            <td className="px-6 py-4 text-[#737373] whitespace-nowrap text-xs">{o.date}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Section>
                </div>

                {/* Low stock alerts (narrower) */}
                <div>
                    <Section
                        title="Low Stock"
                        action={
                            <span className="flex items-center gap-1 text-amber-600 text-xs font-avenir">
                                <AlertIcon size={12} /> {lowStock.length} items
                            </span>
                        }
                    >
                        <div className="p-4 space-y-3">
                            {lowStock.length === 0 && (
                                <p className="font-avenir text-sm text-[#737373] py-4 text-center">All products are well stocked.</p>
                            )}
                            {lowStock.map((item) => (
                                <div key={item.name} className="flex items-center justify-between p-3 bg-amber-50 border border-amber-100">
                                    <div>
                                        <p className="font-avenir text-sm text-[#2D3329]">{item.name}</p>
                                        <p className="font-avenir text-xs text-[#737373]">{item.color}</p>
                                    </div>
                                    <span className="font-poppins text-lg font-light text-amber-600">{item.stock}</span>
                                </div>
                            ))}
                        </div>

                        {/* Thin divider */}
                        <div className="mx-4 border-t border-[#2D3329]/8 pt-4 pb-4 px-4">
                            <p className="font-avenir text-xs text-[#737373]">
                                Restock threshold: <span className="text-[#2D3329]">≤ 5 units</span>
                            </p>
                        </div>
                    </Section>
                </div>

            </div>
        </div>
    );
}