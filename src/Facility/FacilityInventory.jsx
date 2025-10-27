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
  FaEye,
} from "react-icons/fa";
import axios from "axios";

const FacilityInventory = () => {
  // === DUMMY DATA ===
  const dummyInventory = [
    {
      id: 1,
      item_code: "ITM001",
      item_name: "Paracetamol 500mg",
      category: "Medicine",
      description: "Pain relief medication",
      unit: "tablets",
      quantity: 120,
      reorder_level: 50,
      item_cost: 2.5,
      expiry_date: "2024-12-31",
      facility_name: "Central Warehouse",
      updated_at: "2023-10-15T10:30:00Z",
    },
    {
      id: 2,
      item_code: "ITM002",
      item_name: "Face Masks",
      category: "PPE",
      description: "Disposable face masks",
      unit: "pieces",
      quantity: 25,
      reorder_level: 100,
      item_cost: 0.5,
      expiry_date: "2025-06-30",
      facility_name: "Central Warehouse",
      updated_at: "2023-10-10T14:20:00Z",
    },
    {
      id: 3,
      item_code: "ITM003",
      item_name: "Hand Sanitizer",
      category: "Sanitizer",
      description: "Alcohol-based hand sanitizer",
      unit: "bottles",
      quantity: 0,
      reorder_level: 30,
      item_cost: 3.75,
      expiry_date: "2024-11-15",
      facility_name: "Central Warehouse",
      updated_at: "2023-10-05T09:15:00Z",
    },
    {
      id: 4,
      item_code: "ITM004",
      item_name: "Gloves",
      category: "PPE",
      description: "Disposable latex gloves",
      unit: "pairs",
      quantity: 200,
      reorder_level: 150,
      item_cost: 1.25,
      expiry_date: "2024-10-20",
      facility_name: "Central Warehouse",
      updated_at: "2023-10-12T16:45:00Z",
    },
    {
      id: 5,
      item_code: "ITM005",
      item_name: "Thermometer",
      category: "Equipment",
      description: "Digital thermometer",
      unit: "pieces",
      quantity: 15,
      reorder_level: 10,
      item_cost: 12.99,
      expiry_date: null,
      facility_name: "Central Warehouse",
      updated_at: "2023-10-08T11:30:00Z",
    },
    {
      id: 6,
      item_code: "ITM006",
      item_name: "Ibuprofen 400mg",
      category: "Medicine",
      description: "Anti-inflammatory medication",
      unit: "tablets",
      quantity: 75,
      reorder_level: 80,
      item_cost: 3.2,
      expiry_date: "2024-11-05",
      facility_name: "Central Warehouse",
      updated_at: "2023-10-14T13:20:00Z",
    },
    {
      id: 7,
      item_code: "ITM007",
      item_name: "Surgical Gowns",
      category: "PPE",
      description: "Disposable surgical gowns",
      unit: "pieces",
      quantity: 45,
      reorder_level: 60,
      item_cost: 5.5,
      expiry_date: "2025-03-15",
      facility_name: "Central Warehouse",
      updated_at: "2023-10-11T15:10:00Z",
    },
    {
      id: 8,
      item_code: "ITM008",
      item_name: "Antiseptic Solution",
      category: "Sanitizer",
      description: "Chlorhexidine antiseptic solution",
      unit: "bottles",
      quantity: 30,
      reorder_level: 25,
      item_cost: 4.75,
      expiry_date: "2024-10-25",
      facility_name: "Central Warehouse",
      updated_at: "2023-10-09T10:05:00Z",
    },
    {
      id: 9,
      item_code: "ITM009",
      item_name: "Syringes",
      category: "Equipment",
      description: "Disposable syringes 5ml",
      unit: "pieces",
      quantity: 0,
      reorder_level: 100,
      item_cost: 0.75,
      expiry_date: "2025-01-20",
      facility_name: "Central Warehouse",
      updated_at: "2023-10-07T14:30:00Z",
    },
    {
      id: 10,
      item_code: "ITM010",
      item_name: "Oxygen Mask",
      category: "Equipment",
      description: "Adult oxygen mask",
      unit: "pieces",
      quantity: 35,
      reorder_level: 20,
      item_cost: 8.25,
      expiry_date: "2024-12-10",
      facility_name: "Central Warehouse",
      updated_at: "2023-10-13T12:15:00Z",
    },
    {
      id: 11,
      item_code: "ITM011",
      item_name: "Vitamin C Tablets",
      category: "Medicine",
      description: "Vitamin C 1000mg tablets",
      unit: "tablets",
      quantity: 150,
      reorder_level: 100,
      item_cost: 5.99,
      expiry_date: "2024-11-30",
      facility_name: "Central Warehouse",
      updated_at: "2023-10-14T09:45:00Z",
    },
    {
      id: 12,
      item_code: "ITM012",
      item_name: "Blood Pressure Monitor",
      category: "Equipment",
      description: "Digital blood pressure monitor",
      unit: "pieces",
      quantity: 8,
      reorder_level: 5,
      item_cost: 45.99,
      expiry_date: null,
      facility_name: "Central Warehouse",
      updated_at: "2023-10-12T11:20:00Z",
    },
  ];

  const dummyPendingRequests = [
    {
      id: 1,
      facility_name: "City General Hospital",
      item_count: 15,
      request_date: "2023-10-15T08:30:00Z",
    },
    {
      id: 2,
      facility_name: "Community Health Center",
      item_count: 8,
      request_date: "2023-10-14T14:15:00Z",
    },
    {
      id: 3,
      facility_name: "District Medical Facility",
      item_count: 22,
      request_date: "2023-10-13T10:45:00Z",
    },
    {
      id: 4,
      facility_name: "Regional Hospital",
      item_count: 12,
      request_date: "2023-10-12T16:30:00Z",
    },
    {
      id: 5,
      facility_name: "Urgent Care Clinic",
      item_count: 5,
      request_date: "2023-10-11T09:20:00Z",
    },
  ];

  const dummyMovements = [
    {
      id: 1,
      date: "2023-10-15T10:30:00Z",
      type: "stock_in",
      quantity: 50,
      from_to: "Supplier A",
      reference: "PO-2023-1050",
    },
    {
      id: 2,
      date: "2023-10-14T14:20:00Z",
      type: "dispatch",
      quantity: -20,
      from_to: "City General Hospital",
      reference: "REQ-2023-0876",
    },
    {
      id: 3,
      date: "2023-10-13T09:15:00Z",
      type: "transfer",
      quantity: -15,
      from_to: "Community Health Center",
      reference: "TRF-2023-0042",
    },
    {
      id: 4,
      date: "2023-10-12T11:30:00Z",
      type: "adjustment",
      quantity: -5,
      from_to: "Inventory Adjustment",
      reference: "ADJ-2023-0015",
    },
    {
      id: 5,
      date: "2023-10-11T16:45:00Z",
      type: "stock_in",
      quantity: 100,
      from_to: "Supplier B",
      reference: "PO-2023-1042",
    },
  ];

  // Dummy facilities data
  const dummyFacilities = [
    { id: 1, name: "Central Warehouse" },
    { id: 2, name: "City General Hospital" },
    { id: 3, name: "Community Health Center" },
    { id: 4, name: "District Medical Facility" },
    { id: 5, name: "Regional Hospital" },
    { id: 6, name: "Urgent Care Clinic" },
    { id: 7, name: "Specialized Care Center" },
    { id: 8, name: "Mobile Health Unit" },
  ];

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
  const [movements, setMovements] = useState([]);
  const [movementsLoading, setMovementsLoading] = useState(false);

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

        // Simulate API call with dummy data
        setTimeout(() => {
          const inventoryData = dummyInventory;
          setInventory(inventoryData);

          // Categorize items
          const lowStock = inventoryData.filter(
            (item) => item.quantity > 0 && item.quantity < item.reorder_level
          );
          const outOfStock = inventoryData.filter(
            (item) => item.quantity === 0
          );
          const nearExpiry = inventoryData.filter((item) => {
            if (!item.expiry_date) return false;
            const expiryDate = new Date(item.expiry_date);
            const today = new Date();
            const diffTime = expiryDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays <= 30; // Items expiring within 30 days
          });

          setLowStockItems(lowStock);
          setOutOfStockItems(outOfStock);
          setNearExpiryItems(nearExpiry);

          // Set pending requests
          setPendingRequests(dummyPendingRequests);

          // Set facilities
          setFacilities(dummyFacilities);

          setLoading(false);
        }, 1000); // Simulate network delay
      } catch (err) {
        setError("Error fetching data: " + err.message);
        setLoading(false);
      }
    };

    fetchInventoryData();
  }, []);

  // Handle clicks outside the hover tooltip
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

  // === FETCH MOVEMENT DATA ===
  const fetchMovements = async (itemId) => {
    try {
      setMovementsLoading(true);

      // Simulate API call with dummy data
      setTimeout(() => {
        setMovements(dummyMovements);
        setMovementsLoading(false);
      }, 500); // Simulate network delay
    } catch (err) {
      setError("Error fetching movements: " + err.message);
      setMovementsLoading(false);
    }
  };

  // === FILTER LOGIC ===
  const filteredInventory = inventory.filter((item) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return (
      item.item_code.toLowerCase().includes(q) ||
      item.item_name.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentInventory = filteredInventory.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Reset to first page when search term changes
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
    // Find the facility ID based on the facility name
    const facility = facilities.find((f) => f.name === item.facility_name);
    setEditForm({
      item_name: item.item_name,
      category: item.category,
      description: item.description,
      unit: item.unit,
      quantity: item.quantity,
      reorder_level: item.reorder_level,
      item_cost: item.item_cost,
      expiry_date: item.expiry_date,
      facility_id: facility ? facility.id : "",
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

  // === ACTION HANDLERS ===
  const handleSaveEdit = async () => {
    try {
      // Simulate API call
      setTimeout(() => {
        // Find the selected facility name based on the facility_id
        const selectedFacility = facilities.find(
          (f) => f.id === parseInt(editForm.facility_id)
        );

        const updatedItem = {
          ...currentItem,
          ...editForm,
          facility_name: selectedFacility
            ? selectedFacility.name
            : currentItem.facility_name,
        };

        setInventory((prevInventory) =>
          prevInventory.map((item) =>
            item.id === currentItem.id ? updatedItem : item
          )
        );

        alert(`Item ${currentItem.item_code} updated successfully`);
        setShowEditModal(false);
      }, 500); // Simulate network delay
    } catch (err) {
      alert("Error updating item: " + err.message);
    }
  };

  const handleAddItem = async () => {
    try {
      // Simulate API call
      setTimeout(() => {
        // Find the selected facility name
        const selectedFacility = facilities.find(
          (f) => f.id === parseInt(addForm.facility_id)
        );

        const newItem = {
          id: inventory.length + 1,
          ...addForm,
          facility_name: selectedFacility
            ? selectedFacility.name
            : "Central Warehouse",
          updated_at: new Date().toISOString(),
        };

        setInventory((prevInventory) => [...prevInventory, newItem]);
        alert(`Item ${addForm.item_code} added successfully`);
        setShowAddModal(false);
      }, 500); // Simulate network delay
    } catch (err) {
      alert("Error adding item: " + err.message);
    }
  };

  // === HELPER FUNCTIONS ===
  const calculateStatus = (item) => {
    if (item.quantity === 0) return "out_of_stock";
    if (item.quantity < item.reorder_level) return "low_stock";

    // Check if near expiry
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

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Calculate days until expiry
  const daysUntilExpiry = (expiryDate) => {
    if (!expiryDate) return null;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Pagination controls
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const renderPagination = () => {
    // Only hide pagination if there are NO items at all
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
            <button
              className="page-link"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
          </li>

          {startPage > 1 && (
            <>
              <li className="page-item">
                <button className="page-link" onClick={() => goToPage(1)}>
                  1
                </button>
              </li>
              {startPage > 2 && (
                <li className="page-item disabled">
                  <span className="page-link">...</span>
                </li>
              )}
            </>
          )}

          {pageNumbers.map((number) => (
            <li
              key={number}
              className={`page-item ${number === currentPage ? "active" : ""}`}
            >
              <button className="page-link" onClick={() => goToPage(number)}>
                {number}
              </button>
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
                <button
                  className="page-link"
                  onClick={() => goToPage(totalPages)}
                >
                  {totalPages}
                </button>
              </li>
            </>
          )}

          <li
            className={`page-item ${
              currentPage === totalPages ? "disabled" : ""
            }`}
          >
            <button
              className="page-link"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </li>
        </ul>
      </nav>
    );
  };

  return (
    <div className="container-fluid py-3">
      {/* ===== Top Toolbar ===== */}
      {/* ===== Top Toolbar ===== */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <h2 className="fw-bold mb-0">Facility Inventory</h2>
        <div
          className="d-flex gap-2"
          style={{ maxWidth: "600px", width: "100%" }}
        >
          {/* Search Bar */}
          <div
            className="input-group"
            style={{ maxWidth: "320px", width: "100%" }}
          >
            <input
              type="text"
              className="form-control"
              style={{ height: "40px" }}
              placeholder="Search by Item Code, Name, or Category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              className="btn btn-outline-secondary"
              style={{ height: "40px" }}
              type="button"
            >
              <FaSearch />
            </button>
          </div>

          {/* ✅ NEW BUTTON: View Warehouse Inventory */}
          <button
            className="btn btn-outline-primary d-flex align-items-center gap-1"
            style={{ height: "40px" }}
            onClick={() => (window.location.href = "/warehouse/inventory")}
          >
            <FaEye /> View Warehouse Inventory
          </button>
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

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

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
                      {searchTerm
                        ? "No items match your search criteria."
                        : "No inventory items found."}
                    </td>
                  </tr>
                ) : (
                  currentInventory.map((item) => (
                    <tr key={item.id}>
                      <td className="fw-bold">{item.item_code}</td>
                      <td>{item.item_name}</td>
                      <td>
                        <span className="badge bg-light text-dark">
                          {item.category}
                        </span>
                      </td>
                      <td
                        className={
                          item.quantity < item.reorder_level
                            ? "text-warning fw-medium"
                            : "text-success fw-medium"
                        }
                      >
                        {item.quantity.toLocaleString()}
                      </td>
                      <td>{item.reorder_level.toLocaleString()}</td>
                      <td>
                        GHS{" "}
                        {item.item_cost
                          ? parseFloat(item.item_cost).toFixed(2)
                          : "0.00"}
                      </td>
                      <td>
                        {item.expiry_date ? (
                          <span
                            className={
                              daysUntilExpiry(item.expiry_date) <= 30
                                ? "text-info fw-medium"
                                : ""
                            }
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
                            className="btn btn-sm btn-outline-success"
                            title="View Details"
                            onClick={() => openViewModal(item)}
                          >
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {renderPagination()}
        </div>
      )}

      {/* View Item Modal */}
      {showViewModal && viewItem && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          onClick={closeModalOnBackdrop}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header border-bottom-0">
                <h5 className="modal-title">
                  Item Details: {viewItem.item_name}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowViewModal(false)}
                ></button>
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
                    GHS{" "}
                    {viewItem.item_cost
                      ? parseFloat(viewItem.item_cost).toFixed(2)
                      : "0.00"}
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-6 fw-bold">Expiry Date:</div>
                  <div className="col-6">
                    {viewItem.expiry_date
                      ? formatDate(viewItem.expiry_date)
                      : "N/A"}
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-6 fw-bold">Facility:</div>
                  <div className="col-6">
                    {viewItem.facility_name || "Central Warehouse"}
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-6 fw-bold">Last Updated:</div>
                  <div className="col-6">
                    {new Date(viewItem.updated_at).toLocaleString()}
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-6 fw-bold">Status:</div>
                  <div className="col-6">
                    {getStatusBadge(calculateStatus(viewItem))}
                  </div>
                </div>
              </div>
              <div className="modal-footer border-top-0">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowViewModal(false)}
                >
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
        showHistoryModal) && <div className="modal-backdrop fade show"></div>}
    </div>
  );
};

export default FacilityInventory;
