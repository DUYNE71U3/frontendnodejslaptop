import React, { useState } from 'react';
import apiClient from '../../api/apiClient';

const CategoryForm = ({ category, onClose, onSave }) => {
    const [name, setName] = useState(category ? category.name : '');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (category) {
                const response = await apiClient.put(`/categories/${category._id}`, { name });
                onSave(response.data);
            } else {
                const response = await apiClient.post('/categories', { name });
                onSave(response.data);
            }
            onClose(); // Đóng modal sau khi thành công
        } catch (error) {
            console.error('Error saving category:', error);
            alert('Failed to save category');
        }
    };

    return (
        <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{category ? 'Edit Category' : 'Add Category'}</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label htmlFor="name" className="form-label">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    className="form-control"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
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

export default CategoryForm;