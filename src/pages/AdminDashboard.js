import React, { useState, useEffect } from 'react';
import ProductList from '../components/Product/ProductList';
import CategoryList from '../components/Category/CategoryList';
import apiClient from '../api/apiClient';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('product');
    const [deliveryPersons, setDeliveryPersons] = useState([]);
    const [customerServiceStaff, setCustomerServiceStaff] = useState([]);
    const [selectedDeliveryPerson, setSelectedDeliveryPerson] = useState('');
    const [deliveryFormVisible, setDeliveryFormVisible] = useState(false);
    const [customerServiceFormVisible, setCustomerServiceFormVisible] = useState(false);
    const [newDeliveryAccount, setNewDeliveryAccount] = useState({
        username: '',
        email: '',
        password: '',
        phoneNumber: '',
        vehicleType: ''
    });
    const [newCustomerServiceAccount, setNewCustomerServiceAccount] = useState({
        username: '',
        email: '',
        password: '',
        phoneNumber: ''
    });
    const [coupons, setCoupons] = useState([]);
    const [newCoupon, setNewCoupon] = useState({ code: '', discount: '', expirationDate: '' });
    const [editingCoupon, setEditingCoupon] = useState(null);

    useEffect(() => {
        if (activeTab === 'delivery') {
            fetchDeliveryPersons();
        } else if (activeTab === 'customer_service') {
            fetchCustomerServiceStaff();
        } else if (activeTab === 'coupon') {
            fetchCoupons();
        }
    }, [activeTab]);

    const fetchDeliveryPersons = async () => {
        try {
            const response = await apiClient.get('/auth/delivery/accounts');
            setDeliveryPersons(response.data);
        } catch (error) {
            console.error('Error fetching delivery persons:', error);
        }
    };

    const fetchCustomerServiceStaff = async () => {
        try {
            const response = await apiClient.get('/auth/customer-service/accounts');
            setCustomerServiceStaff(response.data);
        } catch (error) {
            console.error('Error fetching customer service staff:', error);
        }
    };

    const fetchCoupons = async () => {
        try {
            // Sửa đường dẫn API
            const response = await apiClient.get('/coupons');
            console.log('Fetched coupons:', response.data);
            setCoupons(response.data);
        } catch (error) {
            console.error('Error fetching coupons:', error);
            if (error.response) {
                console.error('Error response:', error.response.data);
            }
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

    const handleCustomerServiceFormChange = (e) => {
        const { name, value } = e.target;
        setNewCustomerServiceAccount({ ...newCustomerServiceAccount, [name]: value });
    };

    const handleCreateCustomerServiceAccount = async (e) => {
        e.preventDefault();
        try {
            await apiClient.post('/auth/customer-service/create', newCustomerServiceAccount);
            alert('Customer service account created successfully');
            setCustomerServiceFormVisible(false);
            setNewCustomerServiceAccount({
                username: '',
                email: '',
                password: '',
                phoneNumber: ''
            });
            fetchCustomerServiceStaff(); // Refresh customer service staff list
        } catch (error) {
            console.error('Error creating customer service account:', error);
            alert('Failed to create customer service account: ' + (error.response?.data?.message || 'Unknown error'));
        }
    };

    const handleCreateCoupon = async (e) => {
        e.preventDefault();
        try {
            // Đảm bảo định dạng dữ liệu phù hợp
            const formattedDate = new Date(newCoupon.expirationDate).toISOString();
            
            const couponData = {
                code: newCoupon.code,
                discount: Number(newCoupon.discount),
                expirationDate: formattedDate
            };
            
            console.log('Sending coupon data:', couponData);
            
            // Chỉ sử dụng đường dẫn API chính xác (không có /api prefix vì apiClient đã cấu hình baseURL)
            const response = await apiClient.post('/coupons', couponData);
            console.log('Coupon created:', response.data);
            alert('Coupon created successfully');
            setNewCoupon({ code: '', discount: '', expirationDate: '' });
            fetchCoupons();
        } catch (error) {
            console.error('Error creating coupon:', error);
            // Hiển thị thông báo lỗi chi tiết hơn
            if (error.response) {
                console.error('Error response:', error.response.data);
                alert(`Failed to create coupon: ${error.response.data.message || 'Unknown error'}`);
            } else if (error.request) {
                console.error('Error request:', error.request);
                alert('Failed to create coupon: No response received from server');
            } else {
                alert(`Failed to create coupon: ${error.message}`);
            }
        }
    };

    const handleEditCoupon = (coupon) => {
        setEditingCoupon(coupon);
        setNewCoupon({ code: coupon.code, discount: coupon.discount, expirationDate: coupon.expirationDate });
    };

    const handleUpdateCoupon = async (e) => {
        e.preventDefault();
        try {
            await apiClient.put(`/api/coupons/${editingCoupon._id}`, newCoupon);
            alert('Coupon updated successfully');
            setEditingCoupon(null);
            setNewCoupon({ code: '', discount: '', expirationDate: '' });
            fetchCoupons();
        } catch (error) {
            console.error('Error updating coupon:', error);
            alert('Failed to update coupon');
        }
    };

    const handleDeleteCoupon = async (id) => {
        if (!window.confirm('Are you sure you want to delete this coupon?')) return;
        try {
            await apiClient.delete(`/api/coupons/${id}`);
            alert('Coupon deleted successfully');
            fetchCoupons();
        } catch (error) {
            console.error('Error deleting coupon:', error);
            alert('Failed to delete coupon');
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            await apiClient.patch(`/api/coupons/${id}/status`, { status });
            alert('Coupon status updated successfully');
            fetchCoupons();
        } catch (error) {
            console.error('Error updating coupon status:', error);
            alert('Failed to update coupon status');
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
                    className={`btn ${activeTab === 'delivery' ? 'btn-primary' : 'btn-outline-primary'} me-2`}
                    onClick={() => setActiveTab('delivery')}
                >
                    Delivery
                </button>
                <button
                    className={`btn ${activeTab === 'customer_service' ? 'btn-primary' : 'btn-outline-primary'} me-2`}
                    onClick={() => setActiveTab('customer_service')}
                >
                    Customer Service
                </button>
                <button
                    className={`btn ${activeTab === 'coupon' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setActiveTab('coupon')}
                >
                    Coupons
                </button>
            </div>

            <div className="tab-content">
                {activeTab === 'product' && (
                    <ProductList />
                )}
                
                {activeTab === 'category' && (
                    <CategoryList />
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

                {activeTab === 'customer_service' && (
                    <div>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h3>Customer Service Staff</h3>
                            <button 
                                className="btn btn-primary" 
                                onClick={() => setCustomerServiceFormVisible(!customerServiceFormVisible)}
                            >
                                {customerServiceFormVisible ? 'Cancel' : 'Add New Customer Service Staff'}
                            </button>
                        </div>
                        
                        {customerServiceFormVisible && (
                            <div className="card mb-4">
                                <div className="card-header">Create Customer Service Account</div>
                                <div className="card-body">
                                    <form onSubmit={handleCreateCustomerServiceAccount}>
                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Username</label>
                                                <input
                                                    type="text"
                                                    name="username"
                                                    className="form-control"
                                                    value={newCustomerServiceAccount.username}
                                                    onChange={handleCustomerServiceFormChange}
                                                    required
                                                />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Email</label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    className="form-control"
                                                    value={newCustomerServiceAccount.email}
                                                    onChange={handleCustomerServiceFormChange}
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
                                                    value={newCustomerServiceAccount.password}
                                                    onChange={handleCustomerServiceFormChange}
                                                    required
                                                />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Phone Number</label>
                                                <input
                                                    type="text"
                                                    name="phoneNumber"
                                                    className="form-control"
                                                    value={newCustomerServiceAccount.phoneNumber}
                                                    onChange={handleCustomerServiceFormChange}
                                                    required
                                                />
                                            </div>
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
                                    <th>Created At</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customerServiceStaff.map(staff => (
                                    <tr key={staff._id}>
                                        <td>{staff.username}</td>
                                        <td>{staff.email}</td>
                                        <td>{staff.phoneNumber || 'N/A'}</td>
                                        <td>{new Date(staff.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'coupon' && (
                    <div>
                        <h3>Manage Coupons</h3>
                        <form onSubmit={editingCoupon ? handleUpdateCoupon : handleCreateCoupon} className="mb-4">
                            <div className="row">
                                <div className="col-md-4">
                                    <label className="form-label">Code</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={newCoupon.code}
                                        onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Discount (%)</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={newCoupon.discount}
                                        onChange={(e) => setNewCoupon({ ...newCoupon, discount: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Expiration Date</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={newCoupon.expirationDate}
                                        onChange={(e) => setNewCoupon({ ...newCoupon, expirationDate: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <button type="submit" className="btn btn-success mt-3">
                                {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                            </button>
                        </form>

                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Code</th>
                                    <th>Discount</th>
                                    <th>Expiration Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {coupons.map((coupon) => (
                                    <tr key={coupon._id}>
                                        <td>{coupon.code}</td>
                                        <td>{coupon.discount}%</td>
                                        <td>{new Date(coupon.expirationDate).toLocaleDateString()}</td>
                                        <td>
                                            <span
                                                className={`badge ${
                                                    coupon.status === 'active' ? 'bg-success' : 'bg-danger'
                                                }`}
                                            >
                                                {coupon.status}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-warning btn-sm me-2"
                                                onClick={() => handleEditCoupon(coupon)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm me-2"
                                                onClick={() => handleDeleteCoupon(coupon._id)}
                                            >
                                                Delete
                                            </button>
                                            <button
                                                className="btn btn-secondary btn-sm"
                                                onClick={() =>
                                                    handleUpdateStatus(
                                                        coupon._id,
                                                        coupon.status === 'active' ? 'expired' : 'active'
                                                    )
                                                }
                                            >
                                                {coupon.status === 'active' ? 'Set Expired' : 'Set Active'}
                                            </button>
                                        </td>
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