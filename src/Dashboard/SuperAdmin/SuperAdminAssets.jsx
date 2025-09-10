import React, { useState } from 'react';
import { 
  FaPlus, FaSearch, FaEye, FaTools, FaCheck, FaLaptopMedical, FaHospitalAlt,
  FaCalendarAlt, FaUser, FaMapMarkerAlt, FaClipboardList, FaWrench
} from 'react-icons/fa';

const SuperAdminAssets = () => {
  // State for search
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showRepairModal, setShowRepairModal] = useState(false);
  
  // State for current asset
  const [currentAsset, setCurrentAsset] = useState(null);
  
  // State for new asset form
  const [newAsset, setNewAsset] = useState({
    id: '',
    name: '',
    category: 'Medical Equipment',
    department: '',
    status: 'Available',
    condition: 'Good',
    purchaseDate: '',
    warrantyExpiry: '',
    location: '',
    assignedTo: '',
    lastMaintenance: '',
    nextMaintenance: '',
    notes: ''
  });
  
  // State for maintenance form
  const [maintenanceForm, setMaintenanceForm] = useState({
    maintenanceDate: '',
    maintenanceType: 'Routine',
    description: '',
    technician: '',
    estimatedCost: '',
    estimatedDuration: ''
  });
  
  // State for repair form
  const [repairForm, setRepairForm] = useState({
    repairDate: '',
    repairDescription: '',
    technician: '',
    partsReplaced: '',
    cost: '',
    notes: ''
  });
  
  // Mock data for assets
  const [assets, setAssets] = useState([
    { 
      id: 'AST-1001', 
      name: 'Ventilator', 
      category: 'Medical Equipment', 
      department: 'ICU', 
      status: 'In Use', 
      condition: 'Good', 
      lastMaintenance: '15 Oct 2023',
      purchaseDate: '15 Jan 2022',
      warrantyExpiry: '15 Jan 2025',
      location: 'ICU Room 3',
      assignedTo: 'Dr. Amoah',
      nextMaintenance: '15 Nov 2023',
      notes: 'Critical equipment for patient care'
    },
    { 
      id: 'AST-1002', 
      name: 'Ultrasound Machine', 
      category: 'Diagnostic', 
      department: 'Radiology', 
      status: 'In Use', 
      condition: 'Fair', 
      lastMaintenance: '20 Sep 2023',
      purchaseDate: '10 Mar 2021',
      warrantyExpiry: '10 Mar 2024',
      location: 'Radiology Lab 1',
      assignedTo: 'Dr. Mensah',
      nextMaintenance: '20 Dec 2023',
      notes: 'Requires calibration every 6 months'
    },
    { 
      id: 'AST-1003', 
      name: 'Patient Monitor', 
      category: 'Medical Equipment', 
      department: 'Emergency', 
      status: 'Under Maintenance', 
      condition: 'Needs Repair', 
      lastMaintenance: '05 Oct 2023',
      purchaseDate: '20 May 2020',
      warrantyExpiry: '20 May 2023',
      location: 'Maintenance Workshop',
      assignedTo: 'Maintenance Team',
      nextMaintenance: 'N/A',
      notes: 'Display malfunction, requires replacement part'
    }
  ]);
  
  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusColors = {
      'In Use': 'bg-success',
      'Under Maintenance': 'bg-danger',
      'Available': 'bg-info',
      'Retired': 'bg-secondary'
    };
    
    return (
      <span className={`badge ${statusColors[status] || 'bg-secondary'}`}>
        {status}
      </span>
    );
  };
  
  // Condition badge component
  const ConditionBadge = ({ condition }) => {
    const conditionColors = {
      'Good': 'bg-success',
      'Fair': 'bg-warning',
      'Needs Repair': 'bg-danger',
      'Excellent': 'bg-primary'
    };
    
    return (
      <span className={`badge ${conditionColors[condition] || 'bg-secondary'}`}>
        {condition}
      </span>
    );
  };
  
  // Modal handlers
  const openAddModal = () => {
    setNewAsset({
      id: '',
      name: '',
      category: 'Medical Equipment',
      department: '',
      status: 'Available',
      condition: 'Good',
      purchaseDate: '',
      warrantyExpiry: '',
      location: '',
      assignedTo: '',
      lastMaintenance: '',
      nextMaintenance: '',
      notes: ''
    });
    setShowAddModal(true);
  };
  
  const openViewModal = (asset) => {
    setCurrentAsset(asset);
    setShowViewModal(true);
  };
  
  const openMaintenanceModal = (asset) => {
    setCurrentAsset(asset);
    setMaintenanceForm({
      maintenanceDate: '',
      maintenanceType: 'Routine',
      description: '',
      technician: '',
      estimatedCost: '',
      estimatedDuration: ''
    });
    setShowMaintenanceModal(true);
  };
  
  const openRepairModal = (asset) => {
    setCurrentAsset(asset);
    setRepairForm({
      repairDate: '',
      repairDescription: '',
      technician: '',
      partsReplaced: '',
      cost: '',
      notes: ''
    });
    setShowRepairModal(true);
  };
  
  // Form handlers
  const handleAddAssetChange = (e) => {
    const { name, value } = e.target;
    setNewAsset({
      ...newAsset,
      [name]: value
    });
  };
  
  const handleMaintenanceChange = (e) => {
    const { name, value } = e.target;
    setMaintenanceForm({
      ...maintenanceForm,
      [name]: value
    });
  };
  
  const handleRepairChange = (e) => {
    const { name, value } = e.target;
    setRepairForm({
      ...repairForm,
      [name]: value
    });
  };
  
  // Action handlers
  const handleAddAsset = () => {
    const newItem = {
      ...newAsset,
      id: `AST-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`
    };
    
    setAssets([newItem, ...assets]);
    setShowAddModal(false);
  };
  
  const handleScheduleMaintenance = () => {
    const updatedAssets = assets.map(asset => 
      asset.id === currentAsset.id 
        ? { 
            ...asset, 
            status: 'Under Maintenance',
            condition: 'Needs Repair',
            nextMaintenance: maintenanceForm.maintenanceDate
          } 
        : asset
    );
    
    setAssets(updatedAssets);
    setShowMaintenanceModal(false);
  };
  
  const handleCompleteRepair = () => {
    const updatedAssets = assets.map(asset => 
      asset.id === currentAsset.id 
        ? { 
            ...asset, 
            status: 'Available',
            condition: 'Good',
            lastMaintenance: repairForm.repairDate,
            nextMaintenance: new Date(new Date(repairForm.repairDate).setMonth(new Date(repairForm.repairDate).getMonth() + 3)).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
          } 
        : asset
    );
    
    setAssets(updatedAssets);
    setShowRepairModal(false);
  };
  
  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Assets Management</h2>
        <div className="d-flex align-items-center">
          <div className="input-group me-2">
            <input 
              type="text" 
              className="form-control" 
              placeholder="Search assets..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="btn btn-outline-secondary" type="button">
              <FaSearch />
            </button>
          </div>
          <button className="btn btn-primary d-flex align-items-center" onClick={openAddModal}>
            <FaPlus className="me-2" /> Add New Asset
          </button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card border-0 shadow-sm h-100 stat-card">
            <div className="card-body text-center p-4">
              <div className="bg-success bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                <FaHospitalAlt className="text-success fa-2x" />
              </div>
              <div className="number text-success fw-bold">187</div>
              <div className="label text-muted">Total Assets</div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card border-0 shadow-sm h-100 stat-card">
            <div className="card-body text-center p-4">
              <div className="bg-primary bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                <FaLaptopMedical className="text-primary fa-2x" />
              </div>
              <div className="number text-primary fw-bold">142</div>
              <div className="label text-muted">In Use</div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card border-0 shadow-sm h-100 stat-card">
            <div className="card-body text-center p-4">
              <div className="bg-warning bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                <FaTools className="text-warning fa-2x" />
              </div>
              <div className="number text-warning fw-bold">12</div>
              <div className="label text-muted">Under Maintenance</div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card border-0 shadow-sm h-100 stat-card">
            <div className="card-body text-center p-4">
              <div className="bg-info bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                <FaCheck className="text-info fa-2x" />
              </div>
              <div className="number text-info fw-bold">8</div>
              <div className="label text-muted">Need Attention</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Assets Table */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-white border-0 pt-4">
          <h5 className="mb-0 fw-bold">Hospital Assets</h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="bg-light">
                <tr>
                  <th>Asset ID</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Condition</th>
                  <th>Last Maintenance</th>
                  <th>Next Maintenance</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((asset, index) => (
                  <tr key={index}>
                    <td><span className="fw-bold">{asset.id}</span></td>
                    <td>{asset.name}</td>
                    <td>{asset.category}</td>
                    <td>{asset.department}</td>
                    <td><StatusBadge status={asset.status} /></td>
                    <td><ConditionBadge condition={asset.condition} /></td>
                    <td>{asset.lastMaintenance}</td>
                    <td>{asset.nextMaintenance}</td>
                    <td>
                      <div className="btn-group" role="group">
                        <button 
                          className="btn btn-sm btn-outline-primary" 
                          onClick={() => openViewModal(asset)}
                        >
                          <FaEye />
                        </button>
                        {asset.status === 'Under Maintenance' ? (
                          <button 
                            className="btn btn-sm btn-outline-success" 
                            onClick={() => openRepairModal(asset)}
                          >
                            <FaCheck />
                          </button>
                        ) : (
                          <button 
                            className="btn btn-sm btn-outline-info" 
                            onClick={() => openMaintenanceModal(asset)}
                          >
                            <FaTools />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Asset Modal */}
      {showAddModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Asset</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Asset Name</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        name="name"
                        value={newAsset.name}
                        onChange={handleAddAssetChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Category</label>
                      <select 
                        className="form-select" 
                        name="category"
                        value={newAsset.category}
                        onChange={handleAddAssetChange}
                      >
                        <option value="Medical Equipment">Medical Equipment</option>
                        <option value="Diagnostic">Diagnostic</option>
                        <option value="Furniture">Furniture</option>
                        <option value="IT Equipment">IT Equipment</option>
                        <option value="Vehicle">Vehicle</option>
                      </select>
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Department</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        name="department"
                        value={newAsset.department}
                        onChange={handleAddAssetChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Status</label>
                      <select 
                        className="form-select" 
                        name="status"
                        value={newAsset.status}
                        onChange={handleAddAssetChange}
                      >
                        <option value="Available">Available</option>
                        <option value="In Use">In Use</option>
                        <option value="Under Maintenance">Under Maintenance</option>
                        <option value="Retired">Retired</option>
                      </select>
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Condition</label>
                      <select 
                        className="form-select" 
                        name="condition"
                        value={newAsset.condition}
                        onChange={handleAddAssetChange}
                      >
                        <option value="Excellent">Excellent</option>
                        <option value="Good">Good</option>
                        <option value="Fair">Fair</option>
                        <option value="Needs Repair">Needs Repair</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Location</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        name="location"
                        value={newAsset.location}
                        onChange={handleAddAssetChange}
                      />
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Purchase Date</label>
                      <input 
                        type="date" 
                        className="form-control" 
                        name="purchaseDate"
                        value={newAsset.purchaseDate}
                        onChange={handleAddAssetChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Warranty Expiry</label>
                      <input 
                        type="date" 
                        className="form-control" 
                        name="warrantyExpiry"
                        value={newAsset.warrantyExpiry}
                        onChange={handleAddAssetChange}
                      />
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Assigned To</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        name="assignedTo"
                        value={newAsset.assignedTo}
                        onChange={handleAddAssetChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Next Maintenance</label>
                      <input 
                        type="date" 
                        className="form-control" 
                        name="nextMaintenance"
                        value={newAsset.nextMaintenance}
                        onChange={handleAddAssetChange}
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Notes</label>
                    <textarea 
                      className="form-control" 
                      name="notes"
                      value={newAsset.notes}
                      onChange={handleAddAssetChange}
                      rows="2"
                    ></textarea>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-primary" onClick={handleAddAsset}>
                  Add Asset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Asset Modal */}
      {showViewModal && currentAsset && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Asset Details: {currentAsset.id}</h5>
                <button type="button" className="btn-close" onClick={() => setShowViewModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <div className="d-flex align-items-center mb-2">
                      <FaHospitalAlt className="text-primary me-2" />
                      <p className="mb-0"><strong>Name:</strong> {currentAsset.name}</p>
                    </div>
                    <div className="d-flex align-items-center mb-2">
                      <FaUser className="text-primary me-2" />
                      <p className="mb-0"><strong>Department:</strong> {currentAsset.department}</p>
                    </div>
                    <div className="d-flex align-items-center mb-2">
                      <FaMapMarkerAlt className="text-primary me-2" />
                      <p className="mb-0"><strong>Location:</strong> {currentAsset.location}</p>
                    </div>
                    <div className="d-flex align-items-center mb-2">
                      <FaUser className="text-primary me-2" />
                      <p className="mb-0"><strong>Assigned To:</strong> {currentAsset.assignedTo}</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <p><strong>Category:</strong> {currentAsset.category}</p>
                    <p><strong>Status:</strong> <StatusBadge status={currentAsset.status} /></p>
                    <p><strong>Condition:</strong> <ConditionBadge condition={currentAsset.condition} /></p>
                    <p><strong>Purchase Date:</strong> {currentAsset.purchaseDate}</p>
                    <p><strong>Warranty Expiry:</strong> {currentAsset.warrantyExpiry}</p>
                  </div>
                </div>
                
                <div className="row mb-3">
                  <div className="col-md-6">
                    <div className="d-flex align-items-center mb-2">
                      <FaCalendarAlt className="text-primary me-2" />
                      <p className="mb-0"><strong>Last Maintenance:</strong> {currentAsset.lastMaintenance}</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex align-items-center mb-2">
                      <FaCalendarAlt className="text-primary me-2" />
                      <p className="mb-0"><strong>Next Maintenance:</strong> {currentAsset.nextMaintenance}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mb-3">
                  <h6 className="mb-2">Notes:</h6>
                  <div className="card bg-light">
                    <div className="card-body">
                      {currentAsset.notes}
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowViewModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Modal */}
      {showMaintenanceModal && currentAsset && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Schedule Maintenance: {currentAsset.name}</h5>
                <button type="button" className="btn-close" onClick={() => setShowMaintenanceModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="card bg-light mb-4">
                  <div className="card-body">
                    <p><strong>Asset ID:</strong> {currentAsset.id}</p>
                    <p><strong>Current Status:</strong> <StatusBadge status={currentAsset.status} /></p>
                    <p><strong>Current Condition:</strong> <ConditionBadge condition={currentAsset.condition} /></p>
                    <p><strong>Last Maintenance:</strong> {currentAsset.lastMaintenance}</p>
                  </div>
                </div>
                
                <form>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Maintenance Date</label>
                      <input 
                        type="date" 
                        className="form-control" 
                        name="maintenanceDate"
                        value={maintenanceForm.maintenanceDate}
                        onChange={handleMaintenanceChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Maintenance Type</label>
                      <select 
                        className="form-select" 
                        name="maintenanceType"
                        value={maintenanceForm.maintenanceType}
                        onChange={handleMaintenanceChange}
                      >
                        <option value="Routine">Routine</option>
                        <option value="Preventive">Preventive</option>
                        <option value="Corrective">Corrective</option>
                        <option value="Emergency">Emergency</option>
                      </select>
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Technician</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        name="technician"
                        value={maintenanceForm.technician}
                        onChange={handleMaintenanceChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Estimated Duration (days)</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        name="estimatedDuration"
                        value={maintenanceForm.estimatedDuration}
                        onChange={handleMaintenanceChange}
                      />
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Estimated Cost ($)</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        name="estimatedCost"
                        value={maintenanceForm.estimatedCost}
                        onChange={handleMaintenanceChange}
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea 
                      className="form-control" 
                      name="description"
                      value={maintenanceForm.description}
                      onChange={handleMaintenanceChange}
                      rows="3"
                    ></textarea>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowMaintenanceModal(false)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-primary" onClick={handleScheduleMaintenance}>
                  Schedule Maintenance
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Repair Modal */}
      {showRepairModal && currentAsset && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Complete Repair: {currentAsset.name}</h5>
                <button type="button" className="btn-close" onClick={() => setShowRepairModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="card bg-light mb-4">
                  <div className="card-body">
                    <p><strong>Asset ID:</strong> {currentAsset.id}</p>
                    <p><strong>Current Status:</strong> <StatusBadge status={currentAsset.status} /></p>
                    <p><strong>Current Condition:</strong> <ConditionBadge condition={currentAsset.condition} /></p>
                    <p><strong>Last Maintenance:</strong> {currentAsset.lastMaintenance}</p>
                  </div>
                </div>
                
                <form>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Repair Date</label>
                      <input 
                        type="date" 
                        className="form-control" 
                        name="repairDate"
                        value={repairForm.repairDate}
                        onChange={handleRepairChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Technician</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        name="technician"
                        value={repairForm.technician}
                        onChange={handleRepairChange}
                      />
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Repair Cost ($)</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        name="cost"
                        value={repairForm.cost}
                        onChange={handleRepairChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Parts Replaced</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        name="partsReplaced"
                        value={repairForm.partsReplaced}
                        onChange={handleRepairChange}
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Repair Description</label>
                    <textarea 
                      className="form-control" 
                      name="repairDescription"
                      value={repairForm.repairDescription}
                      onChange={handleRepairChange}
                      rows="3"
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Additional Notes</label>
                    <textarea 
                      className="form-control" 
                      name="notes"
                      value={repairForm.notes}
                      onChange={handleRepairChange}
                      rows="2"
                    ></textarea>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowRepairModal(false)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-success" onClick={handleCompleteRepair}>
                  Complete Repair
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Backdrop */}
      {(showAddModal || showViewModal || showMaintenanceModal || showRepairModal) && (
        <div className="modal-backdrop show"></div>
      )}
    </div>
  );
};

export default SuperAdminAssets;