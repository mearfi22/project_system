import { useState } from "react";

interface StoreSettings {
  storeName: string;
  address: string;
  phone: string;
  email: string;
  taxRate: number;
  currency: string;
  receiptFooter: string;
}

const Settings = () => {
  const [activeTab, setActiveTab] = useState("store");
  const [storeSettings, setStoreSettings] = useState<StoreSettings>({
    storeName: "",
    address: "",
    phone: "",
    email: "",
    taxRate: 12,
    currency: "PHP",
    receiptFooter: "",
  });

  const handleStoreSettingsChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setStoreSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div>
      <h1 className="mb-4">Settings</h1>

      <div className="row">
        <div className="col-md-3">
          <div className="list-group">
            <button
              className={`list-group-item list-group-item-action ${
                activeTab === "store" ? "active" : ""
              }`}
              onClick={() => setActiveTab("store")}
            >
              Store Settings
            </button>
            <button
              className={`list-group-item list-group-item-action ${
                activeTab === "users" ? "active" : ""
              }`}
              onClick={() => setActiveTab("users")}
            >
              User Management
            </button>
            <button
              className={`list-group-item list-group-item-action ${
                activeTab === "backup" ? "active" : ""
              }`}
              onClick={() => setActiveTab("backup")}
            >
              Backup & Restore
            </button>
            <button
              className={`list-group-item list-group-item-action ${
                activeTab === "system" ? "active" : ""
              }`}
              onClick={() => setActiveTab("system")}
            >
              System Settings
            </button>
          </div>
        </div>

        <div className="col-md-9">
          {activeTab === "store" && (
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Store Settings</h5>
                <form>
                  <div className="mb-3">
                    <label className="form-label">Store Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="storeName"
                      value={storeSettings.storeName}
                      onChange={handleStoreSettingsChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Address</label>
                    <input
                      type="text"
                      className="form-control"
                      name="address"
                      value={storeSettings.address}
                      onChange={handleStoreSettingsChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Phone</label>
                    <input
                      type="text"
                      className="form-control"
                      name="phone"
                      value={storeSettings.phone}
                      onChange={handleStoreSettingsChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={storeSettings.email}
                      onChange={handleStoreSettingsChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Tax Rate (%)</label>
                    <input
                      type="number"
                      className="form-control"
                      name="taxRate"
                      value={storeSettings.taxRate}
                      onChange={handleStoreSettingsChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Currency</label>
                    <input
                      type="text"
                      className="form-control"
                      name="currency"
                      value={storeSettings.currency}
                      onChange={handleStoreSettingsChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Receipt Footer</label>
                    <textarea
                      className="form-control"
                      name="receiptFooter"
                      value={storeSettings.receiptFooter}
                      onChange={handleStoreSettingsChange}
                      rows={3}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary">
                    Save Changes
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">User Management</h5>
                <p className="text-muted">Manage user roles and permissions</p>
              </div>
            </div>
          )}

          {activeTab === "backup" && (
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Backup & Restore</h5>
                <div className="mb-4">
                  <h6>Create Backup</h6>
                  <p className="text-muted">
                    Create a backup of your system data
                  </p>
                  <button className="btn btn-primary">Create Backup</button>
                </div>
                <div>
                  <h6>Restore Data</h6>
                  <p className="text-muted">
                    Restore your system from a backup file
                  </p>
                  <div className="mb-3">
                    <input type="file" className="form-control" />
                  </div>
                  <button className="btn btn-warning">Restore Backup</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "system" && (
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">System Settings</h5>
                <p className="text-muted">Configure system-wide settings</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
