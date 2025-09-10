import React, { useState } from 'react';
import { 
  FaPlus, FaSearch, FaEye, FaTruckLoading, FaCheck, FaTimes
} from 'react-icons/fa';

const SuperAdminDispatches = () => {
  // State for search
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock data for dispatches
  const [dispatches, setDispatches] = useState([
    { id: '#DSP-0102', facility: 'Kumasi Branch Hospital', itemsCount: '15 items', dispatchedBy: 'Warehouse Admin', date: '23 Oct 2023', status: 'Delivered' },
    { id: '#DSP-0101', facility: 'Accra Central Hospital', itemsCount: '8 items', dispatchedBy: 'Warehouse Admin', date: '22 Oct 2023', status: 'Delivered' },
    { id: '#DSP-0100', facility: 'Takoradi Clinic', itemsCount: '12 items', dispatchedBy: 'Warehouse Admin', date: '21 Oct 2023', status: 'In Transit' }
  ]);
  
  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusColors = {
      'Delivered': 'bg-success',
      'In Transit': 'bg-warning',
      'Processing': 'bg-info',
      'Cancelled': 'bg-danger'
    };
    
    return (
      <span className={`badge ${statusColors[status] || 'bg-secondary'}`}>
        {status}
      </span>
    );
  };
  
  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Dispatches Management</h2>
        <div className="d-flex align-items-center">
          <div className="input-group me-2">
            <input 
              type="text" 
              className="form-control" 
              placeholder="Search dispatches..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="btn btn-outline-secondary" type="button">
              <FaSearch />
            </button>
          </div>
          <button className="btn btn-primary d-flex align-items-center">
            <FaPlus className="me-2" /> New Dispatch
          </button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card border-0 shadow-sm h-100 stat-card">
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
          <div className="card border-0 shadow-sm h-100 stat-card">
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
          <div className="card border-0 shadow-sm h-100 stat-card">
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
          <div className="card border-0 shadow-sm h-100 stat-card">
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
        <div className="card-header bg-white border-0 pt-4">
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
                  <th>Estimated Delivery</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {dispatches.map((dispatch, index) => (
                  <tr key={index}>
                    <td><span className="fw-bold">{dispatch.id}</span></td>
                    <td>{dispatch.facility}</td>
                    <td>{dispatch.itemsCount}</td>
                    <td>{dispatch.dispatchedBy}</td>
                    <td>{dispatch.date}</td>
                    <td>{dispatch.status === 'In Transit' ? '25 Oct 2023' : 'N/A'}</td>
                    <td><StatusBadge status={dispatch.status} /></td>
                    <td>
                      <button className="btn btn-sm btn-outline-primary">
                        {dispatch.status === 'In Transit' ? <FaTruckLoading /> : <FaEye />}
                        <span className="ms-1">{dispatch.status === 'In Transit' ? 'Track' : 'View'}</span>
                      </button>
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

export default SuperAdminDispatches;