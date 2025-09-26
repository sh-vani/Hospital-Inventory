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

const FacilityDashboard = () => {
  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [selectedItem, setSelectedItem] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // ✅ Get facility_id from localStorage (assuming you stored user object as JSON)
  const facilityId = JSON.parse(localStorage.getItem("user"))?.facility_id;

  // ✅ Fetch Inventory from API
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await axios.get(
          "https://ssknf82q-3000.inc1.devtunnels.ms/api/inventory"
        );
        const items = response.data?.data?.items || [];

        // ✅ Filter items with matching facility_id
        const filteredItems = items.filter(
          (item) => item.facility_id === facilityId
        );

        // ✅ Map API data into table-friendly format
        const formattedItems = filteredItems.map((item) => ({
          id: item.id,
          code: item.item_code,
          name: item.item_name,
          qty: item.quantity,
          reserved: 0, // Reserved value (if available from API, replace here)
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

  // ✅ Handle View
  const handleView = (item) => {
    setSelectedItem(item);
    setShowViewModal(true);
  };

  // ✅ Handle Edit
  const handleEdit = (item) => {
    setSelectedItem(item);
    setShowEditModal(true);
  };

  // ✅ Handle Save (Edit Modal)
  const handleSaveEdit = () => {
    setInventoryData((prev) =>
      prev.map((item) => (item.id === selectedItem.id ? selectedItem : item))
    );
    setShowEditModal(false);
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
                    {inventoryData.map((item) => (
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
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

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
