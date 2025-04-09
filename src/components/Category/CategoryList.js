import React, { useEffect, useState } from 'react';
import apiClient from '../../api/apiClient';
import CategoryForm from './CategoryForm';

const CategoryList = () => {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await apiClient.get('/categories');
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await apiClient.delete(`/categories/${id}`);
            setCategories(categories.filter((category) => category._id !== id));
            alert('Category deleted successfully!');
        } catch (error) {
            console.error('Error deleting category:', error);
            alert('Failed to delete category');
        }
    };

    const openForm = (category = null) => {
        setSelectedCategory(category);
        setShowForm(true);
    };

    const closeForm = () => {
        setSelectedCategory(null);
        setShowForm(false);
    };

    const handleSave = (newCategory) => {
        if (selectedCategory) {
            setCategories(
                categories.map((cat) => (cat._id === newCategory._id ? newCategory : cat))
            );
        } else {
            setCategories([...categories, newCategory]);
        }
        closeForm();
        fetchCategories(); // Refresh categories after saving
    };

    return (
        <div>
            <button className="btn btn-primary mb-3" onClick={() => openForm()}>
                Add Category
            </button>
            <ul className="list-group">
                {categories.map((category) => (
                    <li
                        key={category._id}
                        className="list-group-item d-flex justify-content-between align-items-center"
                    >
                        {category.name}
                        <div>
                            <button
                                className="btn btn-warning btn-sm me-2"
                                onClick={() => openForm(category)}
                            >
                                Edit
                            </button>
                            <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleDelete(category._id)}
                            >
                                Delete
                            </button>
                        </div>
                    </li>
                ))}
            </ul>

            {showForm && (
                <CategoryForm
                    category={selectedCategory}
                    onClose={closeForm}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

export default CategoryList;