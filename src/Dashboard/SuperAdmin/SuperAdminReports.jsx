import React, { useState, useEffect } from 'react';
import axiosInstance from '../../Api/axiosInstance';
import BaseUrl from '../../Api/BaseUrl';
import { Bar } from 'react-chartjs-2';
import {
  FaDownload, FaChartLine, FaSearch, FaBuilding,
  FaFilePdf
} from 'react-icons/fa';
import Swal from 'sweetalert2';

// Chart.js
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const SuperAdminReports = () => {
  const [reportType, setReportType] = useState('Requisition Summary');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [facility, setFacility] = useState('All Facilities');
  const [showGeneratedModal, setShowGeneratedModal] = useState(false);
  const [generatedReport, setGeneratedReport] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch data from DASHBOARD API (as per your request)
  const fetchDashboardReport = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`${BaseUrl}/dashboard/getSuperAdminDashboard`);
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error('Failed to load data');
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Fetch Failed',
        text: 'Could not load dashboard data for report.',
        confirmButtonColor: '#e74a3b'
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Generate report using dashboard data
  const handleGenerateReport = async (e) => {
    e.preventDefault();

    const data = await fetchDashboardReport();
    if (!data) return;

    // Mock chart data using dashboard KPIs
    const mockChartData = {
      labels: ['Inventory', 'Facilities', 'Pending Reqs', 'Dispatches'],
      datasets: [{
        label: 'Metrics',
        data: [
          data.total_inventory_items,
          data.total_facilities,
          data.pending_requisitions,
          data.dispatches_today
        ],
        backgroundColor: ['#2563eb', '#3b82f6', '#f59e0b', '#10b981'],
        borderRadius: 6,
        barThickness: 40
      }]
    };

    setGeneratedReport({
      type: reportType,
      facility: facility,
      dateFrom: dateFrom || 'N/A',
      dateTo: dateTo || 'N/A',
      summary: {
        total_inventory_items: data.total_inventory_items,
        total_facilities: data.total_facilities,
        pending_requisitions: data.pending_requisitions,
        dispatches_today: data.dispatches_today,
        total_net_worth: data.total_net_worth
      },
      chartData: mockChartData,
      generatedAt: new Date().toLocaleString()
    });

    setShowGeneratedModal(true);

    Swal.fire({
      icon: 'success',
      title: 'Report Generated!',
      text: 'Report created using dashboard data.',
      confirmButtonColor: '#28a745'
    });
  };

  const exportToPDF = () => {
    const printWindow = window.open('', '_blank');
    const summary = generatedReport.summary;

    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${generatedReport.type} Report</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .card { border: 1px solid #ddd; border-radius: 8px; padding: 15px; margin-bottom: 15px; }
          .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
          @media print {
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="container-fluid">
          <div class="header">
            <h2>${generatedReport.type}</h2>
            <p>Generated on: ${generatedReport.generatedAt}</p>
            <p><strong>Date Range:</strong> ${generatedReport.dateFrom} to ${generatedReport.dateTo}</p>
            <p><strong>Facility:</strong> ${generatedReport.facility}</p>
          </div>

          <div class="summary-grid">
            <div class="card">
              <h5>Total Inventory Items</h5>
              <p class="fw-bold fs-4">${summary.total_inventory_items}</p>
            </div>
            <div class="card">
              <h5>Total Facilities</h5>
              <p class="fw-bold fs-4">${summary.total_facilities}</p>
            </div>
            <div class="card bg-warning bg-opacity-10">
              <h5>Pending Requisitions</h5>
              <p class="fw-bold fs-4 text-warning">${summary.pending_requisitions}</p>
            </div>
            <div class="card bg-success bg-opacity-10">
              <h5>Dispatches Today</h5>
              <p class="fw-bold fs-4 text-success">${summary.dispatches_today}</p>
            </div>
            <div class="card bg-purple bg-opacity-10">
              <h5>Total Net Worth</h5>
              <p class="fw-bold fs-4">GHS ${Number(summary.total_net_worth).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
          </div>

          <div class="mt-4 p-3 bg-light rounded">
            <p><strong>Note:</strong> This report is generated from Super Admin Dashboard API and includes only aggregated metrics.</p>
          </div>

          <div class="no-print mt-4">
            <button class="btn btn-primary" onclick="window.print()">Print Report</button>
            <button class="btn btn-secondary" onclick="window.close()">Close</button>
          </div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();

    Swal.fire({
      icon: 'success',
      title: 'PDF Export Ready!',
      text: 'Your report is ready to print or save as PDF.',
      confirmButtonColor: '#28a745'
    });
  };

  const closeGeneratedModal = () => {
    setShowGeneratedModal(false);
  };

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Reports & Analytics</h2>
        <button className="btn btn-primary d-flex align-items-center" disabled>
          <FaDownload className="me-2" /> Export Report
        </button>
      </div>

      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 pt-4">
              <h5 className="mb-0 fw-bold">Generate Report from Dashboard</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleGenerateReport}>
                <div className="mb-3">
                  <label className="form-label fw-bold">Report Type</label>
                  <select 
                    className="form-select" 
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    disabled
                  >
                    <option>Requisition Summary (Dashboard-Based)</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Date Range (for reference only)</label>
                  <div className="input-group">
                    <input 
                      type="date" 
                      className="form-control" 
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                    />
                    <span className="input-group-text">to</span>
                    <input 
                      type="date" 
                      className="form-control" 
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                    />
                  </div>
                  <small className="text-muted">Note: Dashboard API returns live data (not filtered by date)</small>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Facility</label>
                  <select 
                    className="form-select"
                    value={facility}
                    onChange={(e) => setFacility(e.target.value)}
                  >
                    <option>All Facilities</option>
                    <option value="1">Main Hospital</option>
                    <option value="2">Kumasi Branch Hospital</option>
                    <option value="3">Accra Central Hospital</option>
                    <option value="4">Takoradi Clinic</option>
                    <option value="5">Cape Coast Hospital</option>
                  </select>
                </div>
                <button 
                  type="submit" 
                  className="btn btn-primary w-100 d-flex align-items-center justify-content-center"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span> Generating...
                    </>
                  ) : (
                    <>
                      <FaChartLine className="me-2" /> Generate Report
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 pt-4">
              <h5 className="mb-0 fw-bold">Preview (Static)</h5>
            </div>
            <div className="card-body text-center d-flex flex-column justify-content-center">
              <FaBuilding size={48} className="text-muted mb-3" />
              <p className="text-muted">
                Live dashboard metrics will appear in the report.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Generated Report Modal */}
      {showGeneratedModal && generatedReport && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{generatedReport.type}</h5>
                <button type="button" className="btn-close" onClick={closeGeneratedModal}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <strong>Date Range:</strong> {generatedReport.dateFrom} to {generatedReport.dateTo} <br />
                  <strong>Facility:</strong> {generatedReport.facility} <br />
                  <strong>Generated:</strong> {generatedReport.generatedAt}
                </div>

                <div style={{ height: '250px', marginBottom: '20px' }}>
                  <Bar data={generatedReport.chartData} options={{ 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      y: { beginAtZero: true },
                      x: { grid: { display: false } }
                    }
                  }} />
                </div>

                <div className="row text-center">
                  {[
                    { label: 'Inventory Items', value: generatedReport.summary.total_inventory_items, color: 'primary' },
                    { label: 'Facilities', value: generatedReport.summary.total_facilities, color: 'info' },
                    { label: 'Pending Reqs', value: generatedReport.summary.pending_requisitions, color: 'warning' },
                    { label: 'Dispatches Today', value: generatedReport.summary.dispatches_today, color: 'success' },
                    { label: 'Net Worth (GHS)', value: Number(generatedReport.summary.total_net_worth).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }), color: 'purple' }
                  ].map((item, i) => (
                    <div className="col-md-4 mb-3" key={i}>
                      <div className={`card bg-${item.color} bg-opacity-10 border-0`}>
                        <div className="card-body">
                          <div className={`text-${item.color} fw-bold fs-5`}>{item.value}</div>
                          <small>{item.label}</small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="d-flex justify-content-end mt-3">
                  <button className="btn btn-primary" onClick={exportToPDF}>
                    <FaFilePdf className="me-2" /> Export PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {showGeneratedModal && <div className="modal-backdrop show"></div>}
    </div>
  );
};

export default SuperAdminReports;