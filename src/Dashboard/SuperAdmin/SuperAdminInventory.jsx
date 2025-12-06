import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaPlus,
  FaExclamationTriangle,
  FaClock,
  FaTimes,
  FaArrowRight,
  FaEdit,
  FaHistory,
} from "react-icons/fa";
import axiosInstance from "../../Api/axiosInstance";
import BaseUrl from "../../Api/BaseUrl";
import Swal from "sweetalert2";

const SuperAdminInventory = () => {
  // === STATE ===
  const [inventory, setInventory] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [outOfStockItems, setOutOfStockItems] = useState([]);
  const [nearExpiryItems, setNearExpiryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState(null);
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  // Form states
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
  const [bulkItems, setBulkItems] = useState([
    {
      item_code: "",
      item_name: "",
      category: "",
      description: "",
      unit: "",
      quantity: "",
      reorder_level: "",
      item_cost: "",
      expiry_date: "",
    },
  ]);
  const [editForm, setEditForm] = useState({});
  const [currentItem, setCurrentItem] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [addingSingle, setAddingSingle] = useState(false);
  const [addingBulk, setAddingBulk] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);

  // ✅ Helper: Calculate total cost
  const calculateTotalCost = (qty, cost) => {
    return (parseFloat(qty || 0) * parseFloat(cost || 0)).toFixed(2);
  };

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
      Swal.fire({
        icon: "error",
        title: "Failed to load item",
        text: err.response?.data?.message || err.message,
      });
      return null;
    }
  };

  // === FETCH INVENTORY ===
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`${BaseUrl}/inventory`, {
          params: { page: 1, limit: 1000 },
        });
        if (response.data?.success) {
          const data = response.data.data || [];
          setInventory(data);
          setLowStockItems(data.filter((item) => item.quantity < item.reorder_level));
          setOutOfStockItems(data.filter((item) => item.quantity === 0));
          setNearExpiryItems(
            data.filter((item) => {
              if (!item.expiry_date) return false;
              const days = daysUntilExpiry(item.expiry_date);
              return days !== null && days <= 30;
            })
          );
        } else {
          setError("Failed to load inventory");
          Swal.fire({
            icon: "error",
            title: "Failed to load inventory",
            text: "Please try again later",
          });
        }
      } catch (err) {
        setError("Error loading inventory");
        Swal.fire({
          icon: "error",
          title: "Error loading inventory",
          text: "Please check your connection and try again",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, []);

  // === DATE & STATUS HELPERS ===
  const daysUntilExpiry = (expiryDate) => {
    if (!expiryDate) return null;
    const diff = new Date(expiryDate) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const calculateStatus = (item) => {
    if (item.quantity === 0) return "out_of_stock";
    if (item.quantity < item.reorder_level) return "low_stock";
    if (item.expiry_date && daysUntilExpiry(item.expiry_date) <= 30) return "near_expiry";
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

  const formatDate = (date) => (date ? new Date(date).toLocaleDateString() : "N/A");

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // === FILTERED INVENTORY ===
  const filteredInventory = inventory.filter((item) => {
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !q ||
      (item.item_code?.toLowerCase() || "").includes(q) ||
      (item.item_name?.toLowerCase() || "").includes(q) ||
      (item.category?.toLowerCase() || "").includes(q);
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

  const totalNetWorth = inventory
    .reduce((sum, item) => sum + (item.quantity || 0) * (parseFloat(item.item_cost) || 0), 0)
    .toFixed(2);

  const openViewModal = async (item) => {
    setLoading(true);
    try {
      const fetchedItem = await fetchItemById(item.id);
      if (fetchedItem) {
        setViewItem(fetchedItem);
        setShowViewModal(true);
      }
    } finally {
      setLoading(false);
    }
  };

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
      expiry_date: formatDateForInput(item.expiry_date),
    });
    setShowEditModal(true);
  };

  const openHistoryModal = (item) => {
    setCurrentItem(item);
    setShowHistoryModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setShowBulkModal(false);
    setShowViewModal(false);
    setShowEditModal(false);
    setShowHistoryModal(false);
    setCurrentItem(null);
    setViewItem(null);
    setEditForm({});
  };

  // === FORM HANDLERS ===
  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setAddForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleBulkChange = (index, field, value) => {
    const newItems = [...bulkItems];
    newItems[index][field] = value;
    setBulkItems(newItems);
  };

  // === SINGLE ADD ===
  const handleAddSingle = async () => {
    const { item_code, item_name, category, unit } = addForm;
    if (!item_code || !item_name || !category || !unit) {
      Swal.fire({
        icon: "warning",
        title: "Missing Information",
        text: "Please fill all required fields.",
      });
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
      setAddingSingle(true);
      const res = await axiosInstance.post(`${BaseUrl}/inventory/create`, payload);
      if (res.data?.success) {
        setInventory((prev) => [...prev, { id: res.data.data?.id, ...payload }]);
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Item added successfully!",
        });
        closeModal();
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
        Swal.fire({
          icon: "error",
          title: "Failed to add item",
          text: res.data?.message || "Unknown error occurred",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || err.message || "Network error",
      });
    } finally {
      setAddingSingle(false);
    }
  };

  // === EDIT ===
  const handleSaveEdit = async () => {
    if (!currentItem?.id) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Item ID not found.",
      });
      return;
    }
    const safeParseInt = (value) => (value === "" || value == null ? 0 : parseInt(value, 10));
    const safeParseFloat = (value) => (value === "" || value == null ? 0 : parseFloat(value));
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
      expiry_date: expiryDate,
    };
    try {
      setLoading(true);
      const response = await axiosInstance.put(`${BaseUrl}/inventory/${currentItem.id}`, payload);
      if (response.data?.success) {
        const updatedItem = { id: currentItem.id, ...payload };
        setInventory((prev) =>
          prev.map((item) => (item.id === currentItem.id ? updatedItem : item))
        );
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: `Item ${payload.item_code || 'N/A'} updated successfully!`,
        });
        closeModal();
      } else {
        Swal.fire({
          icon: "error",
          title: "Update failed",
          text: response.data?.message || "Unknown error",
        });
      }
    } catch (err) {
      console.error("Edit error:", err);
      Swal.fire({
        icon: "error",
        title: "Error updating item",
        text: err.response?.data?.message || err.message || "Network error",
      });
    } finally {
      setLoading(false);
    }
  };

  // === DELETE ===
  const handleDeleteItem = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });
    if (!result.isConfirmed) return;
    try {
      setLoading(true);
      const response = await axiosInstance.delete(`${BaseUrl}/inventory/${id}`);
      if (response.data?.success) {
        setInventory(prev => prev.filter(item => item.id !== id));
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Item has been deleted.",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed to delete item",
          text: response.data?.message || "Unknown error",
        });
      }
    } catch (err) {
      console.error("Delete error:", err);
      Swal.fire({
        icon: "error",
        title: "Error deleting item",
        text: err.response?.data?.message || err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // === BULK HANDLERS ===
  const addBulkRow = () => {
    setBulkItems([
      ...bulkItems,
      {
        item_code: "",
        item_name: "",
        category: "",
        description: "",
        unit: "",
        quantity: "",
        reorder_level: "",
        item_cost: "",
        expiry_date: "",
      },
    ]);
  };

  const removeBulkRow = (index) => {
    if (bulkItems.length > 1) {
      const newItems = [...bulkItems];
      newItems.splice(index, 1);
      setBulkItems(newItems);
    }
  };

  const handleAddBulk = async () => {
    const invalid = bulkItems.some(
      (item) => !item.item_code || !item.item_name || !item.category || !item.unit
    );
    if (invalid) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Data",
        text: "All rows must have Item Code, Name, Category, and Unit.",
      });
      return;
    }
    const payload = bulkItems.map((item) => ({
      item_code: item.item_code,
      item_name: item.item_name,
      category: item.category,
      description: item.description || "",
      unit: item.unit,
      quantity: parseInt(item.quantity, 10) || 0,
      reorder_level: parseInt(item.reorder_level, 10) || 0,
      item_cost: parseFloat(item.item_cost) || 0,
      expiry_date: item.expiry_date || null,
    }));
    try {
      setAddingBulk(true);
      const res = await axiosInstance.post(`${BaseUrl}/inventory/createBulk`, payload);
      if (res.data?.success) {
        const newItems = res.data.data || payload.map((p, i) => ({ id: Date.now() + i, ...p }));
        setInventory((prev) => [...prev, ...newItems]);
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Bulk items added successfully!",
        });
        closeModal();
        setBulkItems([
          { item_code: "", item_name: "", category: "", description: "", unit: "", quantity: "", reorder_level: "", item_cost: "", expiry_date: "" },
        ]);
      } else {
        Swal.fire({
          icon: "error",
          title: "Bulk add failed",
          text: res.data?.message || "Unknown error occurred",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || err.message || "Network error",
      });
    } finally {
      setAddingBulk(false);
    }
  };

  // === PAGINATION ===
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  useEffect(() => setCurrentPage(1), [searchTerm]);
  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentInventory = filteredInventory.slice(startIndex, startIndex + itemsPerPage);
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <div className="container-fluid py-3">
      {/* Toolbar */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <h2 className="fw-bold mb-0">SuperAdmin Inventory</h2>
        <div className="d-flex gap-2" style={{ maxWidth: "600px", width: "100%" }}>
          <div className="input-group" style={{ maxWidth: "320px" }}>
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
          <button className="btn btn-primary d-flex align-items-center gap-1" onClick={() => setShowAddModal(true)}>
            <FaPlus /> Add Item
          </button>
          <button className="btn btn-success d-flex align-items-center gap-1" onClick={() => setShowBulkModal(true)}>
            <FaPlus /> Add Bulk
          </button>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="d-flex flex-wrap gap-2 mb-4">
        <button className="btn btn-outline-danger btn-sm" onClick={() => setFilterType("out_of_stock")}>
          Out of Stock ({outOfStockItems.length})
        </button>
        <button className="btn btn-outline-warning btn-sm" onClick={() => setFilterType("low_stock")}>
          Low Stock ({lowStockItems.length})
        </button>
        <button className="btn btn-outline-info btn-sm" onClick={() => setFilterType("near_expiry")}>
          Near Expiry ({nearExpiryItems.length})
        </button>
        <button className="btn btn-outline-secondary btn-sm" onClick={() => setFilterType(null)}>
          Clear Filter
        </button>
      </div>

      {/* STATS CARDS */}
      <div className="row mb-4 g-3">
        {/* Low Stock */}
        <div className="col-md-4">
          <div
            className="card border-warning bg-warning bg-opacity-10 h-100"
            onMouseEnter={() => setHoveredCard("lowStock")}
            onMouseLeave={() => setHoveredCard(null)}
            style={{ cursor: "default" }}
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
        {/* Out of Stock */}
        <div className="col-md-4">
          <div
            className="card border-danger bg-danger bg-opacity-10 h-100"
            onMouseEnter={() => setHoveredCard("outOfStock")}
            onMouseLeave={() => setHoveredCard(null)}
            style={{ cursor: "default" }}
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
        {/* Near Expiry */}
        <div className="col-md-4">
          <div
            className="card border-info bg-info bg-opacity-10 h-100"
            onMouseEnter={() => setHoveredCard("nearExpiry")}
            onMouseLeave={() => setHoveredCard(null)}
            style={{ cursor: "default" }}
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

      {/* Table */}
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
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentInventory.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center py-4">
                    {searchTerm ? "No items match your search." : "No inventory items."}
                  </td>
                </tr>
              ) : (
                currentInventory.map((item) => {
                  const totalCost = calculateTotalCost(item.quantity, item.item_cost);
                  return (
                    <tr key={item.id}>
                      <td className="fw-bold">{item.item_code}</td>
                      <td>{item.item_name}</td>
                      <td><span className="badge bg-light text-dark">{item.category}</span></td>
                      <td className={item.quantity < item.reorder_level ? "text-warning" : "text-success"}>
                        {item.quantity}
                      </td>
                      <td>{item.reorder_level}</td>
                      <td>GHS {parseFloat(item.item_cost).toFixed(2)}</td>
                      <td><strong>GHS {totalCost}</strong></td> {/* ✅ TOTAL COST */}
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
                        <div className="btn-group" role="group">
                          <button className="btn btn-sm btn-outline-success" onClick={() => openViewModal(item)}>
                            View
                          </button>
                          <button className="btn btn-sm btn-outline-primary" onClick={() => openEditModal(item)}>
                            <FaEdit />
                          </button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteItem(item.id)}>
                            <FaTimes />
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
        {totalPages > 1 && (
          <nav className="d-flex justify-content-center mt-3">
            <ul className="pagination mb-0">
              <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => goToPage(currentPage - 1)}>Previous</button>
              </li>
              {[...Array(totalPages)].map((_, i) => (
                <li key={i + 1} className={`page-item ${currentPage === i + 1 ? "active" : ""}`}>
                  <button className="page-link" onClick={() => goToPage(i + 1)}>{i + 1}</button>
                </li>
              ))}
              <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => goToPage(currentPage + 1)}>Next</button>
              </li>
            </ul>
          </nav>
        )}
      </div>

      {/* === MODALS === */}
      {/* Add Single Modal */}
      {showAddModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Inventory Item</h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
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
                        onChange={handleAddChange}
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
                        onChange={handleAddChange}
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
                        onChange={handleAddChange}
                        required
                      />
                    </div>
                    <div className="col-md-12">
                      <label className="form-label">Description</label>
                      <textarea
                        className="form-control"
                        name="description"
                        value={addForm.description || ""}
                        onChange={handleAddChange}
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Unit *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="unit"
                        value={addForm.unit}
                        onChange={handleAddChange}
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
                        onChange={handleAddChange}
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
                        onChange={handleAddChange}
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
                        onChange={handleAddChange}
                        required
                      />
                    </div>
                    {/* ✅ TOTAL COST PREVIEW */}
                    <div className="col-md-6">
                      <label className="form-label">Total Cost (GHS) - Preview</label>
                      <input
                        className="form-control"
                        value={calculateTotalCost(addForm.quantity, addForm.item_cost)}
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
                        value={addForm.expiry_date || ""}
                        onChange={handleAddChange}
                      />
                    </div>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                <button className="btn btn-primary" onClick={handleAddSingle} disabled={addingSingle}>
                  {addingSingle ? (
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

      {/* Bulk Add Modal */}
      {showBulkModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Bulk Inventory Items</h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>
              <div className="modal-body">
                <div className="table-responsive">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>Item Code</th>
                        <th>Item Name</th>
                        <th>Category</th>
                        <th>Description</th>
                        <th>Unit</th>
                        <th>Quantity</th>
                        <th>Reorder Level</th>
                        <th>Item Cost (GHS)</th>
                        <th>Total Cost</th> {/* ✅ BULK PREVIEW */}
                        <th>Expiry Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bulkItems.map((item, idx) => (
                        <tr key={idx}>
                          <td><input className="form-control" value={item.item_code} onChange={(e) => handleBulkChange(idx, "item_code", e.target.value)} /></td>
                          <td><input className="form-control" value={item.item_name} onChange={(e) => handleBulkChange(idx, "item_name", e.target.value)} /></td>
                          <td><input className="form-control" value={item.category} onChange={(e) => handleBulkChange(idx, "category", e.target.value)} /></td>
                          <td><input className="form-control" value={item.description} onChange={(e) => handleBulkChange(idx, "description", e.target.value)} /></td>
                          <td><input className="form-control" value={item.unit} onChange={(e) => handleBulkChange(idx, "unit", e.target.value)} /></td>
                          <td><input type="number" className="form-control" value={item.quantity} onChange={(e) => handleBulkChange(idx, "quantity", e.target.value)} /></td>
                          <td><input type="number" className="form-control" value={item.reorder_level} onChange={(e) => handleBulkChange(idx, "reorder_level", e.target.value)} /></td>
                          <td><input type="number" step="0.01" className="form-control" value={item.item_cost} onChange={(e) => handleBulkChange(idx, "item_cost", e.target.value)} /></td>
                          {/* ✅ TOTAL COST PER ROW */}
                          <td className="bg-light">
                            GHS {calculateTotalCost(item.quantity, item.item_cost)}
                          </td>
                          <td><input type="date" className="form-control" value={item.expiry_date || ""} onChange={(e) => handleBulkChange(idx, "expiry_date", e.target.value)} /></td>
                          <td>
                            <button className="btn btn-sm btn-danger" onClick={() => removeBulkRow(idx)} disabled={bulkItems.length <= 1}>
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button className="btn btn-sm btn-outline-primary mt-2" onClick={addBulkRow}>
                  + Add Row
                </button>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                <button className="btn btn-success" onClick={handleAddBulk} disabled={addingBulk}>
                  {addingBulk ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Adding Bulk...
                    </>
                  ) : (
                    "Add All Items"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && viewItem && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Item Details</h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
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
                {/* ✅ VIEW MODAL TOTAL COST */}
                <div className="row mb-2">
                  <div className="col-5 fw-bold">Total Cost:</div>
                  <div className="col-7">
                    <strong>GHS {calculateTotalCost(viewItem.quantity, viewItem.item_cost)}</strong>
                  </div>
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
                <button className="btn btn-secondary" onClick={closeModal}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && currentItem && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Inventory Item</h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
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
                    {/* ✅ EDIT PREVIEW */}
                    <div className="col-md-6">
                      <label className="form-label">Total Cost (GHS) - Preview</label>
                      <input
                        className="form-control"
                        value={calculateTotalCost(editForm.quantity, editForm.item_cost)}
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
                        value={editForm.expiry_date || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSaveEdit} disabled={loading}>
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

      {/* History Modal (Demo) */}
      {showHistoryModal && currentItem && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Movement History — {currentItem.item_name}</h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
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
                <button className="btn btn-secondary" onClick={closeModal}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {(showAddModal || showBulkModal || showViewModal || showEditModal || showHistoryModal) && (
        <div className="modal-backdrop fade show"></div>
      )}
    </div>
  );
};

export default SuperAdminInventory;