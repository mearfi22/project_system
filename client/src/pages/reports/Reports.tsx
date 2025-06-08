import { useState } from "react";

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState("sales");
  const [dateRange, setDateRange] = useState("today");

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Reports & Analytics</h1>
        <div>
          <button className="btn btn-primary me-2">Export PDF</button>
          <button className="btn btn-success">Export Excel</button>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-3">
          <select
            className="form-select"
            value={selectedReport}
            onChange={(e) => setSelectedReport(e.target.value)}
          >
            <option value="sales">Sales Report</option>
            <option value="inventory">Inventory Report</option>
            <option value="cashier">Cashier Performance</option>
            <option value="products">Product Performance</option>
          </select>
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Total Sales</h5>
              <p className="display-6">₱0.00</p>
              <small className="text-muted">+0% from previous period</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Total Transactions</h5>
              <p className="display-6">0</p>
              <small className="text-muted">+0% from previous period</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Average Sale</h5>
              <p className="display-6">₱0.00</p>
              <small className="text-muted">+0% from previous period</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Total Profit</h5>
              <p className="display-6">₱0.00</p>
              <small className="text-muted">+0% from previous period</small>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-8">
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Sales Trend</h5>
              <div
                style={{ height: "300px" }}
                className="d-flex align-items-center justify-content-center"
              >
                <p className="text-muted">Chart will be implemented here</p>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Top Products</h5>
              <div className="list-group">
                <div className="list-group-item">
                  <div className="d-flex w-100 justify-content-between">
                    <h6 className="mb-1">Product 1</h6>
                    <small>₱0.00</small>
                  </div>
                  <small className="text-muted">0 units sold</small>
                </div>
                <div className="list-group-item">
                  <div className="d-flex w-100 justify-content-between">
                    <h6 className="mb-1">Product 2</h6>
                    <small>₱0.00</small>
                  </div>
                  <small className="text-muted">0 units sold</small>
                </div>
                <div className="list-group-item">
                  <div className="d-flex w-100 justify-content-between">
                    <h6 className="mb-1">Product 3</h6>
                    <small>₱0.00</small>
                  </div>
                  <small className="text-muted">0 units sold</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
