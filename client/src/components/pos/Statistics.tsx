import React, { useState, useEffect } from "react";
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
  ChartData,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import AxiosInstance from "../../AxiosInstance";
import { useAuth } from "../../contexts/AuthContext";

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

interface SalesData {
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
  satisfaction_rating: number;
  count: number;
  average_rating: number;
}

const Statistics: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [feedbackData, setFeedbackData] = useState<FeedbackData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && hasPermission("view_reports")) {
      fetchData();
    }
  }, [user, hasPermission]);

  const fetchData = async () => {
    try {
      const [salesResponse, feedbackResponse] = await Promise.all([
        AxiosInstance.get("/api/sales/daily"),
        AxiosInstance.get("/api/reports/feedback"),
      ]);

      setSalesData(salesResponse.data);
      setTopProducts(salesResponse.data.top_products);
      setFeedbackData(feedbackResponse.data.rating_distribution);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch statistics:", error);
      setLoading(false);
    }
  };

  const salesChartData: ChartData<"line"> = {
    labels: salesData.map((data) => data.date),
    datasets: [
      {
        label: "Daily Sales",
        data: salesData.map((data) => data.total_sales),
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  };

  const productChartData: ChartData<"bar"> = {
    labels: topProducts.map((product) => product.product_name),
    datasets: [
      {
        label: "Revenue",
        data: topProducts.map((product) => product.total_revenue),
        backgroundColor: "rgba(54, 162, 235, 0.5)",
      },
    ],
  };

  const feedbackChartData: ChartData<"bar"> = {
    labels: feedbackData.map((data) => `${data.satisfaction_rating} Stars`),
    datasets: [
      {
        label: "Number of Ratings",
        data: feedbackData.map((data) => data.count),
        backgroundColor: "rgba(255, 206, 86, 0.5)",
      },
    ],
  };

  if (loading) {
    return <div>Loading statistics...</div>;
  }

  if (!user || !hasPermission("view_reports")) {
    return <div>You don't have permission to view reports.</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Daily Sales</h2>
          <Line data={salesChartData} />
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">
            Top Products by Revenue
          </h2>
          <Bar data={productChartData} />
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">
            Customer Feedback Distribution
          </h2>
          <Bar data={feedbackChartData} />
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Total Sales:</span>
              <span className="font-semibold">
                $
                {salesData
                  .reduce((sum, data) => sum + data.total_sales, 0)
                  .toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Total Transactions:</span>
              <span className="font-semibold">
                {salesData.reduce(
                  (sum, data) => sum + data.total_transactions,
                  0
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Average Sale:</span>
              <span className="font-semibold">
                $
                {(
                  salesData.reduce((sum, data) => sum + data.average_sale, 0) /
                  salesData.length
                ).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Average Rating:</span>
              <span className="font-semibold">
                {(
                  feedbackData.reduce(
                    (sum, data) => sum + data.satisfaction_rating * data.count,
                    0
                  ) / feedbackData.reduce((sum, data) => sum + data.count, 0)
                ).toFixed(1)}{" "}
                / 5
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
