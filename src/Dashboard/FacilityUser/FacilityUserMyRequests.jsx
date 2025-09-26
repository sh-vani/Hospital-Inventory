import React, { useState, useEffect } from 'react';
import { 
  FaClipboardList, FaEye, FaSearch, FaFilter, 
  FaCheck, FaTimes, FaExclamationTriangle, FaClock, FaPaperPlane
} from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import BaseUrl from '../../Api/BaseUrl';
import axiosInstance from '../../Api/axiosInstance';

const FacilityUserMyRequests = () => {
  // State for modals
  const [showStatusTimelineModal, setShowStatusTimelineModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  
  // State for search term
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for API data
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  const baseUrl = BaseUrl;
  
  // NEW: Retry function with exponential backoff for 429 errors
  const fetchWithRetry = async (axiosCall, maxRetries = 3, initialDelay = 1000) => {
    let retryCount = 0;
    let delay = initialDelay;
    
    while (retryCount <= maxRetries) {
      try {
        const response = await axiosCall();
        return response;
      } catch (error) {
        if (error.response && error.response.status === 429 && retryCount < maxRetries) {
          retryCount++;
          console.log(`Rate limited. Retrying in ${delay}ms (attempt ${retryCount}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2; // Exponential backoff
        } else {
          throw error;
        }
      }
    }
    
    throw new Error('Max retries reached');
  };
  
  // Get user ID from localStorage
  useEffect(() => {
    // Try multiple possible keys for user ID
    const possibleKeys = ['userId', 'user_id', 'id', 'user', 'userData', 'authUser'];
    let foundUserId = null;
    
    for (const key of possibleKeys) {
      const value = localStorage.getItem(key);
      if (value) {
        try {
          // Try to parse if it's a JSON string
          const parsedValue = JSON.parse(value);
          // Check if the parsed value has an id property
          if (parsedValue && parsedValue.id) {
            foundUserId = parsedValue.id;
            break;
          }
          // If not JSON, check if the value itself is the ID
          else if (value && !isNaN(value)) {
            foundUserId = value;
            break;
          }
        } catch (e) {
          // If parsing fails, check if the value itself is the ID
          if (value && !isNaN(value)) {
            foundUserId = value;
            break;
          }
        }
      }
    }
    
    if (foundUserId) {
      setUserId(foundUserId);
    } else {
      // If no user ID found, log available localStorage keys for debugging
      console.log('Available localStorage keys:', Object.keys(localStorage));
      setError('User ID not found in localStorage. Please check your login status.');
      setLoading(false);
    }
  }, []);
  
  // Fetch requisitions data from API
  useEffect(() => {
    const fetchRequisitionsData = async () => {
      if (!userId) return; // Don't fetch if userId is not available
      
      setLoading(true);
      setError(null);
      
      try {
        // First, try to get all requisitions for the user using the retry function
        const response = await fetchWithRetry(() => 
          axiosInstance.get(`${baseUrl}/requisitions/user/${userId}`)
        );
        
        if (response.data.success) {
          // Check if response.data.data is an array or a single object
          let requisitionsData = response.data.data;
          
          // If it's a single object, convert it to an array
          if (!Array.isArray(requisitionsData)) {
            requisitionsData = [requisitionsData];
          }
          
          // Transform API data to match our component structure
          const transformedData = requisitionsData.map(requisition => ({
            id: requisition.id,
            item: requisition.items.map(item => item.item_name).join(', '),
            dateRaised: new Date(requisition.created_at).toLocaleDateString('en-GB', { 
              day: 'numeric', 
              month: 'short', 
              year: 'numeric' 
            }),
            quantity: requisition.items.reduce((sum, item) => sum + item.quantity, 0),
            status: requisition.status.charAt(0).toUpperCase() + requisition.status.slice(1),
            lastUpdated: new Date(requisition.updated_at).toLocaleDateString('en-GB', { 
              day: 'numeric', 
              month: 'short' 
            }),
            // Store the original requisition data for the timeline modal
            originalData: requisition
          }));
          
          setRequests(transformedData);
        } else {
          throw new Error('API returned unsuccessful response');
        }
      } catch (err) {
        // If the first approach fails, try the alternative endpoint
        try {
          const response = await fetchWithRetry(() => 
            axiosInstance.get(`${baseUrl}/requisitions/user/${userId}`)
          );
          
          if (response.data.success) {
            // Check if response.data.data is an array or a single object
            let requisitionsData = response.data.data;
            
            // If it's a single object, convert it to an array
            if (!Array.isArray(requisitionsData)) {
              requisitionsData = [requisitionsData];
            }
            
            // Transform API data to match our component structure
            const transformedData = requisitionsData.map(requisition => ({
              id: requisition.id,
              item: requisition.items.map(item => item.item_name).join(', '),
              dateRaised: new Date(requisition.created_at).toLocaleDateString('en-GB', { 
                day: 'numeric', 
                month: 'short', 
                year: 'numeric' 
              }),
              quantity: requisition.items.reduce((sum, item) => sum + item.quantity, 0),
              status: requisition.status.charAt(0).toUpperCase() + requisition.status.slice(1),
              lastUpdated: new Date(requisition.updated_at).toLocaleDateString('en-GB', { 
                day: 'numeric', 
                month: 'short' 
              }),
              // Store the original requisition data for the timeline modal
              originalData: requisition
            }));
            
            setRequests(transformedData);
          } else {
            throw new Error('API returned unsuccessful response');
          }
        } catch (secondErr) {
          // If both approaches fail, try the third approach - get by ID
          try {
            const response = await fetchWithRetry(() => 
              axios.get(`${baseUrl}/requisitions/${userId}`)
            );
            
            if (response.data.success) {
              // Transform the single requisition to an array
              const transformedData = [{
                id: response.data.data.id,
                item: response.data.data.items.map(item => item.item_name).join(', '),
                dateRaised: new Date(response.data.data.created_at).toLocaleDateString('en-GB', { 
                  day: 'numeric', 
                  month: 'short', 
                  year: 'numeric' 
                }),
                quantity: response.data.data.items.reduce((sum, item) => sum + item.quantity, 0),
                status: response.data.data.status.charAt(0).toUpperCase() + response.data.data.status.slice(1),
                lastUpdated: new Date(response.data.data.updated_at).toLocaleDateString('en-GB', { 
                  day: 'numeric', 
                  month: 'short' 
                }),
                // Store the original requisition data for the timeline modal
                originalData: response.data.data
              }];
              
              setRequests(transformedData);
            } else {
              throw new Error('API returned unsuccessful response');
            }
          } catch (thirdErr) {
            // Show user-friendly error message for 429 errors
            if (thirdErr.response && thirdErr.response.status === 429) {
              setError('Too many requests. Please wait a moment and try again.');
            } else {
              setError(thirdErr.message || 'Failed to fetch requisitions data');
            }
            console.error('Error fetching requisitions data:', thirdErr);
          }
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchRequisitionsData();
  }, [userId, baseUrl]);
  
  // Filter requests based on search term
  const filteredRequests = requests.filter(request => {
    return (
      request.id.toString().includes(searchTerm.toLowerCase()) ||
      request.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });
  
  // Function to open status timeline modal
  const openStatusTimeline = (request) => {
    setSelectedRequest(request);
    setShowStatusTimelineModal(true);
  };
  
  // Function to get status badge class
  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'Pending':
        return 'bg-warning text-dark';
      case 'Dispatched':
        return 'bg-info';
      case 'Completed':
        return 'bg-success';
      case 'Rejected':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };
  
  // Function to get status icon
  const getStatusIcon = (status) => {
    switch(status) {
      case 'Pending':
        return <FaClock className="me-1" />;
      case 'Dispatched':
        return <FaPaperPlane className="me-1" />;
      case 'Completed':
        return <FaCheck className="me-1" />;
      case 'Rejected':
        return <FaTimes className="me-1" />;
      default:
        return <FaExclamationTriangle className="me-1" />;
    }
  };

  // Function to get step status (for timeline)
  const getStepStatus = (currentStatus, stepStatus) => {
    const statusOrder = ['Pending', 'Dispatched', 'Completed'];
    const currentIdx = statusOrder.indexOf(currentStatus);
    const stepIdx = statusOrder.indexOf(stepStatus);
    
    if (stepIdx < currentIdx) return 'completed';
    if (stepIdx === currentIdx) return 'current';
    return 'upcoming';
  };
  
  return (
    <div className="container-fluid py-4 px-3 px-md-4">
      {/* Header Section - Fixed background color */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 bg-white p-3 rounded">
        <div className="mb-3 mb-md-0">
          <h1 className="h3 mb-1">My Requests</h1>
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
      
      {/* Error Message */}
      {error && (
        <div className="alert alert-danger d-flex align-items-center" role="alert">
          <FaExclamationTriangle className="me-2" />
          <div>{error}</div>
        </div>
      )}

      {/* Debug Info - Only show in development
      {process.env.NODE_ENV === 'development' && (
        <div className="alert alert-info">
          <strong>Debug Info:</strong> User ID: {userId || 'Not found'} | 
          Available localStorage keys: {Object.keys(localStorage).join(', ')}
        </div>
      )} */}
      
      {/* Main Card */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-0 p-3 p-md-4">
          <div className="flex-column flex-md-row d-flex justify-content-between align-items-md-center gap-3">
            
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
        </div>
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2 text-muted">Loading requisitions data...</p>
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
                  {filteredRequests.length > 0 ? (
                    filteredRequests.map(request => (
                      <tr key={request.id}>
                        <td>{request.id}</td>
                        <td>{request.item}</td>
                        <td>{request.dateRaised}</td>
                        <td>{request.quantity}</td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(request.status)}`}>
                            {getStatusIcon(request.status)} {request.status}
                          </span>
                        </td>
                        <td>{request.lastUpdated}</td>
                        <td>
                          <button className="btn btn-sm btn-outline-primary" onClick={() => openStatusTimeline(request)}>
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
                          <p>No requisitions found matching your search criteria.</p>
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
      
      {/* Status Timeline Modal */}
      <div className={`modal fade ${showStatusTimelineModal ? 'show' : ''}`} style={{ display: showStatusTimelineModal ? 'block' : 'none' }} tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Request Status Timeline</h5>
              <button type="button" className="btn-close" onClick={() => setShowStatusTimelineModal(false)}></button>
            </div>
            <div className="modal-body">
              {selectedRequest && (
                <div className="timeline-container">
                  <div className="d-flex flex-column flex-md-row justify-content-between position-relative">
                    <div className="timeline-line position-absolute top-0 bottom-0 start-50 translate-middle-x"></div>
                    
                    {['Pending', 'Dispatched', 'Completed'].map((status, index) => {
                      const stepStatus = getStepStatus(selectedRequest.status, status);
                      return (
                        <div key={status} className="text-center mb-4 flex-grow-1">
                          <div className={`timeline-step rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2 ${
                            stepStatus === 'completed' ? 'bg-success' : 
                            stepStatus === 'current' ? 'bg-primary' : 
                            'bg-light border'
                          }`} style={{ width: '40px', height: '40px' }}>
                            {stepStatus === 'completed' ? (
                              <FaCheck className="text-white" />
                            ) : stepStatus === 'current' ? (
                              <span className="text-white fw-bold">{index + 1}</span>
                            ) : (
                              <span className="text-muted">{index + 1}</span>
                            )}
                          </div>
                          <div className={`fw-bold ${
                            stepStatus === 'completed' || stepStatus === 'current' ? 'text-primary' : 'text-muted'
                          }`}>
                            {status}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Request details */}
                  <div className="mt-4 p-3 bg-light rounded">
                    <h6 className="mb-2">{selectedRequest.item}</h6>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Raised: {selectedRequest.dateRaised}</span>
                      <span className={`badge ${getStatusBadgeClass(selectedRequest.status)}`}>
                        {getStatusIcon(selectedRequest.status)} {selectedRequest.status}
                      </span>
                    </div>
                    <p className="text-muted small mt-2">Quantity: {selectedRequest.quantity}</p>
                    
                    {/* Show items details if available */}
                    {selectedRequest.originalData && selectedRequest.originalData.items && (
                      <div className="mt-3">
                        <h6 className="text-muted small">Items Details:</h6>
                        <ul className="list-unstyled">
                          {selectedRequest.originalData.items.map((item, idx) => (
                            <li key={idx} className="mb-2">
                              <div className="d-flex justify-content-between">
                                <span>{item.item_name}</span>
                                <span className="text-muted">{item.quantity} {item.unit}</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary w-100 w-md-auto" onClick={() => setShowStatusTimelineModal(false)}>Close</button>
            </div>
          </div>
        </div>
      </div>
      
      {showStatusTimelineModal && <div className="modal-backdrop fade show"></div>}
    </div>
  );
};

export default FacilityUserMyRequests;