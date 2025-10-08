import React, { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import axiosInstance from '../../Api/axiosInstance';

const WarehouseRequisitions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [currentRequisition, setCurrentRequisition] = useState(null);
  const [rejectingRequisition, setRejectingRequisition] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [approveQuantities, setApproveQuantities] = useState({});
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [requisitions, setRequisitions] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  const userId = JSON.parse(localStorage.getItem("user"))?.id;

  // Fetch requisitions
  const fetchRequisitions = async (page = 1) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/requisitions?page=${page}`);
      if (response.data.success) {
        const requisitionsData = response.data.data.map(req => ({
          ...req,
          items: Array.isArray(req.items) ? req.items : []
        }));

        setRequisitions(requisitionsData);
        setPagination({
          currentPage: page,
          totalPages: Math.ceil(response.data.total / 10) || 1,
          totalItems: response.data.total || 0,
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
      pending: 'bg-warning text-white',
      approved: 'bg-success text-white',
      rejected: 'bg-danger text-white',
      dispatched: 'bg-info text-white',
      'partially approved': 'bg-primary text-white'
    };
    return (
      <span className={`badge ${statusColors[status?.toLowerCase()] || 'bg-secondary text-white'}`}>
        {status || 'Unknown'}
      </span>
    );
  };

  // Open modal for bulk approval (all items in requisition)
  const openBulkApproveModal = (req) => {
    const initialQuantities = {};
    req.items.forEach(item => {
      initialQuantities[item.item_id] = item.quantity || 0;
    });
    setApproveQuantities(initialQuantities);
    setCurrentRequisition(req);
    setRemarks('');
    setShowApproveModal(true);
  };

  const openRejectModal = (req) => {
    setRejectingRequisition(req);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  // Handle bulk approval
  const handleApproveSubmit = async () => {
    if (!currentRequisition) return;

    setLoading(true);
    try {
      const items = currentRequisition.items.map(item => ({
        item_id: item.item_id,
        approved_quantity: parseInt(approveQuantities[item.item_id]) || 0
      }));

      const payload = {
        items,
        remarks: remarks || 'Approved without remarks',
        userId
      };

      const response = await axiosInstance.patch(`/requisitions/${currentRequisition.id}/approve`, payload);

      if (response.data.success) {
        setRequisitions(prev => prev.map(req => {
          if (req.id === currentRequisition.id) {
            const updatedItems = req.items.map(item => ({
              ...item,
              approved_quantity: parseInt(approveQuantities[item.item_id]) || 0
            }));
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

  const handleReject = async () => {
    if (!rejectingRequisition || !rejectionReason.trim()) {
      alert('Please provide a reason for rejection.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        remarks: rejectionReason,
        userId,
        items: rejectingRequisition.items.map(item => ({
          item_id: item.item_id,
          approved_quantity: 0
        }))
      };

      const response = await axiosInstance.put(`/requisitions/${rejectingRequisition.id}/reject`, payload);

      if (response.data.success) {
        setRequisitions(prev =>
          prev.map(req =>
            req.id === rejectingRequisition.id
              ? { ...req, status: 'rejected' }
              : req
          )
        );
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
            placeholder="Search by ID or Facility..."
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
                    <p className="card-text text-muted">{status} Requisitions</p>
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
                  <th>Items</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequisitions.length > 0 ? (
                  filteredRequisitions.map((req) => (
                    <tr key={req.id}>
                      <td>#{req.id}</td>
                      <td>{req.facility_name || 'N/A'}</td>
                      <td>
                        {req.items.length > 0 ? (
                          <ul className="mb-0 ps-3" style={{ maxHeight: '100px', overflowY: 'auto' }}>
                            {req.items.map((item, idx) => (
                              <li key={item.item_id || idx}>
                                <strong>{item.item_name || 'Unnamed'}</strong>: {item.quantity || 0} {item.unit || ''}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-muted">No items</span>
                        )}
                      </td>
                      <td><StatusBadge status={req.status} /></td>
                      <td>
                         <div className="d-flex flex-wrap gap-1">
                            {/* Individual Approval (for first item only as example, or you can skip this) */}
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => openApproveModalForItem(req, req.items[0])}
                              disabled={loading}
                              title="Approve first item (example)"
                            >
                              Approve Item
                            </button>
                            {/* Bulk Approval — approve all items together */}
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => openBulkApproveModal(req)}
                              disabled={loading}
                            >
                              Bulk Approve
                            </button>
                            {/* Reject entire requisition */}
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => openRejectModal(req)}
                              disabled={loading}
                            >
                              Reject
                            </button>
                          </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-muted">
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

      {/* Approve Modal (Bulk Only) */}
      {showApproveModal && currentRequisition && (
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
                <p><strong>Facility:</strong> {currentRequisition.facility_name}</p>

                <h6>Approve Quantities</h6>
                {currentRequisition.items.map(item => (
                  <div key={item.item_id} className="mb-2">
                    <label>{item.item_name} ({item.quantity} {item.unit})</label>
                    <input
                      type="number"
                      className="form-control"
                      value={approveQuantities[item.item_id] || ''}
                      onChange={(e) =>
                        setApproveQuantities(prev => ({
                          ...prev,
                          [item.item_id]: e.target.value
                        }))
                      }
                      min="0"
                      max={item.quantity}
                    />
                  </div>
                ))}

                <div className="mb-3">
                  <label className="form-label">Remarks (Optional)</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Add remarks..."
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowApproveModal(false)} disabled={loading}>
                  Cancel
                </button>
                <button className="btn btn-success" onClick={handleApproveSubmit} disabled={loading}>
                  {loading ? 'Processing...' : 'Approve'}
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
                <p><strong>Facility:</strong> {rejectingRequisition.facility_name}</p>
                <div className="mb-3">
                  <label className="form-label">Reason for rejection <span className="text-danger">*</span></label>
                  <textarea
                    className="form-control"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows="3"
                    placeholder="Please provide a valid reason"
                    required
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowRejectModal(false)} disabled={loading}>
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={handleReject} disabled={loading}>
                  {loading ? 'Processing...' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {(showApproveModal || showRejectModal) && (
        <div className="modal-backdrop fade show"></div>
      )}
    </div>
  );
};

export default WarehouseRequisitions;