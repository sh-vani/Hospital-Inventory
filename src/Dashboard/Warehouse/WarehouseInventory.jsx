import React, { useState, useEffect } from 'react';
import { FaSearch, FaEdit, FaPlusCircle, FaEye, FaTrashAlt } from 'react-icons/fa';
import BaseUrl from '../../Api/BaseUrl';
import axiosInstance from '../../Api/axiosInstance';
import Swal from 'sweetalert2';

const SuperAdminInventory = () => {
  // === STATE ===
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const [currentItem, setCurrentItem] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    item_code: '',
    item_name: '',
    category: '',
    description: '',
    unit: '',
    quantity: 0,
    reorder_level: 0,
    facility_id: 1
  });
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [facilities, setFacilities] = useState([]);
  const [facilitiesLoading, setFacilitiesLoading] = useState(true);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [movements, setMovements] = useState([]);
  const [movementsLoading, setMovementsLoading] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // === FETCH INVENTORY DATA ===
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`${BaseUrl}/inventory`);
        if (response.data.success) {
          setInventory(response.data.data);
        } else {
          setError('Failed to fetch inventory data');
        }
      } catch (err) {
        setError('Error fetching inventory: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, []);

  // === FETCH CATEGORIES ===
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await axiosInstance.get(`${BaseUrl}/inventory/categories`);
        if (response.data.success && Array.isArray(response.data.data)) {
          setCategories(response.data.data);
          if (response.data.data.length > 0 && !addForm.category) {
            setAddForm(prev => ({ ...prev, category: response.data.data[0] }));
          }
        } else {
          setError('Failed to fetch categories');
        }
      } catch (err) {
        setError('Error fetching categories: ' + err.message);
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // === FETCH FACILITIES ===
  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        setFacilitiesLoading(true);
        const response = await axiosInstance.get(`${BaseUrl}/facilities`);
        if (response.data.success && Array.isArray(response.data.data)) {
          setFacilities(response.data.data);
          if (response.data.data.length > 0 && !addForm.facility_id) {
            setAddForm(prev => ({ ...prev, facility_id: response.data.data[0].id }));
          }
        } else {
          setError('Failed to fetch facilities');
        }
      } catch (err) {
        setError('Error fetching facilities: ' + err.message);
      } finally {
        setFacilitiesLoading(false);
      }
    };
    fetchFacilities();
  }, []);

  // === FETCH MOVEMENT DATA ===
  const fetchMovements = async (itemId) => {
    try {
      setMovementsLoading(true);
      const response = await axiosInstance.get(`${BaseUrl}/inventory/${itemId}/movements`);
      if (response.data.success) {
        setMovements(response.data.data.movements);
      } else {
        setError('Failed to fetch movement data');
      }
    } catch (err) {
      setError('Error fetching movements: ' + err.message);
    } finally {
      setMovementsLoading(false);
    }
  };

  // === FILTER LOGIC ===
  const filteredInventory = inventory.filter(item => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return (
      item.item_code.toLowerCase().includes(q) ||
      item.item_name.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      (item.facility_name && item.facility_name.toLowerCase().includes(q))
    );
  });

  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentInventory = filteredInventory.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // === MODAL HANDLERS ===
  const openViewModal = (item) => {
    setViewItem(item);
    setShowViewModal(true);
  };
  
  const openEditModal = (item) => {
    setCurrentItem(item);
    setEditForm({
      item_name: item.item_name,
      category: item.category,
      description: item.description,
      unit: item.unit,
      quantity: item.quantity,
      reorder_level: item.reorder_level,
      facility_id: item.facility_id
    });
    setShowEditModal(true);
  };

  const openHistoryModal = async (item) => {
    setCurrentItem(item);
    setShowHistoryModal(true);
    await fetchMovements(item.id);
  };

  const closeModalOnBackdrop = (e) => {
    if (e.target === e.currentTarget) {
      setShowViewModal(false);
      setShowAddModal(false);
      setShowEditModal(false);
      setShowHistoryModal(false);
    }
  };

  // === FORM HANDLERS ===
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAddInputChange = (e) => {
    const { name, value } = e.target;
    setAddForm(prev => ({
      ...prev,
      [name]: ['quantity', 'reorder_level', 'facility_id'].includes(name)
        ? parseInt(value) || 0
        : value
    }));
  };

  // === ACTION HANDLERS WITH SWEETALERT ===
  const handleSaveEdit = async () => {
    try {
      const response = await axiosInstance.put(`${BaseUrl}/inventory/${currentItem.id}`, editForm);
      if (response.data.success) {
        setInventory(prevInventory => 
          prevInventory.map(item => 
            item.id === currentItem.id ? response.data.data : item
          )
        );
        Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: `Item ${currentItem.item_code} updated successfully.`,
          timer: 2000,
          showConfirmButton: false
        });
        setShowEditModal(false);
      } else {
        Swal.fire('Update Failed', 'Failed to update item.', 'error');
      }
    } catch (err) {
      Swal.fire('Error', 'Error updating item: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  const handleAddItem = async () => {
    const { item_code, item_name, unit, category, facility_id } = addForm;
    if (!item_code || !item_name || !unit || !category || !facility_id) {
      Swal.fire('Missing Fields', 'Please fill all required fields: Item Code, Item Name, Unit, Category, and Facility.', 'warning');
      return;
    }

    try {
      const response = await axiosInstance.post(`${BaseUrl}/inventory`, addForm);
      if (response.data.success) {
        setInventory(prev => [...prev, response.data.data]);
        Swal.fire({
          icon: 'success',
          title: 'Added!',
          text: 'Item added successfully!',
          timer: 1500,
          showConfirmButton: false
        });
        setShowAddModal(false);
        setAddForm({
          item_code: '',
          item_name: '',
          category: categories.length > 0 ? categories[0] : '',
          description: '',
          unit: '',
          quantity: 0,
          reorder_level: 0,
          facility_id: facilities.length > 0 ? facilities[0].id : 1
        });
      } else {
        Swal.fire('Add Failed', response.data.message || 'Unknown error', 'error');
      }
    } catch (err) {
      console.error('Add item error:', err);
      const msg = err.response?.data?.message || err.message || 'Unknown error';
      Swal.fire('Error', 'Error adding item: ' + msg, 'error');
    }
  };

  const handleDeleteItem = async (item) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      html: `You are about to delete:<br><strong>"${item.item_name}"</strong> (Code: ${item.item_code})`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      reverseButtons: true
    });

    if (!result.isConfirmed) return;

    try {
      const response = await axiosInstance.delete(`${BaseUrl}/inventory/${item.id}`);
      if (response.data.success) {
        setInventory(prevInventory => 
          prevInventory.filter(i => i.id !== item.id)
        );
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: `Item "${item.item_name}" has been deleted.`,
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        Swal.fire('Delete Failed', response.data.message || 'Unknown error', 'error');
      }
    } catch (err) {
      console.error('Delete error:', err);
      const msg = err.response?.data?.message || err.message || 'Unknown error';
      Swal.fire('Error', 'Error deleting item: ' + msg, 'error');
    }
  };

  // === HELPER FUNCTIONS ===
  const calculateStatus = (item) => {
    if (item.quantity === 0) return 'out_of_stock';
    if (item.quantity < item.reorder_level) return 'low_stock';
    return 'in_stock';
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'out_of_stock':
        return <span className="badge bg-danger">Out of Stock</span>;
      case 'low_stock':
        return <span className="badge bg-warning text-dark">Low Stock</span>;
      default:
        return <span className="badge bg-success">In Stock</span>;
    }
  };

  const getMovementTypeBadge = (type) => {
    switch (type) {
      case 'stock_in':
        return <span className="badge bg-success">Stock In</span>;
      case 'dispatch':
        return <span className="badge bg-warning text-dark">Dispatch</span>;
      case 'adjustment':
        return <span className="badge bg-danger">Adjustment</span>;
      case 'transfer':
        return <span className="badge bg-info">Transfer</span>;
      default:
        return <span className="badge bg-secondary">{type}</span>;
    }
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const renderPagination = () => {
    if (filteredInventory.length === 0) return null;

    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return (
      <nav className="d-flex justify-content-center mt-3">
        <ul className="pagination mb-0">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button 
              className="page-link" 
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
          </li>
          
          {startPage > 1 && (
            <>
              <li className="page-item">
                <button className="page-link" onClick={() => goToPage(1)}>
                  1
                </button>
              </li>
              {startPage > 2 && (
                <li className="page-item disabled">
                  <span className="page-link">...</span>
                </li>
              )}
            </>
          )}
          
          {pageNumbers.map(number => (
            <li key={number} className={`page-item ${number === currentPage ? 'active' : ''}`}>
              <button className="page-link" onClick={() => goToPage(number)}>
                {number}
              </button>
            </li>
          ))}
          
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && (
                <li className="page-item disabled">
                  <span className="page-link">...</span>
                </li>
              )}
              <li className="page-item">
                <button className="page-link" onClick={() => goToPage(totalPages)}>
                  {totalPages}
                </button>
              </li>
            </>
          )}
          
          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button 
              className="page-link" 
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </li>
        </ul>
      </nav>
    );
  };

  return (
    <div className="container-fluid py-3">
      {/* ===== Top Toolbar ===== */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <h2 className="fw-bold mb-0">Inventory</h2>
        <div className="d-flex align-items-center gap-2">
          <div style={{ maxWidth: '320px', width: '100%' }}>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                style={{ height: "40px" }}
                placeholder="Search by Item Code, Name, or Category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="btn btn-outline-secondary" style={{ height: "40px" }} type="button">
                <FaSearch />
              </button>
            </div>
          </div>
          <button 
            className="btn btn-primary d-flex align-items-center gap-1 text-nowrap"
            onClick={() => setShowAddModal(true)}
          >
            <FaPlusCircle /> Add Item
          </button>
        </div>
      </div>

      {/* ===== LOADING AND ERROR STATES ===== */}
      {loading && (
        <div className="text-center py-4">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}
      
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* ===== TABLE ===== */}
      {!loading && !error && (
        <div className="card border-0 shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover mb-0 align-middle">
              <thead className="bg-light">
                <tr>
                  <th>Item Code</th>
                  <th>Item Name</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Reorder Level</th>
                  <th>Facility</th>
                  <th>Last Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentInventory.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4">No inventory items found.</td>
                  </tr>
                ) : (
                  currentInventory.map((item) => (
                    <tr key={item.id}>
                      <td className="fw-bold">{item.item_code}</td>
                      <td>{item.item_name}</td>
                      <td><span className="badge bg-light text-dark">{item.category}</span></td>
                      <td className={item.quantity < item.reorder_level ? "text-warning fw-medium" : "text-success fw-medium"}>
                        {item.quantity.toLocaleString()}
                      </td>
                      <td>{item.reorder_level.toLocaleString()}</td>
                      <td>{item.facility_name || '—'}</td>
                      <td>{new Date(item.updated_at).toLocaleDateString()}</td>
                      <td>
                        <div className="btn-group" role="group">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            title="Edit Item"
                            onClick={() => openEditModal(item)}
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="btn btn-sm btn-outline-success"
                            title="View Details"
                            onClick={() => openViewModal(item)}
                          >
                            <FaEye />
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            title="Delete Item"
                            onClick={() => handleDeleteItem(item)}
                          >
                            <FaTrashAlt />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {renderPagination()}
        </div>
      )}

      {/* ===== ADD ITEM MODAL ===== */}
      {showAddModal && (
        <div className="modal show d-block" tabIndex="-1" onClick={closeModalOnBackdrop}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Inventory Item</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Item Code <span className="text-danger">*</span></label>
                      <input 
                        className="form-control" 
                        name="item_code"
                        value={addForm.item_code}
                        onChange={handleAddInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Category <span className="text-danger">*</span></label>
                      {categoriesLoading ? (
                        <div className="form-control" disabled>Loading...</div>
                      ) : (
                        <select
                          className="form-select"
                          name="category"
                          value={addForm.category}
                          onChange={handleAddInputChange}
                          required
                        >
                          <option value="">Select Category</option>
                          {categories.map((cat, index) => (
                            <option key={index} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                    <div className="col-md-12">
                      <label className="form-label">Item Name <span className="text-danger">*</span></label>
                      <input 
                        className="form-control" 
                        name="item_name"
                        value={addForm.item_name}
                        onChange={handleAddInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-12">
                      <label className="form-label">Description</label>
                      <textarea 
                        className="form-control" 
                        name="description"
                        value={addForm.description}
                        onChange={handleAddInputChange}
                        rows="2"
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Unit <span className="text-danger">*</span></label>
                      <input 
                        className="form-control" 
                        name="unit"
                        value={addForm.unit}
                        onChange={handleAddInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Quantity</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        name="quantity"
                        value={addForm.quantity}
                        onChange={handleAddInputChange}
                        min="0"
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Reorder Level</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        name="reorder_level"
                        value={addForm.reorder_level}
                        onChange={handleAddInputChange}
                        min="0"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Facility <span className="text-danger">*</span></label>
                      {facilitiesLoading ? (
                        <div className="form-control" disabled>Loading...</div>
                      ) : (
                        <select
                          className="form-select"
                          name="facility_id"
                          value={addForm.facility_id}
                          onChange={handleAddInputChange}
                          required
                        >
                          <option value="">Select Facility</option>
                          {facilities.map(fac => (
                            <option key={fac.id} value={fac.id}>
                              {fac.name} ({fac.type})
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleAddItem}>Add Item</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== EDIT MODAL ===== */}
      {showEditModal && currentItem && (
        <div className="modal show d-block" tabIndex="-1" onClick={closeModalOnBackdrop}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Inventory Item: {currentItem.item_code}</h5>
                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Item Code</label>
                      <input className="form-control" defaultValue={currentItem.item_code} readOnly />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Category</label>
                      {categoriesLoading ? (
                        <div className="form-control" disabled>Loading...</div>
                      ) : (
                        <select
                          className="form-select"
                          name="category"
                          value={editForm.category || ''}
                          onChange={handleInputChange}
                        >
                          <option value="">Select Category</option>
                          {categories.map((cat, index) => (
                            <option key={index} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                    <div className="col-md-12">
                      <label className="form-label">Item Name</label>
                      <input 
                        className="form-control" 
                        name="item_name"
                        value={editForm.item_name || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-12">
                      <label className="form-label">Description</label>
                      <textarea 
                        className="form-control" 
                        name="description"
                        value={editForm.description || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Unit</label>
                      <input 
                        className="form-control" 
                        name="unit"
                        value={editForm.unit || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Quantity</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        name="quantity"
                        value={editForm.quantity || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Reorder Level</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        name="reorder_level"
                        value={editForm.reorder_level || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Facility</label>
                      {facilitiesLoading ? (
                        <div className="form-control" disabled>Loading...</div>
                      ) : (
                        <select
                          className="form-select"
                          name="facility_id"
                          value={editForm.facility_id || ''}
                          onChange={handleInputChange}
                        >
                          <option value="">Select Facility</option>
                          {facilities.map(fac => (
                            <option key={fac.id} value={fac.id}>
                              {fac.name} ({fac.type})
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSaveEdit}>Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Item Modal */}
      {showViewModal && viewItem && (
        <div className="modal fade show d-block" tabIndex="-1" onClick={closeModalOnBackdrop}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header border-bottom-0">
                <h5 className="modal-title">Item Details: {viewItem.item_name}</h5>
                <button type="button" className="btn-close" onClick={() => setShowViewModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-6 fw-bold">Item ID:</div>
                  <div className="col-6">{viewItem.id}</div>
                </div>
                <div className="row mb-3">
                  <div className="col-6 fw-bold">Item Code:</div>
                  <div className="col-6">{viewItem.item_code}</div>
                </div>
                <div className="row mb-3">
                  <div className="col-6 fw-bold">Name:</div>
                  <div className="col-6">{viewItem.item_name}</div>
                </div>
                <div className="row mb-3">
                  <div className="col-6 fw-bold">Category:</div>
                  <div className="col-6">{viewItem.category}</div>
                </div>
                <div className="row mb-3">
                  <div className="col-6 fw-bold">Description:</div>
                  <div className="col-6">{viewItem.description || '—'}</div>
                </div>
                <div className="row mb-3">
                  <div className="col-6 fw-bold">Stock:</div>
                  <div className="col-6">{viewItem.quantity} {viewItem.unit}</div>
                </div>
                <div className="row mb-3">
                  <div className="col-6 fw-bold">Unit:</div>
                  <div className="col-6">{viewItem.unit}</div>
                </div>
                <div className="row mb-3">
                  <div className="col-6 fw-bold">Reorder Level:</div>
                  <div className="col-6">{viewItem.reorder_level}</div>
                </div>
                <div className="row mb-3">
                  <div className="col-6 fw-bold">Facility:</div>
                  <div className="col-6">{viewItem.facility_name || '—'}</div>
                </div>
                <div className="row mb-3">
                  <div className="col-6 fw-bold">Last Updated:</div>
                  <div className="col-6">{new Date(viewItem.updated_at).toLocaleString()}</div>
                </div>
                <div className="row mb-3">
                  <div className="col-6 fw-bold">Status:</div>
                  <div className="col-6">{getStatusBadge(calculateStatus(viewItem))}</div>
                </div>
              </div>
              <div className="modal-footer border-top-0">
                <button type="button" className="btn btn-secondary" onClick={() => setShowViewModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {(showAddModal || showEditModal || showRestockModal || showBatchModal || showViewModal || showHistoryModal) && (
        <div className="modal-backdrop fade show"></div>
      )}
    </div>
  );
};

export default SuperAdminInventory;