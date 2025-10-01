import React, { useState, useEffect } from 'react';
import { 
  FaSearch, FaFileCsv, FaFilePdf, FaFilter, 
  FaBox, FaExclamationTriangle 
} from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import BaseUrl from '../../Api/BaseUrl';

const FacilityUserInventory = () => {
  const [inventoryData, setInventoryData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [facilityId, setFacilityId] = useState(null);

  const baseUrl = BaseUrl;
  
  useEffect(() => {
    const userString = localStorage.getItem('user');
    
    if (userString) {
      try {
        const user = JSON.parse(userString);
        console.log('User data from localStorage:', user);
        if (user && user.facility_id) {
          console.log('Facility ID found in user data:', user.facility_id);
          setFacilityId(user.facility_id);
        } else {
          setError('Facility ID not found in user data. Please check your login status.');
          setLoading(false);
        }
      } catch (e) {
        setError(`Error parsing user data from localStorage: ${e.message}`);
        setLoading(false);
      }
    } else {
      setError('User not found in localStorage. Please check your login status.');
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    const fetchInventoryData = async () => {
      if (!facilityId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await axios.get(`${baseUrl}/inventory/${facilityId}`);
        
        if (response.data.success) {
          const d = response.data.data || {};
          const expiryRaw = d.updated_at || d.expiry_date || new Date().toISOString();
          const transformedData = [{
            id: d.id,
            itemName: d.item_name || d.name || 'Unknown Item',
            category: d.category || "Medicines",
            batch: d.item_code || "B001",
            lot: `L-${d.id || '0'}`,
            expiryDate: expiryRaw.split ? expiryRaw.split('T')[0] : expiryRaw,
            availableQty: d.quantity || 0,
            remarks: d.remarks || "-"
          }];
          
          setInventoryData(transformedData);
          setFilteredData(transformedData);
        } else {
          throw new Error('API returned unsuccessful response');
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch inventory data');
        console.error('Error fetching inventory data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInventoryData();
  }, [facilityId, baseUrl]);

  useEffect(() => {
    if (searchTerm === '') {
      setFilteredData(inventoryData);
    } else {
      const filtered = inventoryData.filter(item => 
        item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.batch.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.lot.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredData(filtered);
    }
  }, [searchTerm, inventoryData]);

  const handleExportCSV = () => alert('Exporting data to CSV');
  const handleExportPDF = () => alert('Exporting data to PDF');

  const getExpiryStatus = (expiryDate, qty) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

    if (qty === 0) return { text: "Out of Stock", class: "bg-danger" };
    if (diffDays < 0) return { text: "Expired", class: "bg-danger" };
    if (diffDays <= 30) return { text: "Expiring Soon", class: "bg-warning text-dark" };
    if (diffDays <= 90) return { text: "Near Expiry", class: "bg-info text-dark" };
    return { text: "In Stock", class: "bg-success" };
  };

  return (
    <div className="container-fluid py-4 px-3 px-md-4">
      <h2 className="mb-4">Facility Inventory</h2>

      {error && (
        <div className="alert alert-danger d-flex align-items-center" role="alert">
          <FaExclamationTriangle className="me-2" />
          <div>{error}</div>
        </div>
      )}

      {/* Search & Export */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body d-flex flex-wrap justify-content-between gap-2">
          <div className="input-group" style={{ maxWidth: '300px' }}>
            <span className="input-group-text"><FaSearch /></span>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Search by item name, batch, lot..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-success" onClick={handleExportCSV}>
              <FaFileCsv /> CSV
            </button>
            <button className="btn btn-outline-danger" onClick={handleExportPDF}>
              <FaFilePdf /> PDF
            </button>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary"></div>
              <p className="mt-2 text-muted">Loading inventory data...</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Item Name</th>
                    <th>Category</th>
                    <th>Batch / Lot</th>
                    <th>Expiry Date</th>
                    <th>Available Qty</th>
                    <th>Status</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length > 0 ? (
                    filteredData.map((item) => {
                      const status = getExpiryStatus(item.expiryDate, item.availableQty);
                      return (
                        <tr key={item.id}>
                          <td>{item.itemName}</td>
                          <td>{item.category}</td>
                          <td>{item.batch} / {item.lot}</td>
                          <td>{new Date(item.expiryDate).toLocaleDateString()}</td>
                          <td>{item.availableQty}</td>
                          <td>
                            <span className={`badge ${status.class}`}>
                                {status.text}
                              </span>
                          </td>
                          <td>{item.remarks}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center py-4 text-muted">
                        <FaBox size={20} className="me-2" />
                        No inventory items found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacilityUserInventory;
