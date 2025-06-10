import React, { useState } from "react";
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

const StoreSettings: React.FC = () => {
  const { settings, updateSettings, isLoading } = useSettings();
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
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading settings...</span>
        </div>
      </div>
    );
  }

  // Filter only store settings
  const storeSettings = settings.filter((setting) => setting.group === "store");

  return (
    <div className="row">
      {storeSettings.map((setting) => (
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
  );
};

export default StoreSettings;
