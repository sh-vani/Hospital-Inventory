import React, { useState, useEffect } from 'react';
import { FaSearch, FaEye, FaCheck } from 'react-icons/fa';
import axios from 'axios';
import BaseUrl from '../../Api/BaseUrl';

const WarehouseDispatches = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [dispatches, setDispatches] = useState([]);

  // Modals
  const [showViewModal, setShowViewModal] = useState(false);
  const [currentDispatch, setCurrentDispatch] = useState(null);
  const [modalAction, setModalAction] = useState(null); // 'dispatch' or 'deliver'
  const [remark, setRemark] = useState('');

  useEffect(() => {
    fetchDispatches();
  }, []);

  const fetchDispatches = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BaseUrl}/dispatches`);
      if (response.data?.success && Array.isArray(response.data.data)) {
        setDispatches(response.data.data);
      } else {
        setDispatches([]);
      }
    } catch (error) {
      console.error('Error fetching dispatches:', error);
      alert('Failed to fetch dispatches. Please try again.');
      setDispatches([]);
    } finally {
      setLoading(false);
    }
  };

  const StatusBadge = ({ status }) => {
    const statusColors = {
      'delivered': 'bg-success text-white',
      'dispatched': 'bg-warning text-dark',
      'processing': 'bg-info text-white',
      'pending': 'bg-secondary text-white',
      'cancelled': 'bg-danger text-white',
    };

    const displayText = status === 'dispatched'
      ? 'Dispatched'
      : status?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());

    return (
      <span className={`badge ${statusColors[status] || 'bg-secondary'} rounded-pill px-3 py-1 fw-medium`}>
        {displayText || 'Unknown'}
      </span>
    );
  };

  const openViewModal = (dispatch) => {
    setCurrentDispatch(dispatch);
    setShowViewModal(true);
  };

  const openActionModal = (dispatch, action) => {
    setCurrentDispatch(dispatch);
    setModalAction(action);
    if (action === 'dispatch') {
      setRemark('Dispatched to facility');
    } else if (action === 'deliver') {
      setRemark('Received in good condition');
    }
  };

  const closeModal = () => {
    setModalAction(null);
    setRemark('');
  };

  const handleMarkDispatched = async () => {
    if (!currentDispatch || !remark.trim()) {
      alert('Please provide a dispatch remark.');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(`${BaseUrl}/dispatches/dispatch`, {
        requisition_id: currentDispatch.requisition_id,
        remark: remark.trim(),
      });

      if (response.data?.success) {
        const updatedDispatches = dispatches.map(d =>
          d.requisition_id === currentDispatch.requisition_id
            ? { ...d, status: 'dispatched' }
            : d
        );
        setDispatches(updatedDispatches);
        setCurrentDispatch(prev => ({ ...prev, status: 'dispatched' }));
        alert(`Dispatch for Requisition #${currentDispatch.requisition_id} completed!`);
        closeModal();
      } else {
        alert(response.data?.message || 'Dispatch failed.');
      }
    } catch (error) {
      console.error('Error dispatching:', error);
      alert('Failed to dispatch. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ UPDATED: Use /dispatches/deliver endpoint
  const handleMarkDelivered = async () => {
    if (!currentDispatch || !remark.trim()) {
      alert('Please provide a delivery remark.');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(`${BaseUrl}/dispatches/deliver`, {
        requisition_id: currentDispatch.requisition_id,
        remark: remark.trim(),
      });

      if (response.data?.success) {
        const updatedDispatches = dispatches.map(d =>
          d.requisition_id === currentDispatch.requisition_id
            ? { ...d, status: 'delivered' }
            : d
        );
        setDispatches(updatedDispatches);
        setCurrentDispatch(prev => ({ ...prev, status: 'delivered' }));
        alert(`Requisition #${currentDispatch.requisition_id} marked as delivered!`);
        closeModal();
      } else {
        alert(response.data?.message || 'Delivery update failed.');
      }
    } catch (error) {
      console.error('Error marking as delivered:', error);
      alert('Failed to mark as delivered. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredDispatches = dispatches.filter(dispatch =>
    dispatch.id?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
    dispatch.facility_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dispatch.tracking_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dispatch.item_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Dispatches Management</h2>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center p-4">
              <div className="bg-success bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                <FaCheck className="text-success fa-2x" />
              </div>
              <div className="number text-success fw-bold">
                {dispatches.filter(d => d.status === 'delivered').length}
              </div>
              <div className="label text-muted">Delivered</div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center p-4">
              <div className="bg-warning bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                <FaCheck className="text-warning fa-2x" />
              </div>
              <div className="number text-warning fw-bold">
                {dispatches.filter(d => d.status === 'dispatched').length}
              </div>
              <div className="label text-muted">Dispatched</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Table */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-white border-0 pt-3 pb-0">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0 fw-bold">Recent Dispatches</h5>
            <div className="input-group" style={{ maxWidth: '300px' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Search by ID, facility, item, or tracking..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="btn btn-outline-secondary">
                <FaSearch />
              </button>
            </div>
          </div>
        </div>
        <div className="card-body p-0">
          {loading ? (
            <div className="d-flex justify-content-center align-items-center p-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>#</th>
                    <th>Tracking #</th>
                    <th>Requisition ID</th>
                    <th>Facility</th>
                    <th>Item</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDispatches.length > 0 ? (
                    filteredDispatches.map((dispatch, index) => (
                      <tr key={dispatch.id || index}>
                        <td><span className="fw-bold">#{index + 1}</span></td>
                        <td>{dispatch.tracking_number || '—'}</td>
                        <td>{dispatch.requisition_id || '—'}</td>
                        <td>{dispatch.facility_name || '—'}</td>
                        <td>{dispatch.item_name || '—'}</td>
                        <td><StatusBadge status={dispatch.status} /></td>
                        <td>
                          <div className="d-flex gap-1">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => openViewModal(dispatch)}
                            >
                              <FaEye className="me-1" /> View
                            </button>

                            {(dispatch.status === 'pending' || dispatch.status === 'processing') && (
                              <button
                                className="btn btn-sm btn-warning"
                                onClick={() => openActionModal(dispatch, 'dispatch')}
                              >
                                <FaCheck className="me-1" /> Dispatch
                              </button>
                            )}

                            {dispatch.status === 'dispatched' && (
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() => openActionModal(dispatch, 'deliver')}
                              >
                                <FaCheck className="me-1" /> Delivered
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center py-4 text-muted">
                        No dispatches found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* View Modal */}
      {showViewModal && currentDispatch && (
        <div className="modal fade show d-block" tabIndex="-1" onClick={(e) => {
          if (e.target.classList.contains('modal')) setShowViewModal(false);
        }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Dispatch Details</h5>
                <button type="button" className="btn-close" onClick={() => setShowViewModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <p><strong>ID:</strong> {currentDispatch.id}</p>
                    <p><strong>Requisition ID:</strong> {currentDispatch.requisition_id}</p>
                    <p><strong>Tracking Number:</strong> {currentDispatch.tracking_number || '—'}</p>
                    <p><strong>Facility:</strong> {currentDispatch.facility_name || '—'}</p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>Item:</strong> {currentDispatch.item_name || '—'}</p>
                    <p><strong>Status:</strong> <StatusBadge status={currentDispatch.status} /></p>
                    <p><strong>Remarks:</strong> {currentDispatch.remark || '—'}</p>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowViewModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Unified Action Modal with Remark */}
      {modalAction && currentDispatch && (
        <div className="modal fade show d-block" tabIndex="-1" onClick={(e) => {
          if (e.target.classList.contains('modal')) closeModal();
        }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {modalAction === 'dispatch' ? 'Dispatch Items' : 'Mark as Delivered'}
                </h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>
              <div className="modal-body">
                {modalAction === 'dispatch' ? (
                  <>
                    <p>
                      Dispatch requisition <strong>#{currentDispatch.requisition_id}</strong> to{' '}
                      <strong>{currentDispatch.facility_name}</strong>?
                    </p>
                    <div className="mb-3">
                      <label className="form-label fw-medium">Dispatch Remark</label>
                      <textarea
                        className="form-control"
                        rows="2"
                        value={remark}
                        onChange={(e) => setRemark(e.target.value)}
                        placeholder="Enter remark for dispatch..."
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <p>
                      Mark dispatch <strong>#{currentDispatch.requisition_id}</strong> as delivered?
                    </p>
                    <div className="mb-3">
                      <label className="form-label fw-medium">Delivery Remark</label>
                      <textarea
                        className="form-control"
                        rows="2"
                        value={remark}
                        onChange={(e) => setRemark(e.target.value)}
                        placeholder="Enter remark for delivery..."
                      />
                    </div>
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button
                  className="btn"
                  onClick={modalAction === 'dispatch' ? handleMarkDispatched : handleMarkDelivered}
                  disabled={loading || !remark.trim()}
                  style={{
                    backgroundColor: modalAction === 'dispatch' ? '#ffc107' : '#198754',
                    color: 'white',
                  }}
                >
                  {loading ? 'Processing...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {(showViewModal || modalAction) && <div className="modal-backdrop fade show"></div>}
    </div>
  );
};

export default WarehouseDispatches;