import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import { useNavigate } from 'react-router-dom';
import './ProductDetailModal.css';

const ProductDetailModal = ({ product, onClose }) => {
    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState(0);
    const [reviewCount, setReviewCount] = useState(0);
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
    const [userReview, setUserReview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const isLoggedIn = !!localStorage.getItem('token');
    const navigate = useNavigate();

    useEffect(() => {
        if (product) {
            fetchReviews();
            fetchProductRating();
        }
    }, [product]);

    const fetchReviews = async () => {
        try {
            const response = await apiClient.get(`/reviews/product/${product._id}`);
            setReviews(response.data);
            
            // Check if the user has already reviewed this product
            if (isLoggedIn) {
                const userReview = response.data.find(
                    review => review.userId._id === localStorage.getItem('userId')
                );
                
                if (userReview) {
                    setUserReview(userReview);
                    setNewReview({ rating: userReview.rating, comment: userReview.comment });
                }
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
        }
    };

    const fetchProductRating = async () => {
        try {
            const response = await apiClient.get(`/reviews/product/${product._id}/rating`);
            setAverageRating(response.data.averageRating);
            setReviewCount(response.data.reviewCount);
        } catch (error) {
            console.error('Error fetching product rating:', error);
        }
    };

    const handleAddToCart = async () => {
        try {
            await apiClient.post('/cart/add', { productId: product._id });
            alert('Product added to cart!');
            onClose();
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert('Failed to add to cart');
        }
    };

    const handleRatingChange = (rating) => {
        setNewReview({ ...newReview, rating });
    };

    const handleCommentChange = (e) => {
        setNewReview({ ...newReview, comment: e.target.value });
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        
        if (!isLoggedIn) {
            alert('Please login to submit a review.');
            navigate('/login');
            return;
        }
        
        setIsSubmitting(true);
        setError(null);
        
        try {
            let response;
            
            if (userReview) {
                // Update existing review
                response = await apiClient.put(`/reviews/${userReview._id}`, newReview);
                
                // Update in the UI
                setReviews(reviews.map(review => 
                    review._id === userReview._id ? response.data : review
                ));
                setUserReview(response.data);
            } else {
                // Create new review
                response = await apiClient.post('/reviews', {
                    productId: product._id,
                    ...newReview
                });
                
                // Add to the UI
                setReviews([response.data, ...reviews]);
                setUserReview(response.data);
            }
            
            // Refresh the average rating
            fetchProductRating();
            
            alert(userReview ? 'Review updated successfully!' : 'Review submitted successfully!');
        } catch (error) {
            console.error('Error submitting review:', error);
            setError(error.response?.data?.message || 'Failed to submit review');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteReview = async () => {
        if (!userReview) return;
        
        if (window.confirm('Are you sure you want to delete your review?')) {
            try {
                await apiClient.delete(`/reviews/${userReview._id}`);
                
                // Remove from the UI
                setReviews(reviews.filter(review => review._id !== userReview._id));
                setUserReview(null);
                setNewReview({ rating: 5, comment: '' });
                
                // Refresh the average rating
                fetchProductRating();
                
                alert('Review deleted successfully!');
            } catch (error) {
                console.error('Error deleting review:', error);
                alert('Failed to delete review');
            }
        }
    };

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <span 
                    key={i} 
                    className={`star ${i <= rating ? 'filled' : ''}`}
                >
                    ★
                </span>
            );
        }
        return stars;
    };

    if (!product) {
        return null;
    }

    return (
        <div className="modal show fade" style={{ display: 'block' }}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{product.name}</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        <div className="container">
                            <div className="row mb-4">
                                <div className="col-md-6">
                                    <img
                                        src={`http://localhost:5000${product.image}` || 'https://via.placeholder.com/400'}
                                        alt={product.name}
                                        className="img-fluid"
                                    />
                                </div>
                                <div className="col-md-6">
                                    <p><strong>Brand:</strong> {product.brand}</p>
                                    <p><strong>Price:</strong> {product.price.toLocaleString()} đ</p>
                                    <p><strong>Category:</strong> {product.category ? product.category.name : 'N/A'}</p>
                                    <p><strong>CPU:</strong> {product.cpu}</p>
                                    <p><strong>RAM:</strong> {product.ram}</p>
                                    <p><strong>Storage:</strong> {product.storage}</p>
                                    <p><strong>GPU:</strong> {product.gpu || 'N/A'}</p>
                                    <p><strong>Screen:</strong> {product.screen}</p>
                                    <p><strong>Ports:</strong> {product.ports || 'N/A'}</p>
                                    <p><strong>OS:</strong> {product.os}</p>
                                    <p><strong>Weight:</strong> {product.weight || 'N/A'}</p>
                                    <p><strong>Dimensions:</strong> {product.dimensions || 'N/A'}</p>
                                    <p><strong>Battery:</strong> {product.battery || 'N/A'}</p>
                                    <p><strong>Warranty:</strong> {product.warranty || 'N/A'}</p>
                                    
                                    <div className="product-rating mt-3">
                                        <div className="d-flex align-items-center">
                                            <div className="stars">
                                                {renderStars(Math.round(averageRating))}
                                            </div>
                                            <span className="ms-2">
                                                {averageRating.toFixed(1)} ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {product.isNew && (
                                        <span className="badge bg-success mt-2">New</span>
                                    )}
                                </div>
                            </div>
                            
                            <hr />
                            
                            {/* Reviews Section */}
                            <div className="reviews-section">
                                <h4>Customer Reviews</h4>
                                
                                {/* Review Form */}
                                <div className="review-form-container mb-4">
                                    <h5>{userReview ? 'Your Review' : 'Write a Review'}</h5>
                                    <form onSubmit={handleSubmitReview}>
                                        <div className="mb-3">
                                            <label className="form-label">Rating:</label>
                                            <div className="stars-input">
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <span 
                                                        key={star} 
                                                        className={`star ${star <= newReview.rating ? 'filled' : ''}`}
                                                        onClick={() => handleRatingChange(star)}
                                                    >
                                                        ★
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="comment" className="form-label">Your Review:</label>
                                            <textarea 
                                                id="comment"
                                                className="form-control" 
                                                value={newReview.comment} 
                                                onChange={handleCommentChange}
                                                placeholder="Share your thoughts about this product"
                                                rows="3"
                                            ></textarea>
                                        </div>
                                        
                                        {error && (
                                            <div className="alert alert-danger">{error}</div>
                                        )}
                                        
                                        <div className="d-flex">
                                            <button 
                                                type="submit" 
                                                className="btn btn-primary"
                                                disabled={isSubmitting}
                                            >
                                                {isSubmitting ? 'Submitting...' : userReview ? 'Update Review' : 'Submit Review'}
                                            </button>
                                            
                                            {userReview && (
                                                <button 
                                                    type="button" 
                                                    className="btn btn-outline-danger ms-2"
                                                    onClick={handleDeleteReview}
                                                >
                                                    Delete Review
                                                </button>
                                            )}
                                        </div>
                                    </form>
                                </div>
                                
                                {/* Reviews List */}
                                <div className="reviews-list">
                                    {reviews.length === 0 ? (
                                        <p className="text-muted">No reviews yet. Be the first to review this product!</p>
                                    ) : (
                                        <div>
                                            {reviews.map(review => (
                                                <div key={review._id} className="review-item">
                                                    <div className="d-flex justify-content-between">
                                                        <div>
                                                            <h6>{review.userId.username}</h6>
                                                            <div className="stars mb-2">
                                                                {renderStars(review.rating)}
                                                            </div>
                                                        </div>
                                                        <small className="text-muted">
                                                            {new Date(review.createdAt).toLocaleDateString()}
                                                        </small>
                                                    </div>
                                                    <p>{review.comment}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-success" onClick={handleAddToCart}>
                            Add to Cart
                        </button>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailModal;