import React, { useState } from 'react';
import { 
  FaPlus, FaSearch, FaCheck, FaTimes, FaEye, 
  FaExclamationTriangle, FaExclamationCircle
} from 'react-icons/fa';

const SuperAdminRequisitions = () => {
  // State for search
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock data for requisitions
  const [requisitions, setRequisitions] = useState([
    { id: '#REQ-0042', facility: 'Kumasi Branch Hospital', department: 'Emergency', requestedBy: 'Dr. Amoah', date: '24 Oct 2023', items: '12 items', priority: 'High', status: 'Pending Review' },
    { id: '#REQ-0040', facility: 'Takoradi Clinic', department: 'Pharmacy', requestedBy: 'Dr. Mensah', date: '22 Oct 2023', items: '5 items', priority: 'Medium', status: 'Partially Approved' },
    { id: '#REQ-0038', facility: 'Accra Central Hospital', department: 'Laboratory', requestedBy: 'Lab Tech. Ama', date: '20 Oct 2023', items: '7 items', priority: 'Low', status: 'Pending Review' }
  ]);
  
  // Priority badge component
  const PriorityBadge = ({ priority }) => {
    const priorityColors = {
      'High': 'bg-danger',
      'Medium': 'bg-warning',
      'Low': 'bg-success'
    };
    
    return (
      <span className={`badge ${priorityColors[priority] || 'bg-secondary'}`}>
        {priority}
      </span>
    );
  };
  
  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusColors = {
      'Pending Review': 'bg-warning',
      'Partially Approved': 'bg-info',
      'Approved': 'bg-success',
      'Rejected': 'bg-danger'
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
        <h2 className="fw-bold">Requisitions Management</h2>
        <div className="d-flex align-items-center">
          <div className="input-group me-2">
            <input 
              type="text" 
              className="form-control" 
              placeholder="Search requisitions..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="btn btn-outline-secondary" type="button">
              <FaSearch />
            </button>
          </div>
          <button className="btn btn-primary d-flex align-items-center">
            <FaPlus className="me-2" /> Create New
          </button>
        </div>
      </div>
      
      {/* Alert Summary */}
      <div className="row mb-4">
        <div className="col-md-4 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body bg-danger bg-opacity-10 p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="d-flex align-items-center mb-2">
                    <FaExclamationCircle className="text-danger me-2" size={24} />
                    <h5 className="card-title text-danger fw-bold mb-0">Urgent</h5>
                  </div>
                  <p className="card-text text-muted ms-4">3 requisitions need immediate attention</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body bg-warning bg-opacity-10 p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="d-flex align-items-center mb-2">
                    <FaExclamationTriangle className="text-warning me-2" size={24} />
                    <h5 className="card-title text-warning fw-bold mb-0">Pending</h5>
                  </div>
                  <p className="card-text text-muted ms-4">5 requisitions awaiting approval</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body bg-info bg-opacity-10 p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="d-flex align-items-center mb-2">
                    <FaCheck className="text-info me-2" size={24} />
                    <h5 className="card-title text-info fw-bold mb-0">Approved</h5>
                  </div>
                  <p className="card-text text-muted ms-4">12 requisitions approved this week</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-white border-0 pt-3">
          <ul className="nav nav-tabs card-header-tabs">
            <li className="nav-item">
              <button className="nav-link active">Pending</button>
            </li>
            <li className="nav-item">
              <button className="nav-link">Approved</button>
            </li>
            <li className="nav-item">
              <button className="nav-link">Rejected</button>
            </li>
            <li className="nav-item">
              <button className="nav-link">All Requisitions</button>
            </li>
          </ul>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="bg-light">
                <tr>
                  <th>Requisition ID</th>
                  <th>Facility</th>
                  <th>Department</th>
                  <th>Requested By</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requisitions.map((req, index) => (
                  <tr key={index}>
                    <td><span className="fw-bold">{req.id}</span></td>
                    <td>{req.facility}</td>
                    <td>{req.department}</td>
                    <td>{req.requestedBy}</td>
                    <td>{req.date}</td>
                    <td>{req.items}</td>
                    <td><PriorityBadge priority={req.priority} /></td>
                    <td><StatusBadge status={req.status} /></td>
                    <td>
                      <div className="btn-group" role="group">
                        <button className="btn btn-sm btn-outline-success">
                          <FaCheck />
                        </button>
                        <button className="btn btn-sm btn-outline-danger">
                          <FaTimes />
                        </button>
                        <button className="btn btn-sm btn-outline-primary">
                          <FaEye />
                        </button>
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

export default SuperAdminRequisitions;