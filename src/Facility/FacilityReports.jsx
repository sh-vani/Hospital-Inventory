import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ReportsAnalytics = () => {
  const [reportType, setReportType] = useState("Requisition History");
  const [facility, setFacility] = useState("All Facilities");

  // Extended Sample Data for 4 Reports
  const reportData = {
    "Requisition History": [
      { label: "Jan", requested: 120, approved: 100 },
      { label: "Feb", requested: 90, approved: 85 },
      { label: "Mar", requested: 140, approved: 130 },
      { label: "Apr", requested: 100, approved: 95 },
    ],
    "Stock Level": [
      { label: "Medicine A", stock: 75 },
      { label: "Medicine B", stock: 60 },
      { label: "PPE Kits", stock: 85 },
      { label: "Syringes", stock: 50 },
    ],
    "Usage": [
      { label: "Jan", used: 80 },
      { label: "Feb", used: 75 },
      { label: "Mar", used: 90 },
      { label: "Apr", used: 85 },
    ],
    "Received Goods": [
      { label: "Jan", received: 110 },
      { label: "Feb", received: 95 },
      { label: "Mar", received: 135 },
      { label: "Apr", received: 100 },
    ],
  };

  // Dynamic Chart Data based on selected report
  let chartData;

  switch (reportType) {
    case "Requisition History":
      chartData = {
        labels: reportData[reportType].map((item) => item.label),
        datasets: [
          {
            label: "Requested",
            data: reportData[reportType].map((item) => item.requested),
            backgroundColor: "#0d6efd",
            borderRadius: 4,
            borderSkipped: false,
          },
          {
            label: "Approved",
            data: reportData[reportType].map((item) => item.approved),
            backgroundColor: "#198754",
            borderRadius: 4,
            borderSkipped: false,
          },
        ],
      };
      break;

    case "Stock Level":
      chartData = {
        labels: reportData[reportType].map((item) => item.label),
        datasets: [
          {
            label: "Current Stock",
            data: reportData[reportType].map((item) => item.stock),
            backgroundColor: "#ffc107",
            borderRadius: 4,
            borderSkipped: false,
          },
        ],
      };
      break;

    case "Usage":
      chartData = {
        labels: reportData[reportType].map((item) => item.label),
        datasets: [
          {
            label: "Units Consumed",
            data: reportData[reportType].map((item) => item.used),
            backgroundColor: "#dc3545",
            borderRadius: 4,
            borderSkipped: false,
          },
        ],
      };
      break;

    case "Received Goods":
      chartData = {
        labels: reportData[reportType].map((item) => item.label),
        datasets: [
          {
            label: "Goods Received",
            data: reportData[reportType].map((item) => item.received),
            backgroundColor: "#20c997",
            borderRadius: 4,
            borderSkipped: false,
          },
        ],
      };
      break;

    default:
      chartData = { labels: [], datasets: [] };
  }

  return (
    <div className="">
      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h3 className="mb-0">Reports</h3>
          <p className="text-muted mb-0">View analytics and insights</p>
        </div>
      </div>

      <div className="row">
        {/* Left Column - Report Filters */}
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-header">
              <h5 className="mb-0">Generate Report</h5>
            </div>
            <div className="card-body">
              <form>
                <div className="mb-3">
                  <label htmlFor="reportType" className="form-label">
                    Report Type
                  </label>
                  <select
                    className="form-select"
                    id="reportType"
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                  >
                    <option>Requisition History</option>
                    <option>Stock Level</option>
                    <option>Usage</option>
                    <option>Received Goods</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="facility" className="form-label">
                    Facility
                  </label>
                  <select
                    className="form-select"
                    id="facility"
                    value={facility}
                    onChange={(e) => setFacility(e.target.value)}
                  >
                    <option>All Facilities</option>
                    <option>Warehouse A</option>
                    <option>Warehouse B</option>
                    <option>Distribution Center</option>
                    <option>Warehouse C</option>
                  </select>
                </div>

                <button type="button" className="btn btn-primary w-100">
                  Generate Report
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Right Column - Report Preview */} 
        <div className="col-md-8">
          <div className="card shadow-sm">
            <div className="card-header   d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Report Preview</h5>
              <button className="btn btn-secondary btn-sm">Export</button>
            </div>
            <div className="card-body">
              <h6 className="mb-4">{reportType}</h6>

              <div style={{ height: "300px", position: "relative" }}>
                <Bar
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: true,
                        position: "bottom",
                        labels: {
                          usePointStyle: true,
                          padding: 20,
                        },
                      },
                      tooltip: {
                        callbacks: {
                          label: function (context) {
                            return `${context.dataset.label}: ${context.parsed.y}`;
                          },
                        },
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          color: "rgba(0, 0, 0, 0.05)",
                        },
                        ticks: {
                          stepSize: 20,
                          font: { size: 12 },
                        },
                      },
                      x: {
                        grid: { display: false },
                        ticks: { font: { size: 12, weight: "500" } },
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsAnalytics;