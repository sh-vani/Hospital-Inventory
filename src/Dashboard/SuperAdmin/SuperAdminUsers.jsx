import React, { useState } from 'react';
import { 
  FaPlus, FaSearch, FaEdit, FaTimes, FaCheck, FaUser, FaUserMd, FaUserCog, FaHospital
} from 'react-icons/fa';

const SuperAdminUsers = () => {
  // State for search
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock data for users
  const [users, setUsers] = useState([
    { id: 'USR-001', name: 'John Mensah', role: 'Super Admin', facility: 'Main Warehouse', department: 'Administration', status: 'Active', lastLogin: '25 Oct 2023' },
    { id: 'USR-002', name: 'Alice Ofori', role: 'Warehouse Admin', facility: 'Main Warehouse', department: 'Inventory', status: 'Active', lastLogin: '24 Oct 2023' },
    { id: 'USR-003', name: 'Dr. Kwame Asare', role: 'Facility Admin', facility: 'Kumasi Branch Hospital', department: 'Medical', status: 'Active', lastLogin: '24 Oct 2023' },
    { id: 'USR-004', name: 'Nurse Ama Serwaa', role: 'Facility User', facility: 'Accra Central Hospital', department: 'Emergency', status: 'Inactive', lastLogin: '20 Oct 2023' }
  ]);
  
  // Role badge component
  const RoleBadge = ({ role }) => {
    const roleColors = {
      'Super Admin': 'bg-danger',
      'Warehouse Admin': 'bg-primary',
      'Facility Admin': 'bg-info',
      'Facility User': 'bg-secondary'
    };
    
    return (
      <span className={`badge ${roleColors[role] || 'bg-secondary'}`}>
        {role}
      </span>
    );
  };
  
  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusColors = {
      'Active': 'bg-success',
      'Inactive': 'bg-secondary',
      'Pending': 'bg-warning'
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
        <h2 className="fw-bold">User Management</h2>
        <div className="d-flex align-items-center">
          <div className="input-group me-2">
            <input 
              type="text" 
              className="form-control" 
              placeholder="Search users..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="btn btn-outline-secondary" type="button">
              <FaSearch />
            </button>
          </div>
          <button className="btn btn-primary d-flex align-items-center">
            <FaPlus className="me-2" /> Add New User
          </button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card border-0 shadow-sm h-100 stat-card">
            <div className="card-body text-center p-4">
              <div className="bg-primary bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                <FaUser className="text-primary fa-2x" />
              </div>
              <div className="number text-primary fw-bold">4</div>
              <div className="label text-muted">Total Users</div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card border-0 shadow-sm h-100 stat-card">
            <div className="card-body text-center p-4">
              <div className="bg-success bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                <FaCheck className="text-success fa-2x" />
              </div>
              <div className="number text-success fw-bold">3</div>
              <div className="label text-muted">Active Users</div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card border-0 shadow-sm h-100 stat-card">
            <div className="card-body text-center p-4">
              <div className="bg-warning bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                <FaUserCog className="text-warning fa-2x" />
              </div>
              <div className="number text-warning fw-bold">1</div>
              <div className="label text-muted">Admin Users</div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card border-0 shadow-sm h-100 stat-card">
            <div className="card-body text-center p-4">
              <div className="bg-info bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                <FaUserMd className="text-info fa-2x" />
              </div>
              <div className="number text-info fw-bold">2</div>
              <div className="label text-muted">Medical Staff</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Users Table */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-white border-0 pt-4">
          <h5 className="mb-0 fw-bold">System Users</h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="bg-light">
                <tr>
                  <th>User ID</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Facility</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={index}>
                    <td><span className="fw-bold">{user.id}</span></td>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="bg-secondary bg-opacity-10 p-2 rounded-circle me-2">
                          <FaUser className="text-secondary" />
                        </div>
                        {user.name}
                      </div>
                    </td>
                    <td><RoleBadge role={user.role} /></td>
                    <td>{user.facility}</td>
                    <td>{user.department}</td>
                    <td><StatusBadge status={user.status} /></td>
                    <td>{user.lastLogin}</td>
                    <td>
                      <div className="btn-group" role="group">
                        <button className="btn btn-sm btn-outline-primary">
                          <FaEdit />
                        </button>
                        {user.status === 'Active' ? (
                          <button className="btn btn-sm btn-outline-danger">
                            <FaTimes />
                          </button>
                        ) : (
                          <button className="btn btn-sm btn-outline-success">
                            <FaCheck />
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

export default SuperAdminUsers;