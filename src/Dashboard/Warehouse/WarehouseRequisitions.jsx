import React, { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import axios from 'axios';
import BaseUrl from '../../Api/BaseUrl';
import axiosInstance from '../../Api/axiosInstance';

const WarehouseRequisitions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showPartialApproveModal, setShowPartialApproveModal] = useState(false);
  const [currentRequisition, setCurrentRequisition] = useState(null);
  const [currentItem, setCurrentItem] = useState(null);
  const [rejectingRequisition, setRejectingRequisition] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [approveQty, setApproveQty] = useState('');
  const [remarks, setRemarks] = useState('');
  const [partialApproveQty, setPartialApproveQty] = useState('');
  const [partialRemarks, setPartialRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [requisitions, setRequisitions] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  // Fetch requisitions from API
  const fetchRequisitions = async (page = 1) => {
    setLoading(true);
    try {
      const response = await axios.get(`${BaseUrl}/requisitions?page=${page}`);
      if (response.data.success) {
        // ✅ Use real items from API — no mock data
        const requisitionsData = response.data.data.map(req => ({
          ...req,
          // Ensure items exist; if not, fallback to empty array
          items: Array.isArray(req.items) ? req.items : []
        }));

        setRequisitions(requisitionsData);
        setPagination({
          currentPage: page,
          totalPages: Math.ceil(response.data.total / 10) || 1, // ✅ Use actual total from API
          totalItems: response.data.total || response.data.data.length,
          itemsPerPage: 10
        });
      } else {
        setError('Failed to fetch requisitions');
      }
    } catch (err) {
      setError('Error fetching requisitions: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequisitions();
  }, []);

  const StatusBadge = ({ status }) => {
    const statusColors = {
      pending: 'bg-warning',
      approved: 'bg-success',
      rejected: 'bg-danger',
      dispatched: 'bg-info',
      'partially approved': 'bg-info'
    };
    return (
      <span className={`badge ${statusColors[status?.toLowerCase()] || 'bg-secondary'} text-dark`}>
        {status || 'Unknown'}
      </span>
    );
  };

  const openApproveModal = (req, item) => {
    setCurrentRequisition(req);
    setCurrentItem(item);
    setApproveQty(item.quantity?.toString() || '0');
    setRemarks('');
    setShowApproveModal(true);
  };

  const openPartialApproveModal = (req, item) => {
    setCurrentRequisition(req);
    setCurrentItem(item);
    setPartialApproveQty(item.quantity?.toString() || '0');
    setPartialRemarks('');
    setShowPartialApproveModal(true);
  };

  const openRejectModal = (req) => {
    setRejectingRequisition(req);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const userId = JSON.parse(localStorage.getItem("user"))?.id;

  const handleApproveSubmit = async () => {
    if (!currentRequisition || !currentItem) return;

    setLoading(true);
    try {
      const payload = {
        items: [
          {
            item_id: currentItem.item_id,
            approved_quantity: parseInt(approveQty) || 0
          }
        ],
        remarks: remarks || 'Approved without remarks',
        userId: userId
      };

      const response = await axiosInstance.patch(`/requisitions/${currentRequisition.id}/approve`, payload);

      if (response.data.success) {
        setRequisitions(requisitions.map(req => {
          if (req.id === currentRequisition.id) {
            const updatedItems = req.items.map(item =>
              item.item_id === currentItem.item_id
                ? { ...item, approved_quantity: parseInt(approveQty) || 0 }
                : item
            );
            return { ...req, status: 'approved', items: updatedItems };
          }
          return req;
        }));
        setShowApproveModal(false);
      } else {
        setError(response.data.message || 'Failed to approve requisition');
      }
    } catch (err) {
      setError('Error approving requisition: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handlePartialApproveSubmit = async () => {
    if (!currentRequisition || !currentItem || !partialApproveQty || parseInt(partialApproveQty) <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        items: [
          {
            item_id: currentItem.item_id,
            approved_quantity: parseInt(partialApproveQty)
          }
        ],
        remarks: partialRemarks || 'Partially approved without remarks'
      };

      const response = await axios.patch(`${BaseUrl}/requisitions/${currentRequisition.id}/approve`, payload);

      if (response.data.success) {
        setRequisitions(requisitions.map(req => {
          if (req.id === currentRequisition.id) {
            const updatedItems = req.items.map(item =>
              item.item_id === currentItem.item_id
                ? { ...item, approved_quantity: parseInt(partialApproveQty) }
                : item
            );
            return { ...req, status: 'partially approved', items: updatedItems };
          }
          return req;
        }));
        setShowPartialApproveModal(false);
      } else {
        setError(response.data.message || 'Failed to partially approve requisition');
      }
    } catch (err) {
      setError('Error partially approving requisition: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const user_Id = JSON.parse(localStorage.getItem("user"))?.id;
  const handleReject = async () => {
    if (!rejectingRequisition || !rejectionReason.trim()) {
      alert('Please provide a reason for rejection.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        remarks: rejectionReason,
        user_Id: user_Id,
        items: rejectingRequisition.items.map(item => ({
          item_id: item.item_id,
          approved_quantity: 0
        }))
      };

      const response = await axios.put(`${BaseUrl}/requisitions/${rejectingRequisition.id}/reject`, payload);

      if (response.data.success) {
        setRequisitions(requisitions.map(req =>
          req.id === rejectingRequisition.id
            ? { ...req, status: 'rejected' }
            : req
        ));
        setShowRejectModal(false);
      } else {
        setError(response.data.message || 'Failed to reject requisition');
      }
    } catch (err) {
      setError('Error rejecting requisition: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const filteredRequisitions = requisitions.filter(req =>
    req.id?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.facility_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchRequisitions(page);
    }
  };

  return (
    <div className="container-fluid py-4">
      {/* Error Alert */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}

      {/* Loading Spinner */}
      {loading && (
        <div className="d-flex justify-content-center my-3">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-primary">Requisitions (From Facilities)</h2>
        <div className="input-group" style={{ maxWidth: '300px' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search requisitions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="btn btn-outline-secondary">
            <FaSearch />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row row-cols-1 row-cols-md-4 mb-4 g-3">
        {['Pending', 'Approved', 'Rejected', 'Dispatched'].map(status => (
          <div className="col" key={status}>
            <div className="card border-0 shadow-sm h-100">
              <div className={`card-body bg-${status === 'Pending' ? 'warning' : status === 'Approved' ? 'success' : status === 'Rejected' ? 'danger' : 'info'} bg-opacity-10 p-4`}>
                <div className="d-flex align-items-center">
                  <div className={`bg-${status === 'Pending' ? 'warning' : status === 'Approved' ? 'success' : status === 'Rejected' ? 'danger' : 'info'} bg-opacity-25 rounded-circle p-3 me-3`}>
                    <FaSearch size={24} className={`text-${status === 'Pending' ? 'warning' : status === 'Approved' ? 'success' : status === 'Rejected' ? 'danger' : 'info'}`} />
                  </div>
                  <div>
                    <h5 className={`card-title text-${status === 'Pending' ? 'warning' : status === 'Approved' ? 'success' : status === 'Rejected' ? 'danger' : 'info'} fw-bold mb-0`}>
                      {requisitions.filter(r => r.status?.toLowerCase() === status.toLowerCase()).length}
                    </h5>
                    <p className="card-text text-muted">{status} Requests</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table mb-0">
              <thead className="bg-light">
                <tr>
                  <th>Req ID</th>
                  <th>Facility</th>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequisitions.length > 0 ? (
                  filteredRequisitions.map((req, index) =>
                    req.items && req.items.length > 0 ? (
                      req.items.map((item, idx) => (
                        <tr key={`${req.id}-${item.item_id || idx}`}>
                          <td>{req.id}</td>
                          <td>{req.facility_name || 'N/A'}</td>
                          <td>{item.item_name || 'N/A'}</td>
                          <td>{item.quantity || 0} {item.unit || ''}</td>
                          <td><StatusBadge status={req.status} /></td>
                          <td className="d-flex gap-1">
                            {/* ✅ Show actions ONLY if status is 'pending' */}
                            {req.status?.toLowerCase() === 'pending' && (
                              <>
                                <button
                                  className="btn btn-sm btn-success"
                                  onClick={() => openApproveModal(req, item)}
                                  disabled={loading}
                                >
                                  Approve
                                </button>
                                <button
                                  className="btn btn-sm btn-warning"
                                  onClick={() => openPartialApproveModal(req, item)}
                                  disabled={loading}
                                >
                                  Partial Approve
                                </button>
                                <button
                                  className="btn btn-sm btn-danger"
                                  onClick={() => openRejectModal(req)}
                                  disabled={loading}
                                >
                                  Reject
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr key={req.id}>
                        <td>{req.id}</td>
                        <td>{req.facility_name || 'N/A'}</td>
                        <td colSpan="2" className="text-muted">No items</td>
                        <td><StatusBadge status={req.status} /></td>
                        <td className="d-flex gap-1">
                          {req.status?.toLowerCase() === 'pending' && (
                            <span className="text-muted">No actions</span>
                          )}
                        </td>
                      </tr>
                    )
                  )
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      {loading ? 'Loading...' : 'No requisitions found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="d-flex justify-content-between align-items-center mt-3">
        <div>
          Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
          {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
          {pagination.totalItems} entries
        </div>
        <div className="btn-group" role="group">
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1 || loading}
          >
            Previous
          </button>
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages || loading}
          >
            Next
          </button>
        </div>
      </div>

      {/* Approve Modal */}
      {showApproveModal && currentRequisition && currentItem && (
        <div className="modal fade show d-block" tabIndex="-1" onClick={(e) => {
          if (e.target.classList.contains('modal')) setShowApproveModal(false);
        }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Approve Requisition</h5>
                <button type="button" className="btn-close" onClick={() => setShowApproveModal(false)}></button>
              </div>
              <div className="modal-body">
                <p><strong>Requisition ID:</strong> #{currentRequisition.id}</p>
                <p><strong>Facility Name:</strong> {currentRequisition.facility_name}</p>
                <p><strong>Item Name:</strong> {currentItem.item_name}</p>
                <p><strong>Requested Qty:</strong> {currentItem.quantity} {currentItem.unit}</p>

                <div className="mb-3">
                  <label className="form-label">Approve Qty</label>
                  <input
                    type="number"
                    className="form-control"
                    value={approveQty}
                    onChange={(e) => setApproveQty(e.target.value)}
                    max={currentItem.quantity}
                    min="1"
                  />
                  <small className="text-muted">Maximum: {currentItem.quantity} {currentItem.unit}</small>
                </div>
                <div className="mb-3">
                  <label className="form-label">Remarks</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowApproveModal(false)} disabled={loading}>Cancel</button>
                <button className="btn btn-success" onClick={handleApproveSubmit} disabled={loading}>
                  {loading ? 'Processing...' : 'Submit'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Partial Approve Modal */}
      {showPartialApproveModal && currentRequisition && currentItem && (
        <div className="modal fade show d-block" tabIndex="-1" onClick={(e) => {
          if (e.target.classList.contains('modal')) setShowPartialApproveModal(false);
        }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Partially Approve Requisition</h5>
                <button type="button" className="btn-close" onClick={() => setShowPartialApproveModal(false)}></button>
              </div>
              <div className="modal-body">
                <p><strong>Requisition ID:</strong> #{currentRequisition.id}</p>
                <p><strong>Facility Name:</strong> {currentRequisition.facility_name}</p>
                <p><strong>Item Name:</strong> {currentItem.item_name}</p>
                <p><strong>Requested Qty:</strong> {currentItem.quantity} {currentItem.unit}</p>

                <div className="mb-3">
                  <label className="form-label">Approve Qty <span className="text-danger">*</span></label>
                  <input
                    type="number"
                    className="form-control"
                    value={partialApproveQty}
                    onChange={(e) => setPartialApproveQty(e.target.value)}
                    max={currentItem.quantity}
                    min="1"
                  />
                  <small className="text-muted">Maximum: {currentItem.quantity} {currentItem.unit}</small>
                </div>
                <div className="mb-3">
                  <label className="form-label">Remarks</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={partialRemarks}
                    onChange={(e) => setPartialRemarks(e.target.value)}
                    placeholder="Reason for partial approval"
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowPartialApproveModal(false)} disabled={loading}>Cancel</button>
                <button className="btn btn-warning" onClick={handlePartialApproveSubmit} disabled={loading}>
                  {loading ? 'Processing...' : 'Partially Approve'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && rejectingRequisition && (
        <div className="modal fade show d-block" tabIndex="-1" onClick={(e) => {
          if (e.target.classList.contains('modal')) setShowRejectModal(false);
        }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Reject Requisition</h5>
                <button type="button" className="btn-close" onClick={() => setShowRejectModal(false)}></button>
              </div>
              <div className="modal-body">
                <p><strong>Requisition ID:</strong> #{rejectingRequisition.id}</p>
                <p><strong>Facility Name:</strong> {rejectingRequisition.facility_name}</p>
                <div className="mb-3">
                  <label className="form-label">Reason for rejection <span className="text-danger">*</span></label>
                  <textarea
                    className="form-control"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows="3"
                    placeholder="Please provide a reason for rejection"
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowRejectModal(false)} disabled={loading}>Cancel</button>
                <button className="btn btn-danger" onClick={handleReject} disabled={loading}>
                  {loading ? 'Processing...' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Backdrop */}
      {(showApproveModal || showPartialApproveModal || showRejectModal) && (
        <div className="modal-backdrop fade show"></div>
      )}
    </div>
  );
};

export default WarehouseRequisitions;