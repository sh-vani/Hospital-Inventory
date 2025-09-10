import React, { useState } from 'react';
import { 
  FaPlus, FaHospital, FaClinicMedical, FaFirstAid, FaWarehouse, FaMapMarkerAlt, FaPhone, FaEnvelope
} from 'react-icons/fa';

const SuperAdminFacilities = () => {
  // Mock data for facilities
  const [facilities, setFacilities] = useState([
    { 
      id: 1, 
      name: 'Main Warehouse', 
      type: 'Central Storage Facility', 
      icon: <FaWarehouse className="text-primary" />,
      address: '123 Industrial Area, Accra',
      phone: '+233 30 123 4567',
      email: 'warehouse@francisfosu.com'
    },
    { 
      id: 2, 
      name: 'Kumasi Branch Hospital', 
      type: 'Regional Facility', 
      icon: <FaHospital className="text-success" />,
      address: '456 Hospital Road, Kumasi',
      phone: '+233 32 234 5678',
      email: 'kumasi@francisfosu.com'
    },
    { 
      id: 3, 
      name: 'Accra Central Hospital', 
      type: 'Metropolitan Facility', 
      icon: <FaClinicMedical className="text-info" />,
      address: '789 Central Avenue, Accra',
      phone: '+233 30 345 6789',
      email: 'accra@francisfosu.com'
    },
    { 
      id: 4, 
      name: 'Takoradi Clinic', 
      type: 'Community Health Center', 
      icon: <FaFirstAid className="text-warning" />,
      address: '101 Health Street, Takoradi',
      phone: '+233 31 456 7890',
      email: 'takoradi@francisfosu.com'
    },
    { 
      id: 5, 
      name: 'Cape Coast Hospital', 
      type: 'Coastal Regional Facility', 
      icon: <FaHospital className="text-danger" />,
      address: '202 Coastal Road, Cape Coast',
      phone: '+233 33 567 8901',
      email: 'capecoast@francisfosu.com'
    }
  ]);
  
  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Facilities Management</h2>
        <button className="btn btn-primary d-flex align-items-center">
          <FaPlus className="me-2" /> Add New Facility
        </button>
      </div>
      
      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card border-0 shadow-sm h-100 stat-card">
            <div className="card-body text-center p-4">
              <div className="bg-primary bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                <FaHospital className="text-primary fa-2x" />
              </div>
              <div className="number text-primary fw-bold">5</div>
              <div className="label text-muted">Total Facilities</div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card border-0 shadow-sm h-100 stat-card">
            <div className="card-body text-center p-4">
              <div className="bg-success bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                <FaClinicMedical className="text-success fa-2x" />
              </div>
              <div className="number text-success fw-bold">2</div>
              <div className="label text-muted">Hospitals</div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card border-0 shadow-sm h-100 stat-card">
            <div className="card-body text-center p-4">
              <div className="bg-warning bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                <FaFirstAid className="text-warning fa-2x" />
              </div>
              <div className="number text-warning fw-bold">2</div>
              <div className="label text-muted">Clinics</div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card border-0 shadow-sm h-100 stat-card">
            <div className="card-body text-center p-4">
              <div className="bg-info bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                <FaWarehouse className="text-info fa-2x" />
              </div>
              <div className="number text-info fw-bold">1</div>
              <div className="label text-muted">Warehouse</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Facilities Cards */}
      <div className="row">
        {facilities.map((facility) => (
          <div className="col-md-4 mb-4" key={facility.id}>
            <div className="card border-0 shadow-sm h-100 facility-card">
              <div className="card-body text-center p-4">
                <div className="bg-primary bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                  {React.cloneElement(facility.icon, { className: `${facility.icon.props.className} fa-3x` })}
                </div>
                <h5 className="fw-bold">{facility.name}</h5>
                <p className="text-muted">{facility.type}</p>
                <div className="text-start mt-3">
                  <div className="mb-2">
                    <small className="text-muted d-flex align-items-center">
                      <FaMapMarkerAlt className="me-2" />
                      {facility.address}
                    </small>
                  </div>
                  <div className="mb-2">
                    <small className="text-muted d-flex align-items-center">
                      <FaPhone className="me-2" />
                      {facility.phone}
                    </small>
                  </div>
                  <div>
                    <small className="text-muted d-flex align-items-center">
                      <FaEnvelope className="me-2" />
                      {facility.email}
                    </small>
                  </div>
                </div>
                <div className="d-grid gap-2 mt-3">
                  <button className="btn btn-outline-primary">Manage</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuperAdminFacilities;