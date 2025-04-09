import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductPage from './pages/ProductPage';
import AdminDashboard from './pages/AdminDashboard';
import CartPage from './pages/CartPage';
import UserOrdersPage from './pages/UserOrdersPage';
import DepositPage from './pages/DepositPage';
import PaymentCallbackPage from './pages/PaymentCallbackPage';
import DeliveryDashboard from './pages/DeliveryDashboard';
import './App.css';

const App = () => {
    useEffect(() => {
        // Initialize Bootstrap JS components
        if (typeof window !== 'undefined' && typeof document !== 'undefined') {
            // Dynamically import Bootstrap JS
            import('bootstrap/dist/js/bootstrap.bundle.min.js')
                .catch(err => console.error('Failed to load Bootstrap JS', err));
        }
    }, []);

    return (
        <Router>
            <div className="app-container">
                <Navbar />
                <div className="content-wrap">
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/products" element={<ProductPage />} />
                        <Route path="/admin" element={<AdminDashboard />} />
                        <Route path="/cart" element={<CartPage />} />
                        <Route path="/orders" element={<UserOrdersPage />} />
                        <Route path="/deposit" element={<DepositPage />} />
                        <Route path="/payment-callback" element={<PaymentCallbackPage />} />
                        <Route path="/delivery" element={<DeliveryDashboard />} />
                    </Routes>
                </div>
                <Footer />
            </div>
        </Router>
    );
};

export default App;
