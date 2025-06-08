import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { FormEvent, useState } from "react";
import ErrorHandler from "../handler/ErrorHandler";
import SpinnerSmall from "./SpinnerSmall";

const Navbar = () => {
  const { logout, userRole, user } = useAuth();
  const navigate = useNavigate();
  const [loadingLogout, setLoadingLogout] = useState(false);

  const menuItems = [
    // POS Features - Available to all roles
    {
      route: "/pos",
      title: "Point of Sale",
      roles: ["admin", "manager", "cashier"],
    },
    // Product Management
    {
      route: "/products",
      title: "Products",
      roles: ["admin", "manager"],
    },
    // Inventory Management
    {
      route: "/inventory",
      title: "Inventory",
      roles: ["admin", "manager"],
    },
    // Transaction History
    {
      route: "/transactions",
      title: "Transactions",
      roles: ["admin", "manager", "cashier"],
    },
    // Reports and Analytics
    {
      route: "/reports",
      title: "Reports",
      roles: ["admin", "manager"],
    },
    // User Management
    {
      route: "/users",
      title: "Users",
      roles: ["admin"],
    },
    // Settings
    {
      route: "/settings",
      title: "Settings",
      roles: ["admin"],
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

    let fullName = "";
    if (user.middle_name) {
      fullName = `${user.last_name}, ${user.first_name} ${user.middle_name[0]}.`;
    } else {
      fullName = `${user.last_name}, ${user.first_name}`;
    }

    return fullName;
  };

  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          POS System
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {menuItems
              .filter((item) => item.roles.includes(userRole.toLowerCase()))
              .map((menuItem, index) => (
                <li className="nav-item" key={index}>
                  <Link className="nav-link" to={menuItem.route}>
                    {menuItem.title}
                  </Link>
                </li>
              ))}
          </ul>
          <div className="d-flex align-items-center">
            <div className="me-3">
              <span className="badge bg-secondary me-2">{userRole}</span>
              <span>{handleUserFullName()}</span>
            </div>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleLogout}
              disabled={loadingLogout}
            >
              {loadingLogout ? (
                <>
                  <SpinnerSmall /> Logging Out...
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
