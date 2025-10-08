import React, { useState, useEffect } from 'react';
import {
  FaSearch, FaFileCsv, FaFilePdf, FaBox, FaExclamationTriangle
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
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 10;

  const baseUrl = BaseUrl;

  // ✅ Get facility ID from localStorage
  useEffect(() => {
    const userStr =
      localStorage.getItem('user') ||
      localStorage.getItem('userData') ||
      localStorage.getItem('authUser');

    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user && user.facility_id) {
          setFacilityId(user.facility_id);
          return;
        }
      } catch (e) {
        console.error('Failed to parse user data', e);
      }
    }

    setError('Facility ID not found. Please log in as a facility user.');
    setLoading(false);
  }, []);

  // ✅ Fetch facility inventory using API
  useEffect(() => {
    if (!facilityId) return;

    const fetchInventoryData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Updated endpoint
        const response = await axios.get(`${baseUrl}/inventory/fasilities/${facilityId}`);

        if (response.data?.success) {
          const rawData = Array.isArray(response.data.data)
            ? response.data.data
            : [response.data.data];

          const transformedData = rawData.map((item) => ({
            id: item.id,
            itemName: item.item_name || 'Unnamed Item',
            category: item.category || 'General',
            batch: item.item_code || 'B001',
            lot: `L-${item.id}`,
            expiryDate: item.expiry_date
              ? item.expiry_date.split('T')[0]
              : 'N/A',
            availableQty: item.quantity || 0,
            remarks: item.description || '-',
          }));

          setInventoryData(transformedData);
          setFilteredData(transformedData);
        } else {
          setInventoryData([]);
          setFilteredData([]);
        }
      } catch (err) {
        console.error('Error fetching inventory:', err);
        setError('Failed to fetch facility inventory.');
        setInventoryData([]);
        setFilteredData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInventoryData();
  }, [facilityId, baseUrl]);

  // ✅ Search filter
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredData(inventoryData);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = inventoryData.filter(
        (item) =>
          item.itemName.toLowerCase().includes(term) ||
          item.category.toLowerCase().includes(term) ||
          item.batch.toLowerCase().includes(term) ||
          item.lot.toLowerCase().includes(term)
      );
      setFilteredData(filtered);
    }
    setCurrentPage(1);
  }, [searchTerm, inventoryData]);

  // ✅ Pagination logic
  const totalPages = Math.ceil(filteredData.length / entriesPerPage);
  const indexOfLastEntry = currentPage * entriesPerPage;
  const currentEntries = filteredData.slice(
    indexOfLastEntry - entriesPerPage,
    indexOfLastEntry
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // ✅ Dummy export actions
  const handleExportCSV = () => alert('Exporting data to CSV...');
  const handleExportPDF = () => alert('Exporting data to PDF...');

  // ✅ Expiry status logic
  const getExpiryStatus = (expiryDate, qty) => {
    if (qty === 0) return { text: 'Out of Stock', class: 'bg-danger' };
    if (expiryDate === 'N/A') return { text: 'No Expiry', class: 'bg-secondary' };

    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: 'Expired', class: 'bg-danger' };
    if (diffDays <= 30) return { text: 'Expiring Soon', class: 'bg-warning text-dark' };
    if (diffDays <= 90) return { text: 'Near Expiry', class: 'bg-info text-dark' };
    return { text: 'In Stock', class: 'bg-success' };
  };

  return (
    <div className="">
      <h3 className="fw-bold mb-4">Facility Inventory</h3>

      {error && (
        <div className="alert alert-danger d-flex align-items-center" role="alert">
          <FaExclamationTriangle className="me-2" />
          <div>{error}</div>
        </div>
      )}

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body d-flex flex-wrap justify-content-between gap-2">
          <div className="input-group" style={{ maxWidth: '300px' }}>
            <span className="input-group-text">
              <FaSearch />
            </span>
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
                  {currentEntries.length > 0 ? (
                    currentEntries.map((item) => {
                      const status = getExpiryStatus(item.expiryDate, item.availableQty);
                      return (
                        <tr key={item.id}>
                          <td>{item.itemName}</td>
                          <td>{item.category}</td>
                          <td>{item.batch} / {item.lot}</td>
                          <td>
                            {item.expiryDate === 'N/A'
                              ? 'N/A'
                              : new Date(item.expiryDate).toLocaleDateString()}
                          </td>
                          <td>{item.availableQty}</td>
                          <td>
                            <span className={`badge ${status.class} rounded-pill px-2 py-1`}>
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

      {/* ✅ Pagination */}
      <div className="d-flex justify-content-end mt-3">
        <nav>
          <ul className="pagination mb-0">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
            </li>

            {filteredData.length > 0 ? (
              [...Array(totalPages)].map((_, i) => {
                const page = i + 1;
                return (
                  <li
                    key={page}
                    className={`page-item ${currentPage === page ? 'active' : ''}`}
                  >
                    <button className="page-link" onClick={() => handlePageChange(page)}>
                      {page}
                    </button>
                  </li>
                );
              })
            ) : (
              <li className="page-item disabled">
                <span className="page-link">0</span>
              </li>
            )}

            <li
              className={`page-item ${
                currentPage === totalPages || filteredData.length === 0 ? 'disabled' : ''
              }`}
            >
              <button
                className="page-link"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || filteredData.length === 0}
              >
                Next
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default FacilityUserInventory;
