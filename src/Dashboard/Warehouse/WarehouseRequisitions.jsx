import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaEye, FaFilePdf } from 'react-icons/fa';
import axios from 'axios';
import BaseUrl from '../../Api/BaseUrl';

const WarehouseRequisitions = () => {
  // State for search
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  
  // State for current requisition
  const [currentRequisition, setCurrentRequisition] = useState(null);
  const [rejectingRequisition, setRejectingRequisition] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  
  // State for new requisition form
  const [newRequisition, setNewRequisition] = useState({
    facility_id: '',
    department: '',
    requested_by: '',
    items: '',
    priority: 'Medium',
    reason: ''
  });
  
  // State for requisitions data
  const [requisitions, setRequisitions] = useState([]);
  
  // State for dashboard counts
  const [dashboardCounts, setDashboardCounts] = useState({
    pending: 0,
    approved: 0,
    rejected: 0
  });
  
  // State for loading
  const [loading, setLoading] = useState(true);
  
  // Fetch requisitions and dashboard counts on component mount
  useEffect(() => {
    fetchRequisitions();
    fetchDashboardCounts();
  }, []);
  
  // Function to fetch requisitions from API
  const fetchRequisitions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BaseUrl}/requisitions`);
      
      // Transform API data to match the component's expected format
      const transformedData = response.data.map(req => ({
        id: req.id,
        facility: req.facility_name || `Facility ${req.facility_id}`,
        department: req.department,
        requestedBy: req.requested_by,
        date: new Date(req.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        items: JSON.parse(req.items).length > 0 ? `${JSON.parse(req.items).length} items` : 'No items',
        priority: req.priority,
        status: req.status,
        details: JSON.parse(req.items),
        approvedBy: req.status === 'Approved' ? 'Admin User' : null,
        approvedDate: req.status === 'Approved' ? new Date().toLocaleDateString('en-GB') : null,
        rejectedBy: req.status === 'Rejected' ? 'Admin User' : null,
        rejectedDate: req.status === 'Rejected' ? new Date().toLocaleDateString('en-GB') : null,
        rejectionReason: req.status === 'Rejected' ? req.reason : null,
        documents: req.status === 'Approved' ? {
          pickList: true,
          packingList: true,
          gdn: true
        } : null
      }));
      
      setRequisitions(transformedData);
    } catch (error) {
      console.error('Error fetching requisitions:', error);
      // Fallback to mock data if API fails
     
      
        
    } finally {
      setLoading(false);    
    }
  };
  
  // Function to fetch dashboard counts
  const fetchDashboardCounts = async () => {
    try {
      const response = await axios.get(`${BaseUrl}/dashboard/counts`);
      setDashboardCounts(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard counts:', error);
      // Fallback to default counts if API fails
      setDashboardCounts({
        pending: 0,
        approved: 0,      
        rejected: 0
      });
    }
  };
  
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
  
  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusColors = {
      'Submitted': 'bg-info',
      'Pending Review': 'bg-warning',
      'Approved': 'bg-success',
      'Rejected': 'bg-danger'
    };
    
    return (
      <span className={`badge ${statusColors[status] || 'bg-secondary'} text-dark`}>
        {status}
      </span>
    );
  };
  
  // Modal handlers
  const openCreateModal = () => {
    setNewRequisition({
      facility_id: '',
      department: '',
      requested_by: '',
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

  const openRejectModal = (requisition) => {
    setRejectingRequisition(requisition);
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
  
  // Action handlers
  const handleCreateRequisition = async () => {
    if (!newRequisition.facility_id || !newRequisition.department || !newRequisition.requested_by) {
      alert('Please fill Facility, Department, and Requested By fields.');
      return;
    }

    try {
      // Prepare items array for API
      const itemsArray = newRequisition.items.split(',').map(item => {
        const [item_id, qty] = item.trim().split('-');
        return {
          item_id: item_id ? item_id.trim() : '',
          qty: qty ? parseInt(qty.trim()) : 1
        };
      });

      const apiData = {
        facility_id: parseInt(newRequisition.facility_id),
        department: newRequisition.department,
        requested_by: newRequisition.requested_by,
        priority: newRequisition.priority,
        items: JSON.stringify(itemsArray),
        reason: newRequisition.reason
      };

      // Call API to create requisition
      const response = await axios.post(`${BaseUrl}/requisitions`, apiData);
      
      // Create new item for local state
      const newItem = {
        id: response.data.id ? `#REQ-${response.data.id}` : `#REQ-${Math.floor(Math.random() * 10000)}`,
        facility: `Facility ${newRequisition.facility_id}`,
        department: newRequisition.department,
        requestedBy: newRequisition.requested_by,
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        items: itemsArray.length > 0 ? `${itemsArray.length} items` : 'No items',
        priority: newRequisition.priority,
        status: 'Submitted',
        details: itemsArray,
        approvedBy: null,
        approvedDate: null,
        rejectedBy: null,
        rejectedDate: null,
        rejectionReason: null
      };
      
      setRequisitions([newItem, ...requisitions]);
      setShowCreateModal(false);
      
      // Refresh dashboard counts
      fetchDashboardCounts();
      
      alert('Requisition created successfully!');
    } catch (error) {
      console.error('Error creating requisition:', error);
      alert('Failed to create requisition. Please try again.');
    }
  };

  const handleApprove = async (reqId) => {
    alert(`Approving requisition ${reqId}... Documents will be generated.`);
    try {
      // Extract numeric ID from requisition ID (e.g., #REQ-1 -> 1)
      const numericId = reqId.replace('#REQ-', '');
      
      // Call API to update requisition status
      await axios.patch(`${BaseUrl}/requisitions/status/${reqId}`, {
        status: 'Approved',
        reason: ''
      });
      
      // Update local state
      const now = new Date().toLocaleDateString('en-GB');
      setRequisitions(
        requisitions.map(req =>
          req.id === reqId
            ? {
                ...req,
                status: 'Approved',
                approvedBy: 'Admin User',
                approvedDate: now,
                documents: {
                  pickList: true,
                  packingList: true,
                  gdn: true
                }
              }
            : req
        )
      );

      // Refresh dashboard counts
      fetchDashboardCounts();
      
      alert(`Requisition ${reqId} approved. Documents generated.`);
    } catch (error) {
      console.error('Error approving requisition:', error);
      alert('Failed to approve requisition. Please try again.');
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection.');
      return;
    }

    try {
      // Extract numeric ID from requisition ID (e.g., #REQ-1 -> 1)
      const numericId = rejectingRequisition.id.replace('#REQ-', '');
      
      // Call API to update requisition status
      await axios.post(`${BaseUrl}/requisitions/status/${numericId}`, {
        status: 'Rejected',
        reason: rejectionReason
      });
      
      // Update local state
      setRequisitions(
        requisitions.map(req =>
          req.id === rejectingRequisition.id
            ? {
                ...req,
                status: 'Rejected',
                rejectedBy: 'Admin User',
                rejectedDate: new Date().toLocaleDateString('en-GB'),
                rejectionReason: rejectionReason
              }
            : req
        )
      );

      // Refresh dashboard counts
      fetchDashboardCounts();
      
      setShowRejectModal(false);
      alert('Requisition rejected successfully.');
    } catch (error) {
      console.error('Error rejecting requisition:', error);
      alert('Failed to reject requisition. Please try again.');
    }
  };

  const downloadPDF = (docType, req) => {
    alert(`${docType} for ${req.id} is being generated...`);
    // Simulated download
    const element = document.createElement('a');
    element.href = '#';
    element.download = `${docType.replace(' ', '_')}_${req.id}.pdf`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
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
        <h2 className="fw-bold text-primary">All Requisitions (Admin)</h2>
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
          <button 
            className="btn btn-primary d-flex align-items-center text-nowrap" 
            onClick={openCreateModal}
          >
            <FaPlus className="me-2" /> Create Requisition
          </button>
        </div>
      </div>
      
      {/* Stats Cards — 4 COLUMN LAYOUT LIKE DASHBOARD */}
      <div className="row row-cols-1 row-cols-md-4 mb-4 g-3">
        <div className="col">
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
        <div className="col">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body bg-warning bg-opacity-10 p-4">
              <div className="d-flex align-items-center">
                <div className="bg-warning bg-opacity-25 rounded-circle p-3 me-3">
                  <FaEye size={24} className="text-warning" />
                </div>
                <div>
                  <h5 className="card-title text-warning fw-bold mb-0">{dashboardCounts.pending}</h5>
                  <p className="card-text text-muted">Awaiting Action</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body bg-success bg-opacity-10 p-4">
              <div className="d-flex align-items-center">
                <div className="bg-success bg-opacity-25 rounded-circle p-3 me-3">
                  <FaEye size={24} className="text-success" />
                </div>
                <div>
                  <h5 className="card-title text-success fw-bold mb-0">{dashboardCounts.approved}</h5>
                  <p className="card-text text-muted">Approved</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body bg-danger bg-opacity-10 p-4">
              <div className="d-flex align-items-center">
                <div className="bg-danger bg-opacity-25 rounded-circle p-3 me-3">
                  <FaEye size={24} className="text-danger" />
                </div>
                <div>
                  <h5 className="card-title text-danger fw-bold mb-0">{dashboardCounts.rejected}</h5>
                  <p className="card-text text-muted">Rejected</p>
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
              <button className="nav-link active">All Requisitions</button>
            </li>
          </ul>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table  mb-0">
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
                {loading ? (
                  <tr>
                    <td colSpan="9" className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRequisitions.map((req) => (
                    <tr key={req.id}>
                      <td>
                        <span className="fw-bold">
                          {req.id}
                        </span>
                      </td>
                      <td>{req.facility}</td>
                      <td>{req.department}</td>
                      <td>{req.requestedBy}</td>
                      <td>{req.date}</td>
                      <td>{req.items}</td>
                      <td><PriorityBadge priority={req.priority} /></td>
                      <td><StatusBadge status={req.status} /></td>
                      <td>
                        <div className="d-flex gap-1">
                          <button 
                            className="btn btn-sm btn-outline-primary" 
                            onClick={() => openViewModal(req)}
                          >
                            <FaEye />
                          </button>

                          {/* APPROVE BUTTON */}
                          {['Submitted', 'Pending Review'].includes(req.status) && (
                            <button 
                              className="btn btn-sm btn-success"
                              onClick={() => handleApprove(req.id)}
                              title="Approve Requisition"
                            >
                              Approve
                            </button>
                          )}

                          {/* REJECT BUTTON */}
                          {['Submitted', 'Pending Review'].includes(req.status) && (
                            <button 
                              className="btn btn-sm btn-danger"
                              onClick={() => openRejectModal(req)}
                              title="Reject Requisition"
                            >
                              Reject
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {!loading && filteredRequisitions.length === 0 && (
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
                      <label className="form-label fw-medium">Facility ID <span className="text-danger">*</span></label>
                      <input 
                        type="number" 
                        className="form-control form-control-lg"
                        name="facility_id"
                        value={newRequisition.facility_id}
                        onChange={handleInputChange}
                        placeholder="e.g. 1"
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
                        name="requested_by"
                        value={newRequisition.requested_by}
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
                      placeholder="List items and quantities (e.g. DRG-0421-10, DRG-0422-5)"
                    ></textarea>
                    <div className="form-text">Format: item_id-quantity (comma separated for multiple items)</div>
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
                {currentRequisition.details && currentRequisition.details.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-sm table-bordered">
                      <thead className="table-light">
                        <tr>
                          <th>Item ID</th>
                          <th>Quantity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentRequisition.details.map((item, index) => (
                          <tr key={index}>
                            <td>{item.item_id || item.name}</td>
                            <td>{item.qty || item.quantity} {item.unit || ''}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted fst-italic">No detailed items listed.</p>
                )}

                {/* Approval Info */}
                {currentRequisition.status === 'Approved' && (
                  <div className="alert alert-success mt-4">
                    <strong>Approved by:</strong> {currentRequisition.approvedBy} on {currentRequisition.approvedDate}
                  </div>
                )}

                {currentRequisition.status === 'Rejected' && (
                  <div className="alert alert-danger mt-4">
                    <strong>Rejected by:</strong> {currentRequisition.rejectedBy} on {currentRequisition.rejectedDate}
                    <br />
                    <strong>Reason:</strong> {currentRequisition.rejectionReason}
                  </div>
                )}

                {/* PDF Download Buttons */}
                {currentRequisition.status === 'Approved' && currentRequisition.documents && (
                  <div className="mt-4">
                    <h6 className="border-bottom pb-2 mb-3">Generated Documents:</h6>
                    <div className="d-grid gap-2 d-md-flex">
                      <button 
                        className="btn btn-outline-primary d-flex align-items-center justify-content-center" 
                        onClick={() => downloadPDF('Pick List', currentRequisition)}
                      >
                        <FaFilePdf className="me-2" /> Download Pick List
                      </button>
                      <button 
                        className="btn btn-outline-primary d-flex align-items-center justify-content-center" 
                        onClick={() => downloadPDF('Packing List', currentRequisition)}
                      >
                        <FaFilePdf className="me-2" /> Download Packing List
                      </button>
                      <button 
                        className="btn btn-outline-primary d-flex align-items-center justify-content-center" 
                        onClick={() => downloadPDF('GDN', currentRequisition)}
                      >
                        <FaFilePdf className="me-2" /> Download GDN
                      </button>
                    </div>
                  </div>
                )}
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

      {/* Reject Requisition Modal */}
      {showRejectModal && rejectingRequisition && (
        <div className="modal fade show d-block" tabIndex="-1" onClick={(e) => {
          if (e.target.classList.contains('modal')) setShowRejectModal(false);
        }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold">Reject Requisition</h5>
                <button type="button" className="btn-close" onClick={() => setShowRejectModal(false)}></button>
              </div>
              <div className="modal-body py-4">
                <p><strong>Requisition ID:</strong> {rejectingRequisition.id}</p>
                <p><strong>Facility:</strong> {rejectingRequisition.facility}</p>
                <div className="mb-3">
                  <label className="form-label fw-medium">Reason for Rejection <span className="text-danger">*</span></label>
                  <textarea 
                    className="form-control"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows="3"
                    placeholder="Please provide a detailed reason..."
                    required
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer border-top-0 pt-0">
                <button type="button" className="btn btn-secondary px-4" onClick={() => setShowRejectModal(false)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-danger px-4" onClick={handleReject}>
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Backdrop */}
      {(showCreateModal || showViewModal || showRejectModal) && (
        <div className="modal-backdrop fade show"></div>
      )}

      {/* HOVER EFFECT CSS — SAME AS WAREHOUSE DASHBOARD */}
      <style jsx>{`
        .card {
          transition: all 0.3s ease;
        }
        .card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.08) !important;
        }
      `}</style>
    </div>
  );
};

export default WarehouseRequisitions;