import React, { useState, useEffect } from 'react';
import { 
  FaPlus, FaHospital, FaClinicMedical, FaFirstAid, FaWarehouse, FaMapMarkerAlt, FaPhone, FaEnvelope,
  FaEdit, FaTrash, FaTimes, FaSave, FaInfoCircle, FaBox, FaClipboardList, FaExclamationTriangle, FaCheckCircle
} from 'react-icons/fa';
import axios from 'axios';
import BaseUrl from '../../Api/BaseUrl';

const SuperAdminFacilities = () => {
  // State for modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // State for current facility
  const [currentFacility, setCurrentFacility] = useState(null);
  
  // State for new facility form
  const [newFacility, setNewFacility] = useState({
    name: '',
    type: 'Hospital',
    address: '',
    phone: '',
    email: '',
    description: '',
    capacity: '',
    services: '',
    inventory_level: 'Good',
    pending_requisitions: 0
  });
  
  // State for edit facility form
  const [editFacility, setEditFacility] = useState({
    name: '',
    type: 'Hospital',
    address: '',
    phone: '',
    email: '',
    description: '',
    capacity: '',
    services: '',
    inventory_level: 'Good',
    pending_requisitions: 0
  });
  
  // State for facilities data
  const [facilities, setFacilities] = useState([]);
  
  // State for summary data
  const [summary, setSummary] = useState({
    totalFacilities: 0,
    facilitiesByType: [],
    inventoryLevels: [],
    totalPending: 0
  });
  
  // State for loading
  const [loading, setLoading] = useState(true);
  
  // State for error
  const [error, setError] = useState(null);
  
  // API base URL - replace with your actual API base URL
  
  // Fetch facilities and summary data on component mount
  useEffect(() => {
    fetchFacilities();
    fetchSummary();
  }, []);
  
  // Function to fetch facilities
  const fetchFacilities = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BaseUrl}/facilities`);
      // Transform the response data to match the component's expected format
      const transformedData = response.data.map(facility => ({
        id: facility.id,
        name: facility.name,
        type: facility.type,
        icon: getFacilityIcon(facility.type),
        address: facility.address,
        phone: facility.phone,
        email: facility.email,
        description: facility.description,
        capacity: facility.capacity,
        services: facility.services,
        inventoryLevel: facility.inventory_level,
        pendingRequisitions: facility.pending_requisitions
      }));
      setFacilities(transformedData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch facilities. Please try again later.');
      console.error('Error fetching facilities:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Function to fetch summary data
  const fetchSummary = async () => {
    try {
      const response = await axios.get(`${BaseUrl}/getfacilitiesSummary`);
      setSummary(response.data);
    } catch (err) {
      console.error('Error fetching summary:', err);
    }
  };
  
  // Modal handlers
  const openAddModal = () => {
    setNewFacility({
      name: '',
      type: 'Hospital',
      address: '',
      phone: '',
      email: '',
      description: '',
      capacity: '',
      services: '',
      inventory_level: 'Good',
      pending_requisitions: 0
    });
    setShowAddModal(true);
  };
  
  const openViewModal = (facility) => {
    setCurrentFacility(facility);
    setShowViewModal(true);
  };
  
  const openEditModal = (facility) => {
    setEditFacility({
      name: facility.name,
      type: facility.type,
      address: facility.address,
      phone: facility.phone,
      email: facility.email,
      description: facility.description,
      capacity: facility.capacity,
      services: facility.services,
      inventory_level: facility.inventoryLevel,
      pending_requisitions: facility.pendingRequisitions
    });
    setCurrentFacility(facility);
    setShowEditModal(true);
  };
  
  const openDeleteModal = (facility) => {
    setCurrentFacility(facility);
    setShowDeleteModal(true);
  };
  
  // Form handlers
  const handleAddFacilityChange = (e) => {
    const { name, value } = e.target;
    setNewFacility({
      ...newFacility,
      [name]: value
    });
  };
  
  const handleEditFacilityChange = (e) => {
    const { name, value } = e.target;
    setEditFacility({
      ...editFacility,
      [name]: value
    });
  };
  
  // Action handlers
  const handleAddFacility = async () => {
    try {
      // Prepare data for API
      const facilityData = {
        name: newFacility.name,
        type: newFacility.type,
        phone: newFacility.phone,
        email: newFacility.email,
        address: newFacility.address,
        capacity: newFacility.capacity,
        services: newFacility.services,
        inventory_level: newFacility.inventory_level,
        pending_requisitions: parseInt(newFacility.pending_requisitions),
        description: newFacility.description
      };
      
      // Call API to add facility
      const response = await axios.post(`${BaseUrl}/facilities`, facilityData);
      
      // Transform the response to match the component's expected format
      const facilityType = newFacility.type;
      const icon = getFacilityIcon(facilityType);
      
      const newItem = {
        id: response.data.id || facilities.length + 1,
        name: newFacility.name,
        type: newFacility.type,
        icon: icon,
        address: newFacility.address,
        phone: newFacility.phone,
        email: newFacility.email,
        description: newFacility.description,
        capacity: newFacility.capacity,
        services: newFacility.services,
        inventoryLevel: newFacility.inventory_level,
        pendingRequisitions: parseInt(newFacility.pending_requisitions)
      };
      
      setFacilities([...facilities, newItem]);
      setShowAddModal(false);
      
      // Refresh summary data
      fetchSummary();
    } catch (err) {
      console.error('Error adding facility:', err);
      alert('Failed to add facility. Please try again.');
    }
  };
  
  const handleEditFacility = async () => {
    try {
      // Prepare data for API
      const facilityData = {
        name: editFacility.name,
        type: editFacility.type,
        phone: editFacility.phone,
        email: editFacility.email,
        address: editFacility.address,
        capacity: editFacility.capacity,
        services: editFacility.services,
        inventory_level: editFacility.inventory_level,
        pending_requisitions: parseInt(editFacility.pending_requisitions),
        description: editFacility.description
      };
      
      // Call API to update facility
      await axios.put(`${BaseUrl}/facilities/${currentFacility.id}`, facilityData);
      
      // Update the facility in the state
      const updatedFacilities = facilities.map(facility => 
        facility.id === currentFacility.id 
          ? { 
              ...editFacility, 
              id: currentFacility.id,
              icon: getFacilityIcon(editFacility.type),
              inventoryLevel: editFacility.inventory_level,
              pendingRequisitions: parseInt(editFacility.pending_requisitions)
            } 
          : facility
      );
      
      setFacilities(updatedFacilities);
      setShowEditModal(false);
      
      // Refresh summary data
      fetchSummary();
    } catch (err) {
      console.error('Error updating facility:', err);
      alert('Failed to update facility. Please try again.');
    }
  };
  
  const handleDeleteFacility = async () => {
    try {
      // Call API to delete facility
      await axios.delete(`${BaseUrl}/facilities/${currentFacility.id}`);
      
      // Update the facilities list in state
      const updatedFacilities = facilities.filter(facility => 
        facility.id !== currentFacility.id
      );
      
      setFacilities(updatedFacilities);
      setShowDeleteModal(false);
      
      // Refresh summary data
      fetchSummary();
    } catch (err) {
      console.error('Error deleting facility:', err);
      alert('Failed to delete facility. Please try again.');
    }
  };
  
  // Get icon based on facility type
  const getFacilityIcon = (type) => {
    switch(type) {
      case 'Central Storage Facility':
        return <FaWarehouse className="text-primary" />;
      case 'Regional Facility':
      case 'Metropolitan Facility':
      case 'Coastal Regional Facility':
        return <FaHospital className="text-success" />;
      case 'Community Health Center':
        return <FaClinicMedical className="text-info" />;
      default:
        return <FaFirstAid className="text-warning" />;
    }
  };
  
  // Get inventory level badge
  const getInventoryBadge = (level) => {
    switch(level) {
      case 'Good':
        return <span className="badge bg-success">Good</span>;
      case 'Low':
        return <span className="badge bg-warning">Low</span>;
      case 'Critical':
        return <span className="badge bg-danger">Critical</span>;
      default:
        return <span className="badge bg-secondary">Unknown</span>;
    }
  };
  
  // Calculate stats for display
  const getStats = () => {
    const hospitalsCount = summary.facilitiesByType?.find(item => 
      item.type === 'Hospital' || item.type === 'Regional Facility' || 
      item.type === 'Metropolitan Facility' || item.type === 'Coastal Regional Facility'
    )?.count || 0;
    
    const clinicsCount = summary.facilitiesByType?.find(item => 
      item.type === 'Community Health Center'
    )?.count || 0;
    
    const warehouseCount = summary.facilitiesByType?.find(item => 
      item.type === 'Central Storage Facility'
    )?.count || 0;
    
    return {
      totalFacilities: summary.totalFacilities || 0,
      hospitalsCount,
      clinicsCount,
      warehouseCount
    };
  };
  
  const stats = getStats();
  
  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Facilities Management</h2>
        <button className="btn btn-primary d-flex align-items-center" onClick={openAddModal}>
          <FaPlus className="me-2" /> Add New Facility
        </button>
      </div>
      
      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card border-0 shadow-sm h-100 stat-card">
            <div className="card-body text-center p-4">
              <div className="bg-primary bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                <FaHospital className="text-primary fa-2x" />
              </div>
              <div className="number text-primary fw-bold">{stats.totalFacilities}</div>
              <div className="label text-muted">Total Facilities</div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card border-0 shadow-sm h-100 stat-card">
            <div className="card-body text-center p-4">
              <div className="bg-success bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                <FaClinicMedical className="text-success fa-2x" />
              </div>
              <div className="number text-success fw-bold">{stats.hospitalsCount}</div>
              <div className="label text-muted">Hospitals</div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card border-0 shadow-sm h-100 stat-card">
            <div className="card-body text-center p-4">
              <div className="bg-warning bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                <FaFirstAid className="text-warning fa-2x" />
              </div>
              <div className="number text-warning fw-bold">{stats.clinicsCount}</div>
              <div className="label text-muted">Clinics</div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card border-0 shadow-sm h-100 stat-card">
            <div className="card-body text-center p-4">
              <div className="bg-info bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                <FaWarehouse className="text-info fa-2x" />
              </div>
              <div className="number text-info fw-bold">{stats.warehouseCount}</div>
              <div className="label text-muted">Warehouse</div>
            </div>
          </div>
        </div>
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
      
      {/* Facilities Cards - Square Design */}
      {!loading && !error && (
        <div className="row">
          {facilities.map((facility) => (
            <div className="col-md-3 col-sm-6 mb-4" key={facility.id}>
              <div className="card border-0 shadow-sm facility-card">
                <div className="card-body d-flex flex-column p-3">
                  {/* Icon and Title */}
                  <div className="text-center mb-3">
                    <div className="bg-light p-3 rounded-circle d-inline-block mb-2">
                      {React.cloneElement(facility.icon, { className: `${facility.icon.props.className} fa-2x` })}
                    </div>
                    <h5 className="fw-bold mb-0">{facility.name}</h5>
                    <p className="text-muted small mb-0">{facility.type}</p>
                  </div>
                  
                  {/* Inventory Level */}
                  <div className="mb-2">
                    <div className="d-flex align-items-center justify-content-center">
                      <FaBox className="me-2 text-muted" />
                      <span className="me-2">Inventory:</span>
                      {getInventoryBadge(facility.inventoryLevel)}
                    </div>
                  </div>
                  
                  {/* Pending Requisitions */}
                  <div className="mb-3">
                    <div className="d-flex align-items-center justify-content-center">
                      <FaClipboardList className="me-2 text-muted" />
                      <span className="me-2">Pending:</span>
                      <span className="badge bg-info">{facility.pendingRequisitions}</span>
                    </div>
                  </div>
                  
                  {/* View Details Button */}
                  <div className="mt-auto">
                    <button 
                      className="btn btn-sm btn-outline-primary w-100" 
                      onClick={() => openViewModal(facility)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Add Facility Modal */}
      {showAddModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Facility</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
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
                        value={newFacility.name}
                        onChange={handleAddFacilityChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Facility Type</label>
                      <select 
                        className="form-select" 
                        name="type"
                        value={newFacility.type}
                        onChange={handleAddFacilityChange}
                        required
                      >
                        <option value="Hospital">Hospital</option>
                        <option value="Regional Facility">Regional Facility</option>
                        <option value="Metropolitan Facility">Metropolitan Facility</option>
                        <option value="Community Health Center">Community Health Center</option>
                        <option value="Central Storage Facility">Central Storage Facility</option>
                        <option value="Coastal Regional Facility">Coastal Regional Facility</option>
                      </select>
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Phone Number</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        name="phone"
                        value={newFacility.phone}
                        onChange={handleAddFacilityChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Email Address</label>
                      <input 
                        type="email" 
                        className="form-control" 
                        name="email"
                        value={newFacility.email}
                        onChange={handleAddFacilityChange}
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
                      value={newFacility.address}
                      onChange={handleAddFacilityChange}
                      required
                    />
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Capacity</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        name="capacity"
                        value={newFacility.capacity}
                        onChange={handleAddFacilityChange}
                        placeholder="e.g. 300 beds, 10,000 sq meters"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Services</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        name="services"
                        value={newFacility.services}
                        onChange={handleAddFacilityChange}
                        placeholder="e.g. Emergency, Surgery, Pharmacy"
                      />
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Inventory Level</label>
                      <select 
                        className="form-select" 
                        name="inventory_level"
                        value={newFacility.inventory_level}
                        onChange={handleAddFacilityChange}
                        required
                      >
                        <option value="Good">Good</option>
                        <option value="Low">Low</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Pending Requisitions</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        name="pending_requisitions"
                        value={newFacility.pending_requisitions}
                        onChange={handleAddFacilityChange}
                        min="0"
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea 
                      className="form-control" 
                      name="description"
                      value={newFacility.description}
                      onChange={handleAddFacilityChange}
                      rows="3"
                    ></textarea>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-primary" onClick={handleAddFacility}>
                  Add Facility
                </button>
              </div>
            </div>
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
                    {React.cloneElement(currentFacility.icon, { className: `${currentFacility.icon.props.className} fa-4x` })}
                  </div>
                  <h4 className="fw-bold">{currentFacility.name}</h4>
                  <p className="text-muted">{currentFacility.type}</p>
                </div>
                
                <div className="row mb-3">
                  <div className="col-md-6">
                    <div className="d-flex align-items-center mb-3">
                      <FaMapMarkerAlt className="text-primary me-2" />
                      <div>
                        <h6 className="mb-0">Address</h6>
                        <p className="text-muted mb-0">{currentFacility.address}</p>
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
                        <h6 className="mb-0">Inventory Level</h6>
                        <p className="mb-0">{getInventoryBadge(currentFacility.inventoryLevel)}</p>
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
                        <h6 className="mb-0">Capacity</h6>
                        <p className="text-muted mb-0">{currentFacility.capacity}</p>
                      </div>
                    </div>
                    <div className="d-flex align-items-center mb-3">
                      <FaClipboardList className="text-primary me-2" />
                      <div>
                        <h6 className="mb-0">Pending Requisitions</h6>
                        <p className="mb-0"><span className="badge bg-info">{currentFacility.pendingRequisitions}</span></p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h6 className="mb-2">Services</h6>
                  <div className="card bg-light">
                    <div className="card-body">
                      {currentFacility.services}
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h6 className="mb-2">Description</h6>
                  <div className="card bg-light">
                    <div className="card-body">
                      {currentFacility.description}
                    </div>
                  </div>
                </div>
                
                <div className="d-flex justify-content-end">
                  <button className="btn btn-outline-primary me-2" onClick={() => openEditModal(currentFacility)}>
                    <FaEdit className="me-2" /> Edit
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
      
      {/* Edit Facility Modal */}
      {showEditModal && currentFacility && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Facility: {currentFacility.name}</h5>
                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
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
                        value={editFacility.name}
                        onChange={handleEditFacilityChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Facility Type</label>
                      <select 
                        className="form-select" 
                        name="type"
                        value={editFacility.type}
                        onChange={handleEditFacilityChange}
                        required
                      >
                        <option value="Hospital">Hospital</option>
                        <option value="Regional Facility">Regional Facility</option>
                        <option value="Metropolitan Facility">Metropolitan Facility</option>
                        <option value="Community Health Center">Community Health Center</option>
                        <option value="Central Storage Facility">Central Storage Facility</option>
                        <option value="Coastal Regional Facility">Coastal Regional Facility</option>
                      </select>
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Phone Number</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        name="phone"
                        value={editFacility.phone}
                        onChange={handleEditFacilityChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Email Address</label>
                      <input 
                        type="email" 
                        className="form-control" 
                        name="email"
                        value={editFacility.email}
                        onChange={handleEditFacilityChange}
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
                      value={editFacility.address}
                      onChange={handleEditFacilityChange}
                      required
                    />
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Capacity</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        name="capacity"
                        value={editFacility.capacity}
                        onChange={handleEditFacilityChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Services</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        name="services"
                        value={editFacility.services}
                        onChange={handleEditFacilityChange}
                      />
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Inventory Level</label>
                      <select 
                        className="form-select" 
                        name="inventory_level"
                        value={editFacility.inventory_level}
                        onChange={handleEditFacilityChange}
                        required
                      >
                        <option value="Good">Good</option>
                        <option value="Low">Low</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Pending Requisitions</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        name="pending_requisitions"
                        value={editFacility.pending_requisitions}
                        onChange={handleEditFacilityChange}
                        min="0"
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea 
                      className="form-control" 
                      name="description"
                      value={editFacility.description}
                      onChange={handleEditFacilityChange}
                      rows="3"
                    ></textarea>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-primary" onClick={handleEditFacility}>
                  <FaSave className="me-2" /> Save Changes
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
                <button type="button" className="btn btn-danger" onClick={handleDeleteFacility}>
                  <FaTrash className="me-2" /> Delete Facility
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal Backdrop */}
      {(showAddModal || showViewModal || showEditModal || showDeleteModal) && (
        <div className="modal-backdrop show"></div>
      )}
    </div>
  );
};

export default SuperAdminFacilities;