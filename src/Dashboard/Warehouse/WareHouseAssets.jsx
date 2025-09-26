import React, { useState, useEffect } from 'react';
import { 
  FaPlus, FaSearch, FaEye, FaUserCheck, FaUserTimes ,FaEdit 
} from 'react-icons/fa';
import BaseUrl from '../../Api/BaseUrl';

const WarehouseAssets = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;
  
  // API base URL - replace with your actual base URL
  // const base_url = 'https://your-api-domain.com/api';

  // Fetch assets from API
  const fetchAssets = async (page = 1, type = '', status = 'active') => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
      });
      
      if (type) queryParams.append('type', type);
      if (status) queryParams.append('status', status);
      
      const response = await fetch(`${BaseUrl}/assets?${queryParams}`);
      const data = await response.json();
      
      if (data.success) {
        setAssets(data.data.assets);
        setCurrentPage(data.data.pagination.currentPage);
        setTotalPages(data.data.pagination.totalPages);
        setTotalItems(data.data.pagination.totalItems);
      } else {
        setError('Failed to fetch assets');
      }
    } catch (err) {
      setError('Error fetching assets: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchAssets();
  }, []);

  // Status badge
  const StatusBadge = ({ status }) => {
    const statusColors = {
      'active': 'bg-success',
      'inactive': 'bg-secondary',
      'maintenance': 'bg-warning',
      'retired': 'bg-secondary'
    };
    return <span className={`badge ${statusColors[status] || 'bg-secondary'}`}>{status}</span>;
  };

  // State for modals
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [currentAsset, setCurrentAsset] = useState(null);
  const [assignTo, setAssignTo] = useState('');

  // Handle view action
  const handleView = (asset) => {
    setCurrentAsset(asset);
    setShowViewModal(true);
  };

  // Handle assign/unassign action
  const handleAssignAction = (asset) => {
    setCurrentAsset(asset);
    setAssignTo(asset.assigned_to_name || '');
    setShowAssignModal(true);
  };

  // Submit assignment changes
  const handleAssignSubmit = () => {
    // In a real app, you would make an API call here
    const updatedAssets = assets.map(asset => {
      if (asset.id === currentAsset.id) {
        return {
          ...asset,
          assigned_to_name: assignTo,
          status: assignTo ? 'active' : 'inactive'
        };
      }
      return asset;
    });
    
    setAssets(updatedAssets);
    setShowAssignModal(false);
    
    const action = assignTo ? 'assigned' : 'unassigned';
    alert(`Asset ${currentAsset.name} has been ${action} successfully!`);
  };

  // Filter assets based on search term
  const filteredAssets = assets.filter(asset =>
    asset.id.toString().includes(searchTerm.toLowerCase()) ||
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (asset.assigned_to_name && asset.assigned_to_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    asset.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      fetchAssets(page);
    }
  };

  return (
    <div className="fade-in py-3">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Assets</h2>
        <div className="d-flex align-items-center gap-2">
          <div className="input-group" style={{ maxWidth: '300px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="btn btn-outline-secondary">
              <FaSearch />
            </button>
          </div>
          {/* <button className="btn btn-primary d-flex align-items-center">
            <FaPlus className="me-2" /> Add New Asset
          </button> */}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body text-center p-4">
              <div className="bg-primary bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                <FaUserCheck className="text-primary fa-2x" />
              </div>
              <div className="number text-primary fw-bold">
                {assets.filter(a => a.assigned_to_name).length}
              </div>
              <div className="label text-muted">Assigned Assets</div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body text-center p-4">
              <div className="bg-success bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                <FaSearch className="text-success fa-2x" />
              </div>
              <div className="number text-success fw-bold">
                {assets.filter(a => a.status === 'active' && !a.assigned_to_name).length}
              </div>
              <div className="label text-muted">Available Assets</div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body text-center p-4">
              <div className="bg-warning bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                <FaEdit className="text-warning fa-2x" />
              </div>
              <div className="number text-warning fw-bold">
                {assets.filter(a => a.status === 'maintenance').length}
              </div>
              <div className="label text-muted">In Maintenance</div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body text-center p-4">
              <div className="bg-secondary bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                <FaUserTimes className="text-secondary fa-2x" />
              </div>
              <div className="number text-secondary fw-bold">
                {assets.filter(a => a.status === 'retired').length}
              </div>
              <div className="label text-muted">Retired Assets</div>
            </div>
          </div>
        </div>
      </div>

      {/* Assets Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-0 pt-4">
          <h5 className="mb-0 fw-bold">Warehouse Asset Registry</h5>
        </div>
        <div className="card-body p-0">
          {loading ? (
            <div className="p-4 text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : error ? (
            <div className="p-4 text-center text-danger">
              {error}
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Department</th>
                      <th>Assigned To</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAssets.map((asset) => (
                      <tr key={asset.id}>
                        <td><span className="fw-bold">{asset.id}</span></td>
                        <td>{asset.name}</td>
                        <td>{asset.type}</td>
                        <td>{asset.department}</td>
                        <td>{asset.assigned_to_name || 'Unassigned'}</td>
                        <td><StatusBadge status={asset.status} /></td>
                        <td>
                          <div className="btn-group" role="group">
                            <button 
                              className="btn btn-sm btn-outline-primary" 
                              title="View"
                              onClick={() => handleView(asset)}
                            >
                              <FaEye />
                            </button>
                            {/* <button 
                              className={`btn btn-sm ${!asset.assigned_to_name ? 'btn-outline-success' : 'btn-outline-warning'}`}
                              title={!asset.assigned_to_name ? 'Assign' : 'Unassign'}
                              onClick={() => handleAssignAction(asset)}
                            >
                              {!asset.assigned_to_name ? <FaUserCheck /> : <FaUserTimes />}
                            </button> */}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredAssets.length === 0 && (
                <div className="p-4 text-center text-muted">
                  No assets found matching your search.
                </div>
              )}
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center p-3 border-top">
                  <div>
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} assets
                  </div>
                  <div className="btn-group" role="group">
                    <button 
                      className="btn btn-outline-secondary" 
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                    >
                      Previous
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        className={`btn ${currentPage === i + 1 ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => handlePageChange(i + 1)}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button 
                      className="btn btn-outline-secondary" 
                      disabled={currentPage === totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* View Asset Modal */}
      {showViewModal && currentAsset && (
        <div className="modal fade show d-block" tabIndex="-1" onClick={(e) => {
          if (e.target.classList.contains('modal')) setShowViewModal(false);
        }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Asset Details: {currentAsset.name}</h5>
                <button type="button" className="btn-close" onClick={() => setShowViewModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <p><strong>Asset ID:</strong> {currentAsset.id}</p>
                    <p><strong>Name:</strong> {currentAsset.name}</p>
                    <p><strong>Type:</strong> {currentAsset.type}</p>
                    <p><strong>Serial Number:</strong> {currentAsset.serial_number}</p>
                    <p><strong>Model:</strong> {currentAsset.model}</p>
                    <p><strong>Manufacturer:</strong> {currentAsset.manufacturer}</p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>Department:</strong> {currentAsset.department}</p>
                    <p><strong>Assigned To:</strong> {currentAsset.assigned_to_name || 'Unassigned'}</p>
                    <p><strong>Status:</strong> <StatusBadge status={currentAsset.status} /></p>
                    <p><strong>Facility:</strong> {currentAsset.facility_name}</p>
                    <p><strong>Location:</strong> {currentAsset.facility_location}</p>
                    {currentAsset.purchase_date && (
                      <p><strong>Purchase Date:</strong> {new Date(currentAsset.purchase_date).toLocaleDateString()}</p>
                    )}
                    {currentAsset.warranty_expiry && (
                      <p><strong>Warranty Expiry:</strong> {new Date(currentAsset.warranty_expiry).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowViewModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign/Unassign Modal */}
      {showAssignModal && currentAsset && (
        <div className="modal fade show d-block" tabIndex="-1" onClick={(e) => {
          if (e.target.classList.contains('modal')) setShowAssignModal(false);
        }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {!currentAsset.assigned_to_name ? 'Assign Asset' : 'Unassign Asset'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowAssignModal(false)}></button>
              </div>
              <div className="modal-body">
                <p><strong>Asset ID:</strong> {currentAsset.id}</p>
                <p><strong>Asset Name:</strong> {currentAsset.name}</p>
                <p><strong>Currently Assigned To:</strong> {currentAsset.assigned_to_name || 'Unassigned'}</p>
                
                {!currentAsset.assigned_to_name ? (
                  <div className="mb-3">
                    <label className="form-label">Assign To</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={assignTo}
                      onChange={(e) => setAssignTo(e.target.value)}
                      placeholder="Enter department or user name"
                    />
                  </div>
                ) : (
                  <div className="alert alert-warning">
                    Are you sure you want to unassign this asset from {currentAsset.assigned_to_name}?
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAssignModal(false)}>Cancel</button>
                <button type="button" className="btn btn-primary" onClick={handleAssignSubmit}>
                  {!currentAsset.assigned_to_name ? 'Assign' : 'Unassign'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Backdrop */}
      {(showViewModal || showAssignModal) && (
        <div className="modal-backdrop fade show"></div>
      )}
    </div>
  );
};

export default WarehouseAssets;