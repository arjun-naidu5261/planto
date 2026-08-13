import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';

export default function AddProductModal() {
  const { 
    showAddProduct, 
    setShowAddProduct, 
    editingProduct, 
    setEditingProduct,
    addProduct, 
    updateProduct,
    activeVendorId 
  } = useApp();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Indoor Plants');
  const [price, setPrice] = useState('');
  const [qty, setQty] = useState('');
  const [image, setImage] = useState('');

  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name || '');
      setCategory(editingProduct.category || 'Indoor Plants');
      setPrice(editingProduct.price || '');
      setQty(editingProduct.quantity || '');
      setImage(editingProduct.images?.[0] || '');
    } else {
      setName('');
      setCategory('Indoor Plants');
      setPrice('');
      setQty('');
      setImage('');
    }
  }, [editingProduct, showAddProduct]);

  if (!showAddProduct) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Resolve mapping types
    let type = 'plant';
    if (category.includes('Seeds')) type = 'seed';
    else if (category.includes('Soil')) type = 'soil';
    else if (category.includes('Pots')) type = 'pot';
    else if (category.includes('Decoration')) type = 'stones';
    else if (category.includes('Essentials')) type = 'essential';

    const payload = {
      name,
      category,
      type,
      price: parseFloat(price),
      quantity: parseInt(qty),
      vendorId: activeVendorId,
      images: image ? [image] : ["https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=600&q=80"]
    };

    if (editingProduct) {
      const res = await updateProduct(editingProduct.id, payload);
      if (res.success) {
        alert("Product updated successfully!");
      }
    } else {
      const res = await addProduct(payload);
      if (res.success) {
        alert("Product published to stall inventory!");
      }
    }

    setEditingProduct(null);
    setShowAddProduct(false);
  };

  const handleClose = () => {
    setEditingProduct(null);
    setShowAddProduct(false);
  };

  return (
    <div className="modal-overlay active" id="modal-add-product" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-modal" id="add-prod-close-btn" onClick={handleClose}>&times;</button>
        <h3 style={{ marginBottom: '20px' }}>{editingProduct ? 'Edit Stall Product' : 'Add Plant to Live Inventory'}</h3>
        
        <form id="vendor-product-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="prod-name">Plant / Item Name</label>
            <input type="text" id="prod-name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Aloe Vera Plant" />
          </div>
          <div className="form-group">
            <label htmlFor="prod-category">Category</label>
            <select id="prod-category" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="Indoor Plants">Indoor Plants</option>
              <option value="Outdoor Plants">Outdoor Plants</option>
              <option value="Seeds Collection">Seeds Collection</option>
              <option value="Soil Collection">Soil Collection</option>
              <option value="Pots & Containers">Pots & Containers</option>
              <option value="Garden Decoration">Garden Decoration</option>
              <option value="Gardening Essentials">Gardening Essentials</option>
            </select>
          </div>
          <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label htmlFor="prod-price">Price (₹)</label>
              <input type="number" id="prod-price" required min="10" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 150" />
            </div>
            <div>
              <label htmlFor="prod-qty">Stock Count</label>
              <input type="number" id="prod-qty" required min="0" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="e.g. 12" />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="prod-image">Image URL (Optional)</label>
            <input type="text" id="prod-image" value={image} onChange={(e) => setImage(e.target.value)} placeholder="Leave empty for generic plant image" />
          </div>
          <button type="submit" className="btn" style={{ width: '100%', justifyContent: 'center', marginTop: '12px' }}>
            {editingProduct ? 'Save Changes' : 'Publish to Stall Inventory'}
          </button>
        </form>
      </div>
    </div>
  );
}
