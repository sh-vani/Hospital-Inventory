import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Modal,
  Form,
  Spinner,
} from "react-bootstrap";
import axios from "axios";
import axiosInstance from "../Api/axiosInstance";

const FacilityDashboard = () => {
  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [selectedItem, setSelectedItem] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // ✅ Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 10;

  // ✅ Get facility_id from localStorage
  const facilityId = JSON.parse(localStorage.getItem("user"))?.facility_id;

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await axiosInstance.get(`/inventory`);
        const items = response.data?.data || [];

        const filteredItems = items.filter(
          (item) => item.facility_id === facilityId
        );

        const formattedItems = filteredItems.map((item) => ({
          id: item.id,
          code: item.item_code,
          name: item.item_name,
          qty: item.quantity,
          reserved: 0,
          lastReceipt: new Date(item.updated_at).toLocaleDateString(),
          category: item.category,
          description: item.description,
          unit: item.unit,
        }));

        setInventoryData(formattedItems);
      } catch (error) {
        console.error("Error fetching inventory:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, [facilityId]);

  const handleView = (item) => {
    setSelectedItem(item);
    setShowViewModal(true);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    setInventoryData((prev) =>
      prev.map((item) => (item.id === selectedItem.id ? selectedItem : item))
    );
    setShowEditModal(false);
  };

  // ✅ Pagination logic
  const totalPages = Math.ceil(inventoryData.length / entriesPerPage);
  const indexOfLastEntry = currentPage * entriesPerPage;
  const currentEntries = inventoryData.slice(indexOfLastEntry - entriesPerPage, indexOfLastEntry);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <Container fluid className="p-4">
      {/* Header */}
      <Row className="mb-4 align-items-center">
        <Col>
          <h1 className="mb-0">Facility Inventory</h1>
          <p className="text-muted mb-0">
            Monitor and manage your facility’s stock levels in real time.
          </p>
        </Col>
      </Row>

      {/* Inventory Table */}
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <Card.Title className="mb-0">Inventory List</Card.Title>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-2">Loading inventory...</p>
                </div>
              ) : inventoryData.length === 0 ? (
                <p className="text-center text-muted py-5">
                  No inventory data available for this facility.
                </p>
              ) : (
                <>
                  <Table responsive striped hover>
                    <thead>
                      <tr>
                        <th>Item Code</th>
                        <th>Item Name</th>
                        <th>Available Qty</th>
                        <th>Reserved</th>
                        <th>Last Receipt</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentEntries.map((item) => (
                        <tr key={item.id}>
                          <td>{item.code}</td>
                          <td>{item.name}</td>
                          <td>{item.qty}</td>
                          <td>{item.reserved}</td>
                          <td>{item.lastReceipt}</td>
                          <td>
                            <Button
                              size="sm"
                              variant="outline-primary"
                              className="me-2"
                              onClick={() => handleView(item)}
                            >
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-success"
                              onClick={() => handleEdit(item)}
                            >
                              Edit
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ✅ PAGINATION — Same as your earlier components */}
      <div className="d-flex justify-content-end mt-3">
        <nav>
          <ul className="pagination mb-0">
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

      {/* View Modal */}
      <Modal
        show={showViewModal}
        onHide={() => setShowViewModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Item Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedItem && (
            <div>
              <p>
                <strong>Item Code:</strong> {selectedItem.code}
              </p>
              <p>
                <strong>Name:</strong> {selectedItem.name}
              </p>
              <p>
                <strong>Available Qty:</strong> {selectedItem.qty}
              </p>
              <p>
                <strong>Reserved:</strong> {selectedItem.reserved}
              </p>
              <p>
                <strong>Last Receipt:</strong> {selectedItem.lastReceipt}
              </p>
              <p>
                <strong>Category:</strong> {selectedItem.category}
              </p>
              <p>
                <strong>Description:</strong> {selectedItem.description}
              </p>
              <p>
                <strong>Unit:</strong> {selectedItem.unit}
              </p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Modal */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Item</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedItem && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Available Quantity</Form.Label>
                <Form.Control
                  type="number"
                  value={selectedItem.qty}
                  onChange={(e) =>
                    setSelectedItem({ ...selectedItem, qty: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Reserved</Form.Label>
                <Form.Control
                  type="number"
                  value={selectedItem.reserved}
                  onChange={(e) =>
                    setSelectedItem({ ...selectedItem, reserved: e.target.value })
                  }
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveEdit}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default FacilityDashboard;