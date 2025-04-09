import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';

const DeliveryDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user is logged in as delivery person
        const role = localStorage.getItem('role');
        if (role !== 'delivery') {
            alert('You are not authorized to view this page');
            navigate('/login');
            return;
        }

        fetchDeliveryOrders();
    }, [navigate]);

    const fetchDeliveryOrders = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/orders/delivery-orders');
            setOrders(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching delivery orders:', error);
            setError('Failed to load your assigned orders');
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (orderId, status, notes = '') => {
        try {
            await apiClient.put(`/orders/${orderId}/delivery-status`, { status, notes });
            // Refresh orders list
            fetchDeliveryOrders();
            alert('Order status updated successfully');
        } catch (error) {
            console.error('Error updating order status:', error);
            alert('Failed to update order status');
        }
    };

    const renderActionButtons = (order) => {
        switch (order.deliveryStatus) {
            case 'Assigned':
                return (
                    <div className="btn-group">
                        <button 
                            className="btn btn-success btn-sm" 
                            onClick={() => handleStatusUpdate(order._id, 'accepted')}
                        >
                            Accept
                        </button>
                        <button 
                            className="btn btn-danger btn-sm" 
                            onClick={() => handleStatusUpdate(order._id, 'rejected')}
                        >
                            Reject
                        </button>
                    </div>
                );
            case 'Accepted':
                return (
                    <button 
                        className="btn btn-primary btn-sm" 
                        onClick={() => handleStatusUpdate(order._id, 'in_transit')}
                    >
                        Start Delivery
                    </button>
                );
            case 'In Transit':
                return (
                    <div className="btn-group">
                        <button 
                            className="btn btn-success btn-sm" 
                            onClick={() => handleStatusUpdate(order._id, 'delivered')}
                        >
                            Mark Delivered
                        </button>
                        <button 
                            className="btn btn-warning btn-sm" 
                            onClick={() => {
                                const notes = prompt('Please enter failure reason:');
                                if (notes) {
                                    handleStatusUpdate(order._id, 'failed', notes);
                                }
                            }}
                        >
                            Delivery Failed
                        </button>
                    </div>
                );
            default:
                return null;
        }
    };

    if (loading) {
        return <div className="container mt-5 text-center">Loading...</div>;
    }

    if (error) {
        return <div className="container mt-5 alert alert-danger">{error}</div>;
    }

    return (
        <div className="container my-5">
            <h2>Delivery Dashboard</h2>
            {orders.length === 0 ? (
                <div className="alert alert-info">
                    You don't have any assigned orders at the moment.
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Shipping Address</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order._id}>
                                    <td>{order._id.substring(0, 8)}...</td>
                                    <td>{order.user.username}</td>
                                    <td>
                                        <address>
                                            {order.shippingAddress.address}<br/>
                                            Phone: {order.shippingAddress.phone}<br/>
                                            Email: {order.shippingAddress.email}
                                        </address>
                                    </td>
                                    <td>
                                        <span className={`badge ${
                                            order.deliveryStatus === 'Delivered' ? 'bg-success' :
                                            order.deliveryStatus === 'Failed' ? 'bg-danger' :
                                            order.deliveryStatus === 'In Transit' ? 'bg-primary' :
                                            'bg-secondary'
                                        }`}>
                                            {order.deliveryStatus}
                                        </span>
                                    </td>
                                    <td>
                                        {renderActionButtons(order)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default DeliveryDashboard;
