import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaExclamationTriangle, FaBoxOpen, FaClock, FaEdit } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';

const FacilityUserRequisition = () => {
  // State for form data
  const [department, setDepartment] = useState('');
  const [username, setUsername] = useState('');
  const [duration, setDuration] = useState('');
  const [durationUnit, setDurationUnit] = useState('days');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([]);
  const [suggestedItems, setSuggestedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Simulate fetching user session data
  useEffect(() => {
    // In a real app, this would come from session/auth context
    setDepartment('Pharmacy');
    setUsername('Dr. Sharma');
    
    // Simulate fetching suggested items based on thresholds
    const mockSuggestedItems = [
      {
        id: 1,
        name: 'Paracetamol 500mg',
        currentStock: 5,
        minLevel: 20,
        trigger: 'Low Stock',
        expiryDate: '2025-06-15'
      },
      {
        id: 2,
        name: 'Antiseptic Solution',
        currentStock: 0,
        minLevel: 10,
        trigger: 'Out of Stock',
        expiryDate: '2025-03-10'
      },
      {
        id: 3,
        name: 'Insulin Pens',
        currentStock: 15,
        minLevel: 25,
        trigger: 'Near Expiry',
        expiryDate: '2024-12-01'
      }
    ];
    
    setSuggestedItems(mockSuggestedItems);
    setItems(mockSuggestedItems.map(item => ({
      ...item,
      requestedQuantity: item.minLevel - item.currentStock > 0 ? item.minLevel - item.currentStock : 10
    })));
  }, []);

  // Handle adding a new item manually
  const handleAddItem = () => {
    const newItem = {
      id: items.length + 1,
      name: '',
      currentStock: 0,
      minLevel: 0,
      trigger: 'Manual Add',
      expiryDate: '',
      requestedQuantity: 1
    };
    setItems([...items, newItem]);
  };

  // Handle removing an item
  const handleRemoveItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  // Handle quantity change
  const handleQuantityChange = (id, quantity) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, requestedQuantity: parseInt(quantity) || 0 } : item
    ));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!duration || !notes) {
      alert('Please fill in all mandatory fields');
      return;
    }
    
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      // Reset form after successful submission
      setTimeout(() => {
        setSuccess(false);
        setItems(suggestedItems.map(item => ({
          ...item,
          requestedQuantity: item.minLevel - item.currentStock > 0 ? item.minLevel - item.currentStock : 10
        })));
        setNotes('');
        setDuration('');
      }, 3000);
    }, 1500);
  };

  // Get trigger icon based on type
  const getTriggerIcon = (trigger) => {
    switch(trigger) {
      case 'Low Stock':
        return <FaExclamationTriangle className="text-warning me-2" />;
      case 'Out of Stock':
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
          <h4 className="mb-0">Create Requisition</h4>
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
                <input 
                  type="text" 
                  className="form-control" 
                  value={department} 
                  disabled 
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Username</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={username} 
                  disabled 
                />
              </div>
            </div>
            
            {/* Duration field */}
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">Duration <span className="text-danger">*</span></label>
                <div className="input-group">
                  <input 
                    type="number" 
                    className="form-control" 
                    value={duration} 
                    onChange={(e) => setDuration(e.target.value)}
                    min="1"
                    required
                  />
                  <select 
                    className="form-select" 
                    value={durationUnit}
                    onChange={(e) => setDurationUnit(e.target.value)}
                  >
                    <option value="days">Days</option>
                    <option value="weeks">Weeks</option>
                  </select>
                </div>
                <div className="form-text">How many days/weeks should this requisition cover?</div>
              </div>
              <div className="col-md-6">
                <label className="form-label">Notes <span className="text-danger">*</span></label>
                <textarea 
                  className="form-control" 
                  rows="3" 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)}
                  required
                ></textarea>
              </div>
            </div>
            
            {/* Items section */}
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5>Requisition Items</h5>
                <button 
                  type="button" 
                  className="btn btn-outline-primary btn-sm"
                  onClick={handleAddItem}
                >
                  <FaPlus className="me-1" /> Add Item
                </button>
              </div>
              
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Item Name</th>
                      <th>Current Stock</th>
                      <th>Min Level</th>
                      <th>Trigger</th>
                      <th>Expiry Date</th>
                      <th>Requested Qty</th>
                      <th>Action</th>
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
                              placeholder="Enter item name"
                              value={item.name}
                              onChange={(e) => {
                                const updatedItems = [...items];
                                updatedItems.find(i => i.id === item.id).name = e.target.value;
                                setItems(updatedItems);
                              }}
                            />
                          ) : (
                            item.name
                          )}
                        </td>
                        <td>{item.currentStock}</td>
                        <td>{item.minLevel}</td>
                        <td>
                          {getTriggerIcon(item.trigger)}
                          {item.trigger}
                        </td>
                        <td>{item.expiryDate || '-'}</td>
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
                          <button 
                            type="button" 
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleRemoveItem(item.id)}
                          >
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
                  No items added. Click "Add Item" to add items manually.
                </div>
              )}
            </div>
            
            {/* Submit button */}
            <div className="d-grid gap-2 d-md-flex justify-content-md-end">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Submitting...
                  </>
                ) : 'Submit Requisition'}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Information section */}
      <div className="card mt-4">
        <div className="card-header bg-light">
          <h5 className="mb-0">Requisition Information</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <h6><FaExclamationTriangle className="text-warning me-2" />Low Stock</h6>
              <p>Triggered when item quantity falls below minimum level.</p>
            </div>
            <div className="col-md-6">
              <h6><FaBoxOpen className="text-danger me-2" />Out of Stock</h6>
              <p>Triggered when item quantity reaches zero.</p>
            </div>
            <div className="col-md-6">
              <h6><FaClock className="text-info me-2" />Near Expiry</h6>
              <p>Triggered when item is approaching expiry date (90/60/30 days before).</p>
            </div>
            <div className="col-md-6">
              <h6><FaEdit className="text-primary me-2" />Manual Add</h6>
              <p>Allows you to manually add items not suggested by the system.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacilityUserRequisition;