import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  FaClipboardList,
  FaPlus,
  FaEye,
} from "react-icons/fa";
import BaseUrl from "../../src/Api/BaseUrl";

const FacilityReturns = () => {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [returnRequests, setReturnRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [currentRequest, setCurrentRequest] = useState(null);

  // Form state
  const [selectedItem, setSelectedItem] = useState("");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [remarks, setRemarks] = useState("");

  const hoverRef = useRef(null);

  // === Helper: Get facility_id from localStorage ===
  const getFacilityId = () => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.facility_id || 11; // 11 as fallback
      } catch (e) {
        console.warn("Invalid user in localStorage");
      }
    }
    return 11;
  };

  // === FETCH INVENTORY (same logic as FacilityInventory) ===
  const fetchInventory = async () => {
    try {
      const facilityId = getFacilityId();
      const response = await axios.get(`${BaseUrl}/inventory/fasilities/${facilityId}`);

      let inventoryData = [];
      if (Array.isArray(response.data.data)) {
        inventoryData = response.data.data;
      } else if (response.data.data && typeof response.data.data === "object") {
        inventoryData = [response.data.data];
      }

      const normalized = inventoryData.map((item) => ({
        id: item.id,
        name: item.item_name || "Unnamed Item",
        quantity: item.quantity || 0,
        item_code: item.item_code || "N/A",
      }));

      setInventoryItems(normalized);
    } catch (err) {
      console.error("Error fetching inventory:", err);
      alert("Failed to load inventory items.");
    }
  };

// === FETCH RETURN REQUESTS FOR THIS FACILITY ===
const fetchReturnRequests = async () => {
  try {
    setLoading(true);
    setError(null);

    const facilityId = getFacilityId();
    const response = await axios.get(`${BaseUrl}/returns-recall/facility/${facilityId}`);

    // ✅ Handle both formats: response.data OR response.data.data
    let returnData = [];
    if (Array.isArray(response.data)) {
      // Format: [ {...}, {...} ]
      returnData = response.data;
    } else if (response.data && Array.isArray(response.data.data)) {
      // Format: { data: [ {...}, {...} ] }
      returnData = response.data.data;
    } else if (response.data && response.data.data && typeof response.data.data === 'object') {
      // Single object case (unlikely for list, but safe)
      returnData = [response.data.data];
    }

    const mapped = returnData.map((req) => ({
      id: `RET-${String(req.id).padStart(3, "0")}`,
      apiId: req.id,
      item: req.item_name || "Unknown Item", // Now this will work!
      quantity: req.quantity,
      reason: req.reason,
      remarks: req.remark || "",
      status: req.status === "Pending" ? "Pending Verification" : req.status,
      date: req.created_at ? new Date(req.created_at).toISOString().split("T")[0] : "N/A",
    }));

    setReturnRequests(mapped);
  } catch (err) {
    console.error("Error fetching return requests:", err);
    setError("Failed to load return requests.");
    alert("Could not load your return history.");
  } finally {
    setLoading(false);
  }
};

  // On component mount: fetch both inventory & returns
  useEffect(() => {
    fetchInventory();
    fetchReturnRequests();
  }, []);

  // Close modals on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (hoverRef.current && !hoverRef.current.contains(e.target)) {
        setShowCreateModal(false);
        setShowViewModal(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // === SUBMIT NEW RETURN ===
  const handleCreateReturn = async (e) => {
    e.preventDefault();
    if (!selectedItem || !quantity || !reason) {
      alert("Please fill all required fields!");
      return;
    }

    const item = inventoryItems.find((i) => i.id == selectedItem);
    const qty = parseInt(quantity, 10);
    if (!item || qty <= 0 || qty > item.quantity) {
      alert("Invalid quantity or item.");
      return;
    }

    const facilityId = getFacilityId();

    const payload = {
      facility_id: facilityId,
      item_id: parseInt(selectedItem, 10),
      quantity: qty,
      reason: reason,
      remark: remarks || "",
    };

    try {
      setLoading(true);
      await axios.post(`${BaseUrl}/returns-recall`, payload);

      // ✅ REFRESH both inventory (stock reduced) and return list
      await fetchInventory();
      await fetchReturnRequests();

      // Reset form & close modal
      setShowCreateModal(false);
      setSelectedItem("");
      setQuantity("");
      setReason("");
      setRemarks("");
      alert("Return request submitted successfully!");
    } catch (err) {
      console.error("Return submission error:", err);
      alert("Failed to submit return request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const openViewModal = (req) => {
    setCurrentRequest(req);
    setShowViewModal(true);
  };

  const closeModalOnBackdrop = (e) => {
    if (e.target === e.currentTarget) {
      setShowCreateModal(false);
      setShowViewModal(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Pending Verification":
        return "bg-warning text-dark";
      case "Verified":
        return "bg-info text-dark";
      case "Processed":
        return "bg-success";
      case "Rejected":
        return "bg-danger";
      default:
        return "bg-secondary";
    }
  };

  return (
    <div className="container-fluid py-3">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">
          <FaClipboardList className="me-2" /> Returns
        </h2>
        <button
          className="btn btn-primary d-flex align-items-center"
          onClick={() => setShowCreateModal(true)}
          disabled={loading}
        >
          <FaPlus className="me-2" /> New Return
        </button>
      </div>

      {/* Return Requests Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-0 py-3">
          <h5 className="mb-0">My Return Requests</h5>
        </div>
        <div className="card-body">
          {loading && returnRequests.length === 0 ? (
            <div className="text-center py-3">
              <div className="spinner-border spinner-border-sm" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : returnRequests.length === 0 ? (
            <p className="text-center text-muted py-3">
              No return requests found
            </p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0 align-middle">
                <thead className="bg-light">
                  <tr>
                    <th>Return ID</th>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {returnRequests.map((req) => (
                    <tr key={req.apiId}>
                      <td className="fw-bold">{req.id}</td>
                      <td>{req.item}</td>
                      <td>{req.quantity}</td>
                      <td>{req.reason}</td>
                      <td>
                        <span className={`badge ${getStatusClass(req.status)}`}>
                          {req.status}
                        </span>
                      </td>
                      <td>{req.date}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => openViewModal(req)}
                          disabled={loading}
                        >
                          <FaEye />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create Return Modal */}
      {showCreateModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          onClick={closeModalOnBackdrop}
          ref={hoverRef}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header border-bottom-0">
                <h5 className="modal-title">
                  <FaPlus className="me-2" /> New Return Request
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowCreateModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleCreateReturn}>
                  <div className="mb-3">
                    <label className="form-label">Select Item *</label>
                    <select
                      className="form-select"
                      value={selectedItem}
                      onChange={(e) => setSelectedItem(e.target.value)}
                      required
                      disabled={loading}
                    >
                      <option value="">Choose an item</option>
                      {inventoryItems
                        .filter((item) => item.quantity > 0)
                        .map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name} (Available: {item.quantity})
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Quantity *</label>
                    <input
                      type="number"
                      className="form-control"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      min="1"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Reason *</label>
                    <select
                      className="form-select"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      required
                      disabled={loading}
                    >
                      <option value="">Select reason</option>
                      <option value="Defective">Defective</option>
                      <option value="Near expiry">Near expiry</option>
                      <option value="Wrong item">Wrong item</option>
                      <option value="Item expired">Item expired</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Remarks</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="Additional comments..."
                      disabled={loading}
                    ></textarea>
                  </div>

                  <div className="d-flex justify-content-end gap-2">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowCreateModal(false)}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? "Submitting..." : "Submit"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && currentRequest && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          onClick={closeModalOnBackdrop}
          ref={hoverRef}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header border-bottom-0">
                <h5 className="modal-title">Return Details: {currentRequest.id}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowViewModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p><strong>Item:</strong> {currentRequest.item}</p>
                <p><strong>Quantity:</strong> {currentRequest.quantity}</p>
                <p><strong>Reason:</strong> {currentRequest.reason}</p>
                <p><strong>Remarks:</strong> {currentRequest.remarks || "—"}</p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span className={`badge ${getStatusClass(currentRequest.status)}`}>
                    {currentRequest.status}
                  </span>
                </p>
                <p><strong>Date:</strong> {currentRequest.date}</p>
              </div>
              <div className="modal-footer border-top-0">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowViewModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {(showCreateModal || showViewModal) && (
        <div className="modal-backdrop fade show"></div>
      )}
    </div>
  );
};

export default FacilityReturns;