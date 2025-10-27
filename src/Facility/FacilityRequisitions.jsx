// src/App.jsx
import { useState, useEffect } from "react"; // ✅ Added useEffect

function FacilityRequisitions() {
  // Admin's facility (hardcoded for this example)
  const adminFacility = "Kumasi Branch Hospital";
  // Updated initial requisitions data with flat structure
  const initialRequisitions = [
    {
      id: "REQ-2025-101",
      facility: "Kumasi Branch Hospital",
      user: "Dr. Amoah",
      department: "OPD",
      item: "Paracetamol 500mg",
      qty: 10,
      facilityStock: 15,
      priority: "Normal",
      status: "Pending",
      raisedOn: "27-Sep-2025",
      statusTimeline: [
        { status: "Raised by User", timestamp: "27-Sep-2025 10:00" },
        { status: "Seen by Facility Admin", timestamp: "27-Sep-2025 10:30" },
      ],
      remarksLog: [],
      expiryDate: "30-Dec-2025", // Added expiry date
    },
    {
      id: "REQ-2025-102",
      facility: "Kumasi Branch Hospital",
      user: "Nurse Akua",
      department: "Emergency",
      item: "Surgical Gloves (L)",
      qty: 20,
      facilityStock: 15,
      priority: "High",
      status: "Pending",
      raisedOn: "26-Sep-2025",
      statusTimeline: [
        { status: "Raised by User", timestamp: "26-Sep-2025 09:15" },
        { status: "Seen by Facility Admin", timestamp: "26-Sep-2025 09:45" },
      ],
      remarksLog: [],
      expiryDate: "15-Nov-2025", // Added expiry date
    },
    {
      id: "REQ-2025-103",
      facility: "Kumasi Branch Hospital",
      user: "Dr. Boateng",
      department: "Pediatrics",
      item: "Children's Paracetamol",
      qty: 15,
      facilityStock: 0,
      priority: "Urgent",
      status: "Processing",
      raisedOn: "25-Sep-2025",
      statusTimeline: [
        { status: "Raised by User", timestamp: "25-Sep-2025 11:20" },
        { status: "Seen by Facility Admin", timestamp: "25-Sep-2025 11:50" },
        { status: "Raised to Warehouse", timestamp: "25-Sep-2025 12:30" },
      ],
      remarksLog: [
        {
          user: "Facility Admin",
          remark: "Urgent request, no stock available",
          timestamp: "25-Sep-2025 12:30",
        },
      ],
      expiryDate: "20-Oct-2025", // Added expiry date
    },
    {
      id: "REQ-2025-104",
      facility: "Kumasi Branch Hospital",
      user: "Pharmacist Adwoa",
      department: "Pharmacy",
      item: "Cough Syrup",
      qty: 12,
      facilityStock: 8,
      priority: "Normal",
      status: "Processing",
      raisedOn: "24-Sep-2025",
      statusTimeline: [
        { status: "Raised by User", timestamp: "24-Sep-2025 14:10" },
        { status: "Seen by Facility Admin", timestamp: "24-Sep-2025 14:40" },
        { status: "Raised to Warehouse", timestamp: "24-Sep-2025 15:20" },
      ],
      remarksLog: [
        {
          user: "Facility Admin",
          remark: "Insufficient stock",
          timestamp: "24-Sep-2025 15:20",
        },
      ],
      expiryDate: "05-Oct-2025", // Near expiry item
    },
    {
      id: "REQ-2025-105",
      facility: "Kumasi Branch Hospital",
      user: "Dr. Osei",
      department: "Surgery",
      item: "Surgical Masks",
      qty: 50,
      facilityStock: 100,
      priority: "Normal",
      status: "Delivered",
      raisedOn: "23-Sep-2025",
      statusTimeline: [
        { status: "Raised by User", timestamp: "23-Sep-2025 09:30" },
        { status: "Seen by Facility Admin", timestamp: "23-Sep-2025 10:00" },
        { status: "Delivered", timestamp: "23-Sep-2025 10:45" },
      ],
      remarksLog: [
        {
          user: "Facility Admin",
          remark: "Delivered from available stock",
          timestamp: "23-Sep-2025 10:45",
        },
      ],
      expiryDate: "30-Dec-2025", // Added expiry date
    },
    {
      id: "REQ-2025-106",
      facility: "Kumasi Branch Hospital",
      user: "Lab Tech. Ama",
      department: "Laboratory",
      item: "Ibuprofen 400mg",
      qty: 7,
      facilityStock: 50,
      priority: "Normal",
      status: "Completed",
      raisedOn: "22-Sep-2025",
      statusTimeline: [
        { status: "Raised by User", timestamp: "22-Sep-2025 13:15" },
        { status: "Seen by Facility Admin", timestamp: "22-Sep-2025 13:45" },
        { status: "Delivered", timestamp: "22-Sep-2025 14:30" },
        { status: "Completed", timestamp: "22-Sep-2025 15:20" },
      ],
      remarksLog: [
        {
          user: "Facility Admin",
          remark: "Delivered from available stock",
          timestamp: "22-Sep-2025 14:30",
        },
      ],
      expiryDate: "15-Nov-2025", // Added expiry date
    },
    {
      id: "REQ-2025-107",
      facility: "Kumasi Branch Hospital",
      user: "Dr. Kofi",
      department: "OPD",
      item: "Antibiotic Ointment",
      qty: 5,
      facilityStock: 0,
      priority: "High",
      status: "Rejected",
      raisedOn: "21-Sep-2025",
      statusTimeline: [
        { status: "Raised by User", timestamp: "21-Sep-2025 11:05" },
        { status: "Seen by Facility Admin", timestamp: "21-Sep-2025 11:35" },
        { status: "Rejected", timestamp: "21-Sep-2025 12:15" },
      ],
      remarksLog: [
        {
          user: "Facility Admin",
          remark: "Duplicate request",
          timestamp: "21-Sep-2025 12:15",
        },
      ],
      expiryDate: "10-Oct-2025", // Near expiry item
    },
    // Add more mock data to test pagination (optional)
    ...Array.from({ length: 5 }, (_, i) => ({
      id: `REQ-2025-${108 + i}`,
      facility: "Kumasi Branch Hospital",
      user: `User ${i + 1}`,
      department: "Dept",
      item: `Item ${i + 1}`,
      qty: 5,
      facilityStock: i % 2 === 0 ? 10 : 0,
      priority: "Normal",
      status: "Pending",
      raisedOn: "20-Sep-2025",
      statusTimeline: [
        { status: "Raised by User", timestamp: "20-Sep-2025 10:00" },
      ],
      remarksLog: [],
      expiryDate: "15-Dec-2025", // Added expiry date
    })),
  ];

  // Extract unique values for dropdown filters
  const users = [...new Set(initialRequisitions.map((req) => req.user))];
  const items = [...new Set(initialRequisitions.map((req) => req.item))];
  const departments = [
    ...new Set(initialRequisitions.map((req) => req.department)),
  ];

  // State management
  const [activeTab, setActiveTab] = useState("all");
  const [requisitions, setRequisitions] = useState(initialRequisitions);
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
  const [userFilter, setUserFilter] = useState("");
  const [itemFilter, setItemFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 10;

  // Check for items that need requisition suggestions (low stock, out of stock, near expiry)
  useEffect(() => {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    const suggestions = [];

    // Check all items in the facility
    const facilityItems = {};

    requisitions.forEach((req) => {
      if (req.facility === adminFacility) {
        if (!facilityItems[req.item]) {
          facilityItems[req.item] = {
            name: req.item,
            currentStock: req.facilityStock,
            expiryDate: req.expiryDate,
            avgMonthlyUsage: 10, // Default value, would be calculated from historical data
          };
        }
      }
    });

    // Check for low stock, out of stock, and near expiry
    Object.values(facilityItems).forEach((item) => {
      const expiryDate = new Date(item.expiryDate);

      // Out of stock
      if (item.currentStock === 0) {
        suggestions.push({
          item: item.name,
          reason: "Out of Stock",
          priority: "Urgent",
          suggestedQty: item.avgMonthlyUsage * 2,
        });
      }
      // Low stock (less than 15 days of supply)
      else if (item.currentStock < item.avgMonthlyUsage / 2) {
        suggestions.push({
          item: item.name,
          reason: "Low Stock",
          priority: "High",
          suggestedQty: item.avgMonthlyUsage * 2,
        });
      }
      // Near expiry (within 30 days)
      else if (expiryDate <= thirtyDaysFromNow) {
        suggestions.push({
          item: item.name,
          reason: "Near Expiry",
          priority: "Normal",
          suggestedQty: item.avgMonthlyUsage * 3,
        });
      }
    });

    setSuggestedRequisitions(suggestions);

    // Show suggestion modal if there are new suggestions
    if (suggestions.length > 0 && !sessionStorage.getItem("suggestionsShown")) {
      setShowSuggestionModal(true);
      sessionStorage.setItem("suggestionsShown", "true");
    }
  }, [requisitions, adminFacility]);

  // Filter requisitions based on admin's facility, active tab, and other filters
  const filteredRequisitions = requisitions.filter((req) => {
    // Only show requisitions from admin's facility
    if (req.facility !== adminFacility) return false;
    // Tab filter
    if (activeTab !== "all" && req.status.toLowerCase() !== activeTab)
      return false;
    // Dropdown filters
    if (userFilter && req.user !== userFilter) return false;
    if (itemFilter && req.item !== itemFilter) return false;
    if (departmentFilter && req.department !== departmentFilter) return false;
    if (priorityFilter && req.priority !== priorityFilter) return false;
    // Search filter
    if (
      searchTerm &&
      !(
        req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.user.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
      return false;
    return true;
  });

  // ✅ Pagination logic
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

  // ✅ Reset to page 1 when filters or tab change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    activeTab,
    userFilter,
    itemFilter,
    departmentFilter,
    priorityFilter,
    searchTerm,
  ]);

  // Get facility status for each requisition
  const getFacilityStatus = (req) => {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    const expiryDate = new Date(req.expiryDate);

    // Out of Stock condition
    if (req.facilityStock === 0) {
      return {
        status: "Out of Stock",
        class: "bg-danger-subtle text-danger-emphasis",
      };
    }
    // Near Expiry condition (within 30 days)
    else if (expiryDate <= thirtyDaysFromNow) {
      return {
        status: "Near Expiry",
        class: "bg-info-subtle text-info-emphasis",
      };
    }
    // Low Stock condition (requested quantity is more than available stock)
    else if (req.qty > req.facilityStock) {
      return {
        status: "Low Stock",
        class: "bg-warning-subtle text-warning-emphasis",
      };
    }
    // In Stock condition (sufficient stock and not near expiry)
    else {
      return {
        status: "In Stock",
        class: "bg-success-subtle text-success-emphasis",
      };
    }
  };

  // Handle deliver action
  const handleDeliver = (req) => {
    setSelectedRequisition(req);
    setDeliverQty(req.qty.toString());
    setDeliverRemarks("");
    setShowDeliverModal(true);
  };

  // Handle raise to warehouse action
  const handleRaiseToWarehouse = (req) => {
    setSelectedRequisition(req);
    setRaisePriority(req.priority);
    setRaiseRemarks("");
    setRaiseRequiredQty(req.qty.toString());
    setShowRaiseModal(true);
  };

  // Handle add to bulk requisition list
  const handleAddToBulkList = (req) => {
    // Check if item already exists in bulk list
    const existingItemIndex = bulkRequisitionList.findIndex(
      (item) => item.name === req.item
    );

    if (existingItemIndex >= 0) {
      // Update existing item quantity
      const updatedList = [...bulkRequisitionList];
      updatedList[existingItemIndex] = {
        ...updatedList[existingItemIndex],
        qty: updatedList[existingItemIndex].qty + req.qty,
      };
      setBulkRequisitionList(updatedList);
    } else {
      // Add new item to bulk list
      setBulkRequisitionList([
        ...bulkRequisitionList,
        {
          id: req.id,
          name: req.item,
          qty: req.qty,
          priority: req.priority,
          reason: "User request",
        },
      ]);
    }

    // Show confirmation
    alert(`${req.item} added to bulk requisition list`);
  };

  // Handle reject action
  const handleReject = (req) => {
    setSelectedRequisition(req);
    setRejectReason("");
    setShowRejectModal(true);
  };

  // Handle view detail action
  const handleViewDetail = (req) => {
    setSelectedRequisition(req);
    setShowViewModal(true);
  };

  // Submit deliver action
  const submitDeliver = () => {
    if (
      !deliverQty ||
      parseInt(deliverQty) <= 0 ||
      parseInt(deliverQty) > selectedRequisition.facilityStock
    ) {
      alert("Please enter a valid deliver quantity");
      return;
    }
    const updatedRequisitions = requisitions.map((req) => {
      if (req.id === selectedRequisition.id) {
        const newStatusTimeline = [
          ...req.statusTimeline,
          {
            status: "Delivered",
            timestamp: new Date().toLocaleString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ];
        const newRemarksLog = [
          ...req.remarksLog,
          {
            user: "Facility Admin",
            remark: deliverRemarks || "Delivered from available stock",
            timestamp: new Date().toLocaleString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ];
        return {
          ...req,
          status: "Delivered",
          statusTimeline: newStatusTimeline,
          remarksLog: newRemarksLog,
        };
      }
      return req;
    });
    setRequisitions(updatedRequisitions);
    setShowDeliverModal(false);
    setSelectedRequisition(null);
    setDeliverQty("");
    setDeliverRemarks("");
  };

  // Submit raise to warehouse action
  const submitRaiseToWarehouse = () => {
    if (!raiseRequiredQty || parseInt(raiseRequiredQty) <= 0) {
      alert("Please enter a valid required quantity");
      return;
    }
    const updatedRequisitions = requisitions.map((req) => {
      if (req.id === selectedRequisition.id) {
        const newStatusTimeline = [
          ...req.statusTimeline,
          {
            status: "Raised to Warehouse",
            timestamp: new Date().toLocaleString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ];
        const newRemarksLog = [
          ...req.remarksLog,
          {
            user: "Facility Admin",
            remark:
              raiseRemarks ||
              `Raised to warehouse with ${raisePriority} priority`,
            timestamp: new Date().toLocaleString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ];
        return {
          ...req,
          status: "Processing",
          priority: raisePriority,
          statusTimeline: newStatusTimeline,
          remarksLog: newRemarksLog,
        };
      }
      return req;
    });
    setRequisitions(updatedRequisitions);
    setShowRaiseModal(false);
    setSelectedRequisition(null);
    setRaisePriority("Normal");
    setRaiseRemarks("");
    setRaiseRequiredQty("");
  };

  // Submit reject action
  const submitReject = () => {
    if (!rejectReason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }
    const updatedRequisitions = requisitions.map((req) => {
      if (req.id === selectedRequisition.id) {
        const newStatusTimeline = [
          ...req.statusTimeline,
          {
            status: "Rejected",
            timestamp: new Date().toLocaleString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ];
        const newRemarksLog = [
          ...req.remarksLog,
          {
            user: "Facility Admin",
            remark: rejectReason,
            timestamp: new Date().toLocaleString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ];
        return {
          ...req,
          status: "Rejected",
          statusTimeline: newStatusTimeline,
          remarksLog: newRemarksLog,
        };
      }
      return req;
    });
    setRequisitions(updatedRequisitions);
    setShowRejectModal(false);
    setSelectedRequisition(null);
    setRejectReason("");
  };

  // Mark requisition as completed
  const markAsCompleted = (reqId) => {
    const updatedRequisitions = requisitions.map((req) => {
      if (req.id === reqId) {
        const newStatusTimeline = [
          ...req.statusTimeline,
          {
            status: "Completed",
            timestamp: new Date().toLocaleString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ];
        return {
          ...req,
          status: "Completed",
          statusTimeline: newStatusTimeline,
        };
      }
      return req;
    });
    setRequisitions(updatedRequisitions);
  };

  // Submit bulk requisition
  const submitBulkRequisition = () => {
    if (bulkRequisitionList.length === 0) {
      alert("Bulk requisition list is empty");
      return;
    }

    // Create a new requisition for the bulk order
    const newBulkRequisition = {
      id: `BULK-${new Date().getFullYear()}-${Math.floor(
        1000 + Math.random() * 9000
      )}`,
      facility: adminFacility,
      user: "Facility Admin",
      department: "Administration",
      item: "Bulk Order",
      qty: bulkRequisitionList.reduce((sum, item) => sum + item.qty, 0),
      facilityStock: 0,
      priority: "Normal",
      status: "Processing",
      raisedOn: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      statusTimeline: [
        {
          status: "Raised by Facility Admin",
          timestamp: new Date().toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
        {
          status: "Raised to Warehouse",
          timestamp: new Date().toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ],
      remarksLog: [
        {
          user: "Facility Admin",
          remark: `Bulk requisition with ${bulkRequisitionList.length} items`,
          timestamp: new Date().toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ],
      isBulk: true,
      bulkItems: [...bulkRequisitionList],
    };

    setRequisitions([...requisitions, newBulkRequisition]);
    setBulkRequisitionList([]);
    setShowBulkModal(false);

    alert("Bulk requisition submitted successfully");
  };

  // Remove item from bulk list
  const removeFromBulkList = (index) => {
    const updatedList = [...bulkRequisitionList];
    updatedList.splice(index, 1);
    setBulkRequisitionList(updatedList);
  };

  // Update item quantity in bulk list
  const updateBulkItemQty = (index, newQty) => {
    if (newQty <= 0) return;

    const updatedList = [...bulkRequisitionList];
    updatedList[index] = {
      ...updatedList[index],
      qty: parseInt(newQty),
    };
    setBulkRequisitionList(updatedList);
  };

  // Add suggested item to bulk list
  const addSuggestedToBulk = (item) => {
    // Check if item already exists in bulk list
    const existingItemIndex = bulkRequisitionList.findIndex(
      (bulkItem) => bulkItem.name === item.item
    );

    if (existingItemIndex >= 0) {
      // Update existing item quantity
      const updatedList = [...bulkRequisitionList];
      updatedList[existingItemIndex] = {
        ...updatedList[existingItemIndex],
        qty: updatedList[existingItemIndex].qty + item.suggestedQty,
      };
      setBulkRequisitionList(updatedList);
    } else {
      // Add new item to bulk list
      setBulkRequisitionList([
        ...bulkRequisitionList,
        {
          id: `SUGG-${Date.now()}`,
          name: item.item,
          qty: item.suggestedQty,
          priority: item.priority,
          reason: item.reason,
        },
      ]);
    }

    // Remove from suggestions
    const updatedSuggestions = suggestedRequisitions.filter(
      (s) => s.item !== item.item
    );
    setSuggestedRequisitions(updatedSuggestions);
  };

  // Close modals
  const closeDeliverModal = () => {
    setShowDeliverModal(false);
    setSelectedRequisition(null);
    setDeliverQty("");
    setDeliverRemarks("");
  };

  const closeRaiseModal = () => {
    setShowRaiseModal(false);
    setSelectedRequisition(null);
    setRaisePriority("Normal");
    setRaiseRemarks("");
    setRaiseRequiredQty("");
  };

  const closeRejectModal = () => {
    setShowRejectModal(false);
    setSelectedRequisition(null);
    setRejectReason("");
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedRequisition(null);
  };

  const closeBulkModal = () => {
    setShowBulkModal(false);
  };

  const closeSuggestionModal = () => {
    setShowSuggestionModal(false);
  };

  // Reset all filters
  const resetFilters = () => {
    setUserFilter("");
    setItemFilter("");
    setDepartmentFilter("");
    setPriorityFilter("");
    setSearchTerm("");
  };

  return (
    <div className="container-fluid py-4 px-3 px-md-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h1 className="mb-0">Requisitions (From Users)</h1>
          <p className="text-muted mb-0">
            Manage and process all requisitions raised by users in your
            facility.
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
              <select
                className="form-select"
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
              >
                <option value="">All Users</option>
                {users.map((user) => (
                  <option key={user} value={user}>
                    {user}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label small text-muted">Item</label>
              <select
                className="form-select"
                value={itemFilter}
                onChange={(e) => setItemFilter(e.target.value)}
              >
                <option value="">All Items</option>
                {items.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label small text-muted">Department</label>
              <select
                className="form-select"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label small text-muted">Status</label>
              <select
                className="form-select"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
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
              <button
                className="btn btn-outline-secondary w-100"
                onClick={resetFilters}
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            All
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "pending" ? "active" : ""}`}
            onClick={() => setActiveTab("pending")}
          >
            Pending
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "processing" ? "active" : ""}`}
            onClick={() => setActiveTab("processing")}
          >
            Processing
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "delivered" ? "active" : ""}`}
            onClick={() => setActiveTab("delivered")}
          >
            Delivered
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "completed" ? "active" : ""}`}
            onClick={() => setActiveTab("completed")}
          >
            Completed
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "rejected" ? "active" : ""}`}
            onClick={() => setActiveTab("rejected")}
          >
            Rejected
          </button>
        </li>
      </ul>

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
                    No requisitions found for {adminFacility} with the current
                    filters.
                  </td>
                </tr>
              ) : (
                currentEntries.map((req) => {
                  const facilityStatus = getFacilityStatus(req);
                  return (
                    <tr key={req.id}>
                      <td className="fw-medium">
                        {req.id}
                        {req.isBulk && (
                          <span className="badge bg-primary ms-2">BULK</span>
                        )}
                      </td>
                      <td>{req.user}</td>
                      <td>{req.department}</td>
                      <td>{req.item}</td>
                      <td>{req.qty}</td>
                      <td>{req.facilityStock}</td>
                      <td>
                        <span
                          className={`badge rounded-pill ${facilityStatus.class} px-3 py-1`}
                        >
                          {facilityStatus.status}
                        </span>
                      </td>
                      <td>{req.expiryDate || "N/A"}</td>
                      <td>
                        <span
                          className={`badge rounded-pill ${
                            req.status === "Pending"
                              ? "bg-secondary-subtle text-secondary-emphasis"
                              : req.status === "Processing"
                              ? "bg-warning-subtle text-warning-emphasis"
                              : req.status === "Delivered"
                              ? "bg-info-subtle text-info-emphasis"
                              : req.status === "Completed"
                              ? "bg-success-subtle text-success-emphasis"
                              : "bg-danger-subtle text-danger-emphasis"
                          } px-3 py-1`}
                        >
                          {req.status}
                        </span>
                      </td>
                      <td>{req.raisedOn}</td>
                      <td className="text-center">
                        <div className="d-flex justify-content-center gap-2 flex-wrap">
                          {/* Deliver: jab sufficient stock ho */}
                          {req.status === "Pending" &&
                            req.facilityStock >= req.qty && (
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() => handleDeliver(req)}
                                title="Deliver from facility stock"
                              >
                                Deliver
                              </button>
                            )}

                          {/* Raise to Warehouse & Add to Bulk: jab stock kam ho ya khatam ho */}
                          {req.status === "Pending" &&
                            req.facilityStock < req.qty && (
                              <>
                                <button
                                  className="btn btn-sm btn-primary"
                                  onClick={() => handleRaiseToWarehouse(req)}
                                  title="Raise individual requisition to warehouse"
                                >
                                  Raise to Warehouse
                                </button>
                                <button
                                  className="btn btn-sm btn-info"
                                  onClick={() => handleAddToBulkList(req)}
                                  title="Add this item to bulk requisition list"
                                >
                                  Add to Bulk
                                </button>
                              </>
                            )}

                          {/* Reject: hamesha pending ke liye available */}
                          {req.status === "Pending" && (
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleReject(req)}
                              title="Reject requisition"
                            >
                              Reject
                            </button>
                          )}

                          {/* Complete: delivered ke baad */}
                          {req.status === "Delivered" && (
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => markAsCompleted(req.id)}
                              title="Mark as completed"
                            >
                              Complete
                            </button>
                          )}

                          {/* View Details: hamesha */}
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => handleViewDetail(req)}
                            title="View full details"
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

      {/* ✅ PAGINATION UI — Same as your earlier components */}
      <div className="d-flex justify-content-end mt-3">
        <nav>
          <ul className="pagination mb-3">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
            </li>

            {[...Array(totalPages)].map((_, i) => {
              const page = i + 1;
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

            <li
              className={`page-item ${
                currentPage === totalPages || totalPages === 0 ? "disabled" : ""
              }`}
            >
              <button
                className="page-link"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                Next
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Modals */}
      {/* Deliver Modal */}
      {showDeliverModal && selectedRequisition && (
        <div
          className="modal fade show"
          tabIndex="-1"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={closeDeliverModal}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Deliver Item</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeDeliverModal}
                ></button>
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
                  <div className="col-5 fw-bold text-muted">
                    Facility Available Stock:
                  </div>
                  <div className="col-7">
                    {selectedRequisition.facilityStock}
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-5 fw-bold text-muted">Expiry Date:</div>
                  <div className="col-7">
                    {selectedRequisition.expiryDate || "N/A"}
                  </div>
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
                  <div className="form-text">
                    Available stock: {selectedRequisition.facilityStock}
                  </div>
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
                  <button
                    type="button"
                    className="btn btn-outline-secondary w-100"
                    onClick={closeDeliverModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-success w-100"
                    onClick={submitDeliver}
                  >
                    Deliver
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Raise to Warehouse Modal */}
      {showRaiseModal && selectedRequisition && (
        <div
          className="modal fade show"
          tabIndex="-1"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={closeRaiseModal}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Raise to Warehouse</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeRaiseModal}
                ></button>
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
                  <div className="col-5 fw-bold text-muted">
                    Facility Available Qty:
                  </div>
                  <div className="col-7">
                    {selectedRequisition.facilityStock}
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-5 fw-bold text-muted">Expiry Date:</div>
                  <div className="col-7">
                    {selectedRequisition.expiryDate || "N/A"}
                  </div>
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
                  <button
                    type="button"
                    className="btn btn-outline-secondary w-100"
                    onClick={closeRaiseModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary w-100"
                    onClick={submitRaiseToWarehouse}
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedRequisition && (
        <div
          className="modal fade show"
          tabIndex="-1"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={closeRejectModal}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Reject Requisition</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeRejectModal}
                ></button>
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
                  <div className="col-7">
                    {selectedRequisition.expiryDate || "N/A"}
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    Reason for Rejection <span className="text-danger">*</span>
                  </label>
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
                  <button
                    type="button"
                    className="btn btn-outline-secondary w-100"
                    onClick={closeRejectModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger w-100"
                    onClick={submitReject}
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      {showViewModal && selectedRequisition && (
        <div
          className="modal fade show"
          tabIndex="-1"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={closeViewModal}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Requisition Detail</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeViewModal}
                ></button>
              </div>
              <div className="modal-body p-4">
                <div className="row mb-4">
                  <div className="col-md-6">
                    <div className="row mb-3">
                      <div className="col-5 fw-bold text-muted">Req ID:</div>
                      <div className="col-7">
                        {selectedRequisition.id}
                        {selectedRequisition.isBulk && (
                          <span className="badge bg-primary ms-2">BULK</span>
                        )}
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-5 fw-bold text-muted">User Name:</div>
                      <div className="col-7">{selectedRequisition.user}</div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-5 fw-bold text-muted">
                        Department:
                      </div>
                      <div className="col-7">
                        {selectedRequisition.department}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="row mb-3">
                      <div className="col-5 fw-bold text-muted">Item Name:</div>
                      <div className="col-7">{selectedRequisition.item}</div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-5 fw-bold text-muted">
                        Requested Qty:
                      </div>
                      <div className="col-7">{selectedRequisition.qty}</div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-5 fw-bold text-muted">Priority:</div>
                      <div className="col-7">
                        <span
                          className={`badge rounded-pill ${
                            selectedRequisition.priority === "Normal"
                              ? "bg-secondary-subtle text-secondary-emphasis"
                              : selectedRequisition.priority === "High"
                              ? "bg-warning-subtle text-warning-emphasis"
                              : "bg-danger-subtle text-danger-emphasis"
                          } px-3 py-1`}
                        >
                          {selectedRequisition.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedRequisition.isBulk && (
                  <div className="mb-4">
                    <h6 className="fw-bold mb-3">Bulk Items</h6>
                    <div className="table-responsive">
                      <table className="table table-sm">
                        <thead>
                          <tr>
                            <th>Item Name</th>
                            <th>Quantity</th>
                            <th>Priority</th>
                            <th>Reason</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedRequisition.bulkItems.map((item, index) => (
                            <tr key={index}>
                              <td>{item.name}</td>
                              <td>{item.qty}</td>
                              <td>
                                <span
                                  className={`badge rounded-pill ${
                                    item.priority === "Normal"
                                      ? "bg-secondary-subtle text-secondary-emphasis"
                                      : item.priority === "High"
                                      ? "bg-warning-subtle text-warning-emphasis"
                                      : "bg-danger-subtle text-danger-emphasis"
                                  } px-3 py-1`}
                                >
                                  {item.priority}
                                </span>
                              </td>
                              <td>{item.reason}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="row mb-3">
                  <div className="col-5 fw-bold text-muted">
                    Facility Stock at Request Time:
                  </div>
                  <div className="col-7">
                    {selectedRequisition.facilityStock}
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-5 fw-bold text-muted">Expiry Date:</div>
                  <div className="col-7">
                    {selectedRequisition.expiryDate || "N/A"}
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-5 fw-bold text-muted">
                    Facility Status:
                  </div>
                  <div className="col-7">
                    {(() => {
                      const facilityStatus =
                        getFacilityStatus(selectedRequisition);
                      return (
                        <span
                          className={`badge rounded-pill ${facilityStatus.class} px-3 py-1`}
                        >
                          {facilityStatus.status}
                        </span>
                      );
                    })()}
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-5 fw-bold text-muted">
                    Current Status:
                  </div>
                  <div className="col-7">
                    <span
                      className={`badge rounded-pill ${
                        selectedRequisition.status === "Pending"
                          ? "bg-secondary-subtle text-secondary-emphasis"
                          : selectedRequisition.status === "Processing"
                          ? "bg-warning-subtle text-warning-emphasis"
                          : selectedRequisition.status === "Delivered"
                          ? "bg-info-subtle text-info-emphasis"
                          : selectedRequisition.status === "Completed"
                          ? "bg-success-subtle text-success-emphasis"
                          : "bg-danger-subtle text-danger-emphasis"
                      } px-3 py-1`}
                    >
                      {selectedRequisition.status}
                    </span>
                  </div>
                </div>
                <hr className="my-4" />
                <h6 className="fw-bold mb-3">Status Timeline</h6>
                <div className="mb-4">
                  {selectedRequisition.statusTimeline.map((event, index) => (
                    <div key={index} className="d-flex mb-2">
                      <div
                        className="me-3 text-muted"
                        style={{ minWidth: "120px" }}
                      >
                        {event.timestamp}
                      </div>
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
                          <span className="text-muted small">
                            {remark.timestamp}
                          </span>
                        </div>
                        <div>{remark.remark}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button
                  type="button"
                  className="btn btn-secondary w-100"
                  onClick={closeViewModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Requisition Modal */}
      {showBulkModal && (
        <div
          className="modal fade show"
          tabIndex="-1"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={closeBulkModal}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Bulk Requisition List</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeBulkModal}
                ></button>
              </div>
              <div className="modal-body p-4">
                {bulkRequisitionList.length === 0 ? (
                  <div className="text-center py-4">
                    <i className="bi bi-cart-x fs-1 text-muted"></i>
                    <p className="mt-3 text-muted">
                      No items in bulk requisition list
                    </p>
                    <p className="text-muted">
                      Add items from pending requisitions or suggestions
                    </p>
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
                                onChange={(e) =>
                                  updateBulkItemQty(index, e.target.value)
                                }
                                min="1"
                              />
                            </td>
                            <td>
                              <select
                                className="form-select form-select-sm"
                                value={item.priority}
                                onChange={(e) => {
                                  const updatedList = [...bulkRequisitionList];
                                  updatedList[index] = {
                                    ...updatedList[index],
                                    priority: e.target.value,
                                  };
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
                  <button
                    type="button"
                    className="btn btn-outline-secondary w-100"
                    onClick={closeBulkModal}
                  >
                    {bulkRequisitionList.length === 0 ? "Close" : "Cancel"}
                  </button>
                  {bulkRequisitionList.length > 0 && (
                    <button
                      type="button"
                      className="btn btn-primary w-100"
                      onClick={submitBulkRequisition}
                    >
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
        <div
          className="modal fade show"
          tabIndex="-1"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={closeSuggestionModal}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Requisition Suggestions</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeSuggestionModal}
                ></button>
              </div>
              <div className="modal-body p-4">
                <p className="text-muted mb-4">
                  The following items need your attention based on stock levels
                  and expiry dates:
                </p>

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
                            <span
                              className={`badge rounded-pill ${
                                item.priority === "Normal"
                                  ? "bg-secondary-subtle text-secondary-emphasis"
                                  : item.priority === "High"
                                  ? "bg-warning-subtle text-warning-emphasis"
                                  : "bg-danger-subtle text-danger-emphasis"
                              } px-3 py-1`}
                            >
                              {item.priority}
                            </span>
                          </td>
                          <td>{item.suggestedQty}</td>
                          <td className="text-center">
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => addSuggestedToBulk(item)}
                              title="Add to Bulk Requisition"
                            >
                              Add to Bulk
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <div className="d-flex flex-column flex-sm-row gap-2 w-100">
                  <button
                    type="button"
                    className="btn btn-outline-secondary w-100"
                    onClick={closeSuggestionModal}
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary w-100"
                    onClick={() => {
                      suggestedRequisitions.forEach((item) =>
                        addSuggestedToBulk(item)
                      );
                      closeSuggestionModal();
                      setShowBulkModal(true);
                    }}
                  >
                    Add All to Bulk
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
