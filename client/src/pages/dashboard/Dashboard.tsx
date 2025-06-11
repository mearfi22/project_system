import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Line, Bar } from "react-chartjs-2";
import { toast } from "react-toastify";
import AxiosInstance from "../../utils/AxiosInstance";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
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
        borderColor: "#0d6efd",
        backgroundColor: "rgba(13, 110, 253, 0.1)",
        tension: 0.4,
        fill: true,
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
        backgroundColor: "rgba(13, 110, 253, 0.7)",
        borderRadius: 4,
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
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "80vh" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (userRole.toLowerCase() === "cashier") {
    return (
      <div className="cashier-dashboard">
        <div className="pos-button-card" onClick={() => navigate("/pos")}>
          <div className="icon">
            <i className="bi bi-cart3"></i>
          </div>
          <div className="title">Open Point of Sale</div>
          <div className="subtitle">Click to start a new transaction</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome back! Here's your business overview.</p>
      </div>

      {/* Summary Cards */}
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="card summary-card">
            <div className="card-body">
              <h5 className="card-title">Today's Sales</h5>
              <p className="display-6">
                ₱{data?.summary?.total_sales?.toFixed(2) || "0.00"}
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card summary-card">
            <div className="card-body">
              <h5 className="card-title">Total Products</h5>
              <p className="display-6">{data?.summary?.total_products || 0}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card summary-card">
            <div className="card-body">
              <h5 className="card-title">Low Stock Items</h5>
              <p className="display-6">{data?.summary?.low_stock_count || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="row">
        <div className="col-md-8">
          <div className="card chart-card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="card-title">Sales Trend</h5>
                <div className="btn-group">
                  <button
                    type="button"
                    className={`btn ${
                      period === "daily" ? "btn-primary" : "btn-outline-primary"
                    }`}
                    onClick={() => setPeriod("daily")}
                  >
                    Daily
                  </button>
                  <button
                    type="button"
                    className={`btn ${
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
                    className={`btn ${
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
          <div className="card chart-card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="card-title">Top Products</h5>
                <div className="btn-group">
                  <button
                    type="button"
                    className={`btn ${
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
                    className={`btn ${
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
          <div className="card table-card">
            <div className="card-header">
              <h5>Top Products Details</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th className="text-end">Quantity Sold</th>
                      <th className="text-end">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.top_products?.map((product) => (
                      <tr key={product?.product_id || "unknown"}>
                        <td>{product?.product_name || "Unknown Product"}</td>
                        <td className="text-end">
                          {product?.total_quantity || 0}
                        </td>
                        <td className="text-end">
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
