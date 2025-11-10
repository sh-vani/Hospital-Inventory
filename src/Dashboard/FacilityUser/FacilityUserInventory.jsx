import React, { useState, useEffect, useRef } from "react";
import { FaSearch } from "react-icons/fa";
import axios from "axios";
import BaseUrl from "../../Api/BaseUrl";

const FacilityInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [outOfStockItems, setOutOfStockItems] = useState([]);
  const [nearExpiryItems, setNearExpiryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const hoverRef = useRef(null);

  // ✅ Fetch inventory by user_id
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);
        setError(null);

        // ✅ Get user from localStorage
        const userStr = localStorage.getItem("user");
        if (!userStr) {
          setError("User not logged in. Please log in again.");
          setLoading(false);
          return;
        }

        const user = JSON.parse(userStr);
        const userId = user?.id;

        if (!userId) {
          setError("User ID not found in localStorage.");
          setLoading(false);
          return;
        }

        // ✅ API Call
        const response = await axios.get(`${BaseUrl}/inventory/user/${userId}`);

        const inventoryData = Array.isArray(response.data?.data)
          ? response.data.data
          : [];

        // ✅ Normalize API data
        const normalized = inventoryData.map((item) => ({
          id: item.id,
          item_code: item.item_code || "N/A",
          item_name: item.item_name || "Unnamed Item",
          category: item.category || "Uncategorized",
          description: item.description || "",
          unit: item.unit || "units",
          quantity: item.quantity || 0,
          reorder_level: item.reorder_level || 0,
          item_cost: item.item_cost || 0,
          expiry_date: item.expiry_date,
          facility_name: user.facility_name || "N/A",
          updated_at: item.updated_at || new Date().toISOString(),
        }));

        // ✅ Update states
        setInventory(normalized);
        setLowStockItems(normalized.filter(i => i.quantity > 0 && i.quantity < i.reorder_level));
        setOutOfStockItems(normalized.filter(i => i.quantity === 0));
        setNearExpiryItems(normalized.filter(i => {
          if (!i.expiry_date) return false;
          const days = Math.ceil(
            (new Date(i.expiry_date) - new Date()) / (1000 * 60 * 60 * 24)
          );
          return days >= 0 && days <= 30;
        }));

        setLoading(false);
      } catch (err) {
        console.error("API Error:", err);
        setError("Failed to load inventory. Please try again.");
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  // ✅ Close modal on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (hoverRef.current && !hoverRef.current.contains(e.target)) {
        setShowViewModal(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // ✅ Filter + Pagination
  const filteredInventory = inventory.filter((item) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return (
      item.item_code.toLowerCase().includes(q) ||
      item.item_name.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentInventory = filteredInventory.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => setCurrentPage(1), [searchTerm]);

  // ✅ Modal handlers
  const openViewModal = (item) => {
    setViewItem(item);
    setShowViewModal(true);
  };

  const closeModalOnBackdrop = (e) => {
    if (e.target === e.currentTarget) setShowViewModal(false);
  };

  // ✅ Helpers
  const calculateStatus = (item) => {
    if (item.quantity === 0) return "out_of_stock";
    if (item.quantity < item.reorder_level) return "low_stock";
    if (item.expiry_date) {
      const days = Math.ceil(
        (new Date(item.expiry_date) - new Date()) / (1000 * 60 * 60 * 24)
      );
      if (days >= 0 && days <= 30) return "near_expiry";
    }
    return "in_stock";
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "out_of_stock":
        return <span className="badge bg-danger">Out of Stock</span>;
      case "low_stock":
        return <span className="badge bg-warning text-dark">Low Stock</span>;
      case "near_expiry":
        return <span className="badge bg-info text-dark">Near Expiry</span>;
      default:
        return <span className="badge bg-success">In Stock</span>;
    }
  };

  const formatDate = (date) => (date ? new Date(date).toLocaleDateString() : "N/A");

  const daysUntilExpiry = (expiry) => {
    if (!expiry) return null;
    return Math.ceil(
      (new Date(expiry) - new Date()) / (1000 * 60 * 60 * 24)
    );
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const renderPagination = () => {
    if (filteredInventory.length === 0) return null;
    const pageNumbers = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pageNumbers.push(i);

    return (
      <nav className="d-flex justify-content-center mt-3">
        <ul className="pagination mb-0">
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => goToPage(currentPage - 1)}>Previous</button>
          </li>
          {start > 1 && (
            <>
              <li className="page-item"><button className="page-link" onClick={() => goToPage(1)}>1</button></li>
              {start > 2 && <li className="page-item disabled"><span className="page-link">...</span></li>}
            </>
          )}
          {pageNumbers.map((num) => (
            <li key={num} className={`page-item ${num === currentPage ? "active" : ""}`}>
              <button className="page-link" onClick={() => goToPage(num)}>{num}</button>
            </li>
          ))}
          {end < totalPages && (
            <>
              {end < totalPages - 1 && <li className="page-item disabled"><span className="page-link">...</span></li>}
              <li className="page-item"><button className="page-link" onClick={() => goToPage(totalPages)}>{totalPages}</button></li>
            </>
          )}
          <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => goToPage(currentPage + 1)}>Next</button>
          </li>
        </ul>
      </nav>
    );
  };

  // ✅ RENDER
  return (
    <div className="container-fluid py-3">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <h2 className="fw-bold mb-0">Facility Inventory</h2>
        <div className="input-group" style={{ maxWidth: "320px", width: "100%" }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search by Item Code, Name, or Category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="btn btn-outline-secondary" type="button">
            <FaSearch />
          </button>
        </div>
      </div>

      {/* Loading / Error */}
      {loading && (
        <div className="text-center py-4">
          <div className="spinner-border" role="status"></div>
        </div>
      )}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Table */}
      {!loading && !error && (
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white border-0 py-3">
            <h5 className="mb-0">Inventory Items</h5>
          </div>
          <div className="table-responsive">
            <table className="table table-hover mb-0 align-middle">
              <thead className="bg-light">
                <tr>
                  <th>Item Code</th>
                  <th>Item Name</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Reorder Level</th>
                  <th>Item Cost</th>
                  <th>Expiry Date</th>
                  <th>Facility</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentInventory.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="text-center py-4">
                      {searchTerm ? "No items match your search." : "No inventory items found."}
                    </td>
                  </tr>
                ) : (
                  currentInventory.map((item) => (
                    <tr key={item.id}>
                      <td className="fw-bold">{item.item_code}</td>
                      <td>{item.item_name}</td>
                      <td><span className="badge bg-light text-dark">{item.category}</span></td>
                      <td className={item.quantity < item.reorder_level ? "text-warning fw-medium" : "text-success fw-medium"}>
                        {item.quantity.toLocaleString()}
                      </td>
                      <td>{item.reorder_level}</td>
                      <td>GHS {parseFloat(item.item_cost).toFixed(2)}</td>
                      <td>
                        {item.expiry_date ? (
                          <span className={daysUntilExpiry(item.expiry_date) <= 30 ? "text-info fw-medium" : ""}>
                            {formatDate(item.expiry_date)}
                          </span>
                        ) : "N/A"}
                      </td>
                      <td>{item.facility_name}</td>
                      <td>{getStatusBadge(calculateStatus(item))}</td>
                      <td>
                        <button className="btn btn-sm btn-outline-success" onClick={() => openViewModal(item)}>
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {renderPagination()}
        </div>
      )}

      {/* View Modal */}
      {showViewModal && viewItem && (
        <>
          <div className="modal fade show d-block" tabIndex="-1" onClick={closeModalOnBackdrop}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header border-bottom-0">
                  <h5 className="modal-title">Item Details: {viewItem.item_name}</h5>
                  <button type="button" className="btn-close" onClick={() => setShowViewModal(false)}></button>
                </div>
                <div className="modal-body">
                  {[
                    ["Item Code", viewItem.item_code],
                    ["Name", viewItem.item_name],
                    ["Category", viewItem.category],
                    ["Description", viewItem.description || "—"],
                    ["Stock", `${viewItem.quantity} ${viewItem.unit}`],
                    ["Reorder Level", viewItem.reorder_level],
                    ["Item Cost", `GHS ${parseFloat(viewItem.item_cost).toFixed(2)}`],
                    ["Expiry Date", viewItem.expiry_date ? formatDate(viewItem.expiry_date) : "N/A"],
                    ["Facility", viewItem.facility_name],
                    ["Last Updated", new Date(viewItem.updated_at).toLocaleString()],
                    ["Status", getStatusBadge(calculateStatus(viewItem))],
                  ].map(([label, value], idx) => (
                    <div className="row mb-2" key={idx}>
                      <div className="col-6 fw-bold">{label}:</div>
                      <div className="col-6">{value}</div>
                    </div>
                  ))}
                </div>
                <div className="modal-footer border-top-0">
                  <button className="btn btn-secondary" onClick={() => setShowViewModal(false)}>Close</button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </div>
  );
};

export default FacilityInventory;
