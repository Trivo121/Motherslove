import { PRODUCTS as MAIN_PRODUCTS } from '../../data/products.js';

/* =========================================================================
   PRODUCT DATA — mapped from the main catalogue in Cart.jsx

   Swap the PRODUCTS array for a Supabase fetch later.
   ========================================================================= */

export const PRODUCT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
export const PRODUCT_TAGS = ['New', 'Best Seller', 'Trending', 'Sale', 'Limited'];

export const PRODUCTS = MAIN_PRODUCTS.map(p => ({
    id: String(p.id),
    name: p.name,
    price: Number(p.price.replace(/[^0-9.]/g, '')),
    description: p.description,
    sizes: p.sizes,
    image: p.img,
    published: true,
    tags: p.badge ? [p.badge] : [],
    stock: 15, // Mock stock since it's not in the main data yet
}));