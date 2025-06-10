import React, { useState } from "react";
import StoreSettings from "./StoreSettings";

const Settings: React.FC = () => {
  return (
    <div className="container-fluid px-4">
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-white py-3">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-0 text-primary">Settings</h5>
              <p className="text-muted mb-0 small">
                Configure your store settings
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body">
          <StoreSettings />
        </div>
      </div>
    </div>
  );
};

export default Settings;
