import React, { useEffect, useState } from 'react';
import apiClient from '../api/apiClient';
import { useNavigate } from 'react-router-dom';
import CheckoutForm from '../components/CheckoutForm';

const CartPage = () => {
    const [cart, setCart] = useState([]);
    const [showCheckoutForm, setShowCheckoutForm] = useState(false);
    const [couponCode, setCouponCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [discountedTotal, setDiscountedTotal] = useState(0);
    const [couponError, setCouponError] = useState('');
    const [couponSuccess, setCouponSuccess] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCart = async () => {
            try {
                const response = await apiClient.get('/cart');
                setCart(response.data);
            } catch (error) {
                console.error('Error fetching cart:', error);
                // Nếu lỗi 401 (Unauthorized), chuyển hướng đến trang đăng nhập
                if (error.response && error.response.status === 401) {
                    alert('Please login to view your cart.');
                    navigate('/login');
                }
            }
        };

        fetchCart();
    }, [navigate]);

    const handleRemoveFromCart = async (productId) => {
        try {
            // Đảm bảo gửi đúng productId trong URL
            console.log('Removing product with ID:', productId);
            await apiClient.delete(`/cart/remove/${productId}`);
            
            // Cập nhật state để loại bỏ sản phẩm đã xóa
            setCart(cart.filter(item => item.productId !== productId));
            
            // Reset coupon nếu đã áp dụng
            if (appliedCoupon) {
                setAppliedCoupon(null);
                setDiscount(0);
                setDiscountAmount(0);
                setDiscountedTotal(0);
                setCouponSuccess('');
            }
            
            alert('Product removed from cart!');
        } catch (error) {
            console.error('Error removing from cart:', error);
            alert('Failed to remove from cart: ' + (error.response?.data?.message || 'Unknown error'));
        }
    };

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            setCouponError('Please enter a coupon code');
            return;
        }

        try {
            const response = await apiClient.post('/cart/apply-coupon', { code: couponCode });
            
            // Set thông tin giảm giá
            setDiscount(response.data.discount);
            setDiscountAmount(response.data.discountAmount);
            setDiscountedTotal(response.data.discountedTotal);
            setAppliedCoupon(response.data.couponCode);
            
            // Hiển thị thông báo thành công
            setCouponSuccess(`Coupon applied! You received a ${response.data.discount}% discount.`);
            setCouponError('');
        } catch (error) {
            console.error('Error applying coupon:', error);
            setCouponError(error.response?.data?.message || 'Failed to apply coupon');
            setCouponSuccess('');
            
            // Reset thông tin giảm giá nếu có lỗi
            setDiscount(0);
            setDiscountAmount(0);
            setDiscountedTotal(0);
            setAppliedCoupon(null);
        }
    };

    const handleCheckout = () => {
        setShowCheckoutForm(true);
    };

    const handleCreateOrder = async (shippingAddress, paymentMethod) => {
        try {
            // Thêm thông tin coupon vào order nếu đã áp dụng
            const orderData = { 
                shippingAddress, 
                paymentMethod,
                couponCode: appliedCoupon || '',
                discount: discount || 0
            };
            
            const response = await apiClient.post('/orders', orderData);
            alert('Order created successfully!');
            setCart([]); // Xóa giỏ hàng sau khi tạo đơn hàng thành công
            setShowCheckoutForm(false);
            navigate('/products'); // Chuyển hướng đến trang sản phẩm
        } catch (error) {
            console.error('Error creating order:', error);
            alert('Failed to create order');
        }
    };

    // Tính tổng giá trị giỏ hàng
    const totalPrice = cart.reduce((total, product) => total + product.price, 0);

    return (
        <div className="container my-5">
            <h2 className="text-center mb-4">Shopping Cart</h2>
            {cart.length === 0 ? (
                <p className="text-center">Your cart is empty.</p>
            ) : (
                <>
                    <ul className="list-group mb-3">
                        {cart.map((product) => (
                            <li
                                key={product._id}
                                className="list-group-item d-flex justify-content-between align-items-center"
                            >
                                <div>
                                    <strong>{product.name}</strong>
                                    <p className="text-muted">{product.brand}</p>
                                </div>
                                <span>{product.price.toLocaleString()} đ</span>
                                <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => handleRemoveFromCart(product.productId)}
                                >
                                    Remove
                                </button>
                            </li>
                        ))}
                    </ul>
                    
                    {/* Thêm phần nhập coupon */}
                    <div className="card mb-3">
                        <div className="card-body">
                            <h5 className="card-title">Coupon Code</h5>
                            <div className="input-group mb-2">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter coupon code"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value)}
                                    disabled={appliedCoupon !== null}
                                />
                                <button
                                    className="btn btn-primary"
                                    onClick={handleApplyCoupon}
                                    disabled={appliedCoupon !== null}
                                >
                                    Apply
                                </button>
                            </div>
                            
                            {couponError && (
                                <div className="alert alert-danger py-2">{couponError}</div>
                            )}
                            
                            {couponSuccess && (
                                <div className="alert alert-success py-2">{couponSuccess}</div>
                            )}
                            
                            {appliedCoupon && (
                                <button 
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={() => {
                                        setAppliedCoupon(null);
                                        setDiscount(0);
                                        setDiscountAmount(0);
                                        setDiscountedTotal(0);
                                        setCouponSuccess('');
                                        setCouponCode('');
                                    }}
                                >
                                    Remove Coupon
                                </button>
                            )}
                        </div>
                    </div>
                    
                    {/* Tính toán giá */}
                    <div className="card mb-3">
                        <div className="card-body">
                            <div className="d-flex justify-content-between">
                                <span>Subtotal:</span>
                                <span>{totalPrice.toLocaleString()} đ</span>
                            </div>
                            
                            {discount > 0 && (
                                <>
                                    <div className="d-flex justify-content-between text-success">
                                        <span>Discount ({discount}%):</span>
                                        <span>-{discountAmount.toLocaleString()} đ</span>
                                    </div>
                                    <hr />
                                    <div className="d-flex justify-content-between fw-bold">
                                        <span>Total:</span>
                                        <span>{discountedTotal.toLocaleString()} đ</span>
                                    </div>
                                </>
                            )}
                            
                            {discount === 0 && (
                                <div className="d-flex justify-content-between fw-bold">
                                    <span>Total:</span>
                                    <span>{totalPrice.toLocaleString()} đ</span>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="text-center mt-3">
                        <button className="btn btn-primary" onClick={handleCheckout}>Checkout</button>
                    </div>
                </>
            )}

            {showCheckoutForm && (
                <div>
                    <h3>Checkout</h3>
                    <CheckoutForm 
                        onSubmit={handleCreateOrder} 
                        totalPrice={discount > 0 ? discountedTotal : totalPrice} 
                    />
                </div>
            )}
        </div>
    );
};

export default CartPage;