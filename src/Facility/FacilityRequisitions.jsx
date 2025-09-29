// src/App.jsx
import { useState } from 'react';

function FacilityRequisitions() {
  // Admin's facility (hardcoded for this example)
  const adminFacility = 'Kumasi Branch Hospital';
  
  // Updated initial requisitions data with flat structure
  const initialRequisitions = [
    {
      id: 'REQ-2025-101',
      facility: 'Kumasi Branch Hospital',
      user: 'Dr. Amoah',
      department: 'OPD',
      item: 'Paracetamol 500mg',
      qty: 10,
      facilityStock: 15,
      priority: 'Normal',
      status: 'Pending',
      raisedOn: '27-Sep-2025',
      statusTimeline: [
        { status: 'Raised by User', timestamp: '27-Sep-2025 10:00' },
        { status: 'Seen by Facility Admin', timestamp: '27-Sep-2025 10:30' }
      ],
      remarksLog: []
    },
    {
      id: 'REQ-2025-102',
      facility: 'Kumasi Branch Hospital',
      user: 'Nurse Akua',
      department: 'Emergency',
      item: 'Surgical Gloves (L)',
      qty: 20,
      facilityStock: 15,
      priority: 'High',
      status: 'Pending',
      raisedOn: '26-Sep-2025',
      statusTimeline: [
        { status: 'Raised by User', timestamp: '26-Sep-2025 09:15' },
        { status: 'Seen by Facility Admin', timestamp: '26-Sep-2025 09:45' }
      ],
      remarksLog: []
    },
    {
      id: 'REQ-2025-103',
      facility: 'Kumasi Branch Hospital',
      user: 'Dr. Boateng',
      department: 'Pediatrics',
      item: 'Children\'s Paracetamol',
      qty: 15,
      facilityStock: 0,
      priority: 'Urgent',
      status: 'Processing',
      raisedOn: '25-Sep-2025',
      statusTimeline: [
        { status: 'Raised by User', timestamp: '25-Sep-2025 11:20' },
        { status: 'Seen by Facility Admin', timestamp: '25-Sep-2025 11:50' },
        { status: 'Raised to Warehouse', timestamp: '25-Sep-2025 12:30' }
      ],
      remarksLog: [
        { user: 'Facility Admin', remark: 'Urgent request, no stock available', timestamp: '25-Sep-2025 12:30' }
      ]
    },
    {
      id: 'REQ-2025-104',
      facility: 'Kumasi Branch Hospital',
      user: 'Pharmacist Adwoa',
      department: 'Pharmacy',
      item: 'Cough Syrup',
      qty: 12,
      facilityStock: 8,
      priority: 'Normal',
      status: 'Processing',
      raisedOn: '24-Sep-2025',
      statusTimeline: [
        { status: 'Raised by User', timestamp: '24-Sep-2025 14:10' },
        { status: 'Seen by Facility Admin', timestamp: '24-Sep-2025 14:40' },
        { status: 'Raised to Warehouse', timestamp: '24-Sep-2025 15:20' }
      ],
      remarksLog: [
        { user: 'Facility Admin', remark: 'Insufficient stock', timestamp: '24-Sep-2025 15:20' }
      ]
    },
    {
      id: 'REQ-2025-105',
      facility: 'Kumasi Branch Hospital',
      user: 'Dr. Osei',
      department: 'Surgery',
      item: 'Surgical Masks',
      qty: 50,
      facilityStock: 100,
      priority: 'Normal',
      status: 'Delivered',
      raisedOn: '23-Sep-2025',
      statusTimeline: [
        { status: 'Raised by User', timestamp: '23-Sep-2025 09:30' },
        { status: 'Seen by Facility Admin', timestamp: '23-Sep-2025 10:00' },
        { status: 'Delivered', timestamp: '23-Sep-2025 10:45' }
      ],
      remarksLog: [
        { user: 'Facility Admin', remark: 'Delivered from available stock', timestamp: '23-Sep-2025 10:45' }
      ]
    },
    {
      id: 'REQ-2025-106',
      facility: 'Kumasi Branch Hospital',
      user: 'Lab Tech. Ama',
      department: 'Laboratory',
      item: 'Ibuprofen 400mg',
      qty: 7,
      facilityStock: 50,
      priority: 'Normal',
      status: 'Completed',
      raisedOn: '22-Sep-2025',
      statusTimeline: [
        { status: 'Raised by User', timestamp: '22-Sep-2025 13:15' },
        { status: 'Seen by Facility Admin', timestamp: '22-Sep-2025 13:45' },
        { status: 'Delivered', timestamp: '22-Sep-2025 14:30' },
        { status: 'Completed', timestamp: '22-Sep-2025 15:20' }
      ],
      remarksLog: [
        { user: 'Facility Admin', remark: 'Delivered from available stock', timestamp: '22-Sep-2025 14:30' }
      ]
    },
    {
      id: 'REQ-2025-107',
      facility: 'Kumasi Branch Hospital',
      user: 'Dr. Kofi',
      department: 'OPD',
      item: 'Antibiotic Ointment',
      qty: 5,
      facilityStock: 0,
      priority: 'High',
      status: 'Rejected',
      raisedOn: '21-Sep-2025',
      statusTimeline: [
        { status: 'Raised by User', timestamp: '21-Sep-2025 11:05' },
        { status: 'Seen by Facility Admin', timestamp: '21-Sep-2025 11:35' },
        { status: 'Rejected', timestamp: '21-Sep-2025 12:15' }
      ],
      remarksLog: [
        { user: 'Facility Admin', remark: 'Duplicate request', timestamp: '21-Sep-2025 12:15' }
      ]
    }
  ];

  // Extract unique values for dropdown filters
  const users = [...new Set(initialRequisitions.map(req => req.user))];
  const items = [...new Set(initialRequisitions.map(req => req.item))];
  const departments = [...new Set(initialRequisitions.map(req => req.department))];

  // State management
  const [activeTab, setActiveTab] = useState('all');
  const [requisitions, setRequisitions] = useState(initialRequisitions);
  const [showDeliverModal, setShowDeliverModal] = useState(false);
  const [showRaiseModal, setShowRaiseModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRequisition, setSelectedRequisition] = useState(null);
  const [deliverQty, setDeliverQty] = useState('');
  const [deliverRemarks, setDeliverRemarks] = useState('');
  const [raisePriority, setRaisePriority] = useState('Normal');
  const [raiseRemarks, setRaiseRemarks] = useState('');
  const [raiseRequiredQty, setRaiseRequiredQty] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  
  // Filter states
  const [userFilter, setUserFilter] = useState('');
  const [itemFilter, setItemFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter requisitions based on admin's facility, active tab, and other filters
  const filteredRequisitions = requisitions.filter(req => {
    // Only show requisitions from admin's facility
    if (req.facility !== adminFacility) return false;
    
    // Tab filter
    if (activeTab !== 'all' && req.status.toLowerCase() !== activeTab) return false;
    
    // Dropdown filters
    if (userFilter && req.user !== userFilter) return false;
    if (itemFilter && req.item !== itemFilter) return false;
    if (departmentFilter && req.department !== departmentFilter) return false;
    if (priorityFilter && req.priority !== priorityFilter) return false;
    
    // Search filter
    if (searchTerm && !(
      req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.user.toLowerCase().includes(searchTerm.toLowerCase())
    )) return false;
    
    return true;
  });

  // Handle deliver action
  const handleDeliver = (req) => {
    setSelectedRequisition(req);
    setDeliverQty(req.qty.toString());
    setDeliverRemarks('');
    setShowDeliverModal(true);
  };

  // Handle raise to warehouse action
  const handleRaiseToWarehouse = (req) => {
    setSelectedRequisition(req);
    setRaisePriority(req.priority);
    setRaiseRemarks('');
    setRaiseRequiredQty(req.qty.toString());
    setShowRaiseModal(true);
  };

  // Handle reject action
  const handleReject = (req) => {
    setSelectedRequisition(req);
    setRejectReason('');
    setShowRejectModal(true);
  };

  // Handle view detail action
  const handleViewDetail = (req) => {
    setSelectedRequisition(req);
    setShowViewModal(true);
  };

  // Submit deliver action
  const submitDeliver = () => {
    if (!deliverQty || parseInt(deliverQty) <= 0 || parseInt(deliverQty) > selectedRequisition.facilityStock) {
      alert('Please enter a valid deliver quantity');
      return;
    }
    
    const updatedRequisitions = requisitions.map(req => {
      if (req.id === selectedRequisition.id) {
        const newStatusTimeline = [
          ...req.statusTimeline,
          { status: 'Delivered', timestamp: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }
        ];
        
        const newRemarksLog = [
          ...req.remarksLog,
          { 
            user: 'Facility Admin', 
            remark: deliverRemarks || 'Delivered from available stock', 
            timestamp: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) 
          }
        ];
        
        return { 
          ...req, 
          status: 'Delivered',
          statusTimeline: newStatusTimeline,
          remarksLog: newRemarksLog
        };
      }
      return req;
    });
    
    setRequisitions(updatedRequisitions);
    setShowDeliverModal(false);
    setSelectedRequisition(null);
    setDeliverQty('');
    setDeliverRemarks('');
  };

  // Submit raise to warehouse action
  const submitRaiseToWarehouse = () => {
    if (!raiseRequiredQty || parseInt(raiseRequiredQty) <= 0) {
      alert('Please enter a valid required quantity');
      return;
    }
    
    const updatedRequisitions = requisitions.map(req => {
      if (req.id === selectedRequisition.id) {
        const newStatusTimeline = [
          ...req.statusTimeline,
          { status: 'Raised to Warehouse', timestamp: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }
        ];
        
        const newRemarksLog = [
          ...req.remarksLog,
          { 
            user: 'Facility Admin', 
            remark: raiseRemarks || `Raised to warehouse with ${raisePriority} priority`, 
            timestamp: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) 
          }
        ];
        
        return { 
          ...req, 
          status: 'Processing',
          priority: raisePriority,
          statusTimeline: newStatusTimeline,
          remarksLog: newRemarksLog
        };
      }
      return req;
    });
    
    setRequisitions(updatedRequisitions);
    setShowRaiseModal(false);
    setSelectedRequisition(null);
    setRaisePriority('Normal');
    setRaiseRemarks('');
    setRaiseRequiredQty('');
  };

  // Submit reject action
  const submitReject = () => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    
    const updatedRequisitions = requisitions.map(req => {
      if (req.id === selectedRequisition.id) {
        const newStatusTimeline = [
          ...req.statusTimeline,
          { status: 'Rejected', timestamp: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }
        ];
        
        const newRemarksLog = [
          ...req.remarksLog,
          { 
            user: 'Facility Admin', 
            remark: rejectReason, 
            timestamp: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) 
          }
        ];
        
        return { 
          ...req, 
          status: 'Rejected',
          statusTimeline: newStatusTimeline,
          remarksLog: newRemarksLog
        };
      }
      return req;
    });
    
    setRequisitions(updatedRequisitions);
    setShowRejectModal(false);
    setSelectedRequisition(null);
    setRejectReason('');
  };

  // Mark requisition as completed
  const markAsCompleted = (reqId) => {
    const updatedRequisitions = requisitions.map(req => {
      if (req.id === reqId) {
        const newStatusTimeline = [
          ...req.statusTimeline,
          { status: 'Completed', timestamp: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }
        ];
        
        return { 
          ...req, 
          status: 'Completed',
          statusTimeline: newStatusTimeline
        };
      }
      return req;
    });
    
    setRequisitions(updatedRequisitions);
  };

  // Close modals
  const closeDeliverModal = () => {
    setShowDeliverModal(false);
    setSelectedRequisition(null);
    setDeliverQty('');
    setDeliverRemarks('');
  };

  const closeRaiseModal = () => {
    setShowRaiseModal(false);
    setSelectedRequisition(null);
    setRaisePriority('Normal');
    setRaiseRemarks('');
    setRaiseRequiredQty('');
  };

  const closeRejectModal = () => {
    setShowRejectModal(false);
    setSelectedRequisition(null);
    setRejectReason('');
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedRequisition(null);
  };

  // Reset all filters
  const resetFilters = () => {
    setUserFilter('');
    setItemFilter('');
    setDepartmentFilter('');
    setPriorityFilter('');
    setSearchTerm('');
  };

  return (
    <div className="container-fluid py-4 px-3 px-md-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h1 className="mb-0">Requisitions (From Users)</h1>
          <p className="text-muted mb-0">Manage and process all requisitions raised by users in your facility.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-2">
              <label className="form-label small text-muted">User</label>
              <select 
                className="form-select" 
                value={userFilter} 
                onChange={(e) => setUserFilter(e.target.value)}
              >
                <option value="">All Users</option>
                {users.map(user => (
                  <option key={user} value={user}>{user}</option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label small text-muted">Item</label>
              <select 
                className="form-select" 
                value={itemFilter} 
                onChange={(e) => setItemFilter(e.target.value)}
              >
                <option value="">All Items</option>
                {items.map(item => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label small text-muted">Department</label>
              <select 
                className="form-select" 
                value={departmentFilter} 
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label small text-muted">Priority</label>
              <select 
                className="form-select" 
                value={priorityFilter} 
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="">All Priorities</option>
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label small text-muted">Search</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Req ID / Item / User" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-2 d-flex align-items-end">
              <button className="btn btn-outline-secondary w-100" onClick={resetFilters}>
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'all' ? 'active' : ''}`} 
            onClick={() => setActiveTab('all')}
          >
            All
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'pending' ? 'active' : ''}`} 
            onClick={() => setActiveTab('pending')}
          >
            Pending
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'processing' ? 'active' : ''}`} 
            onClick={() => setActiveTab('processing')}
          >
            Processing
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'delivered' ? 'active' : ''}`} 
            onClick={() => setActiveTab('delivered')}
          >
            Delivered
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'completed' ? 'active' : ''}`} 
            onClick={() => setActiveTab('completed')}
          >
            Completed
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'rejected' ? 'active' : ''}`} 
            onClick={() => setActiveTab('rejected')}
          >
            Rejected
          </button>
        </li>
      </ul>

      {/* Requisitions Table */}
      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr>
                <th>Req ID</th>
                <th>User Name</th>
                <th>Department</th>
                <th>Item Name</th>
                <th>Requested Qty</th>
                <th>Facility Stock</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Raised On</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequisitions.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center py-4 text-muted">
                    No requisitions found for {adminFacility} with the current filters.
                  </td>
                </tr>
              ) : (
                filteredRequisitions.map((req) => (
                  <tr key={req.id}>
                    <td className="fw-medium">{req.id}</td>
                    <td>{req.user}</td>
                    <td>{req.department}</td>
                    <td>{req.item}</td>
                    <td>{req.qty}</td>
                    <td>{req.facilityStock}</td>
                    <td>
                      <span className={`badge rounded-pill ${
                        req.priority === 'Normal' 
                          ? 'bg-secondary-subtle text-secondary-emphasis' 
                          : req.priority === 'High' 
                            ? 'bg-warning-subtle text-warning-emphasis' 
                            : 'bg-danger-subtle text-danger-emphasis'
                      } px-3 py-1`}>
                        {req.priority}
                      </span>
                    </td>
                    <td>
                      <span className={`badge rounded-pill ${
                        req.status === 'Pending' 
                          ? 'bg-secondary-subtle text-secondary-emphasis' 
                          : req.status === 'Processing' 
                            ? 'bg-warning-subtle text-warning-emphasis' 
                            : req.status === 'Delivered' 
                              ? 'bg-info-subtle text-info-emphasis' 
                              : req.status === 'Completed'
                                ? 'bg-success-subtle text-success-emphasis'
                                : 'bg-danger-subtle text-danger-emphasis'
                      } px-3 py-1`}>
                        {req.status}
                      </span>
                    </td>
                    <td>{req.raisedOn}</td>
                    <td className="text-center">
                      <div className="d-flex justify-content-center gap-2 flex-wrap">
                        {req.status === 'Pending' && req.facilityStock >= req.qty && (
                          <button 
                            className="btn btn-sm btn-success" 
                            onClick={() => handleDeliver(req)}
                            title="Deliver"
                          >
                            Deliver
                          </button>
                        )}
                        {req.status === 'Pending' && req.facilityStock < req.qty && (
                          <button 
                            className="btn btn-sm btn-primary" 
                            onClick={() => handleRaiseToWarehouse(req)}
                            title="Raise to Warehouse"
                          >
                            Raise to Warehouse
                          </button>
                        )}
                        {req.status === 'Pending' && (
                          <button 
                            className="btn btn-sm btn-danger" 
                            onClick={() => handleReject(req)}
                            title="Reject"
                          >
                            Reject
                          </button>
                        )}
                        {req.status === 'Delivered' && (
                          <button 
                            className="btn btn-sm btn-success" 
                            onClick={() => markAsCompleted(req.id)}
                            title="Mark as Completed"
                          >
                            Complete
                          </button>
                        )}
                        <button 
                          className="btn btn-sm btn-outline-secondary" 
                          onClick={() => handleViewDetail(req)}
                          title="View Details"
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

      {/* Deliver Modal */}
      {showDeliverModal && selectedRequisition && (
        <div 
          className="modal fade show" 
          tabIndex="-1" 
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} 
          onClick={closeDeliverModal}
        >
          <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Deliver Item</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={closeDeliverModal}
                ></button>
              </div>
              <div className="modal-body p-4">
                <div className="row mb-3">
                  <div className="col-5 fw-bold text-muted">Req ID:</div>
                  <div className="col-7">{selectedRequisition.id}</div>
                </div>
                <div className="row mb-3">
                  <div className="col-5 fw-bold text-muted">User Name:</div>
                  <div className="col-7">{selectedRequisition.user}</div>
                </div>
                <div className="row mb-3">
                  <div className="col-5 fw-bold text-muted">Item Name:</div>
                  <div className="col-7">{selectedRequisition.item}</div>
                </div>
                <div className="row mb-3">
                  <div className="col-5 fw-bold text-muted">Requested Qty:</div>
                  <div className="col-7">{selectedRequisition.qty}</div>
                </div>
                <div className="row mb-3">
                  <div className="col-5 fw-bold text-muted">Facility Available Stock:</div>
                  <div className="col-7">{selectedRequisition.facilityStock}</div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Deliver Qty</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={deliverQty} 
                    onChange={(e) => setDeliverQty(e.target.value)} 
                    min="1" 
                    max={selectedRequisition.facilityStock}
                    required 
                  />
                  <div className="form-text">
                    Available stock: {selectedRequisition.facilityStock}
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Remarks</label>
                  <textarea 
                    className="form-control" 
                    value={deliverRemarks} 
                    onChange={(e) => setDeliverRemarks(e.target.value)} 
                    rows="2"
                    placeholder="Optional remarks"
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <div className="d-flex flex-column flex-sm-row gap-2 w-100">
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary w-100" 
                    onClick={closeDeliverModal}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-success w-100" 
                    onClick={submitDeliver}
                  >
                    Deliver
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Raise to Warehouse Modal */}
      {showRaiseModal && selectedRequisition && (
        <div 
          className="modal fade show" 
          tabIndex="-1" 
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} 
          onClick={closeRaiseModal}
        >
          <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Raise to Warehouse</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={closeRaiseModal}
                ></button>
              </div>
              <div className="modal-body p-4">
                <div className="row mb-3">
                  <div className="col-5 fw-bold text-muted">Req ID:</div>
                  <div className="col-7">{selectedRequisition.id}</div>
                </div>
                <div className="row mb-3">
                  <div className="col-5 fw-bold text-muted">User Name:</div>
                  <div className="col-7">{selectedRequisition.user}</div>
                </div>
                <div className="row mb-3">
                  <div className="col-5 fw-bold text-muted">Item Name:</div>
                  <div className="col-7">{selectedRequisition.item}</div>
                </div>
                <div className="row mb-3">
                  <div className="col-5 fw-bold text-muted">Requested Qty:</div>
                  <div className="col-7">{selectedRequisition.qty}</div>
                </div>
                <div className="row mb-3">
                  <div className="col-5 fw-bold text-muted">Facility Available Qty:</div>
                  <div className="col-7">{selectedRequisition.facilityStock}</div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Required Qty</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={raiseRequiredQty} 
                    onChange={(e) => setRaiseRequiredQty(e.target.value)} 
                    min="1" 
                    required 
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Priority</label>
                  <select 
                    className="form-select" 
                    value={raisePriority} 
                    onChange={(e) => setRaisePriority(e.target.value)}
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
                    value={raiseRemarks} 
                    onChange={(e) => setRaiseRemarks(e.target.value)} 
                    rows="2"
                    placeholder="Optional remarks"
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <div className="d-flex flex-column flex-sm-row gap-2 w-100">
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary w-100" 
                    onClick={closeRaiseModal}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-primary w-100" 
                    onClick={submitRaiseToWarehouse}
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedRequisition && (
        <div 
          className="modal fade show" 
          tabIndex="-1" 
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} 
          onClick={closeRejectModal}
        >
          <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Reject Requisition</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={closeRejectModal}
                ></button>
              </div>
              <div className="modal-body p-4">
                <div className="row mb-3">
                  <div className="col-5 fw-bold text-muted">Req ID:</div>
                  <div className="col-7">{selectedRequisition.id}</div>
                </div>
                <div className="row mb-3">
                  <div className="col-5 fw-bold text-muted">User Name:</div>
                  <div className="col-7">{selectedRequisition.user}</div>
                </div>
                <div className="row mb-3">
                  <div className="col-5 fw-bold text-muted">Item Name:</div>
                  <div className="col-7">{selectedRequisition.item}</div>
                </div>
                <div className="row mb-3">
                  <div className="col-5 fw-bold text-muted">Requested Qty:</div>
                  <div className="col-7">{selectedRequisition.qty}</div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Reason for Rejection <span className="text-danger">*</span></label>
                  <textarea 
                    className="form-control" 
                    value={rejectReason} 
                    onChange={(e) => setRejectReason(e.target.value)} 
                    rows="3"
                    placeholder="Please provide a reason for rejection"
                    required
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <div className="d-flex flex-column flex-sm-row gap-2 w-100">
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary w-100" 
                    onClick={closeRejectModal}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-danger w-100" 
                    onClick={submitReject}
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      {showViewModal && selectedRequisition && (
        <div 
          className="modal fade show" 
          tabIndex="-1" 
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} 
          onClick={closeViewModal}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Requisition Detail</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={closeViewModal}
                ></button>
              </div>
              <div className="modal-body p-4">
                <div className="row mb-4">
                  <div className="col-md-6">
                    <div className="row mb-3">
                      <div className="col-5 fw-bold text-muted">Req ID:</div>
                      <div className="col-7">{selectedRequisition.id}</div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-5 fw-bold text-muted">User Name:</div>
                      <div className="col-7">{selectedRequisition.user}</div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-5 fw-bold text-muted">Department:</div>
                      <div className="col-7">{selectedRequisition.department}</div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="row mb-3">
                      <div className="col-5 fw-bold text-muted">Item Name:</div>
                      <div className="col-7">{selectedRequisition.item}</div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-5 fw-bold text-muted">Requested Qty:</div>
                      <div className="col-7">{selectedRequisition.qty}</div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-5 fw-bold text-muted">Priority:</div>
                      <div className="col-7">
                        <span className={`badge rounded-pill ${
                          selectedRequisition.priority === 'Normal' 
                            ? 'bg-secondary-subtle text-secondary-emphasis' 
                            : selectedRequisition.priority === 'High' 
                              ? 'bg-warning-subtle text-warning-emphasis' 
                              : 'bg-danger-subtle text-danger-emphasis'
                        } px-3 py-1`}>
                          {selectedRequisition.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="row mb-3">
                  <div className="col-5 fw-bold text-muted">Facility Stock at Request Time:</div>
                  <div className="col-7">{selectedRequisition.facilityStock}</div>
                </div>
                
                <div className="row mb-3">
                  <div className="col-5 fw-bold text-muted">Current Status:</div>
                  <div className="col-7">
                    <span className={`badge rounded-pill ${
                      selectedRequisition.status === 'Pending' 
                        ? 'bg-secondary-subtle text-secondary-emphasis' 
                        : selectedRequisition.status === 'Processing' 
                          ? 'bg-warning-subtle text-warning-emphasis' 
                          : selectedRequisition.status === 'Delivered' 
                            ? 'bg-info-subtle text-info-emphasis' 
                            : selectedRequisition.status === 'Completed'
                              ? 'bg-success-subtle text-success-emphasis'
                              : 'bg-danger-subtle text-danger-emphasis'
                    } px-3 py-1`}>
                      {selectedRequisition.status}
                    </span>
                  </div>
                </div>
                
                <hr className="my-4" />
                
                <h6 className="fw-bold mb-3">Status Timeline</h6>
                <div className="mb-4">
                  {selectedRequisition.statusTimeline.map((event, index) => (
                    <div key={index} className="d-flex mb-2">
                      <div className="me-3 text-muted" style={{ minWidth: '120px' }}>{event.timestamp}</div>
                      <div>{event.status}</div>
                    </div>
                  ))}
                </div>
                
                <h6 className="fw-bold mb-3">Remarks Log</h6>
                <div>
                  {selectedRequisition.remarksLog.length === 0 ? (
                    <p className="text-muted">No remarks available</p>
                  ) : (
                    selectedRequisition.remarksLog.map((remark, index) => (
                      <div key={index} className="mb-3 p-3 bg-light rounded">
                        <div className="d-flex justify-content-between mb-1">
                          <span className="fw-medium">{remark.user}</span>
                          <span className="text-muted small">{remark.timestamp}</span>
                        </div>
                        <div>{remark.remark}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button 
                  type="button" 
                  className="btn btn-secondary w-100" 
                  onClick={closeViewModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FacilityRequisitions;