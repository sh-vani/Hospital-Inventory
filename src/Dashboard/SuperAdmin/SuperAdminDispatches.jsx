import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FaPlus, FaSearch, FaEye, FaCheck, FaTruckLoading, FaTimes, FaMapMarkerAlt, FaCalendarAlt, FaUser
} from 'react-icons/fa';
import BaseUrl from '../../Api/BaseUrl';
import axiosInstance from '../../Api/axiosInstance';

const SuperAdminDispatches = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [currentDispatch, setCurrentDispatch] = useState(null);
  const [dispatches, setDispatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: 10
  });

  const [newDispatch, setNewDispatch] = useState({
    facility: '',
    items: '',
    dispatchedBy: '',
    estimatedDelivery: '',
    notes: ''
  });

  // === FETCH DISPATCHES ===
  const fetchDispatches = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get(`${BaseUrl}/dispatches?page=${page}&limit=10`);
      if (response.data.success) {
        setDispatches(response.data.data);
        setPagination(response.data.data);
      } else {
        setError('Failed to fetch dispatches');
      }
    } catch (err) {
      setError('Error fetching dispatches: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // === INITIAL LOAD ===
  useEffect(() => {
    fetchDispatches(1);
  }, []);

  // === PAGINATION HANDLER ===
  const handlePageChange = (page) => {
    fetchDispatches(page);
  };

  const StatusBadge = ({ status }) => {
    const map = {
      'delivered': 'bg-success',
      'in_transit': 'bg-warning text-dark',
      'processing': 'bg-info text-dark',
      'pending': 'bg-primary',
      'cancelled': 'bg-danger'
    };
    const displayStatus = status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown';
    return <span className={`badge ${map[status] || 'bg-secondary'}`}>{displayStatus}</span>;
  };

  const openCreateModal = () => {
    setNewDispatch({ facility: '', items: '', dispatchedBy: '', estimatedDelivery: '', notes: '' });
    setShowCreateModal(true);
  };

  const openViewModal = (d) => {
    setCurrentDispatch(d);
    setShowViewModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewDispatch(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateDispatch = () => {
    const newItem = {
      id: `#DSP-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      facility: newDispatch.facility,
      items: [], // In real app, you'd parse this properly
      dispatchedBy: newDispatch.dispatchedBy,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      status: 'processing',
      estimatedDelivery: newDispatch.estimatedDelivery,
      deliveryAddress: '',
      trackingNumber: `TRK-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      notes: newDispatch.notes
    };
    setDispatches([newItem, ...dispatches]);
    setShowCreateModal(false);
  };

  const filtered = dispatches.filter(d => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return (
      (d.id && d.id.toString().toLowerCase().includes(q)) ||
      (d.facility_name && d.facility_name.toLowerCase().includes(q)) ||
      (d.dispatched_by && d.dispatched_by.toLowerCase().includes(q)) ||
      (d.status && d.status.toLowerCase().includes(q)) ||
      (d.items && d.items.some(item => item.item_name && item.item_name.toLowerCase().includes(q)))
    );
  });

  // Helper to get total quantity
  const getTotalQty = (items) => {
    if (!items || items.length === 0) return 0;
    return items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  };

  // Helper to get first few item names (for table display)
  const getItemsPreview = (items) => {
    if (!items || items.length === 0) return '—';
    const names = items.map(i => i.item_name || 'Unknown Item');
    return names.length > 2 ? `${names[0]}, ${names[1]} +${names.length - 2}` : names.join(', ');
  };

  // Calculate stats for cards
  const totalDispatches = dispatches.length;
  const inTransitCount = dispatches.filter(d => d.status === 'in_transit').length;
  const deliveredCount = dispatches.filter(d => d.status === 'delivered').length;
  const pendingCount = dispatches.filter(d => d.status === 'pending').length;

  // === LOADING STATE ===
  if (loading && dispatches.length === 0) {
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
  if (error && dispatches.length === 0) {
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
      {/* Toolbar */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center gap-3 mb-4">
        <h2 className="fw-bold mb-0">Dispatches</h2>

        {/* Search + Button Group */}
        <div className="input-group" style={{ maxWidth: '300px' }}>
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Search dispatches..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search dispatches"
          />
          <button className="btn btn-outline-secondary btn-sm" type="button" aria-label="Search">
            <FaSearch />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row row-cols-1 row-cols-md-4 g-3 mb-4">
        <div className="col">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center p-4">
              <div className="bg-success bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                <FaCheck className="text-success fs-3" />
              </div>
              <div className="fw-bold text-success fs-4">{totalDispatches}</div>
              <div className="text-muted small">Total Dispatches</div>
            </div>
          </div>
        </div>

        <div className="col">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center p-4">
              <div className="bg-warning bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                <FaTruckLoading className="text-warning fs-3" />
              </div>
              <div className="fw-bold text-warning fs-4">{inTransitCount}</div>
              <div className="text-muted small">In Transit</div>
            </div>
          </div>
        </div>

        <div className="col">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center p-4">
              <div className="bg-info bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                <FaCheck className="text-info fs-3" />
              </div>
              <div className="fw-bold text-info fs-4">{deliveredCount}</div>
              <div className="text-muted small">Delivered</div>
            </div>
          </div>
        </div>

        <div className="col">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center p-4">
              <div className="bg-primary bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                <FaPlus className="text-primary fs-3" />
              </div>
              <div className="fw-bold text-primary fs-4">{pendingCount}</div>
              <div className="text-muted small">Pending</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Dispatches */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-white border-0 pt-4">
          <h5 className="mb-0 fw-bold">Recent Dispatches</h5>
        </div>

        {/* TABLE (md and up) */}
        <div className="card-body p-0 d-none d-md-block">
          <div className="table-responsive">
            <table className="table table-hover mb-0 align-middle">
              <thead className="bg-light">
                <tr>
                  <th>Dispatch ID</th>
                  <th>Facility</th>
                  <th>Items</th>
                  <th>Qty</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan="7" className="text-center">No dispatches found.</td></tr>
                ) : (
                  filtered.map((dispatch, index) => (
                    <tr key={dispatch.id || index}>
                      <td className="fw-bold">Tracking Number:{index+1}</td>
                      <td>{dispatch.facility_name || 'Unknown Facility'}</td>
                      <td>{getItemsPreview(dispatch.items)}</td>
                      <td>{getTotalQty(dispatch.items)}</td>
                      <td><StatusBadge status={dispatch.status} /></td>
                      <td>{dispatch.created_at ? new Date(dispatch.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => openViewModal(dispatch)}
                        >
                          <FaEye className="me-1" /> View Detail
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* CARD LIST (xs) */}
        <div className="card-body d-block d-md-none">
          <div className="row g-2">
            {filtered.length === 0 ? (
              <div className="col-12">
                <div className="alert alert-light border text-center mb-0">No dispatches found.</div>
              </div>
            ) : (
              filtered.map((d, i) => (
                <div className="col-12" key={d.id || i}>
                  <div className="card">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="fw-bold">#{d.id}</span>
                        <StatusBadge status={d.status} />
                      </div>

                      <div className="row g-2 small">
                        <div className="col-12">
                          <div className="text-muted">Facility</div>
                          <div>{d.facility_name || 'Unknown Facility'}</div>
                        </div>
                        <div className="col-12">
                          <div className="text-muted">Items</div>
                          <div>{getItemsPreview(d.items)}</div>
                        </div>
                        <div className="col-6">
                          <div className="text-muted">Qty</div>
                          <div>{getTotalQty(d.items)}</div>
                        </div>
                        <div className="col-6">
                          <div className="text-muted">Date</div>
                          <div>{d.created_at ? new Date(d.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}</div>
                        </div>
                      </div>

                      <div className="d-flex gap-2 mt-3">
                        <button
                          className="btn btn-outline-primary w-100 btn-sm"
                          onClick={() => openViewModal(d)}
                        >
                          <FaEye className="me-1" /> View Detail
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

      {/* View Detail Modal */}
      {showViewModal && currentDispatch && (
        <div className="modal show d-block" tabIndex="-1" role="dialog" aria-modal="true">
          <div className="modal-dialog modal-lg modal-dialog-scrollable modal-fullscreen-sm-down">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Dispatch Details: #{currentDispatch.id}</h5>
                <button type="button" className="btn-close" onClick={() => setShowViewModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row g-3 mb-2">
                  <div className="col-12 col-md-6">
                    <div className="d-flex align-items-center mb-2">
                      <FaMapMarkerAlt className="text-primary me-2" />
                      <p className="mb-0"><strong>To Facility:</strong> {currentDispatch.facility_name || 'Unknown Facility'}</p>
                    </div>
                    <div className="d-flex align-items-center mb-2">
                      <FaUser className="text-primary me-2" />
                      <p className="mb-0"><strong>Dispatched By:</strong> {currentDispatch.dispatched_by || 'N/A'}</p>
                    </div>
                    <div className="d-flex align-items-center mb-2">
                      <FaCalendarAlt className="text-primary me-2" />
                      <p className="mb-0"><strong>Dispatch Date:</strong> {currentDispatch.created_at ? new Date(currentDispatch.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}</p>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                 
                    <p className="mb-1"><strong>Status:</strong> <StatusBadge status={currentDispatch.status} /></p>
                  </div>
                </div>

                <div className="mb-3">
                  <h6 className="mb-2">Delivery Address:</h6>
                  <div className="card bg-light">
                    <div className="card-body">
                      {currentDispatch.delivery_address || '—'}
                    </div>
                  </div>
                </div>

                <h6 className="mt-4 mb-2">Items Dispatched:</h6>
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Item Name</th>
                        <th>Quantity</th>
                        <th>Unit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentDispatch.items && currentDispatch.items.length > 0 ? (
                        currentDispatch.items.map((item, index) => (
                          <tr key={index}>
                            <td>{item.item_name || 'Unknown Item'}</td>
                            <td>{item.quantity || 0}</td>
                            <td>{item.unit || 'N/A'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan="3" className="text-center">No items listed</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4">
                  <h6 className="mb-2">Notes:</h6>
                  <div className="card bg-light">
                    <div className="card-body">
                      {currentDispatch.notes || '—'}
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer d-flex gap-2">
                <button type="button" className="btn btn-secondary" onClick={() => setShowViewModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {(showCreateModal || showViewModal) && <div className="modal-backdrop show"></div>}
    </div>
  );
};

export default SuperAdminDispatches;