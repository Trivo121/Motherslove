import re
import os

file_path = "client/src/pages/Shop.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Remove PRODUCTS import
content = re.sub(r"import\s+{\s*PRODUCTS\s*}\s+from\s+['\"]../data/products.js['\"];?\n", "", content)

# Add API_URL
if "const API_URL" not in content:
    content = content.replace("export default function AllProductsPage() {", "const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';\n\nexport default function AllProductsPage() {")

# Add state and useEffect for fetching products
state_code = """
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
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
                    setProducts(mapped);
                }
            } catch (err) {
                console.error("Failed to fetch products:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchProducts();
    }, []);
"""

content = re.sub(r"const \[activeFilter, setActiveFilter\] = useState\(location\.state\?\.category \|\| 'all'\);\n", 
                 r"const [activeFilter, setActiveFilter] = useState(location.state?.category || 'all');\n" + state_code, content)

# Replace PRODUCTS with products
content = content.replace("activeFilter === 'all' ? PRODUCTS : PRODUCTS.filter((p) => p.category === activeFilter);",
                          "activeFilter === 'all' ? products : products.filter((p) => p.category === activeFilter);")

# Update ProductCard to use priceFormatted
content = content.replace("<p className=\"font-avenir text-[#A96142] mt-1\">{product.price}</p>",
                          "<p className=\"font-avenir text-[#A96142] mt-1\">{product.priceFormatted || product.price}</p>")

# Add loading state render
content = content.replace("<section className=\"px-6 md:px-10 pb-24\">",
                          """<section className="px-6 md:px-10 pb-24">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-8 h-8 border-2 border-[#A96142] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (""")

content = content.replace("</section>",
                          """)}\n            </section>""")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
