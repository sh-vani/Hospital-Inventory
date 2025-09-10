import React, { useState } from 'react';
import { FaEdit, FaPlusCircle, FaPills } from 'react-icons/fa';

const WarehouseInventory = () => {
  // Sample inventory data
  const initialInventoryItems = [
    {
      id: 'DRG-0421',
      name: 'Paracetamol 500mg',
      category: 'Pharmaceutical',
      stock: 8,
      unit: 'Tablets',
      minLevel: 20,
    },
    {
      id: 'MS-0876',
      name: 'Surgical Gloves (Large)',
      category: 'Medical Supply',
      stock: 0,
      unit: 'Pairs',
      minLevel: 50,
    },
    {
      id: 'CON-1543',
      name: 'Syringe 5ml',
      category: 'Consumable',
      stock: 142,
      unit: 'Pieces',
      minLevel: 30,
    },
    {
      id: 'DRG-2087',
      name: 'Amoxicillin 250mg',
      category: 'Pharmaceutical',
      stock: 45,
      unit: 'Capsules',
      minLevel: 25,
    },
  ];

  const [inventoryItems, setInventoryItems] = useState(initialInventoryItems);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    category: 'Pharmaceutical',
    stock: 0,
    unit: '',
    minLevel: 0,
  });

  // Calculate status
  const calculateStatus = (item) => {
    if (item.stock === 0) return 'out';
    if (item.stock < item.minLevel) return 'low';
    return 'in';
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'low':
        return <span className="badge bg-warning text-dark rounded-pill px-3 py-2">Low Stock</span>;
      case 'out':
        return <span className="badge bg-danger rounded-pill px-3 py-2">Out of Stock</span>;
      case 'in':
        return <span className="badge bg-success rounded-pill px-3 py-2">In Stock</span>;
      default:
        return <span className="badge bg-secondary rounded-pill px-3 py-2">Unknown</span>;
    }
  };

  const getRowClass = (status) => {
    switch (status) {
      case 'low':
        return 'table-warning';
      case 'out':
        return 'table-danger';
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
    });
    setShowEditModal(true);
  };

  const openRestockModal = (item) => {
    setCurrentItem(item);
    setShowRestockModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'stock' || name === 'minLevel' ? parseInt(value) || 0 : value,
    });
  };

  const handleAddItem = () => {
    if (!formData.id || !formData.name || !formData.unit) {
      alert('Please fill required fields: ID, Name, Unit.');
      return;
    }
    setInventoryItems([...inventoryItems, { ...formData }]);
    setShowAddModal(false);
  };

  const handleEditItem = () => {
    setInventoryItems(
      inventoryItems.map((item) =>
        item.id === currentItem.id ? { ...formData } : item
      )
    );
    setShowEditModal(false);
  };

  const handleRestock = () => {
    const amount = parseInt(document.getElementById('restockAmount').value) || 0;
    if (amount <= 0) {
      alert('Enter valid restock amount.');
      return;
    }
    setInventoryItems(
      inventoryItems.map((item) =>
        item.id === currentItem.id
          ? { ...item, stock: item.stock + amount }
          : item
      )
    );
    setShowRestockModal(false);
  };

  const closeModalOnBackdrop = (e) => {
    if (e.target.classList.contains('modal')) {
      setShowAddModal(false);
      setShowEditModal(false);
      setShowRestockModal(false);
    }
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary mb-0">

          Inventory Management
        </h2>
        <button className="btn btn-primary d-flex align-items-center" onClick={openAddModal}>
          <FaPlusCircle className="me-2" /> Add New Item
        </button>
      </div>

      {/* Table Card */}
      <div className="card border-0 ">
        <div className="card-header bg-light">
          <h5 className="mb-0 text-muted">All Inventory Items</h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover table-striped mb-0">
              <thead className="table-light">
                <tr>
                  <th scope="col" className="px-4 py-3">Item ID</th>
                  <th scope="col" className="px-4 py-3">Name</th>
                  <th scope="col" className="px-4 py-3">Category</th>
                  <th scope="col" className="px-4 py-3">Stock</th>
                  <th scope="col" className="px-4 py-3">Unit</th>
                  <th scope="col" className="px-4 py-3">Min Level</th>
                  <th scope="col" className="px-4 py-3">Status</th>
                  <th scope="col" className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {inventoryItems.map((item) => {
                  const status = calculateStatus(item);
                  return (
                    <tr key={item.id} className={getRowClass(status)}>
                      <td className="px-4 py-3 align-middle">{item.id}</td>
                      <td className="px-4 py-3 align-middle">{item.name}</td>
                      <td className="px-4 py-3 align-middle">{item.category}</td>
                      <td className="px-4 py-3 align-middle fw-bold">{item.stock}</td>
                      <td className="px-4 py-3 align-middle">{item.unit}</td>
                      <td className="px-4 py-3 align-middle">{item.minLevel}</td>
                      <td className="px-4 py-3 align-middle">{getStatusBadge(status)}</td>
                      <td className="px-4 py-3 align-middle">
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => openEditModal(item)}
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          {(status === 'low' || status === 'out') && (
                            <button
                              className="btn btn-sm btn-outline-success"
                              onClick={() => openRestockModal(item)}
                              title="Restock"
                            >
                              <FaPlusCircle />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ========== MODALS ========== */}

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="modal fade show d-block" tabIndex="-1" onClick={closeModalOnBackdrop}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header border-bottom-0">
                <h5 className="modal-title">Add New Inventory Item</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Item ID <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    name="id"
                    value={formData.id}
                    onChange={handleInputChange}
                    placeholder="e.g. DRG-0421"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Name <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Paracetamol"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select form-select-lg"
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
                    className="form-control form-control-lg"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Unit <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    placeholder="e.g. Tablets, Boxes"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Minimum Stock Level</label>
                  <input
                    type="number"
                    className="form-control form-control-lg"
                    name="minLevel"
                    value={formData.minLevel}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>
              </div>
              <div className="modal-footer border-top-0">
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
        <div className="modal fade show d-block" tabIndex="-1" onClick={closeModalOnBackdrop}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header border-bottom-0">
                <h5 className="modal-title">Edit Inventory Item</h5>
                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Item ID</label>
                  <input
                    type="text"
                    className="form-control form-control-lg"
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
                    className="form-control form-control-lg"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select form-select-lg"
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
                    className="form-control form-control-lg"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Unit</label>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Minimum Stock Level</label>
                  <input
                    type="number"
                    className="form-control form-control-lg"
                    name="minLevel"
                    value={formData.minLevel}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>
              </div>
              <div className="modal-footer border-top-0">
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
        <div className="modal fade show d-block" tabIndex="-1" onClick={closeModalOnBackdrop}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header border-bottom-0">
                <h5 className="modal-title">Restock Item</h5>
                <button type="button" className="btn-close" onClick={() => setShowRestockModal(false)}></button>
              </div>
              <div className="modal-body text-center">
                <h5 className="mb-1">{currentItem.name}</h5>
                <p className="text-muted">
                  Current Stock: <strong>{currentItem.stock} {currentItem.unit}</strong>
                </p>
                <div className="mb-3">
                  <label className="form-label">Amount to Add</label>
                  <input
                    type="number"
                    className="form-control form-control-lg text-center"
                    id="restockAmount"
                    min="1"
                    defaultValue="1"
                  />
                </div>
              </div>
              <div className="modal-footer border-top-0 justify-content-center">
                <button type="button" className="btn btn-secondary me-2" onClick={() => setShowRestockModal(false)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-success" onClick={handleRestock}>
                  Restock
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {(showAddModal || showEditModal || showRestockModal) && (
        <div className="modal-backdrop fade show"></div>
      )}
    </div>
  );
};

export default WarehouseInventory;