import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./pages/login/Login";
import ProtectedRoute from "./components/ProtectedRoutes";
import Dashboard from "./pages/dashboard/Dashboard";
import POS from "./pages/pos/POS";
import Products from "./pages/Products";
import Inventory from "./pages/inventory/Inventory";
import Transactions from "./pages/transactions/Transactions";
import Reports from "./pages/reports/Reports";
import Users from "./pages/user/Users";
import Settings from "./pages/settings/Settings";
import Layout from "./components/Layout";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CartProvider } from "./contexts/CartContext";
import { SettingsProvider } from "./contexts/SettingsContext";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout>
          <Dashboard />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/pos",
    element: (
      <ProtectedRoute
        allowedRoles={["admin", "manager", "cashier"]}
        requiredPermissions={["create_transaction"]}
      >
        <Layout>
          <POS />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/products",
    element: (
      <ProtectedRoute
        allowedRoles={["admin", "manager"]}
        requiredPermissions={["view_product"]}
      >
        <Layout>
          <Products />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/inventory",
    element: (
      <ProtectedRoute
        allowedRoles={["admin", "manager"]}
        requiredPermissions={["view_inventory"]}
      >
        <Layout>
          <Inventory />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/transactions",
    element: (
      <ProtectedRoute
        allowedRoles={["admin", "manager", "cashier"]}
        requiredPermissions={["view_transaction"]}
      >
        <Layout>
          <Transactions />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/reports",
    element: (
      <ProtectedRoute
        allowedRoles={["admin", "manager"]}
        requiredPermissions={["view_reports"]}
      >
        <Layout>
          <Reports />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/users",
    element: (
      <ProtectedRoute
        allowedRoles={["admin"]}
        requiredPermissions={["manage_users"]}
      >
        <Layout>
          <Users />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/settings",
    element: (
      <ProtectedRoute
        allowedRoles={["admin"]}
        requiredPermissions={["manage_settings"]}
      >
        <Layout>
          <Settings />
        </Layout>
      </ProtectedRoute>
    ),
  },
]);

const App = () => {
  return (
    <SettingsProvider>
      <CartProvider>
        <RouterProvider router={router} />
        <ToastContainer />
      </CartProvider>
    </SettingsProvider>
  );
};

export default App;
