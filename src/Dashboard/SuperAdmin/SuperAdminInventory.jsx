import React, { useState, useEffect } from 'react';
import { FaSearch, FaEdit, FaHistory } from 'react-icons/fa';
import axios from 'axios';
import BaseUrl from '../../Api/BaseUrl';
import axiosInstance from '../../Api/axiosInstance';

const SuperAdminInventory = () => {
  // === STATE ===
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const [currentItem, setCurrentItem] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);

  // Base URL for API
  const BASE_URL = '{{base_url}}';

  // === FETCH INVENTORY DATA ===
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`${BaseUrl}/inventory`);
        if (response.data.success) {
          setInventory(response.data.data.items);
        } else {
          setError('Failed to fetch inventory data');
        }
      } catch (err) {
        setError('Error fetching inventory: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  // === FILTER LOGIC ===
  const filteredInventory = inventory.filter(item => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return (
      item.item_code.toLowerCase().includes(q) ||
      item.item_name.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });

  // === MODAL HANDLERS ===
  // View Modal Handler
  const openViewModal = (item) => {
    setViewItem(item);
    setShowViewModal(true);
  };
  
  const openEditModal = (item) => {
    setCurrentItem(item);
    setEditForm({
      item_name: item.item_name,
      category: item.category,
      description: item.description,
      unit: item.unit,
      quantity: item.quantity,
      reorder_level: item.reorder_level
    });
    setShowEditModal(true);
  };

  const openHistoryModal = (item) => {
    setCurrentItem(item);
    setShowHistoryModal(true);
  };

  const closeModalOnBackdrop = (e) => {
    if (e.target === e.currentTarget) {
      setShowViewModal(false);
    }
  };

  // === FORM HANDLER ===
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // === ACTION HANDLERS ===
  const handleSaveEdit = async () => {
    try {
      const response = await axiosInstance.put(`${BaseUrl}/inventory/${currentItem.id}`, editForm);
      if (response.data.success) {
        // Update the local state with the updated item
        setInventory(prevInventory => 
          prevInventory.map(item => 
            item.id === currentItem.id ? response.data.data : item
          )
        );
        alert(`Item ${currentItem.item_code} updated successfully`);
        setShowEditModal(false);
      } else {
        alert('Failed to update item');
      }
    } catch (err) {
      alert('Error updating item: ' + err.message);
    }
  };

  // === HELPER FUNCTIONS ===
  const calculateStatus = (item) => {
    if (item.quantity === 0) return 'out_of_stock';
    if (item.quantity < item.reorder_level) return 'low_stock';
    return 'in_stock';
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'out_of_stock':
        return <span className="badge bg-danger">Out of Stock</span>;
      case 'low_stock':
        return <span className="badge bg-warning text-dark">Low Stock</span>;
      default:
        return <span className="badge bg-success">In Stock</span>;
    }
  };

  return (
    <div className="container-fluid py-3">
      {/* ===== Top Toolbar ===== */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <h2 className="fw-bold mb-0">Inventory (Global View)</h2>
        <div className="ms-auto" style={{ maxWidth: '320px', width: '100%' }}>
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              style={{ height: "40px" }}
              placeholder="Search by Item Code, Name, or Category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="btn btn-outline-secondary" style={{ height: "40px" }} type="button">
              <FaSearch />
            </button>
          </div>
        </div>
      </div>

      {/* ===== LOADING AND ERROR STATES ===== */}
      {loading && (
        <div className="text-center py-4">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}
      
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* ===== TABLE ===== */}
      {!loading && !error && (
        <div className="card border-0 shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover mb-0 align-middle">
              <thead className="bg-light">
                <tr>
                  <th>Item Code</th>
                  <th>Item Name</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Reorder Level</th>
                  <th>Facility</th>
                  <th>Last Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4">No inventory items found.</td>
                  </tr>
                ) : (
                  filteredInventory.map((item, i) => (
                    <tr key={item.id}>
                      <td className="fw-bold">{item.item_code}</td>
                      <td>{item.item_name}</td>
                      <td><span className="badge bg-light text-dark">{item.category}</span></td>
                      <td className={item.quantity < item.reorder_level ? "text-warning fw-medium" : "text-success fw-medium"}>
                        {item.quantity.toLocaleString()}
                      </td>
                      <td>{item.reorder_level.toLocaleString()}</td>
                      <td>{item.facility_name || 'Central Warehouse'}</td>
                      <td>{new Date(item.updated_at).toLocaleDateString()}</td>
                      <td>
                        <div className="btn-group" role="group">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            title="Edit Item"
                            onClick={() => openEditModal(item)}
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="btn btn-sm btn-outline-info"
                            title="View Movement History"
                            onClick={() => openHistoryModal(item)}
                          >
                            <FaHistory />
                          </button>
                          <button
                            className="btn btn-sm btn-outline-success"
                            title="View Details"
                            onClick={() => openViewModal(item)}
                          >
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===== EDIT MODAL ===== */}
      {showEditModal && currentItem && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Inventory Item: {currentItem.item_code}</h5>
                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Item Code</label>
                      <input className="form-control" defaultValue={currentItem.item_code} readOnly />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Category</label>
                      <input 
                        className="form-control" 
                        name="category"
                        value={editForm.category || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-12">
                      <label className="form-label">Item Name</label>
                      <input 
                        className="form-control" 
                        name="item_name"
                        value={editForm.item_name || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-12">
                      <label className="form-label">Description</label>
                      <textarea 
                        className="form-control" 
                        name="description"
                        value={editForm.description || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Unit</label>
                      <input 
                        className="form-control" 
                        name="unit"
                        value={editForm.unit || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Quantity</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        name="quantity"
                        value={editForm.quantity || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Reorder Level</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        name="reorder_level"
                        value={editForm.reorder_level || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSaveEdit}>Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== MOVEMENT HISTORY MODAL ===== */}
      {showHistoryModal && currentItem && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Movement History: {currentItem.item_name}</h5>
                <button type="button" className="btn-close" onClick={() => setShowHistoryModal(false)}></button>
              </div>
              <div className="modal-body">
                <p className="text-muted">Recent stock movements for <strong>{currentItem.item_code}</strong></p>
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Quantity</th>
                        <th>From / To</th>
                        <th>Reference</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>2023-10-24</td>
                        <td><span className="badge bg-success">Stock In</span></td>
                        <td>+200</td>
                        <td>Central Warehouse</td>
                        <td>PO-8891</td>
                      </tr>
                      <tr>
                        <td>2023-10-22</td>
                        <td><span className="badge bg-warning text-dark">Dispatch</span></td>
                        <td>-50</td>
                        <td>Kumasi Hospital</td>
                        <td>DISP-042</td>
                      </tr>
                      <tr>
                        <td>2023-10-20</td>
                        <td><span className="badge bg-danger">Adjustment</span></td>
                        <td>-10</td>
                        <td>Expired Items</td>
                        <td>ADJ-015</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="alert alert-info">
                  This is simulated data. In production, this would come from the stock movement log.
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowHistoryModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Item Modal */}
      {showViewModal && viewItem && (
        <div className="modal fade show d-block" tabIndex="-1" onClick={closeModalOnBackdrop}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header border-bottom-0">
                <h5 className="modal-title">Item Details: {viewItem.item_name}</h5>
                <button type="button" className="btn-close" onClick={() => setShowViewModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-6 fw-bold">Item ID:</div>
                  <div className="col-6">{viewItem.id}</div>
                </div>
                <div className="row mb-3">
                  <div className="col-6 fw-bold">Item Code:</div>
                  <div className="col-6">{viewItem.item_code}</div>
                </div>
                <div className="row mb-3">
                  <div className="col-6 fw-bold">Name:</div>
                  <div className="col-6">{viewItem.item_name}</div>
                </div>
                <div className="row mb-3">
                  <div className="col-6 fw-bold">Category:</div>
                  <div className="col-6">{viewItem.category}</div>
                </div>
                <div className="row mb-3">
                  <div className="col-6 fw-bold">Description:</div>
                  <div className="col-6">{viewItem.description || '—'}</div>
                </div>
                <div className="row mb-3">
                  <div className="col-6 fw-bold">Stock:</div>
                  <div className="col-6">{viewItem.quantity} {viewItem.unit}</div>
                </div>
                <div className="row mb-3">
                  <div className="col-6 fw-bold">Unit:</div>
                  <div className="col-6">{viewItem.unit}</div>
                </div>
                <div className="row mb-3">
                  <div className="col-6 fw-bold">Reorder Level:</div>
                  <div className="col-6">{viewItem.reorder_level}</div>
                </div>
                <div className="row mb-3">
                  <div className="col-6 fw-bold">Facility:</div>
                  <div className="col-6">{viewItem.facility_name || 'Central Warehouse'}</div>
                </div>
                <div className="row mb-3">
                  <div className="col-6 fw-bold">Last Updated:</div>
                  <div className="col-6">{new Date(viewItem.updated_at).toLocaleString()}</div>
                </div>
                <div className="row mb-3">
                  <div className="col-6 fw-bold">Status:</div>
                  <div className="col-6">{getStatusBadge(calculateStatus(viewItem))}</div>
                </div>
              </div>
              <div className="modal-footer border-top-0">
                <button type="button" className="btn btn-secondary" onClick={() => setShowViewModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {(showAddModal || showEditModal || showRestockModal || showBatchModal || showViewModal) && (
        <div className="modal-backdrop fade show"></div>
      )}
    </div>
  );
};

export default SuperAdminInventory;