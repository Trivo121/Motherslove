import re
import os

file_path = "client/src/pages/ProductDetail.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Remove PRODUCTS import
content = re.sub(r"import\s+{\s*PRODUCTS\s*}\s+from\s+['\"]../data/products.js['\"];?\n", "", content)

# Add API_URL
if "const API_URL" not in content:
    content = content.replace("export default function ProductPage() {", "const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';\n\nexport default function ProductPage() {")

# Replace ProductPage body up to return (
old_logic_pattern = re.compile(r"    const { id } = useParams\(\);.*?    function handleAddToCart\(\) {.*?}\n", re.DOTALL)

new_logic = """    const { id } = useParams();
    const routerNavigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const { cartItems, addToCart } = useCart();
    const [qty, setQty] = useState(1);
    const [selectedSize, setSelectedSize] = useState('M');
    const [addedMsg, setAddedMsg] = useState('');
    const [activeImgIndex, setActiveImgIndex] = useState(0);
    const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const res = await fetch(`${API_URL}/products`);
                if (res.ok) {
                    const data = await res.json();
                    const mapped = data.map(p => ({
                        ...p,
                        img: p.image_url,
                        priceFormatted: `₹${p.price.toLocaleString('en-IN')}.00`,
                        badge: p.tags && p.tags.length > 0 ? p.tags[0] : '',
                        color: p.category || 'Standard'
                    }));
                    setAllProducts(mapped);
                    
                    const found = mapped.find(p => String(p.id) === String(id));
                    setProduct(found || mapped[0]);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [id]);

    useEffect(() => {
        if (product) {
            setQty(1);
            setSelectedSize(product.sizes?.[0] || 'M');
            setAddedMsg('');
            setActiveImgIndex(0);
        }
    }, [product]);

    if (loading) {
        return <div className="min-h-screen bg-white flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#A96142] border-t-transparent rounded-full animate-spin"></div></div>;
    }

    if (!product) {
        return <div className="min-h-screen bg-white flex items-center justify-center">Product not found</div>;
    }

    const images = product.images?.length
        ? product.images
        : [product.img, null, null, null];

    const currentIndex = allProducts.findIndex(p => p.id === product.id);
    const prevId = allProducts[(currentIndex - 1 + allProducts.length) % allProducts.length]?.id;
    const nextId = allProducts[(currentIndex + 1) % allProducts.length]?.id;

    function goToProduct(newId) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        routerNavigate(`/product/${newId}`);
    }

    function handleAddToCart() {
        addToCart(product, selectedSize, qty, product.color || 'Standard');
        setAddedMsg(`${qty} × ${product.name} (${selectedSize}) added!`);
        setTimeout(() => setAddedMsg(''), 3000);
    }
"""

content = old_logic_pattern.sub(new_logic, content)

# Also fix the 'You may also like' section
content = content.replace("{PRODUCTS.filter((p) => p.id !== product.id).slice(0, 4).map((p) => (",
                          "{allProducts.filter((p) => p.id !== product.id).slice(0, 4).map((p) => (")

content = content.replace("<p className=\"font-avenir text-[#A96142] text-sm\">{p.price}</p>",
                          "<p className=\"font-avenir text-[#A96142] text-sm\">{p.priceFormatted || p.price}</p>")

content = content.replace("<p className=\"font-avenir text-xl text-[#A96142] mt-5\">{product.price}</p>",
                          "<p className=\"font-avenir text-xl text-[#A96142] mt-5\">{product.priceFormatted || product.price}</p>")


with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
