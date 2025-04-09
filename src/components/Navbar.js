import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';

const Navbar = () => {
    const navigate = useNavigate();
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role');
    const isLoggedIn = !!username;
    const [walletBalance, setWalletBalance] = useState(null);

    useEffect(() => {
        // Fetch wallet balance if user is logged in
        if (isLoggedIn) {
            const fetchWalletBalance = async () => {
                try {
                    const response = await apiClient.get('/wallet/balance');
                    setWalletBalance(response.data.balance);
                } catch (error) {
                    console.error('Error fetching wallet balance:', error);
                }
            };
            fetchWalletBalance();
        }
    }, [isLoggedIn]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('role');
        localStorage.removeItem('userId');
        navigate('/login');
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <div className="container">
                <Link className="navbar-brand" to="/">Laptop Store</Link>
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto">
                        {isLoggedIn ? (
                            <>
                                <li className="nav-item">
                                    <span className="nav-link">Hi, {username}</span>
                                </li>
                                
                                {role === 'admin' && (
                                    <li className="nav-item">
                                        <Link className="nav-link" to="/admin">Admin Dashboard</Link>
                                    </li>
                                )}
                                
                                {role === 'delivery' && (
                                    <li className="nav-item">
                                        <Link className="nav-link" to="/delivery">Delivery Dashboard</Link>
                                    </li>
                                )}
                                
                                {role === 'customer_service' && (
                                    <li className="nav-item">
                                        <Link className="nav-link" to="/customer-service">Customer Support</Link>
                                    </li>
                                )}
                                
                                {role === 'user' && (
                                    <>
                                        {walletBalance !== null && (
                                            <li className="nav-item">
                                                <Link className="nav-link" to="/deposit">
                                                    Wallet: {walletBalance.toLocaleString()} đ
                                                </Link>
                                            </li>
                                        )}
                                        <li className="nav-item">
                                            <Link className="nav-link" to="/orders">My Orders</Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link className="nav-link" to="/wishlist">Wishlist</Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link className="nav-link" to="/cart">Cart</Link>
                                        </li>
                                    </>
                                )}
                                
                                <li className="nav-item">
                                    <button className="btn btn-link nav-link" onClick={handleLogout}>Logout</button>
                                </li>
                            </>
                        ) : (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/login">Login</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/register">Register</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/cart">Cart</Link>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;