import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const FacilityUser = () => {
  const [users, setUsers] = useState([
    {
      id: 'USR-001',
      name: 'John Mensah',
      role: 'Super Admin',
      facility: 'Headquarters',
      department: 'Administration',
      status: 'Active',
      lastLogin: '15 Oct 2023 10:30 AM'
    },
    {
      id: 'USR-002',
      name: 'Alice Ofori',
      role: 'Warehouse Admin',
      facility: 'Warehouse A',
      department: 'Logistics',
      status: 'Active',
      lastLogin: '14 Oct 2023 03:45 PM'
    },
    {
      id: 'USR-003',
      name: 'Dr. Kwame Asare',
      role: 'Facility Admin',
      facility: 'Main Hospital',
      department: 'Medical',
      status: 'Active',
      lastLogin: '13 Oct 2023 09:15 AM'
    },
    {
      id: 'USR-004',
      name: 'Nurse Ama Serwaa',
      role: 'Facility User',
      facility: 'Emergency Wing',
      department: 'Nursing',
      status: 'Inactive',
      lastLogin: '10 Oct 2023 11:20 AM'
    }
  ]);

  const handleAction = (userId, action) => {
    alert(`Action: ${action} for User ID: ${userId}`);
    
    if (action === 'Deactivate' || action === 'Activate') {
      // Toggle user status
      setUsers(users.map(user => {
        if (user.id === userId) {
          return {
            ...user,
            status: user.status === 'Active' ? 'Inactive' : 'Active'
          };
        }
        return user;
      }));
    }
  };

  const getStatusClass = (status) => {
    return status === 'Active' ? 'bg-success' : 'bg-secondary';
  };

  const getRoleBadgeClass = (role) => {
    switch(role) {
      case 'Super Admin':
        return 'bg-danger';
      case 'Warehouse Admin':
        return 'bg-primary';
      case 'Facility Admin':
        return 'bg-info';
      default:
        return 'bg-secondary';
    }
  };

  return (
    <div className="container-fluid p-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header with H1 and Button */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
        <h1 className="mb-3 mb-md-0">Facility User Management</h1>
        <button className="btn btn-primary">
          <i className="bi bi-plus me-1"></i> Add New User
        </button>
      </div>
      
      <div className="card shadow-sm">
        <div className="card-header fs-3 text-dark ">
          <h5 className="mb-0">System Users</h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-light">
                <tr>
                  <th scope="col">User ID</th>
                  <th scope="col">Name</th>
                  <th scope="col">Role</th>
                  <th scope="col">Facility</th>
                  <th scope="col">Department</th>
                  <th scope="col">Status</th>
                  <th scope="col">Last Login</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.name}</td>
                    <td>
                      <span className={`badge ${getRoleBadgeClass(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>{user.facility}</td>
                    <td>{user.department}</td>
                    <td>
                      <span className={`badge ${getStatusClass(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td>{user.lastLogin}</td>
                    <td>
                      <div className="btn-group" role="group">
                        <button
                          type="button"
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => handleAction(user.id, 'Edit')}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          type="button"
                          className={`btn btn-sm ${
                            user.status === 'Active' 
                              ? 'btn-outline-warning' 
                              : 'btn-outline-success'
                          }`}
                          onClick={() => handleAction(user.id, user.status === 'Active' ? 'Deactivate' : 'Activate')}
                        >
                          {user.status === 'Active' ? (
                            <>
                              <i className="bi bi-person-x"></i>
                            </>
                          ) : (
                            <>
                              <i className="bi bi-person-check"></i>
                            </>
                          )}
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
      
      {/* Stats Cards for Mobile View */}
      <div className="d-md-none mt-4">
        <div className="row">
          {users.map((user) => (
            <div key={user.id} className="col-12 mb-3">
              <div className="card">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="card-title">{user.name}</h5>
                    <span className={`badge ${getStatusClass(user.status)}`}>
                      {user.status}
                    </span>
                  </div>
                  <p className="card-text">
                    <strong>ID:</strong> {user.id}<br />
                    <strong>Role:</strong> <span className={`badge ${getRoleBadgeClass(user.role)}`}>{user.role}</span><br />
                    <strong>Facility:</strong> {user.facility}<br />
                    <strong>Department:</strong> {user.department}<br />
                    <strong>Last Login:</strong> {user.lastLogin}
                  </p>
                  <div className="btn-group" role="group">
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => handleAction(user.id, 'Edit')}
                    >
                      <i className="bi bi-pencil"></i> Edit
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm ${
                        user.status === 'Active' 
                          ? 'btn-outline-warning' 
                          : 'btn-outline-success'
                      }`}
                      onClick={() => handleAction(user.id, user.status === 'Active' ? 'Deactivate' : 'Activate')}
                    >
                      {user.status === 'Active' ? (
                        <>
                          <i className="bi bi-person-x"></i> Deactivate
                        </>
                      ) : (
                        <>
                          <i className="bi bi-person-check"></i> Activate
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FacilityUser;