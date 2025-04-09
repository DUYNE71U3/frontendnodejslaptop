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
                                
                                <li className="nav-item dropdown">
                                    <a className="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown">
                                        <i className="bi bi-person-circle me-1"></i> {username}
                                    </a>
                                    <ul className="dropdown-menu">
                                        <li>
                                            <Link className="dropdown-item" to="/orders">My Orders</Link>
                                        </li>
                                        <li>
                                            <Link className="dropdown-item" to="/wishlist">My Wishlist</Link>
                                        </li>
                                        <li>
                                            <Link className="dropdown-item" to="/my-appointments">My Repair Appointments</Link>
                                        </li>
                                        <li>
                                            <Link className="dropdown-item" to="/appointment">Schedule Repair</Link>
                                        </li>
                                        <li>
                                            <Link className="dropdown-item" to="/deposit">Deposit Money</Link>
                                        </li>
                                        <li><hr className="dropdown-divider" /></li>
                                        <li>
                                            <button className="dropdown-item" onClick={handleLogout}>Logout</button>
                                        </li>
                                    </ul>
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