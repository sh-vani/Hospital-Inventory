import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import BaseUrl from '../../Api/BaseUrl';
import axiosInstance from '../../Api/axiosInstance';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const SuperAdminDashboard = () => {
  // === Consistent Color Palette ===
  const COLORS = {
    primary: '#2563eb',    // Blue
    success: '#10b981',    // Green
    warning: '#f59e0b',    // Amber
    danger: '#ef4444',     // Red
    info: '#3b82f6',       // Light blue
    secondary: '#6b7280'   // Gray
  };

  // === STATE VARIABLES ===
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // === FETCH DASHBOARD DATA ===
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`${BaseUrl}/dashboard/getSuperAdminDashboard`);
        if (response.data.success) {
          setDashboardData(response.data.data);
        } else {
          setError('Failed to fetch dashboard data');
        }
      } catch (err) {
        setError('Error fetching dashboard data: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // === KPI VALUES (from API) ===
  const kpis = dashboardData ? [
    { 
      title: 'Total Inventory', 
      value: dashboardData.stats.total_stock_quantity, 
      change: '+2.3%', 
      positive: true 
    },
    { 
      title: 'Total Facilities', 
      value: dashboardData.stats.total_facilities, 
      change: '+1', 
      positive: true 
    },
    { 
      title: 'Pending Requisitions', 
      value: dashboardData.stats.pending_requisitions, 
      change: '+5', 
      positive: false 
    },
    { 
      title: 'Dispatches Today', 
      value: dashboardData.stats.today_requisitions, 
      change: '+3', 
      positive: true 
    }
  ] : [];

  // === STOCK MOVEMENT (Line Chart) ===
  const stockMovementData = {
    labels: dashboardData?.monthly_trends?.map(trend => {
      const date = new Date(trend.month);
      return date.toLocaleString('default', { month: 'short' });
    }) || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Stock In',
        data: dashboardData?.monthly_trends?.map(trend => trend.requisition_count) || [300, 420, 380, 500, 620, 700],
        borderColor: COLORS.success,
        backgroundColor: COLORS.success + '20',
        fill: true,
        tension: 0.4,
        borderWidth: 2
      },
      {
        label: 'Stock Out',
        data: dashboardData?.monthly_trends?.map(trend => trend.delivered_count) || [200, 300, 280, 400, 520, 600],
        borderColor: COLORS.danger,
        backgroundColor: COLORS.danger + '20',
        fill: true,
        tension: 0.4,
        borderWidth: 2
      }
    ]
  };

  const stockMovementOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { usePointStyle: true, padding: 15 }
      },
      title: {
        display: true,
        text: 'Stock Movement (Last 6 Months)',
        font: { size: 15, weight: '600' },
        padding: { top: 0, bottom: 15 }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 } }
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.03)' },
        ticks: { font: { size: 11 } }
      }
    }
  };

  // === REQUESTS vs COMPLETED (Bar Chart) ===
  const requestsVsCompletedData = {
    labels: dashboardData?.monthly_trends?.map(trend => {
      const date = new Date(trend.month);
      return date.toLocaleString('default', { month: 'short' });
    }) || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Requests',
        data: dashboardData?.monthly_trends?.map(trend => trend.requisition_count) || [45, 52, 60, 70, 65, 80],
        backgroundColor: COLORS.warning,
        borderRadius: 4,
        borderSkipped: false
      },
      {
        label: 'Completed',
        data: dashboardData?.monthly_trends?.map(trend => trend.delivered_count) || [30, 40, 48, 55, 60, 72],
        backgroundColor: COLORS.success,
        borderRadius: 4,
        borderSkipped: false
      }
    ]
  };

  const requestsVsCompletedOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { usePointStyle: true, padding: 15 }
      },
      title: {
        display: true,
        text: 'Requests vs Completed',
        font: { size: 15, weight: '600' },
        padding: { top: 0, bottom: 15 }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 } }
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.03)' },
        ticks: { font: { size: 11 } }
      }
    }
  };

  // === LOADING AND ERROR STATES ===
  if (loading) {
    return (
      <div className="container-fluid py-4 px-3 px-md-4" style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid py-4 px-3 px-md-4" style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4 px-3 px-md-4" style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <div className="mb-5">
        <h1 className="fw-bold text-gray-800">Super Admin Dashboard</h1>
        <p className="text-muted">System-wide monitoring overview</p>
      </div>

      {/* KPI CARDS */}
      <div className="row mb-5 g-4">
        {kpis.map((kpi, i) => (
          <div className="col-md-3" key={i}>
            <div className="card border-0 shadow-sm rounded-3 h-100">
              <div className="card-body p-4">
                <h6 className="text-muted mb-1">{kpi.title}</h6>
                <div className="d-flex align-items-baseline">
                  <h3 className="fw-bold mb-0 me-2">{kpi.value}</h3>
                  <span className={`small ${kpi.positive ? 'text-success' : 'text-danger'}`}>
                    {kpi.change}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CHARTS SECTION */}
      <div className="row g-4">
        {/* Stock Movement */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm rounded-3 h-100">
            <div className="card-body p-4" style={{ height: '400px' }}>
              <Line data={stockMovementData} options={stockMovementOptions} />
            </div>
          </div>
        </div>

        {/* Requests vs Completed */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm rounded-3 h-100">
            <div className="card-body p-4" style={{ height: '400px' }}>
              <Bar data={requestsVsCompletedData} options={requestsVsCompletedOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* RECENT REQUISITIONS */}
      <div className="row mt-5">
        <div className="col-12">
          <div className="card border-0 shadow-sm rounded-3">
            <div className="card-header bg-white border-0 pt-4 pb-3">
              <h5 className="mb-0">Recent Requisitions</h5>
            </div>
            <div className="card-body p-4">
              {dashboardData?.recent_requisitions?.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>User</th>
                        <th>Facility</th>
                        <th>Status</th>
                        <th>Priority</th>
                        <th>Item Count</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.recent_requisitions.map(requisition => (
                        <tr key={requisition.id}>
                          <td>{requisition.id}</td>
                          <td>{requisition.user_name}</td>
                          <td>{requisition.facility_name}</td>
                          <td>
                            <span className={`badge bg-${requisition.status === 'pending' ? 'warning' : 'success'}`}>
                              {requisition.status}
                            </span>
                          </td>
                          <td>
                            <span className={`badge bg-${requisition.priority === 'high' ? 'danger' : requisition.priority === 'normal' ? 'info' : 'secondary'}`}>
                              {requisition.priority}
                            </span>
                          </td>
                          <td>{requisition.item_count}</td>
                          <td>{new Date(requisition.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted text-center py-3">No recent requisitions found</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;