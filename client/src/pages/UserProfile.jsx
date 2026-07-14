import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { supabase } from './Login.jsx';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

/* =========================================================================
   ROUTER — add to App.jsx:

   import UserProfile from './pages/UserProfile';
   <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />

   SUPABASE WIRING:

   On mount, load real user data:
     const { data: { user } } = await supabase.auth.getUser();
     const { data: profile }  = await supabase.from('profiles')
       .select('*').eq('id', user.id).single();
     const { data: addresses } = await supabase.from('addresses')
       .select('*').eq('user_id', user.id).order('is_default', { ascending: false });
     const { data: orders }   = await supabase.from('orders')
       .select('*, order_items(*)').eq('user_id', user.id)
       .order('created_at', { ascending: false });

   On profile save:
     await supabase.from('profiles').update({ name, phone }).eq('id', user.id);

   On address save:
     await supabase.from('addresses').insert({ user_id: user.id, ...addrForm });
   On address update:
     await supabase.from('addresses').update({ ...addrForm }).eq('id', editingAddrId);
   On address delete:
     await supabase.from('addresses').delete().eq('id', id);

   Sign out:
     await supabase.auth.signOut(); navigate('/');
   ========================================================================= */

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
const UserIcon = (p) => <Icon {...p}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></Icon>;
const MapPinIcon = (p) => <Icon {...p}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></Icon>;
const PackageIcon = (p) => <Icon {...p}><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></Icon>;
const EditIcon = (p) => <Icon {...p}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></Icon>;
const TrashIcon = (p) => <Icon {...p}><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" /></Icon>;
const PlusIcon = (p) => <Icon {...p}><path d="M12 5v14M5 12h14" /></Icon>;
const CheckIcon = (p) => <Icon {...p}><path d="M20 6L9 17l-5-5" /></Icon>;
const ChevronIcon = (p) => <Icon {...p}><path d="M6 9l6 6 6-6" /></Icon>;
const ChevronRightIcon = (p) => <Icon {...p}><path d="M9 18l6-6-6-6" /></Icon>;
const LogOutIcon = (p) => <Icon {...p}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /></Icon>;
const ChatIcon = (p) => <Icon {...p}><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" /></Icon>;

/* ---------- Helpers ---------- */
function getInitials(name) {
    return name.trim().split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

/* ---------- Status badge (consistent with admin + checkout) ---------- */
const STATUS_STYLES = {
    Pending: 'bg-amber-50 text-amber-700 border border-amber-200',
    Processing: 'bg-blue-50 text-blue-700 border border-blue-200',
    Shipped: 'bg-[#FDF6F3] text-[#A96142] border border-[#A96142]/25',
    Delivered: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    Cancelled: 'bg-red-50 text-red-600 border border-red-200',
};
function StatusBadge({ status }) {
    return (
        <span className={`inline-block px-2.5 py-0.5 font-avenir text-xs ${STATUS_STYLES[status] ?? 'bg-[#F8F7F5] text-[#737373]'}`}>
            {status}
        </span>
    );
}

/* ---------- Reusable form inputs ---------- */
function InputField({ label, required, error, ...props }) {
    return (
        <div className="space-y-1.5">
            <label className="block font-avenir text-xs uppercase tracking-wider text-[#737373]">
                {label}{required && <span className="text-[#A96142] ml-0.5">*</span>}
            </label>
            <input
                className={`w-full px-4 py-3 border font-avenir text-sm text-[#2D3329] placeholder:text-[#737373]/40 focus:outline-none transition-colors bg-white ${error ? 'border-red-400 focus:border-red-400' : 'border-[#2D3329]/20 focus:border-[#A96142]'
                    }`}
                {...props}
            />
            {error && <p className="font-avenir text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
}

function SelectField({ label, required, error, children, ...props }) {
    return (
        <div className="space-y-1.5">
            <label className="block font-avenir text-xs uppercase tracking-wider text-[#737373]">
                {label}{required && <span className="text-[#A96142] ml-0.5">*</span>}
            </label>
            <div className="relative">
                <select
                    className={`w-full px-4 py-3 pr-10 border font-avenir text-sm text-[#2D3329] focus:outline-none transition-colors bg-white appearance-none ${error ? 'border-red-400' : 'border-[#2D3329]/20 focus:border-[#A96142]'
                        }`}
                    {...props}
                >
                    {children}
                </select>
                <ChevronIcon size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737373] pointer-events-none" />
            </div>
            {error && <p className="font-avenir text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
}

/* ---------- Static info row (view mode) ---------- */
function InfoRow({ label, value }) {
    return (
        <div className="space-y-0.5 py-4 border-b border-[#2D3329]/8 last:border-b-0 last:pb-0 first:pt-0">
            <p className="font-avenir text-xs uppercase tracking-wider text-[#737373]">{label}</p>
            <p className="font-avenir text-sm text-[#2D3329]">{value || '—'}</p>
        </div>
    );
}

/* ══════════════ PAGE ══════════════ */
export default function UserProfile() {
    const navigate = useNavigate();
    const { user, profile: authProfile, signOut } = useAuth();

    const [chatOpen, setChatOpen] = useState(false);
    const [chatMessage, setChatMessage] = useState('');
    const [messages, setMessages] = useState([
        { sender: 'bot', text: 'Hi! Let us know if you have any questions about our sustainable collections.' }
    ]);
    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!chatMessage.trim()) return;
        const userMsg = { sender: 'user', text: chatMessage };
        setMessages(prev => [...prev, userMsg]);
        setChatMessage('');
        setTimeout(() => {
            setMessages(prev => [...prev, {
                sender: 'bot',
                text: "Thanks for checking in! Our customer love team will text you back within 5 minutes."
            }]);
        }, 1000);
    };

    /* ─── Tab state ─── */
    const [activeTab, setActiveTab] = useState('profile');
    const [loadingData, setLoadingData] = useState(true);

    /* ─── Profile state ─── */
    const [savedProfile, setSavedProfile] = useState({ name: '', phone: '' });
    const [profileForm, setProfileForm] = useState({ name: '', phone: '' });
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileSaved, setProfileSaved] = useState(false);

    /* ─── Address state ─── */
    const [addresses, setAddresses] = useState([]);
    const [showAddrForm, setShowAddrForm] = useState(false);
    const [editingAddrId, setEditingAddrId] = useState(null);
    const EMPTY_ADDR = { label: 'Home', flat: '', street: '', city: '', state: '', pincode: '', is_default: false };
    const [addrForm, setAddrForm] = useState(EMPTY_ADDR);
    const [addrErrors, setAddrErrors] = useState({});

    /* ─── Orders state ─── */
    const [orders, setOrders] = useState([]);

    const TABS = [
        { key: 'profile', label: 'My Profile', Icon: UserIcon },
        { key: 'addresses', label: 'Addresses', Icon: MapPinIcon },
        { key: 'orders', label: 'Order History', Icon: PackageIcon },
    ];
    
    useEffect(() => {
        if (!user) return;
        
        async function fetchData() {
            setLoadingData(true);
            try {
                const { data: { session } } = await supabase.auth.getSession();
                const token = session?.access_token;
                if (!token) return;
                
                const headers = {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                };
                
                const profRes = await fetch(`${API_URL}/users/me`, { headers });
                if (profRes.ok) {
                    const profData = await profRes.json();
                    const p = { name: profData.name || '', phone: profData.phone || '' };
                    setSavedProfile(p);
                    setProfileForm(p);
                }
                
                const addrRes = await fetch(`${API_URL}/users/me/addresses`, { headers });
                if (addrRes.ok) setAddresses(await addrRes.json());
                
                const orderRes = await fetch(`${API_URL}/users/me/orders`, { headers });
                if (orderRes.ok) setOrders(await orderRes.json());
            } catch (err) {
                console.error("Error fetching data:", err);
            } finally {
                setLoadingData(false);
            }
        }
        fetchData();
    }, [user]);

    async function getAuthHeaders() {
        const { data: { session } } = await supabase.auth.getSession();
        return {
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json'
        };
    }

    /* ─── Profile handlers ─── */
    async function saveProfile() {
        if (!profileForm.name.trim()) return;
        try {
            const headers = await getAuthHeaders();
            const res = await fetch(`${API_URL}/users/me`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(profileForm)
            });
            if (res.ok) {
                setSavedProfile(profileForm);
                setIsEditingProfile(false);
                setProfileSaved(true);
                setTimeout(() => setProfileSaved(false), 3000);
            }
        } catch (err) { console.error(err); }
    }
    
    function cancelEditProfile() {
        setProfileForm(savedProfile);
        setIsEditingProfile(false);
    }

    /* ─── Address handlers ─── */
    function openAddForm() {
        setAddrForm(EMPTY_ADDR);
        setAddrErrors({});
        setEditingAddrId(null);
        setShowAddrForm(true);
    }
    
    function openEditForm(addr) {
        setAddrForm({ label: addr.label, flat: addr.flat, street: addr.street, city: addr.city, state: addr.state, pincode: addr.pincode, is_default: addr.is_default });
        setAddrErrors({});
        setEditingAddrId(addr.id);
        setShowAddrForm(true);
    }
    
    function cancelAddrForm() {
        setShowAddrForm(false);
        setEditingAddrId(null);
        setAddrErrors({});
    }
    
    function setAddrField(key, value) {
        setAddrForm((f) => ({ ...f, [key]: value }));
        if (addrErrors[key]) setAddrErrors((e) => ({ ...e, [key]: '' }));
    }
    
    function validateAddr() {
        const errs = {};
        if (!addrForm.flat.trim()) errs.flat = 'Required.';
        if (!addrForm.street.trim()) errs.street = 'Required.';
        if (!addrForm.city.trim()) errs.city = 'Required.';
        if (!addrForm.state) errs.state = 'Required.';
        if (!/^\d{6}$/.test(addrForm.pincode)) errs.pincode = 'Enter a valid 6-digit pincode.';
        return errs;
    }
    
    async function saveAddress() {
        const errs = validateAddr();
        if (Object.keys(errs).length) { setAddrErrors(errs); return; }
        try {
            const headers = await getAuthHeaders();
            const url = editingAddrId ? `${API_URL}/users/me/addresses/${editingAddrId}` : `${API_URL}/users/me/addresses`;
            const method = editingAddrId ? 'PATCH' : 'POST';
            
            const res = await fetch(url, { method, headers, body: JSON.stringify(addrForm) });
            if (res.ok) {
                const addrRes = await fetch(`${API_URL}/users/me/addresses`, { headers });
                if (addrRes.ok) setAddresses(await addrRes.json());
                cancelAddrForm();
            }
        } catch (err) { console.error(err); }
    }
    
    async function removeAddress(id) {
        try {
            const headers = await getAuthHeaders();
            const res = await fetch(`${API_URL}/users/me/addresses/${id}`, { method: 'DELETE', headers });
            if (res.ok) {
                const addrRes = await fetch(`${API_URL}/users/me/addresses`, { headers });
                if (addrRes.ok) setAddresses(await addrRes.json());
            }
        } catch (err) { console.error(err); }
    }
    
    async function setDefaultAddress(id) {
        try {
            const headers = await getAuthHeaders();
            const res = await fetch(`${API_URL}/users/me/addresses/${id}`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify({ is_default: true })
            });
            if (res.ok) {
                const addrRes = await fetch(`${API_URL}/users/me/addresses`, { headers });
                if (addrRes.ok) setAddresses(await addrRes.json());
            }
        } catch (err) { console.error(err); }
    }

    /* ─── Render ─── */
    return (
        <div className="min-h-screen bg-white font-avenir flex flex-col">
            <Navbar />

            {/* ── Profile header (white strip with avatar + tabs) ── */}
            <div className="bg-white border-b border-[#2D3329]/8">
                <div className="max-w-6xl mx-auto px-6 md:px-10 pt-10 pb-0">

                    {/* Avatar + user info */}
                    <div className="flex items-center gap-5 mb-8">
                        <div className="w-16 h-16 bg-[#A96142] flex items-center justify-center shrink-0 select-none">
                            <span className="font-poppins text-2xl font-light text-white">
                                {getInitials(savedProfile.name)}
                            </span>
                        </div>
                        <div>
                            <h1 className="font-poppins text-2xl font-light text-[#2D3329] leading-tight">
                                {savedProfile.name}
                            </h1>
                            <p className="font-avenir text-sm text-[#737373]">{user?.email}</p>
                            <p className="font-avenir text-xs text-[#737373]/60 mt-0.5">
                                Member since {authProfile ? new Date(authProfile.created_at).toLocaleDateString('en-US', {month: 'long', year: 'numeric'}) : ''}
                            </p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex overflow-x-auto scrollbar-hide -mb-px">
                        {TABS.map(({ key, label, Icon }) => (
                            <button
                                key={key}
                                onClick={() => setActiveTab(key)}
                                className={`flex items-center gap-2 px-5 py-3.5 font-avenir text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === key
                                    ? 'border-[#A96142] text-[#A96142]'
                                    : 'border-transparent text-[#737373] hover:text-[#2D3329]'
                                    }`}
                            >
                                <Icon size={15} />
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Tab content ── */}
            <div className="flex-1 max-w-6xl mx-auto w-full px-6 md:px-10 py-8">

                {/* ══════════ MY PROFILE TAB ══════════ */}
                {activeTab === 'profile' && (
                    <div className="max-w-xl space-y-4">

                        {/* Success banner */}
                        {profileSaved && (
                            <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200">
                                <CheckIcon size={15} className="text-emerald-600 shrink-0" />
                                <p className="font-avenir text-sm text-emerald-700">Profile updated successfully.</p>
                            </div>
                        )}

                        {/* Personal info card */}
                        <div className="bg-white border border-[#2D3329]/8">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-[#2D3329]/8">
                                <h2 className="font-avenir text-sm uppercase tracking-widest text-[#2D3329]">
                                    Personal Information
                                </h2>
                                {!isEditingProfile && (
                                    <button
                                        onClick={() => setIsEditingProfile(true)}
                                        className="flex items-center gap-1.5 font-avenir text-xs text-[#A96142] hover:text-[#8f5237] transition-colors"
                                    >
                                        <EditIcon size={13} /> Edit
                                    </button>
                                )}
                            </div>

                            {isEditingProfile ? (
                                <div className="px-6 py-6 space-y-5">
                                    <InputField
                                        label="Full Name"
                                        required
                                        type="text"
                                        placeholder="Your full name"
                                        value={profileForm.name}
                                        onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))}
                                    />

                                    {/* Email — read-only (tied to auth) */}
                                    <div className="space-y-1.5">
                                        <label className="block font-avenir text-xs uppercase tracking-wider text-[#737373]">
                                            Email Address
                                        </label>
                                        <div className="w-full px-4 py-3 border border-[#2D3329]/10 bg-[#F8F7F5] font-avenir text-sm text-[#737373]">
                                            {user?.email || ''}
                                        </div>
                                        <p className="font-avenir text-xs text-[#737373]/60">
                                            Email is linked to your account. Contact support to change it.
                                        </p>
                                    </div>

                                    <InputField
                                        label="Phone Number"
                                        type="tel"
                                        placeholder="10-digit mobile number"
                                        maxLength={10}
                                        value={profileForm.phone}
                                        onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, '') }))}
                                    />

                                    <div className="flex gap-3 pt-1">
                                        <button
                                            onClick={saveProfile}
                                            className="flex-1 py-3 bg-[#A96142] text-white font-avenir text-sm hover:bg-[#8f5237] transition-colors"
                                        >
                                            Save Changes
                                        </button>
                                        <button
                                            onClick={cancelEditProfile}
                                            className="flex-1 py-3 border border-[#2D3329]/20 text-[#737373] font-avenir text-sm hover:text-[#2D3329] transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="px-6 py-2">
                                    <InfoRow label="Full Name" value={savedProfile.name} />
                                    <InfoRow label="Email Address" value={user?.email} />
                                    <InfoRow label="Phone Number" value={savedProfile.phone ? `+91 ${savedProfile.phone}` : null} />
                                    <InfoRow label="Member Since" value={authProfile ? new Date(authProfile.created_at).toLocaleDateString('en-US', {month: 'long', year: 'numeric'}) : ''} />
                                </div>
                            )}
                        </div>

                        {/* Account actions */}
                        <div className="bg-white border border-[#2D3329]/8">
                            <div className="px-6 py-4 border-b border-[#2D3329]/8">
                                <h2 className="font-avenir text-sm uppercase tracking-widest text-[#2D3329]">Account</h2>
                            </div>
                            <div className="px-6 py-5 flex items-center justify-between">
                                <div>
                                    <p className="font-avenir text-sm text-[#2D3329]">Sign Out</p>
                                    <p className="font-avenir text-xs text-[#737373] mt-0.5">
                                        You'll need to sign in again to view your profile.
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        /* await supabase.auth.signOut(); */
                                        navigate('/');
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 font-avenir text-sm border border-[#2D3329]/20 text-[#737373] hover:border-red-300 hover:text-red-600 transition-colors"
                                >
                                    <LogOutIcon size={14} />
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ══════════ ADDRESSES TAB ══════════ */}
                {activeTab === 'addresses' && (
                    <div>
                        {/* Toolbar */}
                        <div className="flex items-center justify-between mb-6">
                            <p className="font-avenir text-sm text-[#737373]">
                                {addresses.length} saved address{addresses.length !== 1 ? 'es' : ''}
                            </p>
                            {!showAddrForm && (
                                <button
                                    onClick={openAddForm}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-[#A96142] text-white font-avenir text-sm hover:bg-[#8f5237] transition-colors"
                                >
                                    <PlusIcon size={15} />
                                    Add New Address
                                </button>
                            )}
                        </div>

                        {/* Address cards */}
                        {addresses.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                {addresses.map((addr) => (
                                    <div
                                        key={addr.id}
                                        className={`bg-white border p-5 flex flex-col gap-4 transition-colors ${addr.is_default
                                            ? 'border-[#A96142]/30'
                                            : 'border-[#2D3329]/8 hover:border-[#2D3329]/20'
                                            }`}
                                    >
                                        {/* Label row */}
                                        <div className="flex items-center gap-2">
                                            <span className="font-avenir text-xs uppercase tracking-wider px-2 py-0.5 bg-[#F8F7F5] border border-[#2D3329]/10 text-[#2D3329]">
                                                {addr.label}
                                            </span>
                                            {addr.is_default && (
                                                <span className="font-avenir text-[10px] uppercase tracking-wider px-2 py-0.5 bg-[#FDF6F3] border border-[#A96142]/25 text-[#A96142]">
                                                    Default
                                                </span>
                                            )}
                                        </div>

                                        {/* Address lines */}
                                        <div className="font-avenir text-sm text-[#2D3329] space-y-0.5 leading-relaxed">
                                            <p>{addr.flat}</p>
                                            <p>{addr.street}</p>
                                            <p className="text-[#737373]">
                                                {addr.city}, {addr.state} — {addr.pincode}
                                            </p>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-3 pt-3 border-t border-[#2D3329]/8">
                                            {!addr.is_default && (
                                                <button
                                                    onClick={() => setDefaultAddress(addr.id)}
                                                    className="font-avenir text-xs text-[#737373] hover:text-[#A96142] transition-colors"
                                                >
                                                    Set as Default
                                                </button>
                                            )}
                                            <div className="flex items-center gap-3 ml-auto">
                                                <button
                                                    onClick={() => openEditForm(addr)}
                                                    className="flex items-center gap-1 font-avenir text-xs text-[#737373] hover:text-[#2D3329] transition-colors"
                                                >
                                                    <EditIcon size={12} /> Edit
                                                </button>
                                                <button
                                                    onClick={() => removeAddress(addr.id)}
                                                    className="flex items-center gap-1 font-avenir text-xs text-[#737373] hover:text-red-600 transition-colors"
                                                >
                                                    <TrashIcon size={12} /> Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Empty state */}
                        {addresses.length === 0 && !showAddrForm && (
                            <div className="bg-white border border-[#2D3329]/8 py-20 flex flex-col items-center gap-3 text-[#737373]">
                                <MapPinIcon size={40} className="opacity-20" />
                                <p className="font-avenir text-sm">No saved addresses yet.</p>
                                <button
                                    onClick={openAddForm}
                                    className="font-avenir text-xs text-[#A96142] underline underline-offset-2"
                                >
                                    Add your first address
                                </button>
                            </div>
                        )}

                        {/* Add / Edit address form */}
                        {showAddrForm && (
                            <div className="bg-white border border-[#A96142]/20 p-6 space-y-5">
                                <div className="flex items-center justify-between pb-1">
                                    <h3 className="font-avenir text-sm uppercase tracking-widest text-[#2D3329]">
                                        {editingAddrId ? 'Edit Address' : 'New Address'}
                                    </h3>
                                    <button
                                        onClick={cancelAddrForm}
                                        className="font-avenir text-xs text-[#737373] hover:text-[#2D3329] transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>

                                {/* Label toggle */}
                                <div className="space-y-1.5">
                                    <label className="block font-avenir text-xs uppercase tracking-wider text-[#737373]">
                                        Label
                                    </label>
                                    <div className="flex gap-2">
                                        {['Home', 'Work', 'Other'].map((l) => (
                                            <button
                                                key={l}
                                                type="button"
                                                onClick={() => setAddrField('label', l)}
                                                className={`px-4 py-1.5 font-avenir text-xs border transition-colors ${addrForm.label === l
                                                    ? 'border-[#A96142] bg-[#FDF6F3] text-[#A96142]'
                                                    : 'border-[#2D3329]/15 text-[#737373] hover:border-[#A96142] hover:text-[#A96142]'
                                                    }`}
                                            >
                                                {l}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <InputField
                                        label="House / Flat No."
                                        required
                                        placeholder="e.g. 4B, Sunrise Apartments"
                                        value={addrForm.flat}
                                        onChange={(e) => setAddrField('flat', e.target.value)}
                                        error={addrErrors.flat}
                                    />
                                    <InputField
                                        label="Street / Area"
                                        required
                                        placeholder="e.g. MG Road, Indiranagar"
                                        value={addrForm.street}
                                        onChange={(e) => setAddrField('street', e.target.value)}
                                        error={addrErrors.street}
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <InputField
                                        label="City"
                                        required
                                        placeholder="e.g. Bengaluru"
                                        value={addrForm.city}
                                        onChange={(e) => setAddrField('city', e.target.value)}
                                        error={addrErrors.city}
                                    />
                                    <SelectField
                                        label="State"
                                        required
                                        value={addrForm.state}
                                        onChange={(e) => setAddrField('state', e.target.value)}
                                        error={addrErrors.state}
                                    >
                                        <option value="">Select State</option>
                                        {INDIAN_STATES.map((s) => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </SelectField>
                                    <InputField
                                        label="Pincode"
                                        required
                                        placeholder="6-digit pincode"
                                        inputMode="numeric"
                                        maxLength={6}
                                        value={addrForm.pincode}
                                        onChange={(e) => setAddrField('pincode', e.target.value.replace(/\D/g, ''))}
                                        error={addrErrors.pincode}
                                    />
                                </div>

                                <div className="flex gap-3 pt-1">
                                    <button
                                        onClick={saveAddress}
                                        className="flex-1 py-3 bg-[#A96142] text-white font-avenir text-sm hover:bg-[#8f5237] transition-colors"
                                    >
                                        {editingAddrId ? 'Update Address' : 'Save Address'}
                                    </button>
                                    <button
                                        onClick={cancelAddrForm}
                                        className="flex-1 py-3 border border-[#2D3329]/20 text-[#737373] font-avenir text-sm hover:text-[#2D3329] transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ══════════ ORDER HISTORY TAB ══════════ */}
                {activeTab === 'orders' && (
                    <div className="space-y-4">

                        {orders.length === 0 ? (
                            <div className="bg-white border border-[#2D3329]/8 py-20 flex flex-col items-center gap-3 text-[#737373]">
                                <PackageIcon size={40} className="opacity-20" />
                                <p className="font-avenir text-sm">You haven't placed any orders yet.</p>
                                <button
                                    onClick={() => navigate('/shop')}
                                    className="font-avenir text-xs text-[#A96142] underline underline-offset-2"
                                >
                                    Start shopping
                                </button>
                            </div>
                        ) : (
                            orders.map((order) => (
                                <div key={order.id} className="bg-white border border-[#2D3329]/8">

                                    {/* Order header */}
                                    <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-[#2D3329]/8">
                                        <div className="flex items-center gap-5">
                                            <div>
                                                <p className="font-avenir text-[10px] uppercase tracking-wider text-[#737373]">Order</p>
                                                <p className="font-avenir text-sm text-[#A96142]">{order.id}</p>
                                            </div>
                                            <div className="h-6 w-px bg-[#2D3329]/10" />
                                            <div>
                                                <p className="font-avenir text-[10px] uppercase tracking-wider text-[#737373]">Placed on</p>
                                                <p className="font-avenir text-sm text-[#2D3329]">{new Date(order.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                            </div>
                                        </div>
                                        <StatusBadge status={order.status} />
                                    </div>

                                    {/* Items */}
                                    <div className="divide-y divide-[#2D3329]/5">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-4 px-6 py-4">
                                                {/* Thumbnail */}
                                                <div className="w-14 h-14 shrink-0 bg-[#FDF6F3] flex items-center justify-center overflow-hidden">
                                                    {item.img
                                                        ? <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                                                        : <span className="font-poppins text-xl font-light text-[#A96142]/30 select-none">
                                                            {item.name.charAt(0)}
                                                        </span>
                                                    }
                                                </div>
                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-avenir text-sm text-[#2D3329] truncate">{item.name}</p>
                                                    <p className="font-avenir text-xs text-[#737373] mt-0.5">
                                                        Size {item.size} · Qty {item.qty}
                                                    </p>
                                                </div>
                                                {/* Line price */}
                                                <p className="font-avenir text-sm text-[#2D3329] shrink-0">
                                                    ₹{(item.price * item.qty).toLocaleString('en-IN')}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Order footer */}
                                    <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-[#2D3329]/8 bg-[#F8F7F5]/60">
                                        <div className="flex items-baseline gap-2">
                                            <span className="font-avenir text-xs text-[#737373] uppercase tracking-wider">Order Total</span>
                                            <span className="font-poppins text-base font-light text-[#A96142]">
                                                ₹{order.total_amount.toLocaleString('en-IN')}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => navigate(`/orders/${order.id}`)}
                                            className="flex items-center gap-1 font-avenir text-xs text-[#A96142] hover:text-[#8f5237] transition-colors"
                                        >
                                            View Details <ChevronRightIcon size={13} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer className="bg-[#2D3329] text-[#737373] px-6 md:px-10 py-16 border-t border-white/5 mt-auto">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm font-avenir">
                    <span className="tracking-widest text-white font-semibold font-cinzel">MOTHER'S LOVE</span>
                    <span className="text-[#737373]/60">© 2026 Mother's Love. All rights reserved.</span>
                </div>
            </footer>

            {/* Chat Widget Button & Dialog */}
            <div className="fixed bottom-6 right-6 z-50">
                {!chatOpen ? (
                    <button 
                        onClick={() => setChatOpen(true)}
                        className="w-14 h-14 bg-[#A96142] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform duration-300 border border-[#A96142]"
                        aria-label="Open chat"
                    >
                        <svg viewBox="0 0 24 24" width={24} height={24} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                    </button>
                ) : (
                    <div className="w-80 h-96 bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden border border-[#2D3329]/10">
                        {/* Chat Header */}
                        <div className="bg-[#A96142] text-white px-4 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                                <span className="font-avenir text-sm font-semibold tracking-wide">Support Chat</span>
                            </div>
                            <button onClick={() => setChatOpen(false)} className="text-white/80 hover:text-white">
                                <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                        {/* Chat Messages */}
                        <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 bg-[#FDF6F3]/30">
                            {messages.map((msg, i) => (
                                <div key={i} className={`max-w-[80%] p-2.5 rounded-lg text-xs font-avenir ${msg.sender === 'bot' ? 'bg-white text-[#2D3329] self-start shadow-sm border border-[#2D3329]/5' : 'bg-[#A96142] text-white self-end shadow-sm'}`}>
                                    {msg.text}
                                </div>
                            ))}
                        </div>
                        {/* Chat Input */}
                        <form onSubmit={handleSendMessage} className="p-3 border-t border-[#2D3329]/10 flex gap-2 bg-white">
                            <input
                                type="text"
                                value={chatMessage}
                                onChange={(e) => setChatMessage(e.target.value)}
                                placeholder="Write a message..."
                                className="flex-grow border border-[#2D3329]/10 rounded px-3 py-1.5 text-xs font-avenir focus:outline-none focus:border-[#A96142]"
                            />
                            <button type="submit" className="bg-[#A96142] text-white px-3 py-1.5 rounded text-xs font-avenir hover:bg-[#8f5237] transition-colors">
                                Send
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}