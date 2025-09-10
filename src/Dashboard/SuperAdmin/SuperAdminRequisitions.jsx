import React, { useState } from 'react';
import { 
  FaPlus, FaSearch, FaCheck, FaTimes, FaEye, 
  FaExclamationTriangle, FaExclamationCircle
} from 'react-icons/fa';

const SuperAdminRequisitions = () => {
  // State for search
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  
  // State for current requisition
  const [currentRequisition, setCurrentRequisition] = useState(null);
  
  // State for new requisition form
  const [newRequisition, setNewRequisition] = useState({
    facility: '',
    department: '',
    requestedBy: '',
    items: '',
    priority: 'Medium',
    reason: ''
  });
  
  // State for rejection reason
  const [rejectionReason, setRejectionReason] = useState('');
  
  // Mock data for requisitions
  const [requisitions, setRequisitions] = useState([
    { 
      id: '#REQ-0042', 
      facility: 'Kumasi Branch Hospital', 
      department: 'Emergency', 
      requestedBy: 'Dr. Amoah', 
      date: '24 Oct 2023', 
      items: '12 items', 
      priority: 'High', 
      status: 'Pending Review',
      details: [
        { name: 'Paracetamol 500mg', quantity: 100, unit: 'Tablets' },
        { name: 'Surgical Gloves', quantity: 50, unit: 'Pairs' },
        { name: 'Syringe 5ml', quantity: 200, unit: 'Pieces' }
      ]
    },
    { 
      id: '#REQ-0040', 
      facility: 'Takoradi Clinic', 
      department: 'Pharmacy', 
      requestedBy: 'Dr. Mensah', 
      date: '22 Oct 2023', 
      items: '5 items', 
      priority: 'Medium', 
      status: 'Partially Approved',
      details: [
        { name: 'Amoxicillin 250mg', quantity: 50, unit: 'Capsules' },
        { name: 'Bandages', quantity: 30, unit: 'Pieces' }
      ]
    },
    { 
      id: '#REQ-0038', 
      facility: 'Accra Central Hospital', 
      department: 'Laboratory', 
      requestedBy: 'Lab Tech. Ama', 
      date: '20 Oct 2023', 
      items: '7 items', 
      priority: 'Low', 
      status: 'Pending Review',
      details: [
        { name: 'Test Tubes', quantity: 100, unit: 'Pieces' },
        { name: 'Gloves', quantity: 20, unit: 'Pairs' }
      ]
    }
  ]);
  
  // Priority badge component
  const PriorityBadge = ({ priority }) => {
    const priorityColors = {
      'High': 'bg-danger',
      'Medium': 'bg-warning',
      'Low': 'bg-success'
    };
    
    return (
      <span className={`badge ${priorityColors[priority] || 'bg-secondary'}`}>
        {priority}
      </span>
    );
  };
  
  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusColors = {
      'Pending Review': 'bg-warning',
      'Partially Approved': 'bg-info',
      'Approved': 'bg-success',
      'Rejected': 'bg-danger'
    };
    
    return (
      <span className={`badge ${statusColors[status] || 'bg-secondary'}`}>
        {status}
      </span>
    );
  };
  
  // Modal handlers
  const openCreateModal = () => {
    setNewRequisition({
      facility: '',
      department: '',
      requestedBy: '',
      items: '',
      priority: 'Medium',
      reason: ''
    });
    setShowCreateModal(true);
  };
  
  const openViewModal = (requisition) => {
    setCurrentRequisition(requisition);
    setShowViewModal(true);
  };
  
  const openApproveModal = (requisition) => {
    setCurrentRequisition(requisition);
    setShowApproveModal(true);
  };
  
  const openRejectModal = (requisition) => {
    setCurrentRequisition(requisition);
    setRejectionReason('');
    setShowRejectModal(true);
  };
  
  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRequisition({
      ...newRequisition,
      [name]: value
    });
  };
  
  const handleRejectionReasonChange = (e) => {
    setRejectionReason(e.target.value);
  };
  
  // Action handlers
  const handleCreateRequisition = () => {
    const newItem = {
      id: `#REQ-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      facility: newRequisition.facility,
      department: newRequisition.department,
      requestedBy: newRequisition.requestedBy,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      items: newRequisition.items,
      priority: newRequisition.priority,
      status: 'Pending Review',
      details: [] // Empty details for new requisition
    };
    
    setRequisitions([newItem, ...requisitions]);
    setShowCreateModal(false);
  };
  
  const handleApproveRequisition = () => {
    const updatedRequisitions = requisitions.map(req => 
      req.id === currentRequisition.id 
        ? { ...req, status: 'Approved' } 
        : req
    );
    
    setRequisitions(updatedRequisitions);
    setShowApproveModal(false);
  };
  
  const handleRejectRequisition = () => {
    const updatedRequisitions = requisitions.map(req => 
      req.id === currentRequisition.id 
        ? { ...req, status: 'Rejected', rejectionReason } 
        : req
    );
    
    setRequisitions(updatedRequisitions);
    setShowRejectModal(false);
  };
  
  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Requisitions Management</h2>
        <div className="d-flex align-items-center">
          <div className="input-group me-2">
            <input 
              type="text" 
              className="form-control" 
              placeholder="Search requisitions..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="btn btn-outline-secondary" type="button">
              <FaSearch />
            </button>
          </div>
          <button className="btn btn-primary d-flex align-items-center" onClick={openCreateModal}>
            <FaPlus className="me-2" /> Create New
          </button>
        </div>
      </div>
      
      {/* Alert Summary */}
      <div className="row mb-4">
        <div className="col-md-4 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body bg-danger bg-opacity-10 p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="d-flex align-items-center mb-2">
                    <FaExclamationCircle className="text-danger me-2" size={24} />
                    <h5 className="card-title text-danger fw-bold mb-0">Urgent</h5>
                  </div>
                  <p className="card-text text-muted ms-4">3 requisitions need immediate attention</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body bg-warning bg-opacity-10 p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="d-flex align-items-center mb-2">
                    <FaExclamationTriangle className="text-warning me-2" size={24} />
                    <h5 className="card-title text-warning fw-bold mb-0">Pending</h5>
                  </div>
                  <p className="card-text text-muted ms-4">5 requisitions awaiting approval</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body bg-info bg-opacity-10 p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="d-flex align-items-center mb-2">
                    <FaCheck className="text-info me-2" size={24} />
                    <h5 className="card-title text-info fw-bold mb-0">Approved</h5>
                  </div>
                  <p className="card-text text-muted ms-4">12 requisitions approved this week</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-white border-0 pt-3">
          <ul className="nav nav-tabs card-header-tabs">
            <li className="nav-item">
              <button className="nav-link active">Pending</button>
            </li>
            <li className="nav-item">
              <button className="nav-link">Approved</button>
            </li>
            <li className="nav-item">
              <button className="nav-link">Rejected</button>
            </li>
            <li className="nav-item">
              <button className="nav-link">All Requisitions</button>
            </li>
          </ul>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="bg-light">
                <tr>
                  <th>Requisition ID</th>
                  <th>Facility</th>
                  <th>Department</th>
                  <th>Requested By</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requisitions.map((req, index) => (
                  <tr key={index}>
                    <td><span className="fw-bold">{req.id}</span></td>
                    <td>{req.facility}</td>
                    <td>{req.department}</td>
                    <td>{req.requestedBy}</td>
                    <td>{req.date}</td>
                    <td>{req.items}</td>
                    <td><PriorityBadge priority={req.priority} /></td>
                    <td><StatusBadge status={req.status} /></td>
                    <td>
                      <div className="btn-group" role="group">
                        <button 
                          className="btn btn-sm btn-outline-success" 
                          onClick={() => openApproveModal(req)}
                          disabled={req.status === 'Approved' || req.status === 'Rejected'}
                        >
                          <FaCheck />
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-danger" 
                          onClick={() => openRejectModal(req)}
                          disabled={req.status === 'Approved' || req.status === 'Rejected'}
                        >
                          <FaTimes />
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-primary" 
                          onClick={() => openViewModal(req)}
                        >
                          <FaEye />
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

      {/* Create Requisition Modal */}
      {showCreateModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create New Requisition</h5>
                <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)}></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Facility</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        name="facility"
                        value={newRequisition.facility}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Department</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        name="department"
                        value={newRequisition.department}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Requested By</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        name="requestedBy"
                        value={newRequisition.requestedBy}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Priority</label>
                      <select 
                        className="form-select" 
                        name="priority"
                        value={newRequisition.priority}
                        onChange={handleInputChange}
                      >
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Items Required</label>
                    <textarea 
                      className="form-control" 
                      name="items"
                      value={newRequisition.items}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="List items and quantities required"
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Reason for Requisition</label>
                    <textarea 
                      className="form-control" 
                      name="reason"
                      value={newRequisition.reason}
                      onChange={handleInputChange}
                      rows="2"
                      placeholder="Explain why these items are needed"
                    ></textarea>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-primary" onClick={handleCreateRequisition}>
                  Submit Requisition
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Requisition Modal */}
      {showViewModal && currentRequisition && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Requisition Details: {currentRequisition.id}</h5>
                <button type="button" className="btn-close" onClick={() => setShowViewModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <p><strong>Facility:</strong> {currentRequisition.facility}</p>
                    <p><strong>Department:</strong> {currentRequisition.department}</p>
                    <p><strong>Requested By:</strong> {currentRequisition.requestedBy}</p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>Date:</strong> {currentRequisition.date}</p>
                    <p><strong>Priority:</strong> <PriorityBadge priority={currentRequisition.priority} /></p>
                    <p><strong>Status:</strong> <StatusBadge status={currentRequisition.status} /></p>
                  </div>
                </div>
                
                <h6 className="mt-4 mb-3">Items Requested:</h6>
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Item Name</th>
                        <th>Quantity</th>
                        <th>Unit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentRequisition.details.map((item, index) => (
                        <tr key={index}>
                          <td>{item.name}</td>
                          <td>{item.quantity}</td>
                          <td>{item.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {currentRequisition.rejectionReason && (
                  <div className="alert alert-danger mt-3">
                    <strong>Rejection Reason:</strong> {currentRequisition.rejectionReason}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowViewModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approve Requisition Modal */}
      {showApproveModal && currentRequisition && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Approve Requisition</h5>
                <button type="button" className="btn-close" onClick={() => setShowApproveModal(false)}></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to approve this requisition?</p>
                <div className="card bg-light">
                  <div className="card-body">
                    <p className="mb-1"><strong>ID:</strong> {currentRequisition.id}</p>
                    <p className="mb-1"><strong>Facility:</strong> {currentRequisition.facility}</p>
                    <p className="mb-1"><strong>Department:</strong> {currentRequisition.department}</p>
                    <p className="mb-0"><strong>Items:</strong> {currentRequisition.items}</p>
                  </div>
                </div>
                <div className="alert alert-success mt-3">
                  Approving this requisition will initiate the procurement process for the requested items.
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowApproveModal(false)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-success" onClick={handleApproveRequisition}>
                  Approve Requisition
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Requisition Modal */}
      {showRejectModal && currentRequisition && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Reject Requisition</h5>
                <button type="button" className="btn-close" onClick={() => setShowRejectModal(false)}></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to reject this requisition?</p>
                <div className="card bg-light">
                  <div className="card-body">
                    <p className="mb-1"><strong>ID:</strong> {currentRequisition.id}</p>
                    <p className="mb-1"><strong>Facility:</strong> {currentRequisition.facility}</p>
                    <p className="mb-1"><strong>Department:</strong> {currentRequisition.department}</p>
                    <p className="mb-0"><strong>Items:</strong> {currentRequisition.items}</p>
                  </div>
                </div>
                <div className="mb-3 mt-3">
                  <label className="form-label">Reason for Rejection</label>
                  <textarea 
                    className="form-control" 
                    rows="3"
                    value={rejectionReason}
                    onChange={handleRejectionReasonChange}
                    placeholder="Please provide a reason for rejecting this requisition"
                  ></textarea>
                </div>
                <div className="alert alert-danger">
                  Rejecting this requisition will cancel the request. The requester will be notified of the rejection.
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowRejectModal(false)}>
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger" 
                  onClick={handleRejectRequisition}
                  disabled={!rejectionReason.trim()}
                >
                  Reject Requisition
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Backdrop */}
      {(showCreateModal || showViewModal || showApproveModal || showRejectModal) && (
        <div className="modal-backdrop show"></div>
      )}
    </div>
  );
};

export default SuperAdminRequisitions;