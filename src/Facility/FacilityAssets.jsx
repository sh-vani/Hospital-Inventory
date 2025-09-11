import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Modal, Form, Row, Col, Button, Tabs, Tab } from 'react-bootstrap';

const FacilityAssets = () => {
  // Asset state with all required fields
  const [assets, setAssets] = useState([
    {
      id: 'AST-1001',
      category: 'Medical Equipment',
      description: 'ICU Ventilator Model X',
      serial: 'VN739284',
      location: 'ICU Room 101',
      assignedDept: 'ICU',
      cost: '12500',
      vendor: 'MedTech Solutions',
      warrantyEnd: '2025-12-31',
      maintenanceSchedule: '2024-06-15',
      condition: 'Good',
      attachments: []
    },
    {
      id: 'AST-1002',
      category: 'Diagnostic',
      description: 'Portable Ultrasound Machine',
      serial: 'USL48392',
      location: 'Radiology Lab',
      assignedDept: 'Radiology',
      cost: '28500',
      vendor: 'Imaging Dynamics',
      warrantyEnd: '2026-03-15',
      maintenanceSchedule: '2024-07-20',
      condition: 'Fair',
      attachments: []
    }
  ]);

  // Movement logs state
  const [movementLogs, setMovementLogs] = useState([
    {
      assetId: 'AST-1001',
      date: '2023-10-15',
      fromLocation: 'Storage',
      toLocation: 'ICU Room 101',
      reason: 'Initial deployment',
      handledBy: 'John Smith'
    },
    {
      assetId: 'AST-1002',
      date: '2023-09-20',
      fromLocation: 'Receiving',
      toLocation: 'Radiology Lab',
      reason: 'New equipment setup',
      handledBy: 'Sarah Johnson'
    }
  ]);

  // Maintenance logs state
  const [maintenanceLogs, setMaintenanceLogs] = useState([
    {
      assetId: 'AST-1001',
      date: '2023-10-15',
      technician: 'Mike Wilson',
      cost: '350',
      notes: 'Routine maintenance completed',
      attachment: ''
    },
    {
      assetId: 'AST-1002',
      date: '2023-09-20',
      technician: 'Lisa Chen',
      cost: '200',
      notes: 'Calibration and software update',
      attachment: 'report.pdf'
    }
  ]);

  // Modal states
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [selectedMovementLogs, setSelectedMovementLogs] = useState([]);
  const [selectedMaintenanceLogs, setSelectedMaintenanceLogs] = useState([]);

  // Form state for new asset
  const [newAsset, setNewAsset] = useState({
    category: '',
    description: '',
    serial: '',
    location: '',
    assignedDept: '',
    cost: '',
    vendor: '',
    warrantyEnd: '',
    maintenanceSchedule: '',
    condition: 'Good',
    attachments: []
  });

  // Form state for editing asset
  const [editAsset, setEditAsset] = useState({});

  // Handle view movement log
  const handleViewMovementLog = (assetId) => {
    const logs = movementLogs.filter(log => log.assetId === assetId);
    setSelectedMovementLogs(logs);
    setShowMovementModal(true);
  };

  // Handle view asset details
  const handleViewAsset = (asset) => {
    setSelectedAsset(asset);
    const logs = maintenanceLogs.filter(log => log.assetId === asset.id);
    setSelectedMaintenanceLogs(logs);
    setShowAssetModal(true);
  };

  // Handle edit asset
  const handleEditAsset = (asset) => {
    setEditAsset({...asset});
    setShowEditModal(true);
  };

  // Handle input change for new asset
  const handleNewAssetChange = (e) => {
    const { name, value } = e.target;
    setNewAsset(prev => ({ ...prev, [name]: value }));
  };

  // Handle input change for edit asset
  const handleEditAssetChange = (e) => {
    const { name, value } = e.target;
    setEditAsset(prev => ({ ...prev, [name]: value }));
  };

  // Submit new asset
  const handleSubmitNewAsset = (e) => {
    e.preventDefault();
    const assetToAdd = {
      ...newAsset,
      id: `AST-${Math.floor(1000 + Math.random() * 9000)}`
    };
    setAssets([...assets, assetToAdd]);
    setNewAsset({
      category: '',
      description: '',
      serial: '',
      location: '',
      assignedDept: '',
      cost: '',
      vendor: '',
      warrantyEnd: '',
      maintenanceSchedule: '',
      condition: 'Good',
      attachments: []
    });
    setShowEditModal(false);
  };

  // Submit edited asset
  const handleSubmitEditAsset = (e) => {
    e.preventDefault();
    const updatedAssets = assets.map(asset => 
      asset.id === editAsset.id ? editAsset : asset
    );
    setAssets(updatedAssets);
    setShowEditModal(false);
  };

  // Get condition badge class
  const getConditionClass = (condition) => {
    switch(condition) {
      case 'Good':
        return 'bg-success';
      case 'Fair':
        return 'bg-warning';
      case 'Poor':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };

  return (
    <div className="container-fluid p-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Assets Management</h1>
        <button className="btn btn-primary btn-sm fs-6" onClick={() => setShowEditModal(true)}>
          <i className="bi bi-plus me-1"></i> Add New Asset
        </button>
      </div>
      
      {/* Asset Table */}
      <div className="card">
        <div className="card-header text-dark">
          <h5 className="mb-0 fs-3">Hospital Assets</h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-light">
                <tr>
                  <th scope="col">Code</th>
                  <th scope="col">Category</th>
                  <th scope="col">Description</th>
                  <th scope="col">Serial/IMEI</th>
                  <th scope="col">Location</th>
                  <th scope="col">Assigned Dept</th>
                  <th scope="col">Cost</th>
                  <th scope="col">Vendor</th>
                  <th scope="col">Warranty End</th>
                  <th scope="col">Maintenance</th>
                  <th scope="col">Condition</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((asset) => (
                  <tr key={asset.id}>
                    <td>{asset.id}</td>
                    <td>{asset.category}</td>
                    <td>{asset.description}</td>
                    <td>{asset.serial}</td>
                    <td>{asset.location}</td>
                    <td>{asset.assignedDept}</td>
                    <td>${asset.cost}</td>
                    <td>{asset.vendor}</td>
                    <td>{asset.warrantyEnd}</td>
                    <td>{asset.maintenanceSchedule}</td>
                    <td>
                      <span className={`badge ${getConditionClass(asset.condition)}`}>
                        {asset.condition}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleViewAsset(asset)}
                        >
                          <i className="bi bi-eye"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => handleEditAsset(asset)}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-info"
                          onClick={() => handleViewMovementLog(asset.id)}
                        >
                          <i className="bi bi-arrows-move"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Movement Log Modal */}
      <Modal show={showMovementModal} onHide={() => setShowMovementModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Asset Movement Log</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>From Location</th>
                  <th>To Location</th>
                  <th>Reason</th>
                  <th>Handled By</th>
                </tr>
              </thead>
              <tbody>
                {selectedMovementLogs.map((log, index) => (
                  <tr key={index}>
                    <td>{log.date}</td>
                    <td>{log.fromLocation}</td>
                    <td>{log.toLocation}</td>
                    <td>{log.reason}</td>
                    <td>{log.handledBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowMovementModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Asset Details Modal */}
      <Modal show={showAssetModal} onHide={() => setShowAssetModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Asset Details: {selectedAsset?.id}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Tabs defaultActiveKey="details" id="asset-tabs">
            <Tab eventKey="details" title="Asset Details">
              <div className="mt-3">
                <Row className="mb-3">
                  <Col md={6}>
                    <p><strong>Code:</strong> {selectedAsset?.id}</p>
                    <p><strong>Category:</strong> {selectedAsset?.category}</p>
                    <p><strong>Description:</strong> {selectedAsset?.description}</p>
                    <p><strong>Serial/IMEI:</strong> {selectedAsset?.serial}</p>
                    <p><strong>Location:</strong> {selectedAsset?.location}</p>
                  </Col>
                  <Col md={6}>
                    <p><strong>Assigned Dept:</strong> {selectedAsset?.assignedDept}</p>
                    <p><strong>Cost:</strong> ${selectedAsset?.cost}</p>
                    <p><strong>Vendor:</strong> {selectedAsset?.vendor}</p>
                    <p><strong>Warranty End:</strong> {selectedAsset?.warrantyEnd}</p>
                    <p><strong>Maintenance Schedule:</strong> {selectedAsset?.maintenanceSchedule}</p>
                    <p><strong>Condition:</strong> 
                      <span className={`badge ${getConditionClass(selectedAsset?.condition)} ms-2`}>
                        {selectedAsset?.condition}
                      </span>
                    </p>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <p><strong>Attachments:</strong></p>
                    {selectedAsset?.attachments?.length > 0 ? (
                      <ul>
                        {selectedAsset.attachments.map((file, index) => (
                          <li key={index}>{file}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>No attachments</p>
                    )}
                  </Col>
                </Row>
              </div>
            </Tab>
            <Tab eventKey="maintenance" title="Maintenance Log">
              <div className="mt-3">
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Technician</th>
                        <th>Cost</th>
                        <th>Notes</th>
                        <th>Attachment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedMaintenanceLogs.map((log, index) => (
                        <tr key={index}>
                          <td>{log.date}</td>
                          <td>{log.technician}</td>
                          <td>${log.cost}</td>
                          <td>{log.notes}</td>
                          <td>
                            {log.attachment ? (
                              <a href={`#${log.attachment}`} className="btn btn-sm btn-outline-primary">
                                <i className="bi bi-file-earmark-pdf"></i> View
                              </a>
                            ) : 'None'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Tab>
          </Tabs>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAssetModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add/Edit Asset Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editAsset.id ? 'Edit Asset' : 'Add New Asset'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={editAsset.id ? handleSubmitEditAsset : handleSubmitNewAsset}>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Category</Form.Label>
                  <Form.Select
                    name="category"
                    value={editAsset.id ? editAsset.category : newAsset.category}
                    onChange={editAsset.id ? handleEditAssetChange : handleNewAssetChange}
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Medical Equipment">Medical Equipment</option>
                    <option value="Diagnostic">Diagnostic</option>
                    <option value="Furniture">Furniture</option>
                    <option value="IT Equipment">IT Equipment</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Location</Form.Label>
                  <Form.Select
                    name="location"
                    value={editAsset.id ? editAsset.location : newAsset.location}
                    onChange={editAsset.id ? handleEditAssetChange : handleNewAssetChange}
                    required
                  >
                    <option value="">Select Location</option>
                    <option value="ICU Room 101">ICU Room 101</option>
                    <option value="ICU Room 102">ICU Room 102</option>
                    <option value="Radiology Lab">Radiology Lab</option>
                    <option value="Emergency Room">Emergency Room</option>
                    <option value="Pharmacy">Pharmacy</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Assigned Department</Form.Label>
                  <Form.Select
                    name="assignedDept"
                    value={editAsset.id ? editAsset.assignedDept : newAsset.assignedDept}
                    onChange={editAsset.id ? handleEditAssetChange : handleNewAssetChange}
                    required
                  >
                    <option value="">Select Department</option>
                    <option value="ICU">ICU</option>
                    <option value="Radiology">Radiology</option>
                    <option value="Emergency">Emergency</option>
                    <option value="Surgery">Surgery</option>
                    <option value="Pharmacy">Pharmacy</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Condition</Form.Label>
                  <Form.Select
                    name="condition"
                    value={editAsset.id ? editAsset.condition : newAsset.condition}
                    onChange={editAsset.id ? handleEditAssetChange : handleNewAssetChange}
                  >
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    type="text"
                    name="description"
                    value={editAsset.id ? editAsset.description : newAsset.description}
                    onChange={editAsset.id ? handleEditAssetChange : handleNewAssetChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Serial/IMEI</Form.Label>
                  <Form.Control
                    type="text"
                    name="serial"
                    value={editAsset.id ? editAsset.serial : newAsset.serial}
                    onChange={editAsset.id ? handleEditAssetChange : handleNewAssetChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Cost ($)</Form.Label>
                  <Form.Control
                    type="number"
                    name="cost"
                    value={editAsset.id ? editAsset.cost : newAsset.cost}
                    onChange={editAsset.id ? handleEditAssetChange : handleNewAssetChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Vendor</Form.Label>
                  <Form.Control
                    type="text"
                    name="vendor"
                    value={editAsset.id ? editAsset.vendor : newAsset.vendor}
                    onChange={editAsset.id ? handleEditAssetChange : handleNewAssetChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Warranty End Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="warrantyEnd"
                    value={editAsset.id ? editAsset.warrantyEnd : newAsset.warrantyEnd}
                    onChange={editAsset.id ? handleEditAssetChange : handleNewAssetChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Maintenance Schedule</Form.Label>
                  <Form.Control
                    type="date"
                    name="maintenanceSchedule"
                    value={editAsset.id ? editAsset.maintenanceSchedule : newAsset.maintenanceSchedule}
                    onChange={editAsset.id ? handleEditAssetChange : handleNewAssetChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Attachments</Form.Label>
                  <Form.Control
                    type="file"
                    name="attachments"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={editAsset.id ? handleSubmitEditAsset : handleSubmitNewAsset}
          >
            {editAsset.id ? 'Update Asset' : 'Add Asset'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default FacilityAssets;