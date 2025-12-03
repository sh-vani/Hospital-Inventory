import React, { useState, useEffect, useRef } from "react";
import {
  FaSearch,
  FaEdit,
  FaHistory,
  FaPlus,
  FaExclamationTriangle,
  FaClock,
  FaTimes,
  FaArrowRight,
} from "react-icons/fa";
import BaseUrl from "../../Api/BaseUrl";
import axiosInstance from "../../Api/axiosInstance";

const WarehouseMainInventory = () => {
  // === STATE ===
  const [inventory, setInventory] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [outOfStockItems, setOutOfStockItems] = useState([]);
  const [nearExpiryItems, setNearExpiryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const [currentItem, setCurrentItem] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [filterType, setFilterType] = useState(null);
  const [addForm, setAddForm] = useState({
    item_code: "",
    item_name: "",
    category: "",
    description: "",
    unit: "",
    quantity: "",
    reorder_level: "",
    item_cost: "",
    expiry_date: "",
  });
  const [addingItem, setAddingItem] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [hoveredCard, setHoveredCard] = useState(null);
  const hoverRef = useRef(null);

  // === FETCH SINGLE ITEM BY ID ===
  const fetchItemById = async (id) => {
    try {
      const response = await axiosInstance.get(`${BaseUrl}/inventory/${id}`);
      if (response.data?.data) {
        return { id, ...response.data.data };
      } else {
        throw new Error("Item not found");
      }
    } catch (err) {
      console.error("Failed to fetch item:", err);
      alert("Failed to load item: " + (err.response?.data?.message || err.message));
      return null;
    }
  };

  // === FETCH INVENTORY ON LOAD ===
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`${BaseUrl}/inventory`);
        if (response.data?.data && Array.isArray(response.data.data)) {
          const dataWithId = response.data.data.map((item) => ({
            id: item.id,
            ...item,
          }));
          setInventory(dataWithId);
        } else {
          setInventory([]);
        }
      } catch (err) {
        console.error("Failed to fetch inventory:", err);
        alert("Failed to load inventory: " + (err.response?.data?.message || err.message));
        setInventory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  // Categorize items whenever inventory changes
  useEffect(() => {
    // ✅ FIXED: Include ALL items where quantity < reorder_level (even negative!)
    const lowStock = inventory.filter(
      (item) => item.quantity < item.reorder_level
    );
    const outOfStock = inventory.filter((item) => item.quantity === 0);
    const nearExpiry = inventory.filter((item) => {
      if (!item.expiry_date) return false;
      const diffDays = Math.ceil((new Date(item.expiry_date) - new Date()) / (1000 * 60 * 60 * 24));
      return diffDays <= 30;
    });
    setLowStockItems(lowStock);
    setOutOfStockItems(outOfStock);
    setNearExpiryItems(nearExpiry);
  }, [inventory]);
  const openEditModal = (item) => {
    setCurrentItem(item);
    setEditForm({
      item_code: item.item_code || "",
      item_name: item.item_name || "",
      category: item.category || "",
      description: item.description || "",
      unit: item.unit || "",
      quantity: item.quantity?.toString() || "0",
      reorder_level: item.reorder_level?.toString() || "0",
      item_cost: item.item_cost?.toString() || "0",
      // ✅ ISO string को input-friendly format में बदलें
      expiry_date: formatDateForInput(item.expiry_date),
    });
    setShowEditModal(true);
  };


// ✅ Pehle define karo
const daysUntilExpiry = (expiryDate) => {
  if (!expiryDate) return null;
  const expiry = new Date(expiryDate);
  const today = new Date();
  const diffTime = expiry - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// ✅ Ab use karo
const filteredInventory = inventory.filter((item) => {
  const q = searchTerm.trim().toLowerCase();
  const matchesSearch =
    !q ||
    (item.item_code ?? "").toLowerCase().includes(q) ||
    (item.item_name ?? "").toLowerCase().includes(q) ||
    (item.category ?? "").toLowerCase().includes(q);

  if (!matchesSearch) return false;

  if (filterType === "out_of_stock") return item.quantity === 0;
  if (filterType === "low_stock") return item.quantity < item.reorder_level;
  if (filterType === "near_expiry") {
    if (!item.expiry_date) return false;
    const days = daysUntilExpiry(item.expiry_date); // ✅ Ab safe hai
    return days !== null && days <= 30;
  }
  return true;
});

  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentInventory = filteredInventory.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => setCurrentPage(1), [searchTerm]);



  const calculateStatus = (item) => {
    if (item.quantity === 0) return "out_of_stock";
    if (item.quantity < item.reorder_level) return "low_stock";
    if (item.expiry_date) {
      const days = daysUntilExpiry(item.expiry_date);
      if (days !== null && days <= 30) return "near_expiry";
    }
    return "in_stock";
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "out_of_stock": return <span className="badge bg-danger">Out of Stock</span>;
      case "low_stock": return <span className="badge bg-warning text-dark">Low Stock</span>;
      case "near_expiry": return <span className="badge bg-info">Near Expiry</span>;
      default: return <span className="badge bg-success">In Stock</span>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };
// ISO string या Date object को YYYY-MM-DD में बदले
const formatDateForInput = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
  // === MODAL HANDLERS ===
  const openViewModal = async (item) => {
    setLoading(true);
    const fetchedItem = await fetchItemById(item.id);
    setLoading(false);
    if (fetchedItem) {
      setViewItem(fetchedItem);
      setShowViewModal(true);
    }
  };

  const openHistoryModal = (item) => {
    setCurrentItem(item);
    setShowHistoryModal(true);
  };

  const openAddModal = () => {
    setAddForm({
      item_code: "",
      item_name: "",
      category: "",
      description: "",
      unit: "",
      quantity: "",
      reorder_level: "",
      item_cost: "",
      expiry_date: "",
    });
    setShowAddModal(true);
  };

  const closeAllModals = () => {
    setShowEditModal(false);
    setShowHistoryModal(false);
    setShowViewModal(false);
    setShowAddModal(false);
    setCurrentItem(null);
    setViewItem(null);
    setEditForm({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddInputChange = (e) => {
    const { name, value } = e.target;
    setAddForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = async () => {
    if (!currentItem?.id) {
      alert("Item ID not found.");
      return;
    }
  
    const safeParseInt = (value) => (value === "" || value == null ? 0 : parseInt(value, 10));
    const safeParseFloat = (value) => (value === "" || value == null ? 0 : parseFloat(value));
  
    // ✅ expiry_date पहले से ही "YYYY-MM-DD" या "" है
    const expiryDate = editForm.expiry_date === "" ? null : editForm.expiry_date;
  
    const payload = {
      item_code: editForm.item_code?.trim() || "",
      item_name: editForm.item_name?.trim() || "",
      category: editForm.category?.trim() || "",
      description: editForm.description?.trim() || "",
      unit: editForm.unit?.trim() || "",
      quantity: safeParseInt(editForm.quantity),
      reorder_level: safeParseInt(editForm.reorder_level),
      item_cost: safeParseFloat(editForm.item_cost),
      expiry_date: expiryDate, // ✅ अब यह "2025-12-05" या null होगा
    };
  
    try {
      setLoading(true);
      const response = await axiosInstance.put(`${BaseUrl}/inventory/${currentItem.id}`, payload);
  
      if (response.data?.success) {
        const updatedItem = { id: currentItem.id, ...payload };
        setInventory((prev) =>
          prev.map((item) => (item.id === currentItem.id ? updatedItem : item))
        );
        alert(`Item ${payload.item_code || 'N/A'} updated successfully!`);
        closeAllModals();
      } else {
        alert("Update failed: " + (response.data?.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Edit error:", err);
      alert("Error updating item: " + (err.response?.data?.message || err.message || "Network error"));
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    const { item_code, item_name, category, unit } = addForm;
    if (!item_code || !item_name || !category || !unit) {
      alert("Please fill all required fields.");
      return;
    }

    const payload = {
      item_code: addForm.item_code,
      item_name: addForm.item_name,
      category: addForm.category,
      description: addForm.description || "",
      unit: addForm.unit,
      quantity: parseInt(addForm.quantity, 10) || 0,
      reorder_level: parseInt(addForm.reorder_level, 10) || 0,
      item_cost: parseFloat(addForm.item_cost) || 0,
      expiry_date: addForm.expiry_date || null,
    };

    try {
      setAddingItem(true);
      const response = await axiosInstance.post(`${BaseUrl}/inventory/create`, payload);

      if (response.data?.success) {
        const newItem = {
          id: response.data.data?.id || inventory.length + 1,
          ...payload,
        };
        setInventory((prev) => [...prev, newItem]);
        alert(`Item ${addForm.item_code} added successfully!`);
        closeAllModals();
        setAddForm({
          item_code: "",
          item_name: "",
          category: "",
          description: "",
          unit: "",
          quantity: "",
          reorder_level: "",
          item_cost: "",
          expiry_date: "",
        });
      } else {
        alert("Failed: " + (response.data?.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Add item error:", err);
      alert("Error: " + (err.response?.data?.message || err.message || "Network error"));
    } finally {
      setAddingItem(false);
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
  
    try {
      setLoading(true);
      const response = await axiosInstance.delete(`${BaseUrl}/inventory/${id}`);
      if (response.data?.success) {
        setInventory(prev => prev.filter(item => item.id !== id));
        alert("Item deleted successfully!");
      } else {
        alert("Failed to delete item: " + (response.data?.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error deleting item: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (hoverRef.current && !hoverRef.current.contains(event.target)) {
        setHoveredCard(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const totalNetWorth = inventory
    .reduce((sum, item) => sum + (item.quantity || 0) * (parseFloat(item.item_cost) || 0), 0)
    .toFixed(2);

  return (
    <div className="container-fluid py-3">
      {/* Top Toolbar */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <h2 className="fw-bold mb-0">Warehouse Inventory</h2>
        <div className="d-flex gap-2 flex-nowrap" style={{ maxWidth: "600px", width: "100%" }}>
          <div className="input-group" style={{ maxWidth: "320px", width: "100%" }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search by Item Code, Name, or Category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={loading}
            />
            <button className="btn btn-outline-secondary" disabled={loading}>
              <FaSearch />
            </button>
          </div>
          <button
            className="btn btn-primary d-flex align-items-center gap-1"
            onClick={openAddModal}
            disabled={loading}
          >
            <FaPlus /> Add Item
          </button>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="d-flex flex-wrap gap-2 mb-4">
        <button
          className="btn btn-outline-danger btn-sm"
          onClick={() => setFilterType("out_of_stock")}
          disabled={loading}
        >
          Out of Stock ({outOfStockItems.length})
        </button>
        <button
          className="btn btn-outline-warning btn-sm"
          onClick={() => setFilterType("low_stock")}
          disabled={loading}
        >
          Low Stock ({lowStockItems.length})
        </button>
        <button
          className="btn btn-outline-info btn-sm"
          onClick={() => setFilterType("near_expiry")}
          disabled={loading}
        >
          Near Expiry ({nearExpiryItems.length})
        </button>
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={() => setFilterType(null)}
          disabled={loading}
        >
          Clear Filter
        </button>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4 g-3" ref={hoverRef}>
        {/* Low Stock Card */}
        <div className="col-md-4">
          <div
            className="card border-warning bg-warning bg-opacity-10 h-100"
            onMouseEnter={() => setHoveredCard("lowStock")}
            onClick={() => setHoveredCard("lowStock")}
            style={{ cursor: "pointer" }}
          >
            <div className="card-body d-flex align-items-center">
              <FaExclamationTriangle className="text-warning fs-2 me-3" />
              <div className="flex-grow-1">
                <h6 className="mb-0">Low Stock Items</h6>
                <span className="fw-bold fs-5">{lowStockItems.length}</span>
                {hoveredCard === "lowStock" && lowStockItems.length > 0 && (
                  <div className="position-absolute top-100 start-0 mt-2 p-3 bg-white border rounded shadow-sm z-1 w-300px">
                    <h6 className="text-warning mb-2">Items Low in Stock</h6>
                    <div className="table-responsive">
                      <table className="table table-sm mb-0">
                        <thead>
                          <tr>
                            <th>Item Name</th>
                            <th>Qty</th>
                            <th>Reorder</th>
                          </tr>
                        </thead>
                        <tbody>
                          {lowStockItems.slice(0, 5).map((item) => (
                            <tr key={item.id}>
                              <td>{item.item_name}</td>
                              <td className="text-warning">{item.quantity}</td>
                              <td>{item.reorder_level}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {lowStockItems.length > 5 && (
                      <div className="text-center mt-2">
                        <small className="text-muted">+{lowStockItems.length - 5} more</small>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Out of Stock Card */}
        <div className="col-md-4">
          <div
            className="card border-danger bg-danger bg-opacity-10 h-100"
            onMouseEnter={() => setHoveredCard("outOfStock")}
            onClick={() => setHoveredCard("outOfStock")}
            style={{ cursor: "pointer" }}
          >
            <div className="card-body d-flex align-items-center">
              <FaTimes className="text-danger fs-2 me-3" />
              <div className="flex-grow-1">
                <h6 className="mb-0">Out of Stock</h6>
                <span className="fw-bold fs-5">{outOfStockItems.length}</span>
                {hoveredCard === "outOfStock" && outOfStockItems.length > 0 && (
                  <div className="position-absolute top-100 start-0 mt-2 p-3 bg-white border rounded shadow-sm z-1 w-300px">
                    <h6 className="text-danger mb-2">Out of Stock Items</h6>
                    <div className="table-responsive">
                      <table className="table table-sm mb-0">
                        <thead>
                          <tr>
                            <th>Code</th>
                            <th>Name</th>
                          </tr>
                        </thead>
                        <tbody>
                          {outOfStockItems.map((item) => (
                            <tr key={item.id}>
                              <td>{item.item_code}</td>
                              <td>{item.item_name}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Near Expiry Card */}
        <div className="col-md-4">
          <div
            className="card border-info bg-info bg-opacity-10 h-100"
            onMouseEnter={() => setHoveredCard("nearExpiry")}
            onClick={() => setHoveredCard("nearExpiry")}
            style={{ cursor: "pointer" }}
          >
            <div className="card-body d-flex align-items-center">
              <FaClock className="text-info fs-2 me-3" />
              <div className="flex-grow-1">
                <h6 className="mb-0">Near Expiry</h6>
                <span className="fw-bold fs-5">{nearExpiryItems.length}</span>
                {hoveredCard === "nearExpiry" && nearExpiryItems.length > 0 && (
                  <div className="position-absolute top-100 start-0 mt-2 p-3 bg-white border rounded shadow-sm z-1 w-300px">
                    <h6 className="text-info mb-2">Expiring Soon</h6>
                    <div className="table-responsive">
                      <table className="table table-sm mb-0">
                        <thead>
                          <tr>
                            <th>Item</th>
                            <th>Expiry</th>
                            <th>Days</th>
                          </tr>
                        </thead>
                        <tbody>
                          {nearExpiryItems.map((item) => {
                            const daysLeft = daysUntilExpiry(item.expiry_date);
                            return (
                              <tr key={item.id}>
                                <td>{item.item_name}</td>
                                <td>{formatDate(item.expiry_date)}</td>
                                <td className={daysLeft <= 7 ? "text-danger fw-bold" : "text-warning"}>
                                  {daysLeft}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Net Worth Card */}
      <div className="row mb-4 g-3">
        <div className="col-md-4">
          <div className="card border-primary bg-primary bg-opacity-10 h-100">
            <div className="card-body d-flex align-items-center">
              <FaArrowRight className="text-primary fs-2 me-3" />
              <div>
                <h6 className="mb-0">Total Warehouse Net Worth</h6>
                <span className="fw-bold fs-4">GHS {totalNetWorth}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading inventory...</p>
        </div>
      )}

      {!loading && (
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
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentInventory.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-4">
                      {searchTerm ? "No items match your search." : "No inventory items."}
                    </td>
                  </tr>
                ) : (
                  currentInventory.map((item) => (
                    <tr key={item.id}>
                      <td className="fw-bold">{item.item_code}</td>
                      <td>{item.item_name}</td>
                      <td><span className="badge bg-light text-dark">{item.category}</span></td>
                      <td className={item.quantity < item.reorder_level ? "text-warning" : "text-success"}>
                        {item.quantity}
                      </td>
                      <td>{item.reorder_level}</td>
                      <td>GHS {parseFloat(item.item_cost).toFixed(2)}</td>
                      <td>
                        {item.expiry_date ? (
                          <span className={daysUntilExpiry(item.expiry_date) <= 30 ? "text-info" : ""}>
                            {formatDate(item.expiry_date)}
                          </span>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td>{getStatusBadge(calculateStatus(item))}</td>
                      <td>
  <div className="btn-group">
    <button className="btn btn-sm btn-outline-success" onClick={() => openViewModal(item)}>
      View
    </button>
    <button 
      className="btn btn-sm btn-outline-primary" 
      onClick={() => openEditModal(item)}
      title="Edit Item"
    >
      <FaEdit />
    </button>
    <button 
      className="btn btn-sm btn-outline-danger" 
      onClick={() => handleDeleteItem(item.id)}
      title="Delete Item"
    >
      <FaTimes />
    </button>
  </div>
</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <nav className="d-flex justify-content-center mt-3">
              <ul className="pagination mb-0">
                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => goToPage(currentPage - 1)}>
                    Previous
                  </button>
                </li>
                {[...Array(totalPages)].map((_, i) => (
                  <li key={i + 1} className={`page-item ${currentPage === i + 1 ? "active" : ""}`}>
                    <button className="page-link" onClick={() => goToPage(i + 1)}>
                      {i + 1}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => goToPage(currentPage + 1)}>
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </div>
      )}

      {/* ===== ADD MODAL ===== */}
      {showAddModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Inventory Item</h5>
                <button type="button" className="btn-close" onClick={closeAllModals}></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Item Code *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="item_code"
                        value={addForm.item_code}
                        onChange={handleAddInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Category *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="category"
                        value={addForm.category}
                        onChange={handleAddInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-12">
                      <label className="form-label">Item Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="item_name"
                        value={addForm.item_name}
                        onChange={handleAddInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-12">
                      <label className="form-label">Description</label>
                      <textarea
                        className="form-control"
                        name="description"
                        value={addForm.description || ""}
                        onChange={handleAddInputChange}
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Unit *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="unit"
                        value={addForm.unit}
                        onChange={handleAddInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Quantity *</label>
                      <input
                        type="number"
                        className="form-control"
                        name="quantity"
                        value={addForm.quantity}
                        onChange={handleAddInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Reorder Level</label>
                      <input
                        type="number"
                        className="form-control"
                        name="reorder_level"
                        value={addForm.reorder_level || ""}
                        onChange={handleAddInputChange}
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Item Cost (GHS) *</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        name="item_cost"
                        value={addForm.item_cost}
                        onChange={handleAddInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Expiry Date</label>
                      <input
                        type="date"
                        className="form-control"
                        name="expiry_date"
                        value={addForm.expiry_date || ""}
                        onChange={handleAddInputChange}
                      />
                    </div>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={closeAllModals}>
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleAddItem}
                  disabled={addingItem}
                >
                  {addingItem ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Adding...
                    </>
                  ) : (
                    "Add Item"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== VIEW MODAL ===== */}
      {showViewModal && viewItem && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Item Details</h5>
                <button type="button" className="btn-close" onClick={closeAllModals}></button>
              </div>
              <div className="modal-body">
                <div className="row mb-2">
                  <div className="col-5 fw-bold">Item Code:</div>
                  <div className="col-7">{viewItem.item_code}</div>
                </div>
                <div className="row mb-2">
                  <div className="col-5 fw-bold">Name:</div>
                  <div className="col-7">{viewItem.item_name}</div>
                </div>
                <div className="row mb-2">
                  <div className="col-5 fw-bold">Category:</div>
                  <div className="col-7">{viewItem.category}</div>
                </div>
                <div className="row mb-2">
                  <div className="col-5 fw-bold">Description:</div>
                  <div className="col-7">{viewItem.description || "—"}</div>
                </div>
                <div className="row mb-2">
                  <div className="col-5 fw-bold">Unit:</div>
                  <div className="col-7">{viewItem.unit}</div>
                </div>
                <div className="row mb-2">
                  <div className="col-5 fw-bold">Quantity:</div>
                  <div className="col-7">{viewItem.quantity}</div>
                </div>
                <div className="row mb-2">
                  <div className="col-5 fw-bold">Reorder Level:</div>
                  <div className="col-7">{viewItem.reorder_level}</div>
                </div>
                <div className="row mb-2">
                  <div className="col-5 fw-bold">Item Cost:</div>
                  <div className="col-7">GHS {parseFloat(viewItem.item_cost).toFixed(2)}</div>
                </div>
                <div className="row mb-2">
                  <div className="col-5 fw-bold">Expiry Date:</div>
                  <div className="col-7">{viewItem.expiry_date ? formatDate(viewItem.expiry_date) : "N/A"}</div>
                </div>
                <div className="row mb-2">
                  <div className="col-5 fw-bold">Status:</div>
                  <div className="col-7">{getStatusBadge(calculateStatus(viewItem))}</div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={closeAllModals}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== HISTORY MODAL (Demo) ===== */}
      {showHistoryModal && currentItem && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Movement History — {currentItem.item_name}</h5>
                <button type="button" className="btn-close" onClick={closeAllModals}></button>
              </div>
              <div className="modal-body">
                <p className="text-muted">No real movement history (demo mode).</p>
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Quantity</th>
                        <th>Reference</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>2025-10-01</td>
                        <td><span className="badge bg-success">Stock In</span></td>
                        <td className="text-success">+50</td>
                        <td>PO-12345</td>
                      </tr>
                      <tr>
                        <td>2025-10-15</td>
                        <td><span className="badge bg-warning text-dark">Dispatch</span></td>
                        <td className="text-danger">-10</td>
                        <td>REQ-678</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={closeAllModals}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
{/* ===== EDIT MODAL ===== */}
{showEditModal && currentItem && (
  <div className="modal show d-block" tabIndex="-1">
    <div className="modal-dialog modal-lg">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Edit Inventory Item</h5>
          <button type="button" className="btn-close" onClick={closeAllModals}></button>
        </div>
        <div className="modal-body">
          <form>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Item Code</label>
                <input
                  type="text"
                  className="form-control"
                  name="item_code"
                  value={editForm.item_code}
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Category</label>
                <input
                  type="text"
                  className="form-control"
                  name="category"
                  value={editForm.category}
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-md-12">
                <label className="form-label">Item Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="item_name"
                  value={editForm.item_name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-md-12">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  name="description"
                  value={editForm.description || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Unit</label>
                <input
                  type="text"
                  className="form-control"
                  name="unit"
                  value={editForm.unit}
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Quantity</label>
                <input
                  type="number"
                  className="form-control"
                  name="quantity"
                  value={editForm.quantity}
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Reorder Level</label>
                <input
                  type="number"
                  className="form-control"
                  name="reorder_level"
                  value={editForm.reorder_level || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Item Cost (GHS)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  name="item_cost"
                  value={editForm.item_cost}
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Expiry Date</label>
                <input
                  type="date"
                  className="form-control"
                  name="expiry_date"
                  value={editForm.expiry_date || ""}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </form>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={closeAllModals}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSaveEdit}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  </div>
)}
      {/* Modal Backdrop */}
      {(showAddModal || showEditModal || showViewModal || showHistoryModal) && (
        <div className="modal-backdrop fade show"></div>
      )}
    </div>
  );
};

export default WarehouseMainInventory;