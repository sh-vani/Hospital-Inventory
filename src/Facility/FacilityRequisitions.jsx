// src/App.jsx
import { useState } from 'react';
function FacilityRequisitions() {
  // Initial requisitions data
  const initialRequisitions = [
    {
      id: '#REQ - 0042',
      facility: 'Kumasi Branch Hospital',
      department: 'Emergency',
      requester: 'Dr. Amoah',
      date: '24 Oct 2023',
      itemCount: '12 items',
      priority: 'High',
      status: 'Pending Review'
    },
    {
      id: '#REQ - 0040',
      facility: 'Takoradi Clinic',
      department: 'Pharmacy',
      requester: 'Dr. Mensah',
      date: '22 Oct 2023',
      itemCount: '5 items',
      priority: 'Medium',
      status: 'Partially Approved'
    },
    {
      id: '#REQ - 0038',
      facility: 'Accra Central Hospital',
      department: 'Laboratory',
      requester: 'Lab Tech. Ama',
      date: '20 Oct 2023',
      itemCount: '7 items',
      priority: 'Low',
      status: 'Pending Review'
    }
  ];
  // Mock Low Stock Items (for bulk requisition)
  const lowStockItems = [
    { itemCode: 'MED-001', itemName: 'Paracetamol 500mg', currentStock: 5, uom: 'Strip', packSize: 10, avgDailyUsage: 2 },
    { itemCode: 'MED-002', itemName: 'Amoxicillin 250mg', currentStock: 0, uom: 'Bottle', packSize: 1, avgDailyUsage: 1 },
    { itemCode: 'SUP-003', itemName: 'Surgical Gloves (L)', currentStock: 3, uom: 'Box', packSize: 100, avgDailyUsage: 5 },
  ];
  const allItems = [
    ...lowStockItems,
    { itemCode: 'MED-004', itemName: 'Ibuprofen 400mg', currentStock: 50, uom: 'Strip', packSize: 10, avgDailyUsage: 3 },
    { itemCode: 'SUP-005', itemName: 'Face Masks (N95)', currentStock: 10, uom: 'Pack', packSize: 50, avgDailyUsage: 8 },
  ];
  // State management
  const [activeTab, setActiveTab] = useState('pending');
  const [requisitions, setRequisitions] = useState(initialRequisitions);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showBulkItemViewModal, setShowBulkItemViewModal] = useState(false);
  const [viewRequisition, setViewRequisition] = useState(null);
  const [currentViewItem, setCurrentViewItem] = useState(null);
  const [newRequisition, setNewRequisition] = useState({
    facility: '',
    department: '',
    requester: '',
    itemCount: '',
    priority: 'Medium'
  });
  const [bulkItems, setBulkItems] = useState(lowStockItems.map(item => ({
    ...item,
    requiredQty: '',
    remarks: ''
  })));
  const [csvError, setCsvError] = useState('');
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  // Filter requisitions based on active tab
  const filteredRequisitions = requisitions.filter(req => {
    if (activeTab === 'pending') {
      return req.status === 'Pending Review' || req.status === 'Partially Approved';
    } else if (activeTab === 'approved') {
      return req.status === 'Approved';
    } else if (activeTab === 'rejected') {
      return req.status === 'Rejected';
    }
    return true;
  });
  // Handle approve action
  const handleApprove = (id) => {
    setRequisitions(requisitions.map(req => 
      req.id === id ? { ...req, status: 'Approved' } : req
    ));
  };
  // Handle reject action
  const handleReject = (id) => {
    setRequisitions(requisitions.map(req => 
      req.id === id ? { ...req, status: 'Rejected' } : req
    ));
  };
  // Handle view action
  const handleView = (requisition) => {
    setViewRequisition(requisition);
    setShowViewModal(true);
  };
  // Handle view bulk item action
  const viewBulkItem = (index) => {
    setCurrentViewItem(bulkItems[index]);
    setShowBulkItemViewModal(true);
  };
  // Handle create modal open
  const handleCreateModalOpen = () => {
    setShowCreateModal(true);
  };
  // Handle bulk modal open
  const handleBulkModalOpen = () => {
    setShowBulkModal(true);
  };
  // Handle create modal close
  const handleCreateModalClose = () => {
    setShowCreateModal(false);
    setNewRequisition({
      facility: '',
      department: '',
      requester: '',
      itemCount: '',
      priority: 'Medium'
    });
  };
  // Handle bulk modal close
  const handleBulkModalClose = () => {
    setShowBulkModal(false);
    setCsvError('');
    setBulkItems(lowStockItems.map(item => ({
      ...item,
      requiredQty: '',
      remarks: ''
    })));
  };
  // Handle view modal close
  const handleViewModalClose = () => {
    setShowViewModal(false);
    setViewRequisition(null);
  };
  // Handle bulk item view modal close
  const handleBulkItemViewModalClose = () => {
    setShowBulkItemViewModal(false);
    setCurrentViewItem(null);
  };
  // Handle input change in form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRequisition({ ...newRequisition, [name]: value });
  };
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Generate new ID
    const newId = `#REQ - ${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    
    // Create new requisition object
    const requisitionToAdd = {
      id: newId,
      facility: newRequisition.facility,
      department: newRequisition.department,
      requester: newRequisition.requester,
      date: new Date().toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      }).replace(/ /g, ' '),
      itemCount: `${newRequisition.itemCount} items`,
      priority: newRequisition.priority,
      status: 'Pending Review'
    };
    
    // Add to requisitions list
    setRequisitions([...requisitions, requisitionToAdd]);
    
    // Close modal and reset form
    handleCreateModalClose();
  };
  // Bulk Requisition Handlers
  const addNewItemRow = () => {
    setBulkItems([...bulkItems, {
      itemCode: '',
      itemName: '',
      currentStock: 0,
      uom: '',
      packSize: 0,
      avgDailyUsage: 0,
      requiredQty: '',
      remarks: ''
    }]);
  };
  const updateBulkItem = (index, field, value) => {
    const newItems = [...bulkItems];
    newItems[index][field] = value;
    // Auto-fill item details if itemCode is selected
    if (field === 'itemCode' && value) {
      const selectedItem = allItems.find(item => item.itemCode === value);
      if (selectedItem) {
        newItems[index] = {
          ...newItems[index],
          itemName: selectedItem.itemName,
          currentStock: selectedItem.currentStock,
          uom: selectedItem.uom,
          packSize: selectedItem.packSize,
          avgDailyUsage: selectedItem.avgDailyUsage
        };
      }
    }
    setBulkItems(newItems);
  };
  const removeBulkItem = (index) => {
    setBulkItems(bulkItems.filter((_, i) => i !== index));
  };
  const handlePlanFor30Days = () => {
    setBulkItems(bulkItems.map(item => ({
      ...item,
      requiredQty: item.avgDailyUsage > 0 ? item.avgDailyUsage * 30 : item.requiredQty
    })));
  };
  const handleCSVImport = () => {
    setShowCsvModal(true);
  };
  const handleCsvFileChange = (e) => {
    setCsvFile(e.target.files[0]);
    setCsvError('');
  };
  const processCSVFile = () => {
    if (!csvFile) {
      setCsvError('Please select a CSV file');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n');
      
      // Skip header row
      const dataLines = lines.slice(1);
      
      const newBulkItems = [];
      const errors = [];
      
      for (let i = 0; i < dataLines.length; i++) {
        const line = dataLines[i].trim();
        if (!line) continue; // Skip empty lines
        
        const values = line.split(',').map(val => val.trim());
        
        if (values.length < 4) {
          errors.push(`Row ${i + 2}: Invalid format. Expected 4 columns.`);
          continue;
        }
        
        const [itemCode, uom, packSizeStr, requiredQtyStr] = values;
        const packSize = parseInt(packSizeStr);
        const requiredQty = parseInt(requiredQtyStr);
        
        // Validate item code
        const item = allItems.find(it => it.itemCode === itemCode);
        if (!item) {
          errors.push(`Row ${i + 2}: Item code "${itemCode}" not found.`);
          continue;
        }
        
        // Validate required quantity
        if (isNaN(requiredQty) || requiredQty <= 0) {
          errors.push(`Row ${i + 2}: Required quantity must be a positive number.`);
          continue;
        }
        
        // Add to bulk items
        newBulkItems.push({
          ...item,
          requiredQty: requiredQty,
          remarks: ''
        });
      }
      
      if (errors.length > 0) {
        setCsvError(errors.join('\n'));
      } else {
        setBulkItems(newBulkItems);
        setShowCsvModal(false);
        setCsvFile(null);
      }
    };
    
    reader.onerror = () => {
      setCsvError('Error reading file');
    };
    
    reader.readAsText(csvFile);
  };
  const submitBulkRequisition = () => {
    // Validate required quantities
    const invalidItems = bulkItems.filter(item => !item.requiredQty || item.requiredQty <= 0);
    if (invalidItems.length > 0) {
      alert("Please enter valid required quantities for all items.");
      return;
    }
    // Generate new ID
    const newId = `#REQ - ${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    
    // Create new requisition object
    const requisitionToAdd = {
      id: newId,
      facility: 'Warehouse Requisition',
      department: 'Inventory',
      requester: 'System Generated',
      date: new Date().toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      }).replace(/ /g, ' '),
      itemCount: `${bulkItems.length} items`,
      priority: 'High',
      status: 'Pending Review'
    };
    
    // Add to requisitions list
    setRequisitions([...requisitions, requisitionToAdd]);
    alert("Bulk Requisition Submitted Successfully!");
    handleBulkModalClose();
  };
  return (
    <div className="container-fluid py-4 px-3 px-md-4">
      {/* Header with Create Buttons */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h1 className="h3 fw-bold mb-1">Requisitions Management</h1>
          <p className="text-muted mb-0">Manage facility and warehouse requisitions</p>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <button className="btn btn-outline-primary" onClick={handleCreateModalOpen}>
            Create Requisition
          </button>
          <button className="btn btn-primary" onClick={handleBulkModalOpen}>
            Create Bulk Requisition
          </button>
        </div>
      </div>
      
      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'approved' ? 'active' : ''}`}
            onClick={() => setActiveTab('approved')}
          >
            Approved
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'rejected' ? 'active' : ''}`}
            onClick={() => setActiveTab('rejected')}
          >
            Rejected
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All
          </button>
        </li>
      </ul>
      
      {/* Requisitions Table */}
      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr>
                <th>Requisition ID</th>
                <th>Facility</th>
                <th>Department</th>
                <th>Requester</th>
                <th>Date</th>
                <th>Item Count</th>
                <th>Priority</th>
                <th>Status</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequisitions.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-4 text-muted">
                    No requisitions found.
                  </td>
                </tr>
              ) : (
                filteredRequisitions.map((req) => (
                  <tr key={req.id}>
                    <td className="fw-medium">{req.id}</td>
                    <td>{req.facility}</td>
                    <td>{req.department}</td>
                    <td>{req.requester}</td>
                    <td>{req.date}</td>
                    <td>{req.itemCount}</td>
                    <td>
                      <span className={`badge rounded-pill ${
                        req.priority === 'High' ? 'bg-danger-subtle text-danger-emphasis' : 
                        req.priority === 'Medium' ? 'bg-warning-subtle text-warning-emphasis' : 'bg-info-subtle text-info-emphasis'
                      } px-3 py-1`}>
                        {req.priority}
                      </span>
                    </td>
                    <td>
                      <span className={`badge rounded-pill ${
                        req.status === 'Approved' ? 'bg-success-subtle text-success-emphasis' : 
                        req.status === 'Rejected' ? 'bg-danger-subtle text-danger-emphasis' : 
                        req.status === 'Partially Approved' ? 'bg-warning-subtle text-warning-emphasis' : 'bg-secondary-subtle text-secondary-emphasis'
                      } px-3 py-1`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="text-center">
                      <div className="btn-group" role="group">
                        <button 
                          className="btn btn-outline-primary d-flex align-items-center justify-content-center"
                          onClick={() => handleApprove(req.id)}
                          disabled={req.status === 'Approved'}
                          title="Approve Requisition"
                        >
                          <i className="bi bi-check-circle"></i>
                        </button>
                        <button 
                          className="btn btn-outline-danger d-flex align-items-center justify-content-center"
                          onClick={() => handleReject(req.id)}
                          disabled={req.status === 'Rejected'}
                          title="Reject Requisition"
                        >
                          <i className="bi bi-x-lg"></i>
                        </button>
                        <button 
                          className="btn btn-outline-secondary d-flex align-items-center justify-content-center"
                          onClick={() => handleView(req)}
                          title="View Details"
                        >
                          <i className="bi bi-eye"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Create Requisition Modal */}
      {showCreateModal && (
        <div className="modal fade show" tabIndex="-1" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={handleCreateModalClose}>
          <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Create New Requisition</h5>
                <button type="button" className="btn-close" onClick={handleCreateModalClose}></button>
              </div>
              <div className="modal-body p-4">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Facility</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      name="facility"
                      value={newRequisition.facility}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Department</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      name="department"
                      value={newRequisition.department}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Requester</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      name="requester"
                      value={newRequisition.requester}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Item Count</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      name="itemCount"
                      value={newRequisition.itemCount}
                      onChange={handleInputChange}
                      min="1"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Priority</label>
                    <select 
                      className="form-select" 
                      name="priority"
                      value={newRequisition.priority}
                      onChange={handleInputChange}
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                  <div className="d-flex flex-column flex-sm-row gap-2 justify-content-end mt-4">
                    <button type="button" className="btn btn-outline-secondary px-4" onClick={handleCreateModalClose}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary px-4">
                      Create
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Bulk Requisition Modal */}
      {showBulkModal && (
        <div className="modal fade show" tabIndex="-1" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={handleBulkModalClose}>
          <div className="modal-dialog modal-xl modal-dialog-centered" onClick={e => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Create Bulk Requisition to Warehouse</h5>
                <button type="button" className="btn-close" onClick={handleBulkModalClose}></button>
              </div>
              <div className="modal-body p-4">
                <div className="d-flex flex-wrap gap-2 mb-4">
                  <button className="btn btn-outline-secondary" onClick={handleCSVImport}>
                    <i className="fas fa-file-import me-1"></i> Import CSV
                  </button>
                  <button className="btn btn-outline-primary" onClick={handlePlanFor30Days} title="Auto-fill quantities based on 30 days of average usage">
                    <i className="fas fa-calendar-alt me-1"></i> Plan for 30 Days
                  </button>
                  <button className="btn btn-outline-success" onClick={addNewItemRow}>
                    <i className="fas fa-plus me-1"></i> Add Item
                  </button>
                </div>
                <div className="table-responsive">
                  <table className="table table-bordered align-middle">
                    <thead className="bg-light">
                      <tr>
                        <th>Item Code</th>
                        <th>Item Name</th>
                        <th>Current Stock</th>
                        <th>Required Qty</th>
                        <th>UoM</th>
                        <th>Pack Size</th>
                        <th>Remarks</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bulkItems.map((item, index) => (
                        <tr key={index}>
                          <td>
                            <select 
                              className="form-select form-select-sm"
                              value={item.itemCode}
                              onChange={(e) => updateBulkItem(index, 'itemCode', e.target.value)}
                            >
                              <option value="">Select Item</option>
                              {allItems.map(opt => (
                                <option key={opt.itemCode} value={opt.itemCode}>{opt.itemCode}</option>
                              ))}
                            </select>
                          </td>
                          <td>{item.itemName}</td>
                          <td>{item.currentStock}</td>
                          <td>
                            <input 
                              type="number" 
                              className="form-control form-control-sm"
                              value={item.requiredQty}
                              onChange={(e) => updateBulkItem(index, 'requiredQty', e.target.value)}
                              min="1"
                              required
                            />
                          </td>
                          <td>{item.uom}</td>
                          <td>{item.packSize}</td>
                          <td>
                            <input 
                              type="text" 
                              className="form-control form-control-sm"
                              value={item.remarks}
                              onChange={(e) => updateBulkItem(index, 'remarks', e.target.value)}
                              placeholder="Optional"
                            />
                          </td>
                          <td>
                            <div className="d-flex flex-row gap-2">
                              <button 
                                className="btn btn-outline-danger d-flex align-items-center justify-content-center"
                                onClick={() => removeBulkItem(index)}
                                disabled={bulkItems.length <= 1}
                                title="Remove Item"
                                style={{ width: '36px', height: '36px' }}
                              >
                                <i className="bi bi-x-lg"></i>
                              </button>
                              <button 
                                className="btn btn-outline-primary d-flex align-items-center justify-content-center"
                                onClick={() => viewBulkItem(index)}
                                title="View Item Details"
                                style={{ width: '36px', height: '36px' }}
                              >
                                <i className="bi bi-eye"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="alert alert-info small mt-3">
                  <i className="fas fa-info-circle me-2"></i>
                  <strong>Tip:</strong> Use "Plan for 30 Days" to auto-fill quantities based on average daily usage.
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <div className="d-flex flex-column flex-sm-row gap-2 w-100">
                  <button type="button" className="btn btn-outline-secondary w-100" onClick={handleBulkModalClose}>
                    Cancel
                  </button>
                  <button type="button" className="btn btn-primary w-100" onClick={submitBulkRequisition}>
                    Submit Bulk Requisition
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* CSV Import Modal */}
      {showCsvModal && (
        <div className="modal fade show" tabIndex="-1" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setShowCsvModal(false)}>
          <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Import CSV File</h5>
                <button type="button" className="btn-close" onClick={() => setShowCsvModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="alert alert-info">
                  <h6>CSV Template Format:</h6>
                  <p>Item Code, UoM, Pack Size, Required Qty</p>
                  <p>Example: MED-001, Strip, 10, 50</p>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="csvFile" className="form-label">Select CSV File</label>
                  <input 
                    type="file" 
                    className="form-control" 
                    id="csvFile" 
                    accept=".csv" 
                    onChange={handleCsvFileChange}
                  />
                </div>
                
                {csvError && (
                  <div className="alert alert-danger">
                    <h6>Import Errors:</h6>
                    <pre className="mb-0">{csvError}</pre>
                  </div>
                )}
              </div>
              <div className="modal-footer border-0 pt-0">
                <div className="d-flex flex-column flex-sm-row gap-2 w-100">
                  <button type="button" className="btn btn-outline-secondary w-100" onClick={() => setShowCsvModal(false)}>
                    Cancel
                  </button>
                  <button type="button" className="btn btn-primary w-100" onClick={processCSVFile}>
                    Import CSV
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* View Requisition Modal */}
      {showViewModal && viewRequisition && (
        <div className="modal fade show" tabIndex="-1" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={handleViewModalClose}>
          <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Requisition Details</h5>
                <button type="button" className="btn-close" onClick={handleViewModalClose}></button>
              </div>
              <div className="modal-body p-4">
                <div className="row mb-3">
                  <div className="col-12 col-md-4 fw-bold text-muted">Requisition ID:</div>
                  <div className="col-12 col-md-8">{viewRequisition.id}</div>
                </div>
                <div className="row mb-3">
                  <div className="col-12 col-md-4 fw-bold text-muted">Facility:</div>
                  <div className="col-12 col-md-8">{viewRequisition.facility}</div>
                </div>
                <div className="row mb-3">
                  <div className="col-12 col-md-4 fw-bold text-muted">Department:</div>
                  <div className="col-12 col-md-8">{viewRequisition.department}</div>
                </div>
                <div className="row mb-3">
                  <div className="col-12 col-md-4 fw-bold text-muted">Requester:</div>
                  <div className="col-12 col-md-8">{viewRequisition.requester}</div>
                </div>
                <div className="row mb-3">
                  <div className="col-12 col-md-4 fw-bold text-muted">Date:</div>
                  <div className="col-12 col-md-8">{viewRequisition.date}</div>
                </div>
                <div className="row mb-3">
                  <div className="col-12 col-md-4 fw-bold text-muted">Item Count:</div>
                  <div className="col-12 col-md-8">{viewRequisition.itemCount}</div>
                </div>
                <div className="row mb-3">
                  <div className="col-12 col-md-4 fw-bold text-muted">Priority:</div>
                  <div className="col-12 col-md-8">
                    <span className={`badge rounded-pill ${
                      viewRequisition.priority === 'High' ? 'bg-danger-subtle text-danger-emphasis' : 
                      viewRequisition.priority === 'Medium' ? 'bg-warning-subtle text-warning-emphasis' : 'bg-info-subtle text-info-emphasis'
                    } px-3 py-1`}>
                      {viewRequisition.priority}
                    </span>
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-12 col-md-4 fw-bold text-muted">Status:</div>
                  <div className="col-12 col-md-8">
                    <span className={`badge rounded-pill ${
                      viewRequisition.status === 'Approved' ? 'bg-success-subtle text-success-emphasis' : 
                      viewRequisition.status === 'Rejected' ? 'bg-danger-subtle text-danger-emphasis' : 
                      viewRequisition.status === 'Partially Approved' ? 'bg-warning-subtle text-warning-emphasis' : 'bg-secondary-subtle text-secondary-emphasis'
                    } px-3 py-1`}>
                      {viewRequisition.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button type="button" className="btn btn-outline-secondary px-4" onClick={handleViewModalClose}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Bulk Item View Modal */}
      {showBulkItemViewModal && currentViewItem && (
        <div className="modal fade show" tabIndex="-1" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={handleBulkItemViewModalClose}>
          <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Item Details</h5>
                <button type="button" className="btn-close" onClick={handleBulkItemViewModalClose}></button>
              </div>
              <div className="modal-body p-4">
                <div className="row mb-3">
                  <div className="col-12 col-md-4 fw-bold text-muted">Item Code:</div>
                  <div className="col-12 col-md-8">{currentViewItem.itemCode}</div>
                </div>
                <div className="row mb-3">
                  <div className="col-12 col-md-4 fw-bold text-muted">Item Name:</div>
                  <div className="col-12 col-md-8">{currentViewItem.itemName}</div>
                </div>
                <div className="row mb-3">
                  <div className="col-12 col-md-4 fw-bold text-muted">Current Stock:</div>
                  <div className="col-12 col-md-8">{currentViewItem.currentStock}</div>
                </div>
                <div className="row mb-3">
                  <div className="col-12 col-md-4 fw-bold text-muted">Required Quantity:</div>
                  <div className="col-12 col-md-8">{currentViewItem.requiredQty}</div>
                </div>
                <div className="row mb-3">
                  <div className="col-12 col-md-4 fw-bold text-muted">Unit of Measure:</div>
                  <div className="col-12 col-md-8">{currentViewItem.uom}</div>
                </div>
                <div className="row mb-3">
                  <div className="col-12 col-md-4 fw-bold text-muted">Pack Size:</div>
                  <div className="col-12 col-md-8">{currentViewItem.packSize}</div>
                </div>
                <div className="row mb-3">
                  <div className="col-12 col-md-4 fw-bold text-muted">Remarks:</div>
                  <div className="col-12 col-md-8">{currentViewItem.remarks || 'N/A'}</div>
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button type="button" className="btn btn-outline-secondary w-100" onClick={handleBulkItemViewModalClose}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default FacilityRequisitions;