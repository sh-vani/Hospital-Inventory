import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaExclamationTriangle, FaBoxOpen, FaClock, FaEdit } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';

const FacilityUserRequisition = () => {
  // State for form data
  const [department, setDepartment] = useState('');
  const [requester, setRequester] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [items, setItems] = useState([]);
  const [suggestedItems, setSuggestedItems] = useState([]);
  const [departmentStockLevels, setDepartmentStockLevels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [requisitionType, setRequisitionType] = useState('individual'); // 'individual' or 'bulk'

  // Bulk requisition modal states
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedBulkItems, setSelectedBulkItems] = useState([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkSuccess, setBulkSuccess] = useState(false);

  // Simulate fetching user session data
  useEffect(() => {
    setDepartment('Pharmacy');
    setRequester('Dr. Sharma');

    const mockSuggestedItems = [
      { id: 1, code: 'MED-001', name: 'Paracetamol 500mg', currentStock: 5, minLevel: 20, trigger: 'Low Stock', expiryDate: '2025-06-15' },
      { id: 2, code: 'SUP-005', name: 'Antiseptic Solution', currentStock: 0, minLevel: 10, trigger: 'Out of Stock', expiryDate: '2025-03-10' },
      { id: 3, code: 'MED-003', name: 'Insulin Pens', currentStock: 15, minLevel: 25, trigger: 'Near Expiry', expiryDate: '2024-12-01' }
    ];

    const mockDepartmentStockLevels = [
      { id: 101, code: 'MED-001', name: 'Paracetamol 500mg', currentStock: 50, minLevel: 100, trigger: 'Department Low Stock' },
      { id: 102, code: 'SUP-005', name: 'Antiseptic Solution', currentStock: 0, minLevel: 50, trigger: 'Department Out of Stock' },
      { id: 103, code: 'MED-003', name: 'Insulin Pens', currentStock: 30, minLevel: 40, trigger: 'Department Low Stock' },
      { id: 104, code: 'SUP-010', name: 'Surgical Gloves', currentStock: 200, minLevel: 150, trigger: 'Normal Stock' },
      { id: 105, code: 'SUP-015', name: 'Face Masks', currentStock: 10, minLevel: 100, trigger: 'Department Low Stock' },
      { id: 106, code: 'MED-005', name: 'Syringes', currentStock: 0, minLevel: 200, trigger: 'Department Out of Stock' }
    ];

    setSuggestedItems(mockSuggestedItems);
    setDepartmentStockLevels(mockDepartmentStockLevels);

    setItems(
      mockSuggestedItems.map(item => ({
        ...item,
        requestedQuantity: item.minLevel - item.currentStock > 0 ? item.minLevel - item.currentStock : 10,
        remarks: ''
      }))
    );
  }, []);

  // Handle requisition type change
  useEffect(() => {
    if (requisitionType === 'individual') {
      setItems(
        suggestedItems.map(item => ({
          ...item,
          requestedQuantity: item.minLevel - item.currentStock > 0 ? item.minLevel - item.currentStock : 10,
          remarks: ''
        }))
      );
    } else {
      const bulkItems = departmentStockLevels
        .filter(item => item.currentStock < item.minLevel)
        .map(item => ({
          ...item,
          requestedQuantity: item.minLevel - item.currentStock > 0 ? item.minLevel - item.currentStock : 10,
          remarks: '', // department-level not tracked
          expiryDate: ''
        }));
      setItems(bulkItems);
    }
  }, [requisitionType, suggestedItems, departmentStockLevels]);

  // Add / remove / quantity / remarks
  const handleAddItem = () => {
    const newItem = {
      id: items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 1,
      code: '',
      name: '',
      currentStock: 0,
      minLevel: 0,
      trigger: 'Manual Add',
      expiryDate: '',
      requestedQuantity: 1,
      remarks: ''
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (id) => setItems(items.filter(item => item.id !== id));
  
  const handleQuantityChange = (id, quantity) =>
    setItems(items.map(item => (item.id === id ? { ...item, requestedQuantity: parseInt(quantity) || 0 } : item)));
    
  const handleRemarksChange = (id, remarks) =>
    setItems(items.map(item => (item.id === id ? { ...item, remarks: remarks } : item)));

  // Submit
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        if (requisitionType === 'individual') {
          setItems(
            suggestedItems.map(item => ({
              ...item,
              requestedQuantity: item.minLevel - item.currentStock > 0 ? item.minLevel - item.currentStock : 10,
              remarks: ''
            }))
          );
        } else {
          const bulkItems = departmentStockLevels
            .filter(item => item.currentStock < item.minLevel)
            .map(item => ({
              ...item,
              requestedQuantity: item.minLevel - item.currentStock > 0 ? item.minLevel - item.currentStock : 10,
              remarks: '',
              expiryDate: ''
            }));
          setItems(bulkItems);
        }
      }, 3000);
    }, 1500);
  };

  // Bulk modal open/close
  const handleOpenBulkModal = () => {
    setShowBulkModal(true);
    const preSelected = departmentStockLevels
      .filter(item => item.currentStock < item.minLevel)
      .map(item => ({
        ...item,
        requestedQuantity: item.minLevel - item.currentStock > 0 ? item.minLevel - item.currentStock : 10,
        remarks: '',
        selected: true
      }));
    setSelectedBulkItems(preSelected);
  };
  
  const handleCloseBulkModal = () => {
    setShowBulkModal(false);
    setSelectedBulkItems([]);
    setBulkSuccess(false);
  };

  // Bulk modal interactions
  const handleBulkItemSelection = (id) =>
    setSelectedBulkItems(selectedBulkItems.map(item => (item.id === id ? { ...item, selected: !item.selected } : item)));

  const handleBulkQuantityChange = (id, quantity) =>
    setSelectedBulkItems(selectedBulkItems.map(item => (item.id === id ? { ...item, requestedQuantity: parseInt(quantity) || 0 } : item)));
    
  const handleBulkRemarksChange = (id, remarks) =>
    setSelectedBulkItems(selectedBulkItems.map(item => (item.id === id ? { ...item, remarks: remarks } : item)));

  // Bulk submit
  const handleBulkSubmit = (e) => {
    e.preventDefault();
    const selectedItems = selectedBulkItems.filter(item => item.selected);

    if (selectedItems.length === 0) {
      alert('Please select at least one item for bulk requisition');
      return;
    }
    if (selectedItems.some(i => !i.requestedQuantity || i.requestedQuantity <= 0)) {
      alert('Please provide a positive quantity for selected items');
      return;
    }

    setBulkLoading(true);
    setTimeout(() => {
      setBulkLoading(false);
      setBulkSuccess(true);
      setItems(selectedItems.map(({ selected, ...rest }) => rest));
      setTimeout(() => handleCloseBulkModal(), 3000);
    }, 1500);
  };

  // Icons
  const getTriggerIcon = (trigger) => {
    switch (trigger) {
      case 'Low Stock':
      case 'Department Low Stock':
        return <FaExclamationTriangle className="text-warning me-2" />;
      case 'Out of Stock':
      case 'Department Out of Stock':
        return <FaBoxOpen className="text-danger me-2" />;
      case 'Near Expiry':
        return <FaClock className="text-info me-2" />;
      case 'Manual Add':
        return <FaEdit className="text-primary me-2" />;
      default:
        return null;
    }
  };

  return (
    <div className="container py-4">
      <div className="card shadow">
        <div className="card-header text-black">
          <h4 className="mb-0">Create New Requisition</h4>
          <p className="mb-0">Submit requisition to Facility Admin</p>
        </div>

        <div className="card-body">
          {success && (
            <div className="alert alert-success alert-dismissible fade show" role="alert">
              <strong>Success!</strong> Your requisition has been submitted to Facility Admin.
              <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Auto-filled fields */}
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">Department</label>
                <input type="text" className="form-control" value={department} disabled />
              </div>
              <div className="col-md-6">
                <label className="form-label">Requester</label>
                <input type="text" className="form-control" value={requester} disabled />
              </div>
            </div>

            {/* Priority */}
            <div className="mb-3">
              <label className="form-label">Priority</label>
              <select 
                className="form-select" 
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            {/* Requisition Type */}
            <div className="mb-3">
              <label className="form-label">Requisition Type</label>
              <div>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="requisitionType"
                    id="individual"
                    value="individual"
                    checked={requisitionType === 'individual'}
                    onChange={() => setRequisitionType('individual')}
                  />
                  <label className="form-check-label" htmlFor="individual">Individual (Based on Facility Stock)</label>
                </div>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="requisitionType"
                    id="bulk"
                    value="bulk"
                    checked={requisitionType === 'bulk'}
                    onChange={() => setRequisitionType('bulk')}
                  />
                  <label className="form-check-label" htmlFor="bulk">Bulk (Based on Department Stock)</label>
                </div>
              </div>
              <div className="form-text">
                {requisitionType === 'individual'
                  ? 'Individual requisition is triggered by current facility available stock levels.'
                  : 'Bulk requisition is triggered by department-level low/out-of-stock situations.'}
              </div>
            </div>

            {/* Items */}
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5>Items</h5>
                <div>
                  {requisitionType === 'bulk' && (
                    <button
                      type="button"
                      className="btn btn-outline-success btn-sm me-2"
                      data-bs-toggle="modal"
                      data-bs-target="#bulkRequisitionModal"
                      onClick={handleOpenBulkModal}
                    >
                      Create Bulk Requisition
                    </button>
                  )}
                  <button type="button" className="btn btn-outline-primary btn-sm" onClick={handleAddItem}>
                    <FaPlus className="me-1" /> Add Item
                  </button>
                </div>
              </div>

              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Item Code</th>
                      <th>Item Name</th>
                      <th>Quantity</th>
                      <th>Remarks (Optional)</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td>
                          {item.trigger === 'Manual Add' ? (
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              placeholder="Enter item code"
                              value={item.code}
                              onChange={(e) => {
                                const updated = items.map(i => i.id === item.id ? { ...i, code: e.target.value } : i);
                                setItems(updated);
                              }}
                            />
                          ) : (
                            item.code
                          )}
                        </td>
                        <td>
                          {item.trigger === 'Manual Add' ? (
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              placeholder="Enter item name"
                              value={item.name}
                              onChange={(e) => {
                                const updated = items.map(i => i.id === item.id ? { ...i, name: e.target.value } : i);
                                setItems(updated);
                              }}
                            />
                          ) : (
                            item.name
                          )}
                        </td>
                        <td>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            min="1"
                            value={item.requestedQuantity}
                            onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Optional remarks"
                            value={item.remarks}
                            onChange={(e) => handleRemarksChange(item.id, e.target.value)}
                          />
                        </td>
                        <td>
                          <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => handleRemoveItem(item.id)}>
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {items.length === 0 && (
                <div className="text-center py-3 text-muted">
                  {requisitionType === 'individual'
                    ? 'No items added. Click "Add Item" to add items manually.'
                    : 'No department-level low stock items found. Click "Add Item" to add items manually or "Create Bulk Requisition" to select multiple items.'}
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="d-grid gap-2 d-md-flex justify-content-md-end">
              <button type="button" className="btn btn-outline-secondary me-2">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Creating...
                  </>
                ) : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Bulk Requisition Modal */}
      <div className={`modal fade ${showBulkModal ? 'show' : ''}`} id="bulkRequisitionModal" tabIndex="-1" aria-labelledby="bulkRequisitionModalLabel" aria-hidden={!showBulkModal} style={{ display: showBulkModal ? 'block' : 'none' }}>
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header text-black">
              <h5 className="modal-title" id="bulkRequisitionModalLabel">Create Bulk Requisition</h5>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close" onClick={handleCloseBulkModal}></button>
            </div>
            <div className="modal-body p-3">
              {bulkSuccess && (
                <div className="alert alert-success alert-dismissible fade show" role="alert">
                  <strong>Success!</strong> Your bulk requisition has been submitted to Facility Admin.
                </div>
              )}

              <form onSubmit={handleBulkSubmit}>
                <div className="mb-3">
                  <h6 className="mb-2">Select Items for Bulk Requisition</h6>
                  <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    <table className="table table-sm table-hover">
                      <thead className="table-light sticky-top">
                        <tr>
                          <th width="40px">Select</th>
                          <th>Item Code</th>
                          <th>Item Name</th>
                          <th className="text-center">Quantity</th>
                          <th>Remarks (Optional)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {departmentStockLevels.map((item) => {
                          const bulkItem = selectedBulkItems.find(i => i.id === item.id) ||
                            { ...item, selected: false, requestedQuantity: 0, remarks: '' };

                          return (
                            <tr key={item.id}>
                              <td className="text-center">
                                <div className="form-check">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    checked={bulkItem.selected}
                                    onChange={() => handleBulkItemSelection(item.id)}
                                  />
                                </div>
                              </td>
                              <td className="small">{item.code}</td>
                              <td className="small">
                                <div>{item.name}</div>
                                <div className="text-muted">
                                  {getTriggerIcon(item.trigger)}
                                  <small>{item.trigger}</small>
                                </div>
                              </td>
                              <td className="text-center">
                                <input
                                  type="number"
                                  className="form-control form-control-sm"
                                  min="1"
                                  value={bulkItem.requestedQuantity}
                                  onChange={(e) => handleBulkQuantityChange(item.id, e.target.value)}
                                  disabled={!bulkItem.selected}
                                  style={{ width: '70px' }}
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  placeholder="Optional remarks"
                                  value={bulkItem.remarks}
                                  onChange={(e) => handleBulkRemarksChange(item.id, e.target.value)}
                                  disabled={!bulkItem.selected}
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <button type="button" className="btn btn-secondary btn-sm" data-bs-dismiss="modal" onClick={handleCloseBulkModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={bulkLoading}>
                    {bulkLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Creating...
                      </>
                    ) : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Backdrop */}
      {showBulkModal && <div className="modal-backdrop fade show"></div>}

      {/* Info section */}
      <div className="card mt-4">
        <div className="card-header bg-light">
          <h5 className="mb-0">Requisition Information</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <h6><FaExclamationTriangle className="text-warning me-2" />Low Stock</h6>
              <p>Triggered when item quantity falls below minimum level at facility level.</p>
            </div>
            <div className="col-md-6">
              <h6><FaBoxOpen className="text-danger me-2" />Out of Stock</h6>
              <p>Triggered when item quantity reaches zero at facility level.</p>
            </div>
            <div className="col-md-6">
              <h6><FaClock className="text-info me-2" />Near Expiry</h6>
              <p>Triggered when item is approaching expiry date (90/60/30 days before).</p>
            </div>
            <div className="col-md-6">
              <h6><FaEdit className="text-primary me-2" />Manual Add</h6>
              <p>Allows you to manually add items not suggested by the system.</p>
            </div>
            <div className="col-md-6">
              <h6><FaExclamationTriangle className="text-warning me-2" />Department Low Stock</h6>
              <p>Triggered when department stock level falls below minimum level.</p>
            </div>
            <div className="col-md-6">
              <h6><FaBoxOpen className="text-danger me-2" />Department Out of Stock</h6>
              <p>Triggered when department stock level reaches zero.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacilityUserRequisition;