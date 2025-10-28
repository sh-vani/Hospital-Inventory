import React, { useState } from "react";
import { Table, Button, Modal, Form, Badge } from "react-bootstrap";

const WarehouseReturn = () => {
  const [returns, setReturns] = useState([
    {
      id: "RET-001",
      facility: "Main Hospital",
      item: "Antibiotic - Amoxycillin",
      quantity: 50,
      reason: "Near Expiry",
      status: "Pending Verification",
      remarks: "",
      date: "2025-10-27",
    },
    {
      id: "RET-002",
      facility: "Health Center 2",
      item: "Painkiller - Paracetamol",
      quantity: 30,
      reason: "Defective",
      status: "Verified",
      remarks: "Batch 102 damaged",
      date: "2025-10-26",
    },
  ]);

  const [selectedReturn, setSelectedReturn] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [action, setAction] = useState(""); // Accept / Reject
  const [remarks, setRemarks] = useState("");

  const handleActionClick = (ret, act) => {
    setSelectedReturn(ret);
    setAction(act);
    setShowModal(true);
  };

  const handleSubmitAction = () => {
    setReturns((prev) =>
      prev.map((r) =>
        r.id === selectedReturn.id
          ? { ...r, status: action === "Accept" ? "Processed" : "Rejected", remarks }
          : r
      )
    );
    setShowModal(false);
    setRemarks("");
  };

  return (
    <div className="container mt-4">
      <h4 className="mb-3 text-center text-primary fw-bold">
        Warehouse Returns & Recalls
      </h4>

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
          {returns.map((ret) => (
            <tr key={ret.id}>
              <td>{ret.id}</td>
              <td>{ret.facility}</td>
              <td>{ret.item}</td>
              <td>{ret.quantity}</td>
              <td>{ret.reason}</td>
              <td>
                <Badge
                  bg={
                    ret.status === "Processed"
                      ? "success"
                      : ret.status === "Rejected"
                      ? "danger"
                      : "warning"
                  }
                >
                  {ret.status}
                </Badge>
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
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleActionClick(ret, "Reject")}
                    >
                      Reject
                    </Button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal for Accept/Reject */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {action === "Accept" ? "Accept Return" : "Reject Return"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to <strong>{action}</strong> this return (
            {selectedReturn?.item})?
          </p>
          <Form.Group>
            <Form.Label>Remarks</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button
            variant={action === "Accept" ? "success" : "danger"}
            onClick={handleSubmitAction}
          >
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default WarehouseReturn;
