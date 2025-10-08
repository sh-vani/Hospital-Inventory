import React, { useState } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const FacilityDashboard = () => {
  // KPI values (mocked for now, replace with real data later)
  const [kpis] = useState({
    facilityStock: 1248,
    pendingReqs: 42,
    dispatched: 310,
    outOfStock: 15,
    nearExpiry: 8,
    lowStock: 22,
  });

  // Top 5 requested items data
  const topRequestedData = {
    labels: ['Paracetamol', 'Gloves', 'Syringes', 'Bandages', 'Ibuprofen'],
    datasets: [
      {
        label: 'Requests',
        data: [120, 95, 80, 75, 60],
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Top 5 Requested Items',
      },
    },
  };

  // Reusable card style generator
  const cardStyle = (color) => ({
    backgroundColor: `${color}1A`, // 10% opacity (hex 1A = ~10%)
    border: `1px solid ${color}40`,
    borderRadius: '16px',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
    color: color,
  });

  return (
    <div className="">
      {/* Header */}
      <Row className="mb-4 align-items-center">
        <Col>
          <h3 className="fw-bold mb-0">Facility Dashboard</h3>
        </Col>
      </Row>

      {/* KPI Cards Row 1 */}
      <Row className="g-4 mb-4">
        <Col md={4}>
          <Card style={cardStyle('#0d6efd')} className="h-100">
            <Card.Body>
              <Card.Title className="fw-semibold">Facility Stock</Card.Title>
              <Card.Text className="display-6 fw-bold">{kpis.facilityStock}</Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card style={cardStyle('#6610f2')} className="h-100">
            <Card.Body>
              <Card.Title className="fw-semibold">Pending User Reqs</Card.Title>
              <Card.Text className="display-6 fw-bold">{kpis.pendingReqs}</Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card style={cardStyle('#198754')} className="h-100">
            <Card.Body>
              <Card.Title className="fw-semibold">Dispatched from Warehouse</Card.Title>
              <Card.Text className="display-6 fw-bold">{kpis.dispatched}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* KPI Cards Row 2 */}
      <Row className="g-4 mb-4">
        <Col md={4}>
          <Card style={cardStyle('#dc3545')} className="h-100">
            <Card.Body>
              <Card.Title className="fw-semibold">Out of Stock</Card.Title>
              <Card.Text className="display-6 fw-bold">{kpis.outOfStock}</Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card style={cardStyle('#ffc107')} className="h-100">
            <Card.Body>
              <Card.Title className="fw-semibold">Near Expiry Stock</Card.Title>
              <Card.Text className="display-6 fw-bold">{kpis.nearExpiry}</Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card style={cardStyle('#0dcaf0')} className="h-100">
            <Card.Body>
              <Card.Title className="fw-semibold">Low Stock</Card.Title>
              <Card.Text className="display-6 fw-bold">{kpis.lowStock}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Graph Section */}
      <Row>
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <Card.Title className="fw-semibold mb-3">Requests Analytics</Card.Title>
              <div style={{ height: '400px' }}>
                <Bar data={topRequestedData} options={chartOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default FacilityDashboard;
