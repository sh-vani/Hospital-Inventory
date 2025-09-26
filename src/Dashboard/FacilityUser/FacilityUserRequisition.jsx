import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaExclamationTriangle, FaBoxOpen, FaClock, FaEdit, FaEye, FaTimes } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import BaseUrl from '../../Api/BaseUrl';
import axiosInstance from '../../Api/axiosInstance';

const FacilityUserRequisition = () => {
  // Form states
  const [department, setDepartment] = useState('');
  const [username, setUsername] = useState('');
  const [requisitionType, setRequisitionType] = useState('individual');
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showRequisitionModal, setShowRequisitionModal] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Modal states
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRequisition, setSelectedRequisition] = useState(null);
  const [requisitionHistory, setRequisitionHistory] = useState([]);

  // Requisition form fields
  const [selectedItem, setSelectedItem] = useState('');
  const [quantity, setQuantity] = useState('');
  const [priority, setPriority] = useState('Normal');
  const [remarks, setRemarks] = useState('');

  // ✅ Real facility items from API
  const [facilityItems, setFacilityItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);

  // Get user from localStorage
  const getUserFromStorage = () => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      console.error('Failed to parse user from localStorage');
      return null;
    }
  };

  // Fetch facility items
  const fetchFacilityItems = async (facilityId) => {
    try {
      setLoadingItems(true);
      const response = await axiosInstance.get(`${BaseUrl}/inventory`, {
        params: { facilityId }
      });

      if (response.data.success && Array.isArray(response.data.data.items)) {
        setFacilityItems(response.data.data.items);
      } else {
        setFacilityItems([]);
      }
    } catch (error) {
      console.error('Failed to fetch facility items:', error);
      setFacilityItems([]);
    } finally {
      setLoadingItems(false);
    }
  };

  // Initialize user session & fetch data
  useEffect(() => {
    const user = getUserFromStorage();

    if (user) {
      setDepartment(user.department || 'N/A');
      setUsername(user.name || 'User');
      
      // ✅ Use real facility_id from user
      const facilityId = user.facility_id;
      if (facilityId) {
        fetchFacilityItems(facilityId);
      } else {
        console.error('Facility ID not found in user data');
        setLoadingItems(false);
      }
    } else {
      console.error('User not found in localStorage');
      setLoadingItems(false);
    }

    // Mock requisition history (keep for demo)
    const mockHistory = [
      { id: 'REQ-001', item: 'Paracetamol 500mg', qty: 50, status: 'Pending', priority: 'Normal', remarks: 'For OPD use' },
      { id: 'REQ-002', item: 'Surgical Gloves', qty: 100, status: 'Processing', priority: 'High', remarks: 'Urgent surgery needs' },
      { id: 'REQ-003', item: 'Insulin Pens', qty: 20, status: 'Completed', priority: 'Urgent', remarks: 'Diabetes clinic' },
      { id: 'REQ-004', item: 'Antiseptic Solution', qty: 30, status: 'Pending', priority: 'Normal', remarks: 'Ward cleaning' }
    ];
    setRequisitionHistory(mockHistory);
  }, []);

// ✅ UPDATED: Handle form submission with REAL POST API + user_id
const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!selectedItem || !quantity || quantity <= 0) {
    alert('Please select an item and enter a valid quantity.');
    return;
  }

  const user = getUserFromStorage();
  if (!user || !user.facility_id || !user.id) {
    alert('User data incomplete. Please log in again.');
    return;
  }

  setLoading(true);
  try {
    // ✅ Prepare payload as per your API spec — NOW WITH user_id
    const payload = {
      user_id: user.id, // ✅ ADDED THIS LINE
      facility_id: user.facility_id,
      remarks: remarks.trim() || '',
      items: [
        {
          item_id: parseInt(selectedItem),
          quantity: parseInt(quantity),
          priority: priority.toLowerCase() // "Normal" → "normal"
        }
      ]
    };

    // Call real API
    const response = await axiosInstance.post(`${BaseUrl}/requisitions`, payload);

    if (response.data.success) {
      setSuccess(true);
      
      // Get item name for UI
      const selectedItemObj = facilityItems.find(i => i.id == selectedItem);
      const itemName = selectedItemObj ? selectedItemObj.item_name : 'Unknown Item';
      
      // Add to local history (UI only)
      const newReq = {
        id: response.data.data?.reqId || `REQ-${Date.now()}`,
        item: itemName,
        qty: parseInt(quantity),
        status: 'Pending',
        priority: priority,
        remarks: remarks
      };
      
      setRequisitionHistory([newReq, ...requisitionHistory]);
      
      // Reset form
      setSelectedItem('');
      setQuantity('');
      setPriority('Normal');
      setRemarks('');
      setShowRequisitionModal(false);
    } else {
      alert('Failed to submit requisition: ' + (response.data.message || 'Unknown error'));
    }
  } catch (error) {
    console.error('Submission error:', error);
    const msg = error.response?.data?.message || 'Network error. Please try again.';
    alert('Error: ' + msg);
  } finally {
    setLoading(false);
    setTimeout(() => setSuccess(false), 3000);
  }
};
  // Cancel requisition
  const handleCancelRequisition = (id) => {
    if (window.confirm('Are you sure you want to cancel this requisition?')) {
      setRequisitionHistory(requisitionHistory.map(req => 
        req.id === id && req.status === 'Pending' ? {...req, status: 'Cancelled'} : req
      ));
    }
  };

  // View detail
  const handleViewDetail = (req) => {
    setSelectedRequisition(req);
    setShowDetailModal(true);
  };

  // Add item button
  const handleAddItem = () => {
    setShowRequisitionModal(true);
  };

  // Status badge
  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'Pending': return 'bg-warning text-dark';
      case 'Processing': return 'bg-info';
      case 'Completed': return 'bg-success';
      case 'Cancelled': return 'bg-secondary';
      default: return 'bg-secondary';
    }
  };

  // Priority badge
  const getPriorityBadgeClass = (priority) => {
    switch(priority) {
      case 'Normal': return 'bg-success';
      case 'High': return 'bg-warning text-dark';
      case 'Urgent': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  return (
    <div className="container py-4">
      <div className="card shadow">
        <div className="card-header text-black">
          <h4 className="mb-0">Create Requisition</h4>
          <p className="mb-0">Submit requisition to Facility Admin</p>
        </div>

        <div className="card-body">
          {success && (
            <div className="alert alert-success alert-dismissible fade show" role="alert">
              <strong>Success!</strong> Your requisition has been submitted to Facility Admin.
              <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
          )}

          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <div className="text-muted small">Department: {department}</div>
              <div>User: {username}</div>
            </div>
            
            {/* Priority */}
            <div className="mb-3">
              <label className="form-label">Priority</label>
              <select 
                className="form-select" 
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            {/* Requisition Type */}
            <div className="mb-3">
              <label className="form-label">Requisition Type</label>
              <div>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="requisitionType"
                    id="individual"
                    value="individual"
                    checked={requisitionType === 'individual'}
                    onChange={() => setRequisitionType('individual')}
                  />
                  <label className="form-check-label" htmlFor="individual">Individual (Based on Facility Stock)</label>
                </div>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="requisitionType"
                    id="bulk"
                    value="bulk"
                    checked={requisitionType === 'bulk'}
                    onChange={() => setRequisitionType('bulk')}
                  />
                  <label className="form-check-label" htmlFor="bulk">Bulk (Based on Department Stock)</label>
                </div>
              </div>
            </div>
          </div>

          {/* Items Table (for multi-item) - currently unused in modal flow */}
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5>Items</h5>
              <button type="button" className="btn btn-outline-primary btn-sm" onClick={handleAddItem}>
                <FaPlus className="me-1" /> Add Item
              </button>
            </div>

            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Item Code</th>
                    <th>Item Name</th>
                    <th>Quantity</th>
                    <th>Remarks (Optional)</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan="5" className="text-center py-4">
                      <div className="text-muted">
                        <FaEdit size={24} className="mb-2" />
                        <p>No items added. Use "Add Item" to create a requisition.</p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Requisition History */}
          <div className="mt-5">
            <h5 className="mb-3">Requisition History</h5>
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Req ID</th>
                    <th>Item</th>
                    <th>Quantity</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requisitionHistory.length > 0 ? (
                    requisitionHistory.map((req) => (
                      <tr key={req.id}>
                        <td>{req?.id}</td>
                        <td>{req?.item}</td>
                        <td>{req?.qty}</td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(req.status)}`}>
                            {req?.status}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${getPriorityBadgeClass(req.priority)}`}>
                            {req?.priority}
                          </span>
                        </td>
                        <td>
                          <button 
                            className="btn btn-sm btn-outline-primary me-2"
                            title="View Details"
                            onClick={() => handleViewDetail(req)}
                          >
                            <FaEye />
                          </button>
                          {req.status === 'Pending' && (
                            <button 
                              className="btn btn-sm btn-outline-danger"
                              title="Cancel"
                              onClick={() => handleCancelRequisition(req.id)}
                            >
                              <FaTimes />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-4">
                        <div className="text-muted">
                          <FaEdit size={24} className="mb-2" />
                          <p>No requisitions found.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Create Requisition Modal */}
      <div className={`modal fade ${showRequisitionModal ? 'show' : ''}`} 
           style={{ display: showRequisitionModal ? 'block' : 'none' }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header text-black">
              <h5 className="modal-title">Create Requisition</h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setShowRequisitionModal(false)}
              ></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Item <span className="text-danger">*</span></label>
                  <select
                    className="form-select"
                    value={selectedItem}
                    onChange={(e) => setSelectedItem(e.target.value)}
                    required
                  >
                    <option value="">Select an item</option>
                    {loadingItems ? (
                      <option>Loading items...</option>
                    ) : facilityItems.length > 0 ? (
                      facilityItems.map(item => (
                        <option key={item.id} value={item.id}>
                          {item.item_name} ({item.quantity} {item.unit || 'units'})
                        </option>
                      ))
                    ) : (
                      <option>No items available in facility</option>
                    )}
                  </select>
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Qty <span className="text-danger">*</span></label>
                  <input
                    type="number"
                    className="form-control"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Priority</label>
                  <select
                    className="form-select"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="rgent">Urgent</option>
                  </select>
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Remarks</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Enter any additional notes..."
                  ></textarea>
                </div>
                
                <div className="d-flex justify-content-end gap-2">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowRequisitionModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Submitting...
                      </>
                    ) : 'Submit Requisition'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Requisition Detail Modal */}
      <div className={`modal fade ${showDetailModal ? 'show' : ''}`} 
           style={{ display: showDetailModal ? 'block' : 'none' }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header text-black">
              <h5 className="modal-title">Requisition Details</h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setShowDetailModal(false)}
              ></button>
            </div>
            <div className="modal-body">
              {selectedRequisition && (
                <div className="row">
                  <div className="col-12 mb-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <h5 className="mb-0">{selectedRequisition.item}</h5>
                      <span className={`badge ${getPriorityBadgeClass(selectedRequisition.priority)}`}>
                        {selectedRequisition.priority}
                      </span>
                    </div>
                  </div>
                  
                  <div className="col-6 mb-3">
                    <strong>Req ID:</strong>
                    <div>{selectedRequisition.id}</div>
                  </div>
                  <div className="col-6 mb-3">
                    <strong>Quantity:</strong>
                    <div>{selectedRequisition.qty}</div>
                  </div>
                  <div className="col-6 mb-3">
                    <strong>Status:</strong>
                    <div>
                      <span className={`badge ${getStatusBadgeClass(selectedRequisition.status)}`}>
                        {selectedRequisition.status}
                      </span>
                    </div>
                  </div>
                  <div className="col-6 mb-3">
                    <strong>Department:</strong>
                    <div>{department}</div>
                  </div>
                  <div className="col-12 mb-3">
                    <strong>Remarks:</strong>
                    <div>{selectedRequisition.remarks || '-'}</div>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setShowDetailModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Backdrops */}
      {showRequisitionModal && <div className="modal-backdrop fade show"></div>}
      {showDetailModal && <div className="modal-backdrop fade show"></div>}
    </div>
  );
};

export default FacilityUserRequisition;