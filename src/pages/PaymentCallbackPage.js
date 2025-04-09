import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';

const PaymentCallbackPage = () => {
    const [status, setStatus] = useState('loading');
    const [message, setMessage] = useState('');
    const [balance, setBalance] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const processPayment = async () => {
            try {
                const queryParams = new URLSearchParams(location.search);
                const responseCode = queryParams.get('vnp_ResponseCode');
                
                // Log all query parameters for debugging
                const paramsObject = {};
                queryParams.forEach((value, key) => {
                    paramsObject[key] = value;
                });
                console.log('Payment callback parameters:', paramsObject);
                
                if (responseCode === '00') {
                    setStatus('success');
                    setMessage('Your deposit was successful! Your wallet has been updated.');
                    
                    // Wait a moment to ensure backend has processed the payment
                    setTimeout(async () => {
                        try {
                            // Fetch the updated balance
                            const response = await apiClient.get('/wallet/balance');
                            setBalance(response.data.balance);
                        } catch (error) {
                            console.error('Error fetching wallet balance:', error);
                        }
                    }, 1000);
                } else {
                    setStatus('error');
                    
                    // Map error codes to meaningful messages
                    const errorMessages = {
                        '01': 'Transaction was rejected by the bank.',
                        '02': 'Transaction was unsuccessful due to an error.',
                        '07': 'Transaction was suspected of fraud.',
                        '09': 'The card/account has insufficient funds.',
                        '10': 'Customer reached daily transaction limit.',
                        '11': 'Transaction was expired.',
                        '12': 'Invalid transaction information.',
                        '97': 'Invalid signature.',
                        '99': 'Other errors.'
                    };
                    
                    const customMessage = queryParams.get('vnp_Message');
                    const errorMessage = customMessage || errorMessages[responseCode] || 'Payment failed. Please try again or contact support.';
                    setMessage(errorMessage);
                }
            } catch (error) {
                console.error('Error processing payment callback:', error);
                setStatus('error');
                setMessage('An error occurred while processing your payment. Please check your account later or contact support.');
            }
        };

        if (location.search) {
            processPayment();
        }
    }, [location]);

    const handleRedirect = () => {
        navigate('/deposit');
    };

    return (
        <div className="container my-5">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="card">
                        <div className="card-header">Payment Result</div>
                        <div className="card-body text-center">
                            {status === 'loading' && (
                                <div>
                                    <div className="spinner-border text-primary mb-3" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                    <p>Processing your payment...</p>
                                </div>
                            )}
                            
                            {status === 'success' && (
                                <div>
                                    <div className="alert alert-success">
                                        <i className="bi bi-check-circle me-2"></i>
                                        {message}
                                    </div>
                                    
                                    {balance !== null && (
                                        <div className="alert alert-info mb-4">
                                            <strong>Your current balance:</strong> {balance.toLocaleString()} đ
                                        </div>
                                    )}
                                    
                                    <button className="btn btn-primary" onClick={handleRedirect}>
                                        Return to Wallet
                                    </button>
                                </div>
                            )}
                            
                            {status === 'error' && (
                                <div>
                                    <div className="alert alert-danger">
                                        <i className="bi bi-x-circle me-2"></i>
                                        {message}
                                    </div>
                                    <button className="btn btn-primary" onClick={handleRedirect}>
                                        Try Again
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentCallbackPage;