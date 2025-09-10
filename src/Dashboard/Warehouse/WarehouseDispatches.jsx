import React, { useState } from 'react';
import { 
  FaPlus, FaSearch, FaEye, FaTruckLoading, FaCheck, FaTimes 
} from 'react-icons/fa';

const WarehouseDispatches = () => {
  // State for search
  const [searchTerm, setSearchTerm] = useState('');

  // State for modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showTrackModal, setShowTrackModal] = useState(false);

  // State for current dispatch
  const [currentDispatch, setCurrentDispatch] = useState(null);

  // State for new dispatch form
  const [newDispatch, setNewDispatch] = useState({
    facility: '',
    items: '',
    dispatchedBy: '',
    estimatedDelivery: '',
    notes: ''
  });

  // Mock data for dispatches
  const [dispatches, setDispatches] = useState([
    { 
      id: '#DSP-0102', 
      facility: 'Kumasi Branch Hospital', 
      itemsCount: '15 items', 
      dispatchedBy: 'Warehouse Admin', 
      date: '23 Oct 2023', 
      status: 'Delivered',
      estimatedDelivery: '24 Oct 2023',
      trackingNumber: 'TRK-2023-0015',
      notes: 'Urgent delivery for emergency ward'
    },
    { 
      id: '#DSP-0101', 
      facility: 'Accra Central Hospital', 
      itemsCount: '8 items', 
      dispatchedBy: 'Warehouse Admin', 
      date: '22 Oct 2023', 
      status: 'Delivered',
      estimatedDelivery: '23 Oct 2023',
      trackingNumber: 'TRK-2023-0014',
      notes: 'Routine supply for pharmacy department'
    },
    { 
      id: '#DSP-0100', 
      facility: 'Takoradi Clinic', 
      itemsCount: '12 items', 
      dispatchedBy: 'Warehouse Admin', 
      date: '21 Oct 2023', 
      status: 'In Transit',
      estimatedDelivery: '25 Oct 2023',
      trackingNumber: 'TRK-2023-0013',
      notes: 'Laboratory supplies',
      currentLocation: 'Cape Town Distribution Center',
      progress: 65
    }
  ]);

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusColors = {
      'Delivered': 'bg-success text-white',
      'In Transit': 'bg-warning text-dark',
      'Processing': 'bg-info text-white',
      'Cancelled': 'bg-danger text-white'
    };

    return (
      <span className={`badge ${statusColors[status] || 'bg-secondary'} rounded-pill px-3 py-1 fw-medium`}>
        {status}
      </span>
    );
  };

  // Modal handlers
  const openCreateModal = () => {
    setNewDispatch({
      facility: '',
      items: '',
      dispatchedBy: '',
      estimatedDelivery: '',
      notes: ''
    });
    setShowCreateModal(true);
  };

  const openViewModal = (dispatch) => {
    setCurrentDispatch(dispatch);
    setShowViewModal(true);
  };

  const openTrackModal = (dispatch) => {
    setCurrentDispatch(dispatch);
    setShowTrackModal(true);
  };

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewDispatch({
      ...newDispatch,
      [name]: value
    });
  };

  // Action handlers
  const handleCreateDispatch = () => {
    if (!newDispatch.facility || !newDispatch.dispatchedBy) {
      alert('Please fill Facility and Dispatched By fields.');
      return;
    }

    const newItem = {
      id: `#DSP-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      facility: newDispatch.facility,
      itemsCount: newDispatch.items || 'Not specified',
      dispatchedBy: newDispatch.dispatchedBy,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      status: 'Processing',
      estimatedDelivery: newDispatch.estimatedDelivery,
      trackingNumber: `TRK-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      notes: newDispatch.notes
    };

    setDispatches([newItem, ...dispatches]);
    setShowCreateModal(false);
  };

  // Filter dispatches by search term
  const filteredDispatches = dispatches.filter(dispatch =>
    dispatch.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dispatch.facility.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Dispatches Management</h2>
        <button className="btn btn-primary d-flex align-items-center" onClick={openCreateModal}>
          <FaPlus className="me-2" /> New Dispatch
        </button>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center p-4">
              <div className="bg-success bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                <FaCheck className="text-success fa-2x" />
              </div>
              <div className="number text-success fw-bold">24</div>
              <div className="label text-muted">Delivered This Month</div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center p-4">
              <div className="bg-warning bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                <FaTruckLoading className="text-warning fa-2x" />
              </div>
              <div className="number text-warning fw-bold">5</div>
              <div className="label text-muted">In Transit</div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center p-4">
              <div className="bg-info bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                <FaTimes className="text-info fa-2x" />
              </div>
              <div className="number text-info fw-bold">2</div>
              <div className="label text-muted">Delayed</div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center p-4">
              <div className="bg-primary bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                <FaPlus className="text-primary fa-2x" />
              </div>
              <div className="number text-primary fw-bold">3</div>
              <div className="label text-muted">Pending</div>
            </div>
          </div>
        </div>
      </div>

      {/* Dispatches Table */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-white border-0 pt-3 pb-0">
          <h5 className="mb-0 fw-bold">Recent Dispatches</h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="bg-light">
                <tr>
                  <th>Dispatch ID</th>
                  <th>To Facility</th>
                  <th>Items Count</th>
                  <th>Dispatched By</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDispatches.map((dispatch, index) => (
                  <tr key={index}>
                    <td><span className="fw-bold">{dispatch.id}</span></td>
                    <td>{dispatch.facility}</td>
                    <td>{dispatch.itemsCount}</td>
                    <td>{dispatch.dispatchedBy}</td>
                    <td>{dispatch.date}</td>
                    <td><StatusBadge status={dispatch.status} /></td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => dispatch.status === 'In Transit' ? openTrackModal(dispatch) : openViewModal(dispatch)}
                        title={dispatch.status === 'In Transit' ? 'Track Delivery' : 'View Details'}
                      >
                        {dispatch.status === 'In Transit' ? (
                          <>
                            <FaTruckLoading className="me-1" />
                            Track
                          </>
                        ) : (
                          <>
                            <FaEye className="me-1" />
                            View Details
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredDispatches.length === 0 && (
            <div className="p-4 text-center text-muted">
              No dispatches found matching your search.
            </div>
          )}
        </div>
      </div>

      {/* ========== MODALS ========== */}

      {/* Create Dispatch Modal */}
      {showCreateModal && (
        <div className="modal fade show d-block" tabIndex="-1" onClick={(e) => {
          if (e.target.classList.contains('modal')) setShowCreateModal(false);
        }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold">Create New Dispatch</h5>
                <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)}></button>
              </div>
              <div className="modal-body py-4">
                <form>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-medium">To Facility <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        name="facility"
                        value={newDispatch.facility}
                        onChange={handleInputChange}
                        placeholder="e.g. Kumasi Branch Hospital"
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-medium">Dispatched By <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        name="dispatchedBy"
                        value={newDispatch.dispatchedBy}
                        onChange={handleInputChange}
                        placeholder="e.g. Warehouse Admin"
                        required
                      />
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-medium">Estimated Delivery Date</label>
                      <input
                        type="date"
                        className="form-control form-control-lg"
                        name="estimatedDelivery"
                        value={newDispatch.estimatedDelivery}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-medium">Items</label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        name="items"
                        value={newDispatch.items}
                        onChange={handleInputChange}
                        placeholder="e.g. 15 items"
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-medium">Notes</label>
                    <textarea
                      className="form-control form-control-lg"
                      name="notes"
                      value={newDispatch.notes}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Additional notes about this dispatch"
                    ></textarea>
                  </div>
                </form>
              </div>
              <div className="modal-footer border-top-0 pt-0">
                <button type="button" className="btn btn-secondary px-4" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-primary px-4" onClick={handleCreateDispatch}>
                  Create Dispatch
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Dispatch Modal */}
      {showViewModal && currentDispatch && (
        <div className="modal fade show d-block" tabIndex="-1" onClick={(e) => {
          if (e.target.classList.contains('modal')) setShowViewModal(false);
        }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold">Dispatch Details: {currentDispatch.id}</h5>
                <button type="button" className="btn-close" onClick={() => setShowViewModal(false)}></button>
              </div>
              <div className="modal-body py-4">
                <div className="row mb-4">
                  <div className="col-md-6">
                    <p><strong>To Facility:</strong> {currentDispatch.facility}</p>
                    <p><strong>Dispatched By:</strong> {currentDispatch.dispatchedBy}</p>
                    <p><strong>Dispatch Date:</strong> {currentDispatch.date}</p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>Tracking Number:</strong> {currentDispatch.trackingNumber}</p>
                    <p><strong>Estimated Delivery:</strong> {currentDispatch.estimatedDelivery}</p>
                    <p><strong>Status:</strong> <StatusBadge status={currentDispatch.status} /></p>
                  </div>
                </div>
                <div className="mb-3">
                  <h6 className="mb-2">Notes:</h6>
                  <div className="card bg-light">
                    <div className="card-body">
                      {currentDispatch.notes}
                    </div>
                  </div>
                </div>
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

      {/* Track Dispatch Modal */}
      {showTrackModal && currentDispatch && (
        <div className="modal fade show d-block" tabIndex="-1" onClick={(e) => {
          if (e.target.classList.contains('modal')) setShowTrackModal(false);
        }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold">Track Dispatch: {currentDispatch.id}</h5>
                <button type="button" className="btn-close" onClick={() => setShowTrackModal(false)}></button>
              </div>
              <div className="modal-body py-4">
                <div className="row mb-4">
                  <div className="col-md-6">
                    <p><strong>To Facility:</strong> {currentDispatch.facility}</p>
                    <p><strong>Dispatch Date:</strong> {currentDispatch.date}</p>
                    <p><strong>Estimated Delivery:</strong> {currentDispatch.estimatedDelivery}</p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>Tracking Number:</strong> {currentDispatch.trackingNumber}</p>
                    <p><strong>Status:</strong> <StatusBadge status={currentDispatch.status} /></p>
                    <p><strong>Current Location:</strong> {currentDispatch.currentLocation}</p>
                  </div>
                </div>
                <div className="mb-4">
                  <h6 className="mb-3">Delivery Progress</h6>
                  <div className="progress mb-2" style={{ height: '20px' }}>
                    <div
                      className="progress-bar bg-warning"
                      role="progressbar"
                      style={{ width: `${currentDispatch.progress}%` }}
                      aria-valuenow={currentDispatch.progress}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    >
                      {currentDispatch.progress}%
                    </div>
                  </div>
                  <p className="text-muted small">Your dispatch is {currentDispatch.progress}% complete</p>
                </div>
                <div className="mb-3">
                  <h6 className="mb-2">Tracking Timeline</h6>
                  <div className="timeline">
                    <div className="timeline-item">
                      <div className="timeline-marker bg-success"></div>
                      <div className="timeline-content">
                        <h6>Order Processed</h6>
                        <p className="text-muted small">{currentDispatch.date} - Warehouse</p>
                      </div>
                    </div>
                    <div className="timeline-item">
                      <div className="timeline-marker bg-warning"></div>
                      <div className="timeline-content">
                        <h6>In Transit</h6>
                        <p className="text-muted small">Current Location: {currentDispatch.currentLocation}</p>
                      </div>
                    </div>
                    <div className="timeline-item">
                      <div className="timeline-marker bg-secondary"></div>
                      <div className="timeline-content">
                        <h6>Out for Delivery</h6>
                        <p className="text-muted small">Expected: {currentDispatch.estimatedDelivery}</p>
                      </div>
                    </div>
                    <div className="timeline-item">
                      <div className="timeline-marker bg-secondary"></div>
                      <div className="timeline-content">
                        <h6>Delivered</h6>
                        <p className="text-muted small">Pending</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mb-3">
                  <h6 className="mb-2">Notes:</h6>
                  <div className="card bg-light">
                    <div className="card-body">
                      {currentDispatch.notes}
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-top-0 pt-0">
                <button type="button" className="btn btn-secondary px-4" onClick={() => setShowTrackModal(false)}>
                  Close
                </button>
                <button type="button" className="btn btn-primary px-4">
                  Print Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Backdrop */}
      {(showCreateModal || showViewModal || showTrackModal) && (
        <div className="modal-backdrop fade show"></div>
      )}
    </div>
  );
};

export default WarehouseDispatches;