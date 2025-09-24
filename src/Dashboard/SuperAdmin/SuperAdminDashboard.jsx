import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  FaExclamationCircle,
  FaExclamationTriangle,
  FaClock
} from 'react-icons/fa';

// Register Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const SuperAdminDashboard = () => {
  // === Consistent Color Palette ===
  const COLORS = {
    primary: '#2563eb',    // Blue (main)
    success: '#10b981',    // Green (completed)
    warning: '#f59e0b',    // Amber (pending/low stock)
    danger: '#ef4444',     // Red (out of stock/delayed)
    info: '#3b82f6',       // Light blue (in transit/approved)
    secondary: '#6b7280'   // Gray
  };

  // === STOCK STATUS ===
  const stockData = {
    labels: ['Pharmaceuticals', 'Medical Supplies', 'Consumables', 'Equipment'],
    datasets: [{
      data: [45, 25, 20, 10],
      backgroundColor: [
        COLORS.primary,
        COLORS.success,
        COLORS.warning,
        COLORS.info
      ],
      borderWidth: 0,
      borderRadius: 4,
      spacing: 4
    }]
  };

  const stockOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      title: {
        display: true,
        text: 'Stock Status (All Warehouses & Facilities)',
        font: { size: 15, weight: '600' },
        padding: { top: 0, bottom: 15 }
      }
    },
    cutout: '70%',
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  // === REQUISITIONS SUMMARY ===
  const requisitionData = {
    labels: ['Pending', 'Approved', 'Completed', 'Rejected'],
    datasets: [{
      label: 'Requisitions',
      data: [42, 18, 65, 5],
      backgroundColor: [
        COLORS.warning,   // Pending
        COLORS.info,      // Approved
        COLORS.success,   // Completed
        COLORS.danger     // Rejected
      ],
      borderRadius: 6,
      borderSkipped: false
    }]
  };

  const requisitionOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          usePointStyle: true
        }
      },
      title: {
        display: true,
        text: 'Requisitions Summary',
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

  // === DISPATCH SUMMARY ===
  const dispatchData = {
    labels: ['Completed', 'In Transit', 'Delayed'],
    datasets: [{
      label: 'Dispatches',
      data: [78, 12, 4],
      backgroundColor: [
        COLORS.success,
        COLORS.info,
        COLORS.danger
      ],
      borderRadius: 6,
      borderSkipped: false
    }]
  };

  const dispatchOptions = {
    ...requisitionOptions,
    plugins: {
      ...requisitionOptions.plugins,
      title: {
        display: true,
        text: 'Dispatch Summary',
        font: { size: 15, weight: '600' },
        padding: { top: 0, bottom: 15 }
      }
    }
  };

  // === ALERTS ===
  const alerts = [
    {
      icon: <FaExclamationCircle className="text-danger" />,
      title: 'Out of Stock',
      value: '8 items',
      bg: 'bg-danger',
      textColor: 'text-danger'
    },
    {
      icon: <FaExclamationTriangle className="text-warning" />,
      title: 'Low Stock',
      value: '23 items',
      bg: 'bg-warning',
      textColor: 'text-warning'
    },
    {
      icon: <FaClock className="text-info" />,
      title: 'Near Expiry',
      value: '15 items',
      bg: 'bg-info',
      textColor: 'text-info'
    }
  ];

  return (
    <div className="container-fluid py-4 px-3 px-md-4" style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <div className="mb-5">
        <h1 className="fw-bold text-gray-800">Super Admin Dashboard</h1>
        <p className="text-muted">System-wide monitoring overview</p>
      </div>

      {/* Critical Alerts */}
      <div className="row mb-5 g-4">
        {alerts.map((alert, i) => (
          <div className="col-md-4" key={i}>
            <div className={`card border-0 shadow-sm rounded-3 h-100 ${alert.bg} bg-opacity-10`}>
              <div className="card-body d-flex align-items-center p-4">
                <div className="me-4" style={{ fontSize: '1.8rem' }}>
                  {alert.icon}
                </div>
                <div>
                  <h5 className={`mb-1 fw-bold ${alert.textColor}`}>{alert.title}</h5>
                  <p className="mb-0 text-muted">{alert.value}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="row g-4">
        {/* Stock Status */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-3 h-100">
            <div className="card-body p-4" style={{ height: '380px' }}>
              <Doughnut data={stockData} options={stockOptions} />
            </div>
          </div>
        </div>

        {/* Requisitions Summary */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-3 h-100">
            <div className="card-body p-4" style={{ height: '380px' }}>
              <Bar data={requisitionData} options={requisitionOptions} />
            </div>
          </div>
        </div>

        {/* Dispatch Summary */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-3 h-100">
            <div className="card-body p-4" style={{ height: '380px' }}>
              <Bar data={dispatchData} options={dispatchOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;