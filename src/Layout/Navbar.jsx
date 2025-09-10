import React, { useState, useRef, useEffect } from "react";
import { FaBell, FaSearch, FaUserCircle, FaBars } from "react-icons/fa";

const Navbar = ({ toggleSidebar }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav
      className="navbar navbar-expand px-3 py-2 d-flex justify-content-between align-items-center fixed-top"
      style={{
        backgroundColor: "rgba(171, 134, 134, 0.1)",
        // backgroundColor: "  #168376", // ✅ Set your desired color
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)", // Optional: soft shadow
      }}
    >
  <div className="d-flex align-items-center gap-3">
  {/* Toggle Button with Custom Hover */}
  <button
    className="btn p-2"
    style={{
      backgroundColor: 'blue',
      borderColor: 'blue',
      color: 'blue',
      borderRadius: '6px',
      border: '2px solid white',
      transition: 'all 0.3s ease',
    }}
    onMouseEnter={(e) => {
      e.target.style.backgroundColor = 'white';
      e.target.style.color = '#000';
      e.target.style.borderColor = 'white';
    }}
    onMouseLeave={(e) => {
      e.target.style.backgroundColor = 'transparent';
      e.target.style.color = 'white';
      e.target.style.borderColor = 'white';
    }}
    onClick={toggleSidebar}
  >
    <FaBars color="currentColor" />
  </button>

  {/* Text Logo */}
  <span style={{
    fontSize: '1.5rem',
    fontWeight: '700',
    color: 'red',
    letterSpacing: '-0.5px',
    fontFamily: "'Poppins', sans-serif",
  }}>
    Hospital <span style={{ color: 'blue', fontWeight: '800' }}>Management</span>
  </span>
</div>

      {/* Search */}
      <div className="d-flex align-items-center">
        <div className="input-group d-none d-sm-flex">
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Search"
            aria-label="Search"
          />
          <span className="input-group-text text-white" style={{ backgroundColor: "transparent", borderColor: "rgba(255,255,255,0.3)" }}>
            <FaSearch color="white" />
          </span>
        </div>

        {/* Search icon for mobile */}
        <button className="btn btn-sm d-sm-none ms-2 text-white">
          <FaSearch />
        </button>
      </div>

      {/* Notification and User */}
      <div className="d-flex align-items-center gap-3 position-relative">
        {/* Notification */}
        <div className="position-relative">
          <FaBell size={18} color="white" />
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            3
          </span>
        </div>

        {/* User Profile */}
        <div className="dropdown" ref={dropdownRef}>
          <div
            className="d-flex align-items-center gap-2 cursor-pointer text-white"
            role="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <FaUserCircle size={24} />
            <div className="d-none d-sm-block text-white">
              <small className="mb-0">Welcome</small>
              <div className="fw-bold">Admin</div>
            </div>
          </div>

          {dropdownOpen && (
            <ul
              className="dropdown-menu show mt-2 shadow-sm"
              style={{
                position: 'absolute',
                right: 0,
                minWidth: '180px',
                maxWidth: 'calc(100vw - 30px)',
                zIndex: 1000,
                borderRadius: '8px',
                overflow: 'hidden',
              }}
            >
              <li><a className="dropdown-item" href="#">Profile</a></li>
              <li><a className="dropdown-item" href="#">Settings</a></li>
              <li><hr className="dropdown-divider" /></li>
              <li><a className="dropdown-item text-danger" href="/">Logout</a></li>
            </ul>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;