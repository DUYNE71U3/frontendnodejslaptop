import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { useNavigate } from 'react-router-dom';

const UserOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserOrders = async () => {
            try {
                const response = await apiClient.get('/orders/user');
                setOrders(response.data);
            } catch (error) {
                console.error('Error fetching user orders:', error);
                if (error.response && error.response.status === 401) {
                    alert('Please login to view your orders.');
                    navigate('/login');
                }
            }
        };

        fetchUserOrders();
    }, [navigate]);

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'Delivered': return 'bg-success';
            case 'Cancelled': return 'bg-danger';
            case 'Processing': return 'bg-warning';
            case 'Out for Delivery': 
            case 'Delivery Accepted': return 'bg-info';
            default: return 'bg-secondary';
        }
    };

    return (
        <div className="container my-5">
            <h2 className="text-center mb-4">My Orders</h2>
            {orders.length === 0 ? (
                <p className="text-center">No orders found.</p>
            ) : (
                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Products</th>
                                <th>Total Price</th>
                                <th>Status</th>
                                <th>Created At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order._id}>
                                    <td>{order._id.substring(0, 8)}...</td>
                                    <td>
                                        <ul className="list-unstyled">
                                            {order.products.map(item => (
                                                <li key={item.product._id}>
                                                    {item.product.name}
                                                </li>
                                            ))}
                                        </ul>
                                    </td>
                                    <td>{order.totalPrice.toLocaleString()} đ</td>
                                    <td>
                                        <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td>{new Date(order.createdAt).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default UserOrdersPage;