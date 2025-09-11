import React, { useState, useEffect } from 'react';
import { 
  FaBox, FaPlus, FaEdit, FaTrash, FaSearch, FaFilter, 
  FaEye, FaCalendarAlt, FaArrowUp, FaArrowDown 
} from 'react-icons/fa';

const FacilityInventory = () => {
  // State for active tab - changed to match new requirements
  const [activeTab, setActiveTab] = useState('facility');
  
  // State for modals
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showUpdateItemModal, setShowUpdateItemModal] = useState(false);
  const [showRemoveItemModal, setShowRemoveItemModal] = useState(false);
  
  // State for inline editing
  const [editingItemId, setEditingItemId] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState('');
  
  // Sample data - updated to match required columns
  const facilityInventory = [
    { id: 1, itemCode: 'MG-001', itemName: 'Medical Gloves', stockQty: 500, expiryDate: '2025-06-30', minQty: 100, maxQty: 1000, uom: 'boxes', status: 'OK' },
    { id: 2, itemCode: 'FM-002', itemName: 'Face Masks', stockQty: 1200, expiryDate: '2024-12-31', minQty: 200, maxQty: 1500, uom: 'pieces', status: 'OK' },
    { id: 3, itemCode: 'SZ-003', itemName: 'Sanitizer', stockQty: 50, expiryDate: '2024-09-15', minQty: 100, maxQty: 500, uom: 'bottles', status: 'Low' },
    { id: 4, itemCode: 'SY-004', itemName: 'Syringes', stockQty: 0, expiryDate: '2024-08-01', minQty: 50, maxQty: 500, uom: 'pieces', status: 'Out of Stock' },
  ];
  
  const warehouseInventory = [
    { id: 1, itemCode: 'MG-001', itemName: 'Medical Gloves', stockQty: 1500, expiryDate: '2025-06-30', minQty: 500, maxQty: 2000, uom: 'boxes', status: 'OK' },
    { id: 2, itemCode: 'FM-002', itemName: 'Face Masks', stockQty: 3200, expiryDate: '2024-12-31', minQty: 1000, maxQty: 5000, uom: 'pieces', status: 'OK' },
    { id: 3, itemCode: 'SZ-003', itemName: 'Sanitizer', stockQty: 150, expiryDate: '2024-09-15', minQty: 200, maxQty: 1000, uom: 'bottles', status: 'Low' },
    { id: 4, itemCode: 'SY-004', itemName: 'Syringes', stockQty: 0, expiryDate: '2024-08-01', minQty: 300, maxQty: 2000, uom: 'pieces', status: 'Out of Stock' },
  ];
  
  // Function to handle inline edit start
  const startInlineEdit = (id, field, currentValue) => {
    setEditingItemId(id);
    setEditingField(field);
    setTempValue(currentValue);
  };
  
  // Function to save inline edit
  const saveInlineEdit = () => {
    // Here you would normally update the data in your state or API
    setEditingItemId(null);
    setEditingField(null);
    setTempValue('');
  };
  
  // Function to cancel inline edit
  const cancelInlineEdit = () => {
    setEditingItemId(null);
    setEditingField(null);
    setTempValue('');
  };
  
  // Check if any modal is open
  const isAnyModalOpen = () => {
    return showAddItemModal || showUpdateItemModal || showRemoveItemModal;
  };
  
  // Effect to handle body class when modal is open
  useEffect(() => {
    if (isAnyModalOpen()) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    
    // Cleanup on unmount
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [showAddItemModal, showUpdateItemModal, showRemoveItemModal]);
  
  // Function to get status color
  const getStatusColor = (status) => {
    switch(status) {
      case 'OK':
        return 'bg-success';
      case 'Low':
        return 'bg-warning text-dark';
      case 'Out of Stock':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };
  
  // Function to get row color based on status
  const getRowColor = (status) => {
    switch(status) {
      case 'OK':
        return '';
      case 'Low':
        return 'table-warning';
      case 'Out of Stock':
        return 'table-danger';
      default:
        return '';
    }
  };
  
  // Render the active tab content
  const renderActiveTab = () => {
    switch(activeTab) {
      case 'facility':
        return (
          <div className="p-3">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2>Facility Inventory</h2>
              <button className="btn btn-primary" onClick={() => setShowAddItemModal(true)}>
                <FaPlus className="me-2" /> Add Item
              </button>
            </div>
            
            <div className="card">
              <div className="card-header bg-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Facility Inventory Items</h5>
                <div className="d-flex gap-2">
                  <div className="input-group input-group-sm">
                    <span className="input-group-text"><FaSearch /></span>
                    <input type="text" className="form-control" placeholder="Search items..." />
                  </div>
                  <button className="btn btn-sm btn-outline-secondary">
                    <FaFilter />
                  </button>
                </div>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Item Code</th>
                        <th>Item Name</th>
                        <th>Stock Qty</th>
                        <th>Expiry Date</th>
                        <th>Min Qty</th>
                        <th>Max Qty</th>
                        <th>UoM</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {facilityInventory.map(item => (
                        <tr key={item.id} className={getRowColor(item.status)}>
                          <td>{item.itemCode}</td>
                          <td>{item.itemName}</td>
                          <td>
                            {editingItemId === item.id && editingField === 'stockQty' ? (
                              <div className="input-group input-group-sm">
                                <input 
                                  type="number" 
                                  className="form-control" 
                                  value={tempValue}
                                  onChange={(e) => setTempValue(e.target.value)}
                                />
                                <button className="btn btn-sm btn-success" onClick={saveInlineEdit}>✓</button>
                                <button className="btn btn-sm btn-secondary" onClick={cancelInlineEdit}>✗</button>
                              </div>
                            ) : (
                              <div className="d-flex justify-content-between align-items-center">
                                {item.stockQty}
                                <button 
                                  className="btn btn-sm btn-outline-secondary ms-2" 
                                  onClick={() => startInlineEdit(item.id, 'stockQty', item.stockQty)}
                                >
                                  <FaEdit />
                                </button>
                              </div>
                            )}
                          </td>
                          <td>{item.expiryDate}</td>
                          <td>
                            {editingItemId === item.id && editingField === 'minQty' ? (
                              <div className="input-group input-group-sm">
                                <input 
                                  type="number" 
                                  className="form-control" 
                                  value={tempValue}
                                  onChange={(e) => setTempValue(e.target.value)}
                                />
                                <button className="btn btn-sm btn-success" onClick={saveInlineEdit}>✓</button>
                                <button className="btn btn-sm btn-secondary" onClick={cancelInlineEdit}>✗</button>
                              </div>
                            ) : (
                              <div className="d-flex justify-content-between align-items-center">
                                {item.minQty}
                                <button 
                                  className="btn btn-sm btn-outline-secondary ms-2" 
                                  onClick={() => startInlineEdit(item.id, 'minQty', item.minQty)}
                                >
                                  <FaEdit />
                                </button>
                              </div>
                            )}
                          </td>
                          <td>
                            {editingItemId === item.id && editingField === 'maxQty' ? (
                              <div className="input-group input-group-sm">
                                <input 
                                  type="number" 
                                  className="form-control" 
                                  value={tempValue}
                                  onChange={(e) => setTempValue(e.target.value)}
                                />
                                <button className="btn btn-sm btn-success" onClick={saveInlineEdit}>✓</button>
                                <button className="btn btn-sm btn-secondary" onClick={cancelInlineEdit}>✗</button>
                              </div>
                            ) : (
                              <div className="d-flex justify-content-between align-items-center">
                                {item.maxQty}
                                <button 
                                  className="btn btn-sm btn-outline-secondary ms-2" 
                                  onClick={() => startInlineEdit(item.id, 'maxQty', item.maxQty)}
                                >
                                  <FaEdit />
                                </button>
                              </div>
                            )}
                          </td>
                          <td>{item.uom}</td>
                          <td>
                            <span className={`badge ${getStatusColor(item.status)}`}>
                              {item.status}
                            </span>
                          </td>
                          <td>
                            <div className="btn-group" role="group">
                              <button className="btn btn-sm btn-outline-primary" onClick={() => setShowUpdateItemModal(true)}>
                                <FaEdit />
                              </button>
                              <button className="btn btn-sm btn-outline-danger" onClick={() => setShowRemoveItemModal(true)}>
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'warehouse':
        return (
          <div className="p-3">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2>Warehouse Inventory</h2>
            </div>
            
            <div className="card bg-light">
              <div className="card-header bg-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Warehouse Inventory Items</h5>
                <div className="d-flex gap-2">
                  <div className="input-group input-group-sm">
                    <span className="input-group-text"><FaSearch /></span>
                    <input type="text" className="form-control" placeholder="Search items..." />
                  </div>
                  <button className="btn btn-sm btn-outline-secondary">
                    <FaFilter />
                  </button>
                </div>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Item Code</th>
                        <th>Item Name</th>
                        <th>Stock Qty</th>
                        <th>Expiry Date</th>
                        <th>Min Qty</th>
                        <th>Max Qty</th>
                        <th>UoM</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {warehouseInventory.map(item => (
                        <tr key={item.id} className={getRowColor(item.status)}>
                          <td>{item.itemCode}</td>
                          <td>{item.itemName}</td>
                          <td>{item.stockQty}</td>
                          <td>{item.expiryDate}</td>
                          <td>{item.minQty}</td>
                          <td>{item.maxQty}</td>
                          <td>{item.uom}</td>
                          <td>
                            <span className={`badge ${getStatusColor(item.status)}`}>
                              {item.status}
                            </span>
                          </td>
                          <td>
                            <div className="btn-group" role="group">
                              <button className="btn btn-sm btn-outline-primary" disabled>
                                <FaEdit />
                              </button>
                              <button className="btn btn-sm btn-outline-danger" disabled>
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="h3">Inventory Management</h1>
          </div>
          
          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'facility' ? 'active' : ''}`}
                onClick={() => setActiveTab('facility')}
              >
                <FaBox className="me-2" />
                Facility Inventory
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'warehouse' ? 'active' : ''}`}
                onClick={() => setActiveTab('warehouse')}
              >
                <FaBox className="me-2" />
                Warehouse Inventory
              </button>
            </li>
          </ul>
          
          {renderActiveTab()}
        </div>
      </div>
      
      {/* Modals */}
      {/* Add Item Modal */}
      <div className={`modal fade ${showAddItemModal ? 'show' : ''}`} style={{ display: showAddItemModal ? 'block' : 'none' }} tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Add New Item</h5>
              <button type="button" className="btn-close" onClick={() => setShowAddItemModal(false)}></button>
            </div>
            <div className="modal-body">
              <form>
                <div className="mb-3">
                  <label className="form-label">Item Code</label>
                  <input type="text" className="form-control" placeholder="Enter item code" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Item Name</label>
                  <input type="text" className="form-control" placeholder="Enter item name" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Stock Quantity</label>
                  <input type="number" className="form-control" placeholder="Enter quantity" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Expiry Date</label>
                  <input type="date" className="form-control" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Minimum Quantity</label>
                  <input type="number" className="form-control" placeholder="Enter minimum quantity" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Maximum Quantity</label>
                  <input type="number" className="form-control" placeholder="Enter maximum quantity" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Unit of Measure</label>
                  <select className="form-select">
                    <option value="">Select unit</option>
                    <option value="pieces">Pieces</option>
                    <option value="boxes">Boxes</option>
                    <option value="bottles">Bottles</option>
                    <option value="kits">Kits</option>
                  </select>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowAddItemModal(false)}>Cancel</button>
              <button type="button" className="btn btn-primary">Add Item</button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Update Item Modal */}
      <div className={`modal fade ${showUpdateItemModal ? 'show' : ''}`} style={{ display: showUpdateItemModal ? 'block' : 'none' }} tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Update Item</h5>
              <button type="button" className="btn-close" onClick={() => setShowUpdateItemModal(false)}></button>
            </div>
            <div className="modal-body">
              <form>
                <div className="mb-3">
                  <label className="form-label">Item Code</label>
                  <input type="text" className="form-control" defaultValue="MG-001" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Item Name</label>
                  <input type="text" className="form-control" defaultValue="Medical Gloves" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Stock Quantity</label>
                  <input type="number" className="form-control" defaultValue="500" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Expiry Date</label>
                  <input type="date" className="form-control" defaultValue="2025-06-30" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Minimum Quantity</label>
                  <input type="number" className="form-control" defaultValue="100" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Maximum Quantity</label>
                  <input type="number" className="form-control" defaultValue="1000" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Unit of Measure</label>
                  <select className="form-select" defaultValue="boxes">
                    <option value="pieces">Pieces</option>
                    <option value="boxes">Boxes</option>
                    <option value="bottles">Bottles</option>
                    <option value="kits">Kits</option>
                  </select>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowUpdateItemModal(false)}>Cancel</button>
              <button type="button" className="btn btn-primary">Update Item</button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Remove Item Modal */}
      <div className={`modal fade ${showRemoveItemModal ? 'show' : ''}`} style={{ display: showRemoveItemModal ? 'block' : 'none' }} tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Remove Item</h5>
              <button type="button" className="btn-close" onClick={() => setShowRemoveItemModal(false)}></button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to remove <strong>Medical Gloves</strong> from inventory?</p>
              <p className="text-muted">This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowRemoveItemModal(false)}>Cancel</button>
              <button type="button" className="btn btn-danger">Remove Item</button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal Backdrop */}
      {isAnyModalOpen() && <div className="modal-backdrop fade show"></div>}
    </div>
  );
};

export default FacilityInventory;