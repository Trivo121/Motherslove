import formal1 from '../assets/formal/baby pink.png';
import formal2 from '../assets/formal/blue.png';
import formal3 from '../assets/formal/charcoal grey.png';
import formal4 from '../assets/formal/green.png';
import formal5 from '../assets/formal/maroon red.png';
import formal6 from '../assets/formal/orange.png';
import formal7 from '../assets/formal/shaded light green.png';

import unique1 from '../assets/unique/Ash Twilight.png';
import unique2 from '../assets/unique/Egyptian god.png';
import unique3 from '../assets/unique/Unique1.PNG';
import unique4 from '../assets/unique/onepiece.png';
import unique5 from '../assets/unique/unique 4.PNG';
import unique6 from '../assets/unique/unique2.PNG';
import unique7 from '../assets/unique/unique3.PNG';

const defaultDesc = 'A wardrobe essential crafted from 100% GOTS-certified organic cotton. The relaxed crew neck silhouette sits comfortably on all body types, with reinforced shoulder seams for lasting structure. Machine washable at 30°C.';
const defaultMaterial = '100% Organic Cotton | Weight: 180 gsm';
const defaultCare = 'Machine wash cold · Tumble dry low · Do not bleach · Warm iron if needed';
const defaultSizes = ['XS', 'S', 'M', 'L', 'XL'];

export const PRODUCTS = [
    { id: 0, name: 'Formal Tee - Baby Pink', color: 'Baby Pink', price: '₹600.00', sku: 'SKU: F001', category: 'formal', badge: 'Best Seller', img: formal1, description: defaultDesc, material: defaultMaterial, care: defaultCare, sizes: defaultSizes },
    { id: 1, name: 'Formal Tee - Blue', color: 'Blue', price: '₹600.00', sku: 'SKU: F002', category: 'formal', badge: '', img: formal2, description: defaultDesc, material: defaultMaterial, care: defaultCare, sizes: defaultSizes },
    { id: 2, name: 'Formal Tee - Charcoal Grey', color: 'Charcoal Grey', price: '₹600.00', sku: 'SKU: F003', category: 'formal', badge: '', img: formal3, description: defaultDesc, material: defaultMaterial, care: defaultCare, sizes: defaultSizes },
    { id: 3, name: 'Formal Tee - Green', color: 'Green', price: '₹600.00', sku: 'SKU: F004', category: 'formal', badge: '', img: formal4, description: defaultDesc, material: defaultMaterial, care: defaultCare, sizes: defaultSizes },
    { id: 4, name: 'Formal Tee - Maroon Red', color: 'Maroon Red', price: '₹600.00', sku: 'SKU: F005', category: 'formal', badge: '', img: formal5, description: defaultDesc, material: defaultMaterial, care: defaultCare, sizes: defaultSizes },
    { id: 5, name: 'Formal Tee - Orange', color: 'Orange', price: '₹600.00', sku: 'SKU: F006', category: 'formal', badge: 'New', img: formal6, description: defaultDesc, material: defaultMaterial, care: defaultCare, sizes: defaultSizes },
    { id: 6, name: 'Formal Tee - Light Green', color: 'Light Green', price: '₹600.00', sku: 'SKU: F007', category: 'formal', badge: '', img: formal7, description: defaultDesc, material: defaultMaterial, care: defaultCare, sizes: defaultSizes },
    { id: 7, name: 'Ash Twilight Graphic Tee', color: 'Ash Twilight', price: '₹750.00', sku: 'SKU: U001', category: 'unique', badge: 'Trending', img: unique1, description: defaultDesc, material: defaultMaterial, care: defaultCare, sizes: defaultSizes },
    { id: 8, name: 'Egyptian God Graphic Tee', color: 'Egyptian God', price: '₹750.00', sku: 'SKU: U002', category: 'unique', badge: '', img: unique2, description: defaultDesc, material: defaultMaterial, care: defaultCare, sizes: defaultSizes },
    { id: 9, name: 'Unique Graphic Tee 1', color: 'Unique', price: '₹750.00', sku: 'SKU: U003', category: 'unique', badge: 'New', img: unique3, description: defaultDesc, material: defaultMaterial, care: defaultCare, sizes: defaultSizes },
    { id: 10, name: 'One Piece Graphic Tee', color: 'One Piece', price: '₹750.00', sku: 'SKU: U004', category: 'unique', badge: '', img: unique4, description: defaultDesc, material: defaultMaterial, care: defaultCare, sizes: defaultSizes },
    { id: 11, name: 'Unique Graphic Tee 4', color: 'Unique', price: '₹750.00', sku: 'SKU: U005', category: 'unique', badge: '', img: unique5, description: defaultDesc, material: defaultMaterial, care: defaultCare, sizes: defaultSizes },
    { id: 12, name: 'Unique Graphic Tee 2', color: 'Unique', price: '₹750.00', sku: 'SKU: U006', category: 'unique', badge: '', img: unique6, description: defaultDesc, material: defaultMaterial, care: defaultCare, sizes: defaultSizes },
    { id: 13, name: 'Unique Graphic Tee 3', color: 'Unique', price: '₹750.00', sku: 'SKU: U007', category: 'unique', badge: '', img: unique7, description: defaultDesc, material: defaultMaterial, care: defaultCare, sizes: defaultSizes },
];
