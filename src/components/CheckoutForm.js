import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

const CheckoutForm = ({ onSubmit, totalPrice }) => {
    const [shippingAddress, setShippingAddress] = useState({
        address: '',
        phone: '',
        email: ''
    });
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [walletBalance, setWalletBalance] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch user's wallet balance
        const fetchWalletBalance = async () => {
            try {
                const response = await apiClient.get('/wallet/balance');
                setWalletBalance(response.data.balance);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching wallet balance:', error);
                setLoading(false);
            }
        };

        fetchWalletBalance();
    }, []);

    const handleChange = (e) => {
        setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        onSubmit(shippingAddress, paymentMethod);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="mb-3">
                <label htmlFor="address" className="form-label">Address</label>
                <input type="text" className="form-control" id="address" name="address" value={shippingAddress.address} onChange={handleChange} required />
            </div>
            <div className="mb-3">
                <label htmlFor="phone" className="form-label">Phone</label>
                <input type="text" className="form-control" id="phone" name="phone" value={shippingAddress.phone} onChange={handleChange} required />
            </div>
            <div className="mb-3">
                <label htmlFor="email" className="form-label">Email</label>
                <input type="email" className="form-control" id="email" name="email" value={shippingAddress.email} onChange={handleChange} required />
            </div>
            <div className="mb-3">
                <label className="form-label">Payment Method</label>
                <div className="form-check">
                    <input className="form-check-input" type="radio" name="paymentMethod" id="cod" value="COD" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} />
                    <label className="form-check-label" htmlFor="cod">
                        Direct Payment on Delivery
                    </label>
                </div>
                <div className="form-check">
                    <input className="form-check-input" type="radio" name="paymentMethod" id="vnpay" value="VNPAY" checked={paymentMethod === 'VNPAY'} onChange={() => setPaymentMethod('VNPAY')} />
                    <label className="form-check-label" htmlFor="vnpay">
                        Pay with E-Wallet 
                        {!loading && <span className="ms-2 badge bg-info">{walletBalance.toLocaleString()} đ</span>}
                    </label>
                </div>
                {paymentMethod === 'VNPAY' && walletBalance < totalPrice && (
                    <div className="alert alert-warning mt-2">
                        Your wallet balance is insufficient. Please <a href="/deposit">deposit more</a> to continue.
                    </div>
                )}
            </div>
            <button type="submit" className="btn btn-primary" disabled={paymentMethod === 'VNPAY' && walletBalance < totalPrice}>Checkout</button>
        </form>
    );
};

export default CheckoutForm;