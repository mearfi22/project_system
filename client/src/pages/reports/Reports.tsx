import React, { useState, useEffect } from "react";
import AxiosInstance from "../../utils/AxiosInstance";
import { Line, Bar } from "react-chartjs-2";
import { useAuth } from "../../contexts/AuthContext";
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
import { format } from "date-fns";
import "./Reports.css";

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

interface SalesDataItem {
  date: string;
  total_sales: number;
  total_transactions: number;
  average_sale: number;
}

interface TopProduct {
  product_id: number;
  product_name: string;
  total_quantity: number;
  total_revenue: number;
}

interface FeedbackData {
  transactions: {
    id: number;
    reference_number: string;
    customer_name: string | null;
    satisfaction_rating: number;
    feedback: string | null;
    created_at: string;
  }[];
  summary: {
    average_rating: number;
    total_feedback: number;
    rating_distribution: {
      [key: number]: number;
    };
  };
}

interface InventoryItem {
  id: number;
  name: string;
  stock_quantity: number;
  alert_threshold: number;
  stock_value?: number;
  price?: number;
}

interface InventoryData {
  current_inventory: InventoryItem[];
  low_stock_alerts: InventoryItem[];
  inventory_movement: {
    product_id: number;
    product: {
      id: number;
      name: string;
    };
    total_quantity: number;
    total_value: number;
  }[];
  summary: {
    total_products: number;
    total_stock_value: number;
    low_stock_count: number;
    average_stock_value: number;
  };
}

interface ReportData {
  period: string;
  start_date: string;
  end_date: string;
  sales_data: SalesDataItem[];
  top_products: TopProduct[];
  feedback_data?: FeedbackData;
  summary: {
    total_sales: number;
    total_transactions: number;
    average_sale: number;
  };
}

const Reports = () => {
  const { user } = useAuth();
  const [selectedReport, setSelectedReport] = useState<
    "sales" | "inventory" | "feedback"
  >("sales");
  const [dateRange, setDateRange] = useState("today");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [salesData, setSalesData] = useState<ReportData | null>(null);
  const [inventoryData, setInventoryData] = useState<InventoryData | null>(
    null
  );
  const [feedbackData, setFeedbackData] = useState<FeedbackData | null>(null);
  const [salesView, setSalesView] = useState<"sales" | "transactions">("sales");
  const [productsView, setProductsView] = useState<"revenue" | "quantity">(
    "revenue"
  );
  const [inventoryView, setInventoryView] = useState<"total" | "low">("total");
  const [sortBy, setSortBy] = useState<"stock" | "name">("stock");

  useEffect(() => {
    // Check if user and role exist before checking permissions
    const hasPermission =
      user?.role?.permissions?.includes("view_reports") ?? false;

    if (hasPermission) {
      if (selectedReport === "sales") {
        fetchReportData();
      } else if (selectedReport === "inventory") {
        fetchInventoryData();
      } else if (selectedReport === "feedback") {
        fetchFeedbackData();
      }
    } else {
      setError("You don't have permission to view reports");
      setLoading(false);
    }
  }, [selectedReport, dateRange, user]);

  const fetchReportData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await AxiosInstance.get(
        `/api/reports/sales?period=${dateRange}`
      );
      console.log("Sales report data:", response.data);

      // Validate the response data and ensure product data is valid
      if (
        !response.data ||
        !response.data.sales_data ||
        !response.data.top_products ||
        !response.data.summary
      ) {
        throw new Error("Invalid sales report data received from server");
      }

      // Validate each top product has valid product data
      const validatedTopProducts = response.data.top_products.map(
        (item: TopProduct) => ({
          ...item,
          product_name: item.product_name || "Unknown Product",
        })
      );

      setSalesData({
        ...response.data,
        top_products: validatedTopProducts,
      });
    } catch (error: any) {
      console.error("Error fetching report data:", error);
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch report data"
      );
      // Clear the data when there's an error
      setSalesData(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchInventoryData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await AxiosInstance.get("/api/reports/inventory");
      console.log("Inventory report data:", response.data);

      // Validate the response data
      if (
        !response.data ||
        !response.data.current_inventory ||
        !response.data.low_stock_alerts ||
        !response.data.summary
      ) {
        throw new Error("Invalid inventory report data received from server");
      }

      // Ensure each inventory item has a valid name
      const validatedInventory = {
        ...response.data,
        current_inventory: response.data.current_inventory.map(
          (item: InventoryItem) => ({
            ...item,
            name: item.name || "Unnamed Product",
          })
        ),
        low_stock_alerts: response.data.low_stock_alerts.map(
          (item: InventoryItem) => ({
            ...item,
            name: item.name || "Unnamed Product",
          })
        ),
      };

      setInventoryData(validatedInventory);
    } catch (error: any) {
      console.error("Error fetching inventory data:", error);
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch inventory data"
      );
      setInventoryData(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedbackData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await AxiosInstance.get("/api/reports/feedback");
      console.log("Raw Feedback API Response:", response.data);

      // Validate the response data
      if (
        !response.data ||
        !response.data.transactions ||
        !response.data.summary
      ) {
        throw new Error("Invalid feedback report data received from server");
      }

      setFeedbackData(response.data);
    } catch (error: any) {
      console.error("Error fetching feedback data:", error);
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch feedback data"
      );
      setSalesData(null);
    } finally {
      setLoading(false);
    }
  };

  const salesChartData = {
    labels: salesData?.sales_data?.map((item) => item.date) || [],
    datasets: [
      {
        label: salesView === "sales" ? "Daily Sales" : "Number of Transactions",
        data:
          salesData?.sales_data?.map((item) =>
            salesView === "sales" ? item.total_sales : item.total_transactions
          ) || [],
        borderColor:
          salesView === "sales" ? "rgb(75, 192, 192)" : "rgb(255, 99, 132)",
        tension: 0.1,
      },
    ],
  };

  const topProductsChartData = {
    labels: salesData?.top_products?.map((item) => item.product_name) || [],
    datasets: [
      {
        label: productsView === "revenue" ? "Revenue" : "Quantity",
        data:
          salesData?.top_products?.map((item) =>
            productsView === "revenue"
              ? item.total_revenue
              : item.total_quantity
          ) || [],
        backgroundColor: "rgba(75, 192, 192, 0.5)",
      },
    ],
  };

  const inventoryCategoryChartData = {
    labels: inventoryData?.current_inventory?.map((item) => item.name) || [],
    datasets: [
      {
        label: inventoryView === "total" ? "Total Stock" : "Low Stock Items",
        data:
          inventoryData?.current_inventory?.map((item) =>
            inventoryView === "total"
              ? item.stock_quantity
              : item.stock_quantity <= item.alert_threshold
              ? item.stock_quantity
              : 0
          ) || [],
        backgroundColor:
          inventoryView === "total"
            ? "rgba(75, 192, 192, 0.5)"
            : "rgba(255, 99, 132, 0.5)",
      },
    ],
  };

  const getSortedLowStockItems = () => {
    if (!inventoryData?.low_stock_alerts) return [];

    return [...inventoryData.low_stock_alerts].sort((a, b) => {
      if (sortBy === "stock") {
        return a.stock_quantity - b.stock_quantity;
      }
      return a.name.localeCompare(b.name);
    });
  };

  const chartOptions = {
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  const renderFeedbackSection = () => {
    if (!salesData?.feedback_data) return null;

    const { transactions, summary } = salesData.feedback_data;

    console.log("Rendering feedback section with data:", {
      transactions: transactions.map((item) => ({
        rating: item.satisfaction_rating,
        count: 1,
      })),
      average_rating: summary.average_rating,
    });

    const chartData = {
      labels: Object.keys(summary.rating_distribution).map(
        (rating) => `${rating} Stars`
      ),
      datasets: [
        {
          label: "Number of Ratings",
          data: Object.values(summary.rating_distribution),
          backgroundColor: "rgba(255, 206, 86, 0.5)",
        },
      ],
    };

    return (
      <div className="feedback-section">
        <div className="row mb-4">
          <div className="col-md-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Overall Rating</h5>
                <div className="d-flex align-items-center">
                  <h2 className="mb-0 me-2">
                    {summary.average_rating.toFixed(1)}
                  </h2>
                  <div className="text-warning fs-4">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <i
                        key={index}
                        className={`bi bi-star${
                          index + 1 <= Math.round(summary.average_rating)
                            ? "-fill"
                            : ""
                        }`}
                      ></i>
                    ))}
                  </div>
                </div>
                <p className="text-muted mb-0">
                  Based on {summary.total_feedback} reviews
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-8">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Rating Distribution</h5>
                <div className="rating-bars">
                  {Object.entries(summary.rating_distribution).map(
                    ([rating, count]) => (
                      <div
                        key={rating}
                        className="d-flex align-items-center mb-2"
                      >
                        <div className="text-warning me-2">
                          {rating} <i className="bi bi-star-fill"></i>
                        </div>
                        <div
                          className="progress flex-grow-1"
                          style={{ height: "20px" }}
                        >
                          <div
                            className="progress-bar bg-warning"
                            style={{
                              width: `${
                                (count / summary.total_feedback) * 100
                              }%`,
                            }}
                          ></div>
                        </div>
                        <div className="ms-2">{count} reviews</div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Recent Feedback</h5>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th className="text-center">Date</th>
                    <th className="text-center">Rating</th>
                    <th className="text-center">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="text-center">
                        {format(new Date(transaction.created_at), "PPp")}
                      </td>
                      <td className="text-center">
                        <div className="text-warning">
                          {Array.from({
                            length: transaction.satisfaction_rating,
                          }).map((_, i) => (
                            <i key={i} className="bi bi-star-fill"></i>
                          ))}
                        </div>
                      </td>
                      <td className="text-center">{1}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderFeedbackReport = () => {
    if (!feedbackData) return null;

    const { transactions, summary } = feedbackData;

    // Create data for the chart
    const chartData = {
      labels: Object.keys(summary.rating_distribution).map(
        (rating) => `${rating} Stars`
      ),
      datasets: [
        {
          label: "Number of Ratings",
          data: Object.values(summary.rating_distribution),
          backgroundColor: "rgba(255, 206, 86, 0.5)",
        },
      ],
    };

    return (
      <div className="row g-4">
        <div className="col-md-8">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h6 className="card-title mb-4">Rating Distribution</h6>
              <Bar data={chartData} />
              <div className="table-responsive mt-4">
                <table className="table table-hover align-middle mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th>Date</th>
                      <th>Reference #</th>
                      <th>Customer</th>
                      <th className="text-center">Rating</th>
                      <th>Feedback</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td>
                          {format(
                            new Date(transaction.created_at),
                            "MMM d, yyyy"
                          )}
                        </td>
                        <td>{transaction.reference_number}</td>
                        <td>
                          {transaction.customer_name || "Walk-in Customer"}
                        </td>
                        <td className="text-center">
                          {transaction.satisfaction_rating}
                        </td>
                        <td>{transaction.feedback || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm border-0">
            <div className="card-body text-center">
              <h6 className="card-title mb-4">Average Rating</h6>
              <div className="display-4 mb-2">
                {summary.average_rating.toFixed(1)}
              </div>
              <div className="text-warning h4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <i
                    key={index}
                    className={`bi bi-star${
                      index + 1 <= Math.round(summary.average_rating)
                        ? "-fill"
                        : ""
                    }`}
                  ></i>
                ))}
              </div>
              <div className="text-muted mt-2">
                Based on {summary.total_feedback} ratings
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="reports-loading">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reports-error">
        <i className="bi bi-exclamation-triangle me-2"></i>
        {error}
      </div>
    );
  }

  const renderSalesReport = () => {
    return (
      <>
        <div className="summary-stats">
          <div className="stat-card">
            <div className="stat-title">Total Sales</div>
            <div className="stat-value">
              ₱{salesData?.summary?.total_sales?.toFixed(2) || "0.00"}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Transactions</div>
            <div className="stat-value">
              {salesData?.summary?.total_transactions || 0}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Average Sale</div>
            <div className="stat-value">
              ₱{salesData?.summary?.average_sale?.toFixed(2) || "0.00"}
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-8">
            <div className="chart-card">
              <div className="card-body">
                <div className="chart-controls">
                  <h5 className="card-title">Sales Trend</h5>
                  <div className="btn-group">
                    <button
                      type="button"
                      className={`btn ${
                        dateRange === "today"
                          ? "btn-primary"
                          : "btn-outline-primary"
                      }`}
                      onClick={() => setDateRange("today")}
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      className={`btn ${
                        dateRange === "week"
                          ? "btn-primary"
                          : "btn-outline-primary"
                      }`}
                      onClick={() => setDateRange("week")}
                    >
                      Week
                    </button>
                    <button
                      type="button"
                      className={`btn ${
                        dateRange === "month"
                          ? "btn-primary"
                          : "btn-outline-primary"
                      }`}
                      onClick={() => setDateRange("month")}
                    >
                      Month
                    </button>
                  </div>
                </div>
                <Line data={salesChartData} options={chartOptions} />
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="chart-card">
              <div className="card-body">
                <div className="chart-controls">
                  <h5 className="card-title">Top Products</h5>
                  <div className="btn-group">
                    <button
                      type="button"
                      className={`btn ${
                        productsView === "revenue"
                          ? "btn-primary"
                          : "btn-outline-primary"
                      }`}
                      onClick={() => setProductsView("revenue")}
                    >
                      Revenue
                    </button>
                    <button
                      type="button"
                      className={`btn ${
                        productsView === "quantity"
                          ? "btn-primary"
                          : "btn-outline-primary"
                      }`}
                      onClick={() => setProductsView("quantity")}
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

        <div className="row">
          <div className="col-12">
            <div className="table-card">
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
                      {salesData?.top_products?.map((product) => (
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
      </>
    );
  };

  const renderInventoryReport = () => {
    return (
      <>
        <div className="summary-stats">
          <div className="stat-card">
            <div className="stat-title">Total Products</div>
            <div className="stat-value">
              {inventoryData?.summary?.total_products || 0}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Total Stock Value</div>
            <div className="stat-value">
              ₱{inventoryData?.summary?.total_stock_value?.toFixed(2) || "0.00"}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Low Stock Items</div>
            <div className="stat-value">
              {inventoryData?.summary?.low_stock_count || 0}
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <div className="table-card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5>Inventory Status</h5>
                <div className="btn-group">
                  <button
                    type="button"
                    className={`btn ${
                      inventoryView === "total"
                        ? "btn-primary"
                        : "btn-outline-primary"
                    }`}
                    onClick={() => setInventoryView("total")}
                  >
                    All Items
                  </button>
                  <button
                    type="button"
                    className={`btn ${
                      inventoryView === "low"
                        ? "btn-primary"
                        : "btn-outline-primary"
                    }`}
                    onClick={() => setInventoryView("low")}
                  >
                    Low Stock
                  </button>
                </div>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th className="text-end">Stock</th>
                        <th className="text-end">Alert Threshold</th>
                        <th className="text-end">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(inventoryView === "low"
                        ? inventoryData?.low_stock_alerts
                        : inventoryData?.current_inventory
                      )?.map((item) => (
                        <tr key={item.id}>
                          <td>{item.name}</td>
                          <td className="text-end">{item.stock_quantity}</td>
                          <td className="text-end">{item.alert_threshold}</td>
                          <td className="text-end">
                            ₱{Number(item.stock_value || 0).toFixed(2)}
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
      </>
    );
  };

  return (
    <div className="container-fluid py-4">
      <div className="reports-header">
        <h1>Reports</h1>
        <p>View detailed insights about your business performance</p>
      </div>

      <div className="report-nav">
        <div className="btn-group">
          <button
            type="button"
            className={`btn ${
              selectedReport === "sales" ? "btn-primary" : "btn-outline-primary"
            }`}
            onClick={() => setSelectedReport("sales")}
          >
            Sales Report
          </button>
          <button
            type="button"
            className={`btn ${
              selectedReport === "inventory"
                ? "btn-primary"
                : "btn-outline-primary"
            }`}
            onClick={() => setSelectedReport("inventory")}
          >
            Inventory Report
          </button>
          <button
            type="button"
            className={`btn ${
              selectedReport === "feedback"
                ? "btn-primary"
                : "btn-outline-primary"
            }`}
            onClick={() => setSelectedReport("feedback")}
          >
            Feedback Report
          </button>
        </div>
      </div>

      {selectedReport === "sales" && renderSalesReport()}
      {selectedReport === "inventory" && renderInventoryReport()}
      {selectedReport === "feedback" && renderFeedbackReport()}
    </div>
  );
};

export default Reports;
