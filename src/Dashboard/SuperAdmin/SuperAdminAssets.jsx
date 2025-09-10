import React, { useState } from 'react';
import { 
  FaPlus, FaSearch, FaEye, FaTools, FaCheck, FaLaptopMedical, FaHospitalAlt
} from 'react-icons/fa';

const SuperAdminAssets = () => {
  // State for search
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock data for assets
  const [assets, setAssets] = useState([
    { id: 'AST-1001', name: 'Ventilator', category: 'Medical Equipment', department: 'ICU', status: 'In Use', condition: 'Good', lastMaintenance: '15 Oct 2023' },
    { id: 'AST-1002', name: 'Ultrasound Machine', category: 'Diagnostic', department: 'Radiology', status: 'In Use', condition: 'Fair', lastMaintenance: '20 Sep 2023' },
    { id: 'AST-1003', name: 'Patient Monitor', category: 'Medical Equipment', department: 'Emergency', status: 'Under Maintenance', condition: 'Needs Repair', lastMaintenance: '05 Oct 2023' }
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
          <button className="btn btn-primary d-flex align-items-center">
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
                    <td>{asset.status === 'In Use' ? '15 Nov 2023' : 'N/A'}</td>
                    <td>
                      <div className="btn-group" role="group">
                        <button className="btn btn-sm btn-outline-primary">
                          <FaEye />
                        </button>
                        {asset.status === 'Under Maintenance' ? (
                          <button className="btn btn-sm btn-outline-success">
                            <FaCheck />
                          </button>
                        ) : (
                          <button className="btn btn-sm btn-outline-info">
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
    </div>
  );
};

export default SuperAdminAssets;