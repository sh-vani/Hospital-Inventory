import React, { useState } from 'react';
import {
  FaPlus, FaSearch, FaCheck, FaTimes, FaEye,
  FaExclamationTriangle, FaExclamationCircle
} from 'react-icons/fa';

const SuperAdminRequisitions = () => {
  // === STATIC MOCK DATA ===
  const mockRequisitions = [
    {
      id: '#REQ-0042',
      facility: 'Kumasi Branch Hospital',
      department: 'Pharmacy',
      requestedBy: 'Dr. Amoah',
      date: '24 Oct 2023',
      items: '12 items',
      priority: 'High',
      status: 'Pending Review',
      details: [
        { name: 'Paracetamol 500mg', quantity: 200, unit: 'Tablets' },
        { name: 'IV Fluids (Normal Saline)', quantity: 50, unit: 'Bottles' }
      ]
    },
    {
      id: '#REQ-0041',
      facility: 'Accra Central Hospital',
      department: 'Emergency',
      requestedBy: 'Nurse Adwoa',
      date: '23 Oct 2023',
      items: '8 items',
      priority: 'Medium',
      status: 'Approved',
      details: [
        { name: 'Gloves (Medium)', quantity: 100, unit: 'Pairs' },
        { name: 'Face Masks (Surgical)', quantity: 200, unit: 'Pieces' }
      ]
    },
    {
      id: '#REQ-0040',
      facility: 'Takoradi Clinic',
      department: 'Outpatient',
      requestedBy: 'Dr. Mensah',
      date: '22 Oct 2023',
      items: '5 items',
      priority: 'Low',
      status: 'Partially Approved',
      details: [
        { name: 'Thermometers', quantity: 10, unit: 'Units' }
      ]
    },
    {
      id: '#REQ-0039',
      facility: 'Cape Coast Hospital',
      department: 'Lab',
      requestedBy: 'Pharm. Kofi',
      date: '21 Oct 2023',
      items: '15 items',
      priority: 'High',
      status: 'Rejected',
      details: [
        { name: 'Test Kits (Malaria)', quantity: 300, unit: 'Kits' }
      ],
      rejectionReason: 'Budget exceeded for this category.'
    }
  ];

  // === STATE ===
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('Pending');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [currentRequisition, setCurrentRequisition] = useState(null);
  const [newRequisition, setNewRequisition] = useState({
    facility: '',
    department: '',
    requestedBy: '',
    items: '',
    priority: 'Medium',
    reason: ''
  });
  const [rejectionReason, setRejectionReason] = useState('');

  // === FILTER LOGIC ===
  const filteredRequisitions = mockRequisitions.filter(req => {
    if (activeTab === 'Pending') {
      return req.status === 'Pending Review' || req.status === 'Partially Approved';
    } else if (activeTab === 'Approved') {
      return req.status === 'Approved';
    } else if (activeTab === 'Rejected') {
      return req.status === 'Rejected';
    } else {
      return true;
    }
  });

  const filteredBySearch = filteredRequisitions.filter(r => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return (
      r.id.toLowerCase().includes(q) ||
      r.facility.toLowerCase().includes(q) ||
      r.department.toLowerCase().includes(q) ||
      r.requestedBy.toLowerCase().includes(q) ||
      r.status.toLowerCase().includes(q)
    );
  });

  // === BADGES ===
  const PriorityBadge = ({ priority }) => {
    const map = { High: 'bg-danger', Medium: 'bg-warning text-dark', Low: 'bg-success' };
    return <span className={`badge ${map[priority] || 'bg-secondary'}`}>{priority}</span>;
  };

  const StatusBadge = ({ status }) => {
    const map = {
      'Pending Review': 'bg-warning text-dark',
      'Partially Approved': 'bg-info text-dark',
      'Approved': 'bg-success',
      'Rejected': 'bg-danger'
    };
    return <span className={`badge ${map[status] || 'bg-secondary'}`}>{status}</span>;
  };

  // === MODAL HANDLERS ===
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

  const openViewModal = (req) => {
    setCurrentRequisition(req);
    setShowViewModal(true);
  };

  const openApproveModal = (req) => {
    setCurrentRequisition(req);
    setShowApproveModal(true);
  };

  const openRejectModal = (req) => {
    setCurrentRequisition(req);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  // === ACTION HANDLERS (UI-only, no real API) ===
  const handleCreateRequisition = () => {
    alert('New requisition created (UI only)');
    setShowCreateModal(false);
  };

  const handleApproveRequisition = () => {
    alert('Requisition approved (UI only)');
    setShowApproveModal(false);
  };

  const handleRejectRequisition = () => {
    if (!rejectionReason.trim()) return;
    alert('Requisition rejected (UI only)');
    setShowRejectModal(false);
  };

  return (
    <div className="container-fluid py-3">
      {/* ===== Top Toolbar ===== */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center gap-2 mb-4">
        <h2 className="fw-bold mb-0">Requisitions Management</h2>
        <div className="d-flex flex-column flex-sm-row align-items-stretch gap-2 w-100 w-md-auto">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              style={{ height: "40px" }}
              placeholder="Search requisitions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="btn btn-outline-secondary" style={{ height: "40px" }} type="button">
              <FaSearch />
            </button>
          </div>
          <button
            className="btn btn-primary btn-sm py-1 px-2"
            style={{ height: "40px", width: "150px" }}
            onClick={openCreateModal}
          >
            <FaPlus className="me-2" /> Create New
          </button>
        </div>
      </div>

      {/* ===== Summary Cards ===== */}
      <div className="row row-cols-1 row-cols-md-3 g-3 mb-4">
        <div className="col">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body bg-danger bg-opacity-10 p-4">
              <div className="d-flex align-items-center mb-2">
                <FaExclamationCircle className="text-danger me-2" size={24} />
                <h5 className="card-title text-danger fw-bold mb-0">Urgent</h5>
              </div>
              <p className="card-text text-muted ms-4 mb-0">
                {mockRequisitions.filter(r => r.priority === 'High').length} requisitions need immediate attention
              </p>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body bg-warning bg-opacity-10 p-4">
              <div className="d-flex align-items-center mb-2">
                <FaExclamationTriangle className="text-warning me-2" size={24} />
                <h5 className="card-title text-warning fw-bold mb-0">Pending</h5>
              </div>
              <p className="card-text text-muted ms-4 mb-0">
                {mockRequisitions.filter(r => ['Pending Review', 'Partially Approved'].includes(r.status)).length} requisitions awaiting approval
              </p>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body bg-info bg-opacity-10 p-4">
              <div className="d-flex align-items-center mb-2">
                <FaCheck className="text-info me-2" size={24} />
                <h5 className="card-title text-info fw-bold mb-0">Approved</h5>
              </div>
              <p className="card-text text-muted ms-4 mb-0">
                {mockRequisitions.filter(r => r.status === 'Approved').length} requisitions approved
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Tabs ===== */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-white border-0 pt-3">
          <ul className="nav nav-tabs card-header-tabs">
            <li className="nav-item">
              <button className={`nav-link ${activeTab === 'Pending' ? 'active' : ''}`} onClick={() => setActiveTab('Pending')}>
                Pending
              </button>
            </li>
            <li className="nav-item">
              <button className={`nav-link ${activeTab === 'Approved' ? 'active' : ''}`} onClick={() => setActiveTab('Approved')}>
                Approved
              </button>
            </li>
            <li className="nav-item">
              <button className={`nav-link ${activeTab === 'Rejected' ? 'active' : ''}`} onClick={() => setActiveTab('Rejected')}>
                Rejected
              </button>
            </li>
            <li className="nav-item">
              <button className={`nav-link ${activeTab === 'All' ? 'active' : ''}`} onClick={() => setActiveTab('All')}>
                All Requisitions
              </button>
            </li>
          </ul>
        </div>

        {/* ===== Data Views ===== */}
        <div className="card-body p-0">
          {/* TABLE - Desktop */}
          <div className="table-responsive d-none d-md-block">
            <table className="table table-hover mb-0 align-middle">
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
                {filteredBySearch.length === 0 ? (
                  <tr><td colSpan="9" className="text-center">No requisitions found.</td></tr>
                ) : (
                  filteredBySearch.map((req, i) => (
                    <tr key={i}>
                      <td className="fw-bold">{req.id}</td>
                      <td>{req.facility}</td>
                      <td>{req.department}</td>
                      <td>{req.requestedBy}</td>
                      <td>{req.date}</td>
                      <td>{req.items}</td>
                      <td><PriorityBadge priority={req.priority} /></td>
                      <td><StatusBadge status={req.status} /></td>
                      <td>
                        <div className="btn-group" role="group">
                          <button className="btn btn-sm btn-outline-success" onClick={() => openApproveModal(req)} disabled={['Approved', 'Rejected'].includes(req.status)}>
                            <FaCheck />
                          </button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => openRejectModal(req)} disabled={['Approved', 'Rejected'].includes(req.status)}>
                            <FaTimes />
                          </button>
                          <button className="btn btn-sm btn-outline-primary" onClick={() => openViewModal(req)}>
                            <FaEye />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* CARD LIST - Mobile */}
          <div className="d-block d-md-none p-2">
            <div className="row g-2">
              {filteredBySearch.length === 0 ? (
                <div className="col-12">
                  <div className="alert alert-light border text-center mb-0">No requisitions found.</div>
                </div>
              ) : (
                filteredBySearch.map((req, i) => (
                  <div className="col-12" key={i}>
                    <div className="card">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="fw-bold">{req.id}</span>
                          <StatusBadge status={req.status} />
                        </div>
                        <div className="row g-2 small">
                          <div className="col-6"><div className="text-muted">Facility</div><div>{req.facility}</div></div>
                          <div className="col-6"><div className="text-muted">Department</div><div>{req.department}</div></div>
                          <div className="col-6"><div className="text-muted">Requested By</div><div>{req.requestedBy}</div></div>
                          <div className="col-6"><div className="text-muted">Date</div><div>{req.date}</div></div>
                          <div className="col-6"><div className="text-muted">Items</div><div>{req.items}</div></div>
                          <div className="col-6"><div className="text-muted">Priority</div><div><PriorityBadge priority={req.priority} /></div></div>
                        </div>
                        <div className="d-flex gap-2 mt-3">
                          <button className="btn btn-outline-success flex-fill" onClick={() => openApproveModal(req)} disabled={['Approved', 'Rejected'].includes(req.status)}>
                            <FaCheck className="me-1" /> Approve
                          </button>
                          <button className="btn btn-outline-danger flex-fill" onClick={() => openRejectModal(req)} disabled={['Approved', 'Rejected'].includes(req.status)}>
                            <FaTimes className="me-1" /> Reject
                          </button>
                          <button className="btn btn-outline-primary flex-fill" onClick={() => openViewModal(req)}>
                            <FaEye className="me-1" /> View
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===== MODALS (Create, View, Approve, Reject) ===== */}
      {/* Create Modal */}
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
                  <div className="row g-3">
                    <div className="col-md-6"><input className="form-control" placeholder="Facility" value={newRequisition.facility} readOnly /></div>
                    <div className="col-md-6"><input className="form-control" placeholder="Department" value={newRequisition.department} readOnly /></div>
                    <div className="col-md-6"><input className="form-control" placeholder="Requested By" value={newRequisition.requestedBy} readOnly /></div>
                    <div className="col-md-6">
                      <select className="form-select" value={newRequisition.priority} readOnly>
                        <option>High</option>
                        <option>Medium</option>
                        <option>Low</option>
                      </select>
                    </div>
                    <div className="col-12"><textarea className="form-control" rows="3" placeholder="Items Required" value={newRequisition.items} readOnly></textarea></div>
                    <div className="col-12"><textarea className="form-control" rows="2" placeholder="Reason" value={newRequisition.reason} readOnly></textarea></div>
                  </div>
                </form>
                <div className="alert alert-info mt-3">This is a static demo. Form fields are read-only.</div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleCreateRequisition}>Submit</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && currentRequisition && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Requisition Details: {currentRequisition.id}</h5>
                <button type="button" className="btn-close" onClick={() => setShowViewModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row">
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
                <h6 className="mt-3">Items Requested</h6>
                <table className="table table-sm">
                  <thead><tr><th>Item</th><th>Qty</th><th>Unit</th></tr></thead>
                  <tbody>
                    {currentRequisition.details.map((item, i) => (
                      <tr key={i}><td>{item.name}</td><td>{item.quantity}</td><td>{item.unit}</td></tr>
                    ))}
                  </tbody>
                </table>
                {currentRequisition.rejectionReason && (
                  <div className="alert alert-danger mt-3">
                    <strong>Rejection Reason:</strong> {currentRequisition.rejectionReason}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowViewModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {showApproveModal && currentRequisition && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Approve Requisition</h5>
                <button type="button" className="btn-close" onClick={() => setShowApproveModal(false)}></button>
              </div>
              <div className="modal-body">
                <p>Approve requisition <strong>{currentRequisition.id}</strong>?</p>
                <div className="alert alert-success">This is a UI demo. No real action will be performed.</div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowApproveModal(false)}>Cancel</button>
                <button className="btn btn-success" onClick={handleApproveRequisition}>Approve</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && currentRequisition && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Reject Requisition</h5>
                <button type="button" className="btn-close" onClick={() => setShowRejectModal(false)}></button>
              </div>
              <div className="modal-body">
                <p>Reject requisition <strong>{currentRequisition.id}</strong>?</p>
                <div className="mb-3">
                  <label>Reason for Rejection</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter reason..."
                  ></textarea>
                </div>
                <div className="alert alert-danger">This is a UI demo.</div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowRejectModal(false)}>Cancel</button>
                <button
                  className="btn btn-danger"
                  onClick={handleRejectRequisition}
                  disabled={!rejectionReason.trim()}
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {(showCreateModal || showViewModal || showApproveModal || showRejectModal) && (
        <div className="modal-backdrop show"></div>
      )}
    </div>
  );
};

export default SuperAdminRequisitions;