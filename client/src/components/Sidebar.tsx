import React from "react";
import { Link, useLocation } from "react-router-dom";

interface NavItem {
  path: string;
  name: string;
  icon: string;
}

const navigation: NavItem[] = [
  {
    path: "/",
    name: "Dashboard",
    icon: "bi bi-speedometer2",
  },
  {
    path: "/pos",
    name: "POS",
    icon: "bi bi-cart3",
  },
  {
    path: "/products",
    name: "Products",
    icon: "bi bi-box-seam",
  },
  {
    path: "/inventory",
    name: "Inventory",
    icon: "bi bi-boxes",
  },
  {
    path: "/transactions",
    name: "Transactions",
    icon: "bi bi-receipt",
  },
  {
    path: "/users",
    name: "Users",
    icon: "bi bi-people",
  },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="sidebar bg-dark text-white">
      <div className="d-flex flex-column p-3 h-100">
        <Link
          to="/"
          className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none"
        >
          <span className="fs-4">POS System</span>
        </Link>
        <hr />
        <ul className="nav nav-pills flex-column mb-auto">
          {navigation.map((item) => (
            <li key={item.path} className="nav-item">
              <Link
                to={item.path}
                className={`nav-link text-white ${
                  location.pathname === item.path ? "active" : ""
                }`}
              >
                <i className={`${item.icon} me-2`}></i>
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
