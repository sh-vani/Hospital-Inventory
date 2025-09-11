
import React, { useState, useEffect } from 'react';
import { 
  FaBox, FaPlus, FaEdit, FaTrash, FaSearch, FaFilter, 
  FaEye, FaCalendarAlt, FaArrowUp, FaArrowDown, FaWarehouse
} from 'react-icons/fa';

const FacilityInventory = () => {
  // State for active tab
  const [activeTab, setActiveTab] = useState('facility');
  
  // State for modals
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showUpdateItemModal, setShowUpdateItemModal] = useState(false);
  const [showRemoveItemModal, setShowRemoveItemModal] = useState(false);
  const [showViewItemModal, setShowViewItemModal] = useState(false);
  const [showUpdateStockModal, setShowUpdateStockModal] = useState(false);
  
  // State for selected item
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Sample data for Facility Inventory
  const facilityInventory = [
    { id: 'DRG-0421', name: 'Paracetamol 500mg', category: 'Pharmaceutical', stock: 8, unit: 'Tablets', minLevel: 20, maxLevel: 100, expiryDate: '2025-06-30', status: 'Low Stock' },
    { id: 'MS-0876', name: 'Surgical Gloves (Large)', category: 'Medical Supply', stock: 0, unit: 'Pairs', minLevel: 50, maxLevel: 200, expiryDate: '2024-12-31', status: 'Out of Stock' },
    { id: 'CON-1543', name: 'Syringe 5ml', category: 'Consumable', stock: 142, unit: 'Pieces', minLevel: 30, maxLevel: 150, expiryDate: '2026-03-15', status: 'In Stock' },
    { id: 'DRG-2087', name: 'Amoxicillin 250mg', category: 'Pharmaceutical', stock: 45, unit: 'Capsules', minLevel: 25, maxLevel: 120, expiryDate: '2024-09-20', status: 'In Stock' },
  ];
  
  // Sample data for Warehouse Inventory
  const warehouseInventory = [
    { id: 'DRG-0421', name: 'Paracetamol 500mg', category: 'Pharmaceutical', stock: 150, unit: 'Tablets', minLevel: 100, maxLevel: 500, expiryDate: '2025-06-30', status: 'In Stock' },
    { id: 'MS-0876', name: 'Surgical Gloves (Large)', category: 'Medical Supply', stock: 80, unit: 'Pairs', minLevel: 50, maxLevel: 300, expiryDate: '2024-12-31', status: 'In Stock' },
    { id: 'CON-1543', name: 'Syringe 5ml', category: 'Consumable', stock: 200, unit: 'Pieces', minLevel: 100, maxLevel: 400, expiryDate: '2026-03-15', status: 'In Stock' },
    { id: 'DRG-2087', name: 'Amoxicillin 250mg', category: 'Pharmaceutical', stock: 120, unit: 'Capsules', minLevel: 100, maxLevel: 300, expiryDate: '2024-09-20', status: 'In Stock' },
  ];
  
  // Check if any modal is open
  const isAnyModalOpen = () => {
    return showAddItemModal || showUpdateItemModal || showRemoveItemModal || 
           showViewItemModal || showUpdateStockModal;
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
  }, [showAddItemModal, showUpdateItemModal, showRemoveItemModal, 
      showViewItemModal, showUpdateStockModal]);
  
  // Handle view item
  const handleViewItem = (item) => {
    setSelectedItem(item);
    setShowViewItemModal(true);
  };
  
  // Handle update stock
  const handleUpdateStock = (item) => {
    setSelectedItem(item);
    setShowUpdateStockModal(true);
  };
  
  // Handle edit item
  const handleEditItem = (item) => {
    setSelectedItem(item);
    setShowUpdateItemModal(true);
  };
  
  // Handle delete item
  const handleDeleteItem = (item) => {
    setSelectedItem(item);
    setShowRemoveItemModal(true);
  };
  
  // Render the active tab content
  const renderActiveTab = () => {
    const inventoryData = activeTab === 'facility' ? facilityInventory : warehouseInventory;
    const isReadOnly = activeTab === 'warehouse';
    
    return (
      <div className="p-3">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>{activeTab === 'facility' ? 'Facility Inventory' : 'Warehouse Inventory'}</h2>
          {!isReadOnly && (
            <button className="btn btn-primary" onClick={() => setShowAddItemModal(true)}>
              <FaPlus className="me-2" /> Add Item
            </button>
          )}
        </div>
        
        <div className={`card ${isReadOnly ? 'bg-light' : ''}`}>
          <div className="card-header bg-white d-flex justify-content-between align-items-center">
            <h5 className="mb-0">All Items</h5>
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
                    <th>Category</th>
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
                  {inventoryData.map(item => (
                    <tr key={item.id} className={
                      item.status === 'Low Stock' ? 'table-warning' : 
                      item.status === 'Out of Stock' ? 'table-danger' : 
                      item.status === 'In Stock' ? 'table-success' : ''
                    }>
                      <td>{item.id}</td>
                      <td>{item.name}</td>
                      <td>{item.category}</td>
                      <td>{item.stock}</td>
                      <td>{item.expiryDate}</td>
                      <td>{item.minLevel}</td>
                      <td>{item.maxLevel}</td>
                      <td>{item.unit}</td>
                      <td>
                        <span className={`badge ${
                          item.status === 'In Stock' ? 'bg-success' : 
                          item.status === 'Low Stock' ? 'bg-warning text-dark' : 
                          'bg-danger'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group" role="group">
                          <button 
                            className="btn btn-sm btn-outline-primary" 
                            onClick={() => handleViewItem(item)}
                            title="View"
                          >
                            <FaEye />
                          </button>
                          {!isReadOnly && (
                            <>
                              <button 
                                className="btn btn-sm btn-outline-success" 
                                onClick={() => handleUpdateStock(item)}
                                title="Update Stock"
                              >
                                <FaPlus />
                              </button>
                              <button 
                                className="btn btn-sm btn-outline-secondary" 
                                onClick={() => handleEditItem(item)}
                                title="Edit"
                              >
                                <FaEdit />
                              </button>
                              <button 
                                className="btn btn-sm btn-outline-danger" 
                                onClick={() => handleDeleteItem(item)}
                                title="Delete"
                              >
                                <FaTrash />
                              </button>
                            </>
                          )}
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
                <FaWarehouse className="me-2" />
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
                  <label className="form-label">Category</label>
                  <select className="form-select">
                    <option value="">Select category</option>
                    <option value="Pharmaceutical">Pharmaceutical</option>
                    <option value="Medical Supply">Medical Supply</option>
                    <option value="Consumable">Consumable</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Stock Quantity</label>
                  <input type="number" className="form-control" placeholder="Enter stock quantity" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Expiry Date</label>
                  <input type="date" className="form-control" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Min Quantity</label>
                  <input type="number" className="form-control" placeholder="Enter minimum quantity" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Max Quantity</label>
                  <input type="number" className="form-control" placeholder="Enter maximum quantity" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Unit of Measure</label>
                  <select className="form-select">
                    <option value="">Select unit</option>
                    <option value="Tablets">Tablets</option>
                    <option value="Capsules">Capsules</option>
                    <option value="Pieces">Pieces</option>
                    <option value="Pairs">Pairs</option>
                    <option value="Bottles">Bottles</option>
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
      
      {/* View Item Modal */}
      <div className={`modal fade ${showViewItemModal ? 'show' : ''}`} style={{ display: showViewItemModal ? 'block' : 'none' }} tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Item Details</h5>
              <button type="button" className="btn-close" onClick={() => setShowViewItemModal(false)}></button>
            </div>
            <div className="modal-body">
              {selectedItem && (
                <div>
                  <div className="row mb-3">
                    <div className="col-sm-4 fw-bold">Item Code:</div>
                    <div className="col-sm-8">{selectedItem.id}</div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-sm-4 fw-bold">Item Name:</div>
                    <div className="col-sm-8">{selectedItem.name}</div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-sm-4 fw-bold">Category:</div>
                    <div className="col-sm-8">{selectedItem.category}</div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-sm-4 fw-bold">Stock Quantity:</div>
                    <div className="col-sm-8">{selectedItem.stock} {selectedItem.unit}</div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-sm-4 fw-bold">Expiry Date:</div>
                    <div className="col-sm-8">{selectedItem.expiryDate}</div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-sm-4 fw-bold">Min Quantity:</div>
                    <div className="col-sm-8">{selectedItem.minLevel} {selectedItem.unit}</div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-sm-4 fw-bold">Max Quantity:</div>
                    <div className="col-sm-8">{selectedItem.maxLevel} {selectedItem.unit}</div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-sm-4 fw-bold">Unit of Measure:</div>
                    <div className="col-sm-8">{selectedItem.unit}</div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-sm-4 fw-bold">Status:</div>
                    <div className="col-sm-8">
                      <span className={`badge ${
                        selectedItem.status === 'In Stock' ? 'bg-success' : 
                        selectedItem.status === 'Low Stock' ? 'bg-warning text-dark' : 
                        'bg-danger'
                      }`}>
                        {selectedItem.status}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowViewItemModal(false)}>Close</button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Update Stock Modal */}
      <div className={`modal fade ${showUpdateStockModal ? 'show' : ''}`} style={{ display: showUpdateStockModal ? 'block' : 'none' }} tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Update Stock</h5>
              <button type="button" className="btn-close" onClick={() => setShowUpdateStockModal(false)}></button>
            </div>
            <div className="modal-body">
              {selectedItem && (
                <form>
                  <div className="mb-3">
                    <label className="form-label">Item</label>
                    <input type="text" className="form-control" defaultValue={`${selectedItem.id} - ${selectedItem.name}`} readOnly />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Current Stock</label>
                    <input type="text" className="form-control" defaultValue={`${selectedItem.stock} ${selectedItem.unit}`} readOnly />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Update Type</label>
                    <select className="form-select">
                      <option value="add">Add Stock</option>
                      <option value="subtract">Subtract Stock</option>
                      <option value="set">Set New Stock Level</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Quantity</label>
                    <input type="number" className="form-control" placeholder="Enter quantity" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Reason</label>
                    <textarea className="form-control" rows="3" placeholder="Enter reason for stock update"></textarea>
                  </div>
                </form>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowUpdateStockModal(false)}>Cancel</button>
              <button type="button" className="btn btn-primary">Update Stock</button>
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
              {selectedItem && (
                <form>
                  <div className="mb-3">
                    <label className="form-label">Item Code</label>
                    <input type="text" className="form-control" defaultValue={selectedItem.id} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Item Name</label>
                    <input type="text" className="form-control" defaultValue={selectedItem.name} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Category</label>
                    <select className="form-select" defaultValue={selectedItem.category}>
                      <option value="Pharmaceutical">Pharmaceutical</option>
                      <option value="Medical Supply">Medical Supply</option>
                      <option value="Consumable">Consumable</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Stock Quantity</label>
                    <input type="number" className="form-control" defaultValue={selectedItem.stock} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Expiry Date</label>
                    <input type="date" className="form-control" defaultValue={selectedItem.expiryDate} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Min Quantity</label>
                    <input type="number" className="form-control" defaultValue={selectedItem.minLevel} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Max Quantity</label>
                    <input type="number" className="form-control" defaultValue={selectedItem.maxLevel} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Unit of Measure</label>
                    <select className="form-select" defaultValue={selectedItem.unit}>
                      <option value="Tablets">Tablets</option>
                      <option value="Capsules">Capsules</option>
                      <option value="Pieces">Pieces</option>
                      <option value="Pairs">Pairs</option>
                      <option value="Bottles">Bottles</option>
                    </select>
                  </div>
                </form>
              )}
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
              {selectedItem && (
                <>
                  <p>Are you sure you want to remove <strong>{selectedItem.name}</strong> from inventory?</p>
                  <p className="text-muted">This action cannot be undone.</p>
                </>
              )}
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