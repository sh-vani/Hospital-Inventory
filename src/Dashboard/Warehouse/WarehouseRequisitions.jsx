import React, { useState, useEffect, useMemo } from "react";
import { FaSearch, FaCheckSquare, FaSquare } from "react-icons/fa";

const WarehouseRequisitions = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showPartialApproveModal, setShowPartialApproveModal] = useState(false);
  const [showBulkApproveModal, setShowBulkApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
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

  // Dummy data for requisitions (same as your original)
  const dummyRequisitions = [
    {
      id: "REQ001",
      facility_name: "City General Hospital",
      status: "pending",
      items: [
        {
          item_id: "ITM001",
          item_name: "Surgical Gloves",
          quantity: 100,
          unit: "boxes",
          inStock: true,
        },
        {
          item_id: "ITM002",
          item_name: "Face Masks",
          quantity: 200,
          unit: "boxes",
          inStock: true,
        },
      ],
    },
    {
      id: "REQ002",
      facility_name: "Community Health Center",
      status: "pending",
      items: [
        {
          item_id: "ITM003",
          item_name: "Syringes",
          quantity: 500,
          unit: "pieces",
          inStock: false,
        },
        {
          item_id: "ITM004",
          item_name: "Alcohol Swabs",
          quantity: 1000,
          unit: "pieces",
          inStock: true,
        },
      ],
    },
    {
      id: "REQ003",
      facility_name: "District Medical Facility",
      status: "approved",
      items: [
        {
          item_id: "ITM005",
          item_name: "Bandages",
          quantity: 150,
          unit: "boxes",
          inStock: true,
        },
      ],
    },
    {
      id: "REQ004",
      facility_name: "Rural Health Clinic",
      status: "pending",
      items: [
        {
          item_id: "ITM006",
          item_name: "Thermometers",
          quantity: 50,
          unit: "pieces",
          inStock: true,
        },
        {
          item_id: "ITM007",
          item_name: "Blood Pressure Monitors",
          quantity: 20,
          unit: "pieces",
          inStock: false,
        },
      ],
    },
    {
      id: "REQ005",
      facility_name: "Specialized Care Hospital",
      status: "rejected",
      items: [
        {
          item_id: "ITM008",
          item_name: "Ventilators",
          quantity: 5,
          unit: "pieces",
          inStock: true,
        },
      ],
    },
    {
      id: "REQ006",
      facility_name: "Emergency Medical Center",
      status: "pending",
      items: [
        {
          item_id: "ITM009",
          item_name: "IV Fluids",
          quantity: 100,
          unit: "bags",
          inStock: true,
        },
        {
          item_id: "ITM010",
          item_name: "Catheters",
          quantity: 200,
          unit: "pieces",
          inStock: true,
        },
      ],
    },
    {
      id: "REQ007",
      facility_name: "Pediatric Hospital",
      status: "dispatched",
      items: [
        {
          item_id: "ITM011",
          item_name: "Pediatric Masks",
          quantity: 300,
          unit: "boxes",
          inStock: true,
        },
      ],
    },
    {
      id: "REQ008",
      facility_name: "Rehabilitation Center",
      status: "pending",
      items: [
        {
          item_id: "ITM012",
          item_name: "Wheelchairs",
          quantity: 15,
          unit: "pieces",
          inStock: true,
        },
        {
          item_id: "ITM013",
          item_name: "Crutches",
          quantity: 30,
          unit: "pairs",
          inStock: false,
        },
      ],
    },
    {
      id: "REQ009",
      facility_name: "Mental Health Facility",
      status: "partially approved",
      items: [
        {
          item_id: "ITM014",
          item_name: "Medication Cups",
          quantity: 500,
          unit: "pieces",
          inStock: true,
        },
      ],
    },
    {
      id: "REQ010",
      facility_name: "Diagnostic Center",
      status: "pending",
      items: [
        {
          item_id: "ITM015",
          item_name: "Test Tubes",
          quantity: 1000,
          unit: "pieces",
          inStock: true,
        },
        {
          item_id: "ITM016",
          item_name: "Lab Coats",
          quantity: 50,
          unit: "pieces",
          inStock: true,
        },
      ],
    },
    {
      id: "REQ011",
      facility_name: "Oncology Hospital",
      status: "pending",
      items: [
        {
          item_id: "ITM017",
          item_name: "Chemotherapy Drugs",
          quantity: 100,
          unit: "vials",
          inStock: false,
        },
        {
          item_id: "ITM018",
          item_name: "IV Poles",
          quantity: 25,
          unit: "pieces",
          inStock: true,
        },
      ],
    },
    {
      id: "REQ012",
      facility_name: "Dental Clinic",
      status: "approved",
      items: [
        {
          item_id: "ITM019",
          item_name: "Dental Anesthesia",
          quantity: 80,
          unit: "vials",
          inStock: true,
        },
      ],
    },
  ];

  const [requisitions, setRequisitions] = useState([]);

  useEffect(() => {
    setRequisitions(dummyRequisitions);
    setPagination({
      currentPage: 1,
      totalPages: Math.ceil(dummyRequisitions.length / 10),
      totalItems: dummyRequisitions.length,
      itemsPerPage: 10,
    });
  }, []);

  const filteredRequisitions = useMemo(() => {
    return requisitions.filter(
      (req) =>
        req.id?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.facility_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [requisitions, searchTerm]);

  const getCurrentItems = () => {
    const indexOfLastItem = pagination.currentPage * pagination.itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - pagination.itemsPerPage;
    return filteredRequisitions.slice(indexOfFirstItem, indexOfLastItem);
  };

  useEffect(() => {
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

  const StockBadge = ({ inStock }) => {
    return (
      <span
        className={`badge ${inStock ? "bg-success" : "bg-danger"} text-white`}
      >
        {inStock ? "In Stock" : "Out of Stock"}
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
      initial[item.item_id] = item.inStock ? item.quantity : 0;
    });
    setPartialApproveQuantities(initial);
    setCurrentRequisition(req);
    setShowPartialApproveModal(true);
  };

  const openBulkApproveModal = () => {
    if (selectedRequisitions.length === 0) {
      setError("Please select at least one requisition to approve");
      return;
    }
    setBulkRemarks("");
    setShowBulkApproveModal(true);
  };

  // ACTION HANDLERS
  const handleApproveSubmit = () => {
    if (!currentRequisition) return;
    setLoading(true);
    setTimeout(() => {
      setRequisitions(
        requisitions.map((req) =>
          req.id === currentRequisition.id
            ? {
                ...req,
                status: "approved",
                items: req.items.map((item) => ({
                  ...item,
                  approved_quantity: item.quantity,
                })),
              }
            : req
        )
      );
      setShowApproveModal(false);
      setLoading(false);
    }, 500);
  };

  const handlePartialApproveSubmit = () => {
    if (!currentRequisition) return;
    const total = Object.values(partialApproveQuantities).reduce(
      (sum, qty) => sum + (parseInt(qty) || 0),
      0
    );
    if (total === 0) {
      alert("At least one item must have approved quantity > 0");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setRequisitions(
        requisitions.map((req) =>
          req.id === currentRequisition.id
            ? {
                ...req,
                status: "partially approved",
                items: req.items.map((item) => ({
                  ...item,
                  approved_quantity:
                    parseInt(partialApproveQuantities[item.item_id]) || 0,
                })),
              }
            : req
        )
      );
      setShowPartialApproveModal(false);
      setLoading(false);
    }, 500);
  };

  const handleReject = () => {
    if (!rejectingRequisition || !rejectionReason.trim()) {
      alert("Please provide a reason for rejection.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setRequisitions(
        requisitions.map((req) =>
          req.id === rejectingRequisition.id
            ? { ...req, status: "rejected" }
            : req
        )
      );
      setShowRejectModal(false);
      setLoading(false);
    }, 500);
  };

  const handleBulkApprove = () => {
    if (selectedRequisitions.length === 0) {
      setError("No requisitions selected for approval");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setRequisitions(
        requisitions.map((req) =>
          selectedRequisitions.includes(req.id)
            ? {
                ...req,
                status: "approved",
                items: req.items.map((item) => ({
                  ...item,
                  approved_quantity: item.quantity,
                })),
              }
            : req
        )
      );
      setSelectedRequisitions([]);
      setSelectAll(false);
      setShowBulkApproveModal(false);
      setLoading(false);
    }, 500);
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
    <div className="">
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
            <table className="table mb-0">
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
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((req) => (
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
                      <td>{req.id}</td>
                      <td>{req.facility_name || "N/A"}</td>
                      <td>
                        <ul className="mb-0 ps-3">
                          {req.items.map((item) => (
                            <li key={item.item_id}>
                              {item.item_name} — {item.quantity} {item.unit}{" "}
                              <StockBadge inStock={item.inStock} />
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td>
                        <StatusBadge status={req.status} />
                      </td>
                      <td className="d-flex gap-1">
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
                              className="btn btn-sm btn-danger"
                              onClick={() => openRejectModal(req)}
                              disabled={loading}
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
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
          <div className="modal-dialog modal-dialog-centered">
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
                <ul>
                  {currentRequisition.items.map((item) => (
                    <li key={item.item_id}>
                      {item.item_name} — {item.quantity} {item.unit}{" "}
                      <StockBadge inStock={item.inStock} />
                    </li>
                  ))}
                </ul>
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
          <div className="modal-dialog modal-dialog-centered">
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
                {currentRequisition.items.map((item) => (
                  <div key={item.item_id} className="mb-2">
                    <label>
                      {item.item_name} ({item.quantity} {item.unit})
                    </label>
                    <div className="input-group">
                      <input
                        type="number"
                        className="form-control"
                        min="0"
                        max={item.quantity}
                        value={partialApproveQuantities[item.item_id] || 0}
                        onChange={(e) =>
                          setPartialApproveQuantities({
                            ...partialApproveQuantities,
                            [item.item_id]: e.target.value,
                          })
                        }
                        disabled={!item.inStock}
                      />
                      <span className="input-group-text">
                        <StockBadge inStock={item.inStock} />
                      </span>
                    </div>
                  </div>
                ))}
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
                  This will approve all items in the selected requisitions with
                  their requested quantities.
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
                  onClick={handleReject}
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
        showBulkApproveModal) && (
        <div className="modal-backdrop fade show"></div>
      )}
    </div>
  );
};

export default WarehouseRequisitions;
