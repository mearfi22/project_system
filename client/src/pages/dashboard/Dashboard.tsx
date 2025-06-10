import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Line, Bar } from "react-chartjs-2";
import { toast } from "react-toastify";
import AxiosInstance from "../../utils/AxiosInstance";
import { useNavigate } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface TopProduct {
  product_id: number;
  product_name: string;
  total_quantity: number;
  total_revenue: number;
}

interface DashboardData {
  period: string;
  start_date: string;
  end_date: string;
  sales_data: {
    date: string;
    total_sales: number;
    total_transactions: number;
    average_sale: number;
  }[];
  top_products: TopProduct[];
  summary: {
    total_sales: number;
    total_transactions: number;
    average_sale: number;
    total_products: number;
    low_stock_count: number;
  };
}

const Dashboard = () => {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const [period, setPeriod] = useState("daily");
  const [productView, setProductView] = useState("revenue");

  useEffect(() => {
    if (userRole.toLowerCase() !== "cashier") {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [userRole, period]);

  const fetchDashboardData = async () => {
    try {
      const [salesResponse, inventoryResponse] = await Promise.all([
        AxiosInstance.get(`/api/reports/sales?period=${period}`),
        AxiosInstance.get("/api/reports/inventory"),
      ]);

      console.log("Dashboard data:", salesResponse.data);

      const validTopProducts =
        salesResponse.data.top_products?.filter(
          (item: TopProduct) => item && item.product_name
        ) || [];

      setData({
        ...salesResponse.data,
        top_products: validTopProducts,
        summary: {
          ...salesResponse.data.summary,
          low_stock_count: inventoryResponse.data.summary.low_stock_count,
        },
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const salesChartData = {
    labels: data?.sales_data?.map((item) => item.date) || [],
    datasets: [
      {
        label: "Daily Sales",
        data: data?.sales_data?.map((item) => item.total_sales) || [],
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  };

  const topProductsChartData = {
    labels: data?.top_products?.map((item) => item.product_name) || [],
    datasets: [
      {
        label: productView === "revenue" ? "Revenue" : "Quantity",
        data:
          data?.top_products?.map((item) =>
            productView === "revenue"
              ? item?.total_revenue
              : item?.total_quantity
          ) || [],
        backgroundColor: "rgba(75, 192, 192, 0.5)",
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: {
        display: false,
      },
    },
    responsive: true,
    maintainAspectRatio: true,
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Show large POS button for cashier role
  if (userRole.toLowerCase() === "cashier") {
    return (
      <div
        className="container-fluid py-4 d-flex align-items-center justify-content-center"
        style={{
          minHeight: "80vh",
          background: "linear-gradient(to right bottom, #f8f9fa, #ffffff)",
        }}
      >
        <div
          className="text-center p-5 rounded-4 shadow-sm"
          onClick={() => navigate("/pos")}
          style={{
            cursor: "pointer",
            background: "white",
            transition: "all 0.3s ease",
            transform: "translateY(0)",
            border: "1px solid rgba(0,0,0,0.1)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-5px)";
            e.currentTarget.style.boxShadow = "0 10px 20px rgba(0,0,0,0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
          }}
        >
          <div
            style={{
              fontSize: "3.5rem",
              color: "#0d6efd",
              marginBottom: "1rem",
            }}
          >
            <i className="bi bi-cart3"></i>
          </div>
          <div
            style={{
              fontSize: "1.75rem",
              fontWeight: "500",
              color: "#212529",
              letterSpacing: "0.5px",
            }}
          >
            Open Point of Sale
          </div>
          <div
            style={{
              fontSize: "1rem",
              color: "#6c757d",
              marginTop: "0.5rem",
            }}
          >
            Click to start a new transaction
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <h1 className="mb-4">Dashboard</h1>

      {/* Summary Cards */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Today's Sales</h5>
              <p className="card-text display-6">
                ₱{data?.summary?.total_sales?.toFixed(2) || "0.00"}
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Total Products</h5>
              <p className="card-text display-6">
                {data?.summary?.total_products || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Low Stock Items</h5>
              <p className="card-text display-6">
                {data?.summary?.low_stock_count || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="row">
        <div className="col-md-8">
          <div className="card mb-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="card-title mb-0">Sales Trend</h5>
                <div className="btn-group">
                  <button
                    type="button"
                    className={`btn btn-sm ${
                      period === "daily" ? "btn-primary" : "btn-outline-primary"
                    }`}
                    onClick={() => setPeriod("daily")}
                  >
                    Daily
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${
                      period === "weekly"
                        ? "btn-primary"
                        : "btn-outline-primary"
                    }`}
                    onClick={() => setPeriod("weekly")}
                  >
                    Weekly
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${
                      period === "monthly"
                        ? "btn-primary"
                        : "btn-outline-primary"
                    }`}
                    onClick={() => setPeriod("monthly")}
                  >
                    Monthly
                  </button>
                </div>
              </div>
              <Line data={salesChartData} options={chartOptions} />
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card mb-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="card-title mb-0">Top Products</h5>
                <div className="btn-group">
                  <button
                    type="button"
                    className={`btn btn-sm ${
                      productView === "revenue"
                        ? "btn-primary"
                        : "btn-outline-primary"
                    }`}
                    onClick={() => setProductView("revenue")}
                  >
                    Revenue
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${
                      productView === "quantity"
                        ? "btn-primary"
                        : "btn-outline-primary"
                    }`}
                    onClick={() => setProductView("quantity")}
                  >
                    Quantity
                  </button>
                </div>
              </div>
              <Bar data={topProductsChartData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* Top Products Table */}
      <div className="row">
        <div className="col-12">
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="card-title mb-0">Top Products Details</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th className="text-center">Product</th>
                      <th className="text-center">Quantity Sold</th>
                      <th className="text-center">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.top_products?.map((product) => (
                      <tr key={product?.product_id || "unknown"}>
                        <td className="text-center">
                          {product?.product_name || "Unknown Product"}
                        </td>
                        <td className="text-center">
                          {product?.total_quantity || 0}
                        </td>
                        <td className="text-center">
                          ₱{Number(product?.total_revenue || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
