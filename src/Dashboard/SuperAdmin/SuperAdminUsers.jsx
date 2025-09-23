import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FaPlus, FaSearch, FaEdit, FaTimes, FaCheck, FaUser, FaUserMd, FaUserCog, FaHospital,
  FaEnvelope, FaPhone, FaLock, FaKey, FaInfoCircle, FaUserCircle
} from 'react-icons/fa';
import BaseUrl from '../../Api/BaseUrl';

const SuperAdminUsers = () => {
  // API base URL - replace with your actual API URL

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
    full_name: '',
    email: '',
    phone: '',
    role_id: 1, // Default role
    facility_id: 2, // Default facility
    department: '',
    password: '',
    confirmPassword: ''
  });

  // Edit user form
  const [editUser, setEditUser] = useState({
    full_name: '',
    email: '',
    phone: '',
    role_id: 1,
    facility_id: 2,
    department: ''
  });

  // Status change
  const [newStatus, setNewStatus] = useState('');

  // Users data
  const [users, setUsers] = useState([]);
  
  // User summary stats
  const [userSummary, setUserSummary] = useState({
    totalUsers: 0,
    activeUsers: 0,
    adminUsers: 0,
    medicalStaff: 0
  });

  // Loading state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock facilities - replace with API call if needed
  const facilities = [
    { id: 1, name: 'Main Warehouse' },
    { id: 2, name: 'Kumasi Branch Hospital' },
    { id: 3, name: 'Accra Central Hospital' },
    { id: 4, name: 'Takoradi Clinic' },
    { id: 5, name: 'Cape Coast Hospital' }
  ];

  // Roles mapping
  const roles = [
    { id: 1, name: 'Super Admin' },
    { id: 2, name: 'Warehouse Admin' },
    { id: 3, name: 'Facility Admin' },
    { id: 4, name: 'Facility User' }
  ];

  // Fetch users data
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BaseUrl}/users`);
      setUsers(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user summary
  const fetchUserSummary = async () => {
    try {
      const response = await axios.get(`${BaseUrl}/getUserSummary`);
      setUserSummary(response.data);
    } catch (err) {
      console.error('Failed to fetch user summary:', err);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchUsers();
    fetchUserSummary();
  }, []);

  // Badges (Bootstrap classes only)
  const RoleBadge = ({ roleId }) => {
    const role = roles.find(r => r.id === roleId);
    const map = {
      1: 'bg-danger',      // Super Admin
      2: 'bg-primary',     // Warehouse Admin
      3: 'bg-info text-dark', // Facility Admin
      4: 'bg-secondary'    // Facility User
    };
    return <span className={`badge ${map[roleId] || 'bg-secondary'}`}>{role ? role.name : 'Unknown'}</span>;
  };

  const StatusBadge = ({ status }) => {
    const map = {
      'Active': 'bg-success',
      'Inactive': 'bg-secondary',
      'Pending': 'bg-warning text-dark'
    };
    return <span className={`badge ${map[status] || 'bg-secondary'}`}>{status}</span>;
  };

  // Openers
  const openAddModal = () => {
    setNewUser({
      full_name: '',
      email: '',
      phone: '',
      role_id: 1,
      facility_id: 2,
      department: '',
      password: '',
      confirmPassword: ''
    });
    setShowAddModal(true);
  };
  
  const openViewModal = (user) => { 
    setCurrentUser(user); 
    setShowViewModal(true); 
  };
  
  const openEditModal = (user) => {
    setEditUser({
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      role_id: user.role_id,
      facility_id: user.facility_id,
      department: user.department
    });
    setCurrentUser(user);
    setShowEditModal(true);
  };
  
  const openStatusModal = (user) => {
    setCurrentUser(user);
    setNewStatus(user.status === 'Active' ? 'Inactive' : 'Active');
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

  // API Actions
  const handleAddUser = async () => {
    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...userData } = newUser;
      const response = await axios.post(`${BaseUrl}/users`, userData);
      
      // Add the new user to the state with proper structure
      const newUserWithId = {
        ...response.data,
        id: response.data.id || Math.max(...users.map(u => u.id), 0) + 1, // Fallback ID if not provided
        status: response.data.status || 'Active', // Default status if not provided
        lastLogin: response.data.lastLogin || null,
        created_at: response.data.created_at || new Date().toISOString()
      };
      
      setUsers(prev => [...prev, newUserWithId]);
      setShowAddModal(false);
      
      // Refresh user summary
      fetchUserSummary();
    } catch (err) {
      console.error('Failed to add user:', err);
      setError('Failed to add user');
    }
  };

  const handleEditUser = async () => {
    try {
      const response = await axios.put(`${BaseUrl}/users/${currentUser.id}`, editUser);
      
      // Update the user in the state with the response data
      setUsers(prev => prev.map(u =>
        u.id === currentUser.id ? { 
          ...u, 
          ...response.data,
          // Ensure these fields are preserved if not in response
          status: response.data.status || u.status,
          lastLogin: response.data.lastLogin || u.lastLogin,
          created_at: response.data.created_at || u.created_at
        } : u
      ));
      setShowEditModal(false);
    } catch (err) {
      console.error('Failed to update user:', err);
      setError('Failed to update user');
    }
  };

  const handleChangeStatus = async () => {
    try {
      // Fixed the status update endpoint - changed from /users/status/{id} to /users/{id}/status
      const response = await axios.patch(`${BaseUrl}/users/status/${currentUser.id}`, { 
        status: newStatus 
      });
      
      // Update the user in the state with the response data
      setUsers(prev => prev.map(u =>
        u.id === currentUser.id ? { 
          ...u, 
          status: response.data.status || newStatus,
          // Update any other fields that might be returned
          ...response.data
        } : u
      ));
      setShowStatusModal(false);
      
      // Refresh user summary
      fetchUserSummary();
    } catch (err) {
      console.error('Failed to update user status:', err);
      setError('Failed to update user status');
    }
  };

  // Search filter (applies to table & mobile card list)
  const filtered = users.filter(u => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    
    const role = roles.find(r => r.id === u.role_id);
    const facility = facilities.find(f => f.id === u.facility_id);
    
    return (
      u.id?.toString().toLowerCase().includes(q) ||
      u.full_name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      role?.name?.toLowerCase().includes(q) ||
      facility?.name?.toLowerCase().includes(q) ||
      (u.department || '').toLowerCase().includes(q) ||
      u.status?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="container-fluid py-3">
      {/* ============================================
          Toolbar
          xs (320–480): stacked
          md (≥768): inline
          ============================================ */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center gap-2 mb-4">
        <h2 className="fw-bold mb-0">User Management</h2>

        <div className="d-flex flex-column flex-sm-row align-items-stretch gap-2 w-90 w-md-auto">
          {/* Compact search + button (reduced height) */}
          <div className="input-group">
            <input
              type="text"
              className="form-control form-control-sm"
              style={{height: "40px"}} 
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search users"
            />
            <button className="btn btn-outline-secondary btn-sm" style={{height: "40px"}}  type="button" aria-label="Search">
              <FaSearch />
            </button>
          </div>

          <button
            className="btn btn-primary btn-sm d-inline-flex align-items-center py-1 px-2"
            onClick={openAddModal}
            style={{height: "40px", width:"150px"}} 
          >
            <FaPlus className="me-2" /> Add New User
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Loading indicator */}
      {loading && (
        <div className="d-flex justify-content-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {/* ============================================
          Stats
          xs: 1 col | md: 4 cols
          ============================================ */}
      <div className="row row-cols-1 row-cols-md-4 g-3 mb-4">
        <div className="col">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center p-4">
              <div className="bg-primary bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                <FaUser className="text-primary fs-3" />
              </div>
              <div className="text-primary fw-bold fs-4">{userSummary.totalUsers}</div>
              <div className="text-muted small">Total Users</div>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center p-4">
              <div className="bg-success bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                <FaCheck className="text-success fs-3" />
              </div>
              <div className="text-success fw-bold fs-4">{userSummary.activeUsers}</div>
              <div className="text-muted small">Active Users</div>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center p-4">
              <div className="bg-warning bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                <FaUserCog className="text-warning fs-3" />
              </div>
              <div className="text-warning fw-bold fs-4">{userSummary.adminUsers}</div>
              <div className="text-muted small">Admin Users</div>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center p-4">
              <div className="bg-info bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                <FaUserMd className="text-info fs-3" />
              </div>
              <div className="text-info fw-bold fs-4">{userSummary.medicalStaff}</div>
              <div className="text-muted small">Medical Staff</div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================
          Users
          xs: Card List (d-block d-md-none)
          md+: Table    (d-none d-md-block)
          ============================================ */}
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
                  <th>User ID</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Facility</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Last Login</th>
                  <th className="text-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user, index) => {
                  const role = roles.find(r => r.id === user.role_id);
                  const facility = facilities.find(f => f.id === user.facility_id);
                  
                  return (
                    <tr key={index}>
                      <td className="fw-bold">{user.id}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="bg-secondary bg-opacity-10 p-2 rounded-circle me-2">
                            <FaUser className="text-secondary" />
                          </div>
                          {user.full_name}
                        </div>
                      </td>
                      <td><RoleBadge roleId={user.role_id} /></td>
                      <td>{facility ? facility.name : 'Unknown'}</td>
                      <td>{user.department}</td>
                      <td><StatusBadge status={user.status} /></td>
                      <td>{user.lastLogin || 'Never'}</td>
                      <td>
                        <div className="btn-group" role="group" aria-label="Row actions">
                          <button className="btn btn-sm btn-outline-primary" onClick={() => openViewModal(user)}>
                            <FaInfoCircle />
                          </button>
                          <button className="btn btn-sm btn-outline-primary" onClick={() => openEditModal(user)}>
                            <FaEdit />
                          </button>
                          {user.status === 'Active' ? (
                            <button className="btn btn-sm btn-outline-danger" onClick={() => openStatusModal(user)}>
                              <FaTimes />
                            </button>
                          ) : (
                            <button className="btn btn-sm btn-outline-success" onClick={() => openStatusModal(user)}>
                              <FaCheck />
                            </button>
                          )}
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
              const role = roles.find(r => r.id === u.role_id);
              const facility = facilities.find(f => f.id === u.facility_id);
              
              return (
                <div className="col-12" key={i}>
                  <div className="card">
                    <div className="card-body">
                      {/* Header */}
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="fw-bold">{u.full_name}</span>
                        <StatusBadge status={u.status} />
                      </div>

                      {/* Meta grid */}
                      <div className="row g-2 small">
                        <div className="col-6">
                          <div className="text-muted">User ID</div>
                          <div>{u.id}</div>
                        </div>
                        <div className="col-6">
                          <div className="text-muted">Role</div>
                          <div><RoleBadge roleId={u.role_id} /></div>
                        </div>
                        <div className="col-6">
                          <div className="text-muted">Facility</div>
                          <div>{facility ? facility.name : 'Unknown'}</div>
                        </div>
                        <div className="col-6">
                          <div className="text-muted">Department</div>
                          <div>{u.department}</div>
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
                          <div>{u.lastLogin || 'Never'}</div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="d-flex gap-2 mt-3">
                        <button className="btn btn-outline-primary w-100 btn-sm" onClick={() => openViewModal(u)}>
                          <FaInfoCircle className="me-1" /> Details
                        </button>
                        <button className="btn btn-outline-primary w-100 btn-sm" onClick={() => openEditModal(u)}>
                          <FaEdit className="me-1" /> Edit
                        </button>
                        {u.status === 'Active' ? (
                          <button className="btn btn-outline-danger w-100 btn-sm" onClick={() => openStatusModal(u)}>
                            <FaTimes className="me-1" /> Deactivate
                          </button>
                        ) : (
                          <button className="btn btn-outline-success w-100 btn-sm" onClick={() => openStatusModal(u)}>
                            <FaCheck className="me-1" /> Activate
                          </button>
                        )}
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

      {/* ============================================
          Add User Modal
          Full-screen on small devices
          ============================================ */}
      {showAddModal && (
        <div className="modal show d-block" tabIndex="-1" role="dialog" aria-modal="true">
          <div className="modal-dialog modal-lg modal-dialog-scrollable modal-fullscreen-sm-down">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New User</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
              </div>
              <div className="modal-body">
                <form>
                  {/* xs: stacked | md+: 2 columns */}
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label">Full Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="full_name"
                        value={newUser.full_name}
                        onChange={handleAddUserChange}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Email Address</label>
                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={newUser.email}
                        onChange={handleAddUserChange}
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label">Phone Number</label>
                      <input
                        type="text"
                        className="form-control"
                        name="phone"
                        value={newUser.phone}
                        onChange={handleAddUserChange}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Role</label>
                      <select
                        className="form-select"
                        name="role_id"
                        value={newUser.role_id}
                        onChange={handleAddUserChange}
                      >
                        {roles.map((role) => (
                          <option key={role.id} value={role.id}>{role.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label">Facility</label>
                      <select
                        className="form-select"
                        name="facility_id"
                        value={newUser.facility_id}
                        onChange={handleAddUserChange}
                      >
                        {facilities.map((facility) => (
                          <option key={facility.id} value={facility.id}>{facility.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Department</label>
                      <input
                        type="text"
                        className="form-control"
                        name="department"
                        value={newUser.department}
                        onChange={handleAddUserChange}
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label">Password</label>
                      <div className="input-group">
                        <input
                          type="password"
                          className="form-control"
                          name="password"
                          value={newUser.password}
                          onChange={handleAddUserChange}
                        />
                        <span className="input-group-text"><FaLock /></span>
                      </div>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Confirm Password</label>
                      <div className="input-group">
                        <input
                          type="password"
                          className="form-control"
                          name="confirmPassword"
                          value={newUser.confirmPassword}
                          onChange={handleAddUserChange}
                        />
                        <span className="input-group-text"><FaKey /></span>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
              <div className="modal-footer d-flex gap-2">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-primary" onClick={handleAddUser}>
                  Add User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================
          View User Modal
          ============================================ */}
      {showViewModal && currentUser && (
        <div className="modal show d-block" tabIndex="-1" role="dialog" aria-modal="true">
          <div className="modal-dialog modal-lg modal-dialog-scrollable modal-fullscreen-sm-down">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">User Details: {currentUser.full_name}</h5>
                <button type="button" className="btn-close" onClick={() => setShowViewModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="text-center mb-4">
                  <div className="bg-primary bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                    <FaUserCircle className="text-primary" style={{ fontSize: '3rem' }} />
                  </div>
                  <h4 className="fw-bold">{currentUser.full_name}</h4>
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
                        <p className="mb-0"><RoleBadge roleId={currentUser.role_id} /></p>
                      </div>
                    </div>
                    <div className="d-flex align-items-center mb-2">
                      <FaHospital className="text-primary me-2" />
                      <div>
                        <h6 className="mb-0">Facility</h6>
                        <p className="text-muted mb-0">
                          {facilities.find(f => f.id === currentUser.facility_id)?.name || 'Unknown'}
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
                    <p className="text-muted mb-0">{currentUser.department}</p>
                  </div>
                  <div className="col-12 col-md-6">
                    <h6 className="mb-0">Join Date</h6>
                    <p className="text-muted mb-0">
                      {new Date(currentUser.created_at).toLocaleDateString('en-GB', { 
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                  <div className="col-12 col-md-6">
                    <h6 className="mb-0">Last Login</h6>
                    <p className="text-muted mb-0">
                      {currentUser.lastLogin 
                        ? new Date(currentUser.lastLogin).toLocaleDateString('en-GB', { 
                            day: 'numeric', 
                            month: 'short', 
                            year: 'numeric' 
                          })
                        : 'Never'}
                    </p>
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-2 mt-3">
                  <button className="btn btn-outline-primary" onClick={() => openEditModal(currentUser)}>
                    <FaEdit className="me-2" /> Edit
                  </button>
                  <button className="btn btn-outline-warning" onClick={() => openStatusModal(currentUser)}>
                    {currentUser.status === 'Active' ? <FaTimes className="me-2" /> : <FaCheck className="me-2" />}
                    {currentUser.status === 'Active' ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================
          Edit User Modal
          ============================================ */}
      {showEditModal && currentUser && (
        <div className="modal show d-block" tabIndex="-1" role="dialog" aria-modal="true">
          <div className="modal-dialog modal-lg modal-dialog-scrollable modal-fullscreen-sm-down">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit User: {currentUser.full_name}</h5>
                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
              </div>
              <div className="modal-body">
                <form>
                  {/* xs: stacked | md+: 2 columns */}
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label">Full Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="full_name"
                        value={editUser.full_name}
                        onChange={handleEditUserChange}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Email Address</label>
                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={editUser.email}
                        onChange={handleEditUserChange}
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label">Phone Number</label>
                      <input
                        type="text"
                        className="form-control"
                        name="phone"
                        value={editUser.phone}
                        onChange={handleEditUserChange}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Role</label>
                      <select
                        className="form-select"
                        name="role_id"
                        value={editUser.role_id}
                        onChange={handleEditUserChange}
                      >
                        {roles.map((role) => (
                          <option key={role.id} value={role.id}>{role.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label">Facility</label>
                      <select
                        className="form-select"
                        name="facility_id"
                        value={editUser.facility_id}
                        onChange={handleEditUserChange}
                      >
                        {facilities.map((facility) => (
                          <option key={facility.id} value={facility.id}>{facility.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Department</label>
                      <input
                        type="text"
                        className="form-control"
                        name="department"
                        value={editUser.department}
                        onChange={handleEditUserChange}
                      />
                    </div>
                  </div>
                </form>
              </div>
              <div className="modal-footer d-flex gap-2">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-primary" onClick={handleEditUser}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================
          Status Change Modal
          ============================================ */}
      {showStatusModal && currentUser && (
        <div className="modal show d-block" tabIndex="-1" role="dialog" aria-modal="true">
          <div className="modal-dialog modal-dialog-scrollable modal-fullscreen-sm-down">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {currentUser.status === 'Active' ? 'Deactivate User' : 'Activate User'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowStatusModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="text-center">
                  <div className={`bg-${currentUser.status === 'Active' ? 'danger' : 'success'} bg-opacity-10 p-3 rounded-circle d-inline-block mb-3`}>
                    {currentUser.status === 'Active'
                      ? <FaTimes className="text-danger" style={{ fontSize: '2rem' }} />
                      : <FaCheck className="text-success" style={{ fontSize: '2rem' }} />
                    }
                  </div>
                  <h4 className="fw-bold">
                    {currentUser.status === 'Active' ? 'Deactivate User?' : 'Activate User?'}
                  </h4>
                  <p className="text-muted">
                    Are you sure you want to {currentUser.status === 'Active' ? 'deactivate' : 'activate'} <strong>{currentUser.full_name}</strong>?
                  </p>
                  <p className="text-muted">
                    {currentUser.status === 'Active'
                      ? 'The user will not be able to access the system until reactivated.'
                      : 'The user will regain access to the system with their current credentials.'}
                  </p>
                </div>
              </div>
              <div className="modal-footer d-flex gap-2">
                <button type="button" className="btn btn-secondary" onClick={() => setShowStatusModal(false)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className={`btn ${currentUser.status === 'Active' ? 'btn-danger' : 'btn-success'}`}
                  onClick={handleChangeStatus}
                >
                  {currentUser.status === 'Active' ? <FaTimes className="me-2" /> : <FaCheck className="me-2" />}
                  {currentUser.status === 'Active' ? 'Deactivate' : 'Activate'} User
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