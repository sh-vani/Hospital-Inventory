import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const AssetsManagement = () => {
  const [assets, setAssets] = useState([
    {
      id: 'AST-1001',
      name: 'Ventilator',
      category: 'Medical Equipment',
      department: 'ICU',
      status: 'In Use',
      condition: 'Good',
      lastMaintenance: '15 Oct 2023',
      actions: ['View', 'Maintain']
    },
    {
      id: 'AST-1002',
      name: 'Ultrasound Machine',
      category: 'Diagnostic',
      department: 'Radiology',
      status: 'In Use',
      condition: 'Fair',
      lastMaintenance: '20 Sep 2023',
      actions: ['View', 'Maintain']
    },
    {
      id: 'AST-1003',
      name: 'Patient Monitor',
      category: 'Medical Equipment',
      department: 'Emergency',
      status: 'Under Maintenance',
      condition: 'Needs Repair',
      lastMaintenance: '05 Oct 2023',
      actions: ['View', 'Maintain', 'Complete']
    }
  ]);

  const handleAction = (assetId, action) => {
    alert(`Action: ${action} for Asset ID: ${assetId}`);
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'In Use':
        return 'bg-success';
      case 'Under Maintenance':
        return 'bg-warning';
      default:
        return 'bg-secondary';
    }
  };

  const getConditionClass = (condition) => {
    switch(condition) {
      case 'Good':
        return 'bg-success';
      case 'Fair':
        return 'bg-warning';
      case 'Needs Repair':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };

  return (
    <div className="container-fluid p-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header with H1 and Button */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Assets Management</h1>
        <button className="btn btn-primary btn-sm fs-5">
          <i className="bi bi-plus me-1"></i> Add New Asset
        </button>
      </div>
      
      <div className="">
        <div className="card-header  text-dark">
          <h5 className="mb-0 fs-3">Hospital Assets</h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-light">
                <tr>
                  <th scope="col">Asset ID</th>
                  <th scope="col">Name</th>
                  <th scope="col">Category</th>
                  <th scope="col">Department</th>
                  <th scope="col">Status</th>
                  <th scope="col">Condition</th>
                  <th scope="col">Last Maintenance</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((asset) => (
                  <tr key={asset.id}>
                    <td>{asset.id}</td>
                    <td>{asset.name}</td>
                    <td>{asset.category}</td>
                    <td>{asset.department}</td>
                    <td>
                      <span className={`badge ${getStatusClass(asset.status)}`}>
                        {asset.status}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${getConditionClass(asset.condition)}`}>
                        {asset.condition}
                      </span>
                    </td>
                    <td>{asset.lastMaintenance}</td>
                    <td>
                      <div className="btn-group" role="group">
                        {asset.actions.map((action, index) => (
                          <button
                            key={index}
                            type="button"
                            className={`btn btn-sm ${
                              action === 'Complete' ? 'btn-success' : 'btn-outline-primary'
                            }`}
                            onClick={() => handleAction(asset.id, action)}
                          >
                            {action}
                          </button>
                        ))}
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

export default AssetsManagement;