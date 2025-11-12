import React, { useState, useEffect } from 'react';
import {
  FaClock, FaBox, FaTruck, FaClipboardList, FaCheck, FaTimes,
  FaExclamationTriangle, FaUser
} from 'react-icons/fa';
import axios from 'axios';
import BaseUrl from '../../Api/BaseUrl';

const FacilityUserDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  const [stats, setStats] = useState({
    total_pending_requests: 0,
    delivered_this_week: 0,
    low_stock_items: 0,
    total_inventory_items: 0
  });

  const [pendingRequests, setPendingRequests] = useState([]);
  const [approvedRequests, setApprovedRequests] = useState([]);

  // Extract user info from localStorage
  useEffect(() => {
    const userStr =
      localStorage.getItem('user') ||
      localStorage.getItem('userData') ||
      localStorage.getItem('authUser');

    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        if (userData?.id) {
          setUser(userData);
        } else {
          setError('User ID not found in localStorage.');
          setLoading(false);
        }
      } catch (err) {
        console.error('Error parsing user data:', err);
        setError('Invalid user data in localStorage.');
        setLoading(false);
      }
    } else {
      setError('User not logged in. Please log in again.');
      setLoading(false);
    }
  }, []);

  // Fetch dashboard data
  useEffect(() => {
    if (!user?.id) return;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const response = await axios.get(
          `${BaseUrl}/dashboard/user/${user.id}`,
          { headers }
        );

        if (response.data?.success) {
          const data = response.data.data || {};

          setStats({
            total_pending_requests: data.total_pending_requests || 0,
            delivered_this_week: data.delivered_this_week || 0,
            low_stock_items: data.low_stock_items || 0,
            total_inventory_items: data.total_inventory_items || 0,
          });

          setPendingRequests(data.my_pending_requests || []);
          setApprovedRequests(data.my_approved_requests || []);
        } else {
          setError(response.data.message || 'Failed to load dashboard data.');
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError('Failed to fetch dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return <span className="badge bg-warning text-dark">Pending</span>;
      case 'processing': return <span className="badge bg-info">Processing</span>;
      case 'approved': return <span className="badge bg-primary">Approved</span>;
      case 'delivered': return <span className="badge bg-success">Delivered</span>;
      case 'rejected': return <span className="badge bg-danger">Rejected</span>;
      case 'dispatched': return <span className="badge bg-secondary">Dispatched</span>;
      default: return <span className="badge bg-secondary">{status || 'N/A'}</span>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'urgent': return <span className="badge bg-danger">Urgent</span>;
      case 'high': return <span className="badge bg-warning text-dark">High</span>;
      case 'medium': return <span className="badge bg-secondary">Medium</span>;
      case 'normal': return <span className="badge bg-info">Normal</span>;
      default: return <span className="badge bg-secondary">{priority || 'N/A'}</span>;
    }
  };

  // Helper to render item list
  const renderItemNames = (items) => {
    if (!items || items.length === 0) {
      return <span className="text-muted">No items</span>;
    }

    const names = items.map((item, idx) => (
      <span key={idx} className="me-2">
        <strong>{item.item_name || 'Unnamed Item'}</strong>
    
      </span>
    ));

    return <div className="small text-wrap">{names}</div>;
  };

  return (
    <div className="bg-light" style={{ minHeight: '100vh' }}>
      {/* Header */}
      <div className="bg-white shadow-sm p-3 d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <div className="bg-primary bg-opacity-10 p-2 rounded-circle me-3">
            <FaUser className="text-primary" />
          </div>
          <div>
            <h4 className="mb-0 fw-bold">Facility User Dashboard</h4>
            <p className="mb-0 text-muted small">
              {user?.name || 'User'} - {user?.facility || 'Facility'}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4">
        {error && <div className="alert alert-danger">{error}</div>}

        {loading ? (
          <div className="text-center my-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="row mb-4">
              <div className="col-md-3 col-sm-6 mb-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body d-flex align-items-center">
                    <div className="bg-warning bg-opacity-10 p-3 rounded-circle me-3">
                      <FaClock className="text-warning fs-4" />
                    </div>
                    <div>
                      <h5 className="fw-bold mb-0">{stats.total_pending_requests}</h5>
                      <p className="mb-0 text-muted small">Pending Requests</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-3 col-sm-6 mb-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body d-flex align-items-center">
                    <div className="bg-success bg-opacity-10 p-3 rounded-circle me-3">
                      <FaBox className="text-success fs-4" />
                    </div>
                    <div>
                      <h5 className="fw-bold mb-0">{stats.delivered_this_week}</h5>
                      <p className="mb-0 text-muted small">Delivered This Week</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-3 col-sm-6 mb-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body d-flex align-items-center">
                    <div className="bg-danger bg-opacity-10 p-3 rounded-circle me-3">
                      <FaExclamationTriangle className="text-danger fs-4" />
                    </div>
                    <div>
                      <h5 className="fw-bold mb-0">{stats.low_stock_items}</h5>
                      <p className="mb-0 text-muted small">Low Stock Items</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-3 col-sm-6 mb-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body d-flex align-items-center">
                    <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                      <FaClipboardList className="text-primary fs-4" />
                    </div>
                    <div>
                      <h5 className="fw-bold mb-0">{stats.total_inventory_items}</h5>
                      <p className="mb-0 text-muted small">Total Inventory Items</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* My Pending Requests */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white border-0 pt-4 pb-2">
                <h5 className="fw-bold d-flex align-items-center">
                  <FaClock className="me-2 text-warning" /> My Pending Requests
                </h5>
              </div>
              <div className="card-body">
                {pendingRequests.length === 0 ? (
                  <p className="text-center text-muted py-4">
                    <FaClock className="me-2" /> No pending requests
                  </p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Requisition ID</th>
                          <th>Priority</th>
                          <th>Items</th>
                          <th>Remarks</th>
                          <th>Created At</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingRequests.map((req) => (
                          <tr key={req.requisition_id}>
                            <td>#{req.requisition_id}</td>
                            <td>{getPriorityBadge(req.priority)}</td>
                            <td>{renderItemNames(req.items)}</td>
                            <td>{req.remarks || '-'}</td>
                            <td>{formatDate(req.created_at)}</td>
                            <td>{getStatusBadge(req.status)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Approved Requests */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white border-0 pt-4 pb-2">
                <h5 className="fw-bold d-flex align-items-center">
                  <FaCheck className="me-2 text-success" /> Approved Requests
                </h5>
              </div>
              <div className="card-body">
                {approvedRequests.length === 0 ? (
                  <p className="text-center text-muted py-4">
                    <FaCheck className="me-2" /> No approved requests
                  </p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Requisition ID</th>
                          <th>Priority</th>
                          <th>Items</th>
                          <th>Remarks</th>
                          <th>Created At</th>
                          <th>Approved At</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {approvedRequests.map((req) => (
                          <tr key={req.requisition_id}>
                            <td>#{req.requisition_id}</td>
                            <td>{getPriorityBadge(req.priority)}</td>
                            <td>{renderItemNames(req.items)}</td>
                            <td>{req.remarks || '-'}</td>
                            <td>{formatDate(req.created_at)}</td>
                            <td>{req.approved_at ? formatDate(req.approved_at) : '-'}</td>
                            <td>{getStatusBadge(req.status)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FacilityUserDashboard;