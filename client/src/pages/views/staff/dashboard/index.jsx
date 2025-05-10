// client/src/pages/views/staff/dashboard/index.jsx
import React, { useEffect, useState } from 'react';
import { FaShoppingCart, FaTrash } from 'react-icons/fa';
import { ENDPOINT } from '../../../../services/utilities';
import useAuthStore from '../../../../services/stores/authStore';
import useProductsStore from '../../../../services/stores/products/productsStore';
import useTransactionsStore from '../../../../services/stores/transactions/transactionStore';
import NoImage from "../../../../assets/No-Image.png";
import Swal from 'sweetalert2';

const Dashboard = () => {
    const { token, auth } = useAuthStore();
    const { getProducts, data: productsData, deducProduct } = useProductsStore();
    const { getTransactions } = useTransactionsStore();
    
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalAmount, setTotalAmount] = useState(0);
    
    useEffect(() => {
        if (token) {
            getProducts(token);
            getTransactions(token);
            setLoading(true);
        }
    }, [token]);
    
    useEffect(() => {
        if (productsData) {
            // Filter out products with no stock
            const availableProducts = productsData.filter(product => product.inStock > 0);
            setProducts(availableProducts);
            
            // Extract unique categories (using unit as category for this example)
            const uniqueCategories = [...new Set(availableProducts.map(product => product.unit))];
            setCategories(uniqueCategories);
            
            setLoading(false);
        }
    }, [productsData]);
    
    useEffect(() => {
        // Calculate total amount whenever cart changes
        const total = cart.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        setTotalAmount(total);
    }, [cart]);
    
    const addToCart = (product) => {
        const existingItem = cart.find(item => item.id === product._id);
        
        if (existingItem) {
            // Check if we have enough stock
            if (existingItem.quantity >= product.inStock) {
                Swal.fire({
                    title: 'Stock Limit Reached',
                    text: `Only ${product.inStock} item(s) available in stock`,
                    icon: 'warning',
                    confirmButtonColor: '#3085d6'
                });
                return;
            }
            
            setCart(cart.map(item => 
                item.id === product._id 
                    ? { ...item, quantity: item.quantity + 1 } 
                    : item
            ));
        } else {
            setCart([...cart, {
                id: product._id,
                name: product.productName,
                price: product.sellingPrice,
                image: product.image,
                quantity: 1,
                maxQuantity: product.inStock
            }]);
        }
    };
    
    const removeFromCart = (productId) => {
        setCart(cart.filter(item => item.id !== productId));
    };
    
    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity < 1) return;
        
        const product = cart.find(item => item.id === productId);
        if (product && newQuantity > product.maxQuantity) {
            Swal.fire({
                title: 'Stock Limit Reached',
                text: `Only ${product.maxQuantity} item(s) available in stock`,
                icon: 'warning',
                confirmButtonColor: '#3085d6'
            });
            return;
        }
        
        setCart(cart.map(item => 
            item.id === productId 
                ? { ...item, quantity: newQuantity } 
                : item
        ));
    };
    
    const filteredProducts = products.filter(product => {
        // Apply search filter
        const matchesSearch = product.productName.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Apply category filter
        const matchesCategory = filterCategory === 'all' || product.unit === filterCategory;
        
        return matchesSearch && matchesCategory;
    });
    
    const completeSale = async () => {
        if (cart.length === 0) {
            Swal.fire({
                title: 'Empty Cart',
                text: 'Please add products to your cart before checkout',
                icon: 'warning',
                confirmButtonColor: '#3085d6'
            });
            return;
        }
        
        // Confirm sale
        const result = await Swal.fire({
            title: 'Complete Sale',
            text: `Total Amount: ₱${totalAmount.toFixed(2)}`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Complete Sale'
        });
        
        if (result.isConfirmed) {
            const saleData = {
                products: cart.map(item => item.id),
                transactionType: 'SALE',
                quantity: cart.reduce((sum, item) => sum + item.quantity, 0),
                createdBy: auth._id
            };
            
            try {
                await deducProduct(saleData, token);
                
                Swal.fire({
                    title: 'Sale Completed',
                    text: 'Transaction has been recorded successfully',
                    icon: 'success',
                    confirmButtonColor: '#3085d6'
                });
                
                setCart([]);
                
                getProducts(token);
            } catch (error) {
                Swal.fire({
                    title: 'Error',
                    text: 'Failed to complete the sale. Please try again.',
                    icon: 'error',
                    confirmButtonColor: '#3085d6'
                });
            }
        }
    };
    
    return (
        <div className="container mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold mb-6">Point of Sale</h1>
            
            <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-2/3 bg-white rounded-lg shadow-md p-4">
                    <div className="mb-4 flex flex-col sm:flex-row justify-between gap-4">
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-md w-full sm:w-1/2"
                        />
                        
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-md"
                        >
                            <option value="all">All Categories</option>
                            {categories.map((category, index) => (
                                <option key={index} value={category}>{category}</option>
                            ))}
                        </select>
                    </div>
                    
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <p className="text-lg text-gray-500">Loading products...</p>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="flex justify-center items-center h-64">
                            <p className="text-lg text-gray-500">No products found</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {filteredProducts.map((product) => (
                                <div 
                                    key={product._id}
                                    className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                                    onClick={() => addToCart(product)}
                                >
                                    <div className="h-40 bg-gray-100 flex items-center justify-center">
                                        <img
                                            src={`${ENDPOINT}/assets/products/${product.image}`}
                                            alt={product.productName}
                                            className="h-full object-cover"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = NoImage;
                                            }}
                                        />
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-semibold text-gray-800 truncate">{product.productName}</h3>
                                        <p className="text-sm text-gray-500">{product.unitSize} {product.unit}</p>
                                        <div className="flex justify-between items-center mt-2">
                                            <p className="font-bold text-blue-600">₱{product.sellingPrice}</p>
                                            <p className="text-sm text-gray-500">Stock: {product.inStock}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                
                {/* Cart Section */}
                <div className="w-full md:w-1/3 bg-white rounded-lg shadow-md p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Shopping Cart</h2>
                        <div className="bg-blue-100 text-blue-800 p-2 rounded-full">
                            <FaShoppingCart className="h-5 w-5" />
                        </div>
                    </div>
                    
                    {cart.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                            <FaShoppingCart className="h-12 w-12 mb-4" />
                            <p>Your cart is empty</p>
                            <p className="text-sm">Click on products to add them to cart</p>
                        </div>
                    ) : (
                        <>
                            <div className="max-h-96 overflow-y-auto">
                                {cart.map((item) => (
                                    <div key={item.id} className="flex items-center gap-3 p-2 border-b border-gray-100">
                                        <img
                                            src={`${ENDPOINT}/assets/products/${item.image}`}
                                            alt={item.name}
                                            className="h-16 w-16 object-cover rounded-md"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = NoImage;
                                            }}
                                        />
                                        <div className="flex-1">
                                            <p className="font-medium">{item.name}</p>
                                            <p className="text-gray-500 text-sm">₱{item.price}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="px-2 py-1 bg-gray-100 rounded-md"
                                            >
                                                -
                                            </button>
                                            <span className="w-8 text-center">{item.quantity}</span>
                                            <button 
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="px-2 py-1 bg-gray-100 rounded-md"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <button 
                                            onClick={() => removeFromCart(item.id)}
                                            className="p-1 text-red-500 hover:bg-red-50 rounded-full"
                                        >
                                            <FaTrash className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="mt-4 border-t border-gray-200 pt-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-600">Subtotal:</span>
                                    <span className="font-semibold">₱{totalAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-gray-600">Total:</span>
                                    <span className="font-bold text-lg">₱{totalAmount.toFixed(2)}</span>
                                </div>
                                
                                <button
                                    onClick={completeSale}
                                    className="w-full py-3 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700"
                                >
                                    Complete Sale
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;