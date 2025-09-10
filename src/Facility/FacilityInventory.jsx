import React, { useState, useEffect } from 'react';
import { 
  FaBox, FaPlus, FaEdit, FaTrash, FaSearch, FaFilter, 
  FaEye, FaCalendarAlt, FaArrowUp, FaArrowDown 
} from 'react-icons/fa';

const FacilityInventory = () => {
  // State for active tab
  const [activeTab, setActiveTab] = useState('items');
  
  // State for modals
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showUpdateItemModal, setShowUpdateItemModal] = useState(false);
  const [showRemoveItemModal, setShowRemoveItemModal] = useState(false);
  const [showAddBatchModal, setShowAddBatchModal] = useState(false);
  const [showUpdateBatchModal, setShowUpdateBatchModal] = useState(false);
  const [showRemoveBatchModal, setShowRemoveBatchModal] = useState(false);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  
  // Sample data
  const inventoryItems = [
    { id: 1, name: 'Medical Gloves', sku: 'MG-001', quantity: 500, unit: 'boxes', location: 'A1-B2', status: 'In Stock' },
    { id: 2, name: 'Face Masks', sku: 'FM-002', quantity: 1200, unit: 'pieces', location: 'A1-B3', status: 'In Stock' },
    { id: 3, name: 'Sanitizer', sku: 'SZ-003', quantity: 50, unit: 'bottles', location: 'A2-C1', status: 'Low Stock' },
    { id: 4, name: 'Syringes', sku: 'SY-004', quantity: 0, unit: 'pieces', location: 'A2-C2', status: 'Out of Stock' },
  ];
  
  const batches = [
    { id: 1, item: 'Medical Gloves', batchNumber: 'BG-2023-001', quantity: 200, expiryDate: '2025-06-30', status: 'Active' },
    { id: 2, item: 'Face Masks', batchNumber: 'BF-2023-015', quantity: 500, expiryDate: '2024-12-31', status: 'Active' },
    { id: 3, item: 'Sanitizer', batchNumber: 'BS-2023-008', quantity: 30, expiryDate: '2024-09-15', status: 'Expiring Soon' },
  ];
  
  const adjustments = [
    { id: 1, item: 'Medical Gloves', type: 'Increase', quantity: 50, reason: 'Restock', date: '2023-07-10', by: 'Admin' },
    { id: 2, item: 'Face Masks', type: 'Decrease', quantity: 100, reason: 'Damaged items', date: '2023-07-12', by: 'J. Smith' },
    { id: 3, item: 'Sanitizer', type: 'Increase', quantity: 20, reason: 'New stock', date: '2023-07-15', by: 'Admin' },
  ];
  
  // Check if any modal is open
  const isAnyModalOpen = () => {
    return showAddItemModal || showUpdateItemModal || showRemoveItemModal || 
           showAddBatchModal || showUpdateBatchModal || showRemoveBatchModal || 
           showAdjustmentModal;
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
      showAddBatchModal, showUpdateBatchModal, showRemoveBatchModal, 
      showAdjustmentModal]);
  
  // Render the active tab content
  const renderActiveTab = () => {
    switch(activeTab) {
      case 'items':
        return (
          <div className="p-3">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2>Inventory Items</h2>
              <button className="btn btn-primary" onClick={() => setShowAddItemModal(true)}>
                <FaPlus className="me-2" /> Add Item
              </button>
            </div>
            
            <div className="card">
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
                        <th>ID</th>
                        <th>Item Name</th>
                        <th>SKU</th>
                        <th>Quantity</th>
                        <th>Unit</th>
                        <th>Location</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventoryItems.map(item => (
                        <tr key={item.id}>
                          <td>{item.id}</td>
                          <td>{item.name}</td>
                          <td>{item.sku}</td>
                          <td>{item.quantity}</td>
                          <td>{item.unit}</td>
                          <td>{item.location}</td>
                          <td>
                            <span className={`badge ${item.status === 'In Stock' ? 'bg-success' : item.status === 'Low Stock' ? 'bg-warning text-dark' : 'bg-danger'}`}>
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
        
      case 'batches':
        return (
          <div className="p-3">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2>Batch Management</h2>
              <button className="btn btn-primary" onClick={() => setShowAddBatchModal(true)}>
                <FaPlus className="me-2" /> Add Batch
              </button>
            </div>
            
            <div className="card">
              <div className="card-header bg-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">All Batches</h5>
                <div className="d-flex gap-2">
                  <div className="input-group input-group-sm">
                    <span className="input-group-text"><FaSearch /></span>
                    <input type="text" className="form-control" placeholder="Search batches..." />
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
                        <th>ID</th>
                        <th>Item</th>
                        <th>Batch Number</th>
                        <th>Quantity</th>
                        <th>Expiry Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {batches.map(batch => (
                        <tr key={batch.id}>
                          <td>{batch.id}</td>
                          <td>{batch.item}</td>
                          <td>{batch.batchNumber}</td>
                          <td>{batch.quantity}</td>
                          <td>{batch.expiryDate}</td>
                          <td>
                            <span className={`badge ${batch.status === 'Active' ? 'bg-success' : 'bg-warning text-dark'}`}>
                              {batch.status}
                            </span>
                          </td>
                          <td>
                            <div className="btn-group" role="group">
                              <button className="btn btn-sm btn-outline-primary" onClick={() => setShowUpdateBatchModal(true)}>
                                <FaEdit />
                              </button>
                              <button className="btn btn-sm btn-outline-danger" onClick={() => setShowRemoveBatchModal(true)}>
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
        
      case 'adjustments':
        return (
          <div className="p-3">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2>Stock Adjustments</h2>
              <button className="btn btn-primary" onClick={() => setShowAdjustmentModal(true)}>
                <FaPlus className="me-2" /> New Adjustment
              </button>
            </div>
            
            <div className="card">
              <div className="card-header bg-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Adjustment History</h5>
                <div className="d-flex gap-2">
                  <div className="input-group input-group-sm">
                    <span className="input-group-text"><FaSearch /></span>
                    <input type="text" className="form-control" placeholder="Search adjustments..." />
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
                        <th>ID</th>
                        <th>Item</th>
                        <th>Type</th>
                        <th>Quantity</th>
                        <th>Reason</th>
                        <th>Date</th>
                        <th>By</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adjustments.map(adj => (
                        <tr key={adj.id}>
                          <td>{adj.id}</td>
                          <td>{adj.item}</td>
                          <td>
                            <span className={`badge ${adj.type === 'Increase' ? 'bg-success' : 'bg-danger'}`}>
                              {adj.type}
                            </span>
                          </td>
                          <td>{adj.quantity}</td>
                          <td>{adj.reason}</td>
                          <td>{adj.date}</td>
                          <td>{adj.by}</td>
                          <td>
                            <button className="btn btn-sm btn-outline-primary">
                              <FaEye />
                            </button>
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
            <h1 className="h3">Facility Inventory</h1>
          </div>
          
          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'items' ? 'active' : ''}`}
                onClick={() => setActiveTab('items')}
              >
                <FaBox className="me-2" />
                Items
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'batches' ? 'active' : ''}`}
                onClick={() => setActiveTab('batches')}
              >
                <FaCalendarAlt className="me-2" />
                Batches
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'adjustments' ? 'active' : ''}`}
                onClick={() => setActiveTab('adjustments')}
              >
                <FaArrowUp className="me-2" />
                Adjustments
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
                  <label className="form-label">Item Name</label>
                  <input type="text" className="form-control" placeholder="Enter item name" />
                </div>
                <div className="mb-3">
                  <label className="form-label">SKU</label>
                  <input type="text" className="form-control" placeholder="Enter SKU" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Quantity</label>
                  <input type="number" className="form-control" placeholder="Enter quantity" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Unit</label>
                  <select className="form-select">
                    <option value="">Select unit</option>
                    <option value="pieces">Pieces</option>
                    <option value="boxes">Boxes</option>
                    <option value="bottles">Bottles</option>
                    <option value="kits">Kits</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Location</label>
                  <input type="text" className="form-control" placeholder="Enter location" />
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
                  <label className="form-label">Item Name</label>
                  <input type="text" className="form-control" defaultValue="Medical Gloves" />
                </div>
                <div className="mb-3">
                  <label className="form-label">SKU</label>
                  <input type="text" className="form-control" defaultValue="MG-001" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Quantity</label>
                  <input type="number" className="form-control" defaultValue="500" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Unit</label>
                  <select className="form-select" defaultValue="boxes">
                    <option value="pieces">Pieces</option>
                    <option value="boxes">Boxes</option>
                    <option value="bottles">Bottles</option>
                    <option value="kits">Kits</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Location</label>
                  <input type="text" className="form-control" defaultValue="A1-B2" />
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
      
      {/* Add Batch Modal */}
      <div className={`modal fade ${showAddBatchModal ? 'show' : ''}`} style={{ display: showAddBatchModal ? 'block' : 'none' }} tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Add New Batch</h5>
              <button type="button" className="btn-close" onClick={() => setShowAddBatchModal(false)}></button>
            </div>
            <div className="modal-body">
              <form>
                <div className="mb-3">
                  <label className="form-label">Item</label>
                  <select className="form-select">
                    <option value="">Select item</option>
                    <option value="1">Medical Gloves</option>
                    <option value="2">Face Masks</option>
                    <option value="3">Sanitizer</option>
                    <option value="4">Syringes</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Batch Number</label>
                  <input type="text" className="form-control" placeholder="Enter batch number" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Quantity</label>
                  <input type="number" className="form-control" placeholder="Enter quantity" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Expiry Date</label>
                  <input type="date" className="form-control" />
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowAddBatchModal(false)}>Cancel</button>
              <button type="button" className="btn btn-primary">Add Batch</button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Update Batch Modal */}
      <div className={`modal fade ${showUpdateBatchModal ? 'show' : ''}`} style={{ display: showUpdateBatchModal ? 'block' : 'none' }} tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Update Batch</h5>
              <button type="button" className="btn-close" onClick={() => setShowUpdateBatchModal(false)}></button>
            </div>
            <div className="modal-body">
              <form>
                <div className="mb-3">
                  <label className="form-label">Item</label>
                  <select className="form-select" defaultValue="1">
                    <option value="1">Medical Gloves</option>
                    <option value="2">Face Masks</option>
                    <option value="3">Sanitizer</option>
                    <option value="4">Syringes</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Batch Number</label>
                  <input type="text" className="form-control" defaultValue="BG-2023-001" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Quantity</label>
                  <input type="number" className="form-control" defaultValue="200" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Expiry Date</label>
                  <input type="date" className="form-control" defaultValue="2025-06-30" />
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowUpdateBatchModal(false)}>Cancel</button>
              <button type="button" className="btn btn-primary">Update Batch</button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Remove Batch Modal */}
      <div className={`modal fade ${showRemoveBatchModal ? 'show' : ''}`} style={{ display: showRemoveBatchModal ? 'block' : 'none' }} tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Remove Batch</h5>
              <button type="button" className="btn-close" onClick={() => setShowRemoveBatchModal(false)}></button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to remove batch <strong>BG-2023-001</strong> for <strong>Medical Gloves</strong>?</p>
              <p className="text-muted">This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowRemoveBatchModal(false)}>Cancel</button>
              <button type="button" className="btn btn-danger">Remove Batch</button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Adjustment Modal */}
      <div className={`modal fade ${showAdjustmentModal ? 'show' : ''}`} style={{ display: showAdjustmentModal ? 'block' : 'none' }} tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Stock Adjustment</h5>
              <button type="button" className="btn-close" onClick={() => setShowAdjustmentModal(false)}></button>
            </div>
            <div className="modal-body">
              <form>
                <div className="mb-3">
                  <label className="form-label">Item</label>
                  <select className="form-select">
                    <option value="">Select item</option>
                    <option value="1">Medical Gloves</option>
                    <option value="2">Face Masks</option>
                    <option value="3">Sanitizer</option>
                    <option value="4">Syringes</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Adjustment Type</label>
                  <select className="form-select">
                    <option value="increase">Increase Stock</option>
                    <option value="decrease">Decrease Stock</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Quantity</label>
                  <input type="number" className="form-control" placeholder="Enter quantity to adjust" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Reason</label>
                  <textarea className="form-control" rows="3" placeholder="Enter reason for adjustment"></textarea>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowAdjustmentModal(false)}>Cancel</button>
              <button type="button" className="btn btn-primary">Adjust Stock</button>
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