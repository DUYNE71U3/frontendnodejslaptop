import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';
import apiClient from '../api/apiClient';
import ProductDetailModal from '../components/Product/ProductDetailModal';

const HomePage = () => {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    useEffect(() => {
        // Fetch some products to display as featured items
        const fetchFeaturedProducts = async () => {
            try {
                const response = await apiClient.get('/products');
                // Take only first 3 products as featured
                setFeaturedProducts(response.data.slice(0, 3));
                setLoading(false);
            } catch (error) {
                console.error('Error fetching featured products:', error);
                setLoading(false);
            }
        };

        fetchFeaturedProducts();
    }, []);

    // Function to open product detail modal
    const openProductDetail = (product) => {
        setSelectedProduct(product);
        setShowDetailModal(true);
    };

    // Function to close product detail modal
    const closeProductDetail = () => {
        setSelectedProduct(null);
        setShowDetailModal(false);
    };

    return (
        <div className="home-page">
            {/* Hero Section with Carousel */}
            <section className="hero-section">
                <div id="homeCarousel" className="carousel slide" data-bs-ride="carousel">
                    <div className="carousel-indicators">
                        <button type="button" data-bs-target="#homeCarousel" data-bs-slide-to="0" className="active"></button>
                        <button type="button" data-bs-target="#homeCarousel" data-bs-slide-to="1"></button>
                        <button type="button" data-bs-target="#homeCarousel" data-bs-slide-to="2"></button>
                    </div>
                    <div className="carousel-inner">
                        <div className="carousel-item active">
                            <img src="/images/banner1.jpg" className="d-block w-100" alt="Latest Laptops" />
                            <div className="carousel-caption">
                                <h2>Latest Laptops with Amazing Specs</h2>
                                <p>Find the perfect laptop for your needs</p>
                                <Link to="/products" className="btn btn-primary">Shop Now</Link>
                            </div>
                        </div>
                        <div className="carousel-item">
                            <img src="/images/banner2.jpg" className="d-block w-100" alt="Gaming Laptops" />
                            <div className="carousel-caption">
                                <h2>Gaming Laptops</h2>
                                <p>Unleash your gaming potential with our high-performance gaming laptops</p>
                                <Link to="/products" className="btn btn-primary">Shop Now</Link>
                            </div>
                        </div>
                        <div className="carousel-item">
                            <img src="/images/banner3.jpg" className="d-block w-100" alt="Business Laptops" />
                            <div className="carousel-caption">
                                <h2>Business Laptops</h2>
                                <p>Elevate your productivity with our business-class laptops</p>
                                <Link to="/products" className="btn btn-primary">Shop Now</Link>
                            </div>
                        </div>
                    </div>
                    <button className="carousel-control-prev" type="button" data-bs-target="#homeCarousel" data-bs-slide="prev">
                        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                        <span className="visually-hidden">Previous</span>
                    </button>
                    <button className="carousel-control-next" type="button" data-bs-target="#homeCarousel" data-bs-slide="next">
                        <span className="carousel-control-next-icon" aria-hidden="true"></span>
                        <span className="visually-hidden">Next</span>
                    </button>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="container">
                    <h2 className="section-title">Why Choose Us?</h2>
                    <div className="row">
                        <div className="col-md-3">
                            <div className="feature-card">
                                <img src="/images/feature-quality.png" alt="Quality Products" className="feature-icon" />
                                <h3>Quality Products</h3>
                                <p>We offer only the best laptops from trusted brands</p>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="feature-card">
                                <img src="/images/feature-price.png" alt="Competitive Prices" className="feature-icon" />
                                <h3>Best Prices</h3>
                                <p>Competitive prices with regular discounts and promotions</p>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="feature-card">
                                <img src="/images/feature-delivery.png" alt="Fast Delivery" className="feature-icon" />
                                <h3>Fast Delivery</h3>
                                <p>Quick and reliable delivery to your doorstep</p>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="feature-card">
                                <img src="/images/feature-support.png" alt="Customer Support" className="feature-icon" />
                                <h3>Expert Support</h3>
                                <p>Dedicated customer service and technical support</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Products Section */}
            <section className="featured-products-section">
                <div className="container">
                    <h2 className="section-title">Featured Products</h2>
                    {loading ? (
                        <div className="text-center my-5">
                            <div className="spinner-border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : (
                        <div className="row row-cols-1 row-cols-md-3 g-4">
                            {featuredProducts.map(product => (
                                <div className="col" key={product._id}>
                                    <div className="product-card h-100">
                                        <div className="product-image-container">
                                            <img 
                                                src={product.image ? `http://localhost:5000${product.image}` : '/images/default-laptop.jpg'} 
                                                alt={product.name} 
                                                className="product-image"
                                            />
                                        </div>
                                        <div className="product-info">
                                            <h3 className="product-title">{product.name}</h3>
                                            <p className="product-brand">{product.brand}</p>
                                            <p className="product-price">{product.price?.toLocaleString()} đ</p>
                                            <button 
                                                onClick={() => openProductDetail(product)} 
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
                    <div className="text-center mt-4">
                        <Link to="/products" className="btn btn-primary">View All Products</Link>
                    </div>
                </div>
            </section>

            {/* Brands Section */}
            <section className="brands-section">
                <div className="container">
                    <h2 className="section-title">Top Brands We Offer</h2>
                    <div className="brand-logos">
                        <div className="brand-logo">
                            <img src="/images/brand-dell.png" alt="Dell" />
                        </div>
                        <div className="brand-logo">
                            <img src="/images/brand-hp.png" alt="HP" />
                        </div>
                        <div className="brand-logo">
                            <img src="/images/brand-apple.png" alt="Apple" />
                        </div>
                        <div className="brand-logo">
                            <img src="/images/brand-lenovo.png" alt="Lenovo" />
                        </div>
                        <div className="brand-logo">
                            <img src="/images/brand-asus.png" alt="Asus" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="testimonials-section">
                <div className="container">
                    <h2 className="section-title">What Our Customers Say</h2>
                    <div className="row">
                        <div className="col-md-4">
                            <div className="testimonial-card">
                                <div className="testimonial-text">
                                    <p>"I bought a gaming laptop from here and I'm extremely satisfied with the performance. Great service too!"</p>
                                </div>
                                <div className="testimonial-author">
                                    <img src="/images/user1.jpg" alt="User 1" className="testimonial-avatar" />
                                    <div className="testimonial-info">
                                        <h4>Nguyễn Văn A</h4>
                                        <div className="testimonial-rating">★★★★★</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="testimonial-card">
                                <div className="testimonial-text">
                                    <p>"The prices are competitive and the delivery was faster than expected. Very happy with my purchase!"</p>
                                </div>
                                <div className="testimonial-author">
                                    <img src="/images/user2.jpg" alt="User 2" className="testimonial-avatar" />
                                    <div className="testimonial-info">
                                        <h4>Trần Thị B</h4>
                                        <div className="testimonial-rating">★★★★★</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="testimonial-card">
                                <div className="testimonial-text">
                                    <p>"Excellent customer service! They helped me pick the perfect laptop for my work needs."</p>
                                </div>
                                <div className="testimonial-author">
                                    <img src="/images/user3.jpg" alt="User 3" className="testimonial-avatar" />
                                    <div className="testimonial-info">
                                        <h4>Lê Văn C</h4>
                                        <div className="testimonial-rating">★★★★☆</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Newsletter Section */}
            <section className="newsletter-section">
                <div className="container">
                    <div className="newsletter-content">
                        <h2>Stay Updated</h2>
                        <p>Subscribe to our newsletter for the latest products, deals, and tech news</p>
                        <form className="newsletter-form">
                            <div className="input-group">
                                <input type="email" className="form-control" placeholder="Your Email Address" />
                                <button className="btn btn-primary" type="submit">Subscribe</button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>
            
            {/* Product Detail Modal */}
            {showDetailModal && (
                <ProductDetailModal 
                    product={selectedProduct} 
                    onClose={closeProductDetail} 
                />
            )}
        </div>
    );
};

export default HomePage;