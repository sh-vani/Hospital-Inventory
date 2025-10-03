import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FaSearch, FaEye, FaExchangeAlt
} from 'react-icons/fa';
import BaseUrl from '../../Api/BaseUrl';
import axiosInstance from '../../Api/axiosInstance';

const SuperAdminRequisitions = () => {
  // === STATE ===
  const [requisitions, setRequisitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('Pending');
  const [showViewModal, setShowViewModal] = useState(false);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [currentRequisition, setCurrentRequisition] = useState(null);
  const [overrideStatus, setOverrideStatus] = useState('');
  const [overrideRemarks, setOverrideRemarks] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  // === FETCH REQUISITIONS ===
  const fetchRequisitions = async (status = 'pending', page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get(`${BaseUrl}/requisitions?page=${page}&limit=10&status=${status}`);
      if (response.data.success) {
        setRequisitions(response.data.data);
        setPagination(response.data.data);
      } else {
        setError('Failed to fetch requisitions');
      }
    } catch (err) {
      setError('Error fetching requisitions: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // === UPDATE REQUISITION STATUS ===
  const updateRequisitionStatus = async (id, status, remarks) => {
    try {
      setUpdatingStatus(true);
      const response = await axiosInstance.put(`${BaseUrl}/requisitions/${id}`, {
        status,
        remarks
      });
      
      if (response.data.success) {
        // Refresh requisitions based on active tab
        let statusParam = 'pending';
        if (activeTab === 'Approved') statusParam = 'approved';
        else if (activeTab === 'Rejected') statusParam = 'rejected';
        
        fetchRequisitions(statusParam, pagination.currentPage);
        setShowOverrideModal(false);
        alert(`Status updated successfully to: ${status}`);
      } else {
        alert('Failed to update status');
      }
    } catch (err) {
      alert('Error updating status: ' + err.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // === INITIAL LOAD ===
  useEffect(() => {
    fetchRequisitions('pending', 1);
  }, []);

  // === HANDLE TAB CHANGE ===
  useEffect(() => {
    let statusParam = 'pending';
    if (activeTab === 'Approved') statusParam = 'approved';
    else if (activeTab === 'Rejected') statusParam = 'rejected';
    else if (activeTab === 'All') statusParam = '';
    
    fetchRequisitions(statusParam, 1);
  }, [activeTab]);

  // === FILTER LOGIC ===
  const filteredRequisitions = requisitions.filter(req => {
    if (activeTab === 'Pending') {
      return req.status === 'pending';
    } else if (activeTab === 'Approved') {
      return req.status === 'approved';
    } else if (activeTab === 'Rejected') {
      return req.status === 'rejected';
    } else {
      return true;
    }
  });

  const filteredBySearch = filteredRequisitions.filter(r => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return (
      r.id.toString().toLowerCase().includes(q) ||
      r.facility_name.toLowerCase().includes(q) ||
      (r.items && r.items.length > 0 && r.items[0].item_name.toLowerCase().includes(q)) ||
      r.status.toLowerCase().includes(q)
    );
  });

  // === BADGES ===
  const StatusBadge = ({ status }) => {
    const map = {
      'pending': 'bg-warning text-dark',
      'processing': 'bg-info text-dark',
      'approved': 'bg-success',
      'rejected': 'bg-danger'
    };
    const displayStatus = status.charAt(0).toUpperCase() + status.slice(1);
    return <span className={`badge ${map[status] || 'bg-secondary'}`}>{displayStatus}</span>;
  };

  // === MODAL HANDLERS ===
  const openViewModal = (req) => {
    setCurrentRequisition(req);
    setShowViewModal(true);
  };

  const openOverrideModal = (req) => {
    setCurrentRequisition(req);
    setOverrideStatus(req.status);
    setOverrideRemarks(req.remarks || '');
    setShowOverrideModal(true);
  };

  // === ACTION HANDLERS ===
  const handleOverrideStatus = () => {
    if (!overrideStatus.trim()) return;
    updateRequisitionStatus(currentRequisition.id, overrideStatus, overrideRemarks);
  };

  // === PAGINATION HANDLER ===
  const handlePageChange = (page) => {
    let statusParam = 'pending';
    if (activeTab === 'Approved') statusParam = 'approved';
    else if (activeTab === 'Rejected') statusParam = 'rejected';
    
    fetchRequisitions(statusParam, page);
  };

  // === LOADING STATE ===
  if (loading && requisitions.length === 0) {
    return (
      <div className="container-fluid py-3">
        <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  // === ERROR STATE ===
  if (error && requisitions.length === 0) {
    return (
      <div className="container-fluid py-3">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-3">
      {/* ===== Top Toolbar ===== */}
      <div className="d-flex flex-row flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <h2 className="fw-bold mb-0">Requisitions (Global)</h2>
        <div className="ms-auto" style={{ maxWidth: '300px', width: '100%' }}>
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
        </div>
      </div>
      
      {/* ===== Summary Cards ===== */}
      <div className="row row-cols-1 row-cols-md-3 g-3 mb-4">
        <div className="col">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body bg-warning bg-opacity-10 p-4">
              <div className="d-flex align-items-center mb-2">
                <FaEye className="text-warning me-2" size={24} />
                <h5 className="card-title text-warning fw-bold mb-0">Pending</h5>
              </div>
              <p className="card-text text-muted ms-4 mb-0">
                {requisitions.filter(r => r.status === 'pending').length} requisitions need review
              </p>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body bg-success bg-opacity-10 p-4">
              <div className="d-flex align-items-center mb-2">
                <FaEye className="text-success me-2" size={24} />
                <h5 className="card-title text-success fw-bold mb-0">Approved</h5>
              </div>
              <p className="card-text text-muted ms-4 mb-0">
                {requisitions.filter(r => r.status === 'approved').length} approved
              </p>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body bg-danger bg-opacity-10 p-4">
              <div className="d-flex align-items-center mb-2">
                <FaEye className="text-danger me-2" size={24} />
                <h5 className="card-title text-danger fw-bold mb-0">Rejected</h5>
              </div>
              <p className="card-text text-muted ms-4 mb-0">
                {requisitions.filter(r => r.status === 'rejected').length} rejected
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
                  <th>Req ID</th>
                  <th>Facility</th>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Status</th>
                  <th>Raised On</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBySearch.length === 0 ? (
                  <tr><td colSpan="7" className="text-center">No requisitions found.</td></tr>
                ) : (
                  filteredBySearch.map((req, i) => (
                    <tr key={i}>
                      <td className="fw-bold">{i+1}</td>
                      <td>{req.facility_name}</td>
                      <td>{req.items && req.items.length > 0 ? req.items[0].item_name : 'N/A'}</td>
                      <td>{req.total_quantity}</td>
                      <td><StatusBadge status={req.status} /></td>
                      <td>{new Date(req.created_at).toLocaleDateString()}</td>
                      <td>
                        <div className="btn-group" role="group">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => openViewModal(req)}
                          >
                            <FaEye /> View Detail
                          </button>
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => openOverrideModal(req)}
                          >
                            <FaExchangeAlt /> Override
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
                          <span className="fw-bold">#{req.id}</span>
                          <StatusBadge status={req.status} />
                        </div>
                        <div className="row g-2 small">
                          <div className="col-6"><div className="text-muted">Facility</div><div>{req.facility_name}</div></div>
                          <div className="col-6"><div className="text-muted">Item</div><div>{req.items && req.items.length > 0 ? req.items[0].item_name : 'N/A'}</div></div>
                          <div className="col-6"><div className="text-muted">Qty</div><div>{req.total_quantity}</div></div>
                          <div className="col-6"><div className="text-muted">Raised On</div><div>{new Date(req.created_at).toLocaleDateString()}</div></div>
                        </div>
                        <div className="d-flex gap-2 mt-3">
                          <button className="btn btn-outline-primary flex-fill" onClick={() => openViewModal(req)}>
                            <FaEye className="me-1" /> View Detail
                          </button>
                          <button className="btn btn-outline-secondary flex-fill" onClick={() => openOverrideModal(req)}>
                            <FaExchangeAlt className="me-1" /> Override
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* PAGINATION */}
          {pagination.totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center p-3 border-top">
              <div>
                Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems} entries
              </div>
              <div className="btn-group" role="group">
                <button 
                  className="btn btn-outline-secondary" 
                  disabled={pagination.currentPage === 1}
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                >
                  Previous
                </button>
                <button className="btn btn-outline-secondary" disabled>
                  Page {pagination.currentPage} of {pagination.totalPages}
                </button>
                <button 
                  className="btn btn-outline-secondary" 
                  disabled={pagination.currentPage === pagination.totalPages}
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===== VIEW MODAL ===== */}
      {showViewModal && currentRequisition && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Requisition Details: #{currentRequisition.id}</h5>
                <button type="button" className="btn-close" onClick={() => setShowViewModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <p><strong>Facility:</strong> {currentRequisition.facility_name}</p>
                    <p><strong>Location:</strong> {currentRequisition.facility_location}</p>
                    <p><strong>Raised By:</strong> {currentRequisition.user_name}</p>
                    <p><strong>Email:</strong> {currentRequisition.user_email}</p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>Raised On:</strong> {new Date(currentRequisition.created_at).toLocaleDateString()}</p>
                    <p><strong>Status:</strong> <StatusBadge status={currentRequisition.status} /></p>
                    <p><strong>Priority:</strong> {currentRequisition.priority}</p>
                    <p><strong>Total Items:</strong> {currentRequisition.item_count}</p>
                  </div>
                </div>
                {currentRequisition.remarks && (
                  <div className="mb-3">
                    <p><strong>Remarks:</strong> {currentRequisition.remarks}</p>
                  </div>
                )}
                <h6 className="mt-3">All Items Requested</h6>
                <table className="table table-sm">
                  <thead><tr><th>Item</th><th>Code</th><th>Qty</th><th>Unit</th><th>Priority</th></tr></thead>
                  <tbody>
                    {currentRequisition?.items?.map((item, i) => (
                      <tr key={i}>
                        <td>{item.item_name}</td>
                        <td>{item.item_code}</td>
                        <td>{item.quantity}</td>
                        <td>{item.unit}</td>
                        <td><span className={`badge ${item.priority === 'high' ? 'bg-danger' : 'bg-info'}`}>{item.priority}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowViewModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== OVERRIDE STATUS MODAL ===== */}
      {showOverrideModal && currentRequisition && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Override Status</h5>
                <button type="button" className="btn-close" onClick={() => setShowOverrideModal(false)}></button>
              </div>
              <div className="modal-body">
                <p>Override status for requisition <strong>#{currentRequisition.id}</strong></p>
                <div className="mb-3">
                  <label className="form-label">New Status</label>
                  <select
                    className="form-select"
                    value={overrideStatus}
                    onChange={(e) => setOverrideStatus(e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Remarks</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={overrideRemarks}
                    onChange={(e) => setOverrideRemarks(e.target.value)}
                    placeholder="Enter remarks for this status change..."
                  ></textarea>
                </div>
                <div className="alert alert-warning">
                  <strong>Note:</strong> This will bypass normal approval workflow. Use only when necessary.
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowOverrideModal(false)}>Cancel</button>
                <button 
                  className="btn btn-primary" 
                  onClick={handleOverrideStatus}
                  disabled={updatingStatus}
                >
                  {updatingStatus ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Updating...
                    </>
                  ) : 'Confirm Override'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {(showViewModal || showOverrideModal) && (
        <div className="modal-backdrop show"></div>
      )}
    </div>
  );
};

export default SuperAdminRequisitions;