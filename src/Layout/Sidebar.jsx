import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faInfoCircle,
  faStethoscope,
  faUserMd,
  faBuilding,
  faCalendarAlt,
  faPhoneAlt,
  faChevronDown
} from "@fortawesome/free-solid-svg-icons";
import "./Sidebar.css";

const Sidebar = ({ collapsed, setCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState(null);
  const [userRole, setUserRole] = useState("Admin");
  
  // Load user role from localStorage
  useEffect(() => {
    const role = localStorage.getItem("userRole") || "Admin";
    setUserRole(role);
  }, []);
  
  const toggleMenu = (menuKey) => {
    setActiveMenu(activeMenu === menuKey ? null : menuKey);
  };
  
  const isActive = (path) => location.pathname === path;
  
  const handleNavigate = (path) => {
    navigate(path);
    if (window.innerWidth <= 768) setCollapsed(true);
  };
  
  // Define menus for hospital staff based on the screenshot
  const allMenus = {
    "Admin": [
      {
        name: "Home",
        icon: faHome,
        path: "/admin/home",
      },
      {
        name: "About Us",
        icon: faInfoCircle,
        path: "/admin/about",
      },
      {
        name: "Services",
        icon: faStethoscope,
        path: "/admin/services",
      },
      {
        name: "Our Doctors",
        icon: faUserMd,
        path: "/admin/doctors",
      },
      {
        name: "Departments",
        icon: faBuilding,
        path: "/admin/departments",
      },
      {
        name: "Appointments",
        icon: faCalendarAlt,
        path: "/admin/appointments",
      },
      {
        name: "Emergency",
        icon: faPhoneAlt,
        path: "/admin/emergency",
      },
      {
        name: "Contact Us",
        icon: faPhoneAlt,
        path: "/admin/contact",
      },
    ],
    "Doctor": [
      {
        name: "Dashboard",
        icon: faHome,
        path: "/doctor/dashboard",
      },
      {
        name: "Appointments",
        icon: faCalendarAlt,
        path: "/doctor/appointments",
      },
      {
        name: "Patients",
        icon: faUserMd,
        path: "/doctor/patients",
      },
      {
        name: "Schedule",
        icon: faCalendarAlt,
        path: "/doctor/schedule",
      },
    ],
    "Staff": [
      {
        name: "Dashboard",
        icon: faHome,
        path: "/staff/dashboard",
      },
      {
        name: "Appointments",
        icon: faCalendarAlt,
        path: "/staff/appointments",
      },
      {
        name: "Patients",
        icon: faUserMd,
        path: "/staff/patients",
      },
    ],
  };
  
  const userMenus = allMenus[userRole] || allMenus["Admin"];
  
  return (
    <div className={`sidebar-container ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar">
        {/* Hospital Logo Section */}
        
        
        <ul className="menu">
          {userMenus.map((menu, index) => {
            // If no subItems → direct link
            if (!menu.subItems) {
              return (
                <li key={index} className="menu-item">
                  <div
                    className={`menu-link ${isActive(menu.path) ? "active" : ""}`}
                    onClick={() => handleNavigate(menu.path)}
                    style={{ cursor: "pointer" }}
                  >
                    <FontAwesomeIcon icon={menu.icon} className="menu-icon" />
                    {!collapsed && <span className="menu-text">{menu.name}</span>}
                  </div>
                </li>
              );
            }
            // If has subItems → show dropdown
            return (
              <li key={index} className="menu-item">
                <div
                  className="menu-link mb-2"
                  onClick={() => toggleMenu(menu.key)}
                  style={{ cursor: "pointer" }}
                >
                  <FontAwesomeIcon icon={menu.icon} className="menu-icon" />
                  {!collapsed && <span className="menu-text">{menu.name}</span>}
                  {!collapsed && (
                    <FontAwesomeIcon
                      icon={faChevronDown}
                      className={`arrow-icon ${activeMenu === menu.key ? "rotate" : ""}`}
                    />
                  )}
                </div>
                {/* Show submenu only if menu is active and not collapsed */}
                {!collapsed && activeMenu === menu.key && (
                  <ul className="submenu">
                    {menu.subItems.map((sub, subIndex) => (
                      <li
                        key={subIndex}
                        className={`submenu-item mb-2 ${isActive(sub.path) ? "active-sub" : ""}`}
                        onClick={() => handleNavigate(sub.path)}
                        style={{ cursor: "pointer" }}
                      >
                        {sub.label}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
        
        {!collapsed && (
          <div className="admin-footer">
            <span>© 2023 F. Alpha and Omega Specialist Hospital</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;