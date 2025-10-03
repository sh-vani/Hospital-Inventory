import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaEye, FaFilePdf } from 'react-icons/fa';
import axios from 'axios';
import BaseUrl from '../../Api/BaseUrl';
import axiosInstance from '../../Api/axiosInstance';

const WarehouseRequisitions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showViewModal, setShowViewModal] = useState(false);
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
        // Fixed: Properly extract the data from the response
        const requisitionsData = response.data.data.map(req => ({
          ...req,
          // Added mock items data since it's missing in the API response
          items: [
            {
              item_id: 1,
              item_name: "Medical Supplies",
              quantity: 10,
              unit: "units",
              approved_quantity: 0
            }
          ]
        }));
        
        setRequisitions(requisitionsData);
        // Fixed: Set pagination properly
        setPagination({
          currentPage: page,
          totalPages: Math.ceil(response.data.data.length / 10) || 1,
          totalItems: response.data.data.length,
          itemsPerPage: 10
        });
      } else {
        setError('Failed to fetch requisitions');
      }
    } catch (err) {
      setError('Error fetching requisitions: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load requisitions on component mount
  useEffect(() => {
    fetchRequisitions();
  }, []);

  const PriorityBadge = ({ priority }) => {
    const priorityColors = {
      high: 'bg-danger',
      normal: 'bg-warning',
      low: 'bg-success'
    };
    return (
      <span className={`badge ${priorityColors[priority] || 'bg-secondary'} text-dark`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  const StatusBadge = ({ status }) => {
    const statusColors = {
      pending: 'bg-warning',
      approved: 'bg-success',
      rejected: 'bg-danger',
      dispatched: 'bg-info',
      'partially approved': 'bg-info'
    };
    return (
      <span className={`badge ${statusColors[status.toLowerCase()] || 'bg-secondary'} text-dark`}>
        {status}
      </span>
    );
  };

  const openApproveModal = (req, item) => {
    setCurrentRequisition(req);
    setCurrentItem(item);
    setApproveQty(item.quantity);
    setRemarks('');
    setShowApproveModal(true);
  };

  const openPartialApproveModal = (req, item) => {
    setCurrentRequisition(req);
    setCurrentItem(item);
    setPartialApproveQty(item.quantity);
    setPartialRemarks('');
    setShowPartialApproveModal(true);
  };

  const openRejectModal = (req) => {
    setRejectingRequisition(req);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const userId= JSON.parse(localStorage.getItem("user"))?.id;
  const handleApproveSubmit = async () => {
    if (!currentRequisition || !currentItem) return;

    setLoading(true);
    try {
      const payload = {
        items: [
          {
            item_id: currentItem.item_id,
            approved_quantity: parseInt(approveQty)
          }
        ],
        remarks: remarks || 'Approved without remarks',
        userId: userId // <-- User ID is now included in the payload
      };

      const response = await axiosInstance.patch(`/requisitions/${currentRequisition.id}/approve`, payload);

      if (response.data.success) {
        // Update the local state
        setRequisitions(requisitions.map(req => {
          if (req.id === currentRequisition.id) {
            const updatedItems = req.items.map(item =>
              item.item_id === currentItem.item_id
                ? { ...item, approved_quantity: parseInt(approveQty) }
                : item
            );
            return { ...req, status: 'Approved', items: updatedItems };
          }
          return req;
        }));

        setShowApproveModal(false);
      } else {
        setError('Failed to approve requisition');
      }
    } catch (err) {
      setError('Error approving requisition: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePartialApproveSubmit = async () => {
    if (!currentRequisition || !currentItem || !partialApproveQty || partialApproveQty <= 0) {
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
        // Update the local state
        setRequisitions(requisitions.map(req => {
          if (req.id === currentRequisition.id) {
            const updatedItems = req.items.map(item => 
              item.item_id === currentItem.item_id 
                ? { ...item, approved_quantity: parseInt(partialApproveQty) } 
                : item
            );
            return { ...req, status: 'Partially Approved', items: updatedItems };
          }
          return req;
        }));
        
        setShowPartialApproveModal(false);
      } else {
        setError('Failed to partially approve requisition');
      }
    } catch (err) {
      setError('Error partially approving requisition: ' + err.message);
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
      // Fixed: user_Id should be at the root of the payload, not inside items
      const payload = {
        remarks: rejectionReason,
        userId: userId, // <-- user_Id at root level
        items: rejectingRequisition.items.map(item => ({
          item_id: item.item_id,
          approved_quantity: 0 // Setting to 0 for rejection
        }))
      };
      
      // Fixed: Await the response and check for success
      const response = await axios.put(`${BaseUrl}/requisitions/${rejectingRequisition.id}/reject`, payload);
      
      if (response.data.success) {
        // Update the local state
        setRequisitions(requisitions.map(req =>
          req.id === rejectingRequisition.id
            ? { ...req, status: 'Rejected', rejectionReason }
            : req
        ));
        
        setShowRejectModal(false);
      } else {
        setError('Failed to reject requisition');
      }
    } catch (err) {
      setError('Error rejecting requisition: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequisitions = requisitions.filter(req =>
    req.id.toString().includes(searchTerm.toLowerCase()) ||
    req.facility_name.toLowerCase().includes(searchTerm.toLowerCase())
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
                    <FaEye size={24} className={`text-${status === 'Pending' ? 'warning' : status === 'Approved' ? 'success' : status === 'Rejected' ? 'danger' : 'info'}`} />
                  </div>
                  <div>
                    <h5 className={`card-title text-${status === 'Pending' ? 'warning' : status === 'Approved' ? 'success' : status === 'Rejected' ? 'danger' : 'info'} fw-bold mb-0`}>
                      {requisitions.filter(r => r.status.toLowerCase() === status.toLowerCase()).length}
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
                {filteredRequisitions.map((req, index) => (
                  req.items && req.items.map((item, idx) => (
                    <tr key={`${index}-${idx}`}>
                      <td>#{req.id}</td>
                      <td>{req.facility_name}</td>
                      <td>{item.item_name}</td>
                      <td>{item.quantity} {item.unit}</td>
                      <td><StatusBadge status={req.status} /></td>
                      <td className="d-flex gap-1">
                        {req.status === 'pending' && (
                          <>
                            <button className="btn btn-sm btn-success" onClick={() => openApproveModal(req, item)} disabled={loading}>Approve</button>
                            {/* <button className="btn btn-sm btn-warning" onClick={() => openPartialApproveModal(req, item)} disabled={loading}>Partial Approve</button> */}
                            <button className="btn btn-sm btn-danger" onClick={() => openRejectModal(req)} disabled={loading}>Reject</button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="d-flex justify-content-between align-items-center mt-3">
        <div>
          Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems} entries
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