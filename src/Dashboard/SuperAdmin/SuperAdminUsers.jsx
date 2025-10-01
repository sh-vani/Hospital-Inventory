import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FaPlus, FaSearch, FaEdit, FaTimes, FaCheck, FaUser, FaUserMd, FaUserCog, FaHospital,
  FaEnvelope, FaPhone, FaLock, FaKey, FaInfoCircle, FaUserCircle, FaTrash, FaBuilding, FaUsers, FaWarehouse
} from 'react-icons/fa';
import BaseUrl from '../../Api/BaseUrl';
import axiosInstance from '../../Api/axiosInstance';

const SuperAdminUsers = () => {
  // Search
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  // Current user
  const [currentUser, setCurrentUser] = useState(null);

  // New user form
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'facility_user',
    facility_id: '',
    password: '',
    confirmPassword: '',
  });

  // Edit user form
  const [editUser, setEditUser] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'facility_user',
    facility_id: '',
    department: '',
    status: 'active'
  });

  // Status change
  const [newStatus, setNewStatus] = useState('');

  // Users data
  const [users, setUsers] = useState([]);
  
  // Facilities data
  const [facilities, setFacilities] = useState([]);
  
  // User summary stats
  const [userSummary, setUserSummary] = useState({
    totalUsers: 0,
    facilityUsers: 0,
    warehouseAdmins: 0,
    facilityAdmins: 0,
    superAdmins: 0
  });

  // Loading state
  const [loading, setLoading] = useState(true);
  const [facilitiesLoading, setFacilitiesLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch users data from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`${BaseUrl}/users`);
      
      if (response.data.success) {
        const usersData = response.data.data;
        setUsers(usersData);
        
        // Calculate user summary stats
        const totalUsers = usersData.length;
        const facilityUsers = usersData.filter(u => u.role === 'facility_user').length;
        const warehouseAdmins = usersData.filter(u => u.role === 'warehouse_admin').length;
        const facilityAdmins = usersData.filter(u => u.role === 'facility_admin').length;
        const superAdmins = usersData.filter(u => u.role === 'super_admin').length;
        
        setUserSummary({
          totalUsers,
          facilityUsers,
          warehouseAdmins,
          facilityAdmins,
          superAdmins
        });
        setError(null);
      } else {
        setError('Failed to fetch users data');
      }
    } catch (err) {
      setError('Failed to fetch users data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch facilities data from API
  const fetchFacilities = async () => {
    try {
      setFacilitiesLoading(true);
      const response = await axiosInstance.get(`${BaseUrl}/facilities`);
      
      if (response.data.success) {
        const facilitiesData = response.data.data;
        setFacilities(facilitiesData);
        
        // Set default facility_id to the first facility if available
        if (facilitiesData.length > 0 && !newUser.facility_id) {
          setNewUser(prev => ({ ...prev, facility_id: facilitiesData[0].id }));
          setEditUser(prev => ({ ...prev, facility_id: facilitiesData[0].id }));
        }
      } else {
        console.error('Failed to fetch facilities data');
      }
    } catch (err) {
      console.error('Failed to fetch facilities data:', err);
    } finally {
      setFacilitiesLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchUsers();
    fetchFacilities();
  }, []);

  // Status Badge only (RoleBadge removed)
  const StatusBadge = ({ status }) => {
    const map = {
      'active': 'bg-success',
      'inactive': 'bg-secondary',
      'pending': 'bg-warning text-dark'
    };
    return <span className={`badge ${map[status] || 'bg-secondary'}`}>{status}</span>;
  };

  // Openers
  const openAddModal = () => {
    setNewUser({
      name: '',
      email: '',
      phone: '',
      role: 'facility_user',
      facility_id: facilities.length > 0 ? facilities[0].id : '',
      password: '',
      confirmPassword: '',
    });
    setShowAddModal(true);
  };
  
  const openViewModal = (user) => { 
    setCurrentUser(user); 
    setShowViewModal(true); 
  };
  
  const openEditModal = (user) => {
    setEditUser({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      facility_id: user.facility_id || (facilities.length > 0 ? facilities[0].id : ''),
      department: user.department,
      status: user.status
    });
    setCurrentUser(user);
    setShowEditModal(true);
  };
  
  const openStatusModal = (user) => {
    setCurrentUser(user);
    setNewStatus(user.status === 'active' ? 'inactive' : 'active');
    setShowStatusModal(true);
  };

  // Form handlers
  const handleAddUserChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
  };
  
  const handleEditUserChange = (e) => {
    const { name, value } = e.target;
    setEditUser(prev => ({ ...prev, [name]: value }));
  };

  // Actions with API calls
  const handleAddUser = async () => {
    if (newUser.password !== newUser.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newUser.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      const { confirmPassword, ...userData } = newUser;
      
      // Make sure facility_id is included
      if (!userData.facility_id && facilities.length > 0) {
        userData.facility_id = facilities[0].id;
      }
      
      const response = await axiosInstance.post(`${BaseUrl}/users`, userData);
      
      if (response.data.success) {
        // Refresh users list
        await fetchUsers();
        setShowAddModal(false);
        setError(null);
        alert('User added successfully!');
      } else {
        setError(response.data.message || 'Failed to add user');
      }
    } catch (err) {
      console.error('Failed to add user:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to add user');
      }
    }
  };

  const handleEditUser = async () => {
    try {
      const response = await axiosInstance.put(`${BaseUrl}/users/${currentUser.id}`, editUser);
      
      if (response.data.success) {
        // Refresh users list
        await fetchUsers();
        setShowEditModal(false);
        alert('User updated successfully!');
      } else {
        setError('Failed to update user');
      }
    } catch (err) {
      console.error('Failed to update user:', err);
      setError('Failed to update user');
    }
  };

  const handleChangeStatus = async () => {
    try {
      const response = await axiosInstance.put(`${BaseUrl}/users/${currentUser.id}`, {
        status: newStatus
      });
      
      if (response.data.success) {
        // Refresh users list
        await fetchUsers();
        setShowStatusModal(false);
        alert(`User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`);
      } else {
        setError('Failed to update user status');
      }
    } catch (err) {
      console.error('Failed to update user status:', err);
      setError('Failed to update user status');
    }
  };

  const deleteUser = async (userId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this user?");

    if (confirmDelete) {
      try {
        const response = await axiosInstance.delete(`${BaseUrl}/users/${userId}`);

        if (response.data.success) {
          alert("User deleted successfully!");
          await fetchUsers(); // Refresh the user list
        } else {
          setError('Failed to delete user');
        }
      } catch (error) {
        console.error("Delete failed:", error);
        setError(error.response?.data?.message || "Something went wrong while deleting user!");
      }
    }
  };

  // Search filter
  const filtered = users.filter(u => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    
    const facility = facilities.find(f => f.id === u.facility_id);
    
    return (
      u.id?.toString().toLowerCase().includes(q) ||
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q) ||
      facility?.name?.toLowerCase().includes(q) ||
      u.status?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="container-fluid py-3">
      {/* Toolbar */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center gap-2 mb-4">
        <h2 className="fw-bold mb-0">User Management</h2>
        <div className="d-flex flex-column flex-sm-row align-items-stretch gap-2 w-90 w-md-auto">
          <div className="input-group">
            <input
              type="text"
              className="form-control form-control-sm"
              style={{height: "40px"}} 
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="btn btn-outline-secondary btn-sm" style={{height: "40px"}} type="button">
              <FaSearch />
            </button>
          </div>
          <button
            className="btn btn-primary btn-sm d-inline-flex align-items-center py-1 px-2"
            onClick={openAddModal}
            style={{height: "40px", width:"150px"}} 
          >
             Add New User
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && (
        <div className="d-flex justify-content-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="row row-cols-1 row-cols-md-5 g-3 mb-4">
        <div className="col">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center p-4">
              <div className="bg-primary bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                <FaUsers className="text-primary fs-3" />
              </div>
              <div className="text-primary fw-bold fs-4">{userSummary.totalUsers}</div>
              <div className="text-muted small">Total Users</div>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center p-4">
              <div className="bg-info bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                <FaUser className="text-info fs-3" />
              </div>
              <div className="text-info fw-bold fs-4">{userSummary.facilityUsers}</div>
              <div className="text-muted small">Facility Users</div>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center p-4">
              <div className="bg-warning bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                <FaWarehouse className="text-warning fs-3" />
              </div>
              <div className="text-warning fw-bold fs-4">{userSummary.warehouseAdmins}</div>
              <div className="text-muted small">Warehouse Admins</div>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center p-4">
              <div className="bg-success bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                <FaBuilding className="text-success fs-3" />
              </div>
              <div className="text-success fw-bold fs-4">{userSummary.facilityAdmins}</div>
              <div className="text-muted small">Facility Admins</div>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center p-4">
              <div className="bg-danger bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                <FaUserCog className="text-danger fs-3" />
              </div>
              <div className="text-danger fw-bold fs-4">{userSummary.superAdmins}</div>
              <div className="text-muted small">Super Admins</div>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table & Cards */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-white border-0 pt-4">
          <h5 className="mb-0 fw-bold">System Users</h5>
        </div>

        {/* TABLE (md and up) */}
        <div className="card-body p-0 d-none d-md-block">
          <div className="table-responsive">
            <table className="table table-hover mb-0 align-middle">
              <thead className="bg-light">
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Facility</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th className="text-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user, index) => {
                  const facility = facilities.find(f => f.id === user.facility_id);
                  return (
                    <tr key={index}>
                      <td className="fw-bold">{index+1}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="bg-secondary bg-opacity-10 p-2 rounded-circle me-2">
                            <FaUser className="text-secondary" />
                          </div>
                          {user.name}
                        </div>
                      </td>
                      <td>{user.role || '—'}</td>
                      <td>{facility ? facility.name : 'Unknown'}</td>
                      <td>{user.email}</td>
                      <td><StatusBadge status={user.status} /></td>
                      <td>
                        <div className="btn-group" role="group">
                          <button className="btn btn-sm btn-outline-primary" onClick={() => openViewModal(user)}>
                            <FaInfoCircle />
                          </button>
                          <button className="btn btn-sm btn-outline-primary" onClick={() => openEditModal(user)}>
                            <FaEdit />
                          </button>
                        
                          <button className="btn btn-sm btn-outline-danger" onClick={() => deleteUser(user.id)}>
                            <FaTrash />
                          </button>
                        </div>  
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* CARD LIST (below md) */}
        <div className="card-body d-block d-md-none">
          <div className="row g-2">
            {filtered.map((u, i) => {
              const facility = facilities.find(f => f.id === u.facility_id);
              return (
                <div className="col-12" key={i}>
                  <div className="card">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="fw-bold">{u.name}</span>
                        <StatusBadge status={u.status} />
                      </div>
                      <div className="row g-2 small">
                        <div className="col-6">
                          <div className="text-muted">User ID</div>
                          <div>{u.id}</div>
                        </div>
                        <div className="col-6">
                          <div className="text-muted">Role</div>
                          <div>{u.role || '—'}</div>
                        </div>
                        <div className="col-6">
                          <div className="text-muted">Facility</div>
                          <div>{facility ? facility.name : 'Unknown'}</div>
                        </div>
                        <div className="col-6">
                          <div className="text-muted">Email</div>
                          <div className="text-truncate">{u.email}</div>
                        </div>
                        <div className="col-6">
                          <div className="text-muted">Phone</div>
                          <div>{u.phone}</div>
                        </div>
                        <div className="col-6">
                          <div className="text-muted">Last Login</div>
                          <div>{u.last_login ? new Date(u.last_login).toLocaleDateString() : 'Never'}</div>
                        </div>
                      </div>
                      <div className="d-flex gap-2 mt-3">
                        <button className="btn btn-outline-primary w-100 btn-sm" onClick={() => openViewModal(u)}>
                          <FaInfoCircle className="me-1" /> Details
                        </button>
                        <button className="btn btn-outline-primary w-100 btn-sm" onClick={() => openEditModal(u)}>
                          <FaEdit className="me-1" /> Edit
                        </button>
                        {u.status === 'active' ? (
                          <button className="btn btn-outline-danger w-100 btn-sm" onClick={() => openStatusModal(u)}>
                            <FaTimes className="me-1" /> Deactivate
                          </button>
                        ) : (
                          <button className="btn btn-outline-success w-100 btn-sm" onClick={() => openStatusModal(u)}>
                            <FaCheck className="me-1" /> Activate
                          </button>
                        )}
                        <button className="btn btn-outline-danger w-100 btn-sm" onClick={() => deleteUser(u.id)}>
                          <FaTrash className="me-1" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && !loading && (
              <div className="col-12">
                <div className="alert alert-light border text-center mb-0">No users found.</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-scrollable modal-fullscreen-sm-down">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New User</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label">Full Name</label>
                      <input type="text" className="form-control" name="name" value={newUser.name} onChange={handleAddUserChange} />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Email Address</label>
                      <input type="email" className="form-control" name="email" value={newUser.email} onChange={handleAddUserChange} />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Phone Number</label>
                      <input type="text" className="form-control" name="phone" value={newUser.phone} onChange={handleAddUserChange} />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Role</label>
                      <select className="form-select" name="role" value={newUser.role} onChange={handleAddUserChange}>
                        <option value="super_admin">Super Admin</option>
                        <option value="facility_admin">Facility Admin</option>
                        <option value="facility_user">Facility User</option>
                        <option value="warehouse_admin">Warehouse Admin</option>
                      </select>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Facility</label>
                      {facilitiesLoading ? (
                        <div className="form-select">
                          <option>Loading facilities...</option>
                        </div>
                      ) : (
                        <select className="form-select" name="facility_id" value={newUser.facility_id} onChange={handleAddUserChange}>
                          {facilities.map((facility) => (
                            <option key={facility.id} value={facility.id}>{facility.name}</option>
                          ))}
                        </select>
                      )}
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Password</label>
                      <div className="input-group">
                        <input type="password" className="form-control" name="password" value={newUser.password} onChange={handleAddUserChange} />
                        <span className="input-group-text"><FaLock /></span>
                      </div>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Confirm Password</label>
                      <div className="input-group">
                        <input type="password" className="form-control" name="confirmPassword" value={newUser.confirmPassword} onChange={handleAddUserChange} />
                        <span className="input-group-text"><FaKey /></span>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
              <div className="modal-footer d-flex gap-2">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="button" className="btn btn-primary" onClick={handleAddUser}>Add User</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View User Modal */}
      {showViewModal && currentUser && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-scrollable modal-fullscreen-sm-down">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">User Details: {currentUser.name}</h5>
                <button type="button" className="btn-close" onClick={() => setShowViewModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="text-center mb-4">
                  <div className="bg-primary bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                    <FaUserCircle className="text-primary" style={{ fontSize: '3rem' }} />
                  </div>
                  <h4 className="fw-bold">{currentUser.name}</h4>
                  <p className="text-muted">{currentUser.email}</p>
                </div>
                <div className="row g-3 mb-2">
                  <div className="col-12 col-md-6">
                    <div className="d-flex align-items-center mb-2">
                      <FaUser className="text-primary me-2" />
                      <div>
                        <h6 className="mb-0">User ID</h6>
                        <p className="text-muted mb-0">{currentUser.id}</p>
                      </div>
                    </div>
                    <div className="d-flex align-items-center mb-2">
                      <FaUserCog className="text-primary me-2" />
                      <div>
                        <h6 className="mb-0">Role</h6>
                        <p className="text-muted mb-0">{currentUser.role || '—'}</p>
                      </div>
                    </div>
                    <div className="d-flex align-items-center mb-2">
                      <FaHospital className="text-primary me-2" />
                      <div>
                        <h6 className="mb-0">Facility</h6>
                        <p className="text-muted mb-0">
                          {currentUser.facility_name || 'Unknown'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="d-flex align-items-center mb-2">
                      <FaEnvelope className="text-primary me-2" />
                      <div>
                        <h6 className="mb-0">Email</h6>
                        <p className="text-muted mb-0">{currentUser.email}</p>
                      </div>
                    </div>
                    <div className="d-flex align-items-center mb-2">
                      <FaPhone className="text-primary me-2" />
                      <div>
                        <h6 className="mb-0">Phone</h6>
                        <p className="text-muted mb-0">{currentUser.phone}</p>
                      </div>
                    </div>
                    <div className="d-flex align-items-center mb-2">
                      <FaCheck className="text-primary me-2" />
                      <div>
                        <h6 className="mb-0">Status</h6>
                        <p className="mb-0"><StatusBadge status={currentUser.status} /></p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <h6 className="mb-0">Department</h6>
                    <p className="text-muted mb-0">{currentUser.department || 'Not specified'}</p>
                  </div>
                  <div className="col-12 col-md-6">
                    <h6 className="mb-0">Join Date</h6>
                    <p className="text-muted mb-0">
                      {new Date(currentUser.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="col-12 col-md-6">
                    <h6 className="mb-0">Last Login</h6>
                    <p className="text-muted mb-0">
                      {currentUser.last_login ? new Date(currentUser.last_login).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Never'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && currentUser && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-scrollable modal-fullscreen-sm-down">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit User: {currentUser.name}</h5>
                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label">Full Name</label>
                      <input type="text" className="form-control" name="name" value={editUser.name} onChange={handleEditUserChange} />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Email Address</label>
                      <input type="email" className="form-control" name="email" value={editUser.email} onChange={handleEditUserChange} />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Phone Number</label>
                      <input type="text" className="form-control" name="phone" value={editUser.phone} onChange={handleEditUserChange} />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Role</label>
                      <select className="form-select" name="role" value={editUser.role} onChange={handleEditUserChange}>
                        <option value="super_admin">Super Admin</option>
                        <option value="facility_admin">Facility Admin</option>
                        <option value="facility_user">Facility User</option>
                        <option value="warehouse_admin">Warehouse Admin</option>
                      </select>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Facility</label>
                      {facilitiesLoading ? (
                        <div className="form-select">
                          <option>Loading facilities...</option>
                        </div>
                      ) : (
                        <select className="form-select" name="facility_id" value={editUser.facility_id} onChange={handleEditUserChange}>
                          {facilities.map((facility) => (
                            <option key={facility.id} value={facility.id}>{facility.name}</option>
                          ))}
                        </select>
                      )}
                    </div>
               
                    <div className="col-12 col-md-6">
                      <label className="form-label">Status</label>
                      <select className="form-select" name="status" value={editUser.status} onChange={handleEditUserChange}>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </form>
              </div>
              <div className="modal-footer d-flex gap-2">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="button" className="btn btn-primary" onClick={handleEditUser}>Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Modal */}
      {showStatusModal && currentUser && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-scrollable modal-fullscreen-sm-down">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {currentUser.status === 'active' ? 'Deactivate User' : 'Activate User'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowStatusModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="text-center">
                  <div className={`bg-${currentUser.status === 'active' ? 'danger' : 'success'} bg-opacity-10 p-3 rounded-circle d-inline-block mb-3`}>
                    {currentUser.status === 'active'
                      ? <FaTimes className="text-danger" style={{ fontSize: '2rem' }} />
                      : <FaCheck className="text-success" style={{ fontSize: '2rem' }} />
                    }
                  </div>
                  <h4 className="fw-bold">
                    {currentUser.status === 'active' ? 'Deactivate User?' : 'Activate User?'}
                  </h4>
                  <p className="text-muted">
                    Are you sure you want to {currentUser.status === 'active' ? 'deactivate' : 'activate'} <strong>{currentUser.name}</strong>?
                  </p>
                  <p className="text-muted">
                    {currentUser.status === 'active'
                      ? 'The user will not be able to access the system until reactivated.'
                      : 'The user will regain access to the system with their current credentials.'}
                  </p>
                </div>
              </div>
              <div className="modal-footer d-flex gap-2">
                <button type="button" className="btn btn-secondary" onClick={() => setShowStatusModal(false)}>Cancel</button>
                <button type="button" className={`btn ${currentUser.status === 'active' ? 'btn-danger' : 'btn-success'}`} onClick={handleChangeStatus}>
                  {currentUser.status === 'active' ? <FaTimes className="me-2" /> : <FaCheck className="me-2" />}
                  {currentUser.status === 'active' ? 'Deactivate' : 'Activate'} User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Backdrop */}
      {(showAddModal || showViewModal || showEditModal || showStatusModal) && <div className="modal-backdrop show"></div>}
    </div>
  );
};

export default SuperAdminUsers;


