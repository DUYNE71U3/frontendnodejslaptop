import React, { useState, useEffect } from 'react';
import ProductList from '../components/Product/ProductList';
import CategoryList from '../components/Category/CategoryList';
import apiClient from '../api/apiClient';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('product');
    const [orders, setOrders] = useState([]);
    const [deliveryPersons, setDeliveryPersons] = useState([]);
    const [selectedDeliveryPerson, setSelectedDeliveryPerson] = useState('');
    const [deliveryFormVisible, setDeliveryFormVisible] = useState(false);
    const [newDeliveryAccount, setNewDeliveryAccount] = useState({
        username: '',
        email: '',
        password: '',
        phoneNumber: '',
        vehicleType: ''
    });

    useEffect(() => {
        if (activeTab === 'order') {
            fetchOrders();
            fetchDeliveryPersons();
        } else if (activeTab === 'delivery') {
            fetchDeliveryPersons();
        }
    }, [activeTab]);

    const fetchOrders = async () => {
        try {
            const response = await apiClient.get('/orders');
            setOrders(response.data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    const fetchDeliveryPersons = async () => {
        try {
            const response = await apiClient.get('/auth/delivery/accounts');
            setDeliveryPersons(response.data);
        } catch (error) {
            console.error('Error fetching delivery persons:', error);
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await apiClient.put(`/orders/${orderId}`, { status: newStatus });
            // Update order status in state
            setOrders(orders.map(order =>
                order._id === orderId ? { ...order, status: newStatus } : order
            ));
            alert('Order status updated successfully!');
        } catch (err) {
            console.error('Error updating order status:', err);
            alert('Failed to update order status');
        }
    };

    const handleAssignDelivery = async (orderId) => {
        if (!selectedDeliveryPerson) {
            alert('Please select a delivery person');
            return;
        }

        try {
            await apiClient.post(`/orders/${orderId}/assign-delivery`, {
                deliveryPersonId: selectedDeliveryPerson
            });
            alert('Order assigned to delivery person successfully');
            fetchOrders(); // Refresh orders
        } catch (error) {
            console.error('Error assigning delivery:', error);
            alert('Failed to assign delivery person');
        }
    };

    const handleDeliveryFormChange = (e) => {
        const { name, value } = e.target;
        setNewDeliveryAccount({ ...newDeliveryAccount, [name]: value });
    };

    const handleCreateDeliveryAccount = async (e) => {
        e.preventDefault();
        try {
            await apiClient.post('/auth/delivery/create', newDeliveryAccount);
            alert('Delivery account created successfully');
            setDeliveryFormVisible(false);
            setNewDeliveryAccount({
                username: '',
                email: '',
                password: '',
                phoneNumber: '',
                vehicleType: ''
            });
            fetchDeliveryPersons(); // Refresh delivery persons list
        } catch (error) {
            console.error('Error creating delivery account:', error);
            alert('Failed to create delivery account: ' + (error.response?.data?.message || 'Unknown error'));
        }
    };

    return (
        <div className="container my-5">
            <h2 className="text-center mb-4">Admin Dashboard</h2>
            <div className="d-flex justify-content-center mb-4">
                <button
                    className={`btn ${activeTab === 'product' ? 'btn-primary' : 'btn-outline-primary'} me-2`}
                    onClick={() => setActiveTab('product')}
                >
                    Products
                </button>
                <button
                    className={`btn ${activeTab === 'category' ? 'btn-primary' : 'btn-outline-primary'} me-2`}
                    onClick={() => setActiveTab('category')}
                >
                    Categories
                </button>
                <button
                    className={`btn ${activeTab === 'order' ? 'btn-primary' : 'btn-outline-primary'} me-2`}
                    onClick={() => setActiveTab('order')}
                >
                    Orders
                </button>
                <button
                    className={`btn ${activeTab === 'delivery' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setActiveTab('delivery')}
                >
                    Delivery
                </button>
            </div>
            <div>
                {activeTab === 'product' && <ProductList />}
                {activeTab === 'category' && <CategoryList />}
                {activeTab === 'order' && (
                    <div>
                        <h3>Orders</h3>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>User</th>
                                    <th>Total Price</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(order => (
                                    <tr key={order._id}>
                                        <td>{order._id}</td>
                                        <td>{order.user.username}</td>
                                        <td>{order.totalPrice.toLocaleString()} đ</td>
                                        <td>{order.status}</td>
                                        <td>
                                            <div className="d-flex gap-2">
                                                <select
                                                    className="form-select form-select-sm"
                                                    value={order.status}
                                                    onChange={e => handleStatusChange(order._id, e.target.value)}
                                                    style={{ width: 'auto' }}
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="Processing">Processing</option>
                                                    <option value="Ready for Delivery">Ready for Delivery</option>
                                                    <option value="Delivered">Delivered</option>
                                                    <option value="Cancelled">Cancelled</option>
                                                </select>
                                                
                                                {order.status === 'Ready for Delivery' && !order.deliveryPerson && (
                                                    <div className="input-group input-group-sm" style={{ width: 'auto' }}>
                                                        <select
                                                            className="form-select form-select-sm"
                                                            value={selectedDeliveryPerson}
                                                            onChange={e => setSelectedDeliveryPerson(e.target.value)}
                                                        >
                                                            <option value="">Select delivery person</option>
                                                            {deliveryPersons.map(person => (
                                                                <option key={person._id} value={person._id}>
                                                                    {person.username}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <button 
                                                            className="btn btn-outline-secondary" 
                                                            type="button"
                                                            onClick={() => handleAssignDelivery(order._id)}
                                                        >
                                                            Assign
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                
                {activeTab === 'delivery' && (
                    <div>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h3>Delivery Personnel</h3>
                            <button 
                                className="btn btn-primary" 
                                onClick={() => setDeliveryFormVisible(!deliveryFormVisible)}
                            >
                                {deliveryFormVisible ? 'Cancel' : 'Add New Delivery Person'}
                            </button>
                        </div>
                        
                        {deliveryFormVisible && (
                            <div className="card mb-4">
                                <div className="card-header">Create Delivery Account</div>
                                <div className="card-body">
                                    <form onSubmit={handleCreateDeliveryAccount}>
                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Username</label>
                                                <input
                                                    type="text"
                                                    name="username"
                                                    className="form-control"
                                                    value={newDeliveryAccount.username}
                                                    onChange={handleDeliveryFormChange}
                                                    required
                                                />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Email</label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    className="form-control"
                                                    value={newDeliveryAccount.email}
                                                    onChange={handleDeliveryFormChange}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Password</label>
                                                <input
                                                    type="password"
                                                    name="password"
                                                    className="form-control"
                                                    value={newDeliveryAccount.password}
                                                    onChange={handleDeliveryFormChange}
                                                    required
                                                />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Phone Number</label>
                                                <input
                                                    type="text"
                                                    name="phoneNumber"
                                                    className="form-control"
                                                    value={newDeliveryAccount.phoneNumber}
                                                    onChange={handleDeliveryFormChange}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Vehicle Type</label>
                                            <input
                                                type="text"
                                                name="vehicleType"
                                                className="form-control"
                                                value={newDeliveryAccount.vehicleType}
                                                onChange={handleDeliveryFormChange}
                                                required
                                            />
                                        </div>
                                        <button type="submit" className="btn btn-success">Create Account</button>
                                    </form>
                                </div>
                            </div>
                        )}
                        
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Vehicle</th>
                                    <th>Created At</th>
                                </tr>
                            </thead>
                            <tbody>
                                {deliveryPersons.map(person => (
                                    <tr key={person._id}>
                                        <td>{person.username}</td>
                                        <td>{person.email}</td>
                                        <td>{person.phoneNumber || 'N/A'}</td>
                                        <td>{person.vehicleType || 'N/A'}</td>
                                        <td>{new Date(person.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;