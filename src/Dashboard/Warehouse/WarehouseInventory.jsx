import React, { useState, useEffect, useRef, useMemo } from "react";
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
import axios from "axios";
import BaseUrl from "../../Api/BaseUrl";
import axiosInstance from "../../Api/axiosInstance";

const WarehouseInventory = () => {
  // === STATE ===
  const [inventory, setInventory] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [outOfStockItems, setOutOfStockItems] = useState([]);
  const [nearExpiryItems, setNearExpiryItems] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const [currentItem, setCurrentItem] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);
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
    facility_id: "",
  });
  const [showAddToAllModal, setShowAddToAllModal] = useState(false);
  const [addToAllForm, setAddToAllForm] = useState({
    item_code: "",
    item_name: "",
    category,
    unit: "",
    quantity: "",
    reorder_level: "",
    item_cost: "",
    expiry_date: "",
  });
  const [movements, setMovements] = useState([]);
  const [movementsLoading, setMovementsLoading] = useState(false);
  const [addingItem, setAddingItem] = useState(false);
  // Hover state for stats cards
  const [hoveredCard, setHoveredCard] = useState(null);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  // Ref for document click handler
  const hoverRef = useRef(null);

  // === FETCH INVENTORY DATA ===
  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        setLoading(true);
        setError(null);
        const inventoryResponse = await axiosInstance.get(`${BaseUrl}/inventory`);
        if (inventoryResponse.data && inventoryResponse.data.data) {
          const inventoryData = inventoryResponse.data.data;
          setInventory(inventoryData);
          const lowStock = inventoryData.filter(
            (item) => item.quantity > 0 && item.quantity < item.reorder_level
          );
          const outOfStock = inventoryData.filter((item) => item.quantity === 0);
          const nearExpiry = inventoryData.filter((item) => {
            if (!item.expiry_date) return false;
            const expiryDate = new Date(item.expiry_date);
            const today = new Date();
            const diffTime = expiryDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays <= 30;
          });
          setLowStockItems(lowStock);
          setOutOfStockItems(outOfStock);
          setNearExpiryItems(nearExpiry);
        }
        try {
          const requestsResponse = await axiosInstance.get(`${BaseUrl}/pending-requests`);
          if (requestsResponse.data && requestsResponse.data.data) {
            setPendingRequests(requestsResponse.data.data);
          }
        } catch (err) {
          console.error("Error fetching pending requests:", err);
          setPendingRequests([]);
        }
        try {
          const facilitiesResponse = await axiosInstance.get(`${BaseUrl}/facilities`);
          if (facilitiesResponse.data && facilitiesResponse.data.data) {
            setFacilities(facilitiesResponse.data.data);
          }
        } catch (err) {
          console.error("Error fetching facilities:", err);
          setFacilities([]);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching inventory data:", err);
        setError("Error fetching data: " + (err.response?.data?.message || err.message));
        setLoading(false);
      }
    };
    fetchInventoryData();
  }, []);

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

  const fetchMovements = async (itemId) => {
    try {
      setMovementsLoading(true);
      setError(null);
      const response = await axiosInstance.get(`${BaseUrl}/inventory/${itemId}/movements`);
      if (response.data && response.data.data) {
        setMovements(response.data.data);
      } else {
        setMovements([]);
      }
      setMovementsLoading(false);
    } catch (err) {
      console.error("Error fetching movements:", err);
      setError("Error fetching movements: " + (err.response?.data?.message || err.message));
      setMovementsLoading(false);
      setMovements([]);
    }
  };

  const daysUntilExpiry = (expiryDate) => {
    if (!expiryDate) return null;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !q ||
        item.item_code?.toLowerCase().includes(q) ||
        item.item_name?.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q);
      if (q) return matchesSearch;
      if (filterType === "out_of_stock") return item.quantity === 0;
      if (filterType === "low_stock")
        return item.quantity > 0 && item.quantity < item.reorder_level;
      if (filterType === "near_expiry") {
        if (!item.expiry_date) return false;
        const days = daysUntilExpiry(item.expiry_date);
        return days !== null && days <= 30;
      }
      return true;
    });
  }, [inventory, searchTerm, filterType]);

  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentInventory = filteredInventory.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // === MODAL HANDLERS ===
  const openViewModal = (item) => {
    setViewItem(item);
    setShowViewModal(true);
  };
  const openEditModal = (item) => {
    setCurrentItem(item);
    let formattedExpiry = "";
    if (item.expiry_date && item.expiry_date !== "0000-00-00") {
      const date = new Date(item.expiry_date);
      if (!isNaN(date.getTime()) && date.getFullYear() > 1900) {
        formattedExpiry = date.toISOString().split("T")[0];
      }
    }
    setEditForm({
      item_name: item.item_name ?? "",
      category: item.category ?? "",
      description: item.description ?? "",
      unit: item.unit ?? "",
      quantity: item.quantity != null ? String(item.quantity) : "",
      reorder_level: item.reorder_level != null ? String(item.reorder_level) : "",
      item_cost: item.item_cost != null ? String(item.item_cost) : "",
      expiry_date: formattedExpiry,
    });
    setShowEditModal(true);
  };
  const openHistoryModal = async (item) => {
    setCurrentItem(item);
    setShowHistoryModal(true);
    await fetchMovements(item.id);
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
      facility_id: "",
    });
    setShowAddModal(true);
  };
  const closeModalOnBackdrop = (e) => {
    if (e.target === e.currentTarget) {
      setShowViewModal(false);
    }
  };

  // === FORM HANDLERS ===
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleAddInputChange = (e) => {
    const { name, value } = e.target;
    setAddForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleAddToAllInputChange = (e) => {
    const { name, value } = e.target;
    setAddToAllForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveEdit = async () => {
    try {
      const payload = {
        item_name: editForm.item_name,
        category: editForm.category,
        description: editForm.description,
        unit: editForm.unit,
        quantity: parseInt(editForm.quantity),
        reorder_level: parseInt(editForm.reorder_level),
        item_cost: parseFloat(editForm.item_cost),
        expiry_date: editForm.expiry_date || null,
      };
      const response = await axiosInstance.put(`${BaseUrl}/inventory/${currentItem.id}`, payload);
      if (response.data && response.data.success) {
        const updatedItem = {
          ...currentItem,
          ...editForm,
        };
        setInventory((prevInventory) =>
          prevInventory.map((item) =>
            item.id === currentItem.id ? updatedItem : item
          )
        );
        alert(`Item ${currentItem.item_code} updated successfully`);
        setShowEditModal(false);
      } else {
        alert(response.data.message || "Failed to update item");
      }
    } catch (err) {
      console.error("Error updating item:", err);
      alert("Error updating item: " + (err.response?.data?.message || err.message));
    }
  };

  const handleExportCSV = () => {
    const headers = [
      "Item Code",
      "Item Name",
      "Category",
      "Quantity",
      "Reorder Level",
      "Item Cost (GHS)",
      "Total Cost (GHS)", // ✅ Added
      "Expiry Date",
      "Facility",
      "Status",
    ];
    const rows = filteredInventory.map((item) => {
      const totalCost = (item.quantity || 0) * (parseFloat(item.item_cost) || 0);
      const status = calculateStatus(item);
      return [
        item.item_code,
        item.item_name,
        item.category,
        item.quantity,
        item.reorder_level,
        item.item_cost ? parseFloat(item.item_cost).toFixed(2) : "0.00",
        totalCost.toFixed(2),
        item.expiry_date ? formatDate(item.expiry_date) : "N/A",
        item.facility_name || "Central Warehouse",
        status.replace("_", " ").toUpperCase(),
      ];
    });
    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `warehouse_inventory_${filterType || "all"}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddItem = async () => {
    try {
      setAddingItem(true);
      const payload = {
        item_code: addForm.item_code,
        item_name: addForm.item_name,
        category: addForm.category,
        description: addForm.description,
        unit: addForm.unit,
        quantity: parseInt(addForm.quantity),
        reorder_level: parseInt(addForm.reorder_level),
        item_cost: parseFloat(addForm.item_cost),
        expiry_date: addForm.expiry_date || null,
        facility_id: parseInt(addForm.facility_id),
      };
      const response = await axiosInstance.post(`${BaseUrl}/inventory`, payload);
      if (response.data && response.data.success) {
        const selectedFacility = facilities.find((f) => f.id === parseInt(addForm.facility_id));
        const newItem = {
          id: response.data.data.id || inventory.length + 1,
          ...addForm,
          facility_name: selectedFacility ? selectedFacility.name : "Central Warehouse",
          updated_at: new Date().toISOString(),
        };
        setInventory((prevInventory) => [...prevInventory, newItem]);
        alert(`Item ${addForm.item_code} added successfully`);
        setShowAddModal(false);
      } else {
        alert(response.data.message || "Failed to add item");
      }
    } catch (err) {
      console.error("Error adding item:", err);
      alert("Error adding item: " + (err.response?.data?.message || err.message));
    } finally {
      setAddingItem(false);
    }
  };

  // === HELPER FUNCTIONS ===
  const calculateStatus = (item) => {
    if (item.quantity === 0) return "out_of_stock";
    if (item.quantity < item.reorder_level) return "low_stock";
    if (item.expiry_date) {
      const expiryDate = new Date(item.expiry_date);
      const today = new Date();
      const diffTime = expiryDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays <= 30) return "near_expiry";
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
        return <span className="badge bg-info">Near Expiry</span>;
      default:
        return <span className="badge bg-success">In Stock</span>;
    }
  };

  const getMovementTypeBadge = (type) => {
    switch (type) {
      case "stock_in":
        return <span className="badge bg-success">Stock In</span>;
      case "dispatch":
        return <span className="badge bg-warning text-dark">Dispatch</span>;
      case "adjustment":
        return <span className="badge bg-danger">Adjustment</span>;
      case "transfer":
        return <span className="badge bg-info">Transfer</span>;
      default:
        return <span className="badge bg-secondary">{type}</span>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const renderPagination = () => {
    if (filteredInventory.length === 0) return null;
    const pageNumbers = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    return (
      <nav className="d-flex justify-content-center mt-3">
        <ul className="pagination mb-0">
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
              Previous
            </button>
          </li>
          {startPage > 1 && (
            <>
              <li className="page-item">
                <button className="page-link" onClick={() => goToPage(1)}>1</button>
              </li>
              {startPage > 2 && (
                <li className="page-item disabled">
                  <span className="page-link">...</span>
                </li>
              )}
            </>
          )}
          {pageNumbers.map((number) => (
            <li key={number} className={`page-item ${number === currentPage ? "active" : ""}`}>
              <button className="page-link" onClick={() => goToPage(number)}>{number}</button>
            </li>
          ))}
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && (
                <li className="page-item disabled">
                  <span className="page-link">...</span>
                </li>
              )}
              <li className="page-item">
                <button className="page-link" onClick={() => goToPage(totalPages)}>{totalPages}</button>
              </li>
            </>
          )}
          <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
              Next
            </button>
          </li>
        </ul>
      </nav>
    );
  };

  const totalNetWorth = inventory
    .reduce((sum, item) => {
      const qty = item.quantity || 0;
      const cost = parseFloat(item.item_cost) || 0;
      return sum + qty * cost;
    }, 0)
    .toFixed(2);

  return (
    <div className="container-fluid py-3">
      {/* ===== Top Toolbar ===== */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <h2 className="fw-bold mb-0">Inventory (Global View)</h2>
        <div className="d-flex gap-2 flex-nowrap" style={{ maxWidth: "600px", width: "100%" }}>
          <div className="input-group" style={{ maxWidth: "320px", width: "100%" }}>
            <input
              type="text"
              className="form-control"
              style={{ height: "40px" }}
              placeholder="Search by Item Code, Name, or Category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="btn btn-outline-secondary" style={{ height: "40px" }} type="button">
              <FaSearch />
            </button>
          </div>
          <div className="d-flex gap-2" style={{ height: "40px" }}>
            <button
              className="btn btn-primary d-flex align-items-center gap-1"
              style={{ height: "100%" }}
              onClick={openAddModal}
            >
              <FaPlus /> Add Item
            </button>
            <button
              className="btn btn-success d-flex align-items-center gap-1"
              style={{ height: "100%" }}
              onClick={() => setShowAddToAllModal(true)}
            >
              <FaPlus /> Add to All Facilities
            </button>
          </div>
        </div>
      </div>

      {/* ===== FILTER & EXPORT BUTTONS ===== */}
      <div className="d-flex flex-wrap gap-2 mb-4">
        <button
          className="btn btn-outline-danger btn-sm"
          onClick={() => setFilterType("out_of_stock")}
        >
          Out of Stock ({outOfStockItems.length})
        </button>
        <button
          className="btn btn-outline-warning btn-sm"
          onClick={() => setFilterType("low_stock")}
        >
          Low Stock ({lowStockItems.length})
        </button>
        <button
          className="btn btn-outline-info btn-sm"
          onClick={() => setFilterType("near_expiry")}
        >
          Near Expiry ({nearExpiryItems.length})
        </button>
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={() => setFilterType(null)}
        >
          Clear Filter
        </button>
        <button className="btn btn-success btn-sm ms-auto" onClick={handleExportCSV}>
          Export {filterType ? filterType.replace("_", " ") : "All"} Items (CSV)
        </button>
      </div>

      {/* ===== ALERTS SECTION ===== */}
      <div className="row mb-4 g-3" ref={hoverRef}>
        {/* === Row 1: Stock Alerts (3 cards) === */}
        <div className="col-md-4">
          <div
            className="card border-warning bg-warning bg-opacity-10 h-100"
            onMouseEnter={() => setHoveredCard("lowStock")}
            onClick={() => setHoveredCard("lowStock")}
          >
            <div className="card-body d-flex align-items-center">
              <div className="me-3">
                <FaExclamationTriangle className="text-warning fs-2" />
              </div>
              <div className="flex-grow-1">
                <h6 className="mb-0">Low Stock Items</h6>
                <span className="fw-bold fs-5">{lowStockItems.length}</span>
                {hoveredCard === "lowStock" && lowStockItems.length > 0 && (
                  <div className="position-absolute top-100 start-0 mt-2 p-3 bg-white border rounded shadow-sm z-1 w-300px">
                    <h6 className="text-warning mb-2">Items Low in Stock</h6>
                    <div className="table-responsive">
                      <table className="table table-sm">
                        <thead>
                          <tr>
                            <th>Item Name</th>
                            <th>Quantity</th>
                            <th>Reorder Level</th>
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
                        <small className="text-muted">+{lowStockItems.length - 5} more items</small>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div
            className="card border-danger bg-danger bg-opacity-10 h-100"
            onMouseEnter={() => setHoveredCard("outOfStock")}
            onClick={() => setHoveredCard("outOfStock")}
          >
            <div className="card-body d-flex align-items-center">
              <div className="me-3">
                <FaTimes className="text-danger fs-2" />
              </div>
              <div className="flex-grow-1">
                <h6 className="mb-0">Out of Stock</h6>
                <span className="fw-bold fs-5">{outOfStockItems.length}</span>
                {hoveredCard === "outOfStock" && outOfStockItems.length > 0 && (
                  <div className="position-absolute top-100 start-0 mt-2 p-3 bg-white border rounded shadow-sm z-1 w-300px">
                    <h6 className="text-danger mb-2">Out of Stock Items</h6>
                    <div className="table-responsive">
                      <table className="table table-sm">
                        <thead>
                          <tr>
                            <th>Item Code</th>
                            <th>Item Name</th>
                            <th>Category</th>
                          </tr>
                        </thead>
                        <tbody>
                          {outOfStockItems.map((item) => (
                            <tr key={item.id}>
                              <td>{item.item_code}</td>
                              <td>{item.item_name}</td>
                              <td>{item.category}</td>
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
        <div className="col-md-4">
          <div
            className="card border-info bg-info bg-opacity-10 h-100"
            onMouseEnter={() => setHoveredCard("nearExpiry")}
            onClick={() => setHoveredCard("nearExpiry")}
          >
            <div className="card-body d-flex align-items-center">
              <div className="me-3">
                <FaClock className="text-info fs-2" />
              </div>
              <div className="flex-grow-1">
                <h6 className="mb-0">Near Expiry</h6>
                <span className="fw-bold fs-5">{nearExpiryItems.length}</span>
                {hoveredCard === "nearExpiry" && nearExpiryItems.length > 0 && (
                  <div className="position-absolute top-100 start-0 mt-2 p-3 bg-white border rounded shadow-sm z-1 w-300px">
                    <h6 className="text-info mb-2">Items Expiring Soon</h6>
                    <div className="table-responsive">
                      <table className="table table-sm">
                        <thead>
                          <tr>
                            <th>Item Name</th>
                            <th>Expiry Date</th>
                            <th>Days Left</th>
                          </tr>
                        </thead>
                        <tbody>
                          {nearExpiryItems.map((item) => {
                            const daysLeft = daysUntilExpiry(item.expiry_date);
                            return (
                              <tr key={item.id}>
                                <td>{item.item_name}</td>
                                <td>{formatDate(item.expiry_date)}</td>
                                <td className={daysLeft <= 7 ? "text-danger fw-bold" : "text-warning"}>{daysLeft}</td>
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

      {/* === Row 2: Net Worth + Pending Requests (2 cards) === */}
      <div className="row mb-4 g-3" ref={hoverRef}>
        <div className="col-md-4">
          <div className="card border-primary bg-primary bg-opacity-10 h-100">
            <div className="card-body d-flex align-items-center">
              <div className="me-3">
                <FaArrowRight className="text-primary fs-2" />
              </div>
              <div>
                <h6 className="mb-0">Total Warehouse Net Worth</h6>
                <span className="fw-bold fs-4">GHS {totalNetWorth}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div
            className="card border-secondary bg-secondary bg-opacity-10 h-100"
            onMouseEnter={() => setHoveredCard("pendingRequests")}
            onClick={() => {
              window.location.href = "/warehouse/requisitions";
            }}
            style={{ cursor: "pointer" }}
          >
            <div className="card-body d-flex align-items-center">
              <div className="me-3">
                <FaArrowRight className="text-secondary fs-2" />
              </div>
              <div className="flex-grow-1">
                <h6 className="mb-0">Pending Requests</h6>
                <span className="fw-bold fs-5">{pendingRequests.length}</span>
                {hoveredCard === "pendingRequests" && pendingRequests.length > 0 && (
                  <div className="position-absolute top-100 start-0 mt-2 p-3 bg-white border rounded shadow-sm z-1 w-300px">
                    <h6 className="text-secondary mb-2">Pending Facility Requests</h6>
                    <div className="table-responsive">
                      <table className="table table-sm">
                        <thead>
                          <tr>
                            <th>Facility</th>
                            <th>Items</th>
                            <th>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pendingRequests.map((request) => (
                            <tr key={request.id}>
                              <td>{request.facility_name}</td>
                              <td>{request.item_count}</td>
                              <td>{new Date(request.request_date).toLocaleDateString()}</td>
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
      </div>

      {/* ===== LOADING AND ERROR STATES ===== */}
      {loading && (
        <div className="text-center py-4">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}
      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      {/* ===== TABLE ===== */}
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
                  <th>Total Cost</th> {/* ✅ NEW COLUMN */}
                  <th>Expiry Date</th>
                  <th>Facility</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentInventory.length === 0 ? (
                  <tr>
                    <td colSpan="11" className="text-center py-4">
                      {searchTerm ? "No items match your search criteria." : "No inventory items found."}
                    </td>
                  </tr>
                ) : (
                  currentInventory.map((item) => {
                    const totalCost = (item.quantity || 0) * (parseFloat(item.item_cost) || 0);
                    return (
                      <tr key={item.id}>
                        <td className="fw-bold">{item.item_code}</td>
                        <td>{item.item_name}</td>
                        <td>
                          <span className="badge bg-light text-dark">{item.category}</span>
                        </td>
                        <td
                          className={
                            item.quantity < item.reorder_level ? "text-warning fw-medium" : "text-success fw-medium"
                          }
                        >
                          {item.quantity.toLocaleString()}
                        </td>
                        <td>{item.reorder_level.toLocaleString()}</td>
                        <td>
                          GHS {item.item_cost ? parseFloat(item.item_cost).toFixed(2) : "0.00"}
                        </td>
                        <td>
                          <strong>GHS {totalCost.toFixed(2)}</strong> {/* ✅ Display Total Cost */}
                        </td>
                        <td>
                          {item.expiry_date ? (
                            <span
                              className={daysUntilExpiry(item.expiry_date) <= 30 ? "text-info fw-medium" : ""}
                            >
                              {formatDate(item.expiry_date)}
                            </span>
                          ) : (
                            "N/A"
                          )}
                        </td>
                        <td>{item.facility_name || "Central Warehouse"}</td>
                        <td>{getStatusBadge(calculateStatus(item))}</td>
                        <td>
                          <div className="btn-group" role="group">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              title="Edit Item"
                              onClick={() => openEditModal(item)}
                            >
                              <FaEdit />
                            </button>
                            <button
                              className="btn btn-sm btn-outline-success"
                              title="View Details"
                              onClick={() => openViewModal(item)}
                            >
                              View
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {renderPagination()}
        </div>
      )}

      {/* ===== EDIT MODAL ===== */}
      {showEditModal && currentItem && Object.keys(editForm).length > 0 && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Inventory Item: {currentItem.item_code}</h5>
                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Item Code</label>
                      <input className="form-control" defaultValue={currentItem.item_code} readOnly />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Category</label>
                      <input
                        className="form-control"
                        name="category"
                        value={editForm.category || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-12">
                      <label className="form-label">Item Name</label>
                      <input
                        className="form-control"
                        name="item_name"
                        value={editForm.item_name || ""}
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
                        className="form-control"
                        name="unit"
                        value={editForm.unit || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Quantity</label>
                      <input
                        type="number"
                        className="form-control"
                        name="quantity"
                        value={editForm.quantity || ""}
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
                        value={editForm.item_cost || ""}
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
                <button className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleSaveEdit}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== ADD ITEM MODAL ===== */}
      {showAddModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Inventory Item</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
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
                        value={addForm.item_code || ""}
                        onChange={handleAddInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Category</label>
                      <input
                        type="text"
                        className="form-control"
                        name="category"
                        value={addForm.category || ""}
                        onChange={handleAddInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-12">
                      <label className="form-label">Item Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="item_name"
                        value={addForm.item_name || ""}
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
                      <label className="form-label">Unit</label>
                      <input
                        type="text"
                        className="form-control"
                        name="unit"
                        value={addForm.unit || ""}
                        onChange={handleAddInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Quantity</label>
                      <input
                        type="number"
                        className="form-control"
                        name="quantity"
                        value={addForm.quantity || ""}
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
                        required
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Item Cost (GHS)</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        name="item_cost"
                        value={addForm.item_cost || ""}
                        onChange={handleAddInputChange}
                        required
                      />
                    </div>
                    {/* ✅ Auto Total Cost Preview */}
                    <div className="col-md-6">
                      <label className="form-label">Total Cost (GHS) - Preview</label>
                      <input
                        className="form-control"
                        value={
                          addForm.quantity && addForm.item_cost
                            ? (parseFloat(addForm.quantity) * parseFloat(addForm.item_cost)).toFixed(2)
                            : "0.00"
                        }
                        readOnly
                        style={{ backgroundColor: "#f8f9fa" }}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Facility</label>
                      <select
                        className="form-select"
                        name="facility_id"
                        value={addForm.facility_id || ""}
                        onChange={handleAddInputChange}
                        required
                      >
                        <option value="">Select a facility</option>
                        {facilities.map((facility) => (
                          <option key={facility.id} value={facility.id}>
                            {facility.name}
                          </option>
                        ))}
                      </select>
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
                <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleAddItem} disabled={addingItem}>
                  {addingItem ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
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

      {/* ===== ADD TO ALL MODAL ===== */}
      {showAddToAllModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Item to All Facilities</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddToAllModal(false)}></button>
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
                        value={addToAllForm.item_code || ""}
                        onChange={handleAddToAllInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Category</label>
                      <input
                        type="text"
                        className="form-control"
                        name="category"
                        value={addToAllForm.category || ""}
                        onChange={handleAddToAllInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-12">
                      <label className="form-label">Item Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="item_name"
                        value={addToAllForm.item_name || ""}
                        onChange={handleAddToAllInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Unit</label>
                      <input
                        type="text"
                        className="form-control"
                        name="unit"
                        value={addToAllForm.unit || ""}
                        onChange={handleAddToAllInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Quantity</label>
                      <input
                        type="number"
                        className="form-control"
                        name="quantity"
                        value={addToAllForm.quantity || ""}
                        onChange={handleAddToAllInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Reorder Level</label>
                      <input
                        type="number"
                        className="form-control"
                        name="reorder_level"
                        value={addToAllForm.reorder_level || ""}
                        onChange={handleAddToAllInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Item Cost (GHS)</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        name="item_cost"
                        value={addToAllForm.item_cost || ""}
                        onChange={handleAddToAllInputChange}
                        required
                      />
                    </div>
                    {/* ✅ Total Cost Preview for Add-to-All */}
                    <div className="col-md-6">
                      <label className="form-label">Total Cost (GHS) - Preview</label>
                      <input
                        className="form-control"
                        value={
                          addToAllForm.quantity && addToAllForm.item_cost
                            ? (parseFloat(addToAllForm.quantity) * parseFloat(addToAllForm.item_cost)).toFixed(2)
                            : "0.00"
                        }
                        readOnly
                        style={{ backgroundColor: "#f8f9fa" }}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Expiry Date</label>
                      <input
                        type="date"
                        className="form-control"
                        name="expiry_date"
                        value={addToAllForm.expiry_date || ""}
                        onChange={handleAddToAllInputChange}
                      />
                    </div>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowAddToAllModal(false)}>
                  Cancel
                </button>
                <button className="btn btn-success">
                  Add to All Facilities
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== MOVEMENT HISTORY MODAL ===== */}
      {showHistoryModal && currentItem && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Movement History: {currentItem.item_name}</h5>
                <button type="button" className="btn-close" onClick={() => setShowHistoryModal(false)}></button>
              </div>
              <div className="modal-body">
                <p className="text-muted">
                  Recent stock movements for <strong>{currentItem.item_code}</strong>
                </p>
                {movementsLoading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border" role="status">
                      <span className="visually-hidden">Loading movements...</span>
                    </div>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Type</th>
                          <th>Quantity</th>
                          <th>From / To</th>
                          <th>Reference</th>
                        </tr>
                      </thead>
                      <tbody>
                        {movements.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="text-center py-3">
                              No movement history found for this item.
                            </td>
                          </tr>
                        ) : (
                          movements.map((movement) => (
                            <tr key={movement.id}>
                              <td>{new Date(movement.date).toLocaleDateString()}</td>
                              <td>{getMovementTypeBadge(movement.type)}</td>
                              <td className={movement.quantity > 0 ? "text-success" : "text-danger"}>
                                {movement.quantity > 0 ? "+" : ""}
                                {movement.quantity}
                              </td>
                              <td>{movement.from_to || "-"}</td>
                              <td>{movement.reference || "-"}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowHistoryModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Item Modal */}
      {showViewModal && viewItem && (
        <div className="modal fade show d-block" tabIndex="-1" onClick={closeModalOnBackdrop}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header border-bottom-0">
                <h5 className="modal-title">Item Details: {viewItem.item_name}</h5>
                <button type="button" className="btn-close" onClick={() => setShowViewModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-6 fw-bold">Item Code:</div>
                  <div className="col-6">{viewItem.item_code}</div>
                </div>
                <div className="row mb-3">
                  <div className="col-6 fw-bold">Name:</div>
                  <div className="col-6">{viewItem.item_name}</div>
                </div>
                <div className="row mb-3">
                  <div className="col-6 fw-bold">Category:</div>
                  <div className="col-6">{viewItem.category}</div>
                </div>
                <div className="row mb-3">
                  <div className="col-6 fw-bold">Description:</div>
                  <div className="col-6">{viewItem.description || "—"}</div>
                </div>
                <div className="row mb-3">
                  <div className="col-6 fw-bold">Stock:</div>
                  <div className="col-6">
                    {viewItem.quantity} {viewItem.unit}
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-6 fw-bold">Unit:</div>
                  <div className="col-6">{viewItem.unit}</div>
                </div>
                <div className="row mb-3">
                  <div className="col-6 fw-bold">Reorder Level:</div>
                  <div className="col-6">{viewItem.reorder_level}</div>
                </div>
                <div className="row mb-3">
                  <div className="col-6 fw-bold">Item Cost:</div>
                  <div className="col-6">
                    GHS {viewItem.item_cost ? parseFloat(viewItem.item_cost).toFixed(2) : "0.00"}
                  </div>
                </div>
                {/* ✅ Total Cost in View Modal */}
                <div className="row mb-3">
                  <div className="col-6 fw-bold">Total Cost:</div>
                  <div className="col-6">
                    <strong>
                      GHS{" "}
                      {(
                        (viewItem.quantity || 0) *
                        (parseFloat(viewItem.item_cost) || 0)
                      ).toFixed(2)}
                    </strong>
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-6 fw-bold">Expiry Date:</div>
                  <div className="col-6">
                    {viewItem.expiry_date ? formatDate(viewItem.expiry_date) : "N/A"}
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-6 fw-bold">Facility:</div>
                  <div className="col-6">{viewItem.facility_name || "Central Warehouse"}</div>
                </div>
                <div className="row mb-3">
                  <div className="col-6 fw-bold">Last Updated:</div>
                  <div className="col-6">{new Date(viewItem.updated_at).toLocaleString()}</div>
                </div>
                <div className="row mb-3">
                  <div className="col-6 fw-bold">Status:</div>
                  <div className="col-6">{getStatusBadge(calculateStatus(viewItem))}</div>
                </div>
              </div>
              <div className="modal-footer border-top-0">
                <button type="button" className="btn btn-secondary" onClick={() => setShowViewModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {(showAddModal ||
        showEditModal ||
        showRestockModal ||
        showViewModal ||
        showHistoryModal ||
        showAddToAllModal) && <div className="modal-backdrop fade show"></div>}
    </div>
  );
};

export default WarehouseInventory;