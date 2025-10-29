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
import { FaCalendarAlt, FaFilter } from "react-icons/fa";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ReportsAnalytics = () => {
  const [reportType, setReportType] = useState("Requisition History");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState({
    "Requisition History": [],
    "Stock Level": [],
    "Usage": [],
    "Received Goods": [],
  });
  const [dateFilter, setDateFilter] = useState({
    startDate: "",
    endDate: ""
  });
  const [statusFilter, setStatusFilter] = useState("all");
  const [refreshKey, setRefreshKey] = useState(0);

  // Function to get facility ID from local storage
  const getFacilityId = () => {
    try {
      // Get user object from local storage
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        console.error("User not found in local storage");
        return null;
      }
      
      // Parse user object
      const user = JSON.parse(userStr);
      
      // Return facility_id from user object
      return user.facility_id || null;
    } catch (err) {
      console.error("Error parsing user data:", err);
      return null;
    }
  };

  // Function to fetch requisition data
  const fetchRequisitionData = async () => {
    try {
      const facilityId = getFacilityId();
      if (!facilityId) {
        throw new Error("Facility ID not found");
      }
      
      const response = await axios.get(`${BaseUrl}/requisitions/facility/${facilityId}`);
      
      // Check if response has data
      if (!response.data.success || !response.data.data) {
        return [];
      }
      
      // Transform API data to the format expected by the chart
      const transformedData = response.data.data.map(item => {
        // Extract date from created_at
        const date = new Date(item.created_at).toLocaleDateString();
        
        // Calculate total requested and approved quantities from items
        const totalRequested = item.items.reduce((sum, item) => sum + item.quantity, 0);
        const totalApproved = item.items.reduce((sum, item) => sum + item.approved_quantity, 0);
        
        return {
          label: date,
          requested: totalRequested,
          approved: totalApproved,
          status: item.status,
          priority: item.priority,
          id: item.id,
          // Keep the original date for filtering
          originalDate: new Date(item.created_at)
        };
      });
      
      return transformedData;
    } catch (err) {
      console.error("Error fetching requisition data:", err);
      throw err;
    }
  };

  // Function to fetch inventory data
  const fetchInventoryData = async () => {
    try {
      const facilityId = getFacilityId();
      if (!facilityId) {
        throw new Error("Facility ID not found");
      }
      
      // Since only one API is working, we'll use mock data for inventory
      // In a real scenario, this would be:
      // const response = await axios.get(`${BaseUrl}/inventory/fasilities/${facilityId}`);
      
      // Mock data for demonstration
      const mockInventoryData = {
        stockLevels: [
          { name: "Medicine A", quantity: 75 },
          { name: "Medicine B", quantity: 60 },
          { name: "PPE Kits", quantity: 85 },
          { name: "Syringes", quantity: 50 },
        ],
        usage: [
          { month: "Jan", quantity: 80 },
          { month: "Feb", quantity: 75 },
          { month: "Mar", quantity: 90 },
          { month: "Apr", quantity: 85 },
        ],
        receivedGoods: [
          { month: "Jan", quantity: 110 },
          { month: "Feb", quantity: 95 },
          { month: "Mar", quantity: 135 },
          { month: "Apr", quantity: 100 },
        ]
      };
      
      // Transform API data to the format expected by the chart
      const stockLevelData = mockInventoryData.stockLevels.map(item => ({
        label: item.name,
        stock: item.quantity,
      }));
      
      const usageData = mockInventoryData.usage.map(item => ({
        label: item.month,
        used: item.quantity,
      }));
      
      const receivedGoodsData = mockInventoryData.receivedGoods.map(item => ({
        label: item.month,
        received: item.quantity,
      }));
      
      return {
        "Stock Level": stockLevelData,
        "Usage": usageData,
        "Received Goods": receivedGoodsData,
      };
    } catch (err) {
      console.error("Error fetching inventory data:", err);
      // Return empty data if API fails
      return {
        "Stock Level": [],
        "Usage": [],
        "Received Goods": [],
      };
    }
  };

  // Function to fetch all report data
  const fetchReportData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Check if facility ID exists
      const facilityId = getFacilityId();
      if (!facilityId) {
        setError("Facility information not found. Please log in again.");
        return;
      }
      
      // Fetch requisition data
      const requisitionData = await fetchRequisitionData();
      
      // Fetch inventory data
      const inventoryData = await fetchInventoryData();
      
      // Update state with fetched data
      setReportData({
        "Requisition History": requisitionData,
        "Stock Level": inventoryData["Stock Level"],
        "Usage": inventoryData["Usage"],
        "Received Goods": inventoryData["Received Goods"],
      });
    } catch (err) {
      setError("Failed to fetch report data. Please try again.");
      console.error("Error fetching report data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when component mounts
  useEffect(() => {
    fetchReportData();
  }, [refreshKey]);

  // Function to filter data based on date and status
  const getFilteredData = () => {
    let data = [...reportData[reportType]];
    
    // Filter by date range if both dates are provided
    if (dateFilter.startDate && dateFilter.endDate) {
      data = data.filter(item => {
        if (!item.originalDate) return true; // Skip if no date
        
        const itemDate = new Date(item.originalDate);
        const startDate = new Date(dateFilter.startDate);
        const endDate = new Date(dateFilter.endDate);
        
        // Set time to start and end of day to include all dates in range
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        
        return itemDate >= startDate && itemDate <= endDate;
      });
    }
    
    // Filter by status if not "all" and report type is Requisition History
    if (statusFilter !== "all" && reportType === "Requisition History") {
      data = data.filter(item => item.status === statusFilter);
    }
    
    return data;
  };

  // Dynamic Chart Data based on selected report
  const getChartData = () => {
    const filteredData = getFilteredData();
    
    switch (reportType) {
      case "Requisition History":
        return {
          labels: filteredData.map((item) => item.label),
          datasets: [
            {
              label: "Requested",
              data: filteredData.map((item) => item.requested),
              backgroundColor: "#0d6efd",
              borderRadius: 4,
              borderSkipped: false,
            },
            {
              label: "Approved",
              data: filteredData.map((item) => item.approved),
              backgroundColor: "#198754",
              borderRadius: 4,
              borderSkipped: false,
            },
          ],
        };
      case "Stock Level":
        return {
          labels: filteredData.map((item) => item.label),
          datasets: [
            {
              label: "Current Stock",
              data: filteredData.map((item) => item.stock),
              backgroundColor: "#ffc107",
              borderRadius: 4,
              borderSkipped: false,
            },
          ],
        };
      case "Usage":
        return {
          labels: filteredData.map((item) => item.label),
          datasets: [
            {
              label: "Units Consumed",
              data: filteredData.map((item) => item.used),
              backgroundColor: "#dc3545",
              borderRadius: 4,
              borderSkipped: false,
            },
          ],
        };
      case "Received Goods":
        return {
          labels: filteredData.map((item) => item.label),
          datasets: [
            {
              label: "Goods Received",
              data: filteredData.map((item) => item.received),
              backgroundColor: "#20c997",
              borderRadius: 4,
              borderSkipped: false,
            },
          ],
        };
      default:
        return { labels: [], datasets: [] };
    }
  };

  // Get facility name from local storage
  const getFacilityName = () => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) return "Unknown Facility";
      
      const user = JSON.parse(userStr);
      return user.facility_name || "Unknown Facility";
    } catch (err) {
      console.error("Error parsing user data:", err);
      return "Unknown Facility";
    }
  };

  // Reset filters
  const resetFilters = () => {
    setDateFilter({
      startDate: "",
      endDate: ""
    });
    setStatusFilter("all");
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="">
      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h3 className="mb-0">Reports</h3>
          <p className="text-muted mb-0">View analytics and insights for {getFacilityName()}</p>
        </div>
        <button 
          className="btn btn-outline-primary btn-sm"
          onClick={() => setRefreshKey(prev => prev + 1)}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh Data"}
        </button>
      </div>

      <div className="row">
        {/* Left Column - Report Filters */}
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

                {/* Date Range Filter */}
                <div className="mb-3">
                  <label className="form-label d-flex align-items-center gap-2">
                    <FaCalendarAlt /> Date Range
                  </label>
                  <div className="row g-2">
                    <div className="col-6">
                      <input
                        type="date"
                        className="form-control"
                        value={dateFilter.startDate}
                        onChange={(e) => setDateFilter({...dateFilter, startDate: e.target.value})}
                      />
                    </div>
                    <div className="col-6">
                      <input
                        type="date"
                        className="form-control"
                        value={dateFilter.endDate}
                        onChange={(e) => setDateFilter({...dateFilter, endDate: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                {/* Status Filter - Only show for Requisition History */}
                {reportType === "Requisition History" && (
                  <div className="mb-3">
                    <label htmlFor="statusFilter" className="form-label">
                      Status
                    </label>
                    <select
                      className="form-select"
                      id="statusFilter"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </div>
                )}

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

        {/* Right Column - Report Preview */} 
        <div className="col-md-8">
          <div className="card shadow-sm">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Report Preview</h5>
              <div className="d-flex gap-2">
                {reportType === "Requisition History" && statusFilter !== "all" && (
                  <span className="badge bg-info">
                    Status: {statusFilter}
                  </span>
                )}
                {dateFilter.startDate && dateFilter.endDate && (
                  <span className="badge bg-info">
                    {dateFilter.startDate} to {dateFilter.endDate}
                  </span>
                )}
                <button className="btn btn-secondary btn-sm">Export</button>
              </div>
            </div>
            <div className="card-body">
              <h6 className="mb-4">{reportType}</h6>

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              {loading ? (
                <div className="d-flex justify-content-center align-items-center" style={{ height: "300px" }}>
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <div style={{ height: "300px", position: "relative" }}>
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
                  ) : (
                    <div className="d-flex justify-content-center align-items-center h-100 flex-column">
                      <p className="text-muted">No data available with current filters.</p>
                      <button 
                        className="btn btn-sm btn-outline-primary"
                        onClick={resetFilters}
                      >
                        Reset Filters
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