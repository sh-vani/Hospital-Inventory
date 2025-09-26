import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaSearch, FaFilter } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axiosInstance from '../Api/axiosInstance'; // your axios instance

const FacilityDepartmentsCategories = () => {
  const [departments, setDepartments] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);

  const [newDept, setNewDept] = useState({
    department_name: '',
    department_head: ''
  });

  // Fetch departments on mount
  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await axiosInstance.get('/department');
      setDepartments(res.data.data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast.error('Failed to fetch departments');
    }
  };

  const handleAddDepartment = async () => {
    try {
      await axiosInstance.post('/department', newDept);
      toast.success('Department added successfully!');
      setShowAddModal(false);
      setNewDept({ department_name: '', department_head: '' });
      fetchDepartments();
    } catch (error) {
      console.error('Error adding department:', error);
      toast.error('Failed to add department');
    }
  };

  const handleRemoveDepartment = async () => {
    try {
      await axiosInstance.delete(`/department/${selectedDept.id}`);
      toast.success('Department removed successfully!');
      setShowRemoveModal(false);
      fetchDepartments();
    } catch (error) {
      console.error('Error removing department:', error);
      toast.error('Failed to remove department');
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

      {/* Departments Table */}
      <div className="card">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Departments</h5>
          <div className="d-flex gap-2">
            <div className="input-group input-group-sm">
              <span className="input-group-text"><FaSearch /></span>
              <input type="text" className="form-control" placeholder="Search departments..." />
            </div>
            <button className="btn btn-sm btn-outline-secondary">
              <FaFilter />
            </button>
          </div>
        </div>
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
              {departments.map(dept => (
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
              ))}
              {departments.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center text-muted">No departments found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

   {/* Add Department Modal */}
{showAddModal && (
  <>
    <div
      className="modal d-block"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
    >
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
                onChange={(e) =>
                  setNewDept({ ...newDept, department_name: e.target.value })
                }
                placeholder="Enter department name"
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Head of Department</label>
              <input
                type="text"
                className="form-control"
                value={newDept.department_head}
                onChange={(e) =>
                  setNewDept({ ...newDept, department_head: e.target.value })
                }
                placeholder="Enter head name"
              />
            </div>
          </div>
          <div className="modal-footer">
            <button
              className="btn btn-secondary"
              onClick={() => setShowAddModal(false)}
            >
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleAddDepartment}>
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  </>
)}

{/* Remove Department Modal */}
{showRemoveModal && (
  <>
    <div
      className="modal d-block"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Remove Department</h5>
            <button
              className="btn-close"
              onClick={() => setShowRemoveModal(false)}
            ></button>
          </div>
          <div className="modal-body">
            <p>
              Are you sure you want to remove{' '}
              <strong>{selectedDept?.department_name}</strong>?
            </p>
            <p className="text-muted">This action cannot be undone.</p>
          </div>
          <div className="modal-footer">
            <button
              className="btn btn-secondary"
              onClick={() => setShowRemoveModal(false)}
            >
              Cancel
            </button>
            <button className="btn btn-danger" onClick={handleRemoveDepartment}>
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  </>
)}
  
    </div>
  );
};

export default FacilityDepartmentsCategories;
