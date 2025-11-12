import React, { useEffect, useState, useRef } from "react";
import { Table, Card, Button, Spinner, Alert, Modal } from "react-bootstrap";
import { FaSync, FaEye, FaPrint } from "react-icons/fa";
import axios from "axios";
import BaseUrl from "../../Api/BaseUrl";

const ApprovedReceipts = () => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [viewModalData, setViewModalData] = useState(null); // holds data for modal
  const printRefs = useRef({});

  const fetchApprovedReceipts = async () => {
    try {
      setLoading(true);
      setError("");

      const userStr = localStorage.getItem("user");
      if (!userStr) {
        setError("User not logged in. Please log in again.");
        setLoading(false);
        return;
      }

      const user = JSON.parse(userStr);
      const userId = user?.id;
      if (!userId) {
        setError("User ID not found.");
        setLoading(false);
        return;
      }

      const response = await axios.get(`${BaseUrl}/receipts/approved-receipts/${userId}`);

      if (response.data?.success) {
        const apiData = Array.isArray(response.data.data) ? response.data.data : [];
        const normalized = apiData.map((req) => ({
          requisition_id: req.requisition_id,
          facility_id: req.facility_id,
          status: req.status,
          priority: req.priority || "normal",
          total_approved_value: req.total_approved_value || 0,
          items: Array.isArray(req.items) ? req.items : [],
          created_at: req.created_at,
        }));
        setReceipts(normalized);
      } else {
        setError("Failed to fetch approved receipts");
      }
    } catch (err) {
      console.error("API Error:", err);
      setError("Error fetching approved receipts. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovedReceipts();
  }, []);

  const openViewModal = (receipt) => {
    setViewModalData(receipt);
  };

  const closeViewModal = () => {
    setViewModalData(null);
  };

  const handlePrint = (id) => {
    const printContent = printRefs.current[id]?.innerHTML;
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt #${id}</title>
          <style>
            body { 
              font-family: 'Poppins', Arial, sans-serif; 
              padding: 20px; 
              max-width: 900px;
              margin: 0 auto;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 10px; 
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 10px; 
              text-align: left; 
            }
            th { 
              background-color: #e9f7ef; 
              color: #155724; 
            }
            .header { margin-bottom: 15px; }
            .details { margin: 15px 0; padding: 10px; background: #f8f9fa; border-radius: 4px; }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <div className="container mt-4">
      <Card className="shadow-sm">
        <Card.Header className="d-flex justify-content-between align-items-center bg-light text-black">
          <h5 className="mb-0">Approved Receipts</h5>
          <Button
            variant="light"
            size="sm"
            onClick={fetchApprovedReceipts}
            disabled={loading}
          >
            <FaSync className={loading ? "spin" : ""} /> Refresh
          </Button>
        </Card.Header>

        <Card.Body>
          {loading && (
            <div className="text-center">
              <Spinner animation="border" variant="success" />
              <p>Loading receipts...</p>
            </div>
          )}

          {error && <Alert variant="danger">{error}</Alert>}

          {!loading && receipts.length === 0 && !error && (
            <Alert variant="info">No approved receipts found.</Alert>
          )}

          {!loading &&
            receipts.length > 0 &&
            receipts.map((req) => (
              <div key={req.requisition_id} className="mb-4">
                {/* Summary Bar */}
                <div className="d-flex justify-content-between align-items-center mb-2 p-2 bg-light rounded">
                  <h6 className="mb-0 text-dark">
                    <strong>Requisition ID:</strong> {req.requisition_id} |{" "}
                    <strong>Priority:</strong> {req.priority.toUpperCase()} |{" "}
                  
                  </h6>
                  <div>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      onClick={() => openViewModal(req)}
                    >
                      <FaEye className="me-1" /> View Details
                    </Button>
                    <Button
                      variant="outline-success"
                      size="sm"
                      onClick={() => handlePrint(req.requisition_id)}
                    >
                      <FaPrint className="me-1" /> Print
                    </Button>
                  </div>
                </div>

                {/* Always-visible item table */}
                <Table striped bordered hover responsive className="mt-2">
                  <thead className="table-success">
                    <tr>
                      <th>#</th>
                      <th>Item Name</th>
                      <th>Category</th>
                      <th>Unit</th>
                      <th>Requested Qty</th>
                      <th>Approved Qty</th>
                      <th>Item Cost (₹)</th>
                      <th>Total Value (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {req.items.map((item, index) => (
                      <tr key={item.item_id}>
                        <td>{index + 1}</td>
                        <td>{item.item_name}</td>
                        <td>{item.category}</td>
                        <td>{item.unit}</td>
                        <td>{item.quantity}</td>
                        <td>{item.approved_quantity}</td>
                        <td>{item.item_cost}</td>
                        <td>{item.item_cost * item.approved_quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>

                {/* Hidden print container */}
                <div ref={(el) => (printRefs.current[req.requisition_id] = el)} style={{ display: "none" }}>
                  <div className="header">
                    <h4>Approved Receipt</h4>
                    <p><strong>Requisition ID:</strong> {req.requisition_id}</p>
                    <p><strong>Date:</strong> {new Date(req.created_at).toLocaleDateString()}</p>
                    <p><strong>Total Approved Value:</strong> ₹{req.total_approved_value}</p>
                  </div>
                  <div className="details">
                    <p><strong>Facility ID:</strong> {req.facility_id}</p>
                    <p><strong>Status:</strong> {req.status}</p>
                    <p><strong>Priority:</strong> {req.priority.toUpperCase()}</p>
                  </div>
                  <table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Item Name</th>
                        <th>Category</th>
                        <th>Unit</th>
                        <th>Approved Qty</th>
                        <th>Item Cost (₹)</th>
                        <th>Total Value (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {req.items.map((item, index) => (
                        <tr key={item.item_id}>
                          <td>{index + 1}</td>
                          <td>{item.item_name}</td>
                          <td>{item.category}</td>
                          <td>{item.unit}</td>
                          <td>{item.approved_quantity}</td>
                          <td>{item.item_cost}</td>
                          <td>{(item.item_cost * item.approved_quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
        </Card.Body>
      </Card>

      {/* View Details Modal */}
      <Modal show={!!viewModalData} onHide={closeViewModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Requisition Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {viewModalData && (
            <>
              <p><strong>Requisition ID:</strong> {viewModalData.requisition_id}</p>
              <p><strong>Facility ID:</strong> {viewModalData.facility_id}</p>
              <p><strong>Status:</strong> {viewModalData.status}</p>
              <p><strong>Priority:</strong> {viewModalData.priority.toUpperCase()}</p>
              <p><strong>Created At:</strong> {new Date(viewModalData.created_at).toLocaleString()}</p>
              <p><strong>Total Approved Value:</strong> ₹{viewModalData.total_approved_value}</p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeViewModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <style>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ApprovedReceipts;