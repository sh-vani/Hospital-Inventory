import React, { useState } from 'react';
import { 
  FaUserShield, FaWarehouse, FaHospital, FaUser, FaEdit, FaTimes, FaCheck,
  FaTachometerAlt, FaBoxes, FaClipboardList, FaTruck, FaChartBar, FaTools, FaBuilding, FaUsersCog, FaCog
} from 'react-icons/fa';

const SuperAdminRoles = () => {
  // Fixed role list as per client (no add/edit/delete of roles)
  const [roles, setRoles] = useState([
    { 
      id: 1, 
      name: 'Super Admin', 
      description: 'Full system access with all permissions',
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
        settings: true
      }
    },
    { 
      id: 2, 
      name: 'Main Warehouse Admin', 
      description: 'Manages warehouse operations and inventory',
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
        settings: false
      }
    },
    { 
      id: 3, 
      name: 'Facility Admin', 
      description: 'Manages facility-specific operations',
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
        settings: false
      }
    },
    { 
      id: 4, 
      name: 'Facility User', 
      description: 'Limited access to facility operations',
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
        settings: false
      }
    }
  ]);
  
  // Modal state for permissions only
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [currentRole, setCurrentRole] = useState(null);
  const [permissionForm, setPermissionForm] = useState({});
  
  // Permission modules (menus)
  const permissionModules = [
    { id: 'dashboard', name: 'Dashboard', icon: <FaTachometerAlt /> },
    { id: 'inventory', name: 'Inventory Management', icon: <FaBoxes /> },
    { id: 'requisitions', name: 'Requisitions', icon: <FaClipboardList /> },
    { id: 'dispatches', name: 'Dispatches', icon: <FaTruck /> },
    { id: 'reports', name: 'Reports', icon: <FaChartBar /> },
    { id: 'assets', name: 'Assets', icon: <FaTools /> },
    { id: 'facilities', name: 'Facilities', icon: <FaBuilding /> },
    { id: 'users', name: 'Users', icon: <FaUsersCog /> },
    { id: 'settings', name: 'Settings', icon: <FaCog /> }
  ];

  // Open permission editor
  const openPermissionModal = (role) => {
    setCurrentRole(role);
    setPermissionForm({ ...role.permissions });
    setShowPermissionModal(true);
  };

  // Handle permission toggle
  const handlePermissionChange = (e) => {
    const { name, checked } = e.target;
    setPermissionForm(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  // Save updated permissions
  const handleSavePermissions = () => {
    setRoles(prev => 
      prev.map(role => 
        role.id === currentRole.id 
          ? { ...role, permissions: permissionForm } 
          : role
      )
    );
    setShowPermissionModal(false);
  };

  // Reusable badge
  const PermissionBadge = ({ hasPermission }) => (
    <span className={`badge ${hasPermission ? 'bg-success' : 'bg-secondary'} rounded-circle p-2`}>
      {hasPermission ? <FaCheck /> : <FaTimes />}
    </span>
  );

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Roles & Permissions</h2>
        {/* No "Add Role" button — as per client */}
      </div>

      {/* Stats Cards (for visual only) */}
      <div className="row mb-4">
        {roles.map((role, idx) => (
          <div className="col-md-3 mb-3" key={role.id}>
            <div className="card border-0 shadow-sm h-100 stat-card">
              <div className="card-body text-center p-4">
                <div className={`bg-${['primary','success','info','warning'][idx]} bg-opacity-10 p-3 rounded-circle d-inline-block mb-3`}>
                  {React.cloneElement(role.icon, { 
                    className: `text-${['primary','success','info','warning'][idx]} fa-2x` 
                  })}
                </div>
                <div className={`number text-${['primary','success','info','warning'][idx]} fw-bold`}>1</div>
                <div className="label text-muted">{role.name}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Role Permission Matrix */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-white border-0 pt-4">
          <h5 className="mb-0 fw-bold">Role Permission Matrix</h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="bg-light">
                <tr>
                  <th>Permission</th>
                  {roles.map(role => (
                    <th key={role.id} className="text-center">
                      <div className="d-flex flex-column align-items-center">
                        {React.cloneElement(role.icon, { className: `${role.icon.props.className} fa-lg mb-1` })}
                        <small>{role.name}</small>
                      </div>
                    </th>
                  ))}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {permissionModules.map(module => (
                  <tr key={module.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <span className="me-2">{module.icon}</span>
                        {module.name}
                      </div>
                    </td>
                    {roles.map(role => (
                      <td key={role.id} className="text-center">
                        <PermissionBadge hasPermission={role.permissions[module.id]} />
                      </td>
                    ))}
                    <td className="text-center">
                      <button 
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => openPermissionModal(role)}
                      >
                        <FaEdit />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Role Cards (View + Edit Permissions) */}
      <div className="row">
        {roles.map(role => (
          <div className="col-md-6 col-lg-3 mb-4" key={role.id}>
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header bg-white border-0 pt-3 pb-2">
                <div className="d-flex align-items-start">
                  {React.cloneElement(role.icon, { className: `${role.icon.props.className} fa-lg me-2 mt-1` })}
                  <div>
                    <h6 className="mb-1 fw-bold">{role.name}</h6>
                    <p className="text-muted small mb-0">{role.description}</p>
                  </div>
                </div>
              </div>
              <div className="card-body pt-2">
                <h6 className="mb-2">Permissions</h6>
                <div className="row g-2">
                  {permissionModules.map(module => (
                    <div key={module.id} className="col-6">
                      <div className="d-flex align-items-center">
                        <PermissionBadge hasPermission={role.permissions[module.id]} />
                        <span className="ms-2 small">{module.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <button 
                  className="btn btn-outline-primary btn-sm w-100 mt-3"
                  onClick={() => openPermissionModal(role)}
                >
                  <FaEdit className="me-1" /> Edit Permissions
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Permission Edit Modal */}
      {showPermissionModal && currentRole && (
        <>
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Edit Permissions: {currentRole.name}</h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setShowPermissionModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="alert alert-info small">
                    <strong>{currentRole.name}:</strong> {currentRole.description}
                  </div>
                  
                  <div className="row g-3">
                    {permissionModules.map(module => (
                      <div key={module.id} className="col-md-6">
                        <div className="d-flex justify-content-between align-items-center p-2 border rounded">
                          <div className="d-flex align-items-center">
                            <span className="me-2">{module.icon}</span>
                            <span>{module.name}</span>
                          </div>
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={`perm-${module.id}`}
                              name={module.id}
                              checked={permissionForm[module.id] || false}
                              onChange={handlePermissionChange}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowPermissionModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-primary" 
                    onClick={handleSavePermissions}
                  >
                    <FaCheck className="me-1" /> Save Permissions
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show"></div>
        </>
      )}
    </div>
  );
};

export default SuperAdminRoles;