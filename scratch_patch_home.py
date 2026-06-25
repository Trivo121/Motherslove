import re
import os

file_path = "client/src/pages/Home.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Remove PRODUCTS import
content = re.sub(r"import\s+{\s*PRODUCTS\s*}\s+from\s+['\"]../data/products.js['\"];?\n", "", content)

# Add API_URL
if "const API_URL" not in content:
    content = content.replace("const HomePage = () => {", "const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';\n\nconst HomePage = () => {")

# Add state and fetch logic
state_code = """    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProducts() {
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
                    setFeaturedProducts(mapped.slice(0, 4));
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchProducts();
    }, []);
"""

# Replace `const featuredProducts = PRODUCTS.slice(0, 4);`
content = content.replace("    const featuredProducts = PRODUCTS.slice(0, 4);\n", state_code)


content = content.replace("<p className=\"font-avenir text-[#A96142] mt-1\">{product.price}</p>",
                          "<p className=\"font-avenir text-[#A96142] mt-1\">{product.priceFormatted || product.price}</p>")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
