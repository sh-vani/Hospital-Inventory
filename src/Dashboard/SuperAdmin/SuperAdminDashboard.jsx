import React, { useState, useEffect } from "react";
import axiosInstance from "../../Api/axiosInstance";
import BaseUrl from "../../Api/BaseUrl";

// Chart.js
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const SuperAdminDashboard = () => {
  const COLORS = {
    primary: "#2563eb",    // Inventory
    info: "#3b82f6",       // Facilities
    warning: "#f59e0b",    // Pending
    success: "#10b981",    // Dispatches
    netWorth: "#8b5cf6",   // Purple for net worth
    reserve: "#a78bfa",    // Light purple
  };

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(
          `${BaseUrl}/dashboard/getSuperAdminDashboard`
        );
        if (response.data.success) {
          setDashboardData(response.data.data);
        } else {
          setError("Failed to load dashboard data.");
        }
      } catch (err) {
        setError("Error fetching data: " + (err.message || "Unknown error"));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="container-fluid py-4 px-3 px-md-4" style={{ minHeight: "100vh", backgroundColor: "#f9fafb" }}>
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
      <div className="container-fluid py-4 px-3 px-md-4" style={{ minHeight: "100vh", backgroundColor: "#f9fafb" }}>
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="container-fluid py-4 px-3 px-md-4" style={{ minHeight: "100vh", backgroundColor: "#f9fafb" }}>
        <div className="d-flex justify-content-center align-items-center" style={{ height: "80vh" }}>
          <p className="text-muted">No data available.</p>
        </div>
      </div>
    );
  }

  // === KPIs including Net Worth ===
  const kpis = [
    { title: "Total Inventory Items", value: dashboardData.total_inventory_items, icon: "📦", color: COLORS.primary },
    { title: "Total Facilities", value: dashboardData.total_facilities, icon: "🏛️", color: COLORS.info },
    { title: "Pending Requisitions", value: dashboardData.pending_requisitions, icon: "⏳", color: COLORS.warning },
    { title: "Dispatches Today", value: dashboardData.dispatches_today, icon: "🚚", color: COLORS.success },
    {
      title: "Total Warehouse Net Worth",
      value: `GHS ${Number(dashboardData.total_net_worth).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: "💰",
      color: COLORS.netWorth,
    },
  ];

  // === BAR CHART: Operational Metrics ===
  const barChartData = {
    labels: ["Inventory Items", "Facilities", "Pending Reqs", "Dispatches Today"],
    datasets: [
      {
        label: "Metrics",
        data: [
          dashboardData.total_inventory_items,
          dashboardData.total_facilities,
          dashboardData.pending_requisitions,
          dashboardData.dispatches_today,
        ],
        backgroundColor: [
          COLORS.primary,
          COLORS.info,
          COLORS.warning,
          COLORS.success,
        ],
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      y: { beginAtZero: true, grid: { color: "rgba(0,0,0,0.03)" } },
      x: { grid: { display: false } },
    },
  };

  // === DOUGHNUT CHART: Net Worth Allocation (Mocked) ===
  // Since we don't have breakdown, we'll assume:
  // - 70% is tied in inventory value
  // - 30% is operational buffer
  const netWorthValue = parseFloat(dashboardData.total_net_worth) || 0;
  const inventoryValue = netWorthValue * 0.7;
  const reserveValue = netWorthValue * 0.3;

  const doughnutData = {
    labels: ["Inventory Value", "Operational Reserve"],
    datasets: [
      {
        data: [inventoryValue, reserveValue],
        backgroundColor: [COLORS.netWorth, COLORS.reserve],
        borderWidth: 0,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom" },
      tooltip: {
        callbacks: {
          label: (context) =>
            `${context.label}: GHS ${context.raw.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        },
      },
    },
    cutout: "70%",
  };

  return (
    <div className="container-fluid py-4 px-3 px-md-4" style={{ minHeight: "100vh", backgroundColor: "#f9fafb" }}>
      {/* Header */}
      <div className="mb-5">
        <h1 className="fw-bold text-gray-800">Super Admin Dashboard</h1>
        <p className="text-muted">System-wide overview of inventory and operations</p>
      </div>

      {/* KPI CARDS */}
      <div className="row mb-5 g-4">
        {kpis.map((kpi, i) => (
          <div className="col-md-3" key={i}>
            <div
              className="card border-0 shadow-sm rounded-3 h-100"
              style={{ borderLeft: `4px solid ${kpi.color}` }}
            >
              <div className="card-body p-4">
                <div className="d-flex align-items-center mb-2">
                  <span className="fs-3 me-3">{kpi.icon}</span>
                  <h6 className="text-muted mb-0">{kpi.title}</h6>
                </div>
                <h3 className="fw-bold mb-0">{kpi.value}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* GRAPHS SECTION */}
      <div className="row g-4 mb-5">
        {/* Bar Chart: Operational Metrics */}
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm rounded-3 h-100">
            <div className="card-header bg-white border-0 py-3">
              <h6 className="mb-0">Operational Metrics Overview</h6>
            </div>
            <div className="card-body p-4" style={{ height: "320px" }}>
              <Bar data={barChartData} options={barChartOptions} />
            </div>
          </div>
        </div>

        {/* Doughnut Chart: Net Worth Allocation */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm rounded-3 h-100">
            <div className="card-header bg-white border-0 py-3">
              <h6 className="mb-0">Net Worth Allocation</h6>
            </div>
            <div className="card-body p-4 d-flex flex-column" style={{ height: "320px" }}>
              <div style={{ flex: 1, minHeight: 0 }}>
                <Doughnut data={doughnutData} options={doughnutOptions} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Optional Info Footer */}
      <div className="text-muted small text-center">
        * Net worth allocation is illustrative. Actual breakdown will be added in future updates.
      </div>
    </div>
  );
};

export default SuperAdminDashboard;