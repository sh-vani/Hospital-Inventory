import { Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
import { useState, useEffect } from "react";
import * as echarts from "echarts";


import Navbar from "./Layout/Navbar";
import Login from "./Auth/Login";
import Signup from "./Auth/Signup";
import ForgotPassword from "./Auth/ForgotPassword";
import Sidebar from "./Layout/Sidebar";
import Profile from "./Profile/Profile"
import SuperAdminDashboard from "./Dashboard/SuperAdmin/SuperAdminDashboard";
// import InventoryManagement from "./Dashboard/SuperAdmin/InventoryManagement"
import SuperAdminAssets from "./Dashboard/SuperAdmin/SuperAdminAssets"
import SuperAdminUsers from "./Dashboard/SuperAdmin/SuperAdminUsers"
import SuperAdminSettings from "./Dashboard/SuperAdmin/SuperAdminSettings"
import SuperAdminRequisitions from "./Dashboard/SuperAdmin/SuperAdminRequisitions"
import SuperAdminReports from "./Dashboard/SuperAdmin/SuperAdminReports"
import SuperAdminFacilities from "./Dashboard/SuperAdmin/SuperAdminFacilities"
import SuperAdminDispatches from "./Dashboard/SuperAdmin/SuperAdminDispatches"

function App() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => window.innerWidth <= 768;
    if (checkIfMobile()) {
      setIsSidebarCollapsed(true);
    }
  }, []);

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  const location = useLocation();

  const hideLayout =
    location.pathname === "/" ||
    location.pathname === "/signup" ||
    location.pathname === "/forgot-password";

  return (
    <>
      {hideLayout ? (
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      ) : (
        <>
          <Navbar toggleSidebar={toggleSidebar} />
          <div className="main-content">
            <Sidebar
              collapsed={isSidebarCollapsed}
              setCollapsed={setIsSidebarCollapsed}
            />
            <div
              className={`right-side-content ${
                isSidebarCollapsed ? "collapsed" : ""
              }`}
            >
              
              <Routes>
                {/* <Route path="okrs/departmentokrs" element={<DepartmentOKRs />} /> */}

              <Route path="/profile" element={<Profile/>}/>
              <Route path="/SuperAdminDashboard"element={<SuperAdminDashboard/>}/>
              {/* <Route path="/InventoryManagement"element={<InventoryManagement/>}/> */}
               <Route path="/SuperAdminDispatches"element={<SuperAdminDispatches/>}/>
               <Route path="/SuperAdminFacilities"element={<SuperAdminFacilities/>}/>
               <Route path="/SuperAdminReports"element={<SuperAdminReports/>}/>
                <Route path="/SuperAdminRequisitions"element={<SuperAdminRequisitions/>}/>
                 <Route path="/SuperAdminSettings"element={<SuperAdminSettings/>}/>
                  <Route path="/SuperAdminUsers"element={<SuperAdminUsers/>}/>
                   <Route path="/SuperAdminAssets"element={<SuperAdminAssets/>}/>

             
              </Routes>


            </div>
          </div>
        </>
      )}
    </>
  );
}

export default App;
