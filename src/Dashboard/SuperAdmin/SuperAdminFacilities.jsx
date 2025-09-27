import React, { useState, useEffect } from 'react';
import { 
  FaHospital, FaClinicMedical, FaFirstAid, FaWarehouse, FaMapMarkerAlt, FaPhone, FaEnvelope,
  FaEdit, FaTrash, FaSave, FaInfoCircle, FaBox, FaClipboardList, FaUserPlus, FaPlus
} from 'react-icons/fa';
import axios from 'axios';
import BaseUrl from '../../Api/BaseUrl';
import axiosInstance from '../../Api/axiosInstance';

const SuperAdminFacilities = () => {
  // Base URL for API
  
  
  // State for modals
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAssignAdminModal, setShowAssignAdminModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // State for current facility
  const [currentFacility, setCurrentFacility] = useState(null);
  
  // State for create facility form
  const [createFacility, setCreateFacility] = useState({
    name: '',
    location: '',
    type: 'Hospital',
    contact_person: '',
    phone: '',
    email: '',
    address: ''
  });
  
  // State for assign admin form
  const [adminEmail, setAdminEmail] = useState('');
  
  // State for facilities data
  const [facilities, setFacilities] = useState([]);
  
  // State for pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  
  // State for loading
  const [loading, setLoading] = useState(true);
  
  // State for error
  const [error, setError] = useState(null);
  
  // State for delete loading
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Fetch facilities data on component mount
  useEffect(() => {
    fetchFacilities();
  }, []);
  
  // Function to fetch facilities from API
  const fetchFacilities = async (page = 1, limit = 10, status = 'active') => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`${BaseUrl}/facilities?page=${page}&limit=${limit}&status=${status}`);
      
      if (response.data.success) {
        setFacilities(response.data.data);
        setPagination(response.data.data);
        setError(null);
      } else {
        setError('Failed to fetch facilities data.');
      }
    } catch (err) {
      setError('Failed to fetch facilities data. Please try again later.');
      console.error('Error fetching facilities:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Modal handlers
  const openViewModal = (facility) => {
    setCurrentFacility(facility);
    setShowViewModal(true);
  };
  
  const openEditModal = (facility) => {
    setCurrentFacility(facility);
    setShowEditModal(true);
  };
  
  const openDeleteModal = (facility) => {
    setCurrentFacility(facility);
    setShowDeleteModal(true);
  };
  
  const openAssignAdminModal = (facility) => {
    setCurrentFacility(facility);
    setAdminEmail(facility.admin_email || '');
    setShowAssignAdminModal(true);
  };
  
  const openCreateModal = () => {
    setCreateFacility({
      name: '',
      location: '',
      type: 'Hospital',
      contact_person: '',
      phone: '',
      email: '',
      address: ''
    });
    setShowCreateModal(true);
  };
  
  // Form handlers
  const handleCreateFacilityChange = (e) => {
    const { name, value } = e.target;
    setCreateFacility({
      ...createFacility,
      [name]: value
    });
  };
  
  const handleAdminEmailChange = (e) => {
    setAdminEmail(e.target.value);
  };
  
  // Action handlers
  const handleCreateFacility = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.post(`${BaseUrl}/facilities`, createFacility);
      
      if (response.data.success) {
        setShowCreateModal(false);
        // Refresh the facilities list
        fetchFacilities();
        alert(`Facility ${createFacility.name} has been created successfully!`);
      } else {
        setError('Failed to create facility.');
        alert('Failed to create facility. Please try again.');
      }
    } catch (err) {
      setError('Failed to create facility. Please try again later.');
      console.error('Error creating facility:', err);
      alert('Failed to create facility. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteFacility = async () => {
    if (!currentFacility) return;
    
    try {
      setDeleteLoading(true);
      const response = await axiosInstance.delete(`${BaseUrl}/facilities/${currentFacility.id}`);
      
      if (response.data.success) {
        setShowDeleteModal(false);
        // Refresh the facilities list
        fetchFacilities();
        alert(`Facility ${currentFacility.name} has been deleted successfully!`);
      } else {
        setError('Failed to delete facility.');
        alert('Failed to delete facility. Please try again.');
      }
    } catch (err) {
      setError('Failed to delete facility. Please try again later.');
      console.error('Error deleting facility:', err);
      alert('Failed to delete facility. Please try again later.');
    } finally {
      setDeleteLoading(false);
    }
  };
  
  const handleAssignAdmin = () => {
    // This would need an API endpoint to assign admin
    // For now, we'll just show a message
    alert('Assign admin functionality would be implemented with a specific API endpoint');
    setShowAssignAdminModal(false);
  };
  
  // Get inventory level badge
  const getInventoryBadge = (count) => {
    if (count === 0) {
      return <span className="badge bg-danger">Empty</span>;
    } else if (count < 5) {
      return <span className="badge bg-warning">Low</span>;
    } else {
      return <span className="badge bg-success">Good</span>;
    }
  };
  
  // Get status badge
  const getStatusBadge = (status) => {
    switch(status) {
      case 'active':
        return <span className="badge bg-success">Active</span>;
      case 'inactive':
        return <span className="badge bg-secondary">Inactive</span>;
      default:
        return <span className="badge bg-secondary">Unknown</span>;
    }
  };
  
  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">Facilities Management</h2>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <FaPlus className="me-2" /> Create Facility
        </button>
      </div>
      
      {/* Loading and Error States */}
      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading facilities...</p>
        </div>
      )}
      
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      
      {/* Facilities Table */}
      {!loading && !error && (
        <div className="card border-0 shadow-sm">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Location</th>
                    <th>Type</th>
                    <th>Contact Person</th>
                    <th>Status</th>
                    <th>Users</th>
                    <th>Inventory</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {facilities.map((facility) => (
                    <tr key={facility.id}>
                      <td>{facility.id}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          {getFacilityIcon(facility.type)}
                          <span className="ms-2">{facility.name}</span>
                        </div>
                      </td>
                      <td>{facility.location}</td>
                      <td>{facility.type}</td>
                      <td>{facility.contact_person}</td>
                      <td>{getStatusBadge(facility.status)}</td>
                      <td>
                        <span className="badge bg-info">{facility.user_count}</span>
                      </td>
                      <td>
                        {getInventoryBadge(facility.inventory_count)}
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <button 
                            className="btn btn-sm btn-outline-primary" 
                            onClick={() => openViewModal(facility)}
                            title="View Details"
                          >
                            <FaInfoCircle />
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-info" 
                            onClick={() => openAssignAdminModal(facility)}
                            title="Assign Admin"
                          >
                            <FaUserPlus />
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-danger" 
                            onClick={() => openDeleteModal(facility)}
                            title="Delete Facility"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {facilities.length === 0 && (
              <div className="text-center py-4">
                <p className="text-muted">No facilities found</p>
              </div>
            )}
            
            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="d-flex justify-content-between align-items-center p-3 border-top">
                <div>
                  Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems} facilities
                </div>
                <div className="btn-group" role="group">
                  <button 
                    className="btn btn-outline-primary" 
                    disabled={pagination.currentPage === 1}
                    onClick={() => fetchFacilities(pagination.currentPage - 1)}
                  >
                    Previous
                  </button>
                  <button 
                    className="btn btn-outline-primary" 
                    disabled={pagination.currentPage === pagination.totalPages}
                    onClick={() => fetchFacilities(pagination.currentPage + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* View Facility Modal */}
      {showViewModal && currentFacility && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Facility Details: {currentFacility.name}</h5>
                <button type="button" className="btn-close" onClick={() => setShowViewModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="text-center mb-4">
                  <div className="bg-primary bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                    {getFacilityIcon(currentFacility.type)}
                  </div>
                  <h4 className="fw-bold">{currentFacility.name}</h4>
                  <p className="text-muted">{currentFacility.type}</p>
                </div>
                
                <div className="row mb-3">
                  <div className="col-md-6">
                    <div className="d-flex align-items-center mb-3">
                      <FaMapMarkerAlt className="text-primary me-2" />
                      <div>
                        <h6 className="mb-0">Location</h6>
                        <p className="text-muted mb-0">{currentFacility.location}</p>
                      </div>
                    </div>
                    <div className="d-flex align-items-center mb-3">
                      <FaPhone className="text-primary me-2" />
                      <div>
                        <h6 className="mb-0">Phone</h6>
                        <p className="text-muted mb-0">{currentFacility.phone}</p>
                      </div>
                    </div>
                    <div className="d-flex align-items-center mb-3">
                      <FaBox className="text-primary me-2" />
                      <div>
                        <h6 className="mb-0">Inventory Count</h6>
                        <p className="mb-0">{getInventoryBadge(currentFacility.inventory_count)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex align-items-center mb-3">
                      <FaEnvelope className="text-primary me-2" />
                      <div>
                        <h6 className="mb-0">Email</h6>
                        <p className="text-muted mb-0">{currentFacility.email}</p>
                      </div>
                    </div>
                    <div className="d-flex align-items-center mb-3">
                      <FaInfoCircle className="text-primary me-2" />
                      <div>
                        <h6 className="mb-0">Contact Person</h6>
                        <p className="text-muted mb-0">{currentFacility.contact_person}</p>
                      </div>
                    </div>
                    <div className="d-flex align-items-center mb-3">
                      <FaClipboardList className="text-primary me-2" />
                      <div>
                        <h6 className="mb-0">User Count</h6>
                        <p className="mb-0"><span className="badge bg-info">{currentFacility.user_count}</span></p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {currentFacility.address && (
                  <div className="mb-4">
                    <h6 className="mb-2">Address</h6>
                    <div className="card bg-light">
                      <div className="card-body">
                        {currentFacility.address}
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="mb-4">
                  <h6 className="mb-2">Status</h6>
                  <div className="card bg-light">
                    <div className="card-body">
                      {getStatusBadge(currentFacility.status)}
                    </div>
                  </div>
                </div>
                
                {currentFacility.admin_email && (
                  <div className="mb-4">
                    <h6 className="mb-2">Admin Information</h6>
                    <div className="card bg-light">
                      <div className="card-body">
                        <p className="mb-1"><strong>Name:</strong> {currentFacility.admin_name || 'N/A'}</p>
                        <p className="mb-0"><strong>Email:</strong> {currentFacility.admin_email}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="d-flex justify-content-end">
                  <button className="btn btn-outline-info me-2" onClick={() => openAssignAdminModal(currentFacility)}>
                    <FaUserPlus className="me-2" /> Assign Admin
                  </button>
                  <button className="btn btn-outline-danger" onClick={() => openDeleteModal(currentFacility)}>
                    <FaTrash className="me-2" /> Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Create Facility Modal */}
      {showCreateModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create New Facility</h5>
                <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)}></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Facility Name</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        name="name"
                        value={createFacility.name}
                        onChange={handleCreateFacilityChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Location</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        name="location"
                        value={createFacility.location}
                        onChange={handleCreateFacilityChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Facility Type</label>
                      <select 
                        className="form-select" 
                        name="type"
                        value={createFacility.type}
                        onChange={handleCreateFacilityChange}
                        required
                      >
                        <option value="Hospital">Hospital</option>
                        <option value="Clinic">Clinic</option>
                        <option value="Emergency">Emergency</option>
                        <option value="Regional Facility">Regional Facility</option>
                        <option value="Metropolitan Facility">Metropolitan Facility</option>
                        <option value="Community Health Center">Community Health Center</option>
                        <option value="Central Storage Facility">Central Storage Facility</option>
                        <option value="Coastal Regional Facility">Coastal Regional Facility</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Contact Person</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        name="contact_person"
                        value={createFacility.contact_person}
                        onChange={handleCreateFacilityChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Phone Number</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        name="phone"
                        value={createFacility.phone}
                        onChange={handleCreateFacilityChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Email Address</label>
                      <input 
                        type="email" 
                        className="form-control" 
                        name="email"
                        value={createFacility.email}
                        onChange={handleCreateFacilityChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Address</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      name="address"
                      value={createFacility.address}
                      onChange={handleCreateFacilityChange}
                    />
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-primary" onClick={handleCreateFacility}>
                  <FaSave className="me-2" /> Create Facility
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Assign Admin Modal */}
      {showAssignAdminModal && currentFacility && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Assign Admin to {currentFacility.name}</h5>
                <button type="button" className="btn-close" onClick={() => setShowAssignAdminModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Admin Email</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    value={adminEmail}
                    onChange={handleAdminEmailChange}
                    placeholder="Enter admin email address"
                    required
                  />
                </div>
                <div className="text-muted small">
                  <p className="mb-0">Note: The admin must have an existing account in the system.</p>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAssignAdminModal(false)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-info" onClick={handleAssignAdmin}>
                  <FaUserPlus className="me-2" /> Assign Admin
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Facility Modal */}
      {showDeleteModal && currentFacility && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Delete Facility</h5>
                <button type="button" className="btn-close" onClick={() => setShowDeleteModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="text-center">
                  <div className="bg-danger bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                    <FaTrash className="text-danger fa-2x" />
                  </div>
                  <h4 className="fw-bold">Are you sure?</h4>
                  <p className="text-muted">Do you really want to delete <strong>{currentFacility.name}</strong>? This process cannot be undone.</p>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger" 
                  onClick={handleDeleteFacility}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <FaTrash className="me-2" /> Delete Facility
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal Backdrop */}
      {(showViewModal || showEditModal || showDeleteModal || showAssignAdminModal || showCreateModal) && (
        <div className="modal-backdrop show"></div>
      )}
    </div>
  );
};

// Get icon based on facility type
const getFacilityIcon = (type) => {
  switch(type) {
    case 'Central Storage Facility':
      return <FaWarehouse className="text-primary" />;
    case 'Regional Facility':
    case 'Metropolitan Facility':
    case 'Coastal Regional Facility':
    case 'Hospital':
      return <FaHospital className="text-success" />;
    case 'Community Health Center':
    case 'Clinic':
      return <FaClinicMedical className="text-info" />;
    case 'Emergency':
      return <FaFirstAid className="text-warning" />;
    default:
      return <FaFirstAid className="text-warning" />;
  }
};

export default SuperAdminFacilities;