import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await apiClient.post('/auth/login', { username, password });
            if (response.data && response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('role', response.data.user.role); // Lưu role vào localStorage
                localStorage.setItem('username', response.data.user.username); // Lưu username vào localStorage
                localStorage.setItem('userId', response.data.user.id); // Lưu userId vào localStorage
                alert('Login successful!');
                if (response.data.user.role === 'admin') {
                    navigate('/admin'); // Chuyển hướng đến Admin Dashboard
                } else {
                    navigate('/'); // Chuyển hướng đến trang chủ nếu không phải admin
                }
            } else {
                alert('Login failed: Invalid response from server');
            }
        } catch (error) {
            console.error('Login error:', error);
            setError(error.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container my-5">
            <h2 className="text-center mb-4">Login</h2>
            <form onSubmit={handleLogin} className="mx-auto" style={{ maxWidth: '400px' }}>
                <div className="mb-3">
                    <label htmlFor="username" className="form-label">Username</label>
                    <input
                        type="text"
                        id="username"
                        className="form-control"
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input
                        type="password"
                        id="password"
                        className="form-control"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button type="submit" className="btn btn-primary w-100" disabled={loading}>Login</button>
                {error && <div className="alert alert-danger mt-3">{error}</div>}
            </form>
        </div>
    );
};

export default LoginPage;