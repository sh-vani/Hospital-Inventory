import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaExclamationTriangle, FaBoxOpen, FaClock, FaEdit, FaEye, FaTimes } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';

const FacilityUserRequisition = () => {
  // State for form data
  const [department, setDepartment] = useState('');
  const [username, setUsername] = useState('');
  const [showRequisitionModal, setShowRequisitionModal] = useState(false);
  const [requisitionHistory, setRequisitionHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // View detail modal state
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRequisition, setSelectedRequisition] = useState(null);

  // Form fields for modal
  const [selectedItem, setSelectedItem] = useState('');
  const [quantity, setQuantity] = useState('');
  const [priority, setPriority] = useState('Normal');
  const [remarks, setRemarks] = useState('');

  // Mock item list for dropdown
  const availableItems = [
    { id: 1, name: 'Paracetamol 500mg' },
    { id: 2, name: 'Amoxicillin 500mg' },
    { id: 3, name: 'Surgical Gloves' },
    { id: 4, name: 'Insulin Pens' },
    { id: 5, name: 'Antiseptic Solution' },
    { id: 6, name: 'Vitamin C Tablets' },
    { id: 7, name: 'Blood Pressure Cuffs' },
    { id: 8, name: 'Alcohol Swabs' }
  ];

  // Simulate fetching user session data
  useEffect(() => {
    setDepartment('Pharmacy');
    setUsername('Dr. Sharma');

    // Mock requisition history
    const mockHistory = [
      { id: 'REQ-001', item: 'Paracetamol 500mg', qty: 50, status: 'Pending', priority: 'Normal', remarks: 'For OPD use' },
      { id: 'REQ-002', item: 'Surgical Gloves', qty: 100, status: 'Processing', priority: 'High', remarks: 'Urgent surgery needs' },
      { id: 'REQ-003', item: 'Insulin Pens', qty: 20, status: 'Completed', priority: 'Urgent', remarks: 'Diabetes clinic' },
      { id: 'REQ-004', item: 'Antiseptic Solution', qty: 30, status: 'Pending', priority: 'Normal', remarks: 'Ward cleaning' }
    ];
    setRequisitionHistory(mockHistory);
  }, []);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedItem || !quantity || quantity <= 0) {
      alert('Please select an item and enter a valid quantity.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      
      // Add new requisition to history
      const newReq = {
        id: `REQ-${String(requisitionHistory.length + 1).padStart(3, '0')}`,
        item: availableItems.find(i => i.id === parseInt(selectedItem))?.name || selectedItem,
        qty: parseInt(quantity),
        status: 'Pending',
        priority,
        remarks
      };
      
      setRequisitionHistory([newReq, ...requisitionHistory]);
      
      // Reset form
      setSelectedItem('');
      setQuantity('');
      setPriority('Normal');
      setRemarks('');
      setShowRequisitionModal(false);
      
      setTimeout(() => setSuccess(false), 3000);
    }, 1500);
  };

  // Handle cancel requisition
  const handleCancelRequisition = (id) => {
    if (window.confirm('Are you sure you want to cancel this requisition?')) {
      setRequisitionHistory(requisitionHistory.map(req => 
        req.id === id && req.status === 'Pending' ? {...req, status: 'Cancelled'} : req
      ));
    }
  };

  // Handle view detail
  const handleViewDetail = (req) => {
    setSelectedRequisition(req);
    setShowDetailModal(true);
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'Pending': return 'bg-warning text-dark';
      case 'Processing': return 'bg-info';
      case 'Completed': return 'bg-success';
      case 'Cancelled': return 'bg-secondary';
      default: return 'bg-secondary';
    }
  };

  // Get priority badge class
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
            <button 
              className="btn btn-primary" 
              onClick={() => setShowRequisitionModal(true)}
            >
              <FaPlus className="me-1" /> Create Requisition
            </button>
          </div>

          {/* Requisition History Table */}
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-light">
                <tr>
                  <th>Req ID</th>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requisitionHistory.length > 0 ? (
                  requisitionHistory.map((req) => (
                    <tr key={req.id}>
                      <td>
                        <div className="fw-bold">{req.id}</div>
                        <div className="small text-muted">
                          <span className={`badge ${getPriorityBadgeClass(req.priority)}`}>{req.priority}</span>
                        </div>
                      </td>
                      <td>{req.item}</td>
                      <td>{req.qty}</td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(req.status)}`}>
                          {req.status}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <button 
                            className="btn btn-sm btn-outline-primary"
                            title="View Detail"
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
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-4">
                      <div className="text-muted">
                        <FaEdit size={24} className="mb-2" />
                        <p>No requisitions found. Create your first requisition.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Requisition Modal */}
      <div className={`modal fade ${showRequisitionModal ? 'show' : ''}`} 
           id="createRequisitionModal" 
           tabIndex="-1" 
           aria-labelledby="createRequisitionModalLabel" 
           aria-hidden={!showRequisitionModal} 
           style={{ display: showRequisitionModal ? 'block' : 'none' }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header text-black">
              <h5 className="modal-title" id="createRequisitionModalLabel">Create Requisition</h5>
              <button 
                type="button" 
                className="btn-close" 
                aria-label="Close" 
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
                    {availableItems.map(item => (
                      <option key={item.id} value={item.id}>{item.name}</option>
                    ))}
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
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
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
           id="requisitionDetailModal" 
           tabIndex="-1" 
           aria-labelledby="requisitionDetailModalLabel" 
           aria-hidden={!showDetailModal} 
           style={{ display: showDetailModal ? 'block' : 'none' }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header text-black">
              <h5 className="modal-title" id="requisitionDetailModalLabel">Requisition Details</h5>
              <button 
                type="button" 
                className="btn-close" 
                aria-label="Close" 
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

      {/* Info section */}
      <div className="card mt-4">
        <div className="card-header bg-light">
          <h5 className="mb-0">Requisition Information</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <h6><FaEye className="text-primary me-2" />View Detail</h6>
              <p>View detailed information about your requisition including status updates.</p>
            </div>
            <div className="col-md-6">
              <h6><FaTimes className="text-danger me-2" />Cancel</h6>
              <p>Cancel your requisition if it hasn't been processed yet.</p>
            </div>
            <div className="col-md-6">
              <h6><span className="badge bg-success me-2">Normal</span> Priority</h6>
              <p>Standard processing time for non-urgent items.</p>
            </div>
            <div className="col-md-6">
              <h6><span className="badge bg-warning text-dark me-2">High</span> Priority</h6>
              <p>Expedited processing for important items.</p>
            </div>
            <div className="col-md-6">
              <h6><span className="badge bg-danger me-2">Urgent</span> Priority</h6>
              <p>Immediate processing for critical items.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacilityUserRequisition;