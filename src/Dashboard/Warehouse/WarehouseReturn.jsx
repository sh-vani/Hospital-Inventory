import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Badge, Alert } from "react-bootstrap";
import axios from "axios";
import BaseUrl from "../../Api/BaseUrl";
import { FaClipboardList } from "react-icons/fa";

const WarehouseReturn = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [action, setAction] = useState(""); // Accept or Reject
  const [remarks, setRemarks] = useState("");
  const [actionMessage, setActionMessage] = useState({ type: "", text: "" });

  // ✅ Fetch all returns from API
  const fetchReturns = async () => {
    try {
      setLoading(true);
      setError(null);
      setActionMessage({ type: "", text: "" });

      const response = await axios.get(`${BaseUrl}/returns-recall`);

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Failed to fetch returns.");
      }

      const mapped = (response.data.data || []).map((r) => {
        // 🔥 Correct mapping based on actual API status
        let uiStatus;
        if (r.status === "Accepted") uiStatus = "Processed";
        else if (r.status === "Rejected") uiStatus = "Rejected";
        else uiStatus = "Pending Verification";

        return {
          id: `RET-${String(r.id).padStart(3, "0")}`,
          apiId: r.id,
          facility: `Facility ${r.facility_id}`,
          item: r.item_name || "Unknown Item",
          quantity: r.quantity,
          reason: r.reason,
          status: uiStatus,
          remark: r.remark || "",
          reject_reason: r.reject_reason || "",
          accept_reason: r.accept_reason || "",
          date: r.created_at
            ? new Date(r.created_at).toISOString().split("T")[0]
            : "N/A",
        };
      });

      setReturns(mapped);
    } catch (err) {
      console.error("Error fetching returns:", err);
      setError("Failed to load return requests. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  // ✅ Handle Accept/Reject button click
  const handleActionClick = (ret, act) => {
    setSelectedReturn(ret);
    setAction(act);
    setRemarks("");
    setShowModal(true);
  };

  // ✅ Submit action to backend
  const handleSubmitAction = async () => {
    if (!selectedReturn) return;
    const trimmedRemarks = remarks.trim();

    if (action === "Reject" && !trimmedRemarks) {
      setActionMessage({ type: "danger", text: "Please provide a rejection reason." });
      return;
    }

    try {
      setLoading(true);
      setActionMessage({ type: "", text: "" });

      let endpoint = "";
      let payload = {};

      if (action === "Accept") {
        endpoint = `${BaseUrl}/returns-recall/${selectedReturn.apiId}/accept`;
        payload = { accept_reason: trimmedRemarks || "Items verified and accepted." };
        await axios.put(endpoint, payload);
      } else if (action === "Reject") {
        endpoint = `${BaseUrl}/returns-recall/${selectedReturn.apiId}/reject`;
        payload = { reject_reason: trimmedRemarks };
        await axios.patch(endpoint, payload);
      }

      // ✅ Instantly update in UI
      setReturns((prev) =>
        prev.map((r) =>
          r.apiId === selectedReturn.apiId
            ? {
                ...r,
                status: action === "Accept" ? "Processed" : "Rejected",
                remark: action === "Accept" ? trimmedRemarks : r.remark,
                reject_reason: action === "Reject" ? trimmedRemarks : r.reject_reason,
              }
            : r
        )
      );

      setShowModal(false);
      setActionMessage({
        type: "success",
        text: `Return ${action.toLowerCase()}ed successfully!`,
      });

      // ✅ Refresh from backend after short delay for consistency
      setTimeout(() => fetchReturns(), 1200);
    } catch (err) {
      console.error("Action error:", err);
      setActionMessage({
        type: "danger",
        text: `Failed to ${action.toLowerCase()} return. Please try again.`,
      });
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
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="fw-bold">
          <FaClipboardList className="me-2" />
          Warehouse Returns & Recalls
        </h2>
      </div>

      {actionMessage.text && (
        <Alert
          variant={actionMessage.type}
          onClose={() => setActionMessage({ type: "", text: "" })}
          dismissible
        >
          {actionMessage.text}
        </Alert>
      )}

      {loading && (
        <div className="text-center py-4">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {error && <Alert variant="danger">{error}</Alert>}

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
                    {ret.status === "Pending Verification" ? (
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
                    ) : (
                      <Badge bg={getStatusVariant(ret.status)}>
                        {ret.status}
                      </Badge>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      )}

      {/* ✅ Action Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {action === "Accept" ? "Accept Return" : "Reject Return"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to{" "}
            <strong>{action.toLowerCase()}</strong> this return for{" "}
            <strong>{selectedReturn?.item}</strong>?
          </p>
          <Form.Group className="mt-3">
            <Form.Label>
              {action === "Reject" ? "Rejection Reason *" : "Remarks (Optional)"}
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder={
                action === "Reject"
                  ? "Enter rejection reason..."
                  : "Add optional remarks..."
              }
              isInvalid={action === "Reject" && !remarks.trim()}
            />
            {action === "Reject" && !remarks.trim() && (
              <Form.Control.Feedback type="invalid">
                Rejection reason is required.
              </Form.Control.Feedback>
            )}
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowModal(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant={action === "Accept" ? "success" : "danger"}
            onClick={handleSubmitAction}
            disabled={loading || (action === "Reject" && !remarks.trim())}
          >
            {loading ? "Processing..." : "Confirm"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default WarehouseReturn;
