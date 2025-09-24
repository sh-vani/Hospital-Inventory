import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FaPlus, FaSearch, FaCheck, FaTimes, FaEye,
  FaExclamationTriangle, FaExclamationCircle
} from 'react-icons/fa';
import BaseUrl from '../../Api/BaseUrl';
import axiosInstance from '../../Api/axiosInstance';

const SuperAdminRequisitions = () => {
  // State for search
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for loading and error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // State for active tab
  const [activeTab, setActiveTab] = useState('Pending');

  // State for requisitions
  const [requisitions, setRequisitions] = useState([]);

  // Fetch requisitions from API
  useEffect(() => {
    const fetchRequisitions = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`${BaseUrl}/requisition/superadmin`);
        
        // Transform API data to match component format
        const transformedData = response.data.data.map(item => {
          // Parse items JSON string
          let itemsArray = [];
          try {
            itemsArray = JSON.parse(item.items);
          } catch (e) {
            console.error("Error parsing items JSON:", e);
          }
          
          // Format date
          const createdDate = new Date(item.created_at);
          const formattedDate = createdDate.toLocaleDateString('en-GB', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
          });
          
          // Generate requisition ID
          const requisitionId = `#REQ-${item.id.toString().padStart(4, '0')}`;
          
          // Count items
          const itemsCount = itemsArray.length > 0 
            ? `${itemsArray.length} item${itemsArray.length !== 1 ? 's' : ''}` 
            : '0 items';
          
          return {
            id: requisitionId,
            originalId: item.id, // Store original ID for API operations
            facility: item.facility_name || `Facility ${item.facility_id}`,
            department: item.department,
            requestedBy: item.requested_by,
            date: formattedDate,
            items: itemsCount,
            priority: item.priority,
            status: item.status,
            reason: item.reason,
            details: itemsArray.map(i => ({
              name: i.item_id,
              quantity: i.qty,
              unit: 'pcs' // Default unit since not provided in API
            })),
            rejectionReason: item.status === 'Rejected' || item.status === 'Rejecte Requisition' 
              ? 'No reason provided' 
              : undefined
          };
        });
        
        setRequisitions(transformedData);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch requisitions data');
        setLoading(false);
        console.error('Error fetching requisitions:', err);
      }
    };

    fetchRequisitions();
  }, []);

  // Filter by tab
  const filteredRequisitions = requisitions.filter(req => {
    if (activeTab === 'Pending') {
      return req.status === 'Pending Review' || req.status === 'Partially Approved';
    } else if (activeTab === 'Approved') {
      return req.status === 'Approved';
    } else if (activeTab === 'Rejected') {
      return req.status === 'Rejected' || req.status === 'Rejecte Requisition';
    } else {
      return true;
    }
  });

  // Badges (Bootstrap only)
  const PriorityBadge = ({ priority }) => {
    const map = { High: 'bg-danger', Medium: 'bg-warning text-dark', Low: 'bg-success' };
    return <span className={`badge ${map[priority] || 'bg-secondary'}`}>{priority}</span>;
  };

  const StatusBadge = ({ status }) => {
    const map = {
      'Pending Review': 'bg-warning text-dark',
      'Partially Approved': 'bg-info text-dark',
      'Approved': 'bg-success',
      'Rejected': 'bg-danger',
      'Rejecte Requisition': 'bg-danger'
    };
    return <span className={`badge ${map[status] || 'bg-secondary'}`}>{status}</span>;
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
  const openViewModal = (req) => { setCurrentRequisition(req); setShowViewModal(true); };
  const openApproveModal = (req) => { setCurrentRequisition(req); setShowApproveModal(true); };
  const openRejectModal = (req) => { setCurrentRequisition(req); setRejectionReason(''); setShowRejectModal(true); };

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRequisition(prev => ({ ...prev, [name]: value }));
  };
  const handleRejectionReasonChange = (e) => setRejectionReason(e.target.value);

  // Actions
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
      details: []
    };
    setRequisitions([newItem, ...requisitions]);
    setShowCreateModal(false);
  };
  const handleApproveRequisition = () => {
    setRequisitions(prev => prev.map(r => r.id === currentRequisition.id ? { ...r, status: 'Approved' } : r));
    setShowApproveModal(false);
  };
  const handleRejectRequisition = () => {
    setRequisitions(prev => prev.map(r => r.id === currentRequisition.id ? { ...r, status: 'Rejected', rejectionReason } : r));
    setShowRejectModal(false);
  };

  // Filtered for list rendering on mobile
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

  // Calculate summary counts
  const urgentCount = requisitions.filter(r => r.priority === 'High' && (r.status === 'Pending Review' || r.status === 'Partially Approved')).length;
  const pendingCount = requisitions.filter(r => r.status === 'Pending Review' || r.status === 'Partially Approved').length;
  const approvedCount = requisitions.filter(r => r.status === 'Approved').length;

  return (
    <div className="container-fluid py-3">
      {/* ===== Top Toolbar ===== */}
      {/* Mobile-first: stack; md+ align horizontally */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center gap-2 mb-4">
        <h2 className="fw-bold mb-0">Requisitions Management</h2>

        <div className="d-flex flex-column flex-sm-row align-items-stretch gap-2 w-100 w-md-auto">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              style={{height: "40px"}}
              placeholder="Search requisitions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search requisitions"
            />
            <button className="btn btn-outline-secondary" style={{height: "40px"}} type="button" aria-label="Search">
              <FaSearch />
            </button>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading requisitions data...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* ===== Summary Cards ===== */}
      {!loading && !error && (
        <div className="row row-cols-1 row-cols-md-3 g-3 mb-4">
          <div className="col">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body bg-danger bg-opacity-10 p-4">
                <div className="d-flex align-items-center mb-2">
                  <FaExclamationCircle className="text-danger me-2" size={24} />
                  <h5 className="card-title text-danger fw-bold mb-0">Urgent</h5>
                </div>
                <p className="card-text text-muted ms-4 mb-0">{urgentCount} requisitions need immediate attention</p>
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
                <p className="card-text text-muted ms-4 mb-0">{pendingCount} requisitions awaiting approval</p>
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
                <p className="card-text text-muted ms-4 mb-0">{approvedCount} requisitions approved this week</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== Tabs ===== */}
      {!loading && !error && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-white border-0 pt-3">
            {/* Horizontal scroll if overflow on tiny screens (Bootstrap utilities) */}
            <div className="overflow-auto">
              <ul className="nav nav-tabs card-header-tabs flex-nowrap">
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'Pending' ? 'active' : ''}`}
                    onClick={() => setActiveTab('Pending')}
                  >
                    Pending
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'Approved' ? 'active' : ''}`}
                    onClick={() => setActiveTab('Approved')}
                  >
                    Approved
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'Rejected' ? 'active' : ''}`}
                    onClick={() => setActiveTab('Rejected')}
                  >
                    Rejected
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'All' ? 'active' : ''}`}
                    onClick={() => setActiveTab('All')}
                  >
                    All Requisitions
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* ===== Data Views ===== */}
          <div className="card-body p-0">
            {/* (A) TABLE for md and up */}
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
                    <th className="text-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBySearch.map((req, i) => (
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
                        <div className="btn-group" role="group" aria-label="Row actions">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => openViewModal(req)}
                            title="View"
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

            {/* (B) CARD LIST for small screens */}
            {/* Visible only below md */}
            <div className="d-block d-md-none p-2">
              <div className="row g-2">
                {filteredBySearch.map((req, i) => (
                  <div className="col-12" key={i}>
                    <div className="card">
                      <div className="card-body">
                        {/* Top line: ID + Status */}
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="fw-bold">{req.id}</span>
                          <StatusBadge status={req.status} />
                        </div>

                        {/* Meta grid */}
                        <div className="row g-2 small">
                          <div className="col-6">
                            <div className="text-muted">Facility</div>
                            <div>{req.facility}</div>
                          </div>
                          <div className="col-6">
                            <div className="text-muted">Department</div>
                            <div>{req.department}</div>
                          </div>
                          <div className="col-6">
                            <div className="text-muted">Requested By</div>
                            <div>{req.requestedBy}</div>
                          </div>
                          <div className="col-6">
                            <div className="text-muted">Date</div>
                            <div>{req.date}</div>
                          </div>
                          <div className="col-6">
                            <div className="text-muted">Items</div>
                            <div>{req.items}</div>
                          </div>
                          <div className="col-6">
                            <div className="text-muted">Priority</div>
                            <div><PriorityBadge priority={req.priority} /></div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="d-flex gap-2 mt-3">
                          <button
                            className="btn btn-outline-primary flex-fill"
                            onClick={() => openViewModal(req)}
                          >
                            <FaEye className="me-1" /> View
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredBySearch.length === 0 && (
                  <div className="col-12">
                    <div className="alert alert-light border text-center mb-0">
                      No requisitions found.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== View Modal ===== */}
      {showViewModal && currentRequisition && (
        <div className="modal show d-block" tabIndex="-1" role="dialog" aria-modal="true">
          <div className="modal-dialog modal-lg modal-dialog-scrollable modal-fullscreen-sm-down">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Requisition Details: {currentRequisition.id}</h5>
                <button type="button" className="btn-close" onClick={() => setShowViewModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row g-3 mb-2">
                  <div className="col-12 col-md-6">
                    <p className="mb-1"><strong>Facility:</strong> {currentRequisition.facility}</p>
                    <p className="mb-1"><strong>Department:</strong> {currentRequisition.department}</p>
                    <p className="mb-1"><strong>Requested By:</strong> {currentRequisition.requestedBy}</p>
                  </div>
                  <div className="col-12 col-md-6">
                    <p className="mb-1"><strong>Date:</strong> {currentRequisition.date}</p>
                    <p className="mb-1"><strong>Priority:</strong> <PriorityBadge priority={currentRequisition.priority} /></p>
                    <p className="mb-1"><strong>Status:</strong> <StatusBadge status={currentRequisition.status} /></p>
                  </div>
                </div>

                <h6 className="mt-3">Items Requested</h6>
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Item ID</th>
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

                {currentRequisition.reason && (
                  <div className="mt-3">
                    <h6>Reason for Requisition</h6>
                    <p>{currentRequisition.reason}</p>
                  </div>
                )}

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

      {/* Backdrop */}
      {(showViewModal) && (
        <div className="modal-backdrop show"></div>
      )}
    </div>
  );
};

export default SuperAdminRequisitions;