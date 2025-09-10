import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { 
  FaDownload, FaChartLine, FaWarehouse, FaExchangeAlt, FaClock, FaListAlt, FaBuilding
} from 'react-icons/fa';

const WarehouseReports = () => {
  // State
  const [reportType, setReportType] = useState('Stock Valuation');
  const [facility, setFacility] = useState('All Facilities');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Chart data
  const reportChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [
      {
        label: reportType,
        data: [120, 90, 150, 100, 130],
        backgroundColor: '#3498db',
        borderRadius: 6,
        barThickness: 40
      }
    ]
  };

  const reportChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: `${reportType} Report`,
        font: { size: 16, weight: 'bold' },
        padding: { top: 10, bottom: 20 }
      }
    },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
      x: { grid: { display: false } }
    }
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
        <h2 className="fw-bold mb-2">Warehouse Reports & Analytics</h2>
        <button className="btn btn-primary d-flex align-items-center">
          <FaDownload className="me-2" /> Export Report
        </button>
      </div>

      <div className="row">
        {/* Generate Custom Report */}
        <div className="col-md-6 mb-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 pt-4">
              <h5 className="mb-0 fw-bold">Generate Custom Report</h5>
            </div>
            <div className="card-body">
              <form>
                {/* Report Type */}
                <div className="mb-3">
                  <label className="form-label fw-bold">Report Type</label>
                  <select 
                    className="form-select"
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                  >
                    <option>Stock Valuation</option>
                    <option>Stock Movement</option>
                    <option>Stock Ageing</option>
                    <option>Item Ledger</option>
                    <option>Facility Stock View</option>
                  </select>
                </div>

                {/* Date Range */}
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

                {/* Facility */}
                <div className="mb-3">
                  <label className="form-label fw-bold">Facility</label>
                  <select 
                    className="form-select"
                    value={facility}
                    onChange={(e) => setFacility(e.target.value)}
                  >
                    <option>All Facilities</option>
                    <option>Main Warehouse</option>
                    <option>North Branch</option>
                    <option>South Branch</option>
                    <option>East Branch</option>
                  </select>
                </div>

                <button type="submit" className="btn btn-primary w-100 d-flex align-items-center justify-content-center">
                  <FaChartLine className="me-2" /> Generate Report
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Chart Preview */}
        <div className="col-md-6 mb-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 pt-4">
              <h5 className="mb-0 fw-bold">Report Preview</h5>
            </div>
            <div className="card-body" style={{ height: '320px' }}>
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
            {/* Stock Valuation */}
            <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center p-3">
                  <div className="bg-primary bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                    <FaWarehouse className="text-primary fa-2x" />
                  </div>
                  <h6 className="fw-bold">Stock Valuation</h6>
                  <button className="btn btn-sm btn-outline-primary mt-2">Generate</button>
                </div>
              </div>
            </div>
            {/* Stock Movement */}
            <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center p-3">
                  <div className="bg-success bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                    <FaExchangeAlt className="text-success fa-2x" />
                  </div>
                  <h6 className="fw-bold">Stock Movement</h6>
                  <button className="btn btn-sm btn-outline-primary mt-2">Generate</button>
                </div>
              </div>
            </div>
            {/* Stock Ageing */}
            <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center p-3">
                  <div className="bg-warning bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                    <FaClock className="text-warning fa-2x" />
                  </div>
                  <h6 className="fw-bold">Stock Ageing</h6>
                  <button className="btn btn-sm btn-outline-primary mt-2">Generate</button>
                </div>
              </div>
            </div>
            {/* Item Ledger */}
            <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center p-3">
                  <div className="bg-danger bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                    <FaListAlt className="text-danger fa-2x" />
                  </div>
                  <h6 className="fw-bold">Item Ledger</h6>
                  <button className="btn btn-sm btn-outline-primary mt-2">Generate</button>
                </div>
              </div>
            </div>
            {/* Facility Stock View */}
            <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center p-3">
                  <div className="bg-info bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                    <FaBuilding className="text-info fa-2x" />
                  </div>
                  <h6 className="fw-bold">Facility Stock View</h6>
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

export default WarehouseReports;
