import React, { useState } from 'react';
import { 
  FaClipboardList, FaEye, FaSearch, FaFilter, FaPaperPlane, 
  FaCheck, FaTimes, FaExclamationTriangle, FaClock, FaCalendarAlt
} from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';

const FacilityUserMyRequests = () => {
  // State for modals
  const [showRequestDetailsModal, setShowRequestDetailsModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  
  // Sample data for requests
  const requests = [
    { 
      id: 1, 
      title: 'Medical Supplies Request', 
      description: 'Request for additional medical gloves and face masks', 
      submittedDate: '2023-07-10', 
      status: 'Approved',
      approvedDate: '2023-07-12',
      items: [
        { name: 'Medical Gloves', quantity: 50, unit: 'boxes' },
        { name: 'Face Masks', quantity: 200, unit: 'pieces' }
      ],
      comments: 'Request approved. Items will be available for pickup from the pharmacy.'
    },
    { 
      id: 2, 
      title: 'Surgical Equipment', 
      description: 'Request for new surgical instruments for operating theater', 
      submittedDate: '2023-07-12', 
      status: 'Partially Approved',
      approvedDate: '2023-07-15',
      items: [
        { name: 'Scalpel Set', quantity: 5, unit: 'sets', approved: true },
        { name: 'Forceps', quantity: 10, unit: 'pieces', approved: false }
      ],
      comments: 'Scalpel sets approved. Forceps are out of stock and will be ordered.'
    },
    { 
      id: 3, 
      title: 'Pharmaceutical Items', 
      description: 'Request for various medicines for the ward', 
      submittedDate: '2023-07-14', 
      status: 'Rejected',
      rejectedDate: '2023-07-15',
      items: [
        { name: 'Antibiotics', quantity: 30, unit: 'bottles' },
        { name: 'Painkillers', quantity: 50, unit: 'strips' }
      ],
      comments: 'Request rejected due to budget constraints. Please resubmit next quarter.'
    },
    { 
      id: 4, 
      title: 'PPE Equipment', 
      description: 'Request for personal protective equipment', 
      submittedDate: '2023-07-15', 
      status: 'Pending',
      items: [
        { name: 'Gowns', quantity: 100, unit: 'pieces' },
        { name: 'Face Shields', quantity: 50, unit: 'pieces' }
      ],
      comments: ''
    }
  ];
  
  // Function to open request details modal
  const openRequestDetails = (request) => {
    setSelectedRequest(request);
    setShowRequestDetailsModal(true);
  };
  
  // Function to get status icon
  const getStatusIcon = (status) => {
    switch(status) {
      case 'Approved':
        return <FaCheck className="text-success" />;
      case 'Partially Approved':
        return <FaExclamationTriangle className="text-warning" />;
      case 'Rejected':
        return <FaTimes className="text-danger" />;
      default:
        return <FaClock className="text-secondary" />;
    }
  };
  
  // Function to get status badge class
  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'Approved':
        return 'bg-success';
      case 'Partially Approved':
        return 'bg-warning text-dark';
      case 'Rejected':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };

  return (
    <div className="container-fluid py-4 px-3 px-md-4">
      {/* Header Section - Responsive */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
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
      
      {/* Main Card - Responsive */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-0 p-3 p-md-4">
          <div className="flex-column flex-md-row d-flex justify-content-between align-items-md-center gap-3">
            <h5 className="mb-0">Request Status Timeline</h5>
            <div className="d-flex flex-column flex-md-row gap-2 w-100 w-md-auto">
              <div className="input-group input-group-sm">
                <span className="input-group-text"><FaSearch /></span>
                <input type="text" className="form-control" placeholder="Search requests..." />
              </div>
              <button className="btn btn-sm btn-outline-secondary flex-shrink-0">
                <FaFilter />
              </button>
            </div>
          </div>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th className="d-none d-md-table-cell">Description</th>
                  <th>Submitted Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(request => (
                  <tr key={request.id}>
                    <td>{request.id}</td>
                    <td>{request.title}</td>
                    <td className="d-none d-md-table-cell">{request.description}</td>
                    <td>{request.submittedDate}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(request.status)}`}>
                        {getStatusIcon(request.status)} {request.status}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-outline-primary" onClick={() => openRequestDetails(request)}>
                        <FaEye /> <span className="d-none d-md-inline-block ms-1">View Details</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Request Details Modal - Responsive */}
      <div className={`modal fade ${showRequestDetailsModal ? 'show' : ''}`} style={{ display: showRequestDetailsModal ? 'block' : 'none' }} tabIndex="-1">
        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Request Details</h5>
              <button type="button" className="btn-close" onClick={() => setShowRequestDetailsModal(false)}></button>
            </div>
            <div className="modal-body">
              {selectedRequest && (
                <>
                  <div className="row mb-4">
                    <div className="col-12 col-md-6">
                      <h4 className="mb-2">{selectedRequest.title}</h4>
                      <p className="text-muted">{selectedRequest.description}</p>
                    </div>
                    <div className="col-12 col-md-6 text-md-end">
                      <span className={`badge ${getStatusBadgeClass(selectedRequest.status)} fs-6`}>
                        {getStatusIcon(selectedRequest.status)} {selectedRequest.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="row mb-4">
                    <div className="col-12 col-md-6 mb-4 mb-md-0">
                      <h5>Requested Items</h5>
                      <div className="table-responsive">
                        <table className="table table-sm">
                          <thead>
                            <tr>
                              <th>Item</th>
                              <th>Quantity</th>
                              <th>Unit</th>
                              {selectedRequest.status !== 'Pending' && <th>Status</th>}
                            </tr>
                          </thead>
                          <tbody>
                            {selectedRequest.items.map((item, index) => (
                              <tr key={index}>
                                <td>{item.name}</td>
                                <td>{item.quantity}</td>
                                <td>{item.unit}</td>
                                {selectedRequest.status !== 'Pending' && (
                                  <td>
                                    {item.approved === undefined ? (
                                      <span className="badge bg-secondary">N/A</span>
                                    ) : item.approved ? (
                                      <span className="badge bg-success">Approved</span>
                                    ) : (
                                      <span className="badge bg-danger">Rejected</span>
                                    )}
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div className="col-12 col-md-6">
                      <h5>Status Timeline</h5>
                      <div className="timeline">
                        {/* Submitted Step */}
                        <div className="d-flex align-items-start mb-4">
                          <div className="bg-primary rounded-circle p-2 me-3 flex-shrink-0">
                            <FaPaperPlane className="text-white" />
                          </div>
                          <div>
                            <h6>Submitted</h6>
                            <div className="d-flex align-items-center text-muted">
                              <FaCalendarAlt className="me-2 flex-shrink-0" />
                              <span>{selectedRequest.submittedDate}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Status Step */}
                        <div className="d-flex align-items-start">
                          <div className={`rounded-circle p-2 me-3 flex-shrink-0 ${
                            selectedRequest.status === 'Approved' ? 'bg-success' : 
                            selectedRequest.status === 'Partially Approved' ? 'bg-warning' : 
                            selectedRequest.status === 'Rejected' ? 'bg-danger' : 'bg-secondary'
                          }`}>
                            {selectedRequest.status === 'Approved' && <FaCheck className="text-white" />}
                            {selectedRequest.status === 'Partially Approved' && <FaExclamationTriangle className="text-white" />}
                            {selectedRequest.status === 'Rejected' && <FaTimes className="text-white" />}
                            {selectedRequest.status === 'Pending' && <FaClock className="text-white" />}
                          </div>
                          <div>
                            <h6>{selectedRequest.status}</h6>
                            {selectedRequest.status !== 'Pending' && (
                              <div className="d-flex align-items-center text-muted">
                                <FaCalendarAlt className="me-2 flex-shrink-0" />
                                <span>
                                  {selectedRequest.status === 'Approved' && selectedRequest.approvedDate}
                                  {selectedRequest.status === 'Partially Approved' && selectedRequest.approvedDate}
                                  {selectedRequest.status === 'Rejected' && selectedRequest.rejectedDate}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {selectedRequest.comments && (
                    <div className="mb-4">
                      <h5>Comments</h5>
                      <div className="card">
                        <div className="card-body">
                          <p className="mb-0">{selectedRequest.comments}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary w-100 w-md-auto" onClick={() => setShowRequestDetailsModal(false)}>Close</button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal Backdrop */}
      {showRequestDetailsModal && <div className="modal-backdrop fade show"></div>}
    </div>
  );
};

export default FacilityUserMyRequests;