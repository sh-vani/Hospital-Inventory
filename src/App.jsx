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
import SuperAdminInventory from "./Dashboard/SuperAdmin/SuperAdminInventory";
import WarehouseDashbaord from "./Dashboard/Warehouse/WarehouseDashbaord";
import AdminInventory from "./Dashboard/Warehouse/WarehouseInventory";
import WarehouseInventory from "./Dashboard/Warehouse/WarehouseInventory";
import WareHouseAssets from "./Dashboard/Warehouse/WareHouseAssets";
import WarehouseReports from "./Dashboard/Warehouse/WarehouseReports";
import WarehouseDispatches from "./Dashboard/Warehouse/WarehouseDispatches";
import WarehouseSettings from "./Dashboard/Warehouse/WarehouseSettings";
import WarehouseRequisitions from "./Dashboard/Warehouse/WarehouseRequisitions";

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
              <Route path="/superadmin/dashboard"element={<SuperAdminDashboard/>}/>
              <Route path="/superadmin/inventory"element={<SuperAdminInventory/>}/>
               <Route path="/superadmin/dispatches"element={<SuperAdminDispatches/>}/>
               <Route path="/superadmin/facilities"element={<SuperAdminFacilities/>}/>
               <Route path="/superadmin/reports"element={<SuperAdminReports/>}/>
                <Route path="/superadmin/requisitions"element={<SuperAdminRequisitions/>}/>
                 <Route path="/superadmin/settings"element={<SuperAdminSettings/>}/>
                  <Route path="/superadmin/users"element={<SuperAdminUsers/>}/>
                   <Route path="/superadmin/assets"element={<SuperAdminAssets/>}/>



                   {/*Warehouse Dashbaord  */}



                   <Route path="/warehouse/dashboard"element={<WarehouseDashbaord/>}/>
   <Route path="/warehouse/inventory"element={<WarehouseInventory/>}/>
   <Route path="/warehouse/assets"element={<WareHouseAssets/>}/>
<Route path="/warehouse/reports"element={<WarehouseReports/>}/>
    <Route path="/warehouse/dispatches"element={<WarehouseDispatches/>}/>   
    <Route path="/warehouse/settings"element={<WarehouseSettings/>}/>   
        <Route path="/warehouse/requisitions"element={<WarehouseRequisitions/>}/>      
              </Routes>


            </div>
          </div>
        </>
      )}
    </>
  );
}

export default App;
