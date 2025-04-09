import React, { useEffect, useState } from 'react';
import apiClient from '../../api/apiClient';

const ProductForm = ({ product, onClose, onSave }) => {
    const [formData, setFormData] = useState(
        product || {
            name: '',
            brand: '',
            price: '',
            isNew: false,
            category: '',
            cpu: '',
            ram: '',
            storage: '',
            gpu: '',
            screen: '',
            ports: '',
            os: '',
            weight: '',
            dimensions: '',
            battery: '',
            warranty: '',
            image: '', // Thêm trường image
        }
    );
    const [categories, setCategories] = useState([]);
    const [image, setImage] = useState(null); // Thêm state cho hình ảnh

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await apiClient.get('/categories');
                setCategories(response.data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        fetchCategories();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleImageChange = (e) => {
        setImage(e.target.files[0]); // Lưu file hình ảnh vào state
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formDataWithImage = new FormData();
        for (const key in formData) {
            formDataWithImage.append(key, formData[key]);
        }
        if (image) {
            formDataWithImage.append('image', image);
        }

        console.log('FormData:', [...formDataWithImage.entries()]); // Log FormData

        try {
            if (product) {
                const response = await apiClient.put(`/products/${product._id}`, formDataWithImage, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                onSave(response.data);
            } else {
                const response = await apiClient.post('/products', formDataWithImage, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                onSave(response.data);
            }
        } catch (error) {
            console.error('Error saving product:', error);
            alert('Failed to save product');
        }
    };

    return (
        <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{product ? 'Edit Product' : 'Add Product'}</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label htmlFor="name" className="form-label">Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    className="form-control"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="brand" className="form-label">Brand</label>
                                <input
                                    type="text"
                                    id="brand"
                                    name="brand"
                                    className="form-control"
                                    value={formData.brand}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="price" className="form-label">Price</label>
                                <input
                                    type="number"
                                    id="price"
                                    name="price"
                                    className="form-control"
                                    value={formData.price}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="isNew" className="form-label">Is New</label>
                                <select
                                    id="isNew"
                                    name="isNew"
                                    className="form-select"
                                    value={formData.isNew}
                                    onChange={handleChange}
                                >
                                    <option value={true}>Yes</option>
                                    <option value={false}>No</option>
                                </select>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="category" className="form-label">Category</label>
                                <select
                                    id="category"
                                    name="category"
                                    className="form-select"
                                    value={formData.category}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Category</option>
                                    {categories.map((category) => (
                                        <option key={category._id} value={category._id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="cpu" className="form-label">CPU</label>
                                <input
                                    type="text"
                                    id="cpu"
                                    name="cpu"
                                    className="form-control"
                                    value={formData.cpu}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="ram" className="form-label">RAM</label>
                                <input
                                    type="text"
                                    id="ram"
                                    name="ram"
                                    className="form-control"
                                    value={formData.ram}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="storage" className="form-label">Storage</label>
                                <input
                                    type="text"
                                    id="storage"
                                    name="storage"
                                    className="form-control"
                                    value={formData.storage}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="gpu" className="form-label">GPU</label>
                                <input
                                    type="text"
                                    id="gpu"
                                    name="gpu"
                                    className="form-control"
                                    value={formData.gpu}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="screen" className="form-label">Screen</label>
                                <input
                                    type="text"
                                    id="screen"
                                    name="screen"
                                    className="form-control"
                                    value={formData.screen}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="os" className="form-label">OS</label>
                                <input
                                    type="text"
                                    id="os"
                                    name="os"
                                    className="form-control"
                                    value={formData.os}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="weight" className="form-label">Weight</label>
                                <input
                                    type="text"
                                    id="weight"
                                    name="weight"
                                    className="form-control"
                                    value={formData.weight}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="dimensions" className="form-label">Dimensions</label>
                                <input
                                    type="text"
                                    id="dimensions"
                                    name="dimensions"
                                    className="form-control"
                                    value={formData.dimensions}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="battery" className="form-label">Battery</label>
                                <input
                                    type="text"
                                    id="battery"
                                    name="battery"
                                    className="form-control"
                                    value={formData.battery}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="warranty" className="form-label">Warranty</label>
                                <input
                                    type="text"
                                    id="warranty"
                                    name="warranty"
                                    className="form-control"
                                    value={formData.warranty}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="image" className="form-label">Image</label>
                                {product && product.image && (
                                    <img
                                        src={`http://localhost:5000${product.image}`}
                                        alt="Product Image"
                                        style={{ maxWidth: '100px', marginBottom: '10px' }}
                                    />
                                )}
                                <input
                                    type="file"
                                    id="image"
                                    name="image"
                                    className="form-control"
                                    onChange={handleImageChange} // Xử lý sự kiện khi chọn hình ảnh
                                />
                            </div>
                            <button type="submit" className="btn btn-primary">
                                Save
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductForm;