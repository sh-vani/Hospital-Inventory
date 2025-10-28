import React, { useState, useEffect } from 'react';
import { 
  FaPlus, FaSearch, FaEye, FaTruckLoading, FaCheck, FaTimes, FaFilePdf, FaEnvelope, FaSms, FaBoxOpen
} from 'react-icons/fa';
import axios from 'axios';
import BaseUrl from '../../Api/BaseUrl';

const WarehouseDispatches = () => {
  // State for search
  const [searchTerm, setSearchTerm] = useState('');
  // State for modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showMarkDeliveredModal, setShowMarkDeliveredModal] = useState(false);
  // State for current dispatch
  const [currentDispatch, setCurrentDispatch] = useState(null);
  // State for new dispatch form
  const [newDispatch, setNewDispatch] = useState({
    facility_id: '',
    requisition_id: '',
    remarks: '',
    user_id: '1', // Default user ID
    user_name: '' // NEW: Store user name
  });
  // State for current document type
  const [currentDocumentType, setCurrentDocumentType] = useState('');
  // State for notification
  const [notificationMethod, setNotificationMethod] = useState('email');
  // State for loading
  const [loading, setLoading] = useState(false);
  // State for pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: 10
  });
  
  // Mock data for dispatches
  const [dispatches, setDispatches] = useState([]);
  // State for facilities
  const [facilities, setFacilities] = useState([]);
  const [facilitiesLoading, setFacilitiesLoading] = useState(false);
  
  // State for requisitions
  const [requisitions, setRequisitions] = useState([]);
  const [requisitionsLoading, setRequisitionsLoading] = useState(false);
  // State for approved facilities (unique facility names from approved requisitions)
  const [approvedFacilities, setApprovedFacilities] = useState([]);

  // Fetch dispatches on component mount
  useEffect(() => {
    fetchDispatches();
    fetchFacilities();
    fetchRequisitions();
  }, []);

  // Function to fetch facilities
  const fetchFacilities = async () => {
    setFacilitiesLoading(true);
    try {
      const response = await axios.get(`${BaseUrl}/facilities`);
      if (response.data.success) {
        setFacilities(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching facilities:', error);
      alert('Failed to fetch facilities. Please try again.');
    } finally {
      setFacilitiesLoading(false);
    }
  };

  // Function to fetch requisitions
  const fetchRequisitions = async () => {
    setRequisitionsLoading(true);
    try {
      const response = await axios.get(`${BaseUrl}/requisitions`);
      if (response.data.success) {
        setRequisitions(response.data.data);
        
        // Filter approved requisitions and extract unique facility names
        const approvedReqs = response.data.data.filter(req => req.status === 'approved');
        const uniqueFacilities = [...new Map(approvedReqs.map(item => 
          [item.facility_name, { 
            id: item.id, 
            name: item.facility_name, 
            facility_id: item.facility_id,
            user_id: item.user_id,
            user_name: item.user_name // NEW: Store user name
          }]
        )).values()];
        
        setApprovedFacilities(uniqueFacilities);
      }
    } catch (error) {
      console.error('Error fetching requisitions:', error);
      alert('Failed to fetch requisitions. Please try again.');
    } finally {
      setRequisitionsLoading(false);
    }
  };

  // Function to fetch dispatches
  const fetchDispatches = async (page = 1) => {
    setLoading(true);
    try {
      const response = await axios.get(`${BaseUrl}/dispatches`);
      if (response.data.success) {
        setDispatches(response.data.data);
        setPagination(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching dispatches:', error);
      alert('Failed to fetch dispatches. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusColors = {
      'delivered': 'bg-success text-white',
      'in_transit': 'bg-warning text-dark',
      'processing': 'bg-info text-white',
      'cancelled': 'bg-danger text-white',
      'received': 'bg-primary text-white'
    };
    return (
      <span className={`badge ${statusColors[status] || 'bg-secondary'} rounded-pill px-3 py-1 fw-medium`}>
        {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
      </span>
    );
  };

  // Modal handlers
  const openCreateModal = () => {
    setNewDispatch({
      facility_id: '',
      requisition_id: '',
      remarks: '',
      user_id: '1',
      user_name: '' // NEW: Reset user name
    });
    setShowCreateModal(true);
  };

  const openViewModal = (dispatch) => {
    setCurrentDispatch(dispatch);
    setShowViewModal(true);
  };

  const openMarkDeliveredModal = (dispatch) => {
    setCurrentDispatch(dispatch);
    setShowMarkDeliveredModal(true);
  };

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewDispatch({
      ...newDispatch,
      [name]: value
    });
  };

  // Handler for facility selection from approved requisitions
  const handleApprovedFacilityChange = (e) => {
    const selectedFacilityId = e.target.value;
    
    if (selectedFacilityId) {
      // Find the selected facility from approved facilities
      const selectedFacility = approvedFacilities.find(f => f.id.toString() === selectedFacilityId);
      
      if (selectedFacility) {
        setNewDispatch({
          ...newDispatch,
          requisition_id: selectedFacility.id,
          facility_id: selectedFacility.facility_id,
          user_id: selectedFacility.user_id,
          user_name: selectedFacility.user_name // NEW: Set user name
        });
      }
    } else {
      setNewDispatch({
        ...newDispatch,
        requisition_id: '',
        facility_id: '',
        user_id: '1',
        user_name: '' // NEW: Reset user name
      });
    }
  };

  // Action handlers
  const handleCreateDispatch = async () => {
    if (!newDispatch.facility_id || !newDispatch.requisition_id) {
      alert('Please select a Facility from approved requisitions.');
      return;
    }

    setLoading(true);
    try {
      // Generate a tracking number if not provided
      const trackingNumber = newDispatch.tracking_number || 
        `TRK${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
      
      const response = await axios.post(`${BaseUrl}/dispatches`, {
        ...newDispatch,
        tracking_number: trackingNumber
      });
      
      if (response.data.success) {
        // Refresh the dispatches list
        await fetchDispatches(pagination.currentPage);
        setShowCreateModal(false);
        alert('Dispatch created successfully!');
      }
    } catch (error) {
      console.error('Error creating dispatch:', error);
      alert('Failed to create dispatch. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Updated handleMarkDelivered function with the correct API endpoint
  const handleMarkDelivered = async () => {
    if (!currentDispatch) return;
    
    setLoading(true);
    try {
      // Updated API call to use the correct endpoint format
      const response = await axios.patch(`${BaseUrl}/dispatches/${currentDispatch.id}/status`, {
        status: 'delivered',
        remarks: 'Delivered successfully',
        tracking_number: currentDispatch.tracking_number
      });
      
      if (response.data.success) {
        // Update the dispatch in the local state with the full response data
        const updatedDispatches = dispatches.map(dispatch => {
          if (dispatch.id === currentDispatch.id) {
            return response.data.data; // Use the complete updated dispatch object from the response
          }
          return dispatch;
        });
        
        setDispatches(updatedDispatches);
        setCurrentDispatch(response.data.data); // Update current dispatch with response data
        
        alert(`Dispatch ${currentDispatch.id} has been marked as delivered!`);
        setShowMarkDeliveredModal(false);
      }
    } catch (error) {
      console.error('Error updating dispatch status:', error);
      alert('Failed to update dispatch status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter dispatches by search term
  const filteredDispatches = dispatches.filter(dispatch =>
    dispatch.id?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
    dispatch.facility?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dispatch.tracking_number?.toLowerCase().includes(searchTerm.toLowerCase())
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
                <FaTruckLoading className="text-warning fa-2x" />
              </div>
              <div className="number text-warning fw-bold">
                {dispatches.filter(d => d.status === 'in_transit').length}
              </div>
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
              <div className="number text-info fw-bold">0</div>
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
              <div className="number text-primary fw-bold">0</div>
              <div className="label text-muted">Pending</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Dispatches Table */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-white border-0 pt-3 pb-0">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0 fw-bold">Recent Dispatches</h5>
            <div className="input-group" style={{ maxWidth: '300px' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Search dispatches..."
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
            <>
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th>Dispatch ID</th>
                      <th>Tracking Number</th>
                      <th>Facility ID</th>
                      <th>Requisition ID</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDispatches.map((dispatch,i) => (
                      <tr key={dispatch.id}>
                        <td><span className="fw-bold">#{i+1}</span></td>
                        <td>{dispatch.tracking_number}</td>
                        <td>{dispatch.facility_id}</td>
                        <td>{dispatch.requisition_id}</td>
                        <td><StatusBadge status={dispatch.status} /></td>
                        <td>
                          <div className="d-flex gap-1">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => openViewModal(dispatch)}
                              title="View Details"
                            >
                              <FaEye className="me-1" />
                              View
                            </button>
                            {dispatch.status === 'in_transit' && (
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() => openMarkDeliveredModal(dispatch)}
                                title="Mark as Delivered"
                              >
                                <FaCheck className="me-1" />
                                Delivered
                              </button>
                            )}
                          </div>
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
            </>
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
                      <label className="form-label fw-medium">Facility <span className="text-danger">*</span></label>
                      <select
                        className="form-select form-control-lg"
                        name="facility_id"
                        value={newDispatch.facility_id}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select a facility</option>
                        {facilitiesLoading ? (
                          <option disabled>Loading facilities...</option>
                        ) : (
                          facilities.map(facility => (
                            <option key={facility.id} value={facility.id}>
                              {facility.name}
                            </option>
                          ))
                        )}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-medium">Approved Requisition <span className="text-danger">*</span></label>
                      <select
                        className="form-select form-control-lg"
                        value={newDispatch.requisition_id}
                        onChange={handleApprovedFacilityChange}
                        required
                      >
                        <option value="">Select an approved requisition</option>
                        {requisitionsLoading ? (
                          <option disabled>Loading requisitions...</option>
                        ) : (
                          approvedFacilities.map(facility => (
                            <option key={facility.id} value={facility.id}>
                              {facility.name}
                            </option>
                          ))
                        )}
                      </select>
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      {/* MODIFIED: Display user name instead of user ID */}
                      <label className="form-label fw-medium">User Name</label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        name="user_name"
                        value={newDispatch.user_name}
                        onChange={handleInputChange}
                        placeholder="User name will be auto-selected"
                        readOnly
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-medium">Tracking Number</label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        name="tracking_number"
                        value={newDispatch.tracking_number}
                        onChange={handleInputChange}
                        placeholder="e.g. TRK001"
                      />
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-12">
                      <label className="form-label fw-medium">Remarks</label>
                      <textarea
                        className="form-control form-control-lg"
                        name="remarks"
                        value={newDispatch.remarks}
                        onChange={handleInputChange}
                        rows="2"
                        placeholder="Additional remarks"
                      ></textarea>
                    </div>
                  </div>
                </form>
              </div>
              <div className="modal-footer border-top-0 pt-0">
                <button type="button" className="btn btn-secondary px-4" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary px-4" 
                  onClick={handleCreateDispatch}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Creating...
                    </>
                  ) : 'Create Dispatch'}
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
                <h5 className="modal-title fw-bold">Dispatch Details: #{currentDispatch.id}</h5>
                <button type="button" className="btn-close" onClick={() => setShowViewModal(false)}></button>
              </div>
              <div className="modal-body py-4">
                <div className="row mb-4">
                  <div className="col-md-6">
                    <p><strong>Dispatch ID:</strong> #{currentDispatch.id}</p>
                    <p><strong>Tracking Number:</strong> {currentDispatch.tracking_number}</p>
                    <p><strong>Facility ID:</strong> {currentDispatch.facility_id}</p>
                    {/* MODIFIED: Display user name instead of user ID */}
                    <p><strong>User Name:</strong> {currentDispatch.user_name || currentDispatch.dispatched_by_name || 'N/A'}</p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>Requisition ID:</strong> {currentDispatch.requisition_id}</p>
                    <p><strong>Status:</strong> <StatusBadge status={currentDispatch.status} /></p>
                    <p><strong>Created At:</strong> {currentDispatch.created_at}</p>
                    <p><strong>Updated At:</strong> {currentDispatch.updated_at}</p>
                  </div>
                </div>
                
                <div className="mb-3">
                  <h6 className="mb-2">Remarks:</h6>
                  <div className="card bg-light">
                    <div className="card-body">
                      {currentDispatch.remarks || 'No remarks provided'}
                    </div>
                  </div>
                </div>
                
                {currentDispatch.facility_name && (
                  <div className="mb-3">
                    <h6 className="mb-2">Facility Name:</h6>
                    <div className="card bg-light">
                      <div className="card-body">
                        {currentDispatch.facility_name}
                      </div>
                    </div>
                  </div>
                )}
                
                {currentDispatch.dispatched_by_name && (
                  <div className="mb-3">
                    <h6 className="mb-2">Dispatched By:</h6>
                    <div className="card bg-light">
                      <div className="card-body">
                        {currentDispatch.dispatched_by_name}
                      </div>
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
      
      {/* Mark Delivered Modal */}
      {showMarkDeliveredModal && currentDispatch && (
        <div className="modal fade show d-block" tabIndex="-1" onClick={(e) => {
          if (e.target.classList.contains('modal')) setShowMarkDeliveredModal(false);
        }}>
          <div className="modal-dialog modal-md modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold">Mark as Delivered</h5>
                <button type="button" className="btn-close" onClick={() => setShowMarkDeliveredModal(false)}></button>
              </div>
              <div className="modal-body py-4">
                <p>Are you sure you want to mark dispatch <strong>#{currentDispatch.id}</strong> with tracking number <strong>{currentDispatch.tracking_number}</strong> as delivered?</p>
                <div className="alert alert-info">
                  This action will update the status from "in_transit" to "delivered".
                </div>
              </div>
              <div className="modal-footer border-top-0 pt-0">
                <button type="button" className="btn btn-secondary px-4" onClick={() => setShowMarkDeliveredModal(false)}>
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-success px-4" 
                  onClick={handleMarkDelivered}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Updating...
                    </>
                  ) : (
                    <>
                      <FaCheck className="me-2" /> Mark as Delivered
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal Backdrop */}
      {(showCreateModal || showViewModal || showMarkDeliveredModal) && (
        <div className="modal-backdrop fade show"></div>
      )}
    </div>
  );
};

export default WarehouseDispatches;