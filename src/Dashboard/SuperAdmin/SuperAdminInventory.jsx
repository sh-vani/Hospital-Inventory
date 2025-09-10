import React, { useState } from 'react';
import { FaPills, FaEdit, FaPlusCircle, FaAdjust, FaCheck } from 'react-icons/fa';

const SuperAdminInventory = () => {
  // Sample inventory data
  const initialInventoryItems = [
    {
      id: 'DRG-0421',
      name: 'Paracetamol 500mg',
      category: 'Pharmaceutical',
      stock: 8,
      unit: 'Tablets',
      minLevel: 20,
      expiryDate: null,
    },
    {
      id: 'MS-0876',
      name: 'Surgical Gloves (Large)',
      category: 'Medical Supply',
      stock: 0,
      unit: 'Pairs',
      minLevel: 50,
      expiryDate: null,
    },
    {
      id: 'CON-1543',
      name: 'Syringe 5ml',
      category: 'Consumable',
      stock: 142,
      unit: 'Pieces',
      minLevel: 30,
      expiryDate: null,
    },
    {
      id: 'DRG-2087',
      name: 'Amoxicillin 250mg',
      category: 'Pharmaceutical',
      stock: 45,
      unit: 'Capsules',
      minLevel: 25,
      expiryDate: '2024-12-31',
    },
  ];

  const [inventoryItems, setInventoryItems] = useState(initialInventoryItems);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showExpiryModal, setShowExpiryModal] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    category: 'Pharmaceutical',
    stock: 0,
    unit: '',
    minLevel: 0,
    expiryDate: '',
  });

  // Calculate status based on stock and expiry
  const calculateStatus = (item) => {
    if (item.expiryDate) {
      const today = new Date();
      const expiry = new Date(item.expiryDate);
      const diffTime = expiry - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays <= 30) return 'expiry';
    }
    
    if (item.stock === 0) return 'out';
    if (item.stock < item.minLevel) return 'low';
    return 'in';
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'low':
        return <span className="badge bg-warning">Low Stock</span>;
      case 'out':
        return <span className="badge bg-danger">Out of Stock</span>;
      case 'in':
        return <span className="badge bg-success">In Stock</span>;
      case 'expiry':
        return <span className="badge bg-info">Near Expiry</span>;
      default:
        return <span className="badge bg-secondary">Unknown</span>;
    }
  };

  const getRowClass = (status) => {
    switch (status) {
      case 'low':
        return 'table-warning';
      case 'out':
        return 'table-danger';
      case 'expiry':
        return 'table-info';
      default:
        return '';
    }
  };

  // Modal handlers
  const openAddModal = () => {
    setFormData({
      id: '',
      name: '',
      category: 'Pharmaceutical',
      stock: 0,
      unit: '',
      minLevel: 0,
      expiryDate: '',
    });
    setShowAddModal(true);
  };

  const openEditModal = (item) => {
    setCurrentItem(item);
    setFormData({
      id: item.id,
      name: item.name,
      category: item.category,
      stock: item.stock,
      unit: item.unit,
      minLevel: item.minLevel,
      expiryDate: item.expiryDate || '',
    });
    setShowEditModal(true);
  };

  const openRestockModal = (item) => {
    setCurrentItem(item);
    setShowRestockModal(true);
  };

  const openAdjustModal = (item) => {
    setCurrentItem(item);
    setShowAdjustModal(true);
  };

  const openExpiryModal = (item) => {
    setCurrentItem(item);
    setShowExpiryModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'stock' || name === 'minLevel' ? parseInt(value) : value,
    });
  };

  const handleAddItem = () => {
    const newItem = {
      ...formData,
      expiryDate: formData.expiryDate || null,
    };
    setInventoryItems([...inventoryItems, newItem]);
    setShowAddModal(false);
  };

  const handleEditItem = () => {
    const updatedItems = inventoryItems.map(item =>
      item.id === currentItem.id ? { ...formData, expiryDate: formData.expiryDate || null } : item
    );
    setInventoryItems(updatedItems);
    setShowEditModal(false);
  };

  const handleRestock = (amount) => {
    const updatedItems = inventoryItems.map(item =>
      item.id === currentItem.id ? { ...item, stock: item.stock + amount } : item
    );
    setInventoryItems(updatedItems);
    setShowRestockModal(false);
  };

  const handleAdjustStock = (newStock) => {
    const updatedItems = inventoryItems.map(item =>
      item.id === currentItem.id ? { ...item, stock: newStock } : item
    );
    setInventoryItems(updatedItems);
    setShowAdjustModal(false);
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Inventory Management</h2>
        <div>
          <button className="btn btn-primary" onClick={openAddModal}>
            <FaPlusCircle className="me-2" /> Add New Item
          </button>
        </div>
      </div>
      
      <div className="card">
        <div className="card-header">
          <h5>All Inventory Items</h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Item ID</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Current Stock</th>
                  <th>Unit</th>
                  <th>Min Level</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {inventoryItems.map((item) => {
                  const status = calculateStatus(item);
                  return (
                    <tr key={item.id} className={getRowClass(status)}>
                      <td>{item.id}</td>
                      <td>{item.name}</td>
                      <td>{item.category}</td>
                      <td>{item.stock}</td>
                      <td>{item.unit}</td>
                      <td>{item.minLevel}</td>
                      <td>{getStatusBadge(status)}</td>
                      <td>
                        <button 
                          className="btn btn-sm btn-outline-primary me-1" 
                          onClick={() => openEditModal(item)}
                        >
                          <FaEdit className="me-1" /> Edit
                        </button>
                        {status === 'low' || status === 'out' ? (
                          <button 
                            className="btn btn-sm btn-outline-info me-1" 
                            onClick={() => openRestockModal(item)}
                          >
                            <FaPlusCircle className="me-1" /> Restock
                          </button>
                        ) : (
                          <button 
                            className="btn btn-sm btn-outline-info me-1" 
                            onClick={() => openAdjustModal(item)}
                          >
                            <FaAdjust className="me-1" /> Adjust
                          </button>
                        )}
                        {status === 'expiry' && (
                          <button 
                            className="btn btn-sm btn-outline-warning" 
                            onClick={() => openExpiryModal(item)}
                          >
                            <FaCheck className="me-1" /> Check
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Inventory Item</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label className="form-label">Item ID</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      name="id"
                      value={formData.id}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Category</label>
                    <select 
                      className="form-select" 
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                    >
                      <option value="Pharmaceutical">Pharmaceutical</option>
                      <option value="Medical Supply">Medical Supply</option>
                      <option value="Consumable">Consumable</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Current Stock</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Unit</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      name="unit"
                      value={formData.unit}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Min Level</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      name="minLevel"
                      value={formData.minLevel}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Expiry Date (Optional)</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                    />
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-primary" onClick={handleAddItem}>
                  Add Item
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {showEditModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Inventory Item</h5>
                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label className="form-label">Item ID</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      name="id"
                      value={formData.id}
                      onChange={handleInputChange}
                      disabled
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Category</label>
                    <select 
                      className="form-select" 
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                    >
                      <option value="Pharmaceutical">Pharmaceutical</option>
                      <option value="Medical Supply">Medical Supply</option>
                      <option value="Consumable">Consumable</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Current Stock</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Unit</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      name="unit"
                      value={formData.unit}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Min Level</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      name="minLevel"
                      value={formData.minLevel}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Expiry Date (Optional)</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                    />
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-primary" onClick={handleEditItem}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Restock Modal */}
      {showRestockModal && currentItem && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Restock Item</h5>
                <button type="button" className="btn-close" onClick={() => setShowRestockModal(false)}></button>
              </div>
              <div className="modal-body">
                <h6>{currentItem.name}</h6>
                <p>Current Stock: {currentItem.stock} {currentItem.unit}</p>
                <div className="mb-3">
                  <label className="form-label">Amount to Add</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    id="restockAmount"
                    min="1"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowRestockModal(false)}>
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={() => {
                    const amount = parseInt(document.getElementById('restockAmount').value);
                    if (amount > 0) handleRestock(amount);
                  }}
                >
                  Restock Item
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {showAdjustModal && currentItem && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Adjust Stock</h5>
                <button type="button" className="btn-close" onClick={() => setShowAdjustModal(false)}></button>
              </div>
              <div className="modal-body">
                <h6>{currentItem.name}</h6>
                <p>Current Stock: {currentItem.stock} {currentItem.unit}</p>
                <div className="mb-3">
                  <label className="form-label">New Stock Amount</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    id="adjustAmount"
                    min="0"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAdjustModal(false)}>
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={() => {
                    const newStock = parseInt(document.getElementById('adjustAmount').value);
                    if (newStock >= 0) handleAdjustStock(newStock);
                  }}
                >
                  Update Stock
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Expiry Check Modal */}
      {showExpiryModal && currentItem && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Expiry Check</h5>
                <button type="button" className="btn-close" onClick={() => setShowExpiryModal(false)}></button>
              </div>
              <div className="modal-body">
                <h6>{currentItem.name}</h6>
                <p><strong>Expiry Date:</strong> {currentItem.expiryDate}</p>
                <div className="alert alert-warning">
                  This item is nearing its expiry date. Please take necessary action.
                </div>
                <div className="d-flex justify-content-between">
                  <button className="btn btn-warning">Mark for Disposal</button>
                  <button className="btn btn-info">Extend Expiry</button>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowExpiryModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Backdrop */}
      {(showAddModal || showEditModal || showRestockModal || showAdjustModal || showExpiryModal) && (
        <div className="modal-backdrop show"></div>
      )}
    </div>
  );
};

export default SuperAdminInventory;