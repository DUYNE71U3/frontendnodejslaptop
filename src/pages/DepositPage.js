import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';

const DepositPage = () => {
    const [amount, setAmount] = useState('');
    const [walletBalance, setWalletBalance] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchWalletBalance = async () => {
            try {
                const response = await apiClient.get('/wallet/balance');
                setWalletBalance(response.data.balance);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching wallet balance:', error);
                if (error.response && error.response.status === 401) {
                    alert('Please login to access your wallet');
                    navigate('/login');
                }
                setLoading(false);
            }
        };

        fetchWalletBalance();
    }, [navigate]);

    const predefinedAmounts = [50000, 100000, 200000, 500000, 1000000];

    const handleAmountSelect = (selectedAmount) => {
        setAmount(selectedAmount.toString());
    };

    const handleDeposit = async (e) => {
        e.preventDefault();
        
        if (!amount || isNaN(amount) || parseInt(amount) <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        setIsProcessing(true);
        
        try {
            const response = await apiClient.post('/wallet/create_payment_url', { amount: parseInt(amount) });
            console.log("Payment URL:", response.data.paymentUrl);
            
            // Store current balance in sessionStorage to verify increase later
            sessionStorage.setItem('previousWalletBalance', walletBalance);
            
            // Redirect to VNPAY payment page
            window.location.href = response.data.paymentUrl;
        } catch (error) {
            setIsProcessing(false);
            console.error('Error creating payment:', error);
            alert('Failed to process payment. Please try again.');
        }
    };

    return (
        <div className="container my-5">
            <h2 className="text-center mb-4">E-Wallet Deposit</h2>
            
            <div className="card mb-4">
                <div className="card-header">Wallet Balance</div>
                <div className="card-body">
                    {loading ? (
                        <p>Loading balance...</p>
                    ) : (
                        <h3>{walletBalance.toLocaleString()} đ</h3>
                    )}
                </div>
            </div>

            <div className="card">
                <div className="card-header">Deposit Money</div>
                <div className="card-body">
                    <form onSubmit={handleDeposit}>
                        <div className="mb-3">
                            <label htmlFor="amount" className="form-label">Amount (VND)</label>
                            <input 
                                type="number" 
                                className="form-control" 
                                id="amount" 
                                value={amount} 
                                onChange={(e) => setAmount(e.target.value)} 
                                min="10000"
                                required 
                            />
                            <small className="text-muted">Minimum deposit amount is 10,000 VND</small>
                        </div>
                        
                        <div className="mb-4">
                            <p>Quick select amount:</p>
                            <div className="d-flex flex-wrap gap-2">
                                {predefinedAmounts.map(predefinedAmount => (
                                    <button 
                                        key={predefinedAmount}
                                        type="button" 
                                        className={`btn ${amount === predefinedAmount.toString() ? 'btn-primary' : 'btn-outline-primary'}`}
                                        onClick={() => handleAmountSelect(predefinedAmount)}
                                    >
                                        {predefinedAmount.toLocaleString()} đ
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        <button 
                            type="submit" 
                            className="btn btn-primary"
                            disabled={isProcessing}
                        >
                            {isProcessing ? 'Processing...' : 'Deposit with VNPAY'}
                        </button>
                    </form>
                </div>
            </div>

            <div className="mt-4">
                <div className="alert alert-info">
                    <h5>VNPAY Test Environment</h5>
                    <p>This is connected to VNPAY's sandbox environment. Use the following test account:</p>
                    <ul>
                        <li><strong>Bank:</strong> NCB</li>
                        <li><strong>Card Number:</strong> 9704198526191432198</li>
                        <li><strong>Account Name:</strong> NGUYEN VAN A</li>
                        <li><strong>Expiry Date:</strong> 07/15</li>
                        <li><strong>OTP:</strong> 123456</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default DepositPage;