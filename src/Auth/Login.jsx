import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import BaseUrl from "../Api/BaseUrl";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState("Super Admin");
  const [isLoading, setIsLoading] = useState(false);

  // All roles + credentials for dropdown
  const roleCredentials = {
    "Super Admin": {
      email: "superadmin@hospital.com",
      password: "123",
    },
    "Warehouse Admin": {
      email: "warehouse@hospital.com",
      password: "123",
    },
    "Facility Admin": {
      email: "hospital.admin@hospital.com",
      password: "123",
    },
    "Facility User": {
      email: "alice.brown@hospital.com",
      password: "123",
    },
  };

  // Role-wise redirects
  const roleRedirects = {
    super_admin: "/superadmin/dashboard",
    warehouse_admin: "/warehouse/dashboard",
    facility_admin: "/facility/dashboard",
    facility_user: "/user/dashboard",
  };

  const handleRoleChange = (e) => {
    const role = e.target.value;
    setSelectedRole(role);
    setEmail(roleCredentials[role].email);
    setPassword(roleCredentials[role].password);
    setShowPassword(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // ✅ API call
      const response = await fetch(`${BaseUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        const role = data.data?.user?.role;

        // Save token & user info
        localStorage.setItem("token", data.data?.token);
        localStorage.setItem("role", role);
        localStorage.setItem("user", JSON.stringify(data.data?.user));

        // ✅ Redirect based on role
        if (role && roleRedirects[role]) {
          navigate(roleRedirects[role]);
        } else {
          alert("Unknown role received from server.");
        }
      } else {
        alert("Invalid email or password. Please try again.");
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert("Something went wrong. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-4">
      <div
        className="card shadow-lg overflow-hidden"
        style={{
          maxWidth: "900px",
          width: "100%",
          borderRadius: "16px",
          border: "none",
          boxShadow: "0 10px 30px rgba(0, 86, 179, 0.15)",
        }}
      >
        <div className="row g-0">
          <div className="col-md-6 d-none d-md-block">
            <img
              src="https://www.shutterstock.com/image-illustration/online-consultation-doctor-on-smartphone-600nw-2150820867.jpg"
              alt="Hospital Warehouse"
              className="img-fluid h-100"
              style={{
                objectFit: "cover",
                borderTopLeftRadius: "16px",
                borderBottomLeftRadius: "16px",
              }}
            />
          </div>

          <div className="col-md-6 d-flex flex-column p-5 bg-white">
            <div className="text-center mb-5">
              <h2
                className="fw-bold ms-3 mb-0"
                style={{ color: "#0056b3", fontSize: "1.8rem" }}
              >
                FRANCIS FOSU GROUP
              </h2>
              <h3
                className="fw-bold mb-2"
                style={{ color: "#0056b3", fontSize: "1.4rem" }}
              >
                Hospital Warehouse Management
              </h3>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Role Selector */}
              <div className="mb-4 rounded">
                <label
                  className="form-label fw-semibold d-block"
                  style={{ color: "#0056b3", fontSize: "1.05rem" }}
                >
                  Select Your Role
                </label>
                <select
                  className="form-select form-select-lg py-3 px-3 border-0 border-bottom"
                  value={selectedRole}
                  onChange={handleRoleChange}
                  style={{
                    borderBottom: "2px solid #0056b3",
                    backgroundColor: "#f8fbff",
                    fontSize: "1rem",
                    borderRadius: "0",
                    transition: "background-color 0.3s ease",
                  }}
                >
                  {Object.keys(roleCredentials).map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              {/* Email Field */}
              <div className="mb-4">
                <label
                  className="form-label fw-semibold"
                  style={{ color: "#0056b3", fontSize: "1.05rem" }}
                >
                  Email
                </label>
                <input
                  type="email"
                  className="form-control form-control-lg py-3 border-0 border-bottom"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    borderBottom: "2px solid #0056b3",
                    backgroundColor: "#f8fbff",
                    fontSize: "1rem",
                  }}
                />
              </div>

              {/* Password Field */}
              <div className="mb-4">
                <label
                  className="form-label fw-semibold"
                  style={{ color: "#0056b3", fontSize: "1.05rem" }}
                >
                  Password
                </label>
                <div className="input-group">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control form-control-lg py-3 border-0 border-bottom"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{
                      borderBottom: "2px solid #0056b3",
                      backgroundColor: "#f8fbff",
                      fontSize: "1rem",
                    }}
                  />
                  <button
                    className="btn btn-light border-0 border-bottom"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <i className="bi bi-eye-slash"></i>
                    ) : (
                      <i className="bi bi-eye"></i>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn w-100 py-3 fw-bold text-white"
                style={{
                  backgroundColor: "#0056b3",
                  fontSize: "1.1rem",
                  borderRadius: "8px",
                }}
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login to System"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
