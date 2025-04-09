import React, { useEffect, useState } from 'react';
import apiClient from '../../api/apiClient';
import ProductAddForm from './ProductAddForm';
import ProductEditForm from './ProductEditForm';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await apiClient.get('/products');
                setProducts(response.data);
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };
        fetchProducts();
    }, []);

    const handleDelete = async (id) => {
        try {
            await apiClient.delete(`/products/${id}`);
            setProducts(products.filter((product) => product._id !== id));
            alert('Product deleted successfully!');
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Failed to delete product');
        }
    };

    const openAddForm = () => {
        setShowAddForm(true);
    };

    const closeAddForm = () => {
        setShowAddForm(false);
    };

    const openEditForm = (product) => {
        setSelectedProduct(product);
        setShowEditForm(true);
    };

    const closeEditForm = () => {
        setSelectedProduct(null);
        setShowEditForm(false);
    };

    const handleSave = (newProduct) => {
        if (selectedProduct) {
            setProducts(
                products.map((p) =>
                    p._id === newProduct._id ? newProduct : p
                )
            );
        } else {
            setProducts([...products, newProduct]);
        }
        closeAddForm();
        closeEditForm();
    };

    return (
        <div>
            <button className="btn btn-primary mb-3" onClick={() => openAddForm()}>
                Add Product
            </button>
            <ul className="list-group">
                {products.map((product) => (
                    <li
                        key={product._id}
                        className="list-group-item d-flex justify-content-between align-items-center"
                    >
                        {product.name}
                        <div>
                            <button
                                className="btn btn-warning btn-sm me-2"
                                onClick={() => openEditForm(product)}
                            >
                                Edit
                            </button>
                            <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleDelete(product._id)}
                            >
                                Delete
                            </button>
                        </div>
                    </li>
                ))}
            </ul>

            {showAddForm && (
                <ProductAddForm
                    onClose={closeAddForm}
                    onSave={handleSave}
                />
            )}

            {showEditForm && (
                <ProductEditForm
                    product={selectedProduct}
                    onClose={closeEditForm}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

export default ProductList;