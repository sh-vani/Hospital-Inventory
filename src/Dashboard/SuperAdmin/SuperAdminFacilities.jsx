import React, { useState, useEffect } from 'react';
import { 
  FaHospital, FaClinicMedical, FaFirstAid, FaWarehouse, FaMapMarkerAlt, FaPhone, FaEnvelope,
  FaEdit, FaTrash, FaSave, FaInfoCircle, FaBox, FaClipboardList, FaUserPlus, FaPlus, FaUserTimes
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
  const [showUnassignAdminModal, setShowUnassignAdminModal] = useState(false);
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
  const [selectedAdminId, setSelectedAdminId] = useState('');
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);
  
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
  
  // State for assign admin loading
  const [assignAdminLoading, setAssignAdminLoading] = useState(false);
  
  // State for unassign admin loading
  const [unassignAdminLoading, setUnassignAdminLoading] = useState(false);
  
  // Fetch facilities data on component mount
  useEffect(() => {
    fetchFacilities();
  }, []);
  
  // Fetch admin users when assign admin modal opens
  useEffect(() => {
    if (showAssignAdminModal) {
      fetchAdminUsers();
    }
  }, [showAssignAdminModal]);
  
  // Function to fetch facilities from API
  const fetchFacilities = async (page = 1, limit = 10, status = 'active') => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`${BaseUrl}/facilities`);
      
      if (response.data.success) {
        setFacilities(response.data.data);
        // Update pagination state properly
        setPagination({
          currentPage: page,
          totalPages: Math.ceil(response.data.data.length / limit),
          totalItems: response.data.data.length,
          itemsPerPage: limit
        });
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
  
  // Function to fetch admin users from API
  const fetchAdminUsers = async () => {
    try {
      setAdminLoading(true);
      const response = await axiosInstance.get(`${BaseUrl}/users`);
      
      if (response.data.success) {
        // Filter users to only include warehouse_admin and facility_user roles
        const filteredUsers = response.data.data.filter(user => 
          user.role === 'warehouse_admin' || user.role === 'facility_admin' 
        );
        setAdminUsers(filteredUsers);
      } else {
        setError('Failed to fetch admin users.');
      }
    } catch (err) {
      setError('Failed to fetch admin users. Please try again later.');
      console.error('Error fetching admin users:', err);
    } finally {
      setAdminLoading(false);
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
    // Set the currently assigned admin if any
    setSelectedAdminId(facility.assigned_To || '');
    setShowAssignAdminModal(true);
  };
  
  const openUnassignAdminModal = (facility) => {
    setCurrentFacility(facility);
    setShowUnassignAdminModal(true);
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
  
  const handleAdminChange = (e) => {
    setSelectedAdminId(e.target.value);
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
  
  const handleAssignAdmin = async () => {
    if (!currentFacility) return;
    
    try {
      setAssignAdminLoading(true);
      const response = await axiosInstance.put(`${BaseUrl}/facilities/${currentFacility.id}/assign-admin`, {
        admin_user_id: selectedAdminId ? parseInt(selectedAdminId) : null
      });
      
      if (response.data.success) {
        setShowAssignAdminModal(false);
        // Refresh the facilities list
        fetchFacilities();
        alert(selectedAdminId ? 
          `Admin assigned successfully to ${currentFacility.name}!` : 
          `Admin unassigned successfully from ${currentFacility.name}!`
        );
      } else {
        setError(selectedAdminId ? 'Failed to assign admin.' : 'Failed to unassign admin.');
        alert(selectedAdminId ? 'Failed to assign admin. Please try again.' : 'Failed to unassign admin. Please try again.');
      }
    } catch (err) {
      setError(selectedAdminId ? 'Failed to assign admin. Please try again later.' : 'Failed to unassign admin. Please try again later.');
      console.error('Error assigning/unassigning admin:', err);
      alert(selectedAdminId ? 'Failed to assign admin. Please try again later.' : 'Failed to unassign admin. Please try again later.');
    } finally {
      setAssignAdminLoading(false);
    }
  };
  
  const handleUnassignAdmin = async () => {
    if (!currentFacility) return;
    
    try {
      setUnassignAdminLoading(true);
      const response = await axiosInstance.put(`${BaseUrl}/facilities/${currentFacility.id}/assign-admin`, {
        admin_user_id: null
      });
      
      if (response.data.success) {
        setShowUnassignAdminModal(false);
        // Refresh the facilities list
        fetchFacilities();
        alert(`Admin unassigned successfully from ${currentFacility.name}!`);
      } else {
        setError('Failed to unassign admin.');
        alert('Failed to unassign admin. Please try again.');
      }
    } catch (err) {
      setError('Failed to unassign admin. Please try again later.');
      console.error('Error unassigning admin:', err);
      alert('Failed to unassign admin. Please try again later.');
    } finally {
      setUnassignAdminLoading(false);
    }
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
  
  // Format role name for display
  const formatRoleName = (role) => {
    return role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
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
                    <th>Admin Name</th>
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
                      <td>{facility?.admin_name || '-'}</td>
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
                            title={facility.assigned_To ? "Change Admin" : "Assign Admin"}
                          >
                            {facility.assigned_To ? <FaUserTimes /> : <FaUserPlus />}
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
                
                {currentFacility.assigned_To ? (
                  <div className="mb-4">
                    <h6 className="mb-2">Assigned Admin</h6>
                    <div className="card bg-light">
                      <div className="card-body">
                        <p className="mb-1"><strong>Name:</strong> {currentFacility.admin_name || 'N/A'}</p>
                        <p className="mb-0"><strong>ID:</strong> {currentFacility.assigned_To}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4">
                    <h6 className="mb-2">Assigned Admin</h6>
                    <div className="card bg-light">
                      <div className="card-body">
                        <p className="mb-0 text-muted">No admin assigned to this facility</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="d-flex justify-content-end">
                  <button className="btn btn-outline-info me-2" onClick={() => openAssignAdminModal(currentFacility)}>
                    {currentFacility.assigned_To ? 
                      <><FaUserTimes className="me-2" /> Change Admin</> : 
                      <><FaUserPlus className="me-2" /> Assign Admin</>
                    }
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
      
      {/* Assign/Change Admin Modal */}
      {showAssignAdminModal && currentFacility && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {currentFacility.assigned_To ? "Change Admin" : "Assign Admin"} to {currentFacility.name}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowAssignAdminModal(false)}></button>
              </div>
              <div className="modal-body">
                {currentFacility.assigned_To && (
                  <div className="alert alert-info mb-3">
                    <strong>Current Admin:</strong> {currentFacility.admin_name}
                  </div>
                )}
                
                <div className="mb-3">
                  <label className="form-label">
                    {currentFacility.assigned_To ? "Select New Admin" : "Select Admin"}
                  </label>
                  {adminLoading ? (
                    <div className="text-center py-2">
                      <div className="spinner-border spinner-border-sm text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-2">Loading admin users...</p>
                    </div>
                  ) : (
                    <select 
                      className="form-select" 
                      value={selectedAdminId}
                      onChange={handleAdminChange}
                      required
                    >
                      <option value="">-- {currentFacility.assigned_To ? "Select New Admin" : "Select Admin"} --</option>
                      {adminUsers.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.name} ({formatRoleName(user.role)})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                
                <div className="form-check mb-3">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    id="unassignAdmin"
                    checked={!selectedAdminId}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedAdminId('');
                      }
                    }}
                  />
                  <label className="form-check-label" htmlFor="unassignAdmin">
                    Unassign admin (no admin will be assigned to this facility)
                  </label>
                </div>
                
                <div className="text-muted small">
                  <p className="mb-0">Note: Only warehouse admins and facility users can be assigned as admins.</p>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAssignAdminModal(false)}>
                  Cancel
                </button>
                <button 
                  type="button" 
                  className={selectedAdminId ? "btn btn-info" : "btn btn-warning"} 
                  onClick={handleAssignAdmin}
                  disabled={assignAdminLoading}
                >
                  {assignAdminLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      {selectedAdminId ? "Assigning..." : "Unassigning..."}
                    </>
                  ) : (
                    <>
                      {selectedAdminId ? 
                        <><FaUserPlus className="me-2" /> {currentFacility.assigned_To ? "Change Admin" : "Assign Admin"}</> : 
                        <><FaUserTimes className="me-2" /> Unassign Admin</>
                      }
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Unassign Admin Modal */}
      {showUnassignAdminModal && currentFacility && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Unassign Admin from {currentFacility.name}</h5>
                <button type="button" className="btn-close" onClick={() => setShowUnassignAdminModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="text-center">
                  <div className="bg-warning bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                    <FaUserTimes className="text-warning fa-2x" />
                  </div>
                  <h4 className="fw-bold">Are you sure?</h4>
                  <p className="text-muted">Do you really want to unassign <strong>{currentFacility.admin_name}</strong> from <strong>{currentFacility.name}</strong>?</p>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowUnassignAdminModal(false)}>
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-warning" 
                  onClick={handleUnassignAdmin}
                  disabled={unassignAdminLoading}
                >
                  {unassignAdminLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Unassigning...
                    </>
                  ) : (
                    <>
                      <FaUserTimes className="me-2" /> Unassign Admin
                    </>
                  )}
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
      {(showViewModal || showEditModal || showDeleteModal || showAssignAdminModal || showUnassignAdminModal || showCreateModal) && (
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