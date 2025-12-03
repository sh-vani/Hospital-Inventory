import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaSearch, FaFilter } from 'react-icons/fa';
import axiosInstance from '../Api/axiosInstance';

const FacilityDepartmentsCategories = () => {
  const [departments, setDepartments] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]); // for filtered results
  const [searchTerm, setSearchTerm] = useState(''); // search input value

  const [showAddModal, setShowAddModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);

  const [newDept, setNewDept] = useState({
    department_name: '',
    department_head: ''
  });

  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 10;

  // Fetch departments on mount
  useEffect(() => {
    fetchDepartments();
  }, []);

  // Apply search filter whenever departments or searchTerm changes
  useEffect(() => {
    const filtered = departments.filter(dept =>
      dept.department_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.department_head.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredDepartments(filtered);
    setCurrentPage(1); // reset to first page on new search
  }, [departments, searchTerm]);

  const fetchDepartments = async () => {
    try {
      const res = await axiosInstance.get('/department');
      setDepartments(res.data.data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleAddDepartment = async () => {
    try {
      await axiosInstance.post('/department', newDept);
      setShowAddModal(false);
      setNewDept({ department_name: '', department_head: '' });
      fetchDepartments();
    } catch (error) {
      console.error('Error adding department:', error);
    }
  };

  const handleRemoveDepartment = async () => {
    try {
      await axiosInstance.delete(`/department/${selectedDept.id}`);
      setShowRemoveModal(false);
      fetchDepartments();
    } catch (error) {
      console.error('Error removing department:', error);
    }
  };

  // ✅ Pagination logic uses filteredDepartments
  const totalPages = Math.ceil(filteredDepartments.length / entriesPerPage);
  const indexOfLastEntry = currentPage * entriesPerPage;
  const currentEntries = filteredDepartments.slice(indexOfLastEntry - entriesPerPage, indexOfLastEntry);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="container-fluid p-3">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h1 className="mb-0">Departments</h1>
          <p className="text-muted mt-2 mb-0">
            Easily manage hospital departments and their assigned categories.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <FaPlus className="me-2" /> Add Department
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="card mb-3">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Departments</h5>
          <div className="d-flex gap-2">
            <div className="input-group input-group-sm">
              <span className="input-group-text"><FaSearch /></span>
              <input
                type="text"
                className="form-control"
                placeholder="Search departments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {/* Optional: You can expand "Filter" later (e.g., by status, category) */}
            <button className="btn btn-sm btn-outline-secondary" disabled>
              <FaFilter />
            </button>
          </div>
        </div>
      </div>

      {/* Departments Table */}
      <div className="card">
        <div className="card-body table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Dept ID</th>
                <th>Name</th>
                <th>Head</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentEntries.length > 0 ? (
                currentEntries.map(dept => (
                  <tr key={dept.id}>
                    <td className="fw-medium">{dept.id}</td>
                    <td>{dept.department_name}</td>
                    <td>{dept.department_head}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => { setSelectedDept(dept); setShowRemoveModal(true); }}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center text-muted">No departments found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
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

      {/* Add Department Modal */}
      {showAddModal && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Department</h5>
                <button className="btn-close" onClick={() => setShowAddModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Department Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newDept.department_name}
                    onChange={(e) => setNewDept({ ...newDept, department_name: e.target.value })}
                    placeholder="Enter department name"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Head of Department</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newDept.department_head}
                    onChange={(e) => setNewDept({ ...newDept, department_head: e.target.value })}
                    placeholder="Enter head name"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleAddDepartment}>Add</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Remove Department Modal */}
      {showRemoveModal && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Remove Department</h5>
                <button className="btn-close" onClick={() => setShowRemoveModal(false)}></button>
              </div>
              <div className="modal-body">
                <p>
                  Are you sure you want to remove <strong>{selectedDept?.department_name}</strong>?
                </p>
                <p className="text-muted">This action cannot be undone.</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowRemoveModal(false)}>Cancel</button>
                <button className="btn btn-danger" onClick={handleRemoveDepartment}>Remove</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacilityDepartmentsCategories;