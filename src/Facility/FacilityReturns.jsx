import React, { useState, useEffect } from "react";
import { FaClipboardList, FaPlus, FaTrash, FaEye } from "react-icons/fa";


const FacilityReturns = () => {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [returnRequests, setReturnRequests] = useState([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [remarks, setRemarks] = useState("");
  const [currentRequest, setCurrentRequest] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  // Fetch facility inventory
  const fetchInventory = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BaseUrl}/facility/inventory`);
      if (response.data.success) {
        setInventoryItems(response.data.data);
      } else {
        alert("Failed to fetch inventory");
      }
    } catch (err) {
      console.error("Error fetching inventory:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Create new return request
  const handleCreateReturn = (e) => {
    e.preventDefault();
    if (!selectedItem || !quantity || !reason) {
      alert("Please fill all required fields!");
      return;
    }

    const newRequest = {
      id: `RET-${String(returnRequests.length + 1).padStart(3, "0")}`,
      item: selectedItem,
      quantity,
      reason,
      remarks,
      status: "Pending Verification",
      date: new Date().toISOString().split("T")[0],
    };

    setReturnRequests([newRequest, ...returnRequests]);
    setShowCreateModal(false);
    setSelectedItem("");
    setQuantity("");
    setReason("");
    setRemarks("");
    alert("Return request created successfully!");
  };

  const openViewModal = (req) => {
    setCurrentRequest(req);
    setShowViewModal(true);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Pending Verification":
        return "bg-warning";
      case "Verified":
        return "bg-info";
      case "Processed":
        return "bg-success";
      case "Rejected":
        return "bg-danger";
      default:
        return "bg-secondary";
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <FaClipboardList className="me-2" /> Returns
        </h2>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          <FaPlus className="me-2" /> New Return
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="card-header text-black">
          <h5 className="mb-0">My Return Requests</h5>
        </div>
        <div className="card-body">
          {returnRequests.length === 0 ? (
            <p className="text-center text-muted">No return requests found</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
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
                  {returnRequests.map((req, idx) => (
                    <tr key={idx}>
                      <td>{req.id}</td>
                      <td>{req.item}</td>
                      <td>{req.quantity}</td>
                      <td>{req.reason}</td>
                      <td>
                        <span className={`badge ${getStatusClass(req.status)}`}>{req.status}</span>
                      </td>
                      <td>{req.date}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => openViewModal(req)}
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
          onClick={(e) => {
            if (e.target.classList.contains("modal")) setShowCreateModal(false);
          }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <FaPlus className="me-2" /> New Return Request
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleCreateReturn}>
                  <div className="mb-3">
                    <label className="form-label">Select Item</label>
                    <select
                      className="form-select"
                      value={selectedItem}
                      onChange={(e) => setSelectedItem(e.target.value)}
                      required
                    >
                      <option value="">Select Item</option>
                      {inventoryItems.map((item) => (
                        <option key={item.id} value={item.name}>
                          {item.name} (Qty: {item.quantity})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Quantity</label>
                    <input
                      type="number"
                      className="form-control"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Reason</label>
                    <select
                      className="form-select"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      required
                    >
                      <option value="">Select Reason</option>
                      <option value="Defective">Defective</option>
                      <option value="Near expiry">Near expiry</option>
                      <option value="Wrong item">Wrong item</option>
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
                    ></textarea>
                  </div>

                  <div className="d-flex justify-content-end gap-2">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Submit
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Return Details Modal */}
      {showViewModal && currentRequest && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          onClick={(e) => {
            if (e.target.classList.contains("modal")) setShowViewModal(false);
          }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Return Details: {currentRequest.id}</h5>
                <button type="button" className="btn-close" onClick={() => setShowViewModal(false)}></button>
              </div>
              <div className="modal-body">
                <p><strong>Item:</strong> {currentRequest.item}</p>
                <p><strong>Quantity:</strong> {currentRequest.quantity}</p>
                <p><strong>Reason:</strong> {currentRequest.reason}</p>
                <p><strong>Remarks:</strong> {currentRequest.remarks}</p>
                <p><strong>Status:</strong> <span className={`badge ${getStatusClass(currentRequest.status)}`}>{currentRequest.status}</span></p>
                <p><strong>Date:</strong> {currentRequest.date}</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowViewModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {(showCreateModal || showViewModal) && <div className="modal-backdrop fade show"></div>}
    </div>
  );
};

export default FacilityReturns;
