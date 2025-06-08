import { useState } from "react";

interface InventoryItem {
  id: number;
  name: string;
  quantity: number;
  reorderPoint: number;
  lastRestocked: string;
  status: "In Stock" | "Low Stock" | "Out of Stock";
}

const Inventory = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Inventory Management</h1>
        <div>
          <button className="btn btn-success me-2">Stock In</button>
          <button className="btn btn-warning">Stock Out</button>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <h5 className="card-title">Total Items</h5>
              <p className="display-6">0</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-warning text-white">
            <div className="card-body">
              <h5 className="card-title">Low Stock Items</h5>
              <p className="display-6">0</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-danger text-white">
            <div className="card-body">
              <h5 className="card-title">Out of Stock Items</h5>
              <p className="display-6">0</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="row mb-3">
            <div className="col-md-8">
              <input
                type="text"
                className="form-control"
                placeholder="Search inventory..."
              />
            </div>
            <div className="col-md-4">
              <select className="form-select">
                <option value="">All Status</option>
                <option value="in_stock">In Stock</option>
                <option value="low_stock">Low Stock</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Quantity</th>
                  <th>Reorder Point</th>
                  <th>Last Restocked</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center">
                      Loading...
                    </td>
                  </tr>
                ) : inventory.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center">
                      No inventory items found
                    </td>
                  </tr>
                ) : (
                  inventory.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.name}</td>
                      <td>{item.quantity}</td>
                      <td>{item.reorderPoint}</td>
                      <td>{item.lastRestocked}</td>
                      <td>
                        <span
                          className={`badge ${
                            item.status === "In Stock"
                              ? "bg-success"
                              : item.status === "Low Stock"
                              ? "bg-warning"
                              : "bg-danger"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-primary me-2">
                          Adjust Stock
                        </button>
                        <button className="btn btn-sm btn-info">History</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
