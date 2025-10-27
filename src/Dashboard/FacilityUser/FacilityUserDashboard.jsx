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

  // Dashboard stats
  const [stats, setStats] = useState({
    my_total_requests: 0,
    my_dispatched_requests: 0,
    my_rejected_requests: 0,
    available_items: 0
  });

  // Requisitions data
  const [requisitions, setRequisitions] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [approvedRequests, setApprovedRequests] = useState([]);
  const [loadingRequisitions, setLoadingRequisitions] = useState(false);

  // ✅ Extract user info from localStorage
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

  // ✅ Fetch dashboard data
  useEffect(() => {
    if (!user?.id) return;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const response = await axios.get(
          `${BaseUrl}/dashboard/getFacilityUserDashboardUser?user_id=${user.id}`,
          { headers }
        );

        if (response.data?.success) {
          const fetched = response.data.data.stats || {};
          setStats({
            my_total_requests: fetched.my_total_requests || 0,
            my_dispatched_requests: fetched.my_dispatched_requests || 0,
            my_rejected_requests: fetched.my_rejected_requests || 0,
            available_items: fetched.available_items || 0,
          });
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

  // ✅ Fetch requisitions data
  useEffect(() => {
    if (!user?.id) return;

    const fetchRequisitions = async () => {
      try {
        setLoadingRequisitions(true);
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const response = await axios.get(
          `${BaseUrl}/requisitions/user/${user.id}`,
          { headers }
        );

        if (response.data?.success) {
          const requisitionsData = response.data.data || [];
          setRequisitions(requisitionsData);
          
          // Filter pending requests
          const pending = requisitionsData.filter(req => req.status === 'pending');
          setPendingRequests(pending);
          
          // Filter approved requests
          const approved = requisitionsData.filter(req => req.status === 'approved');
          setApprovedRequests(approved);
        } else {
          console.error('Failed to load requisitions:', response.data.message);
        }
      } catch (err) {
        console.error('Requisitions fetch error:', err);
      } finally {
        setLoadingRequisitions(false);
      }
    };

    fetchRequisitions();
  }, [user]);

  // ✅ Helper for date format
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

  // ✅ Status badge
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

  // ✅ Priority badge
  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'urgent': return <span className="badge bg-danger">Urgent</span>;
      case 'high': return <span className="badge bg-warning text-dark">High</span>;
      case 'normal': return <span className="badge bg-info">Normal</span>;
      default: return <span className="badge bg-secondary">{priority || 'N/A'}</span>;
    }
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

      {/* Content */}
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
            {/* KPI Cards (4 only) */}
            <div className="row mb-4">
              {/* Pending Requests */}
              <div className="col-md-3 col-sm-6 mb-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body d-flex align-items-center">
                    <div className="bg-warning bg-opacity-10 p-3 rounded-circle me-3">
                      <FaClock className="text-warning fs-4" />
                    </div>
                    <div>
                      <h5 className="fw-bold mb-0">{stats.my_total_requests}</h5>
                      <p className="mb-0 text-muted small">Pending Requests</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivered This Week */}
              <div className="col-md-3 col-sm-6 mb-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body d-flex align-items-center">
                    <div className="bg-success bg-opacity-10 p-3 rounded-circle me-3">
                      <FaBox className="text-success fs-4" />
                    </div>
                    <div>
                      <h5 className="fw-bold mb-0">{stats.my_dispatched_requests}</h5>
                      <p className="mb-0 text-muted small">Delivered This Week</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Low Stock Items */}
              <div className="col-md-3 col-sm-6 mb-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body d-flex align-items-center">
                    <div className="bg-info bg-opacity-10 p-3 rounded-circle me-3">
                      <FaTruck className="text-info fs-4" />
                    </div>
                    <div>
                      <h5 className="fw-bold mb-0">{stats.my_rejected_requests}</h5>
                      <p className="mb-0 text-muted small">Low Stock Items</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Inventory Items */}
              <div className="col-md-3 col-sm-6 mb-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body d-flex align-items-center">
                    <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                      <FaClipboardList className="text-primary fs-4" />
                    </div>
                    <div>
                      <h5 className="fw-bold mb-0">{stats.available_items}</h5>
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
                {loadingRequisitions ? (
                  <div className="text-center py-4">
                    <div className="spinner-border spinner-border-sm text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : pendingRequests.length === 0 ? (
                  <p className="text-center text-muted py-4">
                    <FaClock className="me-2" /> No pending requests
                  </p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Requisition ID</th>
                          <th>Items</th>
                          <th>Priority</th>
                          <th>Remarks</th>
                          <th>Created At</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingRequests.map((req) => (
                          <tr key={req.id}>
                            <td>#{req.id}</td>
                            <td>
                              {req.items && req.items.length > 0 ? (
                                <div>
                                  {req.items.map((item, index) => (
                                    <div key={item.id}>
                                      {item.item_name} ({item.quantity} {item.unit})
                                      {index < req.items.length - 1 && <hr className="my-1" />}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                'No items'
                              )}
                            </td>
                            <td>{getPriorityBadge(req.priority)}</td>
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
                {loadingRequisitions ? (
                  <div className="text-center py-4">
                    <div className="spinner-border spinner-border-sm text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : approvedRequests.length === 0 ? (
                  <p className="text-center text-muted py-4">
                    <FaCheck className="me-2" /> No approved requests
                  </p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Requisition ID</th>
                          <th>Items</th>
                          <th>Priority</th>
                          <th>Remarks</th>
                          <th>Created At</th>
                          <th>Approved At</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {approvedRequests.map((req) => (
                          <tr key={req.id}>
                            <td>#{req.id}</td>
                            <td>
                              {req.items && req.items.length > 0 ? (
                                <div>
                                  {req.items.map((item, index) => (
                                    <div key={item.id}>
                                      {item.item_name} ({item.quantity} {item.unit})
                                      {index < req.items.length - 1 && <hr className="my-1" />}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                'No items'
                              )}
                            </td>
                            <td>{getPriorityBadge(req.priority)}</td>
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