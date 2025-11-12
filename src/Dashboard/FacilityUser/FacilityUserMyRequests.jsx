import React, { useState, useEffect, useMemo } from 'react';
import {
  FaClipboardList, FaEye, FaSearch, FaFilter,
  FaCheck, FaTimes, FaExclamationTriangle, FaClock, FaPaperPlane
} from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import axiosInstance from '../../Api/axiosInstance';
import BaseUrl from '../../Api/BaseUrl';
import Swal from 'sweetalert2';

const FacilityUserMyRequests = () => {
  const [showStatusTimelineModal, setShowStatusTimelineModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [facilityItems, setFacilityItems] = useState([]); // ✅ New state
  const [loadingItems, setLoadingItems] = useState(true); // ✅

  const entriesPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // ✅ Helper: Find item name by ID
  const getItemNameById = useMemo(() => {
    const itemMap = {};
    facilityItems.forEach(item => {
      itemMap[item.id] = item.item_name || `Item ID: ${item.id}`;
    });
    return (id) => itemMap[id] || `Item ID: ${id}`;
  }, [facilityItems]);

  // Fetch user ID from localStorage
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.id) {
      setUserId(user.id);
    } else {
      setError('User not logged in.');
      setLoading(false);
    }
  }, []);

  // ✅ Fetch facility inventory items
  const fetchFacilityItems = async () => {
    try {
      setLoadingItems(true);
      const res = await axiosInstance.get(`${BaseUrl}/inventory`);
      let items = [];
      if (Array.isArray(res.data?.data)) {
        items = res.data.data;
      } else if (Array.isArray(res.data)) {
        items = res.data;
      }
      setFacilityItems(
        items.map(item => ({
          id: item.id,
          item_name: item.item_name || 'Unnamed Item',
          unit: item.unit || 'units',
        }))
      );
    } catch (err) {
      console.error('Failed to fetch items:', err);
      setFacilityItems([]);
    } finally {
      setLoadingItems(false);
    }
  };

  // ✅ Fetch requisitions AND enrich with item names
  const fetchRequisitionsData = async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const res = await axiosInstance.get(`${BaseUrl}/requisitions/user/${userId}`);

      if (res.data.success && Array.isArray(res.data.data)) {
        const enriched = res.data.data.map(req => {
          const items = (req.items || []).map(item => ({
            ...item,
            item_name: getItemNameById(item.item_id), // ✅ Resolve name
          }));

          return {
            id: req.requisition_id || req.id,
            item: items.map(i => i.item_name).join(', ') || 'N/A',
            dateRaised: new Date(req.created_at).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            }),
            quantity: items.reduce((sum, i) => sum + (i.quantity || 0), 0),
            status: (req.status || '').charAt(0).toUpperCase() + (req.status || '').slice(1),
            lastUpdated: new Date(req.updated_at).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short'
            }),
            originalData: { ...req, items },
          };
        });

        setRequests(enriched);
      } else {
        throw new Error('Invalid API response');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load requisitions.');
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'Could not fetch your requests.',
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Refetch requisitions whenever facilityItems change (so names appear)
  useEffect(() => {
    if (userId && !loadingItems) {
      fetchRequisitionsData();
    }
  }, [userId, loadingItems, getItemNameById]);

  // Initial fetch of items
  useEffect(() => {
    if (userId) {
      fetchFacilityItems();
    }
  }, [userId]);

  // Reset pagination on search
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Filter & paginate
  const filteredRequests = requests.filter(req =>
    req.id.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredRequests.length / entriesPerPage);
  const currentEntries = filteredRequests.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // UI helpers
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Pending': return 'bg-warning text-dark';
      case 'Dispatched': return 'bg-info';
      case 'Approved': return 'bg-success';
      case 'Rejected': return 'bg-danger';
      case 'Cancelled': return 'bg-secondary';
      case 'Partial_approved': return 'bg-warning';
      default: return 'bg-secondary';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending': return <FaClock className="me-1" />;
      case 'Dispatched': return <FaPaperPlane className="me-1" />;
      case 'Approved': return <FaCheck className="me-1" />;
      case 'Rejected': return <FaTimes className="me-1" />;
      default: return <FaExclamationTriangle className="me-1" />;
    }
  };

  const openStatusTimeline = (request) => {
    setSelectedRequest(request);
    setShowStatusTimelineModal(true);
  };

  // Rest of your render code remains mostly unchanged

  return (
    <div className="">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 bg-white p-3 rounded">
        <div className="mb-3 mb-md-0">
          <h3 className="fw-bold mb-1">My Requests</h3>
          <p className="text-muted mb-0">Track and manage your requisition requests</p>
        </div>
        <div className="d-flex align-items-center">
          <div className="text-end me-3">
            <div className="text-muted small">Department: Pharmacy</div>
            <div>User: Dr. Sharma</div>
          </div>
          <div className="bg-light rounded-circle p-2 flex-shrink-0">
            <FaClipboardList size={24} className="text-primary" />
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center" role="alert">
          <FaExclamationTriangle className="me-2" />
          <div>{error}</div>
        </div>
      )}

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-0 p-3 p-md-4">
          <div className="d-flex flex-column flex-md-row gap-2 w-100 w-md-auto">
            <div className="input-group input-group-sm">
              <span className="input-group-text"><FaSearch /></span>
              <input
                type="text"
                className="form-control"
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="btn btn-sm btn-outline-secondary flex-shrink-0">
              <FaFilter />
            </button>
          </div>
        </div>

        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status" />
              <p className="mt-2 text-muted">Loading your requests...</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>Request ID</th>
                    <th>Item(s)</th>
                    <th>Date Raised</th>
                    <th>Quantity</th>
                    <th>Current Status</th>
                    <th>Last Updated</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentEntries.length > 0 ? (
                    currentEntries.map(request => (
                      <tr key={request.id}>
                        <td>#{request.id}</td>
                        <td className="text-truncate" style={{ maxWidth: '200px' }}>{request.item}</td>
                        <td>{request.dateRaised}</td>
                        <td>{request.quantity}</td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(request.status)}`}>
                            {getStatusIcon(request.status)} {request.status}
                          </span>
                        </td>
                        <td>{request.lastUpdated}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => openStatusTimeline(request)}
                          >
                            <FaEye /> <span className="d-none d-md-inline-block ms-1">View</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center py-4">
                        <div className="text-muted">
                          <FaClipboardList size={24} className="mb-2" />
                          <p>No requisitions found.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-end mt-3">
          <nav>
            <ul className="pagination mb-0">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>
                  Previous
                </button>
              </li>
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                let page;
                if (totalPages <= 5) {
                  page = i + 1;
                } else {
                  if (currentPage <= 3) page = i + 1;
                  else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
                  else page = currentPage - 2 + i;
                }
                return (
                  <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => handlePageChange(page)}>
                      {page}
                    </button>
                  </li>
                );
              })}
              {totalPages > 5 && (
                <>
                  <li className="page-item disabled"><span className="page-link">...</span></li>
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => handlePageChange(totalPages)}>
                      {totalPages}
                    </button>
                  </li>
                </>
              )}
              <li className={`page-item ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}

      {/* Status Timeline Modal */}
      <div className={`modal fade ${showStatusTimelineModal ? 'show' : ''}`} style={{ display: showStatusTimelineModal ? 'block' : 'none' }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Request Status Timeline</h5>
              <button type="button" className="btn-close" onClick={() => setShowStatusTimelineModal(false)}></button>
            </div>
            <div className="modal-body">
              {selectedRequest && (
                <div>
                  <div className="d-flex justify-content-between mb-3">
                    <div>
                      <h6 className="mb-1">{selectedRequest.item}</h6>
                      <small className="text-muted">Raised: {selectedRequest.dateRaised}</small>
                    </div>
                    <span className={`badge ${getStatusBadgeClass(selectedRequest.status)}`}>
                      {getStatusIcon(selectedRequest.status)} {selectedRequest.status}
                    </span>
                  </div>
                  <p className="text-muted">Quantity: {selectedRequest.quantity}</p>

                  {/* Items detail */}
                  {selectedRequest.originalData?.items?.length > 0 && (
                    <div className="mt-3">
                      <h6 className="text-muted small">Items:</h6>
                      <ul className="list-unstyled">
                        {selectedRequest.originalData.items.map((item, idx) => (
                          <li key={idx} className="d-flex justify-content-between py-1 border-bottom">
                            <span>{item.item_name}</span>
                            <span className="text-muted">{item.quantity} {item.unit || 'units'}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowStatusTimelineModal(false)}>Close</button>
            </div>
          </div>
        </div>
      </div>

      {showStatusTimelineModal && <div className="modal-backdrop fade show"></div>}
    </div>
  );
};

export default FacilityUserMyRequests;