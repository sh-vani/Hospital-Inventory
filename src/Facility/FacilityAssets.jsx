import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Modal, Form, Row, Col, Button } from 'react-bootstrap'; // ✅ FIXED: Added missing import

const FacilityAssets = () => {
  const [assets, setAssets] = useState([
    {
      id: 'AST-1001',
      name: 'Ventilator',
      category: 'Medical Equipment',
      department: 'ICU',
      status: 'In Use',
      condition: 'Good',
      lastMaintenance: '15 Oct 2023',
      actions: ['View', 'Maintain']
    },
    {
      id: 'AST-1002',
      name: 'Ultrasound Machine',
      category: 'Diagnostic',
      department: 'Radiology',
      status: 'In Use',
      condition: 'Fair',
      lastMaintenance: '20 Sep 2023',
      actions: ['View', 'Maintain']
    },
    {
      id: 'AST-1003',
      name: 'Patient Monitor',
      category: 'Medical Equipment',
      department: 'Emergency',
      status: 'Under Maintenance',
      condition: 'Needs Repair',
      lastMaintenance: '05 Oct 2023',
      actions: ['View', 'Maintain', 'Complete']
    }
  ]);

  const handleAction = (assetId, action) => {
    alert(`Action: ${action} for Asset ID: ${assetId}`);
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'In Use':
        return 'bg-success';
      case 'Under Maintenance':
        return 'bg-warning';
      default:
        return 'bg-secondary';
    }
  };

  const getConditionClass = (condition) => {
    switch(condition) {
      case 'Good':
        return 'bg-success';
      case 'Fair':
        return 'bg-warning';
      case 'Needs Repair':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  // Form state for new asset
  const [newAsset, setNewAsset] = useState({
    id: '',
    name: '',
    category: '',
    department: '',
    status: 'In Use',
    condition: 'Good',
    lastMaintenance: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAsset(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newAsset.name || !newAsset.category || !newAsset.department) {
      alert('Please fill in required fields');
      return;
    }

    // Add new asset to list
    const updatedAssets = [...assets, { ...newAsset, id: `AST-${Math.floor(1000 + Math.random() * 9000)}` }];
    setAssets(updatedAssets);
    
    // Reset form
    setNewAsset({
      id: '',
      name: '',
      category: '',
      department: '',
      status: 'In Use',
      condition: 'Good',
      lastMaintenance: ''
    });
    
    handleCloseModal();
  };

  return (
    <div className="container-fluid p-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header with H1 and Button */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Assets Management</h1>
        <button className="btn btn-primary btn-sm fs-6" onClick={handleShowModal}>
          <i className="bi bi-plus me-1"></i> Add New Asset
        </button>
      </div>
      
      <div className="">
        <div className="card-header text-dark">
          <h5 className="mb-0 fs-3">Hospital Assets</h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-light">
                <tr>
                  <th scope="col">Asset ID</th>
                  <th scope="col">Name</th>
                  <th scope="col">Category</th>
                  <th scope="col">Department</th>
                  <th scope="col">Status</th>
                  <th scope="col">Condition</th>
                  <th scope="col">Last Maintenance</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((asset) => (
                  <tr key={asset.id}>
                    <td>{asset.id}</td>
                    <td>{asset.name}</td>
                    <td>{asset.category}</td>
                    <td>{asset.department}</td>
                    <td>
                      <span className={`badge ${getStatusClass(asset.status)}`}>
                        {asset.status}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${getConditionClass(asset.condition)}`}>
                        {asset.condition}
                      </span>
                    </td>
                    <td>{asset.lastMaintenance}</td>
                    <td>
                      <div className="btn-group" role="group">
                        {asset.actions.map((action, index) => (
                          <button
                            key={index}
                            type="button"
                            className={`btn btn-sm ${
                              action === 'Complete' ? 'btn-success' : 'btn-outline-primary'
                            }`}
                            onClick={() => handleAction(asset.id, action)}
                          >
                            {action}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add New Asset Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Add New Asset</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Asset ID</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., AST-1004"
                    name="id"
                    value={newAsset.id}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., X-Ray Machine"
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
                  <Form.Label>Category</Form.Label>
                  <Form.Select
                    name="category"
                    value={newAsset.category}
                    onChange={handleInputChange}
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
                  <Form.Label>Department</Form.Label>
                  <Form.Select
                    name="department"
                    value={newAsset.department}
                    onChange={handleInputChange}
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
                    <option value="In Use">In Use</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                    <option value="Out of Service">Out of Service</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Condition</Form.Label>
                  <Form.Select
                    name="condition"
                    value={newAsset.condition}
                    onChange={handleInputChange}
                  >
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Needs Repair">Needs Repair</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Last Maintenance Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="lastMaintenance"
                    value={newAsset.lastMaintenance}
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
    </div>
  );
};

export default FacilityAssets;