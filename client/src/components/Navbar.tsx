import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useSettings } from "../contexts/SettingsContext";
import { FormEvent, useState } from "react";
import ErrorHandler from "../handler/ErrorHandler";
import SpinnerSmall from "./SpinnerSmall";
import "./Navbar.css";

const Navbar = () => {
  const { logout, userRole, user, hasPermission } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [loadingLogout, setLoadingLogout] = useState(false);

  const menuItems = [
    // POS Features - Available to all roles with create_transaction permission
    {
      route: "/pos",
      title: "Point of Sale",
      roles: ["admin", "manager", "cashier"],
      permissions: ["create_transaction"],
    },
    // Product Management
    {
      route: "/products",
      title: "Products",
      roles: ["admin", "manager"],
      permissions: ["view_product"],
    },
    // Inventory Management
    {
      route: "/inventory",
      title: "Inventory",
      roles: ["admin", "manager"],
      permissions: ["view_inventory"],
    },
    // Transaction History
    {
      route: "/transactions",
      title: "Transactions",
      roles: ["admin", "manager", "cashier"],
      permissions: ["view_transaction"],
    },
    // Reports and Analytics
    {
      route: "/reports",
      title: "Reports",
      roles: ["admin", "manager"],
      permissions: ["view_reports"],
    },
    // User Management
    {
      route: "/users",
      title: "Users",
      roles: ["admin"],
      permissions: ["manage_users"],
    },
    // Settings
    {
      route: "/settings",
      title: "Settings",
      roles: ["admin"],
      permissions: ["manage_settings"],
    },
  ];

  const handleLogout = (e: FormEvent) => {
    e.preventDefault();
    setLoadingLogout(true);

    logout()
      .then(() => {
        navigate("/login");
      })
      .catch((error) => {
        ErrorHandler(error, null);
      })
      .finally(() => {
        setLoadingLogout(false);
      });
  };

  const handleUserFullName = () => {
    if (!user) return "";
    const name_parts = [
      user.first_name,
      user.middle_name ? user.middle_name.charAt(0) + "." : "",
      user.last_name,
    ].filter(Boolean);
    return name_parts.join(" ");
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return "bg-danger";
      case "manager":
        return "bg-success";
      case "cashier":
        return "bg-primary";
      default:
        return "bg-secondary";
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
      <div className="container-fluid">
        <Link className="navbar-brand text-primary fw-bold" to="/">
          {settings.find((s) => s.key === "store_name")?.value || "POS System"}
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {menuItems.map((item, index) => {
              const hasRequiredRole = item.roles.includes(
                userRole.toLowerCase()
              );
              const hasRequiredPermissions =
                item.permissions.every(hasPermission);

              if (hasRequiredRole && hasRequiredPermissions) {
                return (
                  <li className="nav-item" key={index}>
                    <Link
                      className="nav-link text-dark hover-primary"
                      to={item.route}
                    >
                      {item.title}
                    </Link>
                  </li>
                );
              }
              return null;
            })}
          </ul>
          <div className="d-flex align-items-center">
            <span className="me-3 text-dark">
              <span
                className={`badge ${getRoleBadgeColor(
                  userRole
                )} me-2 text-white`}
              >
                {userRole}
              </span>
              {handleUserFullName()}
            </span>
            <button
              type="button"
              className="btn btn-outline-danger"
              onClick={handleLogout}
              disabled={loadingLogout}
            >
              {loadingLogout ? (
                <>
                  <SpinnerSmall /> Logging out...
                </>
              ) : (
                "Logout"
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
