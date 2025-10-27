// import React, { useState } from 'react';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import 'bootstrap-icons/font/bootstrap-icons.css';
// import { Modal, Form, Row, Col, Button, Alert } from 'react-bootstrap';

// const FacilityAssets = () => {
//   // Simplified assets data matching requirements
//   const [assets, setAssets] = useState([
//     {
//       id: 'AST-1001',
//       name: 'Ventilator',
//       assignedTo: 'Dr. Agyemang',
//       status: 'Active'
//     },
//     {
//       id: 'AST-1002',
//       name: 'Ultrasound Machine',
//       assignedTo: 'Radiology Dept',
//       status: 'In Use'
//     },
//     {
//       id: 'AST-1003',
//       name: 'Patient Monitor',
//       assignedTo: 'Emergency Room',
//       status: 'Needs Repair'
//     },
//     {
//       id: 'AST-1004',
//       name: 'X-Ray Machine',
//       assignedTo: 'Unassigned',
//       status: 'Available'
//     }
//   ]);

//   // State for Add Asset modal
//   const [showModal, setShowModal] = useState(false);
//   const [showViewModal, setShowViewModal] = useState(false);
//   const [selectedAsset, setSelectedAsset] = useState(null);
//   const [newAsset, setNewAsset] = useState({
//     id: '',
//     name: '',
//     assignedTo: '',
//     status: 'Available'
//   });

//   // ✅ Pagination state
//   const [currentPage, setCurrentPage] = useState(1);
//   const entriesPerPage = 10;

//   // Handle input change
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setNewAsset(prev => ({ ...prev, [name]: value }));
//   };

//   // Submit new asset
//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!newAsset.name || !newAsset.assignedTo) {
//       alert('Please fill in required fields');
//       return;
//     }
//     // Generate new asset ID if not provided
//     const assetId = newAsset.id || `AST-${Math.floor(1000 + Math.random() * 9000)}`;
//     // Create new asset object
//     const assetToAdd = {
//       ...newAsset,
//       id: assetId
//     };
//     // Add to assets list
//     setAssets([...assets, assetToAdd]);
//     // Reset form
//     setNewAsset({
//       id: '',
//       name: '',
//       assignedTo: '',
//       status: 'Available'
//     });
//     setShowModal(false);
//   };

//   // Open add asset modal
//   const handleShowModal = () => {
//     setShowModal(true);
//   };

//   // Close add asset modal
//   const handleCloseModal = () => {
//     setShowModal(false);
//     setNewAsset({
//       id: '',
//       name: '',
//       assignedTo: '',
//       status: 'Available'
//     });
//   };

//   // Open view asset modal
//   const handleViewAsset = (asset) => {
//     setSelectedAsset(asset);
//     setShowViewModal(true);
//   };

//   // Close view asset modal
//   const handleCloseViewModal = () => {
//     setShowViewModal(false);
//     setSelectedAsset(null);
//   };

//   // Get status class for badge
//   const getStatusClass = (status) => {
//     switch (status) {
//       case 'Active':
//       case 'In Use':
//         return 'bg-success';
//       case 'Available':
//         return 'bg-info';
//       case 'Needs Repair':
//         return 'bg-warning';
//       case 'Decommissioned':
//         return 'bg-danger';
//       default:
//         return 'bg-secondary';
//     }
//   };

//   // ✅ Pagination logic
//   const totalPages = Math.ceil(assets.length / entriesPerPage);
//   const indexOfLastEntry = currentPage * entriesPerPage;
//   const currentEntries = assets.slice(indexOfLastEntry - entriesPerPage, indexOfLastEntry);

//   const handlePageChange = (page) => {
//     if (page >= 1 && page <= totalPages) {
//       setCurrentPage(page);
//     }
//   };

//   return (
//     <div className="container-fluid p-4" style={{ backgroundColor: '#ffff', minHeight: '100vh' }}>
//       {/* Header with H1 and Button */}
//       <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
//         <div>
//           <h1 className="mb-0">Assets</h1>
//           <p className="text-muted mb-0">Manage facility assets</p>
//         </div>
//         <button className="btn btn-primary d-flex align-items-center" onClick={handleShowModal}>
//           <i className="bi bi-plus me-1"></i> Add New Asset
//         </button>
//       </div>
//       <div className="card border-0 shadow-sm">
//         <div className="card-body p-0">
//           <div className="table-responsive">
//             <table className="table table-hover mb-0">
//               <thead className="table-light">
//                 <tr>
//                   <th scope="col">Asset ID</th>
//                   <th scope="col">Name</th>
//                   <th scope="col">Assigned To</th>
//                   <th scope="col">Status</th>
//                   <th scope="col">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {currentEntries.length > 0 ? (
//                   currentEntries.map((asset) => (
//                     <tr key={asset.id}>
//                       <td className="fw-medium">{asset.id}</td>
//                       <td>{asset.name}</td>
//                       <td>{asset.assignedTo}</td>
//                       <td>
//                         <span className={`badge ${getStatusClass(asset.status)} text-white`}>
//                           {asset.status}
//                         </span>
//                       </td>
//                       <td>
//                         <button
//                           type="button"
//                           className="btn btn-sm btn-outline-primary d-flex align-items-center"
//                           title="View Details"
//                           onClick={() => handleViewAsset(asset)}
//                         >
//                           <i className="bi bi-eye"></i>
//                         </button>
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan="5" className="text-center py-4 text-muted">
//                       No assets found.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//       {/* ✅ PAGINATION UI — Same as your other components */}
//       <div className="d-flex justify-content-end mt-3">
//         <nav>
//           <ul className="pagination mb-3">
//             <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
//               <button
//                 className="page-link"
//                 onClick={() => handlePageChange(currentPage - 1)}
//                 disabled={currentPage === 1}
//               >
//                 Previous
//               </button>
//             </li>

//             {[...Array(totalPages)].map((_, i) => {
//               const page = i + 1;
//               return (
//                 <li
//                   key={page}
//                   className={`page-item ${currentPage === page ? 'active' : ''}`}
//                 >
//                   <button
//                     className="page-link"
//                     onClick={() => handlePageChange(page)}
//                   >
//                     {page}
//                   </button>
//                 </li>
//               );
//             })}

//             <li className={`page-item ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}`}>
//               <button
//                 className="page-link"
//                 onClick={() => handlePageChange(currentPage + 1)}
//                 disabled={currentPage === totalPages || totalPages === 0}
//               >
//                 Next
//               </button>
//             </li>
//           </ul>
//         </nav>
//       </div>

//       {/* Add New Asset Modal */}
//       <Modal show={showModal} onHide={handleCloseModal} size="lg" centered backdrop="static">
//         <Modal.Header closeButton>
//           <Modal.Title>Add New Asset</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form onSubmit={handleSubmit}>
//             <Row className="mb-3">
//               <Col md={6}>
//                 <Form.Group>
//                   <Form.Label>Asset ID <span className="text-muted">(Optional)</span></Form.Label>
//                   <Form.Control
//                     type="text"
//                     placeholder="e.g., AST-1005"
//                     name="id"
//                     value={newAsset.id}
//                     onChange={handleInputChange}
//                   />
//                 </Form.Group>
//               </Col>
//               <Col md={6}>
//                 <Form.Group>
//                   <Form.Label>Name <span className="text-danger">*</span></Form.Label>
//                   <Form.Control
//                     type="text"
//                     placeholder="e.g., Defibrillator"
//                     name="name"
//                     value={newAsset.name}
//                     onChange={handleInputChange}
//                     required
//                   />
//                 </Form.Group>
//               </Col>
//             </Row>
//             <Row className="mb-3">
//               <Col md={6}>
//                 <Form.Group>
//                   <Form.Label>Assigned To <span className="text-danger">*</span></Form.Label>
//                   <Form.Control
//                     type="text"
//                     placeholder="e.g., ICU, Dr. Mensah"
//                     name="assignedTo"
//                     value={newAsset.assignedTo}
//                     onChange={handleInputChange}
//                     required
//                   />
//                 </Form.Group>
//               </Col>
//               <Col md={6}>
//                 <Form.Group>
//                   <Form.Label>Status</Form.Label>
//                   <Form.Select
//                     name="status"
//                     value={newAsset.status}
//                     onChange={handleInputChange}
//                   >
//                     <option value="Available">Available</option>
//                     <option value="Active">Active</option>
//                     <option value="In Use">In Use</option>
//                     <option value="Needs Repair">Needs Repair</option>
//                     <option value="Decommissioned">Decommissioned</option>
//                   </Form.Select>
//                 </Form.Group>
//               </Col>
//             </Row>
//           </Form>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={handleCloseModal}>
//             Cancel
//           </Button>
//           <Button variant="primary" onClick={handleSubmit}>
//             Add Asset
//           </Button>
//         </Modal.Footer>
//       </Modal>

//       {/* View Asset Details Modal */}
//       <Modal show={showViewModal} onHide={handleCloseViewModal} size="md" centered>
//         <Modal.Header closeButton>
//           <Modal.Title>Asset Details</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           {selectedAsset && (
//             <div className="row">
//               <div className="col-12 mb-3">
//                 <strong>Asset ID:</strong> <span className="text-muted">{selectedAsset.id}</span>
//               </div>
//               <div className="col-12 mb-3">
//                 <strong>Name:</strong> <span className="text-muted">{selectedAsset.name}</span>
//               </div>
//               <div className="col-12 mb-3">
//                 <strong>Assigned To:</strong> <span className="text-muted">{selectedAsset.assignedTo}</span>
//               </div>
//               <div className="col-12 mb-3">
//                 <strong>Status:</strong>
//                 <span className={`badge ${getStatusClass(selectedAsset.status)} text-white ms-2`}>
//                   {selectedAsset.status}
//                 </span>
//               </div>
//             </div>
//           )}
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={handleCloseViewModal}>
//             Close
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </div>
//   );
// };

// export default FacilityAssets;

import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Modal, Form, Row, Col, Button, Alert } from "react-bootstrap";

const FacilityAssets = () => {
  // Enhanced assets data with more fields
  const [assets, setAssets] = useState([
    {
      id: "AST-1001",
      name: "Ventilator",
      category: "Medical",
      manufacturer: "Medtronic",
      modelNumber: "V-200",
      serialNumber: "SN987654321",
      purchaseDate: "2022-05-15",
      warrantyExpiry: "2027-05-15",
      assignedTo: "Dr. Agyemang",
      location: "ICU",
      status: "Active",
      maintenanceSchedule: "Quarterly",
      notes: "Used in critical care",
    },
    {
      id: "AST-1002",
      name: "Ultrasound Machine",
      category: "Medical",
      manufacturer: "GE Healthcare",
      modelNumber: "LOGIQ E10",
      serialNumber: "SN112233445",
      purchaseDate: "2021-11-10",
      warrantyExpiry: "2026-11-10",
      assignedTo: "Radiology Dept",
      location: "Radiology Wing",
      status: "In Use",
      maintenanceSchedule: "Bi-Annual",
      notes: "High usage machine",
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  // Existing state ke baad add karein
  const [grnList, setGrnList] = useState([]); // Good Receipt Notes
  const [showGrnModal, setShowGrnModal] = useState(false);
  const [selectedGrn, setSelectedGrn] = useState(null);
  const [verifiedAssets, setVerifiedAssets] = useState(new Set()); // For bulk verification
  // Enhanced new asset state
  const [newAsset, setNewAsset] = useState({
    id: "",
    name: "",
    category: "Medical",
    manufacturer: "",
    modelNumber: "",
    serialNumber: "",
    purchaseDate: "",
    warrantyExpiry: "",
    assignedTo: "",
    location: "",
    status: "Available",
    maintenanceSchedule: "As Needed",
    notes: "",
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 10;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAsset((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const requiredFields = ["name", "category", "assignedTo", "location"];
    const missing = requiredFields.filter((field) => !newAsset[field]?.trim());
    if (missing.length > 0) {
      alert(
        "Please fill in all required fields: Name, Category, Assigned To, and Location."
      );
      return;
    }

    const assetId =
      newAsset.id || `AST-${Math.floor(1000 + Math.random() * 9000)}`;
    const assetToAdd = { ...newAsset, id: assetId };
    setAssets([...assets, assetToAdd]);

    // Reset form
    setNewAsset({
      id: "",
      name: "",
      category: "Medical",
      manufacturer: "",
      modelNumber: "",
      serialNumber: "",
      purchaseDate: "",
      warrantyExpiry: "",
      assignedTo: "",
      location: "",
      status: "Available",
      maintenanceSchedule: "As Needed",
      notes: "",
    });
    setShowModal(false);
  };

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    setNewAsset({
      id: "",
      name: "",
      category: "Medical",
      manufacturer: "",
      modelNumber: "",
      serialNumber: "",
      purchaseDate: "",
      warrantyExpiry: "",
      assignedTo: "",
      location: "",
      status: "Available",
      maintenanceSchedule: "As Needed",
      notes: "",
    });
  };

  const handleViewAsset = (asset) => {
    setSelectedAsset(asset);
    setShowViewModal(true);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setSelectedAsset(null);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Active":
      case "In Use":
        return "bg-success";
      case "Available":
        return "bg-info";
      case "Needs Repair":
        return "bg-warning";
      case "Decommissioned":
        return "bg-danger";
      default:
        return "bg-secondary";
    }
  };

  // Pagination
  const totalPages = Math.ceil(assets.length / entriesPerPage);
  const indexOfLastEntry = currentPage * entriesPerPage;
  const currentEntries = assets.slice(
    indexOfLastEntry - entriesPerPage,
    indexOfLastEntry
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <div className="">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h3 className="mb-0">Assets</h3>
          <p className="text-muted mb-0">
            Manage facility equipment and assets
          </p>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-success"
            onClick={() => setShowGrnModal(true)}
          >
            <i className="bi bi-box-arrow-in-right me-1"></i> Good Receipt (GRN)
          </button>
          <button
            className="btn btn-primary d-flex align-items-center"
            onClick={handleShowModal}
          >
            <i className="bi bi-plus me-1"></i> Add New Asset
          </button>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: "40px" }}>
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setVerifiedAssets(
                            new Set(currentEntries.map((a) => a.id))
                          );
                        } else {
                          setVerifiedAssets(new Set());
                        }
                      }}
                      checked={
                        verifiedAssets.size === currentEntries.length &&
                        currentEntries.length > 0
                      }
                    />
                  </th>
                  <th>Asset ID</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Assigned To</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentEntries.length > 0 ? (
                  currentEntries.map((asset) => (
                    <tr key={asset.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={verifiedAssets.has(asset.id)}
                          onChange={(e) => {
                            const newSet = new Set(verifiedAssets);
                            if (e.target.checked) newSet.add(asset.id);
                            else newSet.delete(asset.id);
                            setVerifiedAssets(newSet);
                          }}
                        />
                      </td>
                      <td className="fw-medium">{asset.id}</td>
                      <td>{asset.name}</td>
                      <td>{asset.category}</td>
                      <td>{asset.assignedTo}</td>
                      <td>{asset.location}</td>
                      <td>
                        <span
                          className={`badge ${getStatusClass(
                            asset.status
                          )} text-white`}
                        >
                          {asset.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleViewAsset(asset)}
                          title="View Details"
                        >
                          <i className="bi bi-eye"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-muted">
                      No assets found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {verifiedAssets.size > 0 && (
        <div className="mb-3">
          <button
            className="btn btn-success"
            onClick={() => {
              alert(`Verified ${verifiedAssets.size} assets`);
              setVerifiedAssets(new Set());
            }}
          >
            Verify Selected ({verifiedAssets.size})
          </button>
        </div>
      )}
      {/* Pagination */}
      <div className="d-flex justify-content-end mt-3">
        <nav>
          <ul className="pagination mb-3">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
            </li>
            {[...Array(totalPages)].map((_, i) => (
              <li
                key={i + 1}
                className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => handlePageChange(i + 1)}
                >
                  {i + 1}
                </button>
              </li>
            ))}
            <li
              className={`page-item ${
                currentPage === totalPages || totalPages === 0 ? "disabled" : ""
              }`}
            >
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

      {/* Add New Asset Modal */}
      <Modal
        show={showModal}
        onHide={handleCloseModal}
        size="lg"
        centered
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>Add New Asset</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    Asset ID <span className="text-muted">(Optional)</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., AST-1005"
                    name="id"
                    value={newAsset.id}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    Name <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., Defibrillator"
                    name="name"
                    value={newAsset.name}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    Category <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    name="category"
                    value={newAsset.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Medical">Medical Equipment</option>
                    <option value="IT">IT & Electronics</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Lab">Laboratory</option>
                    <option value="Other">Other</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Manufacturer</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., Philips, Siemens"
                    name="manufacturer"
                    value={newAsset.manufacturer}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Model Number</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., MX750"
                    name="modelNumber"
                    value={newAsset.modelNumber}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Serial Number</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Unique identifier"
                    name="serialNumber"
                    value={newAsset.serialNumber}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Purchase Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="purchaseDate"
                    value={newAsset.purchaseDate}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Warranty Expiry</Form.Label>
                  <Form.Control
                    type="date"
                    name="warrantyExpiry"
                    value={newAsset.warrantyExpiry}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    Assigned To <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., Dr. Mensah, ICU Team"
                    name="assignedTo"
                    value={newAsset.assignedTo}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    Location <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., Ward 3, Lab Room 2"
                    name="location"
                    value={newAsset.location}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    name="status"
                    value={newAsset.status}
                    onChange={handleInputChange}
                  >
                    <option value="Available">Available</option>
                    <option value="Active">Active</option>
                    <option value="In Use">In Use</option>
                    <option value="Needs Repair">Needs Repair</option>
                    <option value="Decommissioned">Decommissioned</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Maintenance Schedule</Form.Label>
                  <Form.Select
                    name="maintenanceSchedule"
                    value={newAsset.maintenanceSchedule}
                    onChange={handleInputChange}
                  >
                    <option value="As Needed">As Needed</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Bi-Annual">Bi-Annual</option>
                    <option value="Annual">Annual</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col>
                <Form.Group>
                  <Form.Label>Notes</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Additional information..."
                    name="notes"
                    value={newAsset.notes}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Add Asset
          </Button>
        </Modal.Footer>
      </Modal>

      {/* View Asset Modal */}
      <Modal
        show={showViewModal}
        onHide={handleCloseViewModal}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Asset Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedAsset && (
            <div className="row g-3">
              <Col md={6}>
                <strong>Asset ID:</strong>{" "}
                <span className="text-muted">{selectedAsset.id}</span>
              </Col>
              <Col md={6}>
                <strong>Name:</strong>{" "}
                <span className="text-muted">{selectedAsset.name}</span>
              </Col>
              <Col md={6}>
                <strong>Category:</strong>{" "}
                <span className="text-muted">{selectedAsset.category}</span>
              </Col>
              <Col md={6}>
                <strong>Manufacturer:</strong>{" "}
                <span className="text-muted">
                  {selectedAsset.manufacturer || "—"}
                </span>
              </Col>
              <Col md={6}>
                <strong>Model No.:</strong>{" "}
                <span className="text-muted">
                  {selectedAsset.modelNumber || "—"}
                </span>
              </Col>
              <Col md={6}>
                <strong>Serial No.:</strong>{" "}
                <span className="text-muted">
                  {selectedAsset.serialNumber || "—"}
                </span>
              </Col>
              <Col md={6}>
                <strong>Purchase Date:</strong>{" "}
                <span className="text-muted">
                  {selectedAsset.purchaseDate || "—"}
                </span>
              </Col>
              <Col md={6}>
                <strong>Warranty Expiry:</strong>{" "}
                <span className="text-muted">
                  {selectedAsset.warrantyExpiry || "—"}
                </span>
              </Col>
              <Col md={6}>
                <strong>Assigned To:</strong>{" "}
                <span className="text-muted">{selectedAsset.assignedTo}</span>
              </Col>
              <Col md={6}>
                <strong>Location:</strong>{" "}
                <span className="text-muted">{selectedAsset.location}</span>
              </Col>
              <Col md={6}>
                <strong>Status:</strong>
                <span
                  className={`badge ${getStatusClass(
                    selectedAsset.status
                  )} text-white ms-2`}
                >
                  {selectedAsset.status}
                </span>
              </Col>
              <Col md={6}>
                <strong>Maintenance:</strong>{" "}
                <span className="text-muted">
                  {selectedAsset.maintenanceSchedule}
                </span>
              </Col>
              <Col md={12}>
                <strong>Notes:</strong>{" "}
                <span className="text-muted">{selectedAsset.notes || "—"}</span>
              </Col>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseViewModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ===== GOOD RECEIPT (GRN) MODAL ===== */}
      <Modal
        show={showGrnModal}
        onHide={() => setShowGrnModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Good Receipt Note (GRN)</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted">Verify assets received from warehouse</p>
          <table className="table">
            <thead>
              <tr>
                <th>Asset Name</th>
                <th>Requested Qty</th>
                <th>Delivered Qty</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Ventilator V-200</td>
                <td>2</td>
                <td>
                  <Form.Control type="number" defaultValue="2" min="0" />
                </td>
                <td>
                  <span className="badge bg-success text-white">Match</span>
                </td>
              </tr>
              <tr>
                <td>Ultrasound Machine</td>
                <td>1</td>
                <td>
                  <Form.Control type="number" defaultValue="0" min="0" />
                </td>
                <td>
                  <span className="badge bg-warning text-dark">Partial</span>
                </td>
              </tr>
            </tbody>
          </table>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowGrnModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              alert("GRN verified and assets updated!");
              setShowGrnModal(false);
            }}
          >
            Verify & Accept
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default FacilityAssets;
