import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import ProductDetailModal from '../components/Product/ProductDetailModal';

const WishlistPage = () => {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showConfirmDelete, setShowConfirmDelete] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchWishlist();
    }, []);

    const fetchWishlist = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/wishlist');
            setWishlist(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching wishlist:', error);
            if (error.response && error.response.status === 401) {
                alert('Please login to view your wishlist.');
                navigate('/login');
            }
            setLoading(false);
        }
    };

    const handleRemoveFromWishlist = async (productId) => {
        try {
            await apiClient.delete(`/wishlist/remove/${productId}`);
            setWishlist(wishlist.filter(item => item.productId !== productId));
            setShowConfirmDelete(null);
            alert('Product removed from wishlist!');
        } catch (error) {
            console.error('Error removing from wishlist:', error);
            alert('Failed to remove from wishlist');
        }
    };

    const handleAddToCart = async (productId) => {
        try {
            await apiClient.post('/cart/add', { productId });
            
            // Move from wishlist to cart
            await apiClient.post(`/wishlist/move-to-cart/${productId}`);
            
            // Remove from local state
            setWishlist(wishlist.filter(item => item.productId !== productId));
            
            alert('Product added to cart!');
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert('Failed to add to cart');
        }
    };

    const openProductDetails = async (productId) => {
        try {
            const response = await apiClient.get(`/products/${productId}`);
            setSelectedProduct(response.data);
            setShowDetailModal(true);
        } catch (error) {
            console.error('Error fetching product details:', error);
            alert('Failed to load product details');
        }
    };

    const closeDetailModal = () => {
        setSelectedProduct(null);
        setShowDetailModal(false);
        // Refresh wishlist when closing modal in case changes were made
        fetchWishlist();
    };

    return (
        <div className="container my-5">
            <h2 className="text-center mb-4">My Wishlist</h2>
            
            {loading ? (
                <div className="text-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : wishlist.length === 0 ? (
                <div className="text-center">
                    <p>Your wishlist is empty.</p>
                    <Link to="/products" className="btn btn-primary">Browse Products</Link>
                </div>
            ) : (
                <>
                    <div className="row row-cols-1 row-cols-md-3 g-4">
                        {wishlist.map((item) => (
                            <div className="col" key={item._id}>
                                <div className="card h-100">
                                    <div className="position-relative">
                                        <img 
                                            src={item.image ? `http://localhost:5000${item.image}` : '/images/default-laptop.jpg'}
                                            className="card-img-top"
                                            alt={item.name}
                                            style={{ height: '200px', objectFit: 'contain' }}
                                        />
                                        {showConfirmDelete === item.productId && (
                                            <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
                                                <div className="bg-white p-3 rounded">
                                                    <p>Are you sure you want to remove this item?</p>
                                                    <div className="d-flex justify-content-between">
                                                        <button 
                                                            className="btn btn-danger"
                                                            onClick={() => handleRemoveFromWishlist(item.productId)}
                                                        >
                                                            Yes, Remove
                                                        </button>
                                                        <button 
                                                            className="btn btn-secondary"
                                                            onClick={() => setShowConfirmDelete(null)}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="card-body d-flex flex-column">
                                        <h5 className="card-title">{item.name}</h5>
                                        <p className="card-text text-muted">{item.brand}</p>
                                        <div className="mt-auto">
                                            <p className="card-text fw-bold">{item.price.toLocaleString()} đ</p>
                                            <div className="d-flex justify-content-between">
                                                <button 
                                                    className="btn btn-outline-primary"
                                                    onClick={() => openProductDetails(item.productId)}
                                                >
                                                    Details
                                                </button>
                                                <button 
                                                    className="btn btn-success"
                                                    onClick={() => handleAddToCart(item.productId)}
                                                >
                                                    Add to Cart
                                                </button>
                                                <button 
                                                    className="btn btn-outline-danger"
                                                    onClick={() => setShowConfirmDelete(item.productId)}
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="card-footer">
                                        <small className="text-muted">Added on {new Date(item.addedAt).toLocaleDateString()}</small>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
            
            {showDetailModal && selectedProduct && (
                <ProductDetailModal 
                    product={selectedProduct}
                    onClose={closeDetailModal}
                />
            )}
        </div>
    );
};

export default WishlistPage;
