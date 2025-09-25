import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaUserShield,
  FaWarehouse,
  FaHospital,
  FaUser,
  FaPlus,
  FaSave,
  FaTimes,
  FaCheck,
} from "react-icons/fa";

const SuperAdminRoles = () => {
  // Fixed role list as per client (no add/edit/delete of roles)
  const [roles, setRoles] = useState([
    {
      id: 1,
      name: "Super Admin",
      description: "Full system access with all permissions",
      icon: <FaUserShield className="text-danger" />,
      permissions: {
        dashboard: true,
        inventory: true,
        requisitions: true,
        dispatches: true,
        reports: true,
        assets: true,
        facilities: true,
        users: true,
        settings: true,
      },
    },
    {
      id: 2,
      name: "Main Warehouse Admin",
      description: "Manages warehouse operations and inventory",
      icon: <FaWarehouse className="text-primary" />,
      permissions: {
        dashboard: true,
        inventory: true,
        requisitions: true,
        dispatches: true,
        reports: true,
        assets: true,
        facilities: false,
        users: true,
        settings: false,
      },
    },
    {
      id: 3,
      name: "Facility Admin",
      description: "Manages facility-specific operations",
      icon: <FaHospital className="text-info" />,
      permissions: {
        dashboard: true,
        inventory: true,
        requisitions: true,
        dispatches: false,
        reports: true,
        assets: true,
        facilities: true,
        users: true,
        settings: false,
      },
    },
    {
      id: 4,
      name: "Facility User",
      description: "Limited access to facility operations",
      icon: <FaUser className="text-success" />,
      permissions: {
        dashboard: true,
        inventory: true,
        requisitions: true,
        dispatches: false,
        reports: true,
        assets: false,
        facilities: false,
        users: false,
        settings: false,
      },
    },
  ]);

  // State for modals
  const [showAddModal, setShowAddModal] = useState(false);

  // State for new role form
  const [newRole, setNewRole] = useState({
    name: "",
    description: "",
  });

  // Handle input changes
  useEffect(() => {
    axios
      .get("https://ssknf82q-4000.inc1.devtunnels.ms/api/roles")
      .then((res) => {
        console.log("Fetched roles:", res.data);

        // Normalize roles so every role has permissions & an icon
        const normalizedRoles = res.data.map((role, index) => ({
          ...role,
          id: role.id || index + 1,
          name: role.name || role.role_name, // API might use role_name
          icon: <FaUser className="text-secondary" />,
          permissions: role.permissions || {
            dashboard: false,
            inventory: true,
            requisitions: false,
            dispatches: false,
            reports: true,
            assets: false,
            facilities: true,
            users: true,
            settings: false,
          },
        }));

        setRoles(normalizedRoles);
      })
      .catch((err) => {
        console.error("Error fetching roles:", err);
      });
  }, []);
  const handleRoleChange = (e) => {
    const { name, value } = e.target;
    setNewRole({
      ...newRole,
      [name]: value,
    });
  };

  // Add role handler
  const handleAddRole = () => {

    const isDuplicate = roles.some((role) =>
      (role.name || role.role_name).toLowerCase() === newRole.name.trim().toLowerCase()
    );

    if (isDuplicate) {
      alert("Role name already exists. Please choose another name.");
      return; // stop execution
    }
    const newItem = {
      id: roles.length + 1,
      name: newRole.name,
      description: newRole.description,
      icon: <FaUser className="text-secondary" />,
      permissions: {
        dashboard: false,
        inventory: true,
        requisitions: false,
        dispatches: false,
        reports: true,
        assets: false,
        facilities: false,
        users: true,
        settings: false,
      },
    };

    setRoles([...roles, newItem]);
    setNewRole({ name: "", description: "" }); // reset form
    setShowAddModal(false);

    const apiPayload = {
      role_name: newRole.name,
      description: newRole.description,
      permissions: newItem.permissions,
    };

    axios
      .post("https://ssknf82q-4000.inc1.devtunnels.ms/api/roles", apiPayload)
      .then((res) => {
        console.log("Role saved:", res.data);
        return axios.get("https://ssknf82q-4000.inc1.devtunnels.ms/api/roles");
      })
      .then((res) => setRoles(res.data))
      .catch((err) => {
        console.error("Error saving role:", err);
        if (err.response) {
          console.error("Server response:", err.response.data);
          alert(err.response.data.error || "Failed to save role");
        }
      });
  };

  // Permission badge
  const PermissionBadge = ({ hasPermission }) => (
    <span
      className={`badge ${hasPermission ? "bg-success" : "bg-secondary"
        } rounded-circle p-2`}
    >
      {hasPermission ? <FaCheck /> : <FaTimes />}
    </span>
  );

  return (
    <div className="fade-in container mt-4">
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Roles & Permissions</h2>
        <button
          className="btn btn-primary d-flex align-items-center"
          onClick={() => setShowAddModal(true)}
        >
          <FaPlus className="me-2" /> Add New Role
        </button>
      </div>

      {/* Roles List */}
      <div className="row">
        {roles.map((role) => (
          <div key={role.id} className="col-md-4 mb-3">
            <div className="card p-3 shadow-sm">
              <div className="d-flex align-items-center mb-2">
                {role.icon || <FaUser className="text-secondary" />}
                <h5 className="ms-2 mb-0">{role.name || role.role_name}</h5>
              </div>
              <p className="mb-2">{role.description}</p>
              <div className="d-flex flex-wrap gap-1">
                {role.permissions &&
                  Object.keys(role.permissions).map((key) => (
                    <span
                      key={key}
                      className={`badge ${role.permissions[key] ? "bg-success" : "bg-secondary"}`}
                    >
                      {key}
                    </span>
                  ))}
              </div>

            </div>
          </div>
        ))}
      </div>
      {/* Add Role Modal */}
      {showAddModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Role</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowAddModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Role Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={newRole.name}
                      onChange={handleRoleChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Description</label>
                    <textarea
                      className="form-control"
                      name="description"
                      value={newRole.description}
                      onChange={handleRoleChange}
                      rows="2"
                    ></textarea>
                  </div>
                  {/* <div className="mb-3">
                    <label className="form-label fw-bold">Permissions</label>
                    <div className="row">
                      {permissionModules.map((module) => (
                        <div key={module.id} className="col-6 mb-2">
                          <div className="form-check">
                            <input 
                              className="form-check-input" 
                              type="checkbox" 
                              name={module.id}
                              checked={newRole.permissions[module.id]}
                              onChange={handleNewRolePermissionChange}
                              id={`new-permission-${module.id}`}
                            />
                            <label className="form-check-label" htmlFor={`new-permission-${module.id}`}>
                              {module.name}
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div> */}
                </form>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleAddRole}
                >
                  <FaSave className="me-2" /> Add Role
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Modal Backdrop */}
      {showAddModal && (
        <div className="modal-backdrop show"></div>
      )}
    </div>
  );
};

export default SuperAdminRoles;
