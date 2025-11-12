import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Spinner, Table } from 'react-bootstrap';
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
import BaseUrl from "../../src/Api/BaseUrl";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const FacilityDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    facility_items: 0,
    total_stock: "0",
    low_stock_items: 0,
    pending_user_requests: 0,
    today_requests: 0,
    incoming_dispatches: 0,
    facility_users: 0,
    facility_assets: 0,
  });
  const [lowStockItems, setLowStockItems] = useState([]);
  const [topRequestedItems, setTopRequestedItems] = useState([]);

  // === FETCH DASHBOARD DATA ===
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        let facilityId = null;
        const userStr = localStorage.getItem("user");
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            facilityId = user?.facility_id;
          } catch (e) {
            console.warn("Invalid user in localStorage");
          }
        }

        if (!facilityId) {
          setError("Facility ID not found. Please log in again.");
          setLoading(false);
          return;
        }

        const response = await fetch(`${BaseUrl}/dashboard/getFacilityAdminDashboard/${facilityId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success && result.data) {
          const apiData = result.data;

          // ✅ Map API field names to your state keys
          const mappedStats = {
            facility_items: apiData.total_items || 0,
            total_stock: apiData.total_stock || "0",
            pending_user_requests: apiData.pending_requests || 0,
            low_stock_items: apiData.low_stock_items || 0,
            today_requests: apiData.todays_requests || 0,
            incoming_dispatches: 0, // not in current API
            facility_users: apiData.facility_users || 0,
            facility_assets: 0, // not in current API
          };

          setStats(mappedStats);
          // ✅ API only returns counts, not item lists — so keep these empty for now
          setLowStockItems([]);
          setTopRequestedItems([]);
        } else {
          throw new Error("Invalid API response structure");
        }

        setLoading(false);
      } catch (err) {
        console.error("Dashboard API Error:", err);
        setError("Failed to load dashboard data. Please try again.");
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // === DYNAMIC CHART DATA (with safe fallbacks) ===
  const topRequestedChartData = {
    labels: topRequestedItems.length > 0
      ? topRequestedItems.map((item, index) => 
          item.item_name || item.item_code || `Item ${index + 1}`
        )
      : ['No data'],
    datasets: [
      {
        label: 'Requests',
        data: topRequestedItems.length > 0
          ? topRequestedItems.map(item => 
              item.total_requests || 
              item.request_count || 
              item.quantity || 
              0
            )
          : [0],
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
        text: 'Top Requested Items',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
  };

  const cardStyle = (color) => ({
    backgroundColor: `${color}1A`,
    border: `1px solid ${color}40`,
    borderRadius: '16px',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
    color: color,
  });

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger m-4">
        {error}
      </div>
    );
  }

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
              <Card.Title className="fw-semibold">Total Items</Card.Title>
              <Card.Text className="display-6 fw-bold">{stats.facility_items}</Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card style={cardStyle('#6610f2')} className="h-100">
            <Card.Body>
              <Card.Title className="fw-semibold">Total Stock</Card.Title>
              <Card.Text className="display-6 fw-bold">{stats.total_stock}</Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card style={cardStyle('#198754')} className="h-100">
            <Card.Body>
              <Card.Title className="fw-semibold">Pending Requests</Card.Title>
              <Card.Text className="display-6 fw-bold">{stats.pending_user_requests}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* KPI Cards Row 2 */}
      <Row className="g-4 mb-4">
        <Col md={4}>
          <Card style={cardStyle('#dc3545')} className="h-100">
            <Card.Body>
              <Card.Title className="fw-semibold">Low Stock Items</Card.Title>
              <Card.Text className="display-6 fw-bold">{stats.low_stock_items}</Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card style={cardStyle('#ffc107')} className="h-100">
            <Card.Body>
              <Card.Title className="fw-semibold">Today's Requests</Card.Title>
              <Card.Text className="display-6 fw-bold">{stats.today_requests}</Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card style={cardStyle('#0dcaf0')} className="h-100">
            <Card.Body>
              <Card.Title className="fw-semibold">Facility Users</Card.Title>
              <Card.Text className="display-6 fw-bold">{stats.facility_users}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Facility Metrics Overview Chart */}
      <Row className="mb-4">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <Card.Title className="fw-semibold mb-3">Facility Metrics Overview</Card.Title>
              <div style={{ height: '320px' }}>
                <Bar
                  data={{
                    labels: [
                      'Total Items',
                      'Total Stock',
                      'Pending Requests',
                      'Low Stock Items',
                      'Today\'s Requests',
                      'Facility Users'
                    ],
                    datasets: [
                      {
                        label: 'Count',
                        data: [
                          stats.facility_items,
                          parseFloat(stats.total_stock) || 0,
                          stats.pending_user_requests,
                          stats.low_stock_items,
                          stats.today_requests,
                          stats.facility_users
                        ],
                        backgroundColor: [
                          '#0d6efd',
                          '#6610f2',
                          '#198754',
                          '#dc3545',
                          '#ffc107',
                          '#0dcaf0'
                        ],
                        borderColor: 'transparent',
                        borderWidth: 0,
                        borderRadius: 4,
                        hoverBackgroundColor: [
                          '#0b5ed7',
                          '#5a0fb8',
                          '#157347',
                          '#d32f2f',
                          '#e0a800',
                          '#0bacd6'
                        ],
                      },
                    ],
                  }}
                  options={{
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        enabled: true,
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        titleFont: { size: 14 },
                        bodyFont: { size: 13 },
                        padding: 10,
                        displayColors: false,
                      },
                      // ❌ Remove datalabels if you don't have 'chartjs-plugin-datalabels' installed
                      // datalabels: { ... } ← causes error if plugin not registered
                    },
                    scales: {
                      x: {
                        beginAtZero: true,
                        grid: {
                          display: false,
                          drawBorder: false,
                        },
                        ticks: {
                          display: false,
                          precision: 0,
                        },
                      },
                      y: {
                        grid: {
                          display: false,
                        },
                        ticks: {
                          font: { size: 13 },
                          padding: 8,
                        },
                      },
                    },
                    layout: {
                      padding: {
                        right: 40,
                      }
                    }
                  }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Optional: Hide Top Requested Items Chart if no data (or remove if unused) */}
      {topRequestedItems.length > 0 && (
        <Row className="mb-4">
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <Card.Title className="fw-semibold mb-3">Top Requested Items</Card.Title>
                <div style={{ height: '250px' }}>
                  <Bar data={topRequestedChartData} options={chartOptions} />
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Low Stock Items Table (only shown if data exists) */}
      {lowStockItems.length > 0 && (
        <Row>
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <Card.Title className="fw-semibold mb-3">Low Stock Items</Card.Title>
                <div className="table-responsive">
                  <Table hover bordered>
                    <thead className="bg-light">
                      <tr>
                        <th>Item Code</th>
                        <th>Item Name</th>
                        <th>Category</th>
                        <th>Current Stock</th>
                        <th>Reorder Level</th>
                        <th>Shortage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lowStockItems.map((item, index) => (
                        <tr key={index}>
                          <td>{item.item_code || 'N/A'}</td>
                          <td>{item.item_name || 'Unnamed'}</td>
                          <td>{item.category || 'Uncategorized'}</td>
                          <td className="text-warning fw-bold">{item.quantity || 0}</td>
                          <td>{item.reorder_level || 0}</td>
                          <td className="text-danger fw-bold">{item.shortage || (item.reorder_level - item.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default FacilityDashboard;