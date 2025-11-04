// src/App.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import BaseUrl from "../Api/BaseUrl";

function FacilityRequisitions() {
  // State for facility info (from localStorage)
  const [adminFacility, setAdminFacility] = useState("Your Facility");
  const [facilityId, setFacilityId] = useState(null);

  // State management
  const [requisitions, setRequisitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeliverModal, setShowDeliverModal] = useState(false);
  const [showRaiseModal, setShowRaiseModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [selectedRequisition, setSelectedRequisition] = useState(null);
  const [deliverQty, setDeliverQty] = useState("");
  const [deliverRemarks, setDeliverRemarks] = useState("");
  const [raisePriority, setRaisePriority] = useState("Normal");
  const [raiseRemarks, setRaiseRemarks] = useState("");
  const [raiseRequiredQty, setRaiseRequiredQty] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [bulkRequisitionList, setBulkRequisitionList] = useState([]);
  const [suggestedRequisitions, setSuggestedRequisitions] = useState([]);

  // Filter states
  const [activeTab, setActiveTab] = useState("all");
  const [userFilter, setUserFilter] = useState("");
  const [itemFilter, setItemFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approveItems, setApproveItems] = useState([]); // will hold { item_id, approved_quantity }
  const [approveRemarks, setApproveRemarks] = useState("");
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 10;

  // === FETCH REAL DATA FROM API ===
  useEffect(() => {
    const fetchRequisitions = async () => {
      try {
        setLoading(true);
        setError(null);

        const userStr = localStorage.getItem("user");
        if (!userStr) {
          setError("User not logged in");
          setLoading(false);
          return;
        }

        const user = JSON.parse(userStr);
        const fid = user.facility_id;
        const fName = user.facility_name || "Unknown Facility";

        if (!fid) {
          setError("Facility ID missing in user profile");
          setLoading(false);
          return;
        }

        setFacilityId(fid);
        setAdminFacility(fName);

        // ✅ API CALL — same as your other component
        const response = await axios.get(`${BaseUrl}/requisitions/facility/${fid}`);

        if (response.data?.success && Array.isArray(response.data.data)) {
          // Transform API response → flat requisition list
          const transformed = response.data.data.flatMap(req => {
            if (!req.items || !Array.isArray(req.items)) return [];

            return req.items.map(item => ({
              id: `REQ-${req.id}`,
              item_id: item.item_id, // 👈 YEH ADD KARO
              facility: req.facility_name || fName,
              user: req.user_name || "Unknown User",
              department: "Department",
              item: item.item_name || "Unnamed Item",
              qty: item.quantity || 0,
              facilityStock: item.available_quantity || 0,
              priority: req.priority?.charAt(0).toUpperCase() + req.priority?.slice(1) || "Normal",
              status: req.status?.charAt(0).toUpperCase() + req.status?.slice(1) || "Pending",
              raisedOn: new Date(req.created_at).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }),
              statusTimeline: [
                { status: "Raised by User", timestamp: new Date(req.created_at).toLocaleString("en-GB") },
                ...(req.approved_at ? [{ status: "Approved", timestamp: new Date(req.approved_at).toLocaleString("en-GB") }] : []),
                ...(req.delivered_at ? [{ status: "Delivered", timestamp: new Date(req.delivered_at).toLocaleString("en-GB") }] : []),
                ...(req.rejected_at ? [{ status: "Rejected", timestamp: new Date(req.rejected_at).toLocaleString("en-GB") }] : []),
              ],
              remarksLog: req.remarks
                ? [{ user: req.user_name, remark: req.remarks, timestamp: new Date(req.created_at).toLocaleString("en-GB") }]
                : [],
              expiryDate: item.expiry_date
                ? new Date(item.expiry_date).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
                : "N/A",
            }));
          });

          setRequisitions(transformed);
        } else {
          setError("Invalid API response format");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load requisitions: " + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };

    fetchRequisitions();
  }, []);

  // === Rest of your logic remains EXACTLY the same ===
  // (Filters, pagination, modals, actions, etc.)

  // Extract unique values for dropdown filters (from real data)
  const users = [...new Set(requisitions.map((req) => req.user))];
  const items = [...new Set(requisitions.map((req) => req.item))];
  const departments = [...new Set(requisitions.map((req) => req.department))];

  // Check for suggestions (low stock, expiry, etc.)
  useEffect(() => {
    if (loading || requisitions.length === 0) return;

    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    const suggestions = [];

    const facilityItems = {};
    requisitions.forEach((req) => {
      if (req.facility === adminFacility) {
        if (!facilityItems[req.item]) {
          facilityItems[req.item] = {
            name: req.item,
            currentStock: req.facilityStock,
            expiryDate: req.expiryDate,
            avgMonthlyUsage: 10,
          };
        }
      }
    });

    Object.values(facilityItems).forEach((item) => {
      if (item.expiryDate === "N/A") return;
      const expiryDate = new Date(item.expiryDate.split('-').reverse().join('-')); // en-GB → ISO

      if (item.currentStock === 0) {
        suggestions.push({ item: item.name, reason: "Out of Stock", priority: "Urgent", suggestedQty: item.avgMonthlyUsage * 2 });
      } else if (item.currentStock < item.avgMonthlyUsage / 2) {
        suggestions.push({ item: item.name, reason: "Low Stock", priority: "High", suggestedQty: item.avgMonthlyUsage * 2 });
      } else if (expiryDate <= thirtyDaysFromNow) {
        suggestions.push({ item: item.name, reason: "Near Expiry", priority: "Normal", suggestedQty: item.avgMonthlyUsage * 3 });
      }
    });

    setSuggestedRequisitions(suggestions);
    if (suggestions.length > 0 && !sessionStorage.getItem("suggestionsShown")) {
      setShowSuggestionModal(true);
      sessionStorage.setItem("suggestionsShown", "true");
    }
  }, [requisitions, adminFacility, loading]);
  const handleApprove = (req) => {
    // Prepare item for approval (single-item row assumption)
    const itemForApproval = {
      item_id: req.item_id,
      approved_quantity: req.qty, // default: full requested qty
      requested_qty: req.qty,
      item_name: req.item,
    };

    setSelectedRequisition(req);
    setApproveItems([itemForApproval]);
    setApproveRemarks("");
    setShowApproveModal(true);
  };

  const submitApprove = async () => {
    if (!selectedRequisition) return;

    const reqId = selectedRequisition.id.replace("REQ-", ""); // extract numeric ID

    const payload = {
      userId: JSON.parse(localStorage.getItem("user"))?.id || 4,
      remarks: approveRemarks.trim() || "Approved",
      items: approveItems.map(item => ({
        item_id: item.item_id,
        approved_quantity: parseInt(item.approved_quantity) || 0,
      })),
    };

    try {
      setLoading(true);
      const response = await axios.patch(`${BaseUrl}/requisitions/${reqId}/approve`, payload);
      if (response.data.success) {
        alert("✅ Requisition approved successfully!");
        window.location.reload(); // ya better: refetch data
      } else {
        alert("❌ Approval failed: " + (response.data.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Approve error:", err);
      alert("Error: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
      setShowApproveModal(false);
      setApproveItems([]);
      setApproveRemarks("");
    }
  };
  // Filter logic (same as before)
  const filteredRequisitions = requisitions.filter((req) => {
    if (req.facility !== adminFacility) return false;
    if (activeTab !== "all" && req.status.toLowerCase() !== activeTab) return false;
    if (userFilter && req.user !== userFilter) return false;
    if (itemFilter && req.item !== itemFilter) return false;
    if (departmentFilter && req.department !== departmentFilter) return false;
    if (priorityFilter && req.priority !== priorityFilter) return false;
    if (
      searchTerm &&
      !(
        req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.user.toLowerCase().includes(searchTerm.toLowerCase())
      )
    ) return false;
    return true;
  });

  // Pagination logic (same)
  const totalPages = Math.ceil(filteredRequisitions.length / entriesPerPage);
  const indexOfLastEntry = currentPage * entriesPerPage;
  const currentEntries = filteredRequisitions.slice(indexOfLastEntry - entriesPerPage, indexOfLastEntry);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const submitReject = async () => {
    if (!selectedRequisition || !rejectReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }

    const reqId = selectedRequisition.id.replace("REQ-", ""); // e.g., "REQ-60" → "60"
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      alert("User not logged in");
      return;
    }

    const payload = {
      userId: user.id,
      remarks: rejectReason.trim(),
    };

    try {
      setLoading(true);
      const response = await axios.put(`${BaseUrl}/requisitions/${reqId}/reject`, payload);
      if (response.data.success) {
        alert("✅ Requisition rejected successfully!");
        window.location.reload(); // ya better: refetch data
      } else {
        alert("❌ Rejection failed: " + (response.data.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Reject error:", err);
      alert("Error: " + (err.response?.data?.message || err.message || "Network error"));
    } finally {
      setLoading(false);
      setShowRejectModal(false);
      setSelectedRequisition(null);
      setRejectReason("");
    }
  };
  const handleDeliver = (req) => {
    setSelectedRequisition(req);
    setDeliverQty(Math.min(req.qty, req.facilityStock).toString());
    setDeliverRemarks("");
    setShowDeliverModal(true);
  };
  const submitDeliver = async () => {
    if (!selectedRequisition || !deliverQty) return;

    const reqId = selectedRequisition.id.replace("REQ-", "");
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      alert("User not logged in");
      return;
    }

    const payload = {
      user_id: user.id,
      facility_id: user.facility_id,
      remarks: deliverRemarks.trim() || "Delivered from facility stock",
      items: [
        {
          item_id: selectedRequisition.item_id,
          delivered_quantity: parseInt(deliverQty) || 0,
        },
      ],
    };

    try {
      setLoading(true);
      const response = await axios.patch(`${BaseUrl}/requisitions/${reqId}/deliver`, payload);
      if (response.data.success) {
        alert("✅ Item delivered successfully!");
        window.location.reload();
      } else {
        alert("❌ Delivery failed: " + (response.data.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Deliver error:", err);
      alert("Error: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
      setShowDeliverModal(false);
      setSelectedRequisition(null);
      setDeliverQty("");
      setDeliverRemarks("");
    }
  };

// Add this function below your other handlers (e.g., after handleReject)
const handleAddToBulkList = (req) => {
  // Check if already in bulk list
  const exists = bulkRequisitionList.some(item => 
    item.reqId === req.id && item.item === req.item
  );

  if (exists) {
    alert("✅ Already added to bulk list!");
    return;
  }

  // Add to bulk list
  const newItem = {
    reqId: req.id,
    name: req.item,
    qty: req.qty,
    priority: req.priority,
    reason: "Manual add from requisition",
    item_id: req.item_id,
  };

  setBulkRequisitionList(prev => [...prev, newItem]);
  alert("✅ Added to Bulk Requisition List!");
};

const updateBulkItemQty = (index, newQty) => {
  const updated = [...bulkRequisitionList];
  updated[index] = { ...updated[index], qty: parseInt(newQty) || 1 };
  setBulkRequisitionList(updated);
};

const removeFromBulkList = (index) => {
  const updated = bulkRequisitionList.filter((_, i) => i !== index);
  setBulkRequisitionList(updated);
};

const addSuggestedToBulk = (suggestion) => {
  const newItem = {
    name: suggestion.item,
    qty: suggestion.suggestedQty,
    priority: suggestion.priority,
    reason: suggestion.reason,
  };
  setBulkRequisitionList(prev => [...prev, newItem]);
};

  const handleReject = (req) => {
    setSelectedRequisition(req);
    setRejectReason("");
    setShowRejectModal(true);
  };
  useEffect(() => setCurrentPage(1), [activeTab, userFilter, itemFilter, departmentFilter, priorityFilter, searchTerm]);

  // getFacilityStatus, handleDeliver, handleRaiseToWarehouse, etc. — ALL REMAIN UNCHANGED
  // (Copy-paste your existing functions below this line)

  const getFacilityStatus = (req) => {
    if (req.expiryDate === "N/A") {
      if (req.facilityStock === 0) return { status: "Out of Stock", class: "bg-danger-subtle text-danger-emphasis" };
      if (req.qty > req.facilityStock) return { status: "Low Stock", class: "bg-warning-subtle text-warning-emphasis" };
      return { status: "In Stock", class: "bg-success-subtle text-success-emphasis" };
    }

    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    const expiryDate = new Date(req.expiryDate.split('-').reverse().join('-'));

    if (req.facilityStock === 0) {
      return { status: "Out of Stock", class: "bg-danger-subtle text-danger-emphasis" };
    } else if (expiryDate <= thirtyDaysFromNow) {
      return { status: "Near Expiry", class: "bg-info-subtle text-info-emphasis" };
    } else if (req.qty > req.facilityStock) {
      return { status: "Low Stock", class: "bg-warning-subtle text-warning-emphasis" };
    } else {
      return { status: "In Stock", class: "bg-success-subtle text-success-emphasis" };
    }
  };
  const handleRaiseToWarehouse = (req) => {
    setSelectedRequisition(req);
    setRaiseRequiredQty(req.qty.toString()); // default to requested qty
    setRaisePriority("Normal");
    setRaiseRemarks("");
    setShowRaiseModal(true);
  };

  
  const submitBulkRequisition = async () => {
    if (bulkRequisitionList.length === 0) return;
  
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !facilityId) {
      alert("User or facility not found");
      return;
    }
  
    try {
      setLoading(true);
  
      // Har item ke liye alag raise-to-warehouse call karein
      for (const item of bulkRequisitionList) {
        const payload = {
          facility_id: facilityId,
          required_qty: item.qty,
          priority: item.priority,
          remarks: item.reason || "From bulk list",
          user_name: user.name,
          item_name: item.name,
        };
  
        await axios.post(`${BaseUrl}/warehouse-requisitions/raise-to-warehouse`, payload);
      }
  
      alert("✅ All items raised to warehouse successfully!");
      setBulkRequisitionList([]);
      setShowBulkModal(false);
      window.location.reload();
    } catch (err) {
      console.error("Bulk raise error:", err);
      alert("❌ Failed: " + (err.response?.data?.message || "Network error"));
    } finally {
      setLoading(false);
    }
  };




  const submitRaiseToWarehouse = async () => {
    if (!selectedRequisition || !raiseRequiredQty || !facilityId) {
      alert("Please fill all required fields");
      return;
    }
  
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      alert("User not logged in");
      return;
    }
  
    // ✅ Add user_name and item_name from selectedRequisition
    const payload = {
      requisition_id: parseInt(selectedRequisition.id.replace("REQ-", ""), 10),
      facility_id: facilityId,
      required_qty: parseInt(raiseRequiredQty, 10),
      priority: raisePriority,
      remarks: raiseRemarks.trim() || "Raised to warehouse",
      user_name: selectedRequisition.user,      // ✅ "user28"
      item_name: selectedRequisition.item,     // ✅ "Ibuprofen 400"
    };
  
    try {
      setLoading(true);
      const response = await axios.post(`${BaseUrl}/warehouse-requisitions/raise-to-warehouse`, payload);
      if (response.data.success) {
        alert("✅ Requisition raised to warehouse successfully!");
        window.location.reload();
      } else {
        alert("❌ Failed to raise to warehouse: " + (response.data.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Raise to warehouse error:", err);
      alert("Error: " + (err.response?.data?.message || err.message || "Network error"));
    } finally {
      setLoading(false);
      setShowRaiseModal(false);
      setSelectedRequisition(null);
      setRaiseRequiredQty("");
      setRaisePriority("Normal");
      setRaiseRemarks("");
    }
  };
  // ✅ ALL ACTION HANDLERS (handleDeliver, handleRaiseToWarehouse, submitDeliver, etc.) — COPY FROM YOUR ORIGINAL CODE BELOW
  // (They are long, so not repeated here for brevity — but they remain 100% unchanged)

  // ... [PASTE YOUR EXISTING handleDeliver, handleRaiseToWarehouse, submitDeliver, submitRaiseToWarehouse, handleReject, submitReject, markAsCompleted, handleAddToBulkList, submitBulkRequisition, etc. HERE] ...

  // Close modals
  const closeDeliverModal = () => { setShowDeliverModal(false); setSelectedRequisition(null); setDeliverQty(""); setDeliverRemarks(""); };
  const closeRaiseModal = () => { setShowRaiseModal(false); setSelectedRequisition(null); setRaisePriority("Normal"); setRaiseRemarks(""); setRaiseRequiredQty(""); };
  const closeRejectModal = () => { setShowRejectModal(false); setSelectedRequisition(null); setRejectReason(""); };
  const closeViewModal = () => { setShowViewModal(false); setSelectedRequisition(null); };
  const closeBulkModal = () => { setShowBulkModal(false); };
  const closeSuggestionModal = () => { setShowSuggestionModal(false); };

  const resetFilters = () => {
    setUserFilter("");
    setItemFilter("");
    setDepartmentFilter("");
    setPriorityFilter("");
    setSearchTerm("");
  };

  // Loading / Error UI
  if (loading) {
    return (
      <div className="container-fluid py-4 px-3 px-md-4">
        <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid py-4 px-3 px-md-4">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  // ✅ RETURN JSX — SAME AS YOUR ORIGINAL (with minor dynamic text)
  return (
    <div className="container-fluid py-4 px-3 px-md-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h1 className="mb-0">Requisitions (From Users)</h1>
          <p className="text-muted mb-0">
            Manage and process all requisitions raised by users in your facility.
          </p>
        </div>
        <div>
          <button
            className="btn btn-primary d-flex align-items-center gap-2"
            onClick={() => setShowBulkModal(true)}
          >
            <i className="bi bi-cart-plus"></i>
            Bulk Requisition ({bulkRequisitionList.length})
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-2">
              <label className="form-label small text-muted">User</label>
              <select className="form-select" value={userFilter} onChange={(e) => setUserFilter(e.target.value)}>
                <option value="">All Users</option>
                {users.map(user => <option key={user} value={user}>{user}</option>)}
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label small text-muted">Item</label>
              <select className="form-select" value={itemFilter} onChange={(e) => setItemFilter(e.target.value)}>
                <option value="">All Items</option>
                {items.map(item => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label small text-muted">Department</label>
              <select className="form-select" value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}>
                <option value="">All Departments</option>
                {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label small text-muted">Status</label>
              <select className="form-select" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Delivered">Delivered</option>
                <option value="Completed">Completed</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label small text-muted">Search</label>
              <input
                type="text"
                className="form-control"
                placeholder="Req ID / Item / User"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-2 d-flex align-items-end">
              <button className="btn btn-outline-secondary w-100" onClick={resetFilters}>
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button className={`nav-link ${activeTab === "all" ? "active" : ""}`} onClick={() => setActiveTab("all")}>All</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === "pending" ? "active" : ""}`} onClick={() => setActiveTab("pending")}>Pending</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === "processing" ? "active" : ""}`} onClick={() => setActiveTab("processing")}>Processing</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === "delivered" ? "active" : ""}`} onClick={() => setActiveTab("delivered")}>Delivered</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === "completed" ? "active" : ""}`} onClick={() => setActiveTab("completed")}>Completed</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === "rejected" ? "active" : ""}`} onClick={() => setActiveTab("rejected")}>Rejected</button>
        </li>
      </ul>

      {/* Table, Pagination, Modals — SAME AS YOUR ORIGINAL */}
      {/* ... (Copy your existing JSX from <div className="card border-0 shadow-sm"> onwards) ... */}

      {/* Requisitions Table */}
      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr>
                <th>Req ID</th>
                <th>User Name</th>
                <th>Department</th>
                <th>Item Name</th>
                <th>Requested Qty</th>
                <th>Facility Stock</th>
                <th>Facility Status</th>
                <th>Expiry Date</th>
                <th>Status</th>
                <th>Raised On</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentEntries.length === 0 ? (
                <tr>
                  <td colSpan="11" className="text-center py-4 text-muted">
                    No requisitions found for {adminFacility} with the current filters.
                  </td>
                </tr>
              ) : (
                currentEntries.map((req) => {
                  const facilityStatus = getFacilityStatus(req);
                  return (
                    <tr key={req.id}>
                      <td className="fw-medium">
                        {req.id}
                      </td>
                      <td>{req.user}</td>
                      <td>{req.department}</td>
                      <td>{req.item}</td>
                      <td>{req.qty}</td>
                      <td>{req.facilityStock}</td>
                      <td>
                        <span className={`badge rounded-pill ${facilityStatus.class} px-3 py-1`}>
                          {facilityStatus.status}
                        </span>
                      </td>
                      <td>{req.expiryDate || "N/A"}</td>
                      <td>
                        <span className={`badge rounded-pill ${req.status === "Pending"
                            ? "bg-secondary-subtle text-secondary-emphasis"
                            : req.status === "Processing"
                              ? "bg-warning-subtle text-warning-emphasis"
                              : req.status === "Delivered"
                                ? "bg-info-subtle text-info-emphasis"
                                : req.status === "Completed"
                                  ? "bg-success-subtle text-success-emphasis"
                                  : "bg-danger-subtle text-danger-emphasis"
                          } px-3 py-1`}>
                          {req.status}
                        </span>
                      </td>
                      <td>{req.raisedOn}</td>
                      <td className="text-center">
  <div className="d-flex justify-content-center gap-2 flex-wrap">
    {/* Deliver: if stock sufficient AND status allows delivery */}
    {((req.status === "Pending" || req.status === "Approved" || req.status === "Processing") && req.facilityStock >= req.qty) && (
      <button
        className="btn btn-sm btn-success"
        onClick={() => handleDeliver(req)}
        title="Deliver from facility stock"
      >
        Deliver
      </button>
    )}

    {/* Raise to Warehouse & Add to Bulk: if stock low AND status is actionable */}
    {((req.status === "Pending" || req.status === "Approved" || req.status === "Processing") && req.facilityStock < req.qty) && (
      <>
        <button
          className="btn btn-sm btn-primary"
          onClick={() => handleRaiseToWarehouse(req)}
          title="Raise to warehouse"
        >
          Raise to Warehouse
        </button>
         <button
          className="btn btn-sm btn-info"
          onClick={() => handleAddToBulkList(req)}
          title="Add to bulk list"
        >
          Add to Bulk
        </button> 
      </>
    )}

    {/* Approve & Reject: only for Pending */}
    {req.status === "Pending" && (
      <>
        <button
          className="btn btn-sm btn-success"
          onClick={() => handleApprove(req)}
          title="Approve requisition"
        >
          Approve
        </button>
        <button
          className="btn btn-sm btn-danger"
          onClick={() => handleReject(req)}
          title="Reject"
        >
          Reject
        </button>
      </>
    )}

    {/* Complete: only for Delivered */}
    {req.status === "Delivered" && (
      <button
        className="btn btn-sm btn-success"
        onClick={() => markAsCompleted(req.id)}
        title="Mark as completed"
      >
        Complete
      </button>
    )}

    {/* View: always */}
    <button
      className="btn btn-sm btn-outline-secondary"
      onClick={() => handleViewDetail(req)}
      title="View details"
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
      </div>

      {/* Pagination */}
      <div className="d-flex justify-content-end mt-3">
        <nav>
          <ul className="pagination mb-3">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                Previous
              </button>
            </li>
            {[...Array(totalPages)].map((_, i) => {
              const page = i + 1;
              return (
                <li key={page} className={`page-item ${currentPage === page ? "active" : ""}`}>
                  <button className="page-link" onClick={() => handlePageChange(page)}>
                    {page}
                  </button>
                </li>
              );
            })}
            <li className={`page-item ${currentPage === totalPages || totalPages === 0 ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0}>
                Next
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* ALL MODALS — Copy exactly from your original code */}
      {/* Deliver Modal */}
      {showDeliverModal && selectedRequisition && (
        <div className="modal fade show" tabIndex="-1" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }} onClick={closeDeliverModal}>
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Deliver Item</h5>
                <button type="button" className="btn-close" onClick={closeDeliverModal}></button>
              </div>
              <div className="modal-body p-4">
                <div className="row mb-3">
                  <div className="col-5 fw-bold text-muted">Req ID:</div>
                  <div className="col-7">{selectedRequisition.id}</div>
                </div>
                <div className="row mb-3">
                  <div className="col-5 fw-bold text-muted">User Name:</div>
                  <div className="col-7">{selectedRequisition.user}</div>
                </div>
                <div className="row mb-3">
                  <div className="col-5 fw-bold text-muted">Item Name:</div>
                  <div className="col-7">{selectedRequisition.item}</div>
                </div>
                <div className="row mb-3">
                  <div className="col-5 fw-bold text-muted">Requested Qty:</div>
                  <div className="col-7">{selectedRequisition.qty}</div>
                </div>
                <div className="row mb-3">
                  <div className="col-5 fw-bold text-muted">Facility Available Stock:</div>
                  <div className="col-7">{selectedRequisition.facilityStock}</div>
                </div>
                <div className="row mb-3">
                  <div className="col-5 fw-bold text-muted">Expiry Date:</div>
                  <div className="col-7">{selectedRequisition.expiryDate || "N/A"}</div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Deliver Qty</label>
                  <input
                    type="number"
                    className="form-control"
                    value={deliverQty}
                    onChange={(e) => setDeliverQty(e.target.value)}
                    min="1"
                    max={selectedRequisition.facilityStock}
                    required
                  />
                  <div className="form-text">Available stock: {selectedRequisition.facilityStock}</div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Remarks</label>
                  <textarea
                    className="form-control"
                    value={deliverRemarks}
                    onChange={(e) => setDeliverRemarks(e.target.value)}
                    rows="2"
                    placeholder="Optional remarks"
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <div className="d-flex flex-column flex-sm-row gap-2 w-100">
                  <button type="button" className="btn btn-outline-secondary w-100" onClick={closeDeliverModal}>Cancel</button>
                  <button type="button" className="btn btn-success w-100" onClick={submitDeliver}>Deliver</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Raise to Warehouse Modal */}
      {showRaiseModal && selectedRequisition && (
        <div className="modal fade show" tabIndex="-1" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }} onClick={closeRaiseModal}>
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Raise to Warehouse</h5>
                <button type="button" className="btn-close" onClick={closeRaiseModal}></button>
              </div>
              <div className="modal-body p-4">
                <div className="row mb-3">
                  <div className="col-5 fw-bold text-muted">Req ID:</div>
                  <div className="col-7">{selectedRequisition.id}</div>
                </div>
                <div className="row mb-3">
                  <div className="col-5 fw-bold text-muted">User Name:</div>
                  <div className="col-7">{selectedRequisition.user}</div>
                </div>
                <div className="row mb-3">
                  <div className="col-5 fw-bold text-muted">Item Name:</div>
                  <div className="col-7">{selectedRequisition.item}</div>
                </div>
                <div className="row mb-3">
                  <div className="col-5 fw-bold text-muted">Requested Qty:</div>
                  <div className="col-7">{selectedRequisition.qty}</div>
                </div>
                <div className="row mb-3">
                  <div className="col-5 fw-bold text-muted">Facility Available Qty:</div>
                  <div className="col-7">{selectedRequisition.facilityStock}</div>
                </div>
                <div className="row mb-3">
                  <div className="col-5 fw-bold text-muted">Expiry Date:</div>
                  <div className="col-7">{selectedRequisition.expiryDate || "N/A"}</div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Required Qty</label>
                  <input
                    type="number"
                    className="form-control"
                    value={raiseRequiredQty}
                    onChange={(e) => setRaiseRequiredQty(e.target.value)}
                    min="1"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Priority</label>
                  <select
                    className="form-select"
                    value={raisePriority}
                    onChange={(e) => setRaisePriority(e.target.value)}
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Remarks</label>
                  <textarea
                    className="form-control"
                    value={raiseRemarks}
                    onChange={(e) => setRaiseRemarks(e.target.value)}
                    rows="2"
                    placeholder="Optional remarks"
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <div className="d-flex flex-column flex-sm-row gap-2 w-100">
                  <button type="button" className="btn btn-outline-secondary w-100" onClick={closeRaiseModal}>Cancel</button>
                  <button type="button" className="btn btn-primary w-100" onClick={submitRaiseToWarehouse}>Submit</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedRequisition && (
        <div className="modal fade show" tabIndex="-1" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }} onClick={closeRejectModal}>
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Reject Requisition</h5>
                <button type="button" className="btn-close" onClick={closeRejectModal}></button>
              </div>
              <div className="modal-body p-4">
                <div className="row mb-3">
                  <div className="col-5 fw-bold text-muted">Req ID:</div>
                  <div className="col-7">{selectedRequisition.id}</div>
                </div>
                <div className="row mb-3">
                  <div className="col-5 fw-bold text-muted">User Name:</div>
                  <div className="col-7">{selectedRequisition.user}</div>
                </div>
                <div className="row mb-3">
                  <div className="col-5 fw-bold text-muted">Item Name:</div>
                  <div className="col-7">{selectedRequisition.item}</div>
                </div>
                <div className="row mb-3">
                  <div className="col-5 fw-bold text-muted">Requested Qty:</div>
                  <div className="col-7">{selectedRequisition.qty}</div>
                </div>
                <div className="row mb-3">
                  <div className="col-5 fw-bold text-muted">Expiry Date:</div>
                  <div className="col-7">{selectedRequisition.expiryDate || "N/A"}</div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Reason for Rejection <span className="text-danger">*</span></label>
                  <textarea
                    className="form-control"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows="3"
                    placeholder="Please provide a reason for rejection"
                    required
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <div className="d-flex flex-column flex-sm-row gap-2 w-100">
                  <button type="button" className="btn btn-outline-secondary w-100" onClick={closeRejectModal}>Cancel</button>
                  <button type="button" className="btn btn-danger w-100" onClick={submitReject}>Reject</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      {showViewModal && selectedRequisition && (
        <div className="modal fade show" tabIndex="-1" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }} onClick={closeViewModal}>
          <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Requisition Detail</h5>
                <button type="button" className="btn-close" onClick={closeViewModal}></button>
              </div>
              <div className="modal-body p-4">
                <div className="row mb-4">
                  <div className="col-md-6">
                    <div className="row mb-3">
                      <div className="col-5 fw-bold text-muted">Req ID:</div>
                      <div className="col-7">{selectedRequisition.id}</div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-5 fw-bold text-muted">User Name:</div>
                      <div className="col-7">{selectedRequisition.user}</div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-5 fw-bold text-muted">Department:</div>
                      <div className="col-7">{selectedRequisition.department}</div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="row mb-3">
                      <div className="col-5 fw-bold text-muted">Item Name:</div>
                      <div className="col-7">{selectedRequisition.item}</div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-5 fw-bold text-muted">Requested Qty:</div>
                      <div className="col-7">{selectedRequisition.qty}</div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-5 fw-bold text-muted">Priority:</div>
                      <div className="col-7">
                        <span className={`badge rounded-pill ${selectedRequisition.priority === "Normal"
                            ? "bg-secondary-subtle text-secondary-emphasis"
                            : selectedRequisition.priority === "High"
                              ? "bg-warning-subtle text-warning-emphasis"
                              : "bg-danger-subtle text-danger-emphasis"
                          } px-3 py-1`}>
                          {selectedRequisition.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-5 fw-bold text-muted">Facility Stock at Request Time:</div>
                  <div className="col-7">{selectedRequisition.facilityStock}</div>
                </div>
                <div className="row mb-3">
                  <div className="col-5 fw-bold text-muted">Expiry Date:</div>
                  <div className="col-7">{selectedRequisition.expiryDate || "N/A"}</div>
                </div>
                <div className="row mb-3">
                  <div className="col-5 fw-bold text-muted">Facility Status:</div>
                  <div className="col-7">
                    {(() => {
                      const facilityStatus = getFacilityStatus(selectedRequisition);
                      return (
                        <span className={`badge rounded-pill ${facilityStatus.class} px-3 py-1`}>
                          {facilityStatus.status}
                        </span>
                      );
                    })()}
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-5 fw-bold text-muted">Current Status:</div>
                  <div className="col-7">
                    <span className={`badge rounded-pill ${selectedRequisition.status === "Pending"
                        ? "bg-secondary-subtle text-secondary-emphasis"
                        : selectedRequisition.status === "Processing"
                          ? "bg-warning-subtle text-warning-emphasis"
                          : selectedRequisition.status === "Delivered"
                            ? "bg-info-subtle text-info-emphasis"
                            : selectedRequisition.status === "Completed"
                              ? "bg-success-subtle text-success-emphasis"
                              : "bg-danger-subtle text-danger-emphasis"
                      } px-3 py-1`}>
                      {selectedRequisition.status}
                    </span>
                  </div>
                </div>
                <hr className="my-4" />
                <h6 className="fw-bold mb-3">Status Timeline</h6>
                <div className="mb-4">
                  {selectedRequisition.statusTimeline.map((event, index) => (
                    <div key={index} className="d-flex mb-2">
                      <div className="me-3 text-muted" style={{ minWidth: "120px" }}>{event.timestamp}</div>
                      <div>{event.status}</div>
                    </div>
                  ))}
                </div>
                <h6 className="fw-bold mb-3">Remarks Log</h6>
                <div>
                  {selectedRequisition.remarksLog.length === 0 ? (
                    <p className="text-muted">No remarks available</p>
                  ) : (
                    selectedRequisition.remarksLog.map((remark, index) => (
                      <div key={index} className="mb-3 p-3 bg-light rounded">
                        <div className="d-flex justify-content-between mb-1">
                          <span className="fw-medium">{remark.user}</span>
                          <span className="text-muted small">{remark.timestamp}</span>
                        </div>
                        <div>{remark.remark}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button type="button" className="btn btn-secondary w-100" onClick={closeViewModal}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Requisition Modal */}
      {showBulkModal && (
        <div className="modal fade show" tabIndex="-1" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }} onClick={closeBulkModal}>
          <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Bulk Requisition List</h5>
                <button type="button" className="btn-close" onClick={closeBulkModal}></button>
              </div>
              <div className="modal-body p-4">
                {bulkRequisitionList.length === 0 ? (
                  <div className="text-center py-4">
                    <i className="bi bi-cart-x fs-1 text-muted"></i>
                    <p className="mt-3 text-muted">No items in bulk requisition list</p>
                    <p className="text-muted">Add items from pending requisitions or suggestions</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Item Name</th>
                          <th>Quantity</th>
                          <th>Priority</th>
                          <th>Reason</th>
                          <th className="text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bulkRequisitionList.map((item, index) => (
                          <tr key={index}>
                            <td>{item.name}</td>
                            <td>
                              <input
                                type="number"
                                className="form-control form-control-sm"
                                value={item.qty}
                                onChange={(e) => updateBulkItemQty(index, e.target.value)}
                                min="1"
                              />
                            </td>
                            <td>
                              <select
                                className="form-select form-select-sm"
                                value={item.priority}
                                onChange={(e) => {
                                  const updatedList = [...bulkRequisitionList];
                                  updatedList[index] = { ...updatedList[index], priority: e.target.value };
                                  setBulkRequisitionList(updatedList);
                                }}
                              >
                                <option value="Normal">Normal</option>
                                <option value="High">High</option>
                                <option value="Urgent">Urgent</option>
                              </select>
                            </td>
                            <td>{item.reason}</td>
                            <td className="text-center">
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => removeFromBulkList(index)}
                                title="Remove from list"
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div className="modal-footer border-0 pt-0">
                <div className="d-flex flex-column flex-sm-row gap-2 w-100">
                  <button type="button" className="btn btn-outline-secondary w-100" onClick={closeBulkModal}>
                    {bulkRequisitionList.length === 0 ? "Close" : "Cancel"}
                  </button>
                   {bulkRequisitionList.length > 0 && (
                   <button type="button" className="btn btn-primary w-100" onClick={submitBulkRequisition}>
                      Submit Bulk Requisition
                     </button>
                   )} 
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Suggestion Modal */}
      {showSuggestionModal && suggestedRequisitions.length > 0 && (
        <div className="modal fade show" tabIndex="-1" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }} onClick={closeSuggestionModal}>
          <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Requisition Suggestions</h5>
                <button type="button" className="btn-close" onClick={closeSuggestionModal}></button>
              </div>
              <div className="modal-body p-4">
                <p className="text-muted mb-4">The following items need your attention based on stock levels and expiry dates:</p>
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Item Name</th>
                        <th>Reason</th>
                        <th>Priority</th>
                        <th>Suggested Qty</th>
                        <th className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {suggestedRequisitions.map((item, index) => (
                        <tr key={index}>
                          <td>{item.item}</td>
                          <td>{item.reason}</td>
                          <td>
                            <span className={`badge rounded-pill ${item.priority === "Normal"
                                ? "bg-secondary-subtle text-secondary-emphasis"
                                : item.priority === "High"
                                  ? "bg-warning-subtle text-warning-emphasis"
                                  : "bg-danger-subtle text-danger-emphasis"
                              } px-3 py-1`}>
                              {item.priority}
                            </span>
                          </td>
                          <td>{item.suggestedQty}</td>
                          {/* <td className="text-center">
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => addSuggestedToBulk(item)}
                              title="Add to Bulk Requisition"
                            >
                              Add to Bulk
                            </button>
                          </td> */}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <div className="d-flex flex-column flex-sm-row gap-2 w-100">
                  <button type="button" className="btn btn-outline-secondary w-100" onClick={closeSuggestionModal}>Close</button>
                  {/* <button
                    type="button"
                    className="btn btn-primary w-100"
                    onClick={() => {
                      suggestedRequisitions.forEach((item) => addSuggestedToBulk(item));
                      closeSuggestionModal();
                      setShowBulkModal(true);
                    }}
                  >
                    Add All to Bulk
                  </button> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Approve Modal */}
      {showApproveModal && selectedRequisition && (
        <div className="modal fade show" tabIndex="-1" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }} onClick={() => { setShowApproveModal(false); setApproveItems([]); setApproveRemarks(""); }}>
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Approve Requisition</h5>
                <button type="button" className="btn-close" onClick={() => { setShowApproveModal(false); setApproveItems([]); setApproveRemarks(""); }}></button>
              </div>
              <div className="modal-body p-4">
                <div className="row mb-3">
                  <div className="col-5 fw-bold text-muted">Req ID:</div>
                  <div className="col-7">{selectedRequisition.id}</div>
                </div>
                <div className="row mb-3">
                  <div className="col-5 fw-bold text-muted">Item:</div>
                  <div className="col-7">{selectedRequisition.item}</div>
                </div>
                <div className="row mb-3">
                  <div className="col-5 fw-bold text-muted">Requested Qty:</div>
                  <div className="col-7">{selectedRequisition.qty}</div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Approve Quantity</label>
                  <input
                    type="number"
                    className="form-control"
                    value={approveItems[0]?.approved_quantity || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setApproveItems([{ ...approveItems[0], approved_quantity: val }]);
                    }}
                    min="0"
                    max={selectedRequisition.qty}
                    required
                  />
                  <div className="form-text">Max: {selectedRequisition.qty}</div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Remarks</label>
                  <textarea
                    className="form-control"
                    value={approveRemarks}
                    onChange={(e) => setApproveRemarks(e.target.value)}
                    rows="2"
                    placeholder="e.g., Approved after stock verification"
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <div className="d-flex flex-column flex-sm-row gap-2 w-100">
                  <button
                    type="button"
                    className="btn btn-outline-secondary w-100"
                    onClick={() => { setShowApproveModal(false); setApproveItems([]); setApproveRemarks(""); }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-success w-100"
                    onClick={submitApprove}
                  >
                    Approve
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FacilityRequisitions;