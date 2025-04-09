import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import CustomerServiceChat from '../components/Chat/CustomerServiceChat';
import { io } from 'socket.io-client';

const CustomerServiceDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [note, setNote] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [deliveryPersons, setDeliveryPersons] = useState([]);
    const [selectedDeliveryPerson, setSelectedDeliveryPerson] = useState('');
    const [activeTab, setActiveTab] = useState('chat'); // Change default tab to 'chat'
    const [messages, setMessages] = useState([]); // Thêm state để lưu tin nhắn
    const [refreshCount, setRefreshCount] = useState(0); // Add refresh counter
    const [socketInstance, setSocketInstance] = useState(null);
    const navigate = useNavigate();

    // Function to trigger data refresh
    const refreshData = useCallback(() => {
        console.log('Refreshing data...');
        setRefreshCount(prevCount => prevCount + 1);
    }, []);

    // Define the fetchOrders function
    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            console.log('Fetching orders...');
            const response = await apiClient.get('/orders');
            setOrders(response.data);
            setFilteredOrders(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setLoading(false);
        }
    }, []);

    // Fetch delivery personnel
    const fetchDeliveryPersons = useCallback(async () => {
        try {
            const response = await apiClient.get('/auth/delivery/accounts');
            setDeliveryPersons(response.data);
        } catch (error) {
            console.error('Error fetching delivery personnel:', error);
        }
    }, []);

    useEffect(() => {
        // Check if user is logged in as customer service
        const role = localStorage.getItem('role');
        if (role !== 'customer_service') {
            alert('You are not authorized to view this page');
            navigate('/login');
            return;
        }

        fetchOrders(); // Call fetchOrders here
        fetchDeliveryPersons(); // Get delivery personnel
    }, [navigate, fetchOrders, fetchDeliveryPersons, refreshCount]);

    useEffect(() => {
        // Filter orders based on status and search term
        let filtered = orders;
        
        if (statusFilter !== 'all') {
            filtered = filtered.filter(order => order.status === statusFilter);
        }
        
        if (searchTerm) {
            filtered = filtered.filter(order => 
                order._id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                order.user.username.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        setFilteredOrders(filtered);
    }, [statusFilter, searchTerm, orders]);

    // Set up socket connection for real-time updates
    useEffect(() => {
        const socket = io('http://localhost:5000');
        setSocketInstance(socket);

        socket.on('connect', () => {
            console.log('Connected to socket server');
            
            // Register as customer service agent
            socket.emit('register', {
                userId: localStorage.getItem('userId'),
                username: localStorage.getItem('username'),
                role: 'customer_service'
            });
        });

        socket.on('order_updated', ({ orderId, status }) => {
            console.log('Order updated event received:', orderId, status);
            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order._id === orderId ? { ...order, status } : order
                )
            );
            refreshData();
        });

        socket.on('chat_message', (message) => {
            console.log('New message received:', message);
            setMessages((prevMessages) => [...prevMessages, message]);
            refreshData();
        });

        socket.on('user_connected', (user) => {
            console.log('User connected:', user);
            refreshData();
        });

        socket.on('user_disconnected', (socketId) => {
            console.log('User disconnected:', socketId);
            refreshData();
        });

        return () => {
            socket.disconnect();
        };
    }, [refreshData]);

    const handleAddNote = async () => {
        if (!selectedOrder || !note.trim()) return;
        
        try {
            await apiClient.put(`/orders/${selectedOrder._id}/customer-note`, { note });
            alert('Note added successfully');
            setNote('');
            
            // Update the order in the state
            const updatedOrders = orders.map(order => 
                order._id === selectedOrder._id 
                ? { ...order, customerServiceNotes: note, customerServiceAgent: localStorage.getItem('userId') }
                : order
            );
            
            setOrders(updatedOrders);
            setSelectedOrder(null);
            refreshData(); // Refresh after adding note
            fetchOrders(); // Refresh orders
        } catch (error) {
            console.error('Error adding note:', error);
            alert('Failed to add note');
        }
    };

    const handleUpdateStatus = async (newStatus) => {
        if (!selectedOrder) return;

        try {
            await apiClient.put(`/orders/${selectedOrder._id}/status`, { status: newStatus });
            alert('Order status updated successfully');
            
            // Update the order in the state
            const updatedOrders = orders.map(order =>
                order._id === selectedOrder._id
                    ? { ...order, status: newStatus }
                    : order
            );

            setOrders(updatedOrders);
            setSelectedOrder(null);
            refreshData(); // Refresh after status update
            fetchOrders(); // Refresh orders
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update order status');
        }
    };

    const handleAssignDelivery = async () => {
        if (!selectedOrder || !selectedDeliveryPerson) {
            alert('Please select a delivery person');
            return;
        }

        try {
            await apiClient.post(`/orders/${selectedOrder._id}/assign-delivery`, {
                deliveryPersonId: selectedDeliveryPerson
            });
            alert('Order assigned to delivery person successfully');
            refreshData(); // Refresh after assigning delivery
            fetchOrders(); // Refresh orders
            setSelectedOrder(null);
        } catch (error) {
            console.error('Error assigning delivery:', error);
            alert('Failed to assign delivery person: ' + (error.response?.data?.message || 'Unknown error'));
        }
    };

    // Only render the content for the active tab
    const renderTabContent = () => {
        if (activeTab === 'chat') {
            return <CustomerServiceChat onRefresh={refreshData} />;
        } else {
            // Return the original orders management content
            return (
                <>
                    {/* Filters */}
                    <div className="row mb-4">
                        <div className="col-md-6">
                            <input 
                                type="text"
                                className="form-control"
                                placeholder="Search by order ID or customer name"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="col-md-6">
                            <select 
                                className="form-select"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">All Statuses</option>
                                <option value="Pending">Pending</option>
                                <option value="Processing">Processing</option>
                                <option value="Ready for Delivery">Ready for Delivery</option>
                                <option value="Assigned to Delivery">Assigned to Delivery</option>
                                <option value="Out for Delivery">Out for Delivery</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>
                    
                    {/* Orders Table */}
                    <div className="table-responsive">
                        <table className="table table-striped table-hover">
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Customer</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                    <th>Created At</th>
                                    <th>CS Notes</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map(order => (
                                    <tr key={order._id}>
                                        <td>{order._id.substring(0, 8)}...</td>
                                        <td>{order.user.username}</td>
                                        <td>{order.totalPrice.toLocaleString()} đ</td>
                                        <td>
                                            <span className={`badge ${
                                                order.status === 'Delivered' ? 'bg-success' :
                                                order.status === 'Cancelled' ? 'bg-danger' :
                                                'bg-primary'
                                            }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            {order.customerServiceNotes ? 
                                                <span className="badge bg-info">Has Notes</span> : 
                                                <span className="badge bg-secondary">No Notes</span>
                                            }
                                        </td>
                                        <td>
                                            <button 
                                                className="btn btn-outline-primary btn-sm"
                                                onClick={() => setSelectedOrder(order)}
                                            >
                                                Manage
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Order Detail Modal */}
                    {selectedOrder && (
                        <div className="modal show fade" style={{ display: 'block' }}>
                            <div className="modal-dialog modal-lg">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title">Order Details - {selectedOrder._id}</h5>
                                        <button 
                                            type="button" 
                                            className="btn-close" 
                                            onClick={() => setSelectedOrder(null)}
                                        ></button>
                                    </div>
                                    <div className="modal-body">
                                        <div className="row mb-4">
                                            <div className="col-md-6">
                                                <h6>Customer Information</h6>
                                                <p><strong>Name:</strong> {selectedOrder.user.username}</p>
                                                <p><strong>Email:</strong> {selectedOrder.shippingAddress.email}</p>
                                                <p><strong>Phone:</strong> {selectedOrder.shippingAddress.phone}</p>
                                            </div>
                                            <div className="col-md-6">
                                                <h6>Order Information</h6>
                                                <p><strong>Status:</strong> {selectedOrder.status}</p>
                                                <p><strong>Payment Method:</strong> {selectedOrder.paymentMethod}</p>
                                                <p><strong>Total Price:</strong> {selectedOrder.totalPrice.toLocaleString()} đ</p>
                                            </div>
                                        </div>
                                        
                                        <div className="mb-4">
                                            <h6>Shipping Address</h6>
                                            <p>{selectedOrder.shippingAddress.address}</p>
                                        </div>
                                        
                                        <div className="mb-4">
                                            <h6>Products</h6>
                                            <table className="table table-sm">
                                                <thead>
                                                    <tr>
                                                        <th>Product</th>
                                                        <th>Quantity</th>
                                                        <th>Price</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {selectedOrder.products.map((item, index) => (
                                                        <tr key={index}>
                                                            <td>{item.product.name}</td>
                                                            <td>{item.quantity}</td>
                                                            <td>{item.product.price.toLocaleString()} đ</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        
                                        <div className="mb-4">
                                            <h6>Customer Service Notes</h6>
                                            <textarea 
                                                className="form-control mb-2"
                                                rows="3"
                                                value={note}
                                                onChange={(e) => setNote(e.target.value)}
                                                placeholder="Add notes about customer interaction here"
                                            ></textarea>
                                            <button 
                                                className="btn btn-primary"
                                                onClick={handleAddNote}
                                                disabled={!note.trim()}
                                            >
                                                Add Note
                                            </button>
                                        </div>
                                        
                                        {selectedOrder.customerServiceNotes && (
                                            <div className="mb-4">
                                                <h6>Previous Notes</h6>
                                                <div className="card">
                                                    <div className="card-body">
                                                        {selectedOrder.customerServiceNotes}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {selectedOrder.customerContactHistory && selectedOrder.customerContactHistory.length > 0 && (
                                            <div className="mb-4">
                                                <h6>Contact History</h6>
                                                {selectedOrder.customerContactHistory.map((contact, index) => (
                                                    <div key={index} className="card mb-2">
                                                        <div className="card-body">
                                                            <p className="mb-1">{contact.note}</p>
                                                            <small className="text-muted">
                                                                {new Date(contact.date).toLocaleString()}
                                                            </small>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <div className="mb-4">
                                            <h6>Update Order Status</h6>
                                            <select
                                                className="form-select form-select-sm mb-3"
                                                value={selectedOrder?.status || ''}
                                                onChange={(e) => handleUpdateStatus(e.target.value)}
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="Processing">Processing</option>
                                                <option value="Ready for Delivery">Ready for Delivery</option>
                                                <option value="Assigned to Delivery">Assigned to Delivery</option>
                                                <option value="Out for Delivery">Out for Delivery</option>
                                                <option value="Delivered">Delivered</option>
                                                <option value="Cancelled">Cancelled</option>
                                            </select>
                                        </div>

                                        {selectedOrder.status === 'Ready for Delivery' && (
                                            <div className="mb-4">
                                                <h6>Assign Delivery Person</h6>
                                                <div className="input-group mb-3">
                                                    <select
                                                        className="form-select"
                                                        value={selectedDeliveryPerson}
                                                        onChange={(e) => setSelectedDeliveryPerson(e.target.value)}
                                                    >
                                                        <option value="">Select delivery person</option>
                                                        {deliveryPersons.map(person => (
                                                            <option key={person._id} value={person._id}>
                                                                {person.username} - {person.vehicleType || 'No vehicle specified'}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <button
                                                        className="btn btn-outline-primary"
                                                        type="button"
                                                        onClick={handleAssignDelivery}
                                                        disabled={!selectedDeliveryPerson}
                                                    >
                                                        Assign
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div className="mb-4">
                                            <button
                                                className="btn btn-success btn-sm"
                                                onClick={() => handleUpdateStatus(selectedOrder?.status)}
                                            >
                                                Save Status
                                            </button>
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button 
                                            type="button" 
                                            className="btn btn-secondary" 
                                            onClick={() => setSelectedOrder(null)}
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            );
        }
    };

    if (loading && activeTab === 'orders') {
        return (
            <div className="container my-5 text-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container my-5">
            <h2 className="text-center mb-4">Customer Service Dashboard</h2>
            
            {/* Tab Navigation */}
            <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                    <button 
                        className={`nav-link ${activeTab === 'orders' ? 'active' : ''}`}
                        onClick={() => setActiveTab('orders')}
                    >
                        Orders Management
                    </button>
                </li>
                <li className="nav-item">
                    <button 
                        className={`nav-link ${activeTab === 'chat' ? 'active' : ''}`}
                        onClick={() => setActiveTab('chat')}
                    >
                        Live Chat Support
                    </button>
                </li>
            </ul>
            
            {/* Tab Content */}
            {renderTabContent()}
        </div>
    );
};

export default CustomerServiceDashboard;
