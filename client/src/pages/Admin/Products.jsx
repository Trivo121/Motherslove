import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


/* =========================================================================
   ROUTER WIRING — add inside your admin route group in App.jsx:

   import AdminProducts    from './admin/AdminProducts';
   import AdminProductForm from './admin/AdminProductForm';

   <Route path="products"                   element={<AdminProducts />} />
   <Route path="products/new"               element={<AdminProductForm />} />
   <Route path="products/:productId/edit"   element={<AdminProductForm />} />

   Also add to PAGE_TITLES in AdminLayout.jsx:
   '/admin/products/new': 'Add Product',

   For the edit route (dynamic ID), update the pageTitle line to:
   const pageTitle =
     PAGE_TITLES[location.pathname] ??
     (location.pathname.match(/\/admin\/products\/.+\/edit/) ? 'Edit Product' : 'Admin');
   ========================================================================= */

/* ---------- Icons ---------- */
const I = ({ children, size = 18, className = '' }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor"
        strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        {children}
    </svg>
);
const SearchIcon = (p) => <I {...p}><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></I>;
const PlusIcon = (p) => <I {...p}><path d="M12 5v14M5 12h14" /></I>;
const EditIcon = (p) => <I {...p}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></I>;
const TrashIcon = (p) => <I {...p}><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" /></I>;
const XIcon = (p) => <I {...p}><path d="M18 6L6 18M6 6l12 12" /></I>;
const EmptyBoxIcon = (p) => <I {...p}><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /><path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" /></I>;

/* ---------- Stock badge ---------- */
function StockBadge({ stock }) {
    if (stock === 0)
        return (
            <span className="inline-block px-2 py-0.5 text-[10px] font-avenir bg-red-50 text-red-600 border border-red-200 rounded-sm">
                Out of stock
            </span>
        );
    if (stock <= 5)
        return (
            <span className="inline-block px-2 py-0.5 text-[10px] font-avenir bg-amber-50 text-amber-700 border border-amber-200 rounded-sm">
                Low — {stock} left
            </span>
        );
    return (
        <span className="inline-block px-2 py-0.5 text-[10px] font-avenir bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-sm">
            In stock · {stock}
        </span>
    );
}

/* ---------- Tag badge ---------- */
function TagBadge({ tag }) {
    return (
        <span className="inline-block px-2 py-0.5 text-[10px] font-avenir bg-[#FDF6F3] text-[#A96142] border border-[#A96142]/25 rounded-sm">
            {tag}
        </span>
    );
}

/* ---------- Delete confirmation modal ---------- */
function DeleteModal({ product, onConfirm, onCancel }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="bg-white border border-[#2D3329]/8 w-full max-w-sm shadow-xl">
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#2D3329]/8">
                    <h3 className="font-avenir text-sm uppercase tracking-widest text-[#2D3329]">
                        Delete Product
                    </h3>
                    <button
                        onClick={onCancel}
                        className="text-[#737373] hover:text-[#2D3329] transition-colors"
                    >
                        <XIcon size={16} />
                    </button>
                </div>
                <div className="px-6 py-6 space-y-5">
                    <p className="font-avenir text-sm text-[#737373] leading-relaxed">
                        Are you sure you want to delete{' '}
                        <span className="text-[#2D3329]">{product.name}</span>?
                        {' '}This action cannot be undone.
                    </p>
                    <div className="flex gap-3 justify-end pt-1">
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 font-avenir text-sm border border-[#2D3329]/20 text-[#737373] hover:text-[#2D3329] hover:border-[#2D3329]/40 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className="px-5 py-2 font-avenir text-sm bg-red-600 text-white hover:bg-red-700 transition-colors"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ---------- Product image / placeholder ---------- */
function ProductThumbnail({ image_url, name }) {
    if (image_url) {
        return <img src={image_url} alt={name} className="w-full h-full object-cover" />;
    }
    return (
        <div className="w-full h-full bg-[#FDF6F3] flex items-center justify-center">
            <span className="font-poppins text-4xl font-light text-[#A96142]/30 select-none">
                {name.charAt(0)}
            </span>
        </div>
    );
}

/* ---------- Product card ---------- */
function ProductCard({ product, onEdit, onDelete }) {
    return (
        <div className="bg-white border border-[#2D3329]/8 group hover:border-[#A96142]/40 transition-colors relative flex flex-col overflow-hidden">
            {/* Terracotta left accent on hover */}
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#A96142] opacity-0 group-hover:opacity-100 transition-opacity z-10" />

            {/* Image area */}
            <div className="relative aspect-square w-full overflow-hidden">
                <ProductThumbnail image_url={product.image_url} name={product.name} />

                {/* Draft pill */}
                {!product.published && (
                    <div className="absolute top-2 left-2">
                        <span className="font-avenir text-[10px] px-2 py-0.5 tracking-wider uppercase bg-[#2D3329] text-white/70">
                            Draft
                        </span>
                    </div>
                )}

                {/* Tags */}
                {product.tags.length > 0 && (
                    <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
                        {product.tags.map((t) => (
                            <TagBadge key={t} tag={t} />
                        ))}
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="p-4 flex flex-col gap-3 flex-1">
                <div>
                    <p className="font-avenir text-[10px] text-[#737373] uppercase tracking-wider mb-0.5">
                        {product.id}
                    </p>
                    <h3 className="font-poppins text-base font-light text-[#2D3329] leading-snug">
                        {product.name}
                    </h3>
                    <p className="font-poppins text-lg font-light text-[#A96142] mt-1">
                        ₹{product.price.toLocaleString('en-IN')}
                    </p>
                </div>

                {/* Sizes */}
                <div className="flex flex-wrap gap-1">
                    {product.sizes.map((s) => (
                        <span
                            key={s}
                            className="font-avenir text-[10px] px-1.5 py-0.5 border border-[#2D3329]/15 text-[#737373]"
                        >
                            {s}
                        </span>
                    ))}
                </div>

                {/* Stock */}
                <div className="mt-auto pt-1">
                    <StockBadge stock={product.stock} />
                </div>
            </div>

            {/* Edit / Delete row */}
            <div className="border-t border-[#2D3329]/8 flex divide-x divide-[#2D3329]/8">
                <button
                    onClick={onEdit}
                    className="flex-1 flex items-center justify-center gap-2 py-3 font-avenir text-xs text-[#737373] hover:text-[#2D3329] hover:bg-[#F8F7F5] transition-colors"
                >
                    <EditIcon size={13} />
                    Edit
                </button>
                <button
                    onClick={onDelete}
                    className="flex-1 flex items-center justify-center gap-2 py-3 font-avenir text-xs text-[#737373] hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                    <TrashIcon size={13} />
                    Delete
                </button>
            </div>
        </div>
    );
}



const API_URL = 'http://127.0.0.1:8000/api';

/* ---------- Page ---------- */
export default function AdminProducts() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [products, setProducts] = useState([]);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProducts() {
            try {
                const res = await fetch(`${API_URL}/products`);
                if (res.ok) {
                    const data = await res.json();
                    setProducts(data);
                }
            } catch (err) {
                console.error("Failed to fetch products:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchProducts();
    }, []);

    async function confirmDelete() {
        if (!deleteTarget) return;
        try {
            const res = await fetch(`${API_URL}/products/${deleteTarget.id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
            } else {
                alert("Failed to delete product.");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setDeleteTarget(null);
        }
    }

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return products.filter(
            (p) => !q || p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q),
        );
    }, [search, products]);

    return (
        <div className="space-y-6">

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                {/* Search */}
                <div className="relative flex-1 max-w-sm">
                    <SearchIcon
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737373] pointer-events-none"
                    />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name or ID…"
                        className="w-full pl-9 pr-4 py-2.5 border border-[#2D3329]/20 font-avenir text-sm text-[#2D3329] placeholder:text-[#737373] focus:outline-none focus:border-[#A96142] transition-colors"
                    />
                </div>

                <p className="font-avenir text-sm text-[#737373] sm:ml-auto self-center shrink-0">
                    {filtered.length} {filtered.length === 1 ? 'product' : 'products'}
                </p>

                <button
                    onClick={() => navigate('/admin/products/new')}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#A96142] text-white font-avenir text-sm hover:bg-[#8f5137] transition-colors shrink-0"
                >
                    <PlusIcon size={15} />
                    Add New Product
                </button>
            </div>

            {/* Product grid */}
            {filtered.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filtered.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            onEdit={() => navigate(`/admin/products/${product.id}/edit`)}
                            onDelete={() => setDeleteTarget(product)}
                        />
                    ))}
                </div>
            ) : (
                <div className="bg-white border border-[#2D3329]/8 py-24 flex flex-col items-center gap-3 text-[#737373]">
                    <EmptyBoxIcon size={38} className="opacity-25" />
                    <p className="font-avenir text-sm">
                        {search ? 'No products match your search.' : 'No products yet.'}
                    </p>
                    {search ? (
                        <button
                            onClick={() => setSearch('')}
                            className="font-avenir text-xs text-[#A96142] underline underline-offset-2"
                        >
                            Clear search
                        </button>
                    ) : (
                        <button
                            onClick={() => navigate('/admin/products/new')}
                            className="font-avenir text-xs text-[#A96142] underline underline-offset-2"
                        >
                            Add your first product
                        </button>
                    )}
                </div>
            )}

            {/* Delete modal */}
            {deleteTarget && (
                <DeleteModal
                    product={deleteTarget}
                    onConfirm={confirmDelete}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}
        </div>
    );
}