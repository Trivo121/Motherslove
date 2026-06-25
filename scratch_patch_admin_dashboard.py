import re
import os

file_path = "client/src/pages/Admin/AdminDashboard.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Add API_URL
if "const API_URL" not in content:
    content = content.replace("export default function AdminDashboard() {", "const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';\n\nexport default function AdminDashboard() {")

# Update state variables
content = content.replace("const [stats] = useState(MOCK_STATS);", "const [stats, setStats] = useState(MOCK_STATS);")
content = content.replace("const [orders] = useState(MOCK_ORDERS);", "const [orders, setOrders] = useState(MOCK_ORDERS);")
content = content.replace("const [lowStock] = useState(MOCK_LOW_STOCK);", "const [lowStock, setLowStock] = useState(MOCK_LOW_STOCK);")

# Add fetch logic
fetch_logic = """
    useEffect(() => {
        async function fetchProducts() {
            try {
                const res = await fetch(`${API_URL}/products`);
                if (res.ok) {
                    const data = await res.json();
                    
                    setStats(prev => ({
                        ...prev,
                        totalProducts: data.length,
                        lowStockCount: data.filter(p => p.stock < 5).length
                    }));
                    
                    const mappedLowStock = data.filter(p => p.stock < 5).map(p => ({
                        name: p.name,
                        color: p.category || 'Standard',
                        stock: p.stock
                    }));
                    setLowStock(mappedLowStock);
                }
            } catch (err) {
                console.error("Failed to fetch products:", err);
            }
        }
        fetchProducts();
    }, []);
"""

content = re.sub(r"    const \[lowStock, setLowStock\] = useState\(MOCK_LOW_STOCK\);\n", r"    const [lowStock, setLowStock] = useState(MOCK_LOW_STOCK);\n" + fetch_logic, content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
