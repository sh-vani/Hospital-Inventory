import React, { useState, useEffect } from 'react';
import { Modal, Form, Row, Col, Button } from 'react-bootstrap';
import axiosInstance from '../Api/axiosInstance';

const FacilityUser = () => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add'); // add | edit
  const [selectedUser, setSelectedUser] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'facility_user', // always fixed
    phone: '',
    department: '',

  });

  // ✅ Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 10;

  // ✅ Get logged-in user info from localStorage
  const getLoggedInUser = () => {
    const userData = localStorage.getItem('user');
    if (!userData) return {};
    try {
      return JSON.parse(userData);
    } catch (err) {
      console.error('Failed to parse user from localStorage', err);
      return {};
    }
  };

  const loggedInUser = getLoggedInUser();

  // ✅ Fetch departments and users
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await axiosInstance.get('/department');
        setDepartments(res.data.data);
      } catch (err) {
        console.error('Error fetching departments', err);
      }
    };

    const fetchUsers = async () => {
      try {
        const facilityAdminId = loggedInUser.id;
        const res = await axiosInstance.get(`/users/facility-admin/users/${facilityAdminId}`);
        setUsers(res.data.data);
      } catch (err) {
        console.error('Error fetching users', err);
      }
    };

    fetchDepartments();
    fetchUsers();
  }, [loggedInUser.id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'facility_user',
      phone: '',
      department: '',

    });
    setModalType('add');
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: 'facility_user',
      phone: user.phone,

      department: String(user.department_id),
    });
    setModalType('edit');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    let facility_id, facility_admin_id;
  
    if (modalType === 'add') {
      // Add: logged-in user की facility
      facility_id = loggedInUser.facility_id ? Number(loggedInUser.facility_id) : null;
      facility_admin_id = loggedInUser.id ? Number(loggedInUser.id) : null;
    } else {
      // Edit: existing user की facility (preserve original)
      facility_id = selectedUser.facility_id;
      facility_admin_id = selectedUser.facility_admin_id;
    }
  
    if (!facility_id || isNaN(facility_id)) {
      alert('Facility ID is missing or invalid.');
      return;
    }
  
    const payload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: 'facility_user',
      department: formData.department,
      facility_id: Number(facility_id),
      facility_admin_id: Number(facility_admin_id),
    };
  
    if (formData.password) {
      payload.password = formData.password;
    }
  
    try {
      if (modalType === 'add') {
        await axiosInstance.post('/users', payload);
      } else {
        await axiosInstance.put(`/users/${selectedUser.id}`, payload);
      }
  
      setShowModal(false);
      const res = await axiosInstance.get(`/users/facility-admin/users/${loggedInUser.id}`);
      setUsers(res.data.data);
    } catch (err) {
      console.error('Error saving user', err);
      const msg = err.response?.data?.message || 'Failed to save user';
      alert(msg);
    }
  };

  const handleDelete = async (user) => {
    if (window.confirm(`Are you sure you want to delete ${user.name}?`)) {
      try {
        await axiosInstance.delete(`/users/${user.id}`);
        const res = await axiosInstance.get(`/users/facility-admin/users/${loggedInUser.id}`);
        setUsers(res.data.data);
      } catch (err) {
        console.error('Error deleting user', err);
      }
    }
  };

  // ✅ Pagination logic
  const totalPages = Math.ceil(users.length / entriesPerPage);
  const indexOfLastEntry = currentPage * entriesPerPage;
  const currentEntries = users.slice(indexOfLastEntry - entriesPerPage, indexOfLastEntry);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Facility Users</h1>
        <Button onClick={openAddModal}>Add User</Button>
      </div>

      <div className="table-responsive card p-3">
        <table className="table table-hover">
          <thead>
            <tr>
              <th>SL</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Department</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentEntries.length > 0 ? (
              currentEntries.map((u, index) => (
                <tr key={u.id}>
                  <td>{(currentPage - 1) * entriesPerPage + index + 1}</td>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.phone}</td>
                  <td>{u.department_name}</td>
                  <td>
                    <Button size="sm" onClick={() => openEditModal(u)}>Edit</Button>{' '}
                    <Button size="sm" variant="danger" onClick={() => handleDelete(u)}>Delete</Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center text-muted py-3">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* ✅ PAGINATION UI — Same as your other components */}
        <div className="d-flex justify-content-end mt-3">
          <nav>
            <ul className="pagination mb-0">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
              </li>

              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1;
                return (
                  <li
                    key={page}
                    className={`page-item ${currentPage === page ? 'active' : ''}`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  </li>
                );
              })}

              <li className={`page-item ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </div>
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{modalType === 'add' ? 'Add User' : 'Edit User'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Name *</Form.Label>
                  <Form.Control name="name" value={formData.name} onChange={handleInputChange} required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Email *</Form.Label>
                  <Form.Control name="email" type="email" value={formData.email} onChange={handleInputChange} required />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Password {modalType === 'edit' ? '(leave blank to keep unchanged)' : ''}</Form.Label>
                  <Form.Control name="password" type="password" value={formData.password} onChange={handleInputChange} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Phone</Form.Label>
                  <Form.Control name="phone" value={formData.phone} onChange={handleInputChange} />
                </Form.Group>
              </Col>
            </Row>

            {/* ✅ Role is hidden completely */}

            <Row className="mb-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Department *</Form.Label>
                  <Form.Select name="department" value={formData.department} onChange={handleInputChange} required>
                    <option value="">Select Department</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.department_name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit}>{modalType === 'add' ? 'Add User' : 'Update User'}</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default FacilityUser;