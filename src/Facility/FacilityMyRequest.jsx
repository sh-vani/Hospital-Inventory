// src/App.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import BaseUrl from "../Api/BaseUrl"

function FacilityMyRequest() {
  // State management
  const [requisitions, setRequisitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showDisapproveModal, setShowDisapproveModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRequisition, setSelectedRequisition] = useState(null);
  const [approveRemarks, setApproveRemarks] = useState('');
  const [disapproveReason, setDisapproveReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [userFacility, setUserFacility] = useState('Your Facility'); // ✅ Dynamic
  const [loggedUser, setLoggedUser] = useState(null); // ✅ For modal remarks

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 10;

  // Fetch requisitions from API
  useEffect(() => {
    const fetchRequisitions = async () => {
      try {
        // Get user info from local storage
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          setError('User information not found in local storage');
          setLoading(false);
          return;
        }
        
        const user = JSON.parse(userStr);
        setLoggedUser(user); // ✅ Set logged-in user
        setUserFacility(user.facility_name || 'Unknown Facility'); // ✅ Set facility name

        // Get facility_id
        const facilityId = user.facility_id;
        
        if (!facilityId) {
          setError('Facility ID not found in user information');
          setLoading(false);
          return;
        }

        // Make API call
        const response = await axios.get(`${BaseUrl}/requisitions/facility/${facilityId}`);
        
        if (response.data && response.data.success && response.data.data) {
          // Transform API response to match the current data structure
          const transformedData = response.data.data.map(req => {
            return req.items && req.items.length > 0 ? req.items.map(item => {
              const statusTimeline = [
                { status: 'Raised by User', timestamp: formatDate(req.created_at) }
              ];
              
              if (req.approved_at) {
                statusTimeline.push({ status: 'Approved', timestamp: formatDate(req.approved_at) });
              }
              
              if (req.delivered_at) {
                statusTimeline.push({ status: 'Delivered', timestamp: formatDate(req.delivered_at) });
              }
              
              if (req.rejected_at) {
                statusTimeline.push({ status: 'Rejected', timestamp: formatDate(req.rejected_at) });
              }
              
              const remarksLog = req.remarks ? [
                { 
                  user: req.user_name, 
                  remark: req.remarks, 
                  timestamp: formatDate(req.created_at) 
                }
              ] : [];
              
              // Normalize status and priority to capitalize first letter
              const normalizeStatus = (status) => {
                if (!status) return 'Pending';
                return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
              };
              
              const normalizePriority = (priority) => {
                if (!priority) return 'Normal';
                return priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase();
              };
              
              return {
                id: `REQ-${req.id}`,
                facility: req.facility_name,
                user: req.user_name,
                department: 'Department',
                item: item.item_name || 'Unknown Item',
                qty: item.quantity || 0,
                facilityStock: item.available_quantity || 0,
                priority: normalizePriority(item.priority || req.priority),
                status: normalizeStatus(req.status),
                raisedOn: formatDate(req.created_at),
                statusTimeline,
                remarksLog
              };
            }) : [];
          }).flat();
          
          setRequisitions(transformedData);
        } else {
          setError('Failed to fetch requisitions');
        }
      } catch (err) {
        setError('Error fetching requisitions: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRequisitions();
  }, []);

  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  // ✅ Filter ONLY by search term — show ALL facility requisitions
  const filteredRequisitions = requisitions.filter(req => {
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
            user: loggedUser?.name || 'Unknown User', // ✅ Use logged-in user
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
            user: loggedUser?.name || 'Unknown User', // ✅ Use logged-in user
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

  if (loading) {
    return (
      <div className="container-fluid py-4 px-3 px-md-4">
        <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid py-4 px-3 px-md-4">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4 px-3 px-md-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          {/* ✅ Updated title */}
          <h1 className="mb-0">Facility Requests</h1>
          <p className="text-muted mb-0">View and manage all requisitions in {userFacility}.</p>
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
                    {searchTerm 
                      ? "No requisitions match your search." 
                      : "No requisitions found in this facility."}
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