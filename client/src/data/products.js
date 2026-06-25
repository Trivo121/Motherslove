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
    { id: 'c1aa406c-13a2-4a7c-8ea8-961dc49e9ddf', name: 'Official Tee - Baby Pink', color: 'Baby Pink', price: '₹600.00', sku: 'SKU: F001', category: 'official', badge: 'Best Seller', img: formal1, description: defaultDesc, material: defaultMaterial, care: defaultCare, sizes: defaultSizes },
    { id: '9ea40091-6111-4d71-8efb-0e43fe91f68d', name: 'Official Tee - Blue', color: 'Blue', price: '₹600.00', sku: 'SKU: F002', category: 'official', badge: '', img: formal2, description: defaultDesc, material: defaultMaterial, care: defaultCare, sizes: defaultSizes },
    { id: '725bdf99-8feb-44f1-ae80-e5ece640d72d', name: 'Official Tee - Charcoal Grey', color: 'Charcoal Grey', price: '₹600.00', sku: 'SKU: F003', category: 'official', badge: '', img: formal3, description: defaultDesc, material: defaultMaterial, care: defaultCare, sizes: defaultSizes },
    { id: '88669990-a6c1-4359-9cc2-891f31e609a2', name: 'Official Tee - Green', color: 'Green', price: '₹600.00', sku: 'SKU: F004', category: 'official', badge: '', img: formal4, description: defaultDesc, material: defaultMaterial, care: defaultCare, sizes: defaultSizes },
    { id: '235022d9-55bf-4b80-b477-4e61bd3f5919', name: 'Official Tee - Maroon Red', color: 'Maroon Red', price: '₹600.00', sku: 'SKU: F005', category: 'official', badge: '', img: formal5, description: defaultDesc, material: defaultMaterial, care: defaultCare, sizes: defaultSizes },
    { id: '25d8b0c8-60e8-4397-9450-3deeacb69731', name: 'Official Tee - Orange', color: 'Orange', price: '₹600.00', sku: 'SKU: F006', category: 'official', badge: 'New', img: formal6, description: defaultDesc, material: defaultMaterial, care: defaultCare, sizes: defaultSizes },
    { id: '3697182c-551c-4e61-8e11-e47517e45f61', name: 'Official Tee - Light Green', color: 'Light Green', price: '₹600.00', sku: 'SKU: F007', category: 'official', badge: '', img: formal7, description: defaultDesc, material: defaultMaterial, care: defaultCare, sizes: defaultSizes },
    { id: '7d7e54e9-4535-48e6-a837-69aec30b4ce5', name: 'Ash Twilight Graphic Tee', color: 'Ash Twilight', price: '₹750.00', sku: 'SKU: U001', category: 'unique', badge: 'Trending', img: unique1, description: defaultDesc, material: defaultMaterial, care: defaultCare, sizes: defaultSizes },
    { id: 'b8e2f8ab-1add-4343-ac48-e61bb89dbd2d', name: 'Egyptian God Graphic Tee', color: 'Egyptian God', price: '₹750.00', sku: 'SKU: U002', category: 'unique', badge: '', img: unique2, description: defaultDesc, material: defaultMaterial, care: defaultCare, sizes: defaultSizes },
    { id: 'f9daa6ad-fd27-4d49-b370-fcb5586b539c', name: 'Unique Graphic Tee 1', color: 'Unique', price: '₹750.00', sku: 'SKU: U003', category: 'unique', badge: 'New', img: unique3, description: defaultDesc, material: defaultMaterial, care: defaultCare, sizes: defaultSizes },
    { id: '36b57cd5-c745-4f5a-bf22-46b6f48acc36', name: 'One Piece Graphic Tee', color: 'One Piece', price: '₹750.00', sku: 'SKU: U004', category: 'unique', badge: '', img: unique4, description: defaultDesc, material: defaultMaterial, care: defaultCare, sizes: defaultSizes },
    { id: 'bee41e0c-a04d-4a01-821a-8cc81e9618fc', name: 'Unique Graphic Tee 4', color: 'Unique', price: '₹750.00', sku: 'SKU: U005', category: 'unique', badge: '', img: unique5, description: defaultDesc, material: defaultMaterial, care: defaultCare, sizes: defaultSizes },
    { id: 'b697e176-6cb2-485c-a9d3-cc94010a7fd3', name: 'Unique Graphic Tee 2', color: 'Unique', price: '₹750.00', sku: 'SKU: U006', category: 'unique', badge: '', img: unique6, description: defaultDesc, material: defaultMaterial, care: defaultCare, sizes: defaultSizes },
    { id: '46e72b8f-9760-486c-9440-bfd0d9f90bfc', name: 'Unique Graphic Tee 3', color: 'Unique', price: '₹750.00', sku: 'SKU: U007', category: 'unique', badge: '', img: unique7, description: defaultDesc, material: defaultMaterial, care: defaultCare, sizes: defaultSizes },
];
