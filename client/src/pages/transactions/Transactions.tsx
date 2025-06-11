import { useState, useEffect } from "react";
import { Transaction } from "../../types/Transaction";
import TransactionService from "../../services/TransactionService";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { Modal, Button, Form, InputGroup } from "react-bootstrap";
import printReceipt from "../../utils/PrintReceipt";
import { useAuth } from "../../contexts/AuthContext";
import { FaSearch, FaPrint, FaEye, FaBan } from "react-icons/fa";
import "./Transactions.css";

const Transactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showVoidModal, setShowVoidModal] = useState(false);
  const [transactionToVoid, setTransactionToVoid] =
    useState<Transaction | null>(null);
  const { hasPermission } = useAuth();

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await TransactionService.getTransactions();
      setTransactions(response.data);
    } catch (error: any) {
      console.error("Error fetching transactions:", error.response || error);
      toast.error(
        error.response?.data?.error || "Failed to fetch transactions"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleViewTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowViewModal(true);
  };

  const handlePrintReceipt = async (transaction: Transaction) => {
    try {
      const response = await TransactionService.getReceipt(transaction.id);
      printReceipt(response.data);
    } catch (error: any) {
      console.error("Error printing receipt:", error);
      toast.error("Failed to print receipt");
    }
  };

  const handleVoidClick = (transaction: Transaction) => {
    if (!hasPermission("void_transaction")) {
      toast.error(
        "You don't have permission to void transactions. Please contact a manager or admin."
      );
      return;
    }
    setTransactionToVoid(transaction);
    setShowVoidModal(true);
  };

  const handleVoidTransaction = async () => {
    if (!transactionToVoid) return;

    try {
      await TransactionService.voidTransaction(transactionToVoid.id);
      toast.success("Transaction voided successfully");
      fetchTransactions();
      setShowVoidModal(false);
      setTransactionToVoid(null);
    } catch (error: any) {
      console.error("Error voiding transaction:", error.response || error);
      if (error.response?.status === 403) {
        toast.error(
          "You don't have permission to void transactions. Please contact a manager or admin."
        );
      } else {
        toast.error(
          error.response?.data?.error || "Failed to void transaction"
        );
      }
    }
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      !searchTerm ||
      transaction.customer_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      transaction.reference_number
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesDate =
      !dateFilter ||
      format(new Date(transaction.created_at), "yyyy-MM-dd") === dateFilter;

    const matchesPaymentMethod =
      !paymentMethodFilter ||
      transaction.payment_method === paymentMethodFilter;

    const matchesStatus =
      !statusFilter || transaction.payment_status === statusFilter;

    return (
      matchesSearch && matchesDate && matchesPaymentMethod && matchesStatus
    );
  });

  const renderViewModal = () => {
    if (!selectedTransaction) return null;

    return (
      <Modal
        show={showViewModal}
        onHide={() => setShowViewModal(false)}
        size="lg"
        className="transaction-modal"
      >
        <Modal.Header closeButton className="bg-white py-3">
          <Modal.Title className="mb-0">Transaction Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="transaction-details">
            <div className="row mb-4">
              <div className="col-md-6">
                <div className="detail-group">
                  <h6 className="detail-label">Reference Number</h6>
                  <p className="detail-value">
                    {selectedTransaction.reference_number}
                  </p>
                </div>
              </div>
              <div className="col-md-6">
                <div className="detail-group">
                  <h6 className="detail-label">Date</h6>
                  <p className="detail-value">
                    {format(new Date(selectedTransaction.created_at), "PPp")}
                  </p>
                </div>
              </div>
            </div>

            <div className="row mb-4">
              <div className="col-md-6">
                <div className="detail-group">
                  <h6 className="detail-label">Customer</h6>
                  <p className="detail-value">
                    {selectedTransaction.customer_name || "Walk-in Customer"}
                  </p>
                </div>
              </div>
              <div className="col-md-6">
                <div className="detail-group">
                  <h6 className="detail-label">Status</h6>
                  <span
                    className={`status-badge ${
                      selectedTransaction.payment_status === "completed"
                        ? "completed"
                        : selectedTransaction.payment_status === "pending"
                        ? "pending"
                        : "voided"
                    }`}
                  >
                    {selectedTransaction.payment_status}
                  </span>
                </div>
              </div>
            </div>

            <div className="items-section">
              <h6 className="section-title">Items</h6>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th>Product</th>
                      <th className="text-center">Quantity</th>
                      <th className="text-end">Unit Price</th>
                      <th className="text-end">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedTransaction.items.map((item) => (
                      <tr key={item.id}>
                        <td>{item.product.name}</td>
                        <td className="text-center">{item.quantity}</td>
                        <td className="text-end">
                          ₱{Number(item.unit_price).toFixed(2)}
                        </td>
                        <td className="text-end">
                          ₱{Number(item.total_amount).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="totals-section">
              <div className="row">
                <div className="col-md-6 offset-md-6">
                  <table className="table table-borderless totals-table">
                    <tbody>
                      <tr>
                        <td>Subtotal:</td>
                        <td className="text-end">
                          ₱{Number(selectedTransaction.subtotal).toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <td>Discount:</td>
                        <td className="text-end text-success">
                          -₱
                          {Number(selectedTransaction.discount_amount).toFixed(
                            2
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td>Tax:</td>
                        <td className="text-end">
                          ₱{Number(selectedTransaction.tax_amount).toFixed(2)}
                        </td>
                      </tr>
                      <tr className="total-row">
                        <th>Total:</th>
                        <th className="text-end">
                          ₱{Number(selectedTransaction.total_amount).toFixed(2)}
                        </th>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => handlePrintReceipt(selectedTransaction)}
          >
            <FaPrint className="me-1" /> Print Receipt
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };

  const renderVoidModal = () => {
    if (!transactionToVoid) return null;

    return (
      <Modal
        show={showVoidModal}
        onHide={() => setShowVoidModal(false)}
        className="void-modal"
      >
        <Modal.Header closeButton className="bg-white py-3">
          <Modal.Title className="mb-0">Void Transaction</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="alert alert-warning">
            <strong>Warning:</strong> This action cannot be undone.
          </div>
          <div className="void-details">
            <h6>Transaction Details:</h6>
            <div className="detail-item">
              <span className="label">Reference #:</span>
              <span className="value">
                {transactionToVoid.reference_number}
              </span>
            </div>
            <div className="detail-item">
              <span className="label">Customer:</span>
              <span className="value">
                {transactionToVoid.customer_name || "Walk-in Customer"}
              </span>
            </div>
            <div className="detail-item">
              <span className="label">Total Amount:</span>
              <span className="value">
                ₱{Number(transactionToVoid.total_amount).toFixed(2)}
              </span>
            </div>
            <div className="detail-item">
              <span className="label">Date:</span>
              <span className="value">
                {format(new Date(transactionToVoid.created_at), "PPp")}
              </span>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowVoidModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleVoidTransaction}>
            <FaBan className="me-1" /> Void Transaction
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };

  return (
    <div className="container-fluid transactions-container px-4">
      {/* Header Section */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-white py-3">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-0 text-primary">Transaction History</h5>
              <p className="text-muted mb-0 small">
                View and manage your transaction records
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <FaSearch className="text-muted" />
                </span>
                <Form.Control
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-start-0 ps-0"
                />
              </div>
            </div>
            <div className="col-md-3">
              <Form.Control
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="form-control"
              />
            </div>
            <div className="col-md-3">
              <Form.Select
                value={paymentMethodFilter}
                onChange={(e) => setPaymentMethodFilter(e.target.value)}
                className="form-select"
              >
                <option value="">All Payment Methods</option>
                <option value="cash">Cash</option>
              </Form.Select>
            </div>
            <div className="col-md-3">
              <Form.Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-select"
              >
                <option value="">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="voided">Voided</option>
              </Form.Select>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="text-center" style={{ width: "20%" }}>
                    Reference #
                  </th>
                  <th className="text-center" style={{ width: "15%" }}>
                    Date
                  </th>
                  <th className="text-center" style={{ width: "20%" }}>
                    Customer
                  </th>
                  <th className="text-center" style={{ width: "15%" }}>
                    Total
                  </th>
                  <th className="text-center" style={{ width: "15%" }}>
                    Status
                  </th>
                  <th className="text-center" style={{ width: "15%" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4">
                      <div className="no-data">
                        {searchTerm ||
                        dateFilter ||
                        paymentMethodFilter ||
                        statusFilter ? (
                          <>
                            <i className="bi bi-search display-6 d-block mb-2"></i>
                            <p className="mb-0">
                              No transactions found with the current filters
                            </p>
                          </>
                        ) : (
                          <>
                            <i className="bi bi-receipt display-6 d-block mb-2"></i>
                            <p className="mb-0">No transactions recorded yet</p>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="text-center">
                        <div className="d-flex flex-column align-items-center">
                          <span className="fw-medium">
                            {transaction.reference_number}
                          </span>
                          <small className="text-muted">
                            ID: {transaction.id}
                          </small>
                        </div>
                      </td>
                      <td className="text-center">
                        {format(
                          new Date(transaction.created_at),
                          "MMM d, yyyy"
                        )}
                      </td>
                      <td className="text-center">
                        {transaction.customer_name || "Walk-in Customer"}
                      </td>
                      <td className="text-center">
                        ₱{Number(transaction.total_amount).toFixed(2)}
                      </td>
                      <td className="text-center">
                        <span
                          className={`status-badge ${transaction.payment_status}`}
                        >
                          {transaction.payment_status}
                        </span>
                      </td>
                      <td className="text-center">
                        <div className="actions-group justify-content-center">
                          <Button
                            variant="outline-info"
                            size="sm"
                            onClick={() => handleViewTransaction(transaction)}
                            title="View"
                          >
                            <FaEye />
                          </Button>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handlePrintReceipt(transaction)}
                            title="Print"
                          >
                            <FaPrint />
                          </Button>
                          {transaction.payment_status !== "voided" &&
                            hasPermission("void_transaction") && (
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleVoidClick(transaction)}
                                title="Void"
                              >
                                <FaBan />
                              </Button>
                            )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {renderViewModal()}
      {renderVoidModal()}
    </div>
  );
};

export default Transactions;
