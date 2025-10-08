import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Modal, Form, Row, Col, Button, Alert } from 'react-bootstrap';

const GoodsReceipt = () => {
  // Updated receipts data with requested quantity
  const [receipts, setReceipts] = useState([
    {
      id: 'GRN-2023-001',
      item: 'Paracetamol 500mg',
      requestedQty: 100,
      receivedQty: 100,
      fromDispatch: 'Central Warehouse',
      status: 'Pending'
    },
    {
      id: 'GRN-2023-002',
      item: 'Surgical Gloves (L)',
      requestedQty: 200,
      receivedQty: 200,
      fromDispatch: 'Central Warehouse',
      status: 'Pending'
    },
    {
      id: 'GRN-2023-003',
      item: 'Ibuprofen 400mg',
      requestedQty: 80,
      receivedQty: 80,
      fromDispatch: 'Regional Warehouse',
      status: 'Verified'
    },
    {
      id: 'GRN-2023-004',
      item: 'Face Masks (N95)',
      requestedQty: 100,
      receivedQty: 100,
      fromDispatch: 'Central Warehouse',
      status: 'Pending'
    }
  ]);

  // Filter states
  const [filterStatus, setFilterStatus] = useState('All');
  
  // Bulk selection
  const [selectedReceipts, setSelectedReceipts] = useState([]);
  
  // State management
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [verificationData, setVerificationData] = useState({});

  // ✅ Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 10;

  // Get status class for badge
  const getStatusClass = (status) => {
    switch (status) {
      case 'Verified':
        return 'bg-success';
      case 'Pending':
        return 'bg-warning';
      default:
        return 'bg-secondary';
    }
  };

  // Open receipt detail modal
  const handleViewReceipt = (receipt) => {
    setSelectedReceipt(receipt);
    // Initialize verification data with current received quantity
    setVerificationData({
      [receipt.id]: receipt.receivedQty
    });
    setShowDetailModal(true);
  };

  // Close receipt detail modal
  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedReceipt(null);
    setVerificationData({});
  };

  // Handle individual verify action
  const handleVerifyReceipt = (receiptId, receivedQty) => {
    setReceipts(receipts.map(receipt =>
      receipt.id === receiptId 
        ? { ...receipt, receivedQty: parseInt(receivedQty) || 0, status: 'Verified' } 
        : receipt
    ));
    handleCloseDetailModal();
  };

  // Handle bulk verification
  const handleBulkVerify = () => {
    if (selectedReceipts.length === 0) return;
    
    setReceipts(receipts.map(receipt =>
      selectedReceipts.includes(receipt.id)
        ? { ...receipt, status: 'Verified' }
        : receipt
    ));
    
    setSelectedReceipts([]);
  };

  // Toggle selection for bulk actions
  const toggleSelection = (id) => {
    setSelectedReceipts(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  // Select all visible receipts
  const toggleSelectAll = () => {
    if (selectedReceipts.length === currentEntries.length) {
      setSelectedReceipts([]);
    } else {
      setSelectedReceipts(currentEntries.map(r => r.id));
    }
  };

  // Filter receipts based on selected status
  const filteredReceipts = receipts.filter(receipt => {
    return filterStatus === 'All' || receipt.status === filterStatus;
  });

  // ✅ Pagination logic
  const totalPages = Math.ceil(filteredReceipts.length / entriesPerPage);
  const indexOfLastEntry = currentPage * entriesPerPage;
  const currentEntries = filteredReceipts.slice(indexOfLastEntry - entriesPerPage, indexOfLastEntry);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // Clear selections when changing pages
      setSelectedReceipts([]);
    }
  };

  // Reset to page 1 when filter changes
  const resetFilters = () => {
    setFilterStatus('All');
    setCurrentPage(1);
    setSelectedReceipts([]);
  };

  // Handle received quantity change in modal
  const handleReceivedQtyChange = (id, value) => {
    setVerificationData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  return (
    <div className="">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h3 className="mb-0">Goods Receipt</h3>
          <p className="text-muted mb-0">Acknowledge dispatched items from warehouse</p>
        </div>
        {selectedReceipts.length > 0 && (
          <div className="alert alert-info d-flex align-items-center mb-0">
            <i className="bi bi-info-circle me-2"></i>
            <span>{selectedReceipts.length} items selected</span>
            <Button 
              variant="success" 
              size="sm" 
              className="ms-3"
              onClick={handleBulkVerify}
            >
              Verify Selected
            </Button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Filter by Status</label>
              <select
                className="form-select"
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                  setSelectedReceipts([]); // Clear selections on filter change
                }}
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Verified">Verified</option>
              </select>
            </div>
            <div className="col-md-4 d-flex align-items-end">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={resetFilters}
              >
                <i className="bi bi-funnel me-1"></i> Reset Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th scope="col" style={{ width: '5%' }}>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={currentEntries.length > 0 && selectedReceipts.length === currentEntries.length}
                        onChange={toggleSelectAll}
                        disabled={currentEntries.length === 0}
                      />
                    </div>
                  </th>
                  <th scope="col">GRN ID</th>
                  <th scope="col">Item</th>
                  <th scope="col">Requested Qty</th>
                  <th scope="col">Received Qty</th>
                  <th scope="col">From Dispatch</th>
                  <th scope="col">Status</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentEntries.length > 0 ? (
                  currentEntries.map((receipt) => (
                    <tr key={receipt.id}>
                      <td>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={selectedReceipts.includes(receipt.id)}
                            onChange={() => toggleSelection(receipt.id)}
                            disabled={receipt.status !== 'Pending'}
                          />
                        </div>
                      </td>
                      <td className="fw-medium">{receipt.id}</td>
                      <td>{receipt.item}</td>
                      <td>{receipt.requestedQty}</td>
                      <td>{receipt.receivedQty}</td>
                      <td>{receipt.fromDispatch}</td>
                      <td>
                        <span className={`badge ${getStatusClass(receipt.status)} text-white`}>
                          {receipt.status}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => handleViewReceipt(receipt)}
                          title="View Details"
                        >
                          <i className="bi bi-eye"></i>
                        </button>
                        {receipt.status === 'Pending' && (
                          <button
                            type="button"
                            className="btn btn-sm btn-success"
                            onClick={() => handleVerifyReceipt(receipt.id, receipt.receivedQty)}
                            title="Verify Receipt"
                          >
                            Verify
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-4 text-muted">
                      No records found matching the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* ✅ PAGINATION UI */}
      <div className="d-flex justify-content-end mt-3">
        <nav>
          <ul className="pagination mb-3">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
            </li>

            {[...Array(totalPages)].map((_, i) => {
              const page = i + 1;
              return (
                <li
                  key={page}
                  className={`page-item ${currentPage === page ? 'active' : ''}`}
                >
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                </li>
              );
            })}

            <li className={`page-item ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                Next
              </button>
            </li>
          </ul>
        </nav>
      </div>
      
      {/* Receipt Detail Modal */}
      <Modal show={showDetailModal} onHide={handleCloseDetailModal} size="md" centered>
        <Modal.Header closeButton>
          <Modal.Title>Verify Receipt</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedReceipt && (
            <Form>
              <Row className="mb-3">
                <Col>
                  <Form.Label>GRN ID</Form.Label>
                  <Form.Control 
                    plaintext 
                    readOnly 
                    value={selectedReceipt.id} 
                  />
                </Col>
              </Row>
              <Row className="mb-3">
                <Col>
                  <Form.Label>Item</Form.Label>
                  <Form.Control 
                    plaintext 
                    readOnly 
                    value={selectedReceipt.item} 
                  />
                </Col>
              </Row>
              <Row className="mb-3">
                <Col>
                  <Form.Label>Requested Quantity</Form.Label>
                  <Form.Control 
                    plaintext 
                    readOnly 
                    value={selectedReceipt.requestedQty} 
                  />
                </Col>
              </Row>
              <Row className="mb-3">
                <Col>
                  <Form.Label>Received Quantity</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    value={verificationData[selectedReceipt.id] || selectedReceipt.receivedQty}
                    onChange={(e) => handleReceivedQtyChange(selectedReceipt.id, e.target.value)}
                  />
                </Col>
              </Row>
              <Row className="mb-3">
                <Col>
                  <Form.Label>From Dispatch</Form.Label>
                  <Form.Control 
                    plaintext 
                    readOnly 
                    value={selectedReceipt.fromDispatch} 
                  />
                </Col>
              </Row>
              <Row className="mb-3">
                <Col>
                  <Form.Label>Status</Form.Label>
                  <div>
                    <span className={`badge ${getStatusClass(selectedReceipt.status)} text-white`}>
                      {selectedReceipt.status}
                    </span>
                  </div>
                </Col>
              </Row>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDetailModal}>
            Cancel
          </Button>
          <Button 
            variant="success" 
            onClick={() => handleVerifyReceipt(
              selectedReceipt.id, 
              verificationData[selectedReceipt.id] || selectedReceipt.receivedQty
            )}
          >
            Verify Receipt
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default GoodsReceipt;