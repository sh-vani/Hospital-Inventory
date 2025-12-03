import React, { useState, useEffect } from "react";
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
import axios from "axios";
import BaseUrl from "../Api/BaseUrl";
import {
  FaCalendarAlt,
  FaFilter,
  FaBoxes,
  FaTruck,
  FaExclamationTriangle,
  FaUserFriends,
  FaClipboardList,
} from "react-icons/fa";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ReportsAnalytics = () => {
  const [reportType, setReportType] = useState("Low Stock");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState({
    "Low Stock": [],
    "Total Stock": [],
    "Pending Requisition": [],
    "Approved Requisition": [],
  });
  const [refreshKey, setRefreshKey] = useState(0);

  const [facilityMetrics, setFacilityMetrics] = useState({
    total_items: 0,
    total_stock: 0,
    pending_requests: 0,
    low_stock_items: 0,
    todays_requests: 0,
    facility_users: 0,
  });

  const getFacilityId = () => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) return null;
      const user = JSON.parse(userStr);
      return user.facility_id || null;
    } catch {
      return null;
    }
  };

  const fetchReportData = async () => {
    setLoading(true);
    setError(null);

    try {
      const facilityId = getFacilityId();
      if (!facilityId) {
        setError("Facility information not found. Please log in again.");
        setLoading(false);
        return;
      }

      const response = await axios.get(`${BaseUrl}/reports/facility/${facilityId}`);
      if (!response.data.success || !response.data.data) {
        throw new Error("Invalid report data");
      }

      const apiData = response.data.data;

      // Low Stock: [{ item_name, quantity }]
      const lowStock = (apiData.low_stock_items || []).map((item) => ({
        label: item.item_name,
        stock: item.quantity,
      }));

      // Total Stock: [{ item_name, quantity }]
      const totalStock = (apiData.total_stock_items || []).map((item) => ({
        label: item.item_name,
        stock: item.quantity,
      }));

      // Pending Requisitions: flatten items
      const pendingRequisitions = (apiData.pending_requisitions || []).flatMap((req) =>
        (req.items || []).map((item) => ({
          label: item.item_name,
          requested: item.quantity || 0,
          approved: 0,
          status: "pending",
          originalDate: null,
        }))
      );

      // Approved Requisitions
      const approvedRequisitions = (apiData.approved_requisitions || []).flatMap((req) =>
        (req.items || []).map((item) => ({
          label: item.item_name,
          requested: 0,
          approved: item.approved_quantity || item.quantity || 0,
          status: "approved",
          originalDate: null,
        }))
      );

      setReportData({
        "Low Stock": lowStock,
        "Total Stock": totalStock,
        "Pending Requisition": pendingRequisitions,
        "Approved Requisition": approvedRequisitions,
      });

      // Update facility metrics
      const summary = apiData.total_stock_summary || {};
      setFacilityMetrics({
        total_items: summary.total_items || 0,
        total_stock: summary.total_quantity || 0,
        pending_requests: apiData.pending_requisitions?.length || 0,
        low_stock_items: apiData.low_stock_items?.length || 0,
        todays_requests: 0, // not in API
        facility_users: 0,   // not in API
      });
    } catch (err) {
      console.error("Error fetching report data:", err);
      setError("Failed to fetch report data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [refreshKey]);

  // Since API doesn't provide dates, we skip filtering
  const getFilteredData = () => {
    return reportData[reportType] || [];
  };

  const getChartData = () => {
    const filteredData = getFilteredData();
    switch (reportType) {
      case "Low Stock":
        return {
          labels: filteredData.map((i) => i.label),
          datasets: [
            {
              label: "Low Stock Quantity",
              data: filteredData.map((i) => i.stock),
              backgroundColor: "#dc3545",
              borderRadius: 4,
            },
          ],
        };
      case "Total Stock":
        return {
          labels: filteredData.map((i) => i.label),
          datasets: [
            {
              label: "Total Stock Quantity",
              data: filteredData.map((i) => i.stock),
              backgroundColor: "#0d6efd",
              borderRadius: 4,
            },
          ],
        };
      case "Pending Requisition":
        return {
          labels: filteredData.map((i) => i.label),
          datasets: [
            {
              label: "Requested Quantity",
              data: filteredData.map((i) => i.requested),
              backgroundColor: "#ffc107",
              borderRadius: 4,
            },
          ],
        };
      case "Approved Requisition":
        return {
          labels: filteredData.map((i) => i.label),
          datasets: [
            {
              label: "Approved Quantity",
              data: filteredData.map((i) => i.approved),
              backgroundColor: "#198754",
              borderRadius: 4,
            },
          ],
        };
      default:
        return { labels: [], datasets: [] };
    }
  };

  const getFacilityName = () => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) return "Unknown Facility";
      const user = JSON.parse(userStr);
      return user.facility_name || "Unknown Facility";
    } catch {
      return "Unknown Facility";
    }
  };

  const resetFilters = () => {
    setRefreshKey((p) => p + 1);
  };
// Helper: Export current report data as CSV
const exportToCSV = () => {
  const data = getFilteredData();
  if (data.length === 0) {
    alert("No data to export.");
    return;
  }

  let csvContent = "";

  // Define headers and row mapping based on report type
  if (reportType === "Low Stock" || reportType === "Total Stock") {
    csvContent = "Item Name,Quantity\n";
    csvContent += data.map(item => `"${item.label}",${item.stock}`).join("\n");
  } else if (reportType === "Pending Requisition") {
    csvContent = "Item Name,Requested Quantity\n";
    csvContent += data.map(item => `"${item.label}",${item.requested}`).join("\n");
  } else if (reportType === "Approved Requisition") {
    csvContent = "Item Name,Approved Quantity\n";
    csvContent += data.map(item => `"${item.label}",${item.approved}`).join("\n");
  }

  // Create and trigger download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${reportType.replace(/\s+/g, "_")}_Report.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
  const MetricCard = ({ title, value, icon: Icon, color }) => (
    <div className={`card text-white bg-${color} shadow-sm h-100`}>
      <div className="card-body d-flex align-items-center">
        <div className="me-3 fs-2">
          <Icon />
        </div>
        <div>
          <h6 className="card-title mb-0">{title}</h6>
          <h4 className="card-text mb-0">{value}</h4>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container-fluid px-3 px-md-4 py-3">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h3 className="mb-0">Reports</h3>
          <p className="text-muted mb-0">
            View analytics and insights for {getFacilityName()}
          </p>
        </div>
        <button
          className="btn btn-outline-primary btn-sm"
          onClick={() => setRefreshKey((p) => p + 1)}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh Data"}
        </button>
      </div>

   
      <div className="row">
        {/* Filters */}
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-header">
              <h5 className="mb-0 d-flex align-items-center gap-2">
                <FaFilter /> Generate Report
              </h5>
            </div>
            <div className="card-body">
              <form>
                <div className="mb-3">
                  <label className="form-label">Report Type</label>
                  <select
                    className="form-select"
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                  >
                    <option>Low Stock</option>
                    <option>Total Stock</option>
                    <option>Pending Requisition</option>
                    <option>Approved Requisition</option>
                  </select>
                </div>

                {/* ❌ Removed date filter since API doesn't support it */}
                {/* You can re-enable later if backend adds created_at */}

                <div className="d-grid gap-2">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={fetchReportData}
                    disabled={loading}
                  >
                    {loading ? "Loading..." : "Generate Report"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={resetFilters}
                    disabled={loading}
                  >
                    Reset Filters
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="col-md-8">
          <div className="card shadow-sm">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Report Preview</h5>
              <button className="btn btn-secondary btn-sm" onClick={exportToCSV}>
  Export CSV
</button>
            </div>
            <div className="card-body">
              <h6 className="mb-4">{reportType}</h6>
              {error && <div className="alert alert-danger">{error}</div>}

              {loading ? (
                <div className="d-flex justify-content-center align-items-center" style={{ height: "300px" }}>
                  <div className="spinner-border text-primary" role="status" />
                </div>
              ) : (
                <div style={{ height: "300px" }}>
                  {getFilteredData().length > 0 ? (
                    <Bar
                      data={getChartData()}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: true,
                            position: "bottom",
                            labels: { usePointStyle: true, padding: 20 },
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: { stepSize: 20 },
                          },
                          x: {
                            grid: { display: false },
                          },
                        },
                      }}
                    />
                  ) : (
                    <div className="d-flex justify-content-center align-items-center h-100 flex-column">
                      <p className="text-muted">No data available.</p>
                      <button className="btn btn-sm btn-outline-primary" onClick={resetFilters}>
                        Refresh
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsAnalytics;