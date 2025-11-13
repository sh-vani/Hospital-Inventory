import React, { useState, useEffect } from "react";
import { Table, Spinner, Alert, Badge, Button, Modal } from "react-bootstrap";
import axios from "axios";
import BaseUrl from "../../src/Api/BaseUrl";
import { FaClipboardList, FaEye } from "react-icons/fa";

const FacilityAssets = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null); // For modal
  const [showModal, setShowModal] = useState(false);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      setError(null);

      const userStr = localStorage.getItem("user");
      if (!userStr) throw new Error("User not logged in. Please login again.");

      const user = JSON.parse(userStr);
      const facilityId = user?.facility_id;

      if (!facilityId) throw new Error("Facility ID missing in your account.");

      const response = await axios.get(`${BaseUrl}/assets/facility/${facilityId}`);

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Failed to fetch assets.");
      }

      const mappedAssets = (response.data.data || []).map((asset) => ({
        id: `AST-${String(asset.id).padStart(4, "0")}`,
        rawId: asset.id,
        name: asset.name || "Unnamed",
        serialNumber: asset.serial_number || "N/A",
        model: asset.model || "-",
        type: asset.type || "-",
        status: asset.status || "Available",
        assignedTo: asset.assigned_to_name || "Unassigned",
        facilityName: asset.facility_name || "-",
        facilityLocation: asset.facility_location || "-",
        purchaseDate: asset.purchase_date
          ? new Date(asset.purchase_date).toISOString().split("T")[0]
          : "-",
        warrantyExpiry: asset.warranty_expiry
          ? new Date(asset.warranty_expiry).toISOString().split("T")[0]
          : "-",
        createdAt: asset.created_at
          ? new Date(asset.created_at).toISOString().split("T")[0]
          : "-",
      }));

      setAssets(mappedAssets);
    } catch (err) {
      console.error("❌ Error fetching assets:", err);
      setError(err.message || "Something went wrong while loading assets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const getStatusVariant = (status) => {
    switch (status) {
      case "Assigned":
        return "primary";
      case "Available":
        return "success";
      case "Under Maintenance":
        return "warning";
      default:
        return "secondary";
    }
  };

  const handleViewClick = (asset) => {
    setSelectedAsset(asset);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedAsset(null);
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">
          <FaClipboardList className="me-2" /> Facility Assets
        </h2>
      </div>

      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      {loading && (
        <div className="text-center py-4">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Loading assets...</p>
        </div>
      )}

      {!loading && !error && (
        <Table striped bordered hover responsive className="shadow-sm">
          <thead className="table-light">
            <tr>
              <th>Asset ID</th>
              <th>Name</th>
              <th>Serial No.</th>
              <th>Model</th>
              <th>Type</th>
              <th>Status</th>
              <th>Created Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {assets.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-3">
                  No assets found for this facility.
                </td>
              </tr>
            ) : (
              assets.map((asset) => (
                <tr key={asset.rawId}>
                  <td>{asset.id}</td>
                  <td>{asset.name}</td>
                  <td>{asset.serialNumber}</td>
                  <td>{asset.model}</td>
                  <td>{asset.type}</td>
                  <td>
                    <Badge bg={getStatusVariant(asset.status)}>
                      {asset.status}
                    </Badge>
                  </td>
                  <td>{asset.createdAt}</td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => handleViewClick(asset)}
                      title="View Details"
                    >
                      <FaEye />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      )}

      {/* ✅ View Asset Modal */}
      <Modal
        show={showModal}
        onHide={handleCloseModal}
        backdrop="static"
        keyboard={false}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FaEye className="me-2" />
            Asset Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedAsset ? (
            <div className="row">
              <div className="col-md-6">
                <p>
                  <strong>Asset ID:</strong> {selectedAsset.id}
                </p>
                <p>
                  <strong>Name:</strong> {selectedAsset.name}
                </p>
                <p>
                  <strong>Serial No.:</strong> {selectedAsset.serialNumber}
                </p>
                <p>
                  <strong>Model:</strong> {selectedAsset.model}
                </p>
                <p>
                  <strong>Type:</strong> {selectedAsset.type}
                </p>
              </div>
              <div className="col-md-6">
                <p>
                  <strong>Status:</strong>{" "}
                  <Badge bg={getStatusVariant(selectedAsset.status)}>
                    {selectedAsset.status}
                  </Badge>
                </p>
                <p>
                  <strong>Assigned To:</strong> {selectedAsset.assignedTo}
                </p>
                <p>
                  <strong>Facility:</strong> {selectedAsset.facilityName}
                </p>
                <p>
                  <strong>Location:</strong> {selectedAsset.facilityLocation}
                </p>
                <p>
                  <strong>Purchase Date:</strong> {selectedAsset.purchaseDate}
                </p>
                <p>
                  <strong>Warranty Expiry:</strong> {selectedAsset.warrantyExpiry}
                </p>
                <p>
                  <strong>Created At:</strong> {selectedAsset.createdAt}
                </p>
              </div>
            </div>
          ) : (
            <p>Loading asset details...</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default FacilityAssets;