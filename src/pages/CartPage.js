import React, { useEffect, useState } from 'react';
import apiClient from '../api/apiClient';
import { useNavigate } from 'react-router-dom';
import CheckoutForm from '../components/CheckoutForm';

const CartPage = () => {
    const [cart, setCart] = useState([]);
    const [showCheckoutForm, setShowCheckoutForm] = useState(false);
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
            await apiClient.delete(`/cart/remove/${productId}`);
            setCart(cart.filter(product => product._id !== productId));
            alert('Product removed from cart!');
        } catch (error) {
            console.error('Error removing from cart:', error);
            alert('Failed to remove from cart');
        }
    };

    const handleCheckout = () => {
        setShowCheckoutForm(true);
    };

    const handleCreateOrder = async (shippingAddress, paymentMethod) => {
        try {
            const response = await apiClient.post('/orders', { shippingAddress, paymentMethod });
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
                                    onClick={() => handleRemoveFromCart(product._id)}
                                >
                                    Remove
                                </button>
                            </li>
                        ))}
                    </ul>
                    <div className="d-flex justify-content-between align-items-center">
                        <h4>Total:</h4>
                        <h4>{totalPrice.toLocaleString()} đ</h4>
                    </div>
                    <div className="text-center mt-3">
                        <button className="btn btn-primary" onClick={handleCheckout}>Checkout</button>
                    </div>
                </>
            )}

            {showCheckoutForm && (
                <div>
                    <h3>Checkout</h3>
                    <CheckoutForm onSubmit={handleCreateOrder} totalPrice={totalPrice} />
                </div>
            )}
        </div>
    );
};

export default CartPage;