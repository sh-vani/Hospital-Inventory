import React, { useState } from 'react';
import { 
  FaBox, FaSearch, FaFilter, FaEye, FaWarehouse, FaTags, 
  FaCalendarAlt, FaExclamationTriangle, FaCheckCircle, FaTimesCircle
} from 'react-icons/fa';

const FacilityUserInventory = () => {
  // State for search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  
  // State for item details modal
  const [showItemDetailsModal, setShowItemDetailsModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Sample data for inventory items
  const inventoryItems = [
    { 
      id: 1, 
      name: 'Medical Gloves', 
      sku: 'MG-001', 
      category: 'PPE', 
      quantity: 500, 
      unit: 'boxes', 
      location: 'A1-B2', 
      status: 'In Stock',
      lastUpdated: '2023-07-10',
      description: 'Disposable medical gloves for examination and procedures',
      batchInfo: 'BG-2023-001, Expiry: 2025-06-30'
    },
    { 
      id: 2, 
      name: 'Face Masks', 
      sku: 'FM-002', 
      category: 'PPE', 
      quantity: 1200, 
      unit: 'pieces', 
      location: 'A1-B3', 
      status: 'In Stock',
      lastUpdated: '2023-07-12',
      description: 'Surgical face masks for protection against airborne particles',
      batchInfo: 'BF-2023-015, Expiry: 2024-12-31'
    },
    { 
      id: 3, 
      name: 'Sanitizer', 
      sku: 'SZ-003', 
      category: 'Disinfectants', 
      quantity: 50, 
      unit: 'bottles', 
      location: 'A2-C1', 
      status: 'Low Stock',
      lastUpdated: '2023-07-05',
      description: 'Hand sanitizer with 70% alcohol content',
      batchInfo: 'BS-2023-008, Expiry: 2024-09-15'
    },
    { 
      id: 4, 
      name: 'Syringes', 
      sku: 'SY-004', 
      category: 'Medical Equipment', 
      quantity: 0, 
      unit: 'pieces', 
      location: 'A2-C2', 
      status: 'Out of Stock',
      lastUpdated: '2023-06-28',
      description: 'Disposable syringes for medication administration',
      batchInfo: 'N/A'
    },
    { 
      id: 5, 
      name: 'Antibiotics', 
      sku: 'AB-005', 
      category: 'Medicines', 
      quantity: 100, 
      unit: 'bottles', 
      location: 'B1-D1', 
      status: 'In Stock',
      lastUpdated: '2023-07-15',
      description: 'Broad-spectrum antibiotics for bacterial infections',
      batchInfo: 'BA-2023-020, Expiry: 2025-03-15'
    },
    { 
      id: 6, 
      name: 'Bandages', 
      sku: 'BD-006', 
      category: 'Medical Supplies', 
      quantity: 200, 
      unit: 'rolls', 
      location: 'B1-D2', 
      status: 'In Stock',
      lastUpdated: '2023-07-08',
      description: 'Sterile bandages for wound dressing',
      batchInfo: 'BB-2023-012, Expiry: 2024-08-20'
    }
  ];
  
  // Get unique categories for filter
  const categories = ['All', ...new Set(inventoryItems.map(item => item.category))];
  
  // Get unique statuses for filter
  const statuses = ['All', ...new Set(inventoryItems.map(item => item.status))];
  
  // Filter items based on search term and selected filters
  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || item.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });
  
  // Function to open item details modal
  const openItemDetails = (item) => {
    setSelectedItem(item);
    setShowItemDetailsModal(true);
  };
  
  // Function to get status icon
  const getStatusIcon = (status) => {
    switch(status) {
      case 'In Stock':
        return <FaCheckCircle className="text-success" />;
      case 'Low Stock':
        return <FaExclamationTriangle className="text-warning" />;
      case 'Out of Stock':
        return <FaTimesCircle className="text-danger" />;
      default:
        return null;
    }
  };
  
  // Function to get status badge class
  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'In Stock':
        return 'bg-success';
      case 'Low Stock':
        return 'bg-warning text-dark';
      case 'Out of Stock':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };
  
  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="h3">Facility Inventory</h1>
          </div>
          
          <div className="card mb-4">
            <div className="card-header bg-white">
              <h5 className="mb-0">Search & Filter</h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="input-group">
                    <span className="input-group-text"><FaSearch /></span>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Search by name or SKU..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="input-group">
                    <span className="input-group-text"><FaTags /></span>
                    <select 
                      className="form-select" 
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="input-group">
                    <span className="input-group-text"><FaFilter /></span>
                    <select 
                      className="form-select" 
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                      {statuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Inventory Items</h5>
              <div className="text-muted">
                Showing {filteredItems.length} of {inventoryItems.length} items
              </div>
            </div>
            <div className="card-body">
              {filteredItems.length === 0 ? (
                <div className="text-center py-5">
                  <FaBox className="text-muted mb-3" size={48} />
                  <h4>No items found</h4>
                  <p className="text-muted">Try adjusting your search or filter criteria</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Item Name</th>
                        <th>SKU</th>
                        <th>Category</th>
                        <th>Quantity</th>
                        <th>Unit</th>
                        <th>Location</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.map(item => (
                        <tr key={item.id}>
                          <td>{item.id}</td>
                          <td>{item.name}</td>
                          <td>{item.sku}</td>
                          <td>{item.category}</td>
                          <td>{item.quantity}</td>
                          <td>{item.unit}</td>
                          <td>{item.location}</td>
                          <td>
                            <span className={`badge ${getStatusBadgeClass(item.status)}`}>
                              {getStatusIcon(item.status)} {item.status}
                            </span>
                          </td>
                          <td>
                            <button className="btn btn-sm btn-outline-primary" onClick={() => openItemDetails(item)}>
                              <FaEye /> View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Item Details Modal */}
      <div className={`modal fade ${showItemDetailsModal ? 'show' : ''}`} style={{ display: showItemDetailsModal ? 'block' : 'none' }} tabIndex="-1">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Item Details</h5>
              <button type="button" className="btn-close" onClick={() => setShowItemDetailsModal(false)}></button>
            </div>
            <div className="modal-body">
              {selectedItem && (
                <>
                  <div className="row mb-4">
                    <div className="col-md-8">
                      <h4>{selectedItem.name}</h4>
                      <p className="text-muted">{selectedItem.description}</p>
                    </div>
                    <div className="col-md-4 text-md-end">
                      <span className={`badge ${getStatusBadgeClass(selectedItem.status)} fs-6`}>
                        {getStatusIcon(selectedItem.status)} {selectedItem.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <h5>General Information</h5>
                      <table className="table table-sm">
                        <tbody>
                          <tr>
                            <th style={{ width: '40%' }}>SKU</th>
                            <td>{selectedItem.sku}</td>
                          </tr>
                          <tr>
                            <th>Category</th>
                            <td>{selectedItem.category}</td>
                          </tr>
                          <tr>
                            <th>Quantity</th>
                            <td>{selectedItem.quantity} {selectedItem.unit}</td>
                          </tr>
                          <tr>
                            <th>Location</th>
                            <td>{selectedItem.location}</td>
                          </tr>
                          <tr>
                            <th>Last Updated</th>
                            <td>{selectedItem.lastUpdated}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="col-md-6">
                      <h5>Batch Information</h5>
                      <div className="card">
                        <div className="card-body">
                          <p className="mb-0">{selectedItem.batchInfo}</p>
                        </div>
                      </div>
                      
                      <h5 className="mt-3">Availability</h5>
                      <div className="progress mb-2" style={{ height: '25px' }}>
                        <div 
                          className={`progress-bar ${selectedItem.status === 'In Stock' ? 'bg-success' : selectedItem.status === 'Low Stock' ? 'bg-warning' : 'bg-danger'}`}
                          role="progressbar" 
                          style={{ width: `${selectedItem.status === 'In Stock' ? '100' : selectedItem.status === 'Low Stock' ? '30' : '0'}%` }}
                        >
                          {selectedItem.quantity} {selectedItem.unit} available
                        </div>
                      </div>
                      <div className="d-flex justify-content-between">
                        <small className="text-muted">Low Stock: 10 {selectedItem.unit}</small>
                        <small className="text-muted">Max: 1000 {selectedItem.unit}</small>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowItemDetailsModal(false)}>Close</button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal Backdrop */}
      {showItemDetailsModal && <div className="modal-backdrop fade show"></div>}
    </div>
  );
};

export default FacilityUserInventory;