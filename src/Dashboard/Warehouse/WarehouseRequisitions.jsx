import React, { useState, useEffect, useMemo } from "react";
import { FaSearch, FaCheckSquare, FaSquare } from "react-icons/fa";
import axios from "axios";
import BaseUrl from "../../Api/BaseUrl";

const WarehouseRequisitions = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showPartialApproveModal, setShowPartialApproveModal] = useState(false);
  const [showBulkApproveModal, setShowBulkApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showItemsModal, setShowItemsModal] = useState(false); // New state for items modal
  const [currentRequisition, setCurrentRequisition] = useState(null);
  const [rejectingRequisition, setRejectingRequisition] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [remarks, setRemarks] = useState("");
  const [bulkRemarks, setBulkRemarks] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRequisitions, setSelectedRequisitions] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [partialApproveQuantities, setPartialApproveQuantities] = useState({});

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  const [requisitions, setRequisitions] = useState([]);

  useEffect(() => {
    const fetchRaiseRequests = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${BaseUrl}/facility-requisitions`);
        if (response.data?.success && Array.isArray(response.data.data)) {
          setRequisitions(response.data.data);
          setPagination({
            currentPage: 1,
            totalPages: Math.ceil(response.data.data.length / 10),
            totalItems: response.data.data.length,
            itemsPerPage: 10,
          });
        } else {
          setError("Invalid API response format");
          setRequisitions([]);
        }
      } catch (err) {
        setError("Failed to fetch raise requests. Please try again later.");
        console.error("Error fetching raise requests:", err);
        setRequisitions([]);
      } finally {
        setLoading(false);
      }
    };
  
    fetchRaiseRequests();
  }, []);

  const filteredRequisitions = useMemo(() => {
    // Ensure requisitions is an array before filtering
    if (!Array.isArray(requisitions)) return [];
    return requisitions.filter(
      (req) =>
        req.id?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.facility_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.user_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [requisitions, searchTerm]);

  const getCurrentItems = () => {
    const indexOfLastItem = pagination.currentPage * pagination.itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - pagination.itemsPerPage;
    return filteredRequisitions.slice(indexOfFirstItem, indexOfLastItem);
  };

  useEffect(() => {
    // Ensure filteredRequisitions is an array before filtering
    if (!Array.isArray(filteredRequisitions)) return;
    
    const pendingReqs = filteredRequisitions.filter(
      (req) => req.status?.toLowerCase() === "pending"
    );
    const allSelected =
      pendingReqs.length > 0 &&
      pendingReqs.every((req) => selectedRequisitions.includes(req.id));
    setSelectAll(allSelected);
  }, [selectedRequisitions, filteredRequisitions]);

  const StatusBadge = ({ status }) => {
    const statusColors = {
      pending: "bg-warning",
      approved: "bg-success text-white",
      rejected: "bg-danger text-white",
      dispatched: "bg-info text-white",
      processing: "bg-primary text-white",
      "partially approved": "bg-primary text-white",
    };
    return (
      <span
        className={`badge ${
          statusColors[status?.toLowerCase()] || "bg-secondary text-white"
        }`}
      >
        {status || "Unknown"}
      </span>
    );
  };

  const PriorityBadge = ({ priority }) => {
    const priorityColors = {
      normal: "bg-secondary",
      high: "bg-warning",
      urgent: "bg-danger",
    };
    return (
      <span
        className={`badge ${
          priorityColors[priority?.toLowerCase()] || "bg-secondary"
        } text-white`}
      >
        {priority || "Normal"}
      </span>
    );
  };

  // MODAL HANDLERS — now work on full requisition
  const openApproveModal = (req) => {
    setCurrentRequisition(req);
    setRemarks("");
    setShowApproveModal(true);
  };

  const openRejectModal = (req) => {
    setRejectingRequisition(req);
    setRejectionReason("");
    setShowRejectModal(true);
  };
  const openPartialApproveModal = (req) => {
    const initial = {};
    req.items.forEach((item) => {
      // Suggest min(requested, available)
      initial[item.id] = Math.min(item.quantity, item.available_quantity);
    });
    setPartialApproveQuantities(initial);
    setCurrentRequisition(req);
    setShowPartialApproveModal(true);
  };
  const openItemsModal = (req) => {
    setCurrentRequisition(req);
    setShowItemsModal(true);
  };

  const openBulkApproveModal = () => {
    if (selectedRequisitions.length === 0) {
      setError("Please select at least one requisition to approve");
      return;
    }
    setBulkRemarks("");
    setShowBulkApproveModal(true);
  };


  const handleApproveSubmit = async () => {
    if (!currentRequisition) return;
  
    const approvedItems = currentRequisition.items.map(item => ({
      item_id: item.item_id, // ✅ integer
      approved_qty: item.available_quantity || item.quantity // ध्यान: यहाँ key "approved_qty" है, लेकिन handleApprove में rename हो जाएगा
    }));
  
    await handleApprove(approvedItems, remarks);
  };

  


  const handleReject = async (rejectionReason) => {
    if (!rejectingRequisition || !rejectionReason?.trim()) return;
  
    const payload = {
      facility_id: rejectingRequisition.facility_id,
      requisition_id: rejectingRequisition.id, // ✅ .id का उपयोग
      remarks: rejectionReason.trim(),
      userId: JSON.parse(localStorage.getItem("user"))?.id || 3,
    };
  
    try {
      setLoading(true);
      await axios.patch(`${BaseUrl}/warehouse-requisitions/warehouse/reject`, payload);
  
      setRequisitions(prev =>
        prev.map(req =>
          req.id === rejectingRequisition.id // ✅ .id से compare
            ? { ...req, status: "rejected" }
            : req
        )
      );
  
      setShowRejectModal(false);
    } catch (err) {
      setError("Rejection failed: " + (err.response?.data?.message || err.message));
      console.error("Reject error:", err);
    } finally {
      setLoading(false);
    }
  };

const handleBulkApprove = async () => {
  if (selectedRequisitions.length === 0) {
    setError("No requisitions selected for approval");
    return;
  }

  // सिर्फ pending requisitions चुनें
  const pendingReqs = requisitions.filter(
    req => 
      selectedRequisitions.includes(req.id) && 
      req.status?.toLowerCase() === "pending"
  );

  if (pendingReqs.length === 0) {
    setError("No pending requisitions selected for approval");
    return;
  }

  // approvedList बनाएं
  const approvedList = pendingReqs.map(req => ({
    facility_id: req.facility_id,
    requisition_id: req.requisition_id,
    facilityRemarks: bulkRemarks || "Approved via bulk action",
    approvedItems: req.items.map(item => ({
      item_id: String(item.item_id),
      approved_qty: item.available_quantity || item.quantity
    }))
  }));

  const payload = {
    remarks: bulkRemarks || "Warehouse approved multiple requisitions in bulk",
    approvedList
  };

  try {
    setLoading(true);
    await axios.patch(`${BaseUrl}/warehouse-requisitions/warehouse/bulk-approve`, payload);

    // UI अपडेट करें
    setRequisitions(prev =>
      prev.map(req =>
        pendingReqs.some(p => p.id === req.id) // ✅ id से compare करें
          ? { ...req, status: "approved" }
          : req
      )
    );

    setSelectedRequisitions([]);
    setSelectAll(false);
    setShowBulkApproveModal(false);
  } catch (err) {
    setError("Bulk approval failed: " + (err.response?.data?.message || err.message));
    console.error("Error in bulk approval:", err);
  } finally {
    setLoading(false);
  }
};

  const handleSelectRequisition = (reqId) => {
    if (selectedRequisitions.includes(reqId)) {
      setSelectedRequisitions(
        selectedRequisitions.filter((id) => id !== reqId)
      );
    } else {
      setSelectedRequisitions([...selectedRequisitions, reqId]);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRequisitions([]);
    } else {
      const pendingReqs = filteredRequisitions
        .filter((req) => req.status?.toLowerCase() === "pending")
        .map((req) => req.id);
      setSelectedRequisitions(pendingReqs);
    }
    setSelectAll(!selectAll);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setPagination({
        ...pagination,
        currentPage: page,
      });
    }
  };

  const currentItems = getCurrentItems();

  return (
    <div className="container-fluid">
      {/* Error Alert */}
      {error && (
        <div
          className="alert alert-danger alert-dismissible fade show"
          role="alert"
        >
          {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => setError(null)}
          ></button>
        </div>
      )}

      {/* Loading Spinner */}
      {loading && (
        <div className="d-flex justify-content-center my-3">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold">Requisitions (From Facilities)</h3>
        <div className="d-flex gap-2">
          <div className="input-group" style={{ maxWidth: "300px" }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search requisitions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="btn btn-outline-secondary">
              <FaSearch />
            </button>
          </div>
          {selectedRequisitions.length > 0 && (
            <button
              className="btn btn-success d-flex align-items-center gap-2 text-nowrap"
              onClick={openBulkApproveModal}
              disabled={loading}
            >
              <FaCheckSquare /> Approve Selected ({selectedRequisitions.length})
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row row-cols-1 row-cols-md-4 mb-4 g-3">
        {["Pending", "Approved", "Rejected", "Dispatched"].map((status) => (
          <div className="col" key={status}>
            <div className="card border-0 shadow-sm h-100">
              <div
                className={`card-body bg-${
                  status === "Pending"
                    ? "warning"
                    : status === "Approved"
                    ? "success"
                    : status === "Rejected"
                    ? "danger"
                    : "info"
                } bg-opacity-10 p-4`}
              >
                <div className="d-flex align-items-center">
                  <div
                    className={`bg-${
                      status === "Pending"
                        ? "warning"
                        : status === "Approved"
                        ? "success"
                        : status === "Rejected"
                        ? "danger"
                        : "info"
                    } bg-opacity-25 rounded-circle p-3 me-3`}
                  >
                    <FaSearch
                      size={24}
                      className={`text-${
                        status === "Pending"
                          ? "warning"
                          : status === "Approved"
                          ? "success"
                          : status === "Rejected"
                          ? "danger"
                          : "info"
                      }`}
                    />
                  </div>
                  <div>
                    <h5
                      className={`card-title text-${
                        status === "Pending"
                          ? "warning"
                          : status === "Approved"
                          ? "success"
                          : status === "Rejected"
                          ? "danger"
                          : "info"
                      } fw-bold mb-0`}
                    >
                      {
                        requisitions.filter(
                          (r) =>
                            r.status?.toLowerCase() === status.toLowerCase()
                        ).length
                      }
                    </h5>
                    <p className="card-text text-muted">
                      {status} Requisitions
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table — NOW GROUPED BY REQUISITION */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="bg-light">
                <tr>
                  <th style={{ width: "40px" }}>
                    <button
                      className="btn btn-sm p-0"
                      onClick={handleSelectAll}
                      disabled={loading}
                    >
                      {selectAll ? (
                        <FaCheckSquare size={18} />
                      ) : (
                        <FaSquare size={18} />
                      )}
                    </button>
                  </th>
                  <th>Req ID</th>
                  <th>Facility</th>
               
                  <th>Items</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((req,index) => (
                    <tr key={req.id}>
                      <td>
                        {req.status?.toLowerCase() === "pending" && (
                          <button
                            className="btn btn-sm p-0"
                            onClick={() => handleSelectRequisition(req.id)}
                            disabled={loading}
                          >
                            {selectedRequisitions.includes(req.id) ? (
                              <FaCheckSquare size={18} />
                            ) : (
                              <FaSquare size={18} />
                            )}
                          </button>
                        )}
                      </td>
                      <td>{req.requisition_id}</td>
                      <td>{req.facility_name || "N/A"}</td>
                  
                      <td>
                        <div className="d-flex align-items-center">
                          <span className="badge bg-secondary me-2">
                            {req.items?.length || 0}
                          </span>
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => openItemsModal(req)} // Added click handler
                          >
                            View Items
                          </button>
                        </div>
                      </td>
                      <td>
                        <PriorityBadge priority={req.priority} />
                      </td>
                      <td>
                        <StatusBadge status={req.status} />
                      </td>
                      <td>
  <div className="d-flex gap-1 flex-wrap">
    {req.status?.toLowerCase() === "pending" && (
      <>
        <button
          className="btn btn-sm btn-success"
          onClick={() => openApproveModal(req)}
          disabled={loading}
        >
          Approve All
        </button>
        <button
          className="btn btn-sm btn-warning"
          onClick={() => openPartialApproveModal(req)}
          disabled={loading}
        >
          Partial
        </button>
        <button
  className="btn btn-danger"
  onClick={() => openRejectModal(req)}
  disabled={loading}
>
  {loading ? "Processing..." : "Reject"}
</button>
      </>
    )}
  </div>
</td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-4 text-muted">
                      {loading ? "Loading..." : "No requisitions found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="d-flex justify-content-between align-items-center mt-3">
        <div>
          Showing {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}{" "}
          to{" "}
          {Math.min(
            pagination.currentPage * pagination.itemsPerPage,
            pagination.totalItems
          )}{" "}
          of {pagination.totalItems} entries
        </div>
        <div className="btn-group" role="group">
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1 || loading}
          >
            Previous
          </button>
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={
              pagination.currentPage === pagination.totalPages || loading
            }
          >
            Next
          </button>
        </div>
      </div>

      {/* View Items Modal */}
      {showItemsModal && currentRequisition && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          onClick={(e) => {
            if (e.target.classList.contains("modal"))
              setShowItemsModal(false);
          }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Requisition Items</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowItemsModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  <strong>Requisition ID:</strong> #{currentRequisition.id}
                </p>
                <p>
                  <strong>Facility:</strong> {currentRequisition.facility_name}
                </p>
                <p>
                  <strong>User:</strong> {currentRequisition.user_name} ({currentRequisition.user_email})
                </p>
                <p>
                  <strong>Status:</strong> <StatusBadge status={currentRequisition.status} />
                </p>
                <p>
                  <strong>Priority:</strong> <PriorityBadge priority={currentRequisition.priority} />
                </p>
                {currentRequisition.remarks && (
                  <p>
                    <strong>Remarks:</strong> {currentRequisition.remarks}
                  </p>
                )}
                <p>
                  <strong>Items:</strong>
                </p>
                <div className="table-responsive">
                  <table className="table table-sm table-bordered">
                    <thead className="table-light">
                      <tr>
                        <th>Item Name</th>
                        <th>Code</th>
                        <th>Requested Qty</th>
                        <th>Approved Qty</th>
                        <th>Delivered Qty</th>
                        <th>Available</th>
                        <th>Unit</th>
                        <th>Priority</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentRequisition.items && currentRequisition.items.length > 0 ? (
                        currentRequisition.items.map((item) => (
                          <tr key={item.id}>
                            <td>{item.item_name}</td>
                            <td>{item.item_code}</td>
                            <td>{item.quantity}</td>
                            <td>{item.approved_quantity || 0}</td>
                            <td>{item.delivered_quantity || 0}</td>
                            <td>{item.available_quantity}</td>
                            <td>{item.unit}</td>
                            <td>
                              <PriorityBadge priority={item.priority} />
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" className="text-center">No items available</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowItemsModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approve Modal (Full Requisition) */}
      {showApproveModal && currentRequisition && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          onClick={(e) => {
            if (e.target.classList.contains("modal"))
              setShowApproveModal(false);
          }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Approve Requisition</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowApproveModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  <strong>Requisition ID:</strong> #{currentRequisition.id}
                </p>
                <p>
                  <strong>Facility:</strong> {currentRequisition.facility_name}
                </p>
               
                <p>
                  <strong>Items:</strong>
                </p>
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Item Name</th>
                        <th>Code</th>
                        <th>Requested Qty</th>
                        <th>Available</th>
                        <th>Unit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentRequisition.items && currentRequisition.items.length > 0 ? (
                        currentRequisition.items.map((item) => (
                          <tr key={item.id}>
                            <td>{item.item_name}</td>
                            <td>{item.item_code}</td>
                            <td>{item.quantity}</td>
                            <td>{item.available_quantity}</td>
                            <td>{item.unit}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="text-center">No items available</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="mb-3">
                  <label className="form-label">Remarks (Optional)</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Add remarks..."
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowApproveModal(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-success"
                  onClick={handleApproveSubmit}
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Approve All"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Partial Approve Modal */}
      {showPartialApproveModal && currentRequisition && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          onClick={(e) => {
            if (e.target.classList.contains("modal"))
              setShowPartialApproveModal(false);
          }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  Partially Approve Requisition
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowPartialApproveModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  <strong>Requisition ID:</strong> #{currentRequisition.id}
                </p>
                <p>
                  <strong>Facility:</strong> {currentRequisition.facility_name}
                </p>
                <p>
                  <strong>Set approved quantities:</strong>
                </p>
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Item Name</th>
                        <th>Code</th>
                        <th>Requested Qty</th>
                        <th>Available</th>
                        <th>Approve Qty</th>
                        <th>Unit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentRequisition.items && currentRequisition.items.length > 0 ? (
                        currentRequisition.items.map((item,index) => (
                          <tr key={index}>

                            <td>{item.item_name}</td>
                            <td>{item.item_code}</td>
                            <td>{item.quantity}</td>
                            <td>{item.available_quantity}</td>
                            <td>
                              <input
                                type="number"
                                className="form-control form-control-sm"
                                min="0"
                                max={item.available_quantity}
                                value={partialApproveQuantities[item.id] || 0}
                                onChange={(e) =>
                                  setPartialApproveQuantities({
                                    ...partialApproveQuantities,
                                    [item.id]: parseInt(e.target.value) || 0,
                                  })
                                }
                              />
                            </td>
                            <td>{item.unit}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center">No items available</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="mb-3">
                  <label className="form-label">Remarks (Optional)</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Add remarks..."
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowPartialApproveModal(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-warning"
                  onClick={handlePartialApproveSubmit}
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Partially Approve"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Approve Modal */}
      {showBulkApproveModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          onClick={(e) => {
            if (e.target.classList.contains("modal"))
              setShowBulkApproveModal(false);
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  Bulk Approve Requisitions
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowBulkApproveModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  <strong>Selected Requisitions:</strong>{" "}
                  {selectedRequisitions.length}
                </p>
                <div className="mb-3">
                  <label className="form-label">Remarks</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={bulkRemarks}
                    onChange={(e) => setBulkRemarks(e.target.value)}
                    placeholder="Remarks for bulk approval"
                  ></textarea>
                </div>
                <div className="alert alert-info">
                  This will approve all the selected requisitions.
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowBulkApproveModal(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-success"
                  onClick={handleBulkApprove}
                  disabled={loading}
                >
                  {loading
                    ? "Processing..."
                    : `Approve ${selectedRequisitions.length} Requisitions`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && rejectingRequisition && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          onClick={(e) => {
            if (e.target.classList.contains("modal")) setShowRejectModal(false);
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Reject Requisition</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowRejectModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  <strong>Requisition ID:</strong> #{rejectingRequisition.id}
                </p>
                <p>
                  <strong>Facility:</strong>{" "}
                  {rejectingRequisition.facility_name}
                </p>
                <div className="mb-3">
                  <label className="form-label">
                    Reason for rejection <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className="form-control"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows="3"
                    placeholder="Please provide a valid reason"
                    required
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowRejectModal(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
  className="btn btn-danger"
  onClick={() => handleReject(rejectionReason)} // ✅ अब सही रीजन पास होगा
  disabled={loading}
>
  {loading ? "Processing..." : "Reject"}
</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Backdrop */}
      {(showApproveModal ||
        showPartialApproveModal ||
        showRejectModal ||
        showBulkApproveModal ||
        showItemsModal) && (
        <div className="modal-backdrop fade show"></div>
      )}
    </div>
  );
};

export default WarehouseRequisitions;