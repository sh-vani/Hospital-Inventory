import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";
import {
  FaPills,
  FaExclamationTriangle,
  FaFileImport,
  FaChartLine
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import BaseUrl from "../../Api/BaseUrl";

const WarehouseDashboard = () => {
  const navigate = useNavigate();
  
  const [kpiData, setKpiData] = useState({
    totalStock: "0",
    lowStock: "0",
    pendingReqs: "0",
  });
  
  const [dispatchData, setDispatchData] = useState([]);
  const [consumptionData, setConsumptionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${BaseUrl}/dashboard/getWarehouseAdminDashboard`);
        
        if (response.data.success) {
          const data = response.data.data;
          
          // Update KPI data
          setKpiData({
            totalStock: data.stats.total_stock,
            lowStock: data.stats.low_stock_items.toString(),
            pendingReqs: data.stats.pending_approvals.toString(),
          });
          
          // For now, we'll keep the mock dispatch data since the API doesn't provide monthly dispatch data
          setDispatchData([
            { month: "Jan", dispatched: 120 },
            { month: "Feb", dispatched: 95 },
            { month: "Mar", dispatched: 140 },
            { month: "Apr", dispatched: 180 },
            { month: "May", dispatched: 160 },
            { month: "Jun", dispatched: 200 },
            { month: "Jul", dispatched: 175 },
            { month: "Aug", dispatched: 190 },
            { month: "Sep", dispatched: 210 },
            { month: "Oct", dispatched: 230 },
          ]);
          
          // Mock consumption data for facilities
          setConsumptionData([
            { 
              facility: "City General Hospital", 
              "Surgical Gloves": 45, 
              "Face Masks": 120, 
              "Syringes": 85 
            },
            { 
              facility: "Community Health Center", 
              "Surgical Gloves": 30, 
              "Face Masks": 90, 
              "Syringes": 65 
            },
            { 
              facility: "District Medical Facility", 
              "Surgical Gloves": 60, 
              "Face Masks": 150, 
              "Syringes": 110 
            },
            { 
              facility: "Rural Health Clinic", 
              "Surgical Gloves": 25, 
              "Face Masks": 70, 
              "Syringes": 45 
            },
            { 
              facility: "Emergency Medical Center", 
              "Surgical Gloves": 75, 
              "Face Masks": 180, 
              "Syringes": 130 
            },
            { 
              facility: "Pediatric Hospital", 
              "Surgical Gloves": 40, 
              "Face Masks": 100, 
              "Syringes": 70 
            }
          ]);
        }
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handlePendingReqsClick = () => {
    navigate("/warehouse/requisitions");
  };

  if (loading) {
    return (
      <div className="container-fluid py-4" style={{ minHeight: "100vh" }}>
        <div className="d-flex justify-content-center align-items-center" style={{ height: "80vh" }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid py-4" style={{ minHeight: "100vh" }}>
        <div className="alert alert-danger" role="alert">
          Error loading dashboard data: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4" style={{ minHeight: "100vh" }}>
      {/* Header */}
      <div className="mb-4">
        <h2 className="fw-bold text-primary">Warehouse Dashboard</h2>
        <p className="text-muted">
          Real-time overview of stock and monthly dispatches
        </p>
      </div>

      {/* KPI Cards */}
      <div className="row g-4 mb-4">
        {[
          {
            icon: <FaPills className="text-primary" size={18} />,
            label: "Total Stock",
            value: kpiData.totalStock,
            bg: "primary",
            color: "text-primary",
          },
          {
            icon: (
              <FaExclamationTriangle className="text-warning" size={18} />
            ),
            label: "Low Stock Alerts",
            value: kpiData.lowStock,
            bg: "warning",
            color: "text-warning",
          },
          {
            icon: <FaFileImport className="text-secondary" size={18} />,
            label: "Pending Facility Reqs",
            value: kpiData.pendingReqs,
            bg: "secondary",
            color: "text-secondary",
            onClick: handlePendingReqsClick,
            clickable: true
          },
        ].map((item, idx) => (
          <div className="col-12 col-md-4" key={idx}>
            <div
              className={`card border-0 shadow-sm text-center bg-light ${item.clickable ? 'cursor-pointer' : ''}`}
              style={{
                borderRadius: "12px",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow =
                  "0 10px 25px rgba(0,0,0,0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 2px 10px rgba(0,0,0,0.05)";
              }}
              onClick={item.onClick}
            >
              {/* Icon Section */}
              <div
                className={`bg-${item.bg} bg-opacity-10 p-3 d-flex justify-content-center align-items-center`}
                style={{
                  borderTopLeftRadius: "12px",
                  borderTopRightRadius: "12px",
                  height: "60px",
                }}
              >
                <div
                  className={`d-flex align-items-center justify-content-center rounded-circle ${item.color}`}
                  style={{
                    width: "36px",
                    height: "36px",
                    backgroundColor: `var(--bs-${item.bg}-rgb)`,
                    opacity: 0.9,
                  }}
                >
                  {item.icon}
                </div>
              </div>

              {/* Value & Label */}
              <div className="p-4">
                <h4 className={`fw-bold ${item.color} mb-1`}>{item.value}</h4>
                <small className="text-muted">
                  {item.label}
                  {item.clickable && <span className="ms-1">(Click to view)</span>}
                </small>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="row g-4 mb-4">
        {/* Monthly Dispatch Chart */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 pt-3">
              <h5 className="mb-0 fw-bold">Items Dispatched Monthly</h5>
            </div>
            <div className="card-body" style={{ height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dispatchData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="dispatched"
                    stroke="#3498db"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Consumption Trend Chart */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 pt-3 d-flex align-items-center">
              <FaChartLine className="me-2 text-primary" />
              <h5 className="mb-0 fw-bold">Facility Consumption Trend</h5>
            </div>
            <div className="card-body" style={{ height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={consumptionData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 50,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="facility" angle={-45} textAnchor="end" height={70} />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="Surgical Gloves" fill="#8884d8" name="Surgical Gloves" />
                  <Bar dataKey="Face Masks" fill="#82ca9d" name="Face Masks" />
                  <Bar dataKey="Syringes" fill="#ffc658" name="Syringes" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
};

export default WarehouseDashboard;