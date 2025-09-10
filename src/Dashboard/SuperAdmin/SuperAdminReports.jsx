import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { 
  FaDownload, FaChartLine, FaSearch, FaCalendarAlt, FaBuilding
} from 'react-icons/fa';

const SuperAdminReports = () => {
  // State for form inputs
  const [reportType, setReportType] = useState('Inventory Report');
  const [facility, setFacility] = useState('All Facilities');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  // Chart data and options
  const reportChartData = {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [
      {
        label: 'Inventory Value',
        data: [65, 59, 80, 81],
        backgroundColor: '#3498db',
        borderRadius: 8,
        barThickness: 40
      }
    ]
  };
  
  const reportChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Quarterly Inventory Value',
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: {
          top: 10,
          bottom: 20
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };
  
  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Reports & Analytics</h2>
        <button className="btn btn-primary d-flex align-items-center">
          <FaDownload className="me-2" /> Export Report
        </button>
      </div>
      
      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 pt-4">
              <h5 className="mb-0 fw-bold">Generate Custom Report</h5>
            </div>
            <div className="card-body">
              <form>
                <div className="mb-3">
                  <label className="form-label fw-bold">Report Type</label>
                  <select 
                    className="form-select" 
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                  >
                    <option>Inventory Report</option>
                    <option>Consumption Report</option>
                    <option>Requisition Report</option>
                    <option>Dispatch Report</option>
                    <option>Expiry Report</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Date Range</label>
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
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Facility</label>
                  <select 
                    className="form-select"
                    value={facility}
                    onChange={(e) => setFacility(e.target.value)}
                  >
                    <option>All Facilities</option>
                    <option>Main Warehouse</option>
                    <option>Kumasi Branch Hospital</option>
                    <option>Accra Central Hospital</option>
                    <option>Takoradi Clinic</option>
                    <option>Cape Coast Hospital</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary w-100 d-flex align-items-center justify-content-center">
                  <FaChartLine className="me-2" /> Generate Report
                </button>
              </form>
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 pt-4">
              <h5 className="mb-0 fw-bold">Report Preview</h5>
            </div>
            <div className="card-body" style={{ height: '300px' }}>
              <Bar data={reportChartData} options={reportChartOptions} />
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Reports */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-white border-0 pt-4">
          <h5 className="mb-0 fw-bold">Quick Reports</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-3 col-sm-6 mb-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center p-3">
                  <div className="bg-primary bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                    <FaCalendarAlt className="text-primary fa-2x" />
                  </div>
                  <h6 className="fw-bold">Monthly Inventory</h6>
                  <button className="btn btn-sm btn-outline-primary mt-2">Generate</button>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-sm-6 mb-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center p-3">
                  <div className="bg-success bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                    <FaBuilding className="text-success fa-2x" />
                  </div>
                  <h6 className="fw-bold">Facility Usage</h6>
                  <button className="btn btn-sm btn-outline-primary mt-2">Generate</button>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-sm-6 mb-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center p-3">
                  <div className="bg-warning bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                    <FaDownload className="text-warning fa-2x" />
                  </div>
                  <h6 className="fw-bold">Expiry Report</h6>
                  <button className="btn btn-sm btn-outline-primary mt-2">Generate</button>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-sm-6 mb-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center p-3">
                  <div className="bg-info bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                    <FaSearch className="text-info fa-2x" />
                  </div>
                  <h6 className="fw-bold">Custom Report</h6>
                  <button className="btn btn-sm btn-outline-primary mt-2">Generate</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminReports;