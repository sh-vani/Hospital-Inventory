import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Badge } from "react-bootstrap";
import axios from "axios";
import BaseUrl from "../../Api/BaseUrl";
import { FaClipboardList } from "react-icons/fa";

const WarehouseReturn = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [action, setAction] = useState(""); // "Accept" or "Reject"
  const [remarks, setRemarks] = useState("");

  // Fetch returns from API
  const fetchReturns = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${BaseUrl}/returns-recall`);

      const mappedReturns = (response.data || []).map((ret) => ({
        id: `RET-${String(ret.id).padStart(3, "0")}`,
        apiId: ret.id,
        facility: ret.facility_name || `Facility ${ret.facility_id}`,
        item: ret.item_name || `Item ${ret.item_id}`,
        quantity: ret.quantity,
        reason: ret.reason,
        status: ret.status === "Pending" ? "Pending Verification" : ret.status,
        remarks: ret.remark || "",
        reject_reason: ret.reject_reason || "",
        date: ret.created_at ? new Date(ret.created_at).toISOString().split("T")[0] : "N/A",
        facility_id: ret.facility_id,
        item_id: ret.item_id,
      }));

      setReturns(mappedReturns);
    } catch (err) {
      console.error("Error fetching returns:", err);
      setError("Failed to load return requests.");
      alert("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  const handleActionClick = (ret, act) => {
    setSelectedReturn(ret);
    setAction(act);
    setRemarks("");
    setShowModal(true);
  };

  const handleSubmitAction = async () => {
    if (!selectedReturn) return;
  
    // Validation: Reject must have a reason
    if (action === "Reject" && !remarks.trim()) {
      alert("Please provide a rejection reason.");
      return;
    }
  
    try {
      setLoading(true);
  
      if (action === "Accept") {
        const payload = {
          accept_reason: remarks.trim() || "Items verified and accepted.",
        };
        await axios.patch(`${BaseUrl}/returns-recall/${selectedReturn.apiId}/accept`, payload);
      } else if (action === "Reject") {
        const payload = {
          reject_reason: remarks.trim(),
        };
        await axios.patch(`${BaseUrl}/returns-recall/${selectedReturn.apiId}/reject`, payload);
      }
  
      // Optimistic UI update
      setReturns((prev) =>
        prev.map((r) =>
          r.apiId === selectedReturn.apiId
            ? {
                ...r,
                status: action === "Accept" ? "Processed" : "Rejected",
                ...(action === "Accept"
                  ? { remarks: remarks.trim() || "Accepted", reject_reason: "" }
                  : { reject_reason: remarks.trim() }),
              }
            : r
        )
      );
  
      setShowModal(false);
      alert(`${action}ed return successfully!`);
    } catch (err) {
      console.error("Action submission error:", err);
      alert(`Failed to ${action.toLowerCase()} return. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusVariant = (status) => {
    if (status === "Processed") return "success";
    if (status === "Rejected") return "danger";
    return "warning";
  };

  return (
    <div className="container-fluid py-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">
          <FaClipboardList className="me-2" /> Warehouse Returns & Recalls
        </h2>
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && (
        <Table striped bordered hover responsive>
          <thead className="table-secondary">
            <tr>
              <th>Return ID</th>
              <th>Facility</th>
              <th>Item</th>
              <th>Qty</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {returns.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-3">
                  No return requests found
                </td>
              </tr>
            ) : (
              returns.map((ret) => (
                <tr key={ret.apiId}>
                  <td>{ret.id}</td>
                  <td>{ret.facility}</td>
                  <td>{ret.item}</td>
                  <td>{ret.quantity}</td>
                  <td>{ret.reason}</td>
                  <td>
                    <Badge bg={getStatusVariant(ret.status)}>{ret.status}</Badge>
                  </td>
                  <td>{ret.date}</td>
                  <td>
                    {ret.status === "Pending Verification" && (
                      <>
                        <Button
                          size="sm"
                          variant="success"
                          className="me-2"
                          onClick={() => handleActionClick(ret, "Accept")}
                          disabled={loading}
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleActionClick(ret, "Reject")}
                          disabled={loading}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      )}

      {/* Action Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {action === "Accept" ? "Accept Return" : "Reject Return"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to <strong>{action.toLowerCase()}</strong> this return for{" "}
            <strong>{selectedReturn?.item}</strong>?
          </p>
          <Form.Group className="mt-3">
            <Form.Label>
              {action === "Reject" ? "Rejection Reason *" : "Acceptance Remarks (Optional)"}
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder={
                action === "Reject"
                  ? "Enter reason for rejection..."
                  : "Add optional remarks..."
              }
              required={action === "Reject"}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant={action === "Accept" ? "success" : "danger"}
            onClick={handleSubmitAction}
            disabled={loading}
          >
            {loading ? "Processing..." : "Confirm"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default WarehouseReturn;