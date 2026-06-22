import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../Login'; // re-use the supabase client you already have

/* =========================================================================
   WIRING INTO App.jsx / router — add once:

   import AdminLayout   from './admin/AdminLayout';
   import Dashboard     from './admin/AdminDashboard';
   import AdminOrders   from './admin/AdminOrders';      // stub for later
   import AdminProducts from './admin/AdminProducts';    // stub for later

   <Route path="/admin" element={<ProtectedAdminRoute />}>
     <Route element={<AdminLayout />}>
       <Route index       element={<Dashboard />} />
       <Route path="orders"   element={<AdminOrders />} />
       <Route path="products" element={<AdminProducts />} />
     </Route>
   </Route>

   ProtectedAdminRoute: wrap the admin tree in a component that checks
   `supabase.auth.getUser()` and redirects to '/' if the user isn't logged
   in or doesn't have an admin role in your `profiles` table.
   ========================================================================= */

/* ---------- Icons ---------- */
const I = ({ children, size = 20, className = '' }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor"
        strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        {children}
    </svg>
);

const DashIcon = (p) => <I {...p}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></I>;
const OrdersIcon = (p) => <I {...p}><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" /><rect x="9" y="3" width="6" height="4" rx="1" /><path d="M9 12h6M9 16h4" /></I>;
const ProductIcon = (p) => <I {...p}><path d="M3 9l9-6 9 6v11a1 1 0 01-1 1H4a1 1 0 01-1-1z" /><path d="M9 22V12h6v10" /></I>;
const BellIcon = (p) => <I {...p}><path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" /></I>;
const LogoutIcon = (p) => <I {...p}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /></I>;
const MenuIcon = (p) => <I {...p}><path d="M3 12h18M3 6h18M3 18h18" /></I>;
const CloseIcon = (p) => <I {...p}><path d="M18 6L6 18M6 6l12 12" /></I>;
const ChevronIcon = (p) => <I {...p}><path d="M9 18l6-6-6-6" /></I>;

/* ---------- Route → readable title map ---------- */
const PAGE_TITLES = {
    '/admin': 'Dashboard',
    '/admin/orders': 'Orders',
    '/admin/products': 'Products',
};

/* ---------- Sidebar nav items ---------- */
const NAV = [
    { label: 'Dashboard', to: '/admin', icon: DashIcon, exact: true },
    { label: 'Orders', to: '/admin/orders', icon: OrdersIcon },
    { label: 'Products', to: '/admin/products', icon: ProductIcon },
];

/* ---------- Sidebar ---------- */
function Sidebar({ open, onClose }) {
    const navigate = useNavigate();

    async function handleLogout() {
        await supabase.auth.signOut();
        navigate('/');
    }

    return (
        <>
            {/* Mobile backdrop */}
            {open && (
                <div
                    className="fixed inset-0 z-30 bg-black/40 lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside className={`
        fixed top-0 left-0 h-full z-40 flex flex-col
        w-60 bg-[#2D3329] text-white
        transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
                {/* Logo block */}
                <div className="flex items-center justify-between px-6 py-6 border-b border-white/10">
                    <div>
                        <p className="font-avenir text-xs tracking-widest text-white/50 uppercase mb-0.5">Mother's Love</p>
                        <p className="font-poppins text-base font-light tracking-wide text-white">Admin Panel</p>
                    </div>
                    <button onClick={onClose} className="lg:hidden text-white/60 hover:text-white">
                        <CloseIcon size={18} />
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
                    {NAV.map(({ label, to, icon: Icon, exact }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={exact}
                            onClick={onClose}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 font-avenir text-sm font-light transition-colors rounded-sm group ${isActive
                                    ? 'bg-[#A96142] text-white'
                                    : 'text-white/60 hover:text-white hover:bg-white/5'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <Icon size={18} className={isActive ? 'text-white' : 'text-white/50 group-hover:text-white'} />
                                    {label}
                                    <ChevronIcon size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Logout */}
                <div className="px-3 pb-6 border-t border-white/10 pt-4">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 font-avenir text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors rounded-sm"
                    >
                        <LogoutIcon size={18} />
                        Log out
                    </button>
                </div>
            </aside>
        </>
    );
}

/* ---------- Topbar ---------- */
function Topbar({ onMenuOpen }) {
    const location = useLocation();
    const pageTitle = PAGE_TITLES[location.pathname] ?? 'Admin';
    const [notifications] = useState(3); // replace with real count

    return (
        <header className="h-16 bg-white border-b border-[#2D3329]/8 flex items-center px-6 gap-4 sticky top-0 z-20">
            {/* Hamburger (mobile only) */}
            <button
                onClick={onMenuOpen}
                className="lg:hidden text-[#2D3329] hover:text-[#A96142] transition-colors"
                aria-label="Open menu"
            >
                <MenuIcon size={22} />
            </button>

            {/* Page title */}
            <h1 className="font-poppins text-lg font-light text-[#2D3329] flex-1 tracking-wide">
                {pageTitle}
            </h1>

            {/* Right actions */}
            <div className="flex items-center gap-4">
                <button aria-label="Notifications" className="relative text-[#737373] hover:text-[#2D3329] transition-colors">
                    <BellIcon size={20} />
                    {notifications > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 bg-[#A96142] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-avenir">
                            {notifications}
                        </span>
                    )}
                </button>

                <div className="flex items-center gap-2 pl-4 border-l border-[#2D3329]/15">
                    <div className="w-8 h-8 rounded-full bg-[#A96142] flex items-center justify-center text-white text-xs font-avenir font-light select-none">
                        ML
                    </div>
                    <span className="hidden sm:block font-avenir text-sm text-[#2D3329]">Owner</span>
                </div>
            </div>
        </header>
    );
}

/* ---------- Layout shell ---------- */
export default function AdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-[#F8F7F5] overflow-hidden font-avenir">
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <Topbar onMenuOpen={() => setSidebarOpen(true)} />

                {/* Page content */}
                <main className="flex-1 overflow-y-auto">
                    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}