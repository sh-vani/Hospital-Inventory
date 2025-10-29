import React, { useState, useEffect, useMemo } from "react";
import { FaPlus, FaEye, FaTrash, FaTimes } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import BaseUrl from "../../Api/BaseUrl";
import axiosInstance from "../../Api/axiosInstance";
import Swal from "sweetalert2";

const FacilityUserRequisition = () => {
  // Form states
  const [department, setDepartment] = useState("");
  const [username, setUsername] = useState("");
  const [requisitionType, setRequisitionType] = useState("individual");
  const [showRequisitionModal, setShowRequisitionModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  // Modal states
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRequisition, setSelectedRequisition] = useState(null);
  const [requisitionHistory, setRequisitionHistory] = useState([]);
  // Individual requisition fields
  const [selectedItem, setSelectedItem] = useState("");
  const [quantity, setQuantity] = useState("");
  const [priority, setPriority] = useState("Normal");
  const [remarks, setRemarks] = useState("");
  // ✅ Bulk Cart State
  const [bulkCart, setBulkCart] = useState([]);
  // Bulk requisition fields
  const [bulkItems, setBulkItems] = useState([
    { item: "", quantity: "", priority: "Normal" },
  ]);
  const [bulkRemarks, setBulkRemarks] = useState("");
  // Facility items
  const [facilityItems, setFacilityItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 10;

  // Get user from localStorage
  const getUserFromStorage = () => {
    try {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      console.error("Failed to parse user from localStorage");
      return null;
    }
  };

  // Helper: Check if item is near expiry (within next 30 days)
  const isNearExpiry = (expiryDate, daysThreshold = 30) => {
    if (!expiryDate) return false;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= daysThreshold;
  };

  // ✅ RESTORED: getItemWarnings for modals & dropdowns
  // ✅ Add this ABOVE getItemStatusBadge
  const getItemWarnings = useMemo(() => {
    return (item) => {
      const warnings = [];
      if (item.quantity === 0) warnings.push("OUT OF STOCK");
      else if (item.quantity > 0 && item.quantity <= (item.reorder_level || 0))
        warnings.push("LOW STOCK");
      if (isNearExpiry(item.expiry_date, 30)) warnings.push("NEAR EXPIRY");
      return warnings;
    };
  }, []);

  // ✅ Status badge for main table
  const getItemStatusBadge = useMemo(() => {
    return (item) => {
      if (item.quantity === 0) return { text: "OUT", variant: "danger" };
      if (item.quantity > 0 && item.quantity <= (item.reorder_level || 0))
        return { text: "LOW", variant: "warning" };
      if (isNearExpiry(item.expiry_date, 30))
        return { text: "EXPIRY", variant: "orange" };
      return null;
    };
  }, []);

// Fetch facility items using query param (as per your desired API style)
const fetchFacilityItems = async (facilityId) => {
  try {
    setLoadingItems(true);
    const response = await axiosInstance.get(`${BaseUrl}/inventory`, {
      params: { facility_id: facilityId }
    });

    let items = [];
    // Normalize response — handle multiple response shapes
    if (Array.isArray(response.data.data)) {
      items = response.data.data;
    } else if (Array.isArray(response.data)) {
      items = response.data;
    } else if (response.data && typeof response.data === "object") {
      items = [response.data];
    }

    // Normalize each item (optional but safe)
    const normalized = items.map((item) => ({
      id: item.id,
      item_name: item.item_name || "Unnamed Item",
      unit: item.unit || "units",
      quantity: item.quantity || 0,
      reorder_level: item.reorder_level || 0,
      expiry_date: item.expiry_date,
      // Add other fields if needed: item_code, category, etc.
    }));

    setFacilityItems(normalized);
  } catch (error) {
    console.error("Failed to fetch facility items:", error);
    setFacilityItems([]);
    Swal.fire({
      icon: "error",
      title: "Fetch Failed",
      text: "Failed to fetch facility items. Please try again later.",
    });
  } finally {
    setLoadingItems(false);
  }
};

  // Fetch requisition history
  const fetchRequisitionHistory = async (userId) => {
    try {
      const response = await axiosInstance.get(
        `${BaseUrl}/requisitions/user/${userId}`
      );
      if (response.data.success && Array.isArray(response.data.data)) {
        const formatted = response.data.data
        .map((req) => ({
          id: req.id,
          item_name: req.items?.length > 0 ? req.items[0].item_name : "N/A",
          status: (req.status || "").charAt(0).toUpperCase() + (req.status || "").slice(1),
          priority: getHighestPriorityFromItems(req.items), // ✅ UPDATED HERE
          remarks: req.remarks || "",
          items: Array.isArray(req.items) ? req.items : [],
        }))
        .sort((a, b) => b.id - a.id);
        setRequisitionHistory(formatted);
      } else {
        setRequisitionHistory([]);
      }
    } catch (error) {
      console.error("Failed to fetch requisition history:", error);
      setRequisitionHistory([]);
    }
  };
// ✅ Step 1: Add this helper function inside your component (but outside fetchRequisitionHistory)
const getHighestPriorityFromItems = (items) => {
  if (!Array.isArray(items) || items.length === 0) return "Normal";

  const priorityOrder = { urgent: 3, high: 2, normal: 1 };
  let highest = "normal";

  for (const item of items) {
    const p = (item.priority || "normal").toLowerCase();
    if (priorityOrder[p] > priorityOrder[highest]) {
      highest = p;
    }
  }

  // Capitalize first letter
  return highest.charAt(0).toUpperCase() + highest.slice(1);
};
  // Initialize user session & fetch data
  useEffect(() => {
    const user = getUserFromStorage();
    if (user) {
      setDepartment(user.department || "N/A");
      setUsername(user.name || "User");
      const facilityId = user.facility_id;
      if (facilityId) {
        fetchFacilityItems(facilityId);
      } else {
        console.error("Facility ID not found in user data");
        setLoadingItems(false);
      }
      if (user.id) {
        fetchRequisitionHistory(user.id);
      }
    } else {
      console.error("User not found in localStorage");
      setLoadingItems(false);
    }
  }, []);

  // ✅ Add to Bulk Cart
  const addToBulkCart = (item) => {
    const existing = bulkCart.find((i) => i.item_id === item.id);
    if (existing) {
      Swal.fire(
        "Already Added",
        `${item.item_name} is already in your bulk list.`,
        "info"
      );
      return;
    }
    setBulkCart((prev) => [
      ...prev,
      {
        item_id: item.id,
        item_name: item.item_name,
        quantity: item.reorder_level > 0 ? item.reorder_level : 10,
        priority:
          item.quantity === 0
            ? "High"
            : isNearExpiry(item.expiry_date)
            ? "Urgent"
            : "Normal",
        reason:
          item.quantity === 0
            ? "Out of Stock"
            : item.quantity <= (item.reorder_level || 0)
            ? "Low Stock"
            : "Near Expiry",
      },
    ]);
    Swal.fire({
      icon: "success",
      title: "Added!",
      text: `${item.item_name} added to bulk list.`,
      timer: 1500,
      showConfirmButton: false,
    });
  };

  // ✅ Submit Bulk Cart
  const handleSubmitBulkCart = async () => {
    if (bulkCart.length === 0) {
      Swal.fire("Empty", "No items in bulk list.", "warning");
      return;
    }
    const user = getUserFromStorage();
    if (!user?.id || !user?.facility_id) {
      Swal.fire("Error", "User session invalid.", "error");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        user_id: user.id,
        facility_id: user.facility_id,
        remarks: `Bulk requisition: ${bulkCart
          .map((i) => i.reason)
          .join(", ")}`,
        items: bulkCart.map((i) => ({
          item_id: i.item_id,
          quantity: i.quantity,
          priority: i.priority.toLowerCase(),
        })),
      };
      const res = await axiosInstance.post(
        `${BaseUrl}/requisitions/bulk`,
        payload
      );
      if (res.data.success) {
        setBulkCart([]);
        fetchRequisitionHistory(user.id);
        Swal.fire(
          "Success",
          "Bulk requisition sent to Facility Admin!",
          "success"
        );
      } else throw new Error(res.data.message || "Unknown error");
    } catch (err) {
      Swal.fire("Error", err.message || "Submission failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle individual submission
  const handleIndividualSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem || !quantity || quantity <= 0) {
      Swal.fire({
        icon: "warning",
        title: "Incomplete Form",
        text: "Please select an item and enter a valid quantity.",
      });
      return;
    }
    const user = getUserFromStorage();
    if (!user || !user.facility_id || !user.id) {
      Swal.fire({
        icon: "error",
        title: "Session Error",
        text: "User data incomplete. Please log in again.",
      });
      return;
    }
    setLoading(true);
    try {
      const payload = {
        user_id: user.id,
        facility_id: user.facility_id,
        remarks: remarks.trim() || "",
        items: [
          {
            item_id: parseInt(selectedItem),
            quantity: parseInt(quantity),
            priority: priority.toLowerCase(),
          },
        ],
      };
      const response = await axiosInstance.post(
        `${BaseUrl}/requisitions`,
        payload
      );
      if (response.data.success) {
        setSuccess(true);
        fetchRequisitionHistory(user.id);
        resetIndividualForm();
        setShowRequisitionModal(false);
        Swal.fire({
          icon: "success",
          title: "Submitted!",
          text: "Your requisition has been submitted to Facility Admin.",
          timer: 3000,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Submission Failed",
          text:
            "Failed to submit requisition: " +
            (response.data.message || "Unknown error"),
        });
      }
    } catch (error) {
      console.error("Submission error:", error);
      const msg =
        error.response?.data?.message || "Network error. Please try again.";
      Swal.fire({
        icon: "error",
        title: "Error",
        text: msg,
      });
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  // Handle bulk submission
  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    const validItems = bulkItems.filter(
      (item) => item.item && item.quantity && parseInt(item.quantity) > 0
    );
    if (validItems.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Incomplete Form",
        text: "Please add at least one valid item with quantity.",
      });
      return;
    }
    const user = getUserFromStorage();
    if (!user || !user.facility_id || !user.id) {
      Swal.fire({
        icon: "error",
        title: "Session Error",
        text: "User data incomplete. Please log in again.",
      });
      return;
    }
    setLoading(true);
    try {
      const payload = {
        user_id: user.id,
        facility_id: user.facility_id,
        remarks: bulkRemarks.trim() || "",
        items: validItems.map((item) => ({
          item_id: parseInt(item.item),
          quantity: parseInt(item.quantity),
          priority: item.priority.toLowerCase(),
        })),
      };
      const response = await axiosInstance.post(
        `${BaseUrl}/requisitions`,
        payload
      );
      if (response.data.success) {
        setSuccess(true);
        fetchRequisitionHistory(user.id);
        resetBulkForm();
        setShowRequisitionModal(false);
        Swal.fire({
          icon: "success",
          title: "Submitted!",
          text: "Your bulk requisition has been submitted to Facility Admin.",
          timer: 3000,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Submission Failed",
          text:
            "Failed to submit requisition: " +
            (response.data.message || "Unknown error"),
        });
      }
    } catch (error) {
      console.error("Submission error:", error);
      const msg =
        error.response?.data?.message || "Network error. Please try again.";
      Swal.fire({
        icon: "error",
        title: "Error",
        text: msg,
      });
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  // Reset forms
  const resetIndividualForm = () => {
    setSelectedItem("");
    setQuantity("");
    setPriority("Normal");
    setRemarks("");
  };
  const resetBulkForm = () => {
    setBulkItems([{ item: "", quantity: "", priority: "Normal" }]);
    setBulkRemarks("");
  };

  // Bulk form handlers
  const addBulkItemRow = () => {
    setBulkItems([
      ...bulkItems,
      { item: "", quantity: "", priority: "Normal" },
    ]);
  };
  const removeBulkItemRow = (index) => {
    if (bulkItems.length === 1) return;
    const newItems = [...bulkItems];
    newItems.splice(index, 1);
    setBulkItems(newItems);
  };
  const updateBulkItem = (index, field, value) => {
    const newItems = [...bulkItems];
    newItems[index][field] = value;
    setBulkItems(newItems);
  };

  // Cancel requisition
  const handleCancelRequisition = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, cancel it!",
      cancelButtonText: "No, keep it",
    });
    if (!result.isConfirmed) return;
    setLoading(true);
    try {
      const response = await axiosInstance.delete(
        `${BaseUrl}/requisitions/${id}`
      );
      if (response.data.success) {
        setRequisitionHistory((prev) =>
          prev.map((req) =>
            req.id === id ? { ...req, status: "Cancelled" } : req
          )
        );
        Swal.fire({
          icon: "success",
          title: "Cancelled!",
          text: "Requisition has been cancelled.",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Cancellation Failed",
          text:
            "Failed to cancel requisition: " +
            (response.data.message || "Unknown error"),
        });
      }
    } catch (error) {
      console.error("Cancellation error:", error);
      const msg =
        error.response?.data?.message || "Network error. Please try again.";
      Swal.fire({
        icon: "error",
        title: "Error",
        text: msg,
      });
    } finally {
      setLoading(false);
    }
  };

  // View detail
  const handleViewDetail = (req) => {
    setSelectedRequisition(req);
    setShowDetailModal(true);
  };

  // Add item button
  const handleAddItem = () => {
    setShowRequisitionModal(true);
    if (requisitionType === "individual") {
      resetIndividualForm();
    } else {
      resetBulkForm();
    }
  };

  // Status badge
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Pending":
        return "bg-warning text-dark";
      case "Processing":
        return "bg-info";
      case "Approved":
        return "bg-success";
      case "Cancelled":
        return "bg-secondary";
      case "Dispatched":
        return "bg-primary";
      default:
        return "bg-secondary";
    }
  };

  // Priority badge
  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case "Normal":
        return "bg-success";
      case "High":
        return "bg-warning text-dark";
      case "Urgent":
        return "bg-danger";
      default:
        return "bg-secondary";
    }
  };

  // Apply filters
  const filteredRequisitions = requisitionHistory.filter((req) => {
    const matchesSearch =
      req.id.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      (req.item_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (req.remarks || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || req.status === statusFilter;
    const matchesPriority =
      priorityFilter === "All" || req.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredRequisitions.length / entriesPerPage);
  const indexOfLastEntry = currentPage * entriesPerPage;
  const currentEntries = filteredRequisitions.slice(
    indexOfLastEntry - entriesPerPage,
    indexOfLastEntry
  );
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Reset to page 1 when filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, priorityFilter]);

  return (
    <div className="">
      <div className="card shadow-sm border-0 mb-4">
        {/* ✅ Bulk Cart Summary — TOP OF CARD */}
        {bulkCart.length > 0 && (
          <div className="alert alert-info mb-4">
            <div className="d-flex justify-content-between align-items-center">
              <strong>Bulk Requisition Cart:</strong> {bulkCart.length} items
              <div>
                <button
                  className="btn btn-sm btn-outline-primary me-2"
                  onClick={() => setBulkCart([])}
                >
                  Clear Cart
                </button>
                <button
                  className="btn btn-sm btn-primary"
                  onClick={handleSubmitBulkCart}
                  disabled={loading}
                >
                  <FaPlus className="me-1" /> Submit Bulk to Warehouse
                </button>
              </div>
            </div>
          </div>
        )}

 

        <div className="card-header bg-white py-3">
          <h3 className="fw-bold mb-0">Create Requisition</h3>
          <p className="mb-0 text-muted">
            Submit requisition to Facility Admin
          </p>
        </div>
        <div className="card-body">
          <div className="row align-items-center mb-4">
            <div className="col-md-6">
              <div className="bg-light p-3 rounded">
                <div className="text-muted small">
                  Department: <strong>{department}</strong>
                </div>
                <div className="mt-1">
                  User: <strong>{username}</strong>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card bg-light border-0">
                <div className="card-body">
                  <h6 className="mb-3">Requisition Type</h6>
                  <div className="d-flex gap-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="requisitionType"
                        id="individual"
                        value="individual"
                        checked={requisitionType === "individual"}
                        onChange={() => setRequisitionType("individual")}
                      />
                      <label className="form-check-label" htmlFor="individual">
                        <div className="fw-bold">Individual</div>
                        <small className="text-muted">
                          For daily usage items
                        </small>
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="requisitionType"
                        id="bulk"
                        value="bulk"
                        checked={requisitionType === "bulk"}
                        onChange={() => setRequisitionType("bulk")}
                      />
                      <label className="form-check-label" htmlFor="bulk">
                        <div className="fw-bold">Bulk</div>
                        <small className="text-muted">
                          For large quantity orders
                        </small>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Success alert */}
          {success && (
            <div
              className="alert alert-success alert-dismissible fade show"
              role="alert"
            >
              <strong>Success!</strong> Your requisition has been submitted to
              Facility Admin.
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="alert"
                aria-label="Close"
              ></button>
            </div>
          )}
          {/* Requisition History */}
          <div className="mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="text-primary">Requisition History</h5>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleAddItem}
              >
                <FaPlus className="me-1" /> Create Requisition
              </button>
            </div>
            {/* Filters */}
            <div className="row mb-4 g-3">
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by Req ID, Item or Remarks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <select
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Dispatched">Dispatched</option>
                  <option value="Approved">Approved</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div className="col-md-3">
                <select
                  className="form-select"
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                >
                  <option value="All">All Priority</option>
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
              <div className="col-md-2 d-flex align-items-end">
                <button
                  className="btn btn-outline-secondary w-100"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("All");
                    setPriorityFilter("All");
                  }}
                >
                  Clear Filters
                </button>
              </div>
            </div>
        {/* Table */}
<div className="table-responsive">
  <table className="table table-hover align-middle">
    <thead className="table-light">
      <tr>
        <th>Req ID</th>
        <th>Item Name</th>
        <th>Qty</th> {/* ✅ New Column */}
        <th>Status</th>
        <th>Priority</th>
        <th>Remarks</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
  {currentEntries.length > 0 ? (
    currentEntries.map((req) => {
      const items = req.items || [];
      const itemCount = items.length;

      // ✅ Total requested quantity (sum of all items)
      const totalQty = items.reduce(
        (sum, item) => sum + (parseInt(item.quantity) || 0),
        0
      );

      // ✅ All item names (comma-separated)
      const allItemNames =
        itemCount === 0
          ? "N/A"
          : items.map((item) => item.item_name || `Item ID: ${item.item_id}`).join(", ");

      return (
        <tr key={req.id}>
          <td>#{req.id}</td>
          <td className="text-truncate" style={{ maxWidth: "250px" }}>
            {allItemNames}
          </td>
          <td>{totalQty || "-"}</td>
          <td>
            <span className={`badge ${getStatusBadgeClass(req.status)}`}>
              {req.status}
            </span>
          </td>
          <td>
            <span className={`badge ${getPriorityBadgeClass(req.priority)}`}>
              {req.priority}
            </span>
          </td>
          <td className="text-truncate" style={{ maxWidth: "200px" }}>
            {req.remarks || "-"}
          </td>
          <td>
            <button
              className="btn btn-sm btn-outline-primary me-2"
              title="View Details"
              onClick={() => handleViewDetail(req)}
            >
              <FaEye />
            </button>
            {req.status === "Pending" && (
              <button
                className="btn btn-sm btn-outline-danger"
                title="Cancel"
                onClick={() => handleCancelRequisition(req.id)}
                disabled={loading}
              >
                <FaTrash />
              </button>
            )}
          </td>
        </tr>
      );
    })
  ) : (
    <tr>
      <td colSpan="7" className="text-center py-5">
        <div className="text-muted">
          <FaEye size={24} className="mb-2" />
          <p className="mb-0">No requisitions found.</p>
        </div>
      </td>
    </tr>
  )}
</tbody>
  </table>
</div>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-end mt-3">
                <nav>
                  <ul className="pagination mb-0">
                    <li
                      className={`page-item ${
                        currentPage === 1 ? "disabled" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </button>
                    </li>
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      let page;
                      if (totalPages <= 5) {
                        page = i + 1;
                      } else {
                        if (currentPage <= 3) {
                          page = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          page = totalPages - 4 + i;
                        } else {
                          page = currentPage - 2 + i;
                        }
                      }
                      return (
                        <li
                          key={page}
                          className={`page-item ${
                            currentPage === page ? "active" : ""
                          }`}
                        >
                          <button
                            className="page-link"
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </button>
                        </li>
                      );
                    })}
                    {totalPages > 5 && (
                      <li className="page-item disabled">
                        <span className="page-link">...</span>
                      </li>
                    )}
                    {totalPages > 5 && (
                      <li
                        className={`page-item ${
                          currentPage === totalPages ? "disabled" : ""
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(totalPages)}
                        >
                          {totalPages}
                        </button>
                      </li>
                    )}
                    <li
                      className={`page-item ${
                        currentPage === totalPages || totalPages === 0
                          ? "disabled"
                          : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={
                          currentPage === totalPages || totalPages === 0
                        }
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Requisition Modal */}
      <div
        className={`modal fade ${showRequisitionModal ? "show" : ""}`}
        style={{ display: showRequisitionModal ? "block" : "none" }}
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header bg-light">
              <h5 className="modal-title">
                {requisitionType === "individual"
                  ? "Individual Requisition"
                  : "Bulk Requisition"}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => {
                  setShowRequisitionModal(false);
                  setPriority("Normal");
                }}
              ></button>
            </div>
            <div className="modal-body">
              {requisitionType === "individual" ? (
                <form onSubmit={handleIndividualSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Item <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select"
                        value={selectedItem}
                        onChange={(e) => setSelectedItem(e.target.value)}
                        required
                      >
                        <option value="">Select an item</option>
                        {loadingItems ? (
                          <option>Loading items...</option>
                        ) : facilityItems.length > 0 ? (
                          facilityItems.map((item) => {
                            const warnings = getItemWarnings(item);
                            return (
                              <option key={item.id} value={item.id}>
                                {item.item_name} ({item.quantity}{" "}
                                {item.unit || "units"})
                                {warnings.length > 0 && (
                                  <span className="text-danger ms-2">
                                    ⚠️ {warnings.join(", ")}
                                  </span>
                                )}
                              </option>
                            );
                          })
                        ) : (
                          <option>No items available in facility</option>
                        )}
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Qty <span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Priority</label>
                      <select
                        className="form-select"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                      >
                        <option value="Normal">Normal</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent</option>
                      </select>
                    </div>
                    <div className="col-12 mb-3">
                      <label className="form-label">Remarks</label>
                      <textarea
                        className="form-control"
                        rows="2"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="Enter any additional notes..."
                      ></textarea>
                    </div>
                  </div>
                  <div className="d-flex justify-content-end gap-2">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowRequisitionModal(false);
                        setPriority("Normal");
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Submitting...
                        </>
                      ) : (
                        "Submit Requisition"
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleBulkSubmit}>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6 className="mb-0">Items</h6>
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm"
                        onClick={addBulkItemRow}
                      >
                        <FaPlus className="me-1" /> Add Item
                      </button>
                    </div>
                    <div className="table-responsive">
                      <table className="table table-borderless">
                        <thead>
                          <tr>
                            <th>Item</th>
                            <th>Qty</th>
                            <th>Priority</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bulkItems.map((item, index) => (
                            <tr key={index}>
                              <td>
                                <select
                                  className="form-select form-select-sm"
                                  value={item.item}
                                  onChange={(e) =>
                                    updateBulkItem(
                                      index,
                                      "item",
                                      e.target.value
                                    )
                                  }
                                  required
                                >
                                  <option value="">Select item</option>
                                  {loadingItems ? (
                                    <option>Loading...</option>
                                  ) : facilityItems.length > 0 ? (
                                    facilityItems.map((facilityItem) => {
                                      const warnings =
                                        getItemWarnings(facilityItem);
                                      return (
                                        <option
                                          key={facilityItem.id}
                                          value={facilityItem.id}
                                        >
                                          {facilityItem.item_name} (
                                          {facilityItem.quantity}{" "}
                                          {facilityItem.unit || "units"})
                                          {warnings.length > 0 && (
                                            <span className="text-danger ms-2">
                                              ⚠️ {warnings.join(", ")}
                                            </span>
                                          )}
                                        </option>
                                      );
                                    })
                                  ) : (
                                    <option>No items available</option>
                                  )}
                                </select>
                              </td>
                              <td>
                                <input
                                  type="number"
                                  className="form-control form-control-sm"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) =>
                                    updateBulkItem(
                                      index,
                                      "quantity",
                                      e.target.value
                                    )
                                  }
                                  required
                                />
                              </td>
                              <td>
                                <select
                                  className="form-select form-select-sm"
                                  value={item.priority}
                                  onChange={(e) =>
                                    updateBulkItem(
                                      index,
                                      "priority",
                                      e.target.value
                                    )
                                  }
                                >
                                  <option value="Normal">Normal</option>
                                  <option value="High">High</option>
                                  <option value="Urgent">Urgent</option>
                                </select>
                              </td>
                              <td>
                                {bulkItems.length > 1 && (
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => removeBulkItemRow(index)}
                                  >
                                    <FaTimes />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Remarks</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      value={bulkRemarks}
                      onChange={(e) => setBulkRemarks(e.target.value)}
                      placeholder="Enter any additional notes..."
                    ></textarea>
                  </div>
                  <div className="d-flex justify-content-end gap-2">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowRequisitionModal(false);
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Submitting...
                        </>
                      ) : (
                        "Submit Bulk Requisition"
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Requisition Detail Modal */}
      <div
        className={`modal fade ${showDetailModal ? "show" : ""}`}
        style={{ display: showDetailModal ? "block" : "none" }}
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header bg-light">
              <h5 className="modal-title">Requisition Details</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowDetailModal(false)}
              ></button>
            </div>
            <div className="modal-body">
              {selectedRequisition && (
                <>
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <strong>Req ID:</strong>
                        <div>#{selectedRequisition.id}</div>
                      </div>
                      <div className="mb-3">
                        <strong>Department:</strong>
                        <div>{department}</div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <strong>Status:</strong>
                        <div>
                          <span
                            className={`badge ${getStatusBadgeClass(
                              selectedRequisition.status
                            )}`}
                          >
                            {selectedRequisition.status}
                          </span>
                        </div>
                      </div>
                      <div className="mb-3">
                        <strong>Priority:</strong>
                        <div>
                          <span
                            className={`badge ${getPriorityBadgeClass(
                              selectedRequisition.priority
                            )}`}
                          >
                            {selectedRequisition.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="col-12">
                      <strong>Remarks:</strong>
                      <div className="bg-light p-2 rounded mt-1">
                        {selectedRequisition.remarks || "-"}
                      </div>
                    </div>
                  </div>
                  <h6 className="mt-4 mb-3">Items in this Requisition</h6>
                  {selectedRequisition.items?.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-bordered">
                        <thead className="table-light">
                          <tr>
                            <th>Item Name</th>
                            <th>Qty</th>
                            <th>Priority</th>
                            {selectedRequisition.items[0].description && (
                              <th>Description</th>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {selectedRequisition.items.map((item, idx) => (
                            <tr key={idx}>
                              <td>
                                {item.item_name || `Item ID: ${item.item_id}`}
                              </td>
                              <td>{item.quantity}</td>
                              <td>
                                <span
                                  className={`badge ${getPriorityBadgeClass(
                                    item.priority || "Normal"
                                  )}`}
                                >
                                  {item.priority || "Normal"}
                                </span>
                              </td>
                              {item.description && <td>{item.description}</td>}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-muted">No items found.</p>
                  )}
                </>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowDetailModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Backdrops */}
      {showRequisitionModal && <div className="modal-backdrop fade show"></div>}
      {showDetailModal && <div className="modal-backdrop fade show"></div>}
    </div>
  );
};

export default FacilityUserRequisition;
