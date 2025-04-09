import React, { useEffect, useState } from 'react';
import apiClient from '../api/apiClient';
import ProductDetailModal from '../components/Product/ProductDetailModal';
import './HomePage.css'; // Import the same CSS used for HomePage

const ProductPage = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [noProductsMessage, setNoProductsMessage] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await apiClient.get('/categories');
                setCategories(response.data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        fetchCategories();

        fetchProducts(); // Gọi fetchProducts ban đầu để lấy tất cả sản phẩm
    }, []);

    const fetchProducts = async (categoryId = null) => {
        setLoading(true);
        try {
            let response;
            if (categoryId) {
                response = await apiClient.get(`/products/category/${categoryId}`);
            } else {
                response = await apiClient.get('/products');
            }

            if (response.data.length === 0) {
                setProducts([]);
                setNoProductsMessage("Chúng tôi hiện tại không có sản phẩm nào phù hợp");
            } else {
                setProducts(response.data);
                setNoProductsMessage(null);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching products:', error);
            setLoading(false);
        }
    };

    const handleCategoryChange = (e) => {
        const categoryId = e.target.value;
        setSelectedCategory(categoryId);
        fetchProducts(categoryId);
    };

    // Function to open product detail modal
    const openDetailModal = (product) => {
        setSelectedProduct(product);
        setShowDetailModal(true);
    };

    // Function to close product detail modal
    const closeDetailModal = () => {
        setSelectedProduct(null);
        setShowDetailModal(false);
    };

    return (
        <div className="container my-5">
            <h2 className="section-title">Our Products</h2>

            {/* Category filter */}
            <div className="mb-4">
                <label htmlFor="category" className="form-label">Filter by Category:</label>
                <select
                    id="category"
                    className="form-select"
                    value={selectedCategory || ''}
                    onChange={handleCategoryChange}
                >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                            {category.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Display products */}
            {loading ? (
                <div className="text-center my-5">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : noProductsMessage ? (
                <div className="alert alert-info text-center">{noProductsMessage}</div>
            ) : (
                <div className="row row-cols-1 row-cols-md-3 g-4">
                    {products.map((product) => (
                        <div className="col" key={product._id}>
                            <div className="product-card h-100 position-relative">
                                <div className="product-image-container">
                                    <img 
                                        src={product.image ? `http://localhost:5000${product.image}` : '/images/default-laptop.jpg'} 
                                        alt={product.name} 
                                        className="product-image"
                                    />
                                    {product.isNew && (
                                        <span className="badge bg-success position-absolute top-0 start-0 m-2">New</span>
                                    )}
                                </div>
                                <div className="product-info">
                                    <h3 className="product-title">{product.name}</h3>
                                    <p className="product-brand">{product.brand}</p>
                                    <p className="product-price">{product.price?.toLocaleString()} đ</p>
                                    <button 
                                        onClick={() => openDetailModal(product)} 
                                        className="btn btn-outline-primary w-100"
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Product Detail Modal */}
            {showDetailModal && (
                <ProductDetailModal 
                    product={selectedProduct} 
                    onClose={closeDetailModal} 
                />
            )}
        </div>
    );
};

export default ProductPage;