import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { 
  FaDownload, FaChartLine, FaTable, FaSearch, FaBuilding,
  FaFilePdf, FaFileExcel
} from 'react-icons/fa';
import BaseUrl from '../../Api/BaseUrl';
import axiosInstance from '../../Api/axiosInstance';
import Swal from 'sweetalert2'; // Import SweetAlert2

const SuperAdminReports = () => {
  // State for form inputs
  const [reportType, setReportType] = useState('Requisition Summary');
  const [facility, setFacility] = useState('All Facilities');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for modals
  const [showRequisitionModal, setShowRequisitionModal] = useState(false);
  const [showGeneratedModal, setShowGeneratedModal] = useState(false);
  
  // State for generated report data
  const [generatedReport, setGeneratedReport] = useState(null);
  
  // State for API data
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Chart options (shared)
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
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
  
  // Mock data for different report types
  const requisitionData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Requisition Count',
        data: [42, 38, 55, 32, 48, 60],
        backgroundColor: '#e74a3b',
        borderRadius: 8,
        barThickness: 30
      }
    ]
  };
  
  // === FETCH REPORT DATA ===
  const fetchReportData = async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (filters.facility_id && filters.facility_id !== 'All Facilities') {
        params.append('facility_id', filters.facility_id);
      }
      if (filters.status) {
        params.append('status', filters.status);
      }
      if (filters.date_from) {
        params.append('date_from', filters.date_from);
      }
      if (filters.date_to) {
        params.append('date_to', filters.date_to);
      }
      
      const response = await axiosInstance.get(`${BaseUrl}/reports/requisitions?${params.toString()}`);
      if (response.data.success) {
        setReportData(response.data.data);
      } else {
        setError('Failed to fetch report data');
        Swal.fire({
          icon: 'error',
          title: 'Fetch Failed',
          text: 'Failed to fetch report data',
          confirmButtonColor: '#e74a3b'
        });
      }
    } catch (err) {
      setError('Error fetching report data: ' + err.message);
      Swal.fire({
        icon: 'error',
        title: 'Network Error',
        text: 'Error fetching report data: ' + err.message,
        confirmButtonColor: '#e74a3b'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // === EXPORT TO PDF ===
  const exportToPDF = (reportData, reportType) => {
    // Show confirmation alert
    Swal.fire({
      title: 'Export Report?',
      text: "This will generate a PDF report in a new window",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, export!'
    }).then((result) => {
      if (result.isConfirmed) {
        // Create a new window for printing
        const printWindow = window.open('', '_blank');
        
        // Create HTML content for the report
        let htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>${reportType} Report</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <style>
              body { font-family: Arial, sans-serif; }
              .header { text-align: center; margin-bottom: 20px; }
              .summary-card { border: 1px solid #ddd; border-radius: 5px; padding: 15px; margin-bottom: 20px; }
              .table { width: 100%; border-collapse: collapse; }
              .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              .table th { background-color: #f2f2f2; }
              .badge { display: inline-block; padding: 3px 7px; font-size: 12px; font-weight: bold; border-radius: 4px; }
              .badge-success { background-color: #28a745; color: white; }
              .badge-warning { background-color: #ffc107; color: black; }
              .badge-danger { background-color: #dc3545; color: white; }
              @media print {
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="container-fluid">
              <div class="header">
                <h2>${reportType} Report</h2>
                <p>Generated on: ${new Date().toLocaleDateString()}</p>
              </div>
        `;
        
        // Add summary cards if available
        if (reportData?.summary && reportType === 'Requisition Summary') {
          htmlContent += `
            <div class="row mb-4">
              <div class="col-md-3">
                <div class="summary-card">
                  <h5 class="text-primary">${reportData.summary.total_requisitions}</h5>
                  <p class="mb-0">Total Requisitions</p>
                </div>
              </div>
              <div class="col-md-3">
                <div class="summary-card">
                  <h5 class="text-warning">${reportData.summary.pending_count}</h5>
                  <p class="mb-0">Pending</p>
                </div>
              </div>
              <div class="col-md-3">
                <div class="summary-card">
                  <h5 class="text-success">${reportData.summary.approved_count}</h5>
                  <p class="mb-0">Approved</p>
                </div>
              </div>
              <div class="col-md-3">
                <div class="summary-card">
                  <h5 class="text-info">${reportData.summary.avg_processing_days}</h5>
                  <p class="mb-0">Avg. Processing Days</p>
                </div>
              </div>
            </div>
          `;
        }
        
        // Add chart image placeholder
        htmlContent += `
          <div class="mb-4 text-center">
            <h4>Chart Visualization</h4>
            <div class="alert alert-info">
              Chart visualization would appear here in the actual application
            </div>
          </div>
        `;
        
        // Add table based on report type
        if (reportType === 'Requisition Summary' && reportData?.requisitions) {
          htmlContent += `
            <h4>Requisition Details</h4>
            <table class="table">
              <thead>
                <tr>
                  <th>Req ID</th>
                  <th>Facility</th>
                  <th>User</th>
                  <th>Items</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Processing Days</th>
                </tr>
              </thead>
              <tbody>
          `;
          
          reportData.requisitions.forEach(req => {
            const statusClass = req.status === 'approved' ? 'badge-success' : 
                                 req.status === 'pending' ? 'badge-warning' : 'badge-danger';
            
            htmlContent += `
              <tr>
                <td>#${req.id}</td>
                <td>${req.facility_name}</td>
                <td>${req.user_name}</td>
                <td>${req.item_count}</td>
                <td><span class="badge ${statusClass}">${req.status.charAt(0).toUpperCase() + req.status.slice(1)}</span></td>
                <td>${new Date(req.created_at).toLocaleDateString()}</td>
                <td>${req.processing_days}</td>
              </tr>
            `;
          });
          
          htmlContent += `
              </tbody>
            </table>
          `;
        }
        
        // Add summary section
        htmlContent += `
          <div class="mt-4 p-3 bg-light rounded">
            <h5>Report Summary</h5>
        `;
        
        if (reportType === 'Requisition Summary' && reportData?.summary) {
          htmlContent += `
            <p>Total Requisitions: <span class="fw-bold">${reportData.summary.total_requisitions}</span></p>
            <p>Pending: <span class="fw-bold">${reportData.summary.pending_count}</span>, Approved: <span class="fw-bold">${reportData.summary.approved_count}</span>, Delivered: <span class="fw-bold">${reportData.summary.delivered_count}</span>, Rejected: <span class="fw-bold">${reportData.summary.rejected_count}</span></p>
            <p>Average Processing Days: <span class="fw-bold">${reportData.summary.avg_processing_days}</span></p>
          `;
        }
        
        htmlContent += `
          </div>
          <div class="no-print mt-4">
            <button class="btn btn-primary" onclick="window.print()">Print Report</button>
            <button class="btn btn-secondary" onclick="window.close()">Close</button>
          </div>
        </div>
        </body>
        </html>
        `;
        
        // Write the HTML content to the new window
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        
        // Show success alert
        Swal.fire({
          icon: 'success',
          title: 'PDF Exported!',
          text: 'Your report has been exported successfully',
          confirmButtonColor: '#28a745'
        });
      }
    });
  };
  
  // Modal handlers
  const openRequisitionModal = async () => {
    await fetchReportData();
    setShowRequisitionModal(true);
  };
  
  const handleGenerateReport = async (e) => {
    e.preventDefault();
    
    // Build filters based on form inputs
    const filters = {};
    if (facility !== 'All Facilities') {
      filters.facility_id = facility;
    }
    if (dateFrom) {
      filters.date_from = dateFrom;
    }
    if (dateTo) {
      filters.date_to = dateTo;
    }
    
    // Fetch data with filters
    await fetchReportData(filters);
    
    setGeneratedReport({
      type: reportType,
      facility: facility,
      dateFrom: dateFrom,
      dateTo: dateTo,
      data: reportData?.requisitions || [],
      summary: reportData?.summary || null
    });
    setShowGeneratedModal(true);
    
    // Show success alert
    Swal.fire({
      icon: 'success',
      title: 'Report Generated!',
      text: 'Your custom report has been generated successfully',
      confirmButtonColor: '#28a745'
    });
  };
  
  // Filter data based on search term
  const filterData = (data) => {
    if (!searchTerm.trim()) return data;
    
    const term = searchTerm.toLowerCase();
    return data.filter(req => 
      req.id.toString().includes(term) ||
      req.facility_name.toLowerCase().includes(term) ||
      req.status.toLowerCase().includes(term) ||
      req.user_name.toLowerCase().includes(term)
    );
  };
  
  // Get chart data based on report type
  const getChartData = (type) => {
    switch(type) {
      case 'Requisition Summary': return requisitionData;
      default: return requisitionData;
    }
  };

  // Get chart title based on report type
  const getChartTitle = (type) => {
    switch(type) {
      case 'Requisition Summary': return 'Monthly Requisition Count';
      default: return 'Report Data';
    }
  };
  
  // Close modals
  const closeRequisitionModal = () => {
    setShowRequisitionModal(false);
    setSearchTerm(''); // Reset search term
  };
  
  const closeGeneratedModal = () => {
    setShowGeneratedModal(false);
    setSearchTerm(''); // Reset search term
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
              <form onSubmit={handleGenerateReport}>
                <div className="mb-3">
                  <label className="form-label fw-bold">Report Type</label>
                  <select 
                    className="form-select" 
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                  >
                    <option>Requisition Summary</option>
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
                    <option value="1">Main Hospital</option>
                    <option value="2">Kumasi Branch Hospital</option>
                    <option value="3">Accra Central Hospital</option>
                    <option value="4">Takoradi Clinic</option>
                    <option value="5">Cape Coast Hospital</option>
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
              <Bar 
                data={getChartData(reportType)} 
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    title: {
                      ...chartOptions.plugins.title,
                      text: getChartTitle(reportType)
                    }
                  }
                }} 
              />
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
            <div className="col-md-4 col-sm-6 mb-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center p-3">
                  <div className="bg-danger bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                    <FaSearch className="text-danger fa-2x" />
                  </div>
                  <h6 className="fw-bold">Requisition Summary</h6>
                  <button className="btn btn-sm btn-outline-primary mt-2" onClick={openRequisitionModal}>Generate</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Requisition Summary Modal */}
      {showRequisitionModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Requisition Summary Report</h5>
                <button type="button" className="btn-close" onClick={closeRequisitionModal}></button>
              </div>
              <div className="modal-body">
                {loading && (
                  <div className="d-flex justify-content-center my-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                )}
                
                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}
                
                {!loading && !error && (
                  <>
                    <div className="mb-4">
                      <Bar 
                        data={requisitionData} 
                        options={{
                          ...chartOptions,
                          plugins: {
                            ...chartOptions.plugins,
                            title: {
                              ...chartOptions.plugins.title,
                              text: 'Monthly Requisition Count'
                            }
                          }
                        }} 
                      />
                    </div>
                    
                    {reportData && (
                      <div className="row mb-4">
                        <div className="col-md-3">
                          <div className="card bg-primary bg-opacity-10 border-0">
                            <div className="card-body text-center">
                              <h5 className="text-primary">{reportData.summary.total_requisitions}</h5>
                              <p className="mb-0">Total Requisitions</p>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="card bg-warning bg-opacity-10 border-0">
                            <div className="card-body text-center">
                              <h5 className="text-warning">{reportData.summary.pending_count}</h5>
                              <p className="mb-0">Pending</p>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="card bg-success bg-opacity-10 border-0">
                            <div className="card-body text-center">
                              <h5 className="text-success">{reportData.summary.approved_count}</h5>
                              <p className="mb-0">Approved</p>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="card bg-info bg-opacity-10 border-0">
                            <div className="card-body text-center">
                              <h5 className="text-info">{reportData.summary.avg_processing_days}</h5>
                              <p className="mb-0">Avg. Processing Days</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Search */}
                    <div className="mb-3">
                      <div className="input-group">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search requisitions..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button className="btn btn-outline-secondary" type="button">
                          <FaSearch />
                        </button>
                      </div>
                    </div>
                    
                    <div className="table-responsive">
                      <table className="table table-sm">
                        <thead>
                          <tr>
                            <th>Req ID</th>
                            <th>Facility</th>
                            <th>User</th>
                            <th>Items</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Processing Days</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filterData(reportData?.requisitions || []).map((item, index) => (
                            <tr key={index}>
                              <td>#{item.id}</td>
                              <td>{item.facility_name}</td>
                              <td>{item.user_name}</td>
                              <td>{item.item_count}</td>
                              <td>
                                <span className={`badge ${
                                  item.status === 'approved' ? 'bg-success' : 
                                  item.status === 'pending' ? 'bg-warning' : 'bg-danger'
                                }`}>
                                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                </span>
                              </td>
                              <td>{new Date(item.created_at).toLocaleDateString()}</td>
                              <td>{item.processing_days}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="d-flex justify-content-between mt-4">
                      <div>
                        <h6>Summary</h6>
                        {reportData ? (
                          <>
                            <p>Total Requisitions: <span className="fw-bold">{reportData.summary.total_requisitions}</span></p>
                            <p>Pending: <span className="fw-bold">{reportData.summary.pending_count}</span>, Approved: <span className="fw-bold">{reportData.summary.approved_count}</span>, Delivered: <span className="fw-bold">{reportData.summary.delivered_count}</span>, Rejected: <span className="fw-bold">{reportData.summary.rejected_count}</span></p>
                            <p>Average Processing Days: <span className="fw-bold">{reportData.summary.avg_processing_days}</span></p>
                          </>
                        ) : (
                          <p>No data available</p>
                        )}
                      </div>
                      <div className="d-flex align-items-end">
                        <button className="btn btn-primary me-2" onClick={() => exportToPDF(reportData, 'Requisition Summary')}>
                          <FaFilePdf className="me-2" /> Export PDF
                        </button>
                        <button className="btn btn-success">
                          <FaFileExcel className="me-2" /> Export Excel
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generated Report Modal */}
      {showGeneratedModal && generatedReport && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{generatedReport.type} - {generatedReport.facility}</h5>
                <button type="button" className="btn-close" onClick={closeGeneratedModal}></button>
              </div>
              <div className="modal-body">
                <div className="d-flex justify-content-between mb-4">
                  <div>
                    <p><strong>Date Range:</strong> {generatedReport.dateFrom || 'N/A'} to {generatedReport.dateTo || 'N/A'}</p>
                    <p><strong>Generated On:</strong> {new Date().toLocaleDateString()}</p>
                  </div>
                  <div>
                    <button className="btn btn-primary me-2" onClick={() => exportToPDF(reportData, generatedReport.type)}>
                      <FaFilePdf className="me-2" /> Export PDF
                    </button>
                    <button className="btn btn-success">
                      <FaFileExcel className="me-2" /> Export Excel
                    </button>
                  </div>
                </div>
                
                <div className="mb-4">
                  <Bar 
                    data={getChartData(generatedReport.type)} 
                    options={{
                      ...chartOptions,
                      plugins: {
                        ...chartOptions.plugins,
                        title: {
                          ...chartOptions.plugins.title,
                          text: getChartTitle(generatedReport.type)
                        }
                      }
                    }} 
                  />
                </div>
                
                {/* Search */}
                <div className="mb-3">
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search requisitions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className="btn btn-outline-secondary" type="button">
                      <FaSearch />
                    </button>
                  </div>
                </div>
                
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Req ID</th>
                        <th>Facility</th>
                        <th>User</th>
                        <th>Items</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Processing Days</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filterData(generatedReport.data).map((item, index) => (
                        <tr key={index}>
                          <td>#{item.id}</td>
                          <td>{item.facility_name}</td>
                          <td>{item.user_name}</td>
                          <td>{item.item_count}</td>
                          <td>
                            <span className={`badge ${
                              item.status === 'approved' ? 'bg-success' : 
                              item.status === 'pending' ? 'bg-warning' : 'bg-danger'
                            }`}>
                              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                            </span>
                          </td>
                          <td>{new Date(item.created_at).toLocaleDateString()}</td>
                          <td>{item.processing_days}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-4 p-3 bg-light rounded">
                  <h6>Report Summary</h6>
                  {generatedReport.type === 'Requisition Summary' && (
                    <>
                      {generatedReport.summary ? (
                        <>
                          <p>Total Requisitions: <span className="fw-bold">{generatedReport.summary.total_requisitions}</span></p>
                          <p>Pending: <span className="fw-bold">{generatedReport.summary.pending_count}</span>, Approved: <span className="fw-bold">{generatedReport.summary.approved_count}</span>, Delivered: <span className="fw-bold">{generatedReport.summary.delivered_count}</span>, Rejected: <span className="fw-bold">{generatedReport.summary.rejected_count}</span></p>
                          <p>Average Processing Days: <span className="fw-bold">{generatedReport.summary.avg_processing_days}</span></p>
                        </>
                      ) : (
                        <>
                          <p>Total Requisitions: <span className="fw-bold">{generatedReport.data.length}</span></p>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Backdrop */}
      {(showRequisitionModal || showGeneratedModal) && (
        <div className="modal-backdrop show"></div>
      )}
    </div>
  );
};

export default SuperAdminReports;