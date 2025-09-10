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
  faChevronDown,
  faClock,
  faCubes,
  faArrowRightFromBracket,
  faTruck,
  faChartLine,
  faLaptopCode,
  faCog,
  faUsers
} from "@fortawesome/free-solid-svg-icons";
import "./Sidebar.css";

const Sidebar = ({ collapsed, setCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState(null);
  const [userRole, setUserRole] = useState("Admin");
  
  // Define all menus first
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
    "Warehouse": [
      {
        name: "Dashboard",
        icon: faClock,
        path: "/warehouse/dashboard",
      },
      {
        name: "Inventory",
        icon: faCubes,
        path: "/warehouse/inventory",
      },
      {
        name: "Requisitions",
        icon: faArrowRightFromBracket,
        path: "/warehouse/requisitions",
      },
      {
        name: "Dispatches",
        icon: faTruck,
        path: "/warehouse/dispatches",
      },
      {
        name: "Reports",
        icon: faChartLine,
        path: "/warehouse/reports",
      },
      {
        name: "Assets",
        icon: faLaptopCode,
        path: "/warehouse/assets",
      },
      {
        name: "Settings",
        icon: faCog,
        path: "/warehouse/settings",
      },
    ],
    "FacilityAdmin": [
      {
        name: "Dashboard",
        icon: faClock,
        path: "/facility-admin/dashboard",
      },
      {
        name: "Requisitions",
        icon: faArrowRightFromBracket,
        path: "/facility-admin/requisitions",
      },
      {
        name: "Reports",
        icon: faChartLine,
        path: "/facility-admin/reports",
      },
      {
        name: "Assets",
        icon: faLaptopCode,
        path: "/facility-admin/assets",
      },
      {
        name: "Users",
        icon: faUsers,
        path: "/facility-admin/users",
      },
      {
        name: "Settings",
        icon: faCog,
        path: "/facility-admin/settings",
      },
    ],
    "FacilityUser": [
      {
        name: "Dashboard",
        icon: faClock,
        path: "/facility-user/dashboard",
      },
      {
        name: "Requisitions",
        icon: faArrowRightFromBracket,
        path: "/facility-user/requisitions",
      }
    ]
  };
  
  // Load user role from localStorage
  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role && allMenus[role]) {
      setUserRole(role);
    } else {
      // Default to Admin if role is invalid or not found
      setUserRole("Admin");
      localStorage.setItem("userRole", "Admin");
    }
  }, []);
  
  const toggleMenu = (menuKey) => {
    setActiveMenu(activeMenu === menuKey ? null : menuKey);
  };
  
  const isActive = (path) => location.pathname === path;
  
  const handleNavigate = (path) => {
    navigate(path);
    if (window.innerWidth <= 768) setCollapsed(true);
  };
  
  // Role-based menu assignment using switch case
  let userMenus;
  switch(userRole) {
    case "Admin":
      userMenus = allMenus["Admin"];
      break;
    case "Warehouse":
      userMenus = allMenus["Warehouse"];
      break;
    case "FacilityAdmin":
      userMenus = allMenus["FacilityAdmin"];
      break;
    case "FacilityUser":
      userMenus = allMenus["FacilityUser"];
      break;
    default:
      userMenus = allMenus["Admin"]; // Default to Admin if role doesn't match
      break;
  }
  
  return (
    <div className={`sidebar-container ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar">
        {/* Show current role for clarity */}
        {!collapsed && (
          <div className="sidebar-role-indicator p-3 mb-3 bg-light border rounded">
            <small className="text-muted">Logged in as:</small>
            <div className="fw-bold text-primary">{userRole}</div>
          </div>
        )}
        <ul className="menu">
          {userMenus.map((menu, index) => {
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