import { useState } from "react";
import { toast } from "react-toastify";
import { useSettings } from "../../contexts/SettingsContext";

interface Setting {
  id: number;
  key: string;
  value: string;
  type: string;
  group: string;
  label: string;
  description: string | null;
}

interface EditingValues {
  [key: string]: string;
}

const Settings = () => {
  const { settings, updateSettings, isLoading } = useSettings();
  const [activeTab, setActiveTab] = useState("store");
  const [saving, setSaving] = useState<{ [key: string]: boolean }>({});
  const [editingValues, setEditingValues] = useState<EditingValues>({});

  const handleSettingChange = (key: string, value: string) => {
    setEditingValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveSetting = async (setting: Setting) => {
    try {
      setSaving((prev) => ({ ...prev, [setting.key]: true }));
      const newValue = editingValues[setting.key];
      await updateSettings(setting.key, newValue);
      toast.success("Setting updated successfully");
    } catch (error) {
      toast.error("Failed to update setting");
    } finally {
      setSaving((prev) => ({ ...prev, [setting.key]: false }));
    }
  };

  const getEditingValue = (setting: Setting) => {
    return editingValues[setting.key] !== undefined
      ? editingValues[setting.key]
      : setting.value;
  };

  const renderSettingInput = (setting: Setting) => {
    const isSaving = saving[setting.key];
    const hasChanges = getEditingValue(setting) !== setting.value;

    switch (setting.type) {
      case "boolean":
        return (
          <div className="input-group">
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                checked={getEditingValue(setting) === "true"}
                onChange={(e) =>
                  handleSettingChange(setting.key, String(e.target.checked))
                }
                disabled={isSaving}
              />
            </div>
            {hasChanges && (
              <button
                className="btn btn-primary btn-sm ms-2 d-flex align-items-center gap-2"
                onClick={() => handleSaveSetting(setting)}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <span className="spinner-border spinner-border-sm" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-check2"></i>
                    <span>Save</span>
                  </>
                )}
              </button>
            )}
          </div>
        );
      case "number":
        return (
          <div className="d-flex align-items-center gap-2">
            <input
              type="number"
              className="form-control"
              value={getEditingValue(setting)}
              onChange={(e) => handleSettingChange(setting.key, e.target.value)}
              disabled={isSaving}
            />
            {hasChanges && (
              <button
                className="btn btn-primary btn-sm d-flex align-items-center gap-2"
                onClick={() => handleSaveSetting(setting)}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <span className="spinner-border spinner-border-sm" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-check2"></i>
                    <span>Save</span>
                  </>
                )}
              </button>
            )}
          </div>
        );
      default:
        return (
          <div className="d-flex align-items-center gap-2">
            <input
              type="text"
              className="form-control"
              value={getEditingValue(setting)}
              onChange={(e) => handleSettingChange(setting.key, e.target.value)}
              disabled={isSaving}
            />
            {hasChanges && (
              <button
                className="btn btn-primary btn-sm d-flex align-items-center gap-2"
                onClick={() => handleSaveSetting(setting)}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <span className="spinner-border spinner-border-sm" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-check2"></i>
                    <span>Save</span>
                  </>
                )}
              </button>
            )}
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading settings...</span>
        </div>
      </div>
    );
  }

  // Group settings by their group
  const groupedSettings = settings.reduce((acc, setting) => {
    if (!acc[setting.group]) {
      acc[setting.group] = [];
    }
    acc[setting.group].push(setting);
    return acc;
  }, {} as { [key: string]: Setting[] });

  const groups = Object.keys(groupedSettings);

  return (
    <div className="container-fluid px-4">
      {/* Header Section */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-white py-3">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-0 text-primary">Settings Management</h5>
              <p className="text-muted mb-0 small">
                Configure your system settings
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Navigation */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <ul className="nav nav-pills mb-3">
            {groups.map((group) => (
              <li className="nav-item" key={group}>
                <button
                  className={`nav-link ${activeTab === group ? "active" : ""}`}
                  onClick={() => setActiveTab(group)}
                >
                  <i
                    className={`bi bi-${
                      group === "store"
                        ? "shop"
                        : group === "system"
                        ? "gear"
                        : "archive"
                    } me-2`}
                  ></i>
                  {group.charAt(0).toUpperCase() + group.slice(1)} Settings
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Settings Content */}
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <div className="tab-content">
            {groups.map((group) => (
              <div
                key={group}
                className={`tab-pane fade ${
                  activeTab === group ? "show active" : ""
                }`}
              >
                <div className="row">
                  {groupedSettings[group].map((setting) => (
                    <div className="col-md-6 mb-4" key={setting.id}>
                      <div className="card h-100 border-0 shadow-sm">
                        <div className="card-body">
                          <h6 className="card-title mb-3 d-flex align-items-center gap-2">
                            <i
                              className={`bi bi-${
                                setting.type === "boolean"
                                  ? "toggle-on"
                                  : setting.type === "number"
                                  ? "123"
                                  : "text-paragraph"
                              }`}
                            ></i>
                            {setting.label}
                          </h6>
                          {renderSettingInput(setting)}
                          {setting.description && (
                            <small className="text-muted d-block mt-2">
                              <i className="bi bi-info-circle me-1"></i>
                              {setting.description}
                            </small>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
