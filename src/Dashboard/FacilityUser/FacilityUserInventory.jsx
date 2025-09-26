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
  const [userId, setUserId] = useState(null);

  const baseUrl = BaseUrl;
  
  useEffect(() => {
    const possibleKeys = ['userId', 'user_id', 'id', 'user', 'userData', 'authUser'];
    let foundUserId = null;
    
    for (const key of possibleKeys) {
      const value = localStorage.getItem(key);
      if (value) {
        try {
          const parsedValue = JSON.parse(value);
          if (parsedValue && parsedValue.id) {
            foundUserId = parsedValue.id;
            break;
          } else if (value && !isNaN(value)) {
            foundUserId = value;
            break;
          }
        } catch {
          if (value && !isNaN(value)) {
            foundUserId = value;
            break;
          }
        }
      }
    }
    
    if (foundUserId) {
      setUserId(foundUserId);
    } else {
      setError('User ID not found in localStorage. Please check your login status.');
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    const fetchInventoryData = async () => {
      if (!userId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await axios.get(`${baseUrl}/inventory/${userId}`);
        
        if (response.data.success) {
          // ✅ Transform API data for table
          const transformedData = [{
            id: response.data.data.id,
            itemName: response.data.data.item_name,
            category: response.data.data.category || "Medicines",
            batch: response.data.data.item_code || "B001",
            lot: `L-${response.data.data.id}`,
            expiryDate: response.data.data.updated_at.split('T')[0],
            availableQty: response.data.data.quantity,
            remarks: "-"
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
  }, [userId, baseUrl]);

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
                              {status.icon} {status.text}
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
