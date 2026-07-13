import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PRODUCT_SIZES, PRODUCT_TAGS } from './ProductData';

/* =========================================================================
   SUPABASE WIRING

   Save new product:
     const { error } = await supabase.from('products').insert({
       name: form.name, price: Number(form.price), stock: Number(form.stock),
       description: form.description, sizes: form.sizes,
       tags: form.tags, published: form.published,
     });

   Update existing product:
     await supabase.from('products').update({ ... }).eq('id', productId);

   Image upload (after inserting/getting the product ID):
     const { data } = await supabase.storage
       .from('product-images')
       .upload(`${id}.jpg`, file, { upsert: true });
     const publicUrl = supabase.storage.from('product-images').getPublicUrl(`${id}.jpg`);
   ========================================================================= */

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const uploadToImageKit = async (file) => {
  try {
    const authResponse = await fetch(`${API_URL}/images/auth`); 
    if (!authResponse.ok) throw new Error("Could not fetch upload authorization");
    
    const authData = await authResponse.json();

    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileName", `product_${Date.now()}_${file.name.replace(/\s+/g, "_")}`);
    formData.append("publicKey", import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY);
    formData.append("signature", authData.signature);
    formData.append("expire", authData.expire);
    formData.append("token", authData.token);
    formData.append("folder", "/products");

    const uploadResponse = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
      method: "POST",
      body: formData,
    });

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json();
      throw new Error(errorData.message || "ImageKit upload failed");
    }

    const uploadResult = await uploadResponse.json();
    return uploadResult.url; 
  } catch (error) {
    console.error("Error handling image upload:", error);
    alert("Image upload failed. Please try again.");
    return null;
  }
};

/* ---------- Icons ---------- */
const I = ({ children, size = 18, className = '' }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor"
        strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        {children}
    </svg>
);
const ArrowLeftIcon = (p) => <I {...p}><path d="M19 12H5M12 5l-7 7 7 7" /></I>;
const UploadIcon = (p) => <I {...p}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></I>;
const CheckIcon = (p) => <I {...p}><path d="M20 6L9 17l-5-5" /></I>;
const ImagePlaceholderIcon = (p) => <I {...p}><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></I>;
const XIcon = (p) => <I {...p}><path d="M18 6L6 18M6 6l12 12" /></I>;

/* ---------- Field wrapper ---------- */
function Field({ label, required, error, hint, children }) {
    return (
        <div className="space-y-1.5">
            <label className="block font-avenir text-xs uppercase tracking-widest text-[#737373]">
                {label}
                {required && <span className="text-[#A96142] ml-0.5">*</span>}
            </label>
            {children}
            {error && (
                <p className="font-avenir text-xs text-red-600">{error}</p>
            )}
            {hint && !error && (
                <p className="font-avenir text-xs text-[#737373]/60">{hint}</p>
            )}
        </div>
    );
}

/* ---------- Text / number input ---------- */
function TextInput({ hasError, ...props }) {
    return (
        <input
            className={`w-full px-4 py-2.5 border font-avenir text-sm text-[#2D3329] placeholder:text-[#737373] focus:outline-none transition-colors bg-white ${hasError
                ? 'border-red-400 focus:border-red-500'
                : 'border-[#2D3329]/20 focus:border-[#A96142]'
                }`}
            {...props}
        />
    );
}

/* ---------- Form section ---------- */
function FormSection({ title, children }) {
    return (
        <div className="px-6 py-6 space-y-5 border-b border-[#2D3329]/8">
            <h3 className="font-avenir text-xs uppercase tracking-widest text-[#2D3329]">
                {title}
            </h3>
            {children}
        </div>
    );
}

/* ---------- Product form (add + edit) ---------- */
export default function AdminProductForm() {
    const navigate = useNavigate();
    const { productId } = useParams();
    const isEditing = productId !== undefined;
    const fileRef = useRef(null);

    const EMPTY_FORM = {
        name: '', price: '', description: '',
        sizes: [], imagePreviews: [null, null, null, null],
        published: true, tags: [], stock: '',
        category: 'unique',
    };

    const [form, setForm] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [notFound, setNotFound] = useState(false);

    const [imageFiles, setImageFiles] = useState([null, null, null, null]);

    /* Populate form when editing */
    useEffect(() => {
        if (!isEditing) return;
        
        async function fetchProduct() {
            try {
                const res = await fetch(`${API_URL}/products/${productId}`);
                if (!res.ok) {
                    setNotFound(true);
                    return;
                }
                const product = await res.json();
                setForm({
                    name: product.name,
                    price: String(product.price),
                    description: product.description || '',
                    sizes: product.sizes || [],
                    imagePreviews: (product.image_urls && product.image_urls.length > 0) ? 
                        [...product.image_urls, ...Array(4 - product.image_urls.length).fill(null)].slice(0, 4) : 
                        [product.image_url || null, null, null, null],
                    published: product.published,
                    tags: product.tags || [],
                    stock: String(product.stock),
                    category: product.category || 'unique',
                });
            } catch (err) {
                console.error(err);
                setNotFound(true);
            }
        }
        fetchProduct();
    }, [isEditing, productId]);

    /* Generic field setter — also clears that field's error */
    function set(key, value) {
        setForm((prev) => ({ ...prev, [key]: value }));
        if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
    }

    function toggleSize(size) {
        set(
            'sizes',
            form.sizes.includes(size)
                ? form.sizes.filter((s) => s !== size)
                : [...form.sizes, size],
        );
    }

    function toggleTag(tag) {
        set(
            'tags',
            form.tags.includes(tag)
                ? form.tags.filter((t) => t !== tag)
                : [...form.tags, tag],
        );
    }

    function handleImageChange(index, e) {
        const file = e.target.files?.[0];
        if (!file) return;
        
        setImageFiles(prev => {
            const newFiles = [...prev];
            newFiles[index] = file;
            return newFiles;
        });
        
        const reader = new FileReader();
        reader.onload = (ev) => {
            setForm(prev => {
                const newPreviews = [...prev.imagePreviews];
                newPreviews[index] = ev.target.result;
                return { ...prev, imagePreviews: newPreviews };
            });
        };
        reader.readAsDataURL(file);
    }
    
    function removeImage(index) {
        setImageFiles(prev => {
            const newFiles = [...prev];
            newFiles[index] = null;
            return newFiles;
        });
        setForm(prev => {
            const newPreviews = [...prev.imagePreviews];
            newPreviews[index] = null;
            return { ...prev, imagePreviews: newPreviews };
        });
    }

    function validate() {
        const errs = {};
        if (!form.name.trim()) errs.name = 'Product name is required.';
        const priceNum = Number(form.price);
        if (!form.price || isNaN(priceNum) || priceNum <= 0)
            errs.price = 'Enter a valid price greater than ₹0.';
        return errs;
    }

    async function handleSubmit() {
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }

        setSaving(true);
        try {
            let imageUrls = [...form.imagePreviews];
            for (let i = 0; i < 4; i++) {
                if (imageFiles[i]) {
                    const uploadedUrl = await uploadToImageKit(imageFiles[i]);
                    if (uploadedUrl) {
                        imageUrls[i] = uploadedUrl;
                    } else {
                        setSaving(false);
                        return;
                    }
                }
            }
            // Filter out nulls for backend array
            const validImageUrls = imageUrls.filter(url => url !== null);

            const payload = {
                name: form.name,
                price: Number(form.price),
                description: form.description,
                stock: Number(form.stock || 0),
                category: form.category,
                published: form.published,
                image_url: validImageUrls.length > 0 ? validImageUrls[0] : null,
                image_urls: validImageUrls,
                sizes: form.sizes,
                tags: form.tags,
            };

            const url = isEditing ? `${API_URL}/products/${productId}` : `${API_URL}/products`;
            const method = isEditing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error("Failed to save product");

            setSuccess(true);
            setTimeout(() => navigate('/admin/products'), 1400);
        } catch (err) {
            console.error(err);
            alert("Error saving product");
        } finally {
            setSaving(false);
        }
    }

    /* — Product not found — */
    if (notFound) {
        return (
            <div className="flex flex-col items-center gap-4 py-24 text-[#737373]">
                <p className="font-avenir text-sm">Product not found.</p>
                <button
                    onClick={() => navigate('/admin/products')}
                    className="font-avenir text-xs text-[#A96142] underline underline-offset-2"
                >
                    Back to Products
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-2xl">

            {/* Back + heading */}
            <div>
                <button
                    onClick={() => navigate('/admin/products')}
                    className="flex items-center gap-2 font-avenir text-xs text-[#737373] hover:text-[#2D3329] transition-colors mb-4 group"
                >
                    <ArrowLeftIcon
                        size={14}
                        className="group-hover:-translate-x-0.5 transition-transform"
                    />
                    Back to Products
                </button>

                <h2 className="font-poppins text-2xl font-light text-[#2D3329]">
                    {isEditing ? 'Edit Product' : 'Add New Product'}
                </h2>
                <p className="font-avenir text-xs text-[#737373] mt-1">
                    {isEditing
                        ? `Editing — ${form.name || '…'}`
                        : 'Fill in the details below to add a new product to your catalogue.'}
                </p>
            </div>

            {/* Success banner */}
            {success && (
                <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200">
                    <CheckIcon size={15} className="text-emerald-600 shrink-0" />
                    <p className="font-avenir text-sm text-emerald-700">
                        {isEditing ? 'Product updated successfully.' : 'Product added to catalogue.'}
                        {' '}
                        <span className="text-emerald-600/70">Redirecting…</span>
                    </p>
                </div>
            )}

            {/* Form card */}
            <div className="bg-white border border-[#2D3329]/8">

                {/* ─── Basic info ─── */}
                <FormSection title="Basic Info">
                    <Field label="Product Name" required error={errors.name}>
                        <TextInput
                            type="text"
                            value={form.name}
                            onChange={(e) => set('name', e.target.value)}
                            placeholder="e.g. Classic Crew Neck Tee"
                            hasError={!!errors.name}
                        />
                    </Field>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Field label="Price (₹)" required error={errors.price}>
                            <TextInput
                                type="number"
                                value={form.price}
                                onChange={(e) => set('price', e.target.value)}
                                placeholder="e.g. 599"
                                min="0"
                                hasError={!!errors.price}
                            />
                        </Field>
                        <Field label="Stock Count" hint="Leave blank if not tracking.">
                            <TextInput
                                type="number"
                                value={form.stock}
                                onChange={(e) => set('stock', e.target.value)}
                                placeholder="e.g. 20"
                                min="0"
                            />
                        </Field>
                        <Field label="Category" required>
                            <div className="relative">
                                <select
                                    value={form.category}
                                    onChange={(e) => set('category', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-[#2D3329]/20 font-avenir text-sm text-[#2D3329] focus:outline-none focus:border-[#A96142] transition-colors bg-white appearance-none"
                                >
                                    <option value="unique">T-Shirts - Unique</option>
                                    <option value="formal">T-Shirts - Formal</option>
                                    <option value="shirts">Shirts</option>
                                    <option value="hoodies">Hoodies</option>
                                    <option value="sweatshirts">Sweatshirts</option>
                                </select>
                                <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737373] pointer-events-none">
                                    <path d="M6 9l6 6 6-6" />
                                </svg>
                            </div>
                        </Field>
                    </div>

                    <Field label="Description">
                        <textarea
                            value={form.description}
                            onChange={(e) => set('description', e.target.value)}
                            placeholder="Describe the fabric, fit, and feel…"
                            rows={3}
                            className="w-full px-4 py-2.5 border border-[#2D3329]/20 font-avenir text-sm text-[#2D3329] placeholder:text-[#737373] focus:outline-none focus:border-[#A96142] transition-colors bg-white resize-none"
                        />
                    </Field>
                </FormSection>

                {/* ─── Image ─── */}
                <FormSection title="Product Images (Up to 4)">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[0, 1, 2, 3].map((index) => (
                            <div key={index} className="flex flex-col gap-2">
                                <label className="w-full aspect-square border border-[#2D3329]/15 bg-[#F8F7F5] flex flex-col items-center justify-center overflow-hidden cursor-pointer hover:border-[#A96142] transition-colors relative group">
                                    {form.imagePreviews[index] ? (
                                        <>
                                            <img
                                                src={form.imagePreviews[index]}
                                                alt={`Preview ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <UploadIcon size={24} className="text-white" />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center text-[#737373] group-hover:text-[#A96142] transition-colors">
                                            <UploadIcon size={24} className="mb-2" />
                                            <span className="font-avenir text-xs">Image {index + 1}</span>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageChange(index, e)}
                                        className="hidden"
                                    />
                                </label>
                                {form.imagePreviews[index] && (
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="flex items-center justify-center gap-1.5 font-avenir text-xs text-red-500 hover:text-red-700 transition-colors"
                                    >
                                        <XIcon size={12} /> Remove
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                    <p className="font-avenir text-xs text-[#737373]/60 mt-2">
                        First image will be used as the primary thumbnail. PNG or JPG, up to 5 MB per image.
                    </p>
                </FormSection>

                {/* ─── Sizes ─── */}
                <FormSection title="Available Sizes">
                    <div className="flex flex-wrap gap-2">
                        {PRODUCT_SIZES.map((size) => {
                            const active = form.sizes.includes(size);
                            return (
                                <button
                                    key={size}
                                    type="button"
                                    onClick={() => toggleSize(size)}
                                    className={`w-12 h-12 font-avenir text-sm transition-colors ${active
                                        ? 'border border-[#A96142] bg-[#A96142] text-white'
                                        : 'border border-[#2D3329]/20 text-[#737373] hover:border-[#A96142] hover:text-[#A96142]'
                                        }`}
                                >
                                    {size}
                                </button>
                            );
                        })}
                    </div>
                    <p className="font-avenir text-xs text-[#737373]/60">
                        {form.sizes.length === 0
                            ? 'No sizes selected — this product will be hidden from customers.'
                            : `${form.sizes.length} size${form.sizes.length > 1 ? 's' : ''} selected.`}
                    </p>
                </FormSection>

                {/* ─── Tags ─── */}
                <FormSection title="Tags">
                    <div className="flex flex-wrap gap-2">
                        {PRODUCT_TAGS.map((tag) => {
                            const active = form.tags.includes(tag);
                            return (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => toggleTag(tag)}
                                    className={`px-4 py-1.5 font-avenir text-xs border transition-colors rounded-sm ${active
                                        ? 'border-[#A96142] bg-[#FDF6F3] text-[#A96142]'
                                        : 'border-[#2D3329]/15 text-[#737373] hover:border-[#A96142] hover:text-[#A96142]'
                                        }`}
                                >
                                    {tag}
                                </button>
                            );
                        })}
                    </div>
                </FormSection>

                {/* ─── Visibility ─── */}
                <div className="px-6 py-5 border-b border-[#2D3329]/8">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-avenir text-xs uppercase tracking-widest text-[#2D3329]">
                                Published
                            </p>
                            <p className="font-avenir text-xs text-[#737373] mt-0.5">
                                {form.published
                                    ? 'Visible on your storefront.'
                                    : 'Saved as draft — hidden from customers.'}
                            </p>
                        </div>
                        <button
                            type="button"
                            role="switch"
                            aria-checked={form.published}
                            onClick={() => set('published', !form.published)}
                            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${form.published ? 'bg-[#A96142]' : 'bg-[#2D3329]/20'
                                }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${form.published ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>
                </div>

                {/* ─── Footer actions ─── */}
                <div className="px-6 py-4 flex justify-end gap-3 bg-[#F8F7F5]/60">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/products')}
                        className="px-5 py-2.5 font-avenir text-sm border border-[#2D3329]/20 text-[#737373] hover:text-[#2D3329] hover:border-[#2D3329]/40 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={saving || success}
                        className="flex items-center gap-2 px-6 py-2.5 font-avenir text-sm bg-[#A96142] text-white hover:bg-[#8f5137] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {saving ? 'Saving…' : isEditing ? 'Update Product' : 'Save Product'}
                    </button>
                </div>
            </div>
        </div>
    );
}