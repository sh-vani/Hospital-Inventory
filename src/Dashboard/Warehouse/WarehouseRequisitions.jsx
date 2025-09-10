import React, { useState } from 'react';
import { FaPlus, FaSearch, FaEye } from 'react-icons/fa';

const WarehouseRequisitions = () => {
  // State for search
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  
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
  
  // Mock data for requisitions (admin can only create & view)
  const [requisitions, setRequisitions] = useState([
    { 
      id: '#REQ-0042', 
      facility: 'Kumasi Branch Hospital', 
      department: 'Emergency', 
      requestedBy: 'Dr. Amoah', 
      date: '24 Oct 2023', 
      items: '12 items', 
      priority: 'High', 
      status: 'Pending',
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
      status: 'Submitted',
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
      status: 'Pending',
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
      <span className={`badge ${priorityColors[priority] || 'bg-secondary'} text-dark`}>
        {priority}
      </span>
    );
  };
  
  // Status badge component (Simplified for Admin)
  const StatusBadge = ({ status }) => {
    const statusColors = {
      'Pending': 'bg-warning',
      'Submitted': 'bg-info',
      'Processing': 'bg-primary',
      'Fulfilled': 'bg-success'
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
  
  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRequisition({
      ...newRequisition,
      [name]: value
    });
  };
  
  // Action handlers
  const handleCreateRequisition = () => {
    if (!newRequisition.facility || !newRequisition.department || !newRequisition.requestedBy) {
      alert('Please fill Facility, Department, and Requested By fields.');
      return;
    }

    const newItem = {
      id: `#REQ-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      facility: newRequisition.facility,
      department: newRequisition.department,
      requestedBy: newRequisition.requestedBy,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      items: newRequisition.items || 'Not specified',
      priority: newRequisition.priority,
      status: 'Pending', // Admin can only submit, not approve
      details: [] // Empty for now
    };
    
    setRequisitions([newItem, ...requisitions]);
    setShowCreateModal(false);
  };

  // Filter requisitions by search term
  const filteredRequisitions = requisitions.filter(req =>
    req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.facility.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.requestedBy.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-primary">My Requisitions</h2>
        <div className="d-flex align-items-center">
          <div className="input-group me-3" style={{ maxWidth: '300px' }}>
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
      
      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-4 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body bg-primary bg-opacity-10 p-4">
              <div className="d-flex align-items-center">
                <div className="bg-primary bg-opacity-25 rounded-circle p-3 me-3">
                  <FaEye size={24} className="text-primary" />
                </div>
                <div>
                  <h5 className="card-title text-primary fw-bold mb-0">{requisitions.length}</h5>
                  <p className="card-text text-muted">Total Requests</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body bg-warning bg-opacity-10 p-4">
              <div className="d-flex align-items-center">
                <div className="bg-warning bg-opacity-25 rounded-circle p-3 me-3">
                  <FaEye size={24} className="text-warning" />
                </div>
                <div>
                  <h5 className="card-title text-warning fw-bold mb-0">
                    {requisitions.filter(r => r.status === 'Pending').length}
                  </h5>
                  <p className="card-text text-muted">Pending Review</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body bg-success bg-opacity-10 p-4">
              <div className="d-flex align-items-center">
                <div className="bg-success bg-opacity-25 rounded-circle p-3 me-3">
                  <FaEye size={24} className="text-success" />
                </div>
                <div>
                  <h5 className="card-title text-success fw-bold mb-0">
                    {requisitions.filter(r => r.status === 'Fulfilled').length}
                  </h5>
                  <p className="card-text text-muted">Fulfilled</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs (Simplified) */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-white border-0 pt-3">
          <ul className="nav nav-tabs card-header-tabs">
            <li className="nav-item">
              <button className="nav-link active">My Requisitions</button>
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
                {filteredRequisitions.map((req, index) => (
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
                      <button 
                        className="btn btn-sm btn-outline-primary" 
                        onClick={() => openViewModal(req)}
                      >
                        <FaEye />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredRequisitions.length === 0 && (
            <div className="p-4 text-center text-muted">
              No requisitions found matching your search.
            </div>
          )}
        </div>
      </div>

      {/* ========== MODALS ========== */}

      {/* Create Requisition Modal */}
      {showCreateModal && (
        <div className="modal fade show d-block" tabIndex="-1" onClick={(e) => {
          if (e.target.classList.contains('modal')) setShowCreateModal(false);
        }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold">Create New Requisition</h5>
                <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)}></button>
              </div>
              <div className="modal-body py-4">
                <form>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-medium">Facility <span className="text-danger">*</span></label>
                      <input 
                        type="text" 
                        className="form-control form-control-lg"
                        name="facility"
                        value={newRequisition.facility}
                        onChange={handleInputChange}
                        placeholder="e.g. Kumasi Branch Hospital"
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-medium">Department <span className="text-danger">*</span></label>
                      <input 
                        type="text" 
                        className="form-control form-control-lg"
                        name="department"
                        value={newRequisition.department}
                        onChange={handleInputChange}
                        placeholder="e.g. Emergency, Pharmacy"
                        required
                      />
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-medium">Requested By <span className="text-danger">*</span></label>
                      <input 
                        type="text" 
                        className="form-control form-control-lg"
                        name="requestedBy"
                        value={newRequisition.requestedBy}
                        onChange={handleInputChange}
                        placeholder="Your Name / Role"
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-medium">Priority</label>
                      <select 
                        className="form-select form-select-lg"
                        name="priority"
                        value={newRequisition.priority}
                        onChange={handleInputChange}
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-medium">Items Required</label>
                    <textarea 
                      className="form-control form-control-lg"
                      name="items"
                      value={newRequisition.items}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="List items and quantities (e.g. Paracetamol 500mg - 100 tablets)"
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-medium">Reason for Requisition</label>
                    <textarea 
                      className="form-control form-control-lg"
                      name="reason"
                      value={newRequisition.reason}
                      onChange={handleInputChange}
                      rows="2"
                      placeholder="Why are these items needed?"
                    ></textarea>
                  </div>
                </form>
              </div>
              <div className="modal-footer border-top-0 pt-0">
                <button type="button" className="btn btn-secondary px-4" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-primary px-4" onClick={handleCreateRequisition}>
                  Submit Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Requisition Modal */}
      {showViewModal && currentRequisition && (
        <div className="modal fade show d-block" tabIndex="-1" onClick={(e) => {
          if (e.target.classList.contains('modal')) setShowViewModal(false);
        }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold">Requisition Details: {currentRequisition.id}</h5>
                <button type="button" className="btn-close" onClick={() => setShowViewModal(false)}></button>
              </div>
              <div className="modal-body py-4">
                <div className="row mb-4">
                  <div className="col-md-6">
                    <p><strong>Facility:</strong> {currentRequisition.facility}</p>
                    <p><strong>Department:</strong> {currentRequisition.department}</p>
                    <p><strong>Requested By:</strong> {currentRequisition.requestedBy}</p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>Date Submitted:</strong> {currentRequisition.date}</p>
                    <p><strong>Priority:</strong> <PriorityBadge priority={currentRequisition.priority} /></p>
                    <p><strong>Status:</strong> <StatusBadge status={currentRequisition.status} /></p>
                  </div>
                </div>
                
                <h6 className="border-bottom pb-2 mb-3">Items Requested:</h6>
                {currentRequisition.details.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-sm table-bordered">
                      <thead className="table-light">
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
                ) : (
                  <p className="text-muted fst-italic">No detailed items listed.</p>
                )}
                
                <div className="alert alert-info mt-4">
                  <strong>Note:</strong> This requisition is under review. You will be notified once it’s processed.
                </div>
              </div>
              <div className="modal-footer border-top-0 pt-0">
                <button type="button" className="btn btn-secondary px-4" onClick={() => setShowViewModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Backdrop */}
      {(showCreateModal || showViewModal) && (
        <div className="modal-backdrop fade show"></div>
      )}
    </div>
  );
};

export default WarehouseRequisitions;