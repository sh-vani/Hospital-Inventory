import React, { useState, useEffect } from 'react';
import { FaPlus, FaEye, FaTimes } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import BaseUrl from '../../Api/BaseUrl';
import axiosInstance from '../../Api/axiosInstance';
import Swal from 'sweetalert2'; // ✅ Import SweetAlert2

const FacilityUserRequisition = () => {
  // Form states
  const [department, setDepartment] = useState('');
  const [username, setUsername] = useState('');
  const [requisitionType, setRequisitionType] = useState('individual');
  const [showRequisitionModal, setShowRequisitionModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  // Modal for item details
  const [showItemDetailModal, setShowItemDetailModal] = useState(false);
  const [selectedItemDetail, setSelectedItemDetail] = useState(null);
  // Modal states
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRequisition, setSelectedRequisition] = useState(null);
  const [requisitionHistory, setRequisitionHistory] = useState([]);

  // Requisition form fields
  const [selectedItem, setSelectedItem] = useState('');
  const [quantity, setQuantity] = useState('');
  const [priority, setPriority] = useState('Normal');
  const [remarks, setRemarks] = useState('');

  // Real facility items from API
  const [facilityItems, setFacilityItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);

  // Get user from localStorage
  const getUserFromStorage = () => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      console.error('Failed to parse user from localStorage');
      return null;
    }
  };

  // ✅ Retry function with exponential backoff for 429 errors
  const fetchWithRetry = async (axiosCall, maxRetries = 3, initialDelay = 1000) => {
    let retryCount = 0;
    let delay = initialDelay;

    while (retryCount <= maxRetries) {
      try {
        const response = await axiosCall();
        return response;
      } catch (error) {
        if (error.response && error.response.status === 429 && retryCount < maxRetries) {
          retryCount++;
          console.log(`Rate limited. Retrying in ${delay}ms (attempt ${retryCount}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2;
        } else {
          throw error;
        }
      }
    }

    throw new Error('Max retries reached');
  };

  // Fetch facility items with retry mechanism
  const fetchFacilityItems = async (facilityId) => {
    try {
      setLoadingItems(true);
      const response = await fetchWithRetry(() =>
        axiosInstance.get(`${BaseUrl}/inventory`, {
          params: { facilityId }
        })

        
      )

      if (response.data.success && Array.isArray(response.data.data.items)) {
        setFacilityItems(response.data.data.items);
      } else {
        setFacilityItems([]);
      }
    } catch (error) {
      console.error('Failed to fetch facility items:', error);
      setFacilityItems([]);

      if (error.response?.status === 429) {
        Swal.fire({
          icon: 'warning',
          title: 'Too Many Requests',
          text: 'Please wait a moment and try again.',
          timer: 3000,
          showConfirmButton: false
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Fetch Failed',
          text: 'Failed to fetch facility items. Please try again later.'
        });
      }
    } finally {
      setLoadingItems(false);
    }
  };

  // Fetch requisition history
  const fetchRequisitionHistory = async (userId) => {
    try {
      const response = await axiosInstance.get(`${BaseUrl}/requisitions/user/${userId}`);
      if (response.data.success && Array.isArray(response.data.data)) {
        const formatted = response.data.data
        .map(req => ({
          id: req.id,
          item_name: req.items?.length > 0 ? req.items[0].item_name : 'N/A',
          status: (req.status || '').charAt(0).toUpperCase() + (req.status || '').slice(1),
          priority: (req.priority || 'normal').charAt(0).toUpperCase() + (req.priority || 'normal').slice(1),
          remarks: req.remarks || '',
          items: Array.isArray(req.items) ? req.items : []
        }))
        .sort((a, b) => a.id - b.id); // Sort by ID descending
      setRequisitionHistory(formatted);
      } else {
        setRequisitionHistory([]);
      }
    } catch (error) {
      console.error('Failed to fetch requisition history:', error);
      setRequisitionHistory([]);
    }
  };

  // Initialize user session & fetch data
  useEffect(() => {
    const user = getUserFromStorage();
    if (user) {
      setDepartment(user.department || 'N/A');
      setUsername(user.name || 'User');
      const facilityId = user.facility_id;
      if (facilityId) {
        fetchFacilityItems(facilityId);
      } else {
        console.error('Facility ID not found in user data');
        setLoadingItems(false);
      }
      if (user.id) {
        fetchRequisitionHistory(user.id);
      }
    } else {
      console.error('User not found in localStorage');
      setLoadingItems(false);
    }
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedItem || !quantity || quantity <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Incomplete Form',
        text: 'Please select an item and enter a valid quantity.'
      });
      return;
    }

    const user = getUserFromStorage();
    if (!user || !user.facility_id || !user.id) {
      Swal.fire({
        icon: 'error',
        title: 'Session Error',
        text: 'User data incomplete. Please log in again.'
      });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        user_id: user.id,
        facility_id: user.facility_id,
        remarks: remarks.trim() || '',
        items: [
          {
            item_id: parseInt(selectedItem),
            quantity: parseInt(quantity),
            priority: priority.toLowerCase()
          }
        ]
      };

      const response = await axiosInstance.post(`${BaseUrl}/requisitions`, payload);

      if (response.data.success) {
        setSuccess(true);
        fetchRequisitionHistory(user.id);

        // Reset form
        setSelectedItem('');
        setQuantity('');
        setPriority('Normal');
        setRemarks('');
        setShowRequisitionModal(false);

        Swal.fire({
          icon: 'success',
          title: 'Submitted!',
          text: 'Your requisition has been submitted to Facility Admin.',
          timer: 3000,
          showConfirmButton: false
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Submission Failed',
          text: 'Failed to submit requisition: ' + (response.data.message || 'Unknown error')
        });
      }
    } catch (error) {
      console.error('Submission error:', error);
      const msg = error.response?.data?.message || 'Network error. Please try again.';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: msg
      });
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  // Cancel requisition with SweetAlert confirmation
  const handleCancelRequisition = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, cancel it!',
      cancelButtonText: 'No, keep it'
    });

    if (!result.isConfirmed) return;

    setLoading(true);
    try {
      const response = await axiosInstance.delete(`${BaseUrl}/requisitions/${id}`);

      if (response.data.success) {
        setRequisitionHistory(prev =>
          prev.map(req => (req.id === id ? { ...req, status: 'Cancelled' } : req))
        );
        Swal.fire({
          icon: 'success',
          title: 'Cancelled!',
          text: 'Requisition has been cancelled.',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Cancellation Failed',
          text: 'Failed to cancel requisition: ' + (response.data.message || 'Unknown error')
        });
      }
    } catch (error) {
      console.error('Cancellation error:', error);
      const msg = error.response?.data?.message || 'Network error. Please try again.';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: msg
      });
    } finally {
      setLoading(false);
    }
  };

  // View detail
  const handleViewDetail = (req) => {
    setSelectedRequisition(req);
    setShowDetailModal(true);
  };

  // Add item button
  const handleAddItem = () => {
    setShowRequisitionModal(true);
  };

  // Status badge
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Pending': return 'bg-warning text-dark';
      case 'Processing': return 'bg-info';
      case 'Completed': return 'bg-success';
      case 'Cancelled': return 'bg-secondary';
      case 'Dispatched': return 'bg-primary';
      default: return 'bg-secondary';
    }
  };

  // View item detail
  const handleViewItemDetail = (item) => {
    setSelectedItemDetail(item);
    setShowItemDetailModal(true);
  };

  // Priority badge
  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'Normal': return 'bg-success';
      case 'High': return 'bg-warning text-dark';
      case 'Urgent': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  // Apply filters
  const filteredRequisitions = requisitionHistory.filter(req => {
    const matchesSearch =
      req.id.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      (req.item_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (req.remarks || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || req.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || req.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="container py-4">
      <div className="card shadow">
        <div className="card-header text-black">
          <h4 className="mb-0">Create Requisition</h4>
          <p className="mb-0">Submit requisition to Facility Admin</p>
        </div>

        <div className="card-body">
          {/* Success alert (optional: you can remove this since SweetAlert shows success) */}
          {success && (
            <div className="alert alert-success alert-dismissible fade show" role="alert">
              <strong>Success!</strong> Your requisition has been submitted to Facility Admin.
              <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
          )}

          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <div className="text-muted small">Department: {department}</div>
              <div>User: {username}</div>
            </div>

            {/* Priority */}
            <div className="mb-3">
              <label className="form-label">Priority</label>
              <select
                className="form-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            {/* Requisition Type */}
            <div className="mb-3">
              <label className="form-label">Requisition Type</label>
              <div>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="requisitionType"
                    id="individual"
                    value="individual"
                    checked={requisitionType === 'individual'}
                    onChange={() => setRequisitionType('individual')}
                  />
                  <label className="form-check-label" htmlFor="individual">Individual</label>
                </div>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="requisitionType"
                    id="bulk"
                    value="bulk"
                    checked={requisitionType === 'bulk'}
                    onChange={() => setRequisitionType('bulk')}
                  />
                  <label className="form-check-label" htmlFor="bulk">Bulk</label>
                </div>
              </div>
            </div>
          </div>

          {/* Requisition History with Filters */}
          <div className="mt-5">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5>Requisition History</h5>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleAddItem}
              >
                <FaPlus className="me-1" /> Create Requisition
              </button>
            </div>

            {/* Filters */}
            <div className="row mb-4 g-3">
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by Req ID, Item or Remarks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="col-md-3">
                <select
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Dispatched">Dispatched</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="col-md-3">
                <select
                  className="form-select"
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                >
                  <option value="All">All Priority</option>
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              <div className="col-md-2 d-flex align-items-end">
                <button
                  className="btn btn-outline-secondary w-100"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('All');
                    setPriorityFilter('All');
                  }}
                >
                  Clear Filters
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Req ID</th>
                    <th>Item Name</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Remarks</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequisitions.length > 0 ? (
                    filteredRequisitions.map((req,index) => (
                      <tr key={req.id}>
                        <td>{req.id}</td>
                        <td>{req.item_name || 'N/A'}</td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(req.status)}`}>
                            {req.status}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${getPriorityBadgeClass(req.priority)}`}>
                            {req.priority}
                          </span>
                        </td>
                        <td>{req.remarks || '-'}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary me-2"
                            title="View Details"
                            onClick={() => handleViewDetail(req)}
                          >
                            <FaEye />
                          </button>
                          {req.status === 'Pending' && (
                            <button
                              className="btn btn-sm btn-outline-danger"
                              title="Cancel"
                              onClick={() => handleCancelRequisition(req.id)}
                              disabled={loading}
                            >
                              <FaTimes />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-4">
                        <div className="text-muted">
                          <FaEye size={24} className="mb-2" />
                          <p>No requisitions found.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Create Requisition Modal */}
      <div className={`modal fade ${showRequisitionModal ? 'show' : ''}`}
        style={{ display: showRequisitionModal ? 'block' : 'none' }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header text-black">
              <h5 className="modal-title">Create Requisition</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowRequisitionModal(false)}
              ></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Item <span className="text-danger">*</span></label>
                  <select
                    className="form-select"
                    value={selectedItem}
                    onChange={(e) => setSelectedItem(e.target.value)}
                    required
                  >
                    <option value="">Select an item</option>
                    {loadingItems ? (
                      <option>Loading items...</option>
                    ) : facilityItems.length > 0 ? (
                      facilityItems.map(item => (
                        <option key={item.id} value={item.id}>
                          {item.item_name} ({item.quantity} {item.unit || 'units'})
                        </option>
                      ))
                    ) : (
                      <option>No items available in facility</option>
                    )}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Qty <span className="text-danger">*</span></label>
                  <input
                    type="number"
                    className="form-control"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Priority</label>
                  <select
                    className="form-select"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Remarks</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Enter any additional notes..."
                  ></textarea>
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowRequisitionModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Submitting...
                      </>
                    ) : 'Submit Requisition'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Requisition Detail Modal */}
      <div className={`modal fade ${showDetailModal ? 'show' : ''}`}
        style={{ display: showDetailModal ? 'block' : 'none' }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header text-black">
              <h5 className="modal-title">Requisition Details</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowDetailModal(false)}
              ></button>
            </div>
            <div className="modal-body">
              {selectedRequisition && (
                <>
                  <div className="row mb-3">
                    <div className="col-6">
                      <strong>Req ID:</strong>
                      <div>{selectedRequisition.id}</div>
                    </div>
                    <div className="col-6">
                      <strong>Status:</strong>
                      <div>
                        <span className={`badge ${getStatusBadgeClass(selectedRequisition.status)}`}>
                          {selectedRequisition.status}
                        </span>
                      </div>
                    </div>
                    <div className="col-6">
                      <strong>Priority:</strong>
                      <div>
                        <span className={`badge ${getPriorityBadgeClass(selectedRequisition.priority)}`}>
                          {selectedRequisition.priority}
                        </span>
                      </div>
                    </div>
                    <div className="col-6">
                      <strong>Department:</strong>
                      <div>{department}</div>
                    </div>
                    <div className="col-12">
                      <strong>Remarks:</strong>
                      <div>{selectedRequisition.remarks || '-'}</div>
                    </div>
                  </div>

                  <h6 className="mt-4 mb-3">Items in this Requisition</h6>
                  {selectedRequisition.items?.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-sm">
                        <thead>
                          <tr>
                            <th>Item Name</th>
                            <th>Qty</th>
                            <th>Priority</th>
                            {selectedRequisition.items[0].description && <th>Description</th>}
                          </tr>
                        </thead>
                        <tbody>
                          {selectedRequisition.items.map((item, idx) => (
                            <tr key={idx}>
                              <td>{item.item_name || `Item ID: ${item.item_id}`}</td>
                              <td>{item.quantity}</td>
                              <td>
                                <span className={`badge ${getPriorityBadgeClass(item.priority || 'Normal')}`}>
                                  {(item.priority || 'normal').charAt(0).toUpperCase() + (item.priority || 'normal').slice(1)}
                                </span>
                              </td>
                              {item.description && <td>{item.description}</td>}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-muted">No items found.</p>
                  )}
                </>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowDetailModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Item Detail Modal */}
      <div className={`modal fade ${showItemDetailModal ? 'show' : ''}`}
        style={{ display: showItemDetailModal ? 'block' : 'none' }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header text-black">
              <h5 className="modal-title">Item Details</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowItemDetailModal(false)}
              ></button>
            </div>
            <div className="modal-body">
              {selectedItemDetail && (
                <div className="row">
                  <div className="col-6 mb-3">
                    <strong>ID:</strong>
                    <div>{selectedItemDetail.id}</div>
                  </div>
                  <div className="col-6 mb-3">
                    <strong>Code:</strong>
                    <div>{selectedItemDetail.item_code || 'N/A'}</div>
                  </div>
                  <div className="col-12 mb-3">
                    <strong>Name:</strong>
                    <div>{selectedItemDetail.item_name}</div>
                  </div>
                  <div className="col-6 mb-3">
                    <strong>Category:</strong>
                    <div>{selectedItemDetail.category}</div>
                  </div>
                  <div className="col-6 mb-3">
                    <strong>Unit:</strong>
                    <div>{selectedItemDetail.unit || 'N/A'}</div>
                  </div>
                  <div className="col-6 mb-3">
                    <strong>Available Qty:</strong>
                    <div>{selectedItemDetail.quantity}</div>
                  </div>
                  <div className="col-6 mb-3">
                    <strong>Reorder Level:</strong>
                    <div>{selectedItemDetail.reorder_level || 'N/A'}</div>
                  </div>
                  <div className="col-12 mb-3">
                    <strong>Description:</strong>
                    <div>{selectedItemDetail.description || '-'}</div>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowItemDetailModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Backdrops */}
      {showRequisitionModal && <div className="modal-backdrop fade show"></div>}
      {showDetailModal && <div className="modal-backdrop fade show"></div>}
      {showItemDetailModal && <div className="modal-backdrop fade show"></div>}
    </div>
  );
};

export default FacilityUserRequisition;