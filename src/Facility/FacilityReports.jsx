import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const ReportsAnalytics = () => {
  const [reportType, setReportType] = useState('Inventory Report');
  const [dateRange, setDateRange] = useState('');
  const [facility, setFacility] = useState('All Facilities');

  // Data from the screenshot - values are approximately 65, 58, 79, 81
  const inventoryData = [
    { quarter: 'Q1', value: 65 },
    { quarter: 'Q2', value: 58 },
    { quarter: 'Q3', value: 79 },
    { quarter: 'Q4', value: 81 },
  ];

  // Maximum value on the chart (90 as seen in the screenshot)
  const maxValue = 90;

  return (
    <div className="container-fluid p-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <div className="row">
        {/* Left Column - Generate Custom Report */}
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Generate Custom Report</h5>
            </div>
            <div className="card-body">
              <form>
                <div className="mb-3">
                  <label htmlFor="reportType" className="form-label">Report Type</label>
                  <select 
                    className="form-select" 
                    id="reportType"
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                  >
                    <option>Inventory Report</option>
                    <option>Sales Report</option>
                    <option>Performance Report</option>
                    <option>Financial Report</option>
                  </select>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="dateRange" className="form-label">Date Range</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    id="dateRange" 
                    placeholder="Select date range"
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="facility" className="form-label">Facility</label>
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
                  </select>
                </div>
                
                <button type="button" className="btn btn-primary w-100">Generate Report</button>
              </form>
            </div>
          </div>
        </div>
        
        {/* Right Column - Report Preview */}
        <div className="col-md-8">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Report Preview</h5>
              <button className="btn btn-light btn-sm">Export Report</button>
            </div>
            <div className="card-body">
              <h6 className="mb-4">Quarterly Inventory Value</h6>
              
              {/* Chart Container */}
              <div className="chart-wrapper">
                {/* Y-axis labels */}
                <div className="y-axis">
                  <div className="y-label">90</div>
                  <div className="y-label">70</div>
                  <div className="y-label">50</div>
                  <div className="y-label">30</div>
                  <div className="y-label">10</div>
                  <div className="y-label">0</div>
                </div>
                
                {/* Bars Container */}
                <div className="bars-container">
                  {inventoryData.map((item, index) => (
                    <div key={index} className="bar-wrapper">
                      <div 
                        className="bar" 
                        style={{ 
                          height: `${(item.value / maxValue) * 100}%`,
                        }}
                      ></div>
                      <div className="x-label">{item.quarter}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Legend */}
              <div className="d-flex align-items-center justify-content-center mt-4">
                <div className="legend-color"></div>
                <span className="legend-text">Inventory Value</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .chart-wrapper {
          position: relative;
          height: 300px;
          display: flex;
          margin-left: 40px;
        }
        
        .y-axis {
          position: absolute;
          left: -40px;
          top: 0;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          font-size: 12px;
          color: #6c757d;
        }
        
        .bars-container {
          display: flex;
          align-items: flex-end;
          height: 100%;
          width: 100%;
          border-left: 1px solid #dee2e6;
          border-bottom: 1px solid #dee2e6;
          padding-left: 20px;
          padding-bottom: 30px;
        }
        
        .bar-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          margin: 0 15px;
          position: relative;
        }
        
        .bar {
          width: 60px;
          background-color: #0d6efd;
          border-radius: 4px 4px 0 0;
          transition: height 0.3s ease;
        }
        
        .x-label {
          position: absolute;
          bottom: -25px;
          font-weight: 500;
        }
        
        .legend-color {
          width: 15px;
          height: 15px;
          background-color: #0d6efd;
          margin-right: 8px;
        }
        
        .legend-text {
          font-size: 14px;
        }
      `}</style>
    </div>
  );
};

export default ReportsAnalytics;