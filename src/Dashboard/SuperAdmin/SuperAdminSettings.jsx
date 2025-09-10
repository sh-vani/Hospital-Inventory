import React, { useState } from 'react';
import { FaCog, FaSave, FaBell, FaLock, FaGlobe, FaCalendarAlt, FaWarehouse, FaHospital } from 'react-icons/fa';

const SuperAdminSettings = () => {
  // State for form inputs
  const [systemName, setSystemName] = useState('Hospital Warehouse Management System');
  const [language, setLanguage] = useState('English');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  const [timeFormat, setTimeFormat] = useState('12-hour');
  const [lowStockThreshold, setLowStockThreshold] = useState(10);
  const [expiryWarningDays, setExpiryWarningDays] = useState(30);
  const [autoReorder, setAutoReorder] = useState(true);
  const [defaultReorderQuantity, setDefaultReorderQuantity] = useState(50);
  
  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">System Settings</h2>
      </div>
      
      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 pt-4">
              <h5 className="mb-0 fw-bold d-flex align-items-center">
                <FaCog className="me-2" /> General Settings
              </h5>
            </div>
            <div className="card-body">
              <form>
                <div className="mb-3">
                  <label className="form-label fw-bold">System Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={systemName}
                    onChange={(e) => setSystemName(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold d-flex align-items-center">
                    <FaGlobe className="me-2" /> Default Language
                  </label>
                  <select 
                    className="form-select" 
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    <option>English</option>
                    <option>French</option>
                    <option>Spanish</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold d-flex align-items-center">
                    <FaCalendarAlt className="me-2" /> Date Format
                  </label>
                  <select 
                    className="form-select"
                    value={dateFormat}
                    onChange={(e) => setDateFormat(e.target.value)}
                  >
                    <option>DD/MM/YYYY</option>
                    <option>MM/DD/YYYY</option>
                    <option>YYYY-MM-DD</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Time Format</label>
                  <select 
                    className="form-select"
                    value={timeFormat}
                    onChange={(e) => setTimeFormat(e.target.value)}
                  >
                    <option>12-hour</option>
                    <option>24-hour</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold d-flex align-items-center">
                    <FaBell className="me-2" /> Notification Settings
                  </label>
                  <div className="form-check form-switch">
                    <input 
                      className="form-check-input" 
                      type="checkbox" 
                      id="notificationSwitch" 
                      defaultChecked 
                    />
                    <label className="form-check-label" htmlFor="notificationSwitch">
                      Enable email notifications
                    </label>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary w-100 d-flex align-items-center justify-content-center">
                  <FaSave className="me-2" /> Save Settings
                </button>
              </form>
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 pt-4">
              <h5 className="mb-0 fw-bold d-flex align-items-center">
                <FaWarehouse className="me-2" /> Inventory Settings
              </h5>
            </div>
            <div className="card-body">
              <form>
                <div className="mb-3">
                  <label className="form-label fw-bold">Low Stock Threshold</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(e.target.value)}
                  />
                  <div className="form-text">Number of units at which an item is considered low stock</div>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Expiry Warning Days</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={expiryWarningDays}
                    onChange={(e) => setExpiryWarningDays(e.target.value)}
                  />
                  <div className="form-text">Number of days before expiry to show warnings</div>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Auto-Reorder Point</label>
                  <div className="form-check form-switch">
                    <input 
                      className="form-check-input" 
                      type="checkbox" 
                      id="autoReorderSwitch" 
                      checked={autoReorder}
                      onChange={(e) => setAutoReorder(e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="autoReorderSwitch">
                      Enable automatic reordering
                    </label>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Default Reorder Quantity</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={defaultReorderQuantity}
                    onChange={(e) => setDefaultReorderQuantity(e.target.value)}
                  />
                  <div className="form-text">Default quantity to reorder when stock is low</div>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold d-flex align-items-center">
                    <FaHospital className="me-2" /> Facility Settings
                  </label>
                  <div className="form-check form-switch">
                    <input 
                      className="form-check-input" 
                      type="checkbox" 
                      id="facilitySettingsSwitch" 
                      defaultChecked 
                    />
                    <label className="form-check-label" htmlFor="facilitySettingsSwitch">
                      Enable facility-specific settings
                    </label>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary w-100 d-flex align-items-center justify-content-center">
                  <FaSave className="me-2" /> Save Settings
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      
      {/* Additional Settings */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-white border-0 pt-4">
          <h5 className="mb-0 fw-bold">Security Settings</h5>
        </div>
        <div className="card-body">
          <form>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">Password Policy</label>
                <select className="form-select">
                  <option>Medium (8 characters, letters and numbers)</option>
                  <option>Strong (12 characters, letters, numbers and symbols)</option>
                  <option>Very Strong (16 characters, letters, numbers, symbols and uppercase)</option>
                </select>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">Session Timeout</label>
                <select className="form-select">
                  <option>30 minutes</option>
                  <option>1 hour</option>
                  <option>4 hours</option>
                  <option>8 hours</option>
                  <option>24 hours</option>
                </select>
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label fw-bold">Two-Factor Authentication</label>
              <div className="form-check form-switch">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  id="twoFactorSwitch" 
                />
                <label className="form-check-label" htmlFor="twoFactorSwitch">
                  Enable two-factor authentication for administrators
                </label>
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label fw-bold">Login Attempts</label>
              <select className="form-select">
                <option>3 attempts before lockout</option>
                <option>5 attempts before lockout</option>
                <option>10 attempts before lockout</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary w-100 d-flex align-items-center justify-content-center">
              <FaSave className="me-2" /> Save Security Settings
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminSettings;