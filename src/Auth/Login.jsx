import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState("Warehouse Admin");
  
  // Define default credentials for each role
  const roleCredentials = {
    "Super Admin": {
      username: "superadmin",
      password: "super123",
      redirect: "/superadmin/dashboard",
    },
    "Warehouse Admin": {
      username: "warehouse",
      password: "warehouse123",
      redirect: "/warehouse/dashboard",
    },
    "Facility Admin": {
      username: "facility",
      password: "facility123",
      redirect: "/facility/dashboard",
    },
    "Facility User": {
      username: "user",
      password: "user123",
      redirect: "/user/dashboard",
    },
  };

  const handleRoleChange = (e) => {
    const role = e.target.value;
    setSelectedRole(role);
    setUsername(roleCredentials[role].username);
    setPassword(roleCredentials[role].password);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Check which role matches
    const matchedRole = Object.values(roleCredentials).find(
      (role) => role.username === username && role.password === password
    );
    if (matchedRole) {
      // Save role and username in localStorage
      localStorage.setItem("userRole", Object.keys(roleCredentials).find(
        key => roleCredentials[key].username === username
      ));
      localStorage.setItem("username", username);
      // Redirect based on role
      navigate(matchedRole.redirect);
    } else {
      alert("Invalid username or password. Please try again.");
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-white">
      <div className="card shadow-lg overflow-hidden" style={{ maxWidth: "900px", width: "100%", borderRadius: "1rem", border: "none" }}>
        <div className="row g-0">
          {/* Image Column */}
          <div className="col-md-5 d-none d-md-block">
            <img
              src="https://i.ibb.co/ycN1pv8b/output-1.jpg"
              alt="Delhi AIIMS Hospital"
              className="img-fluid"
              style={{ height: "100%", objectFit: "cover" }}
            />
          </div>
          {/* Form Column */}
          <div className="col-md-7 d-flex flex-column p-5 bg-white">
            <div className="text-center mb-4">
              <div className="d-flex align-items-center justify-content-center mb-3">
                <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: "60px", height: "60px", backgroundColor: "#128C7E" }}>
                  <i className="bi bi-hospital text-white fs-3"></i>
                </div>
                <h2 className="fw-bold ms-3 mb-0" style={{ color: "#128C7E", fontSize: "1.8rem" }}>FRANCIS FOSU GROUP</h2>
              </div>
              <h3 className="fw-bold mb-2" style={{ color: "#128C7E", fontSize: "1.5rem" }}>Hospital Warehouse Management</h3>
              <p className="text-muted" style={{ fontSize: "1rem" }}>Secure access to medical inventory system</p>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="form-label fw-semibold" style={{ color: "#128C7E", fontSize: "1.1rem" }}>Select Your Role</label>
                <select 
                  className="form-select form-select-lg py-3 border-0 border-bottom border-2" 
                  value={selectedRole}
                  onChange={handleRoleChange}
                  style={{ borderBottomColor: "#128C7E", backgroundColor: "#f0f7f4", fontSize: "1rem" }}
                >
                  {Object.keys(roleCredentials).map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="form-label fw-semibold" style={{ color: "#128C7E", fontSize: "1.1rem" }}>Username</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-0 border-bottom border-2" style={{ borderBottomColor: "#128C7E", backgroundColor: "#f0f7f4" }}>
                    <i className="bi bi-person-fill" style={{ color: "#128C7E", fontSize: "1.2rem" }}></i>
                  </span>
                  <input
                    type="text"
                    className="form-control form-control-lg py-3 border-0 border-bottom border-2"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    style={{ borderBottomColor: "#128C7E", backgroundColor: "#f0f7f4", fontSize: "1rem" }}
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="form-label fw-semibold" style={{ color: "#128C7E", fontSize: "1.1rem" }}>Password</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-0 border-bottom border-2" style={{ borderBottomColor: "#128C7E", backgroundColor: "#f0f7f4" }}>
                    <i className="bi bi-lock-fill" style={{ color: "#128C7E", fontSize: "1.2rem" }}></i>
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control form-control-lg py-3 border-0 border-bottom border-2"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ borderBottomColor: "#128C7E", backgroundColor: "#f0f7f4", fontSize: "1rem" }}
                  />
                  <button 
                    className="btn btn-light border-0 border-bottom border-2" 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ borderBottomColor: "#128C7E", backgroundColor: "#f0f7f4" }}
                  >
                    {showPassword ? (
                      <i className="bi bi-eye-slash" style={{ color: "#128C7E", fontSize: "1.2rem" }}></i>
                    ) : (
                      <i className="bi bi-eye" style={{ color: "#128C7E", fontSize: "1.2rem" }}></i>
                    )}
                  </button>
                </div>
              </div>
              
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" id="remember" style={{ color: "#128C7E" }} />
                  <label className="form-check-label" htmlFor="remember" style={{ color: "#128C7E", fontSize: "1rem" }}>
                    Remember me
                  </label>
                </div>
                <a href="#" className="text-decoration-none small" style={{ color: "#128C7E", fontSize: "1rem" }}>
                  Forgot Password?
                </a>
              </div>
              
              <button 
                type="submit" 
                className="btn w-100 py-3 fw-bold shadow-sm text-white"
                style={{ backgroundColor: "#128C7E", border: "none", fontSize: "1.1rem" }}
                onMouseOver={(e) => e.target.style.backgroundColor = "#25D366"}
                onMouseOut={(e) => e.target.style.backgroundColor = "#128C7E"}
              >
                <i className="bi bi-box-arrow-in-right me-2"></i> Login to System
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;