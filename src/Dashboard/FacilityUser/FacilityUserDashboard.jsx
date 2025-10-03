import React, { useState, useEffect } from 'react';
import {
  FaHome, FaClipboardList, FaBox, FaBell, FaWarehouse, FaPlus, FaSearch, FaTimes,
  FaCheck, FaExclamationTriangle, FaTruck, FaClock, FaUser, FaSignOutAlt,
  FaFilter, FaEye, FaDownload, FaCalendarAlt, FaBars, FaListAlt, FaReceipt,
  FaChartLine, FaCog, FaArrowRight
} from 'react-icons/fa';
import axios from 'axios';
import BaseUrl from '../../Api/BaseUrl';
import axiosInstance from '../../Api/axiosInstance';

const FacilityUserDashboard = () => {
  // State management
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [deliveredItems, setDeliveredItems] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState({ 
    name: 'John Doe', 
    facility: 'City General Hospital',
    id: 1,
    facility_id: 1
  });
  
  // New request form state
  const [newRequest, setNewRequest] = useState({
    item: '',
    quantity: 1,
    purpose: '',
    urgency: 'normal'
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchDashboardData();
    fetchNotifications();
  }, []);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch pending requests
      const pendingResponse = await axiosInstance.get(`${BaseUrl}/requisitions?status=pending,processing&user_id=${user.id}`);
      if (pendingResponse.data.success) {
        setPendingRequests(pendingResponse.data.data || []);
      }
      
      // Fetch delivered items (last 7 days)
      const deliveredResponse = await axiosInstance.get(`${BaseUrl}/requisitions?status=delivered&days=7&user_id=${user.id}`);
      if (deliveredResponse.data.success) {
        setDeliveredItems(deliveredResponse.data.data || []);
      }
      
      // Fetch facility inventory
      const inventoryResponse = await axiosInstance.get(`${BaseUrl}/inventory?facility_id=${user.facility_id}`);
      if (inventoryResponse.data.success) {
        setInventory(inventoryResponse.data.data || []);
      }
      
      setError(null);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const response = await axiosInstance.get(`${BaseUrl}/notifications?user_id=${user.id}`);
      if (response.data.success) {
        setNotifications(response.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      // Set mock notifications if API fails
      setNotifications([
        {
          id: 1,
          message: 'Your request for Gloves (100 pcs) has been Delivered.',
          type: 'success',
          timestamp: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: 2,
          message: 'Request for Thermometer is now Processing.',
          type: 'info',
          timestamp: new Date(Date.now() - 7200000).toISOString()
        },
        {
          id: 3,
          message: 'Request rejected: Insufficient justification.',
          type: 'error',
          timestamp: new Date(Date.now() - 10800000).toISOString()
        },
        {
          id: 4,
          message: 'Dispatch for your request is In Transit.',
          type: 'info',
          timestamp: new Date(Date.now() - 14400000).toISOString()
        }
      ]);
    }
  };

  // Handle new request form submission
  const handleNewRequest = async () => {
    if (!newRequest.item || !newRequest.purpose) {
      setError('Please fill all required fields');
      return;
    }

    try {
      const response = await axiosInstance.post(`${BaseUrl}/requisitions`, {
        ...newRequest,
        user_id: user.id,
        facility_id: user.facility_id
      });
      
      if (response.data.success) {
        // Reset form
        setNewRequest({
          item: '',
          quantity: 1,
          purpose: '',
          urgency: 'normal'
        });
        setShowRequestModal(false);
        
        // Refresh data
        fetchDashboardData();
        
        // Add success notification
        setNotifications(prev => [
          {
            id: Date.now(),
            message: `Your request for ${newRequest.item} (${newRequest.quantity} pcs) has been submitted.`,
            type: 'success',
            timestamp: new Date().toISOString()
          },
          ...prev
        ]);
      } else {
        setError(response.data.message || 'Failed to submit request');
      }
    } catch (err) {
      setError('Failed to submit request');
      console.error(err);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="badge bg-warning text-dark">Pending</span>;
      case 'processing':
        return <span className="badge bg-info">Processing</span>;
      case 'approved':
        return <span className="badge bg-primary">Approved</span>;
      case 'dispatched':
        return <span className="badge bg-secondary">Dispatched</span>;
      case 'delivered':
        return <span className="badge bg-success">Delivered</span>;
      case 'rejected':
        return <span className="badge bg-danger">Rejected</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  // Get notification icon
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <FaCheck className="text-success me-2" />;
      case 'error':
        return <FaTimes className="text-danger me-2" />;
      case 'info':
        return <FaTruck className="text-info me-2" />;
      case 'warning':
        return <FaExclamationTriangle className="text-warning me-2" />;
      default:
        return <FaBell className="text-secondary me-2" />;
    }
  };

  // Get stock status
  const getStockStatus = (quantity) => {
    if (quantity === 0) {
      return { text: 'Out of Stock', class: 'text-danger', icon: <FaTimes /> };
    } else if (quantity < 20) {
      return { text: 'Low Stock', class: 'text-warning', icon: <FaExclamationTriangle /> };
    } else {
      return { text: 'Available', class: 'text-success', icon: <FaCheck /> };
    }
  };

  return (
    <div className="bg-light" style={{ minHeight: '100vh' }}>
      {/* Top Bar */}
      <div className="bg-white shadow-sm p-3 d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <div className="bg-primary bg-opacity-10 p-2 rounded-circle me-3">
            <FaUser className="text-primary" />
          </div>
          <div>
            <h4 className="mb-0 fw-bold">Facility User Dashboard</h4>
            <p className="mb-0 text-muted small">{user.name} - {user.facility}</p>
          </div>
        </div>
        
        
      </div>

      {/* Dashboard Content */}
      <div className="p-4">
        {error && <div className="alert alert-danger">{error}</div>}
        {loading ? (
          <div className="d-flex justify-content-center my-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="row mb-4">
              <div className="col-md-3 col-sm-6 mb-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body p-3">
                    <div className="d-flex align-items-center">
                      <div className="bg-warning bg-opacity-10 p-3 rounded-circle me-3">
                        <FaClock className="text-warning fs-4" />
                      </div>
                      <div>
                        <h5 className="mb-0 fw-bold">{pendingRequests.length}</h5>
                        <p className="mb-0 text-muted small">Pending Requests</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="col-md-3 col-sm-6 mb-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body p-3">
                    <div className="d-flex align-items-center">
                      <div className="bg-success bg-opacity-10 p-3 rounded-circle me-3">
                        <FaBox className="text-success fs-4" />
                      </div>
                      <div>
                        <h5 className="mb-0 fw-bold">{deliveredItems.length}</h5>
                        <p className="mb-0 text-muted small">Delivered This Week</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="col-md-3 col-sm-6 mb-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body p-3">
                    <div className="d-flex align-items-center">
                      <div className="bg-info bg-opacity-10 p-3 rounded-circle me-3">
                        <FaTruck className="text-info fs-4" />
                      </div>
                      <div>
                        <h5 className="mb-0 fw-bold">3</h5>
                        <p className="mb-0 text-muted small">In Transit</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="col-md-3 col-sm-6 mb-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body p-3">
                    <div className="d-flex align-items-center">
                      <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                        <FaClipboardList className="text-primary fs-4" />
                      </div>
                      <div>
                        <h5 className="mb-0 fw-bold">12</h5>
                        <p className="mb-0 text-muted small">Total Requests</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* My Pending Requests - Card View */}
            <div className="row mb-4">
              <div className="col-12">
                <div className="card border-0 shadow-sm">
                  <div className="card-header bg-white border-0 pt-4 pb-2">
                    <h5 className="mb-0 fw-bold d-flex align-items-center">
                      <FaClock className="me-2 text-warning" /> My Pending Requests
                    </h5>
                  </div>
                  <div className="card-body">
                    {pendingRequests.length === 0 ? (
                      <div className="text-center py-4">
                        <FaClock className="text-muted mb-3" style={{ fontSize: '48px' }} />
                        <p className="text-muted">You have no pending requests</p>
                      </div>
                    ) : (
                      <div className="row">
                        {pendingRequests.map(request => (
                          <div className="col-md-6 col-lg-4 mb-3" key={request.id}>
                            <div className="card border h-100">
                              <div className="card-body">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                  <h6 className="card-title mb-0">{request.item}</h6>
                                  {getStatusBadge(request.status)}
                                </div>
                                <p className="card-text">
                                  <small className="text-muted">Quantity: {request.quantity}</small><br/>
                                  <small className="text-muted">Raised: {formatDate(request.created_at)}</small>
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Recently Delivered Items - Card View */}
            <div className="row mb-4">
              <div className="col-12">
                <div className="card border-0 shadow-sm">
                  <div className="card-header bg-white border-0 pt-4 pb-2">
                    <h5 className="mb-0 fw-bold d-flex align-items-center">
                      <FaBox className="me-2 text-success" /> Recently Delivered Items
                    </h5>
                  </div>
                  <div className="card-body">
                    {deliveredItems.length === 0 ? (
                      <div className="text-center py-4">
                        <FaBox className="text-muted mb-3" style={{ fontSize: '48px' }} />
                        <p className="text-muted">No items delivered in the last 7 days</p>
                      </div>
                    ) : (
                      <div className="row">
                        {deliveredItems.map(item => (
                          <div className="col-md-6 col-lg-4 mb-3" key={item.id}>
                            <div className="card border h-100">
                              <div className="card-body">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                  <h6 className="card-title mb-0">{item.item}</h6>
                                  <span className="badge bg-success">Delivered</span>
                                </div>
                                <p className="card-text">
                                  <small className="text-muted">Quantity: {item.quantity}</small><br/>
                                  <small className="text-muted">Delivered: {formatDate(item.delivered_at)}</small><br/>
                                  <small className="text-primary">
                                    Receipt: <a href="#" className="text-decoration-none">
                                      {item.receipt_id || `RCP-${item.id}`}
                                    </a>
                                  </small>
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

          
          </>
        )}
      </div>

      {/* Floating Action Button */}
     

      {/* New Request Modal */}


      {/* Modal Backdrop */}

    </div>
  );
};

export default FacilityUserDashboard;