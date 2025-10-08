// src/App.jsx
import { useState, useEffect } from 'react';

function FacilityMyRequest() {
  // Current user (hardcoded for this example)
  const currentUser = 'Dr. Amoah';
  // User's facility (hardcoded for this example)
  const userFacility = 'Kumasi Branch Hospital';
  
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
      user: 'Dr. Amoah',
      department: 'Emergency',
      item: 'Surgical Gloves (L)',
      qty: 20,
      facilityStock: 15,
      priority: 'High',
      status: 'Delivered',
      raisedOn: '26-Sep-2025',
      statusTimeline: [
        { status: 'Raised by User', timestamp: '26-Sep-2025 09:15' },
        { status: 'Seen by Facility Admin', timestamp: '26-Sep-2025 09:45' },
        { status: 'Delivered', timestamp: '26-Sep-2025 10:30' }
      ],
      remarksLog: [
        { user: 'Facility Admin', remark: 'Delivered from available stock', timestamp: '26-Sep-2025 10:30' }
      ]
    },
    {
      id: 'REQ-2025-103',
      facility: 'Kumasi Branch Hospital',
      user: 'Dr. Amoah',
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
      user: 'Dr. Amoah',
      department: 'OPD',
      item: 'Cough Syrup',
      qty: 12,
      facilityStock: 8,
      priority: 'Normal',
      status: 'Delivered',
      raisedOn: '24-Sep-2025',
      statusTimeline: [
        { status: 'Raised by User', timestamp: '24-Sep-2025 14:10' },
        { status: 'Seen by Facility Admin', timestamp: '24-Sep-2025 14:40' },
        { status: 'Delivered', timestamp: '24-Sep-2025 15:20' }
      ],
      remarksLog: [
        { user: 'Facility Admin', remark: 'Delivered from available stock', timestamp: '24-Sep-2025 15:20' }
      ]
    },
    {
      id: 'REQ-2025-105',
      facility: 'Kumasi Branch Hospital',
      user: 'Dr. Amoah',
      department: 'Surgery',
      item: 'Surgical Masks',
      qty: 50,
      facilityStock: 100,
      priority: 'Normal',
      status: 'Completed',
      raisedOn: '23-Sep-2025',
      statusTimeline: [
        { status: 'Raised by User', timestamp: '23-Sep-2025 09:30' },
        { status: 'Seen by Facility Admin', timestamp: '23-Sep-2025 10:00' },
        { status: 'Delivered', timestamp: '23-Sep-2025 10:45' },
        { status: 'Completed', timestamp: '23-Sep-2025 11:30' }
      ],
      remarksLog: [
        { user: 'Facility Admin', remark: 'Delivered from available stock', timestamp: '23-Sep-2025 10:45' }
      ]
    },
    {
      id: 'REQ-2025-106',
      facility: 'Kumasi Branch Hospital',
      user: 'Dr. Amoah',
      department: 'OPD',
      item: 'Ibuprofen 400mg',
      qty: 7,
      facilityStock: 50,
      priority: 'Normal',
      status: 'Approved',
      raisedOn: '22-Sep-2025',
      statusTimeline: [
        { status: 'Raised by User', timestamp: '22-Sep-2025 13:15' },
        { status: 'Seen by Facility Admin', timestamp: '22-Sep-2025 13:45' },
        { status: 'Delivered', timestamp: '22-Sep-2025 14:30' },
        { status: 'Approved by User', timestamp: '22-Sep-2025 15:20' }
      ],
      remarksLog: [
        { user: 'Facility Admin', remark: 'Delivered from available stock', timestamp: '22-Sep-2025 14:30' },
        { user: 'Dr. Amoah', remark: 'Items received in good condition', timestamp: '22-Sep-2025 15:20' }
      ]
    },
    {
      id: 'REQ-2025-107',
      facility: 'Kumasi Branch Hospital',
      user: 'Dr. Amoah',
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
    },
    // Add more mock data to test pagination
    ...Array.from({ length: 5 }, (_, i) => ({
      id: `REQ-2025-${108 + i}`,
      facility: 'Kumasi Branch Hospital',
      user: 'Dr. Amoah',
      department: 'Dept',
      item: `Item ${i + 1}`,
      qty: 5,
      facilityStock: i % 2 === 0 ? 10 : 0,
      priority: 'Normal',
      status: i % 3 === 0 ? 'Delivered' : 'Pending',
      raisedOn: '20-Sep-2025',
      statusTimeline: [{ status: 'Raised by User', timestamp: '20-Sep-2025 10:00' }],
      remarksLog: []
    }))
  ];
  
  // State management
  const [requisitions, setRequisitions] = useState(initialRequisitions);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showDisapproveModal, setShowDisapproveModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRequisition, setSelectedRequisition] = useState(null);
  const [approveRemarks, setApproveRemarks] = useState('');
  const [disapproveReason, setDisapproveReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 10;

  // Filter requisitions based on current user and search term
  const filteredRequisitions = requisitions.filter(req => {
    // Only show requisitions from current user
    if (req.user !== currentUser) return false;
    // Search filter
    if (searchTerm && !(
      req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.item.toLowerCase().includes(searchTerm.toLowerCase())
    )) return false;
    return true;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredRequisitions.length / entriesPerPage);
  const indexOfLastEntry = currentPage * entriesPerPage;
  const currentEntries = filteredRequisitions.slice(indexOfLastEntry - entriesPerPage, indexOfLastEntry);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Handle approve action
  const handleApprove = (req) => {
    setSelectedRequisition(req);
    setApproveRemarks('');
    setShowApproveModal(true);
  };
  
  // Handle disapprove action
  const handleDisapprove = (req) => {
    setSelectedRequisition(req);
    setDisapproveReason('');
    setShowDisapproveModal(true);
  };
  
  // Handle view detail action
  const handleViewDetail = (req) => {
    setSelectedRequisition(req);
    setShowViewModal(true);
  };
  
  // Submit approve action
  const submitApprove = () => {
    const updatedRequisitions = requisitions.map(req => {
      if (req.id === selectedRequisition.id) {
        const newStatusTimeline = [
          ...req.statusTimeline,
          { status: 'Approved by User', timestamp: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }
        ];
        const newRemarksLog = [
          ...req.remarksLog,
          { 
            user: currentUser, 
            remark: approveRemarks || 'Request approved', 
            timestamp: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) 
          }
        ];
        return { 
          ...req, 
          status: 'Approved',
          statusTimeline: newStatusTimeline,
          remarksLog: newRemarksLog
        };
      }
      return req;
    });
    setRequisitions(updatedRequisitions);
    setShowApproveModal(false);
    setSelectedRequisition(null);
    setApproveRemarks('');
  };
  
  // Submit disapprove action
  const submitDisapprove = () => {
    if (!disapproveReason.trim()) {
      alert('Please provide a reason for disapproval');
      return;
    }
    const updatedRequisitions = requisitions.map(req => {
      if (req.id === selectedRequisition.id) {
        const newStatusTimeline = [
          ...req.statusTimeline,
          { status: 'Disapproved by User', timestamp: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }
        ];
        const newRemarksLog = [
          ...req.remarksLog,
          { 
            user: currentUser, 
            remark: disapproveReason, 
            timestamp: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) 
          }
        ];
        return { 
          ...req, 
          status: 'Disapproved',
          statusTimeline: newStatusTimeline,
          remarksLog: newRemarksLog
        };
      }
      return req;
    });
    setRequisitions(updatedRequisitions);
    setShowDisapproveModal(false);
    setSelectedRequisition(null);
    setDisapproveReason('');
  };
  
  // Close modals
  const closeApproveModal = () => {
    setShowApproveModal(false);
    setSelectedRequisition(null);
    setApproveRemarks('');
  };
  
  const closeDisapproveModal = () => {
    setShowDisapproveModal(false);
    setSelectedRequisition(null);
    setDisapproveReason('');
  };
  
  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedRequisition(null);
  };

  return (
    <div className="container-fluid py-4 px-3 px-md-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h1 className="mb-0">My Request</h1>
          <p className="text-muted mb-0">View and manage your requisitions in {userFacility}.</p>
        </div>
      </div>
      
      {/* Search */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label small text-muted">Search</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Req ID / Item" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Requisitions Table */}
      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr>
                <th>Req ID</th>
                <th>Department</th>
                <th>Item Name</th>
                <th>Requested Qty</th>
                <th>Facility Stock</th>
                <th>Status</th>
                <th>Raised On</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentEntries.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-4 text-muted">
                    No requisitions found for {currentUser} with the current filters.
                  </td>
                </tr>
              ) : (
                currentEntries.map((req) => (
                  <tr key={req.id}>
                    <td className="fw-medium">{req.id}</td>
                    <td>{req.department}</td>
                    <td>{req.item}</td>
                    <td>{req.qty}</td>
                    <td>{req.facilityStock}</td>
              
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
                                : req.status === 'Approved'
                                  ? 'bg-primary-subtle text-primary-emphasis'
                                  : req.status === 'Disapproved'
                                    ? 'bg-warning-subtle text-warning-emphasis'
                                    : 'bg-danger-subtle text-danger-emphasis'
                      } px-3 py-1`}>
                        {req.status}
                      </span>
                    </td>
                    <td>{req.raisedOn}</td>
                    <td className="text-center">
                      <div className="d-flex justify-content-center gap-2 flex-wrap">
                        {/* {req.status === 'Delivered' && (
                          <>
                            <button 
                              className="btn btn-sm btn-success" 
                              onClick={() => handleApprove(req)}
                              title="Approve"
                            >
                              Approve
                            </button>
                            <button 
                              className="btn btn-sm btn-warning" 
                              onClick={() => handleDisapprove(req)}
                              title="Disapprove"
                            >
                              Disapprove
                            </button>
                          </>
                        )} */}
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
      
      {/* Pagination UI */}
      <div className="d-flex justify-content-end mt-3">
        <nav>
          <ul className="pagination mb-3">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
            </li>

            {[...Array(totalPages)].map((_, i) => {
              const page = i + 1;
              return (
                <li
                  key={page}
                  className={`page-item ${currentPage === page ? 'active' : ''}`}
                >
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                </li>
              );
            })}

            <li className={`page-item ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                Next
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Approve Modal */}
      {showApproveModal && selectedRequisition && (
        <div 
          className="modal fade show" 
          tabIndex="-1" 
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} 
          onClick={closeApproveModal}
        >
          <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Approve Requisition</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={closeApproveModal}
                ></button>
              </div>
              <div className="modal-body p-4">
                <div className="row mb-3">
                  <div className="col-5 fw-bold text-muted">Req ID:</div>
                  <div className="col-7">{selectedRequisition.id}</div>
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
                  <div className="col-5 fw-bold text-muted">Delivered Qty:</div>
                  <div className="col-7">{selectedRequisition.qty}</div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Remarks</label>
                  <textarea 
                    className="form-control" 
                    value={approveRemarks} 
                    onChange={(e) => setApproveRemarks(e.target.value)} 
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
                    onClick={closeApproveModal}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-success w-100" 
                    onClick={submitApprove}
                  >
                    Approve
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Disapprove Modal */}
      {showDisapproveModal && selectedRequisition && (
        <div 
          className="modal fade show" 
          tabIndex="-1" 
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} 
          onClick={closeDisapproveModal}
        >
          <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Disapprove Requisition</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={closeDisapproveModal}
                ></button>
              </div>
              <div className="modal-body p-4">
                <div className="row mb-3">
                  <div className="col-5 fw-bold text-muted">Req ID:</div>
                  <div className="col-7">{selectedRequisition.id}</div>
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
                  <div className="col-5 fw-bold text-muted">Delivered Qty:</div>
                  <div className="col-7">{selectedRequisition.qty}</div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Reason for Disapproval <span className="text-danger">*</span></label>
                  <textarea 
                    className="form-control" 
                    value={disapproveReason} 
                    onChange={(e) => setDisapproveReason(e.target.value)} 
                    rows="3"
                    placeholder="Please provide a reason for disapproval"
                    required
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <div className="d-flex flex-column flex-sm-row gap-2 w-100">
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary w-100" 
                    onClick={closeDisapproveModal}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-warning w-100" 
                    onClick={submitDisapprove}
                  >
                    Disapprove
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
                              : selectedRequisition.status === 'Approved'
                                ? 'bg-primary-subtle text-primary-emphasis'
                                : selectedRequisition.status === 'Disapproved'
                                  ? 'bg-warning-subtle text-warning-emphasis'
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

export default FacilityMyRequest;