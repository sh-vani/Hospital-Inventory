import React, { useState, useEffect } from 'react';
import {
  FaSearch, FaEye, FaEdit, FaUserPlus, FaUserMinus, FaPlus
} from 'react-icons/fa';
import axiosInstance from '../../Api/axiosInstance';
import Swal from 'sweetalert2'; // ✅ Import SweetAlert2

const SuperAdminAssets = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentAsset, setCurrentAsset] = useState(null);
  
  const [newAsset, setNewAsset] = useState({
    id: '',
    name: '',
    type: 'Medical Equipment',
    serial_number: '',
    model: '',
    manufacturer: '',
    purchase_date: '',
    warranty_expiry: '',
    department: '',
    assigned_to: '',
    status: 'active'
  });

  const [createAsset, setCreateAsset] = useState({
    name: '',
    type: 'Medical Equipment',
    serial_number: '',
    model: '',
    manufacturer: '',
    purchase_date: '',
    warranty_expiry: '',
    department: ''
  });

  const [assignForm, setAssignForm] = useState({ facility_id: '' });
  const [assets, setAssets] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [facilitiesLoading, setFacilitiesLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  // Fetch assets from API
  const fetchAssets = async (page = 1, type = '', status = 'active') => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: 10
      };
      
      if (type) params.type = type;
      if (status) params.status = status;
      
      const response = await axiosInstance.get('/assets', { params });
      
      if (response.data.success) {
        setAssets(response.data.data || []);
        setPagination({
          currentPage: response.data.currentPage || 1,
          totalPages: response.data.totalPages || 1,
          totalItems: response.data.totalItems || 0,
          itemsPerPage: response.data.itemsPerPage || 10
        });
      } else {
        setError('Failed to fetch assets');
      }
    } catch (err) {
      setError('Error fetching assets: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Fetch facilities from API
  const fetchFacilities = async () => {
    setFacilitiesLoading(true);
    try {
      const response = await axiosInstance.get('/facilities');
      
      if (response.data.success) {
        const facilitiesList = response.data.data || [];
        setFacilities(facilitiesList);
        
        if (facilitiesList.length > 0 && !assignForm.facility_id) {
          setAssignForm(prev => ({ ...prev, facility_id: String(facilitiesList[0].id) }));
        }
      } else {
        setError('Failed to fetch facilities');
      }
    } catch (err) {
      setError('Error fetching facilities: ' + (err.response?.data?.message || err.message));
    } finally {
      setFacilitiesLoading(false);
    }
  };

  // Create a new asset
  const handleCreateAsset = async () => {
    try {
      const payload = { ...createAsset };
      if (assignForm.facility_id) {
        payload.facility_id = parseInt(assignForm.facility_id, 10);
      }

      const response = await axiosInstance.post('/assets', payload);
      
      if (response.data.success) {
        setShowCreateModal(false);
        setCreateAsset({
          name: '',
          type: 'Medical Equipment',
          serial_number: '',
          model: '',
          manufacturer: '',
          purchase_date: '',
          warranty_expiry: '',
          department: ''
        });
        fetchAssets(pagination.currentPage);
        Swal.fire('Success!', 'Asset created successfully!', 'success');
      } else {
        Swal.fire('Error!', 'Failed to create asset: ' + (response.data.message || 'Unknown error'), 'error');
      }
    } catch (err) {
      Swal.fire('Error!', 'Error creating asset: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  // Handle edit asset
  const handleEditAsset = async () => {
    try {
      const payload = {
        name: newAsset.name,
        type: newAsset.type,
        serial_number: newAsset.serial_number,
        model: newAsset.model,
        manufacturer: newAsset.manufacturer,
        purchase_date: newAsset.purchase_date,
        warranty_expiry: newAsset.warranty_expiry,
        department: newAsset.department,
        assigned_to: newAsset.assigned_to ? parseInt(newAsset.assigned_to, 10) : null,
        status: newAsset.status
      };

      const response = await axiosInstance.put(`/assets/${newAsset.id}`, payload);
      
      if (response.data.success) {
        setShowEditModal(false);
        fetchAssets(pagination.currentPage);
        Swal.fire('Success!', 'Asset updated successfully!', 'success');
      } else {
        Swal.fire('Error!', 'Failed to update asset: ' + (response.data.message || 'Unknown error'), 'error');
      }
    } catch (err) {
      Swal.fire('Error!', 'Error updating asset: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  // Assign asset to facility
  const handleAssignAsset = async () => {
    try {
      const payload = {
        facility_id: parseInt(assignForm.facility_id, 10)
      };
      
      const response = await axiosInstance.put(`/assets/facility/${currentAsset.id}`, payload);
      
      if (response.data.success) {
        setShowAssignModal(false);
        fetchAssets(pagination.currentPage);
        Swal.fire('Success!', 'Asset assigned to facility successfully!', 'success');
      } else {
        Swal.fire('Error!', 'Failed to assign asset: ' + (response.data.message || 'Unknown error'), 'error');
      }
    } catch (err) {
      Swal.fire('Error!', 'Error assigning asset: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchAssets();
    fetchFacilities();
  }, []);

  // Badges
  const StatusBadge = ({ status }) => {
    const map = {
      'active': 'bg-success',
      'inactive': 'bg-secondary',
      'maintenance': 'bg-warning text-dark',
      'retired': 'bg-secondary'
    };
    return <span className={`badge ${map[status] || 'bg-secondary'}`}>{status}</span>;
  };

  // Handlers
  const openViewModal = (asset) => { 
    setCurrentAsset(asset); 
    setShowViewModal(true); 
  };

  const openEditModal = (asset) => { 
    setNewAsset({
      id: asset.id,
      name: asset.name,
      type: asset.type,
      serial_number: asset.serial_number,
      model: asset.model,
      manufacturer: asset.manufacturer,
      purchase_date: asset.purchase_date ? asset.purchase_date.split('T')[0] : '',
      warranty_expiry: asset.warranty_expiry ? asset.warranty_expiry.split('T')[0] : '',
      department: asset.department,
      assigned_to: asset.assigned_to ? String(asset.assigned_to) : '',
      status: asset.status
    }); 
    setShowEditModal(true); 
  };

  const openAssignModal = (asset) => {
    setCurrentAsset(asset);
    const defaultFacilityId = asset.facility_id 
      ? String(asset.facility_id) 
      : (facilities.length > 0 ? String(facilities[0].id) : '');
    setAssignForm({ facility_id: defaultFacilityId });
    setShowAssignModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setNewAsset(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    setCreateAsset(prev => ({ ...prev, [name]: value }));
  };

  const handleAssignChange = (e) => {
    setAssignForm({ facility_id: e.target.value });
  };

  // Search
  const filtered = assets.filter(a => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return (
      a.id.toString().toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q) ||
      a.type.toLowerCase().includes(q) ||
      a.department.toLowerCase().includes(q) ||
      a.serial_number.toLowerCase().includes(q) ||
      (a.assigned_to_name && a.assigned_to_name.toLowerCase().includes(q)) ||
      a.status.toLowerCase().includes(q)
    );
  });

  // Stats calculation
  const totalAssets = assets.length;
  const inUseAssets = assets.filter(a => a.status === 'active' && a.assigned_to).length;
  const maintenanceAssets = assets.filter(a => a.status === 'maintenance').length;
  const needAttentionAssets = assets.filter(a => a.status === 'active' && !a.assigned_to).length;

  return (
    <div className="container-fluid py-3">
      {/* Toolbar */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center gap-2 mb-4">
        <h2 className="fw-bold mb-0">Assets Management</h2>
        <div className="d-flex flex-column flex-sm-row align-items-stretch gap-2 w-90 w-md-auto">
          <div className="input-group">
            <input
              type="text"
              className="form-control form-control-sm"
              style={{ height: "40px" }}
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search assets"
            />
            <button className="btn btn-outline-secondary btn-sm" style={{ height: "40px" }} type="button">
              <FaSearch />
            </button>
          </div>
          <button className="btn btn-primary btn-sm" style={{ height: "40px", whiteSpace: "nowrap" }} onClick={() => setShowCreateModal(true)}>
            <FaPlus className="me-1" /> Add Asset
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="row row-cols-1 row-cols-md-4 g-3 mb-4">
        <div className="col">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center p-4">
              <div className="bg-success bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                <span className="text-success fs-3">🏢</span>
              </div>
              <div className="text-success fw-bold fs-4">{totalAssets}</div>
              <div className="text-muted small">Total Assets</div>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center p-4">
              <div className="bg-primary bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                <span className="text-primary fs-3">✅</span>
              </div>
              <div className="text-primary fw-bold fs-4">{inUseAssets}</div>
              <div className="text-muted small">In Use</div>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center p-4">
              <div className="bg-warning bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                <span className="text-warning fs-3">🔧</span>
              </div>
              <div className="text-warning fw-bold fs-4">{maintenanceAssets}</div>
              <div className="text-muted small">Under Maintenance</div>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center p-4">
              <div className="bg-info bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                <span className="text-info fs-3">⚠️</span>
              </div>
              <div className="text-info fw-bold fs-4">{needAttentionAssets}</div>
              <div className="text-muted small">Need Attention</div>
            </div>
          </div>
        </div>
      </div>

      {/* Assets Table / Card List */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-white border-0 pt-4">
          <h5 className="mb-0 fw-bold">Hospital Assets</h5>
        </div>

        {loading ? (
          <div className="card-body text-center p-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading assets...</p>
          </div>
        ) : error ? (
          <div className="card-body text-center p-5">
            <div className="alert alert-danger">{error}</div>
            <button className="btn btn-primary" onClick={() => fetchAssets()}>Retry</button>
          </div>
        ) : (
          <>
            {/* TABLE (md and up) */}
            <div className="card-body p-0 d-none d-md-block">
              <div className="table-responsive">
                <table className="table table-hover mb-0 align-middle">
                  <thead className="bg-light">
                    <tr>
                      <th>Asset ID</th>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Serial Number</th>
                      <th>Department</th>
                      <th>Facility</th>
                      <th>Status</th>
                      <th className="text-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((asset,index) => (
                      <tr key={asset.id}>
                        <td className="fw-bold">{index+1}</td>
                        <td>{asset.name}</td>
                        <td>{asset.type}</td>
                        <td>{asset.serial_number}</td>
                        <td>{asset.department}</td>
                        <td>{asset.facility_name || '—'}</td>
                        <td><StatusBadge status={asset.status} /></td>
                        <td>
                          <div className="btn-group" role="group">
                            <button className="btn btn-sm btn-outline-primary" onClick={() => openViewModal(asset)}>
                              <FaEye />
                            </button>
                            <button className="btn btn-sm btn-outline-warning" onClick={() => openEditModal(asset)}>
                              <FaEdit />
                            </button>
                            <button
                              className={`btn btn-sm ${asset.facility_id ? 'btn-outline-danger' : 'btn-outline-success'}`}
                              onClick={() => openAssignModal(asset)}
                            >
                              {asset.facility_id ? <FaUserMinus /> : <FaUserPlus />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* CARD LIST (mobile) */}
            <div className="card-body d-block d-md-none">
              <div className="row g-2">
                {filtered.map((a) => (
                  <div className="col-12" key={a.id}>
                    <div className="card">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="fw-bold">{a.id}</span>
                          <StatusBadge status={a.status} />
                        </div>
                        <div className="row g-2 small">
                          <div className="col-6">
                            <div className="text-muted">Name</div>
                            <div>{a.name}</div>
                          </div>
                          <div className="col-6">
                            <div className="text-muted">Type</div>
                            <div>{a.type}</div>
                          </div>
                          <div className="col-6">
                            <div className="text-muted">Serial No.</div>
                            <div>{a.serial_number}</div>
                          </div>
                          <div className="col-6">
                            <div className="text-muted">Department</div>
                            <div>{a.department}</div>
                          </div>
                          <div className="col-6">
                            <div className="text-muted">Facility</div>
                            <div>{a.facility_name || '—'}</div>
                          </div>
                          <div className="col-6">
                            <div className="text-muted">Status</div>
                            <div><StatusBadge status={a.status} /></div>
                          </div>
                        </div>
                        <div className="d-flex gap-2 mt-3">
                          <button className="btn btn-outline-primary w-100 btn-sm" onClick={() => openViewModal(a)}>
                            <FaEye className="me-1" /> View
                          </button>
                          <button className="btn btn-outline-warning w-100 btn-sm" onClick={() => openEditModal(a)}>
                            <FaEdit className="me-1" /> Edit
                          </button>
                          <button
                            className={`btn w-100 btn-sm ${a.facility_id ? 'btn-outline-danger' : 'btn-outline-success'}`}
                            onClick={() => openAssignModal(a)}
                          >
                            {a.facility_id ? <><FaUserMinus className="me-1" /> Unassign</> : <><FaUserPlus className="me-1" /> Assign</>}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {filtered.length === 0 && (
                  <div className="col-12">
                    <div className="alert alert-light border text-center mb-0">No assets found.</div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* View Modal */}
      {showViewModal && currentAsset && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable modal-fullscreen-sm-down">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Asset Details: {currentAsset.id}</h5>
                <button type="button" className="btn-close" onClick={() => setShowViewModal(false)}></button>
              </div>
              <div className="modal-body">
                <p><strong>Name:</strong> {currentAsset.name}</p>
                <p><strong>Type:</strong> {currentAsset.type}</p>
                <p><strong>Serial Number:</strong> {currentAsset.serial_number}</p>
                <p><strong>Model:</strong> {currentAsset.model}</p>
                <p><strong>Manufacturer:</strong> {currentAsset.manufacturer}</p>
                <p><strong>Purchase Date:</strong> {currentAsset.purchase_date ? currentAsset.purchase_date.split('T')[0] : '—'}</p>
                <p><strong>Warranty Expiry:</strong> {currentAsset.warranty_expiry ? currentAsset.warranty_expiry.split('T')[0] : '—'}</p>
                <p><strong>Department:</strong> {currentAsset.department}</p>
                <p><strong>Facility:</strong> {currentAsset.facility_name || '—'}</p>
                <p><strong>Status:</strong> <StatusBadge status={currentAsset.status} /></p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowViewModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable modal-fullscreen-sm-down">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create New Asset</h5>
                <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input type="text" className="form-control" name="name" value={createAsset.name} onChange={handleCreateChange} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Type</label>
                  <select className="form-select" name="type" value={createAsset.type} onChange={handleCreateChange}>
                    <option value="Medical Equipment">Medical Equipment</option>
                    <option value="Diagnostic">Diagnostic</option>
                    <option value="Furniture">Furniture</option>
                    <option value="IT Equipment">IT Equipment</option>
                    <option value="Vehicle">Vehicle</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Serial Number</label>
                  <input type="text" className="form-control" name="serial_number" value={createAsset.serial_number} onChange={handleCreateChange} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Model</label>
                  <input type="text" className="form-control" name="model" value={createAsset.model} onChange={handleCreateChange} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Manufacturer</label>
                  <input type="text" className="form-control" name="manufacturer" value={createAsset.manufacturer} onChange={handleCreateChange} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Purchase Date</label>
                  <input type="date" className="form-control" name="purchase_date" value={createAsset.purchase_date} onChange={handleCreateChange} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Warranty Expiry</label>
                  <input type="date" className="form-control" name="warranty_expiry" value={createAsset.warranty_expiry} onChange={handleCreateChange} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Department</label>
                  <input type="text" className="form-control" name="department" value={createAsset.department} onChange={handleCreateChange} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Facility</label>
                  {facilitiesLoading ? (
                    <div className="form-select disabled">
                      <span>Loading...</span>
                    </div>
                  ) : (
                    <select 
                      className="form-select" 
                      value={assignForm.facility_id}
                      onChange={(e) => setAssignForm({ facility_id: e.target.value })}
                    >
                      <option value="">Select Facility (Optional)</option>
                      {facilities.map((facility) => (
                        <option key={facility.id} value={facility.id}>
                          {facility.name} ({facility.location})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleCreateAsset}>Create Asset</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable modal-fullscreen-sm-down">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Asset: {newAsset.id}</h5>
                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input type="text" className="form-control" name="name" value={newAsset.name} onChange={handleEditChange} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Type</label>
                  <select className="form-select" name="type" value={newAsset.type} onChange={handleEditChange}>
                    <option value="Medical Equipment">Medical Equipment</option>
                    <option value="Diagnostic">Diagnostic</option>
                    <option value="Furniture">Furniture</option>
                    <option value="IT Equipment">IT Equipment</option>
                    <option value="Vehicle">Vehicle</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Serial Number</label>
                  <input type="text" className="form-control" name="serial_number" value={newAsset.serial_number} onChange={handleEditChange} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Model</label>
                  <input type="text" className="form-control" name="model" value={newAsset.model} onChange={handleEditChange} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Manufacturer</label>
                  <input type="text" className="form-control" name="manufacturer" value={newAsset.manufacturer} onChange={handleEditChange} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Purchase Date</label>
                  <input type="date" className="form-control" name="purchase_date" value={newAsset.purchase_date} onChange={handleEditChange} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Warranty Expiry</label>
                  <input type="date" className="form-control" name="warranty_expiry" value={newAsset.warranty_expiry} onChange={handleEditChange} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Department</label>
                  <input type="text" className="form-control" name="department" value={newAsset.department} onChange={handleEditChange} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Assigned To (User ID)</label>
                  <input type="text" className="form-control" name="assigned_to" value={newAsset.assigned_to} onChange={handleEditChange} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Status</label>
                  <select className="form-select" name="status" value={newAsset.status} onChange={handleEditChange}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="retired">Retired</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button className="btn btn-warning" onClick={handleEditAsset}>Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign/Unassign Modal */}
      {showAssignModal && currentAsset && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-fullscreen-sm-down">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Assign Asset to Facility</h5>
                <button type="button" className="btn-close" onClick={() => setShowAssignModal(false)}></button>
              </div>
              <div className="modal-body">
                <p><strong>Asset:</strong> {currentAsset.name} ({currentAsset.id})</p>
                {currentAsset.facility_id && (
                  <p className="text-info"><strong>Currently Assigned To:</strong> {currentAsset.facility_name || `Facility ID: ${currentAsset.facility_id}`}</p>
                )}
                <div className="mb-3">
                  <label className="form-label">Assign to Facility</label>
                  {facilitiesLoading ? (
                    <div className="form-select disabled">
                      <span>Loading facilities...</span>
                    </div>
                  ) : facilities.length === 0 ? (
                    <div className="text-muted">No facilities available</div>
                  ) : (
                    <select 
                      className="form-select" 
                      value={assignForm.facility_id} 
                      onChange={handleAssignChange}
                    >
                      <option value="">Select a facility</option>
                      {facilities.map((facility) => (
                        <option key={facility.id} value={facility.id}>
                          {facility.name} ({facility.location})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowAssignModal(false)}>Cancel</button>
                <button
                  className="btn btn-success"
                  onClick={handleAssignAsset}
                  disabled={!assignForm.facility_id}
                >
                  Assign to Facility
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
          
      {/* Backdrop */}
      {(showViewModal || showEditModal || showAssignModal || showCreateModal) && <div className="modal-backdrop show"></div>}
    </div>
  );
};

export default SuperAdminAssets;