import React, { useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import { useCart } from "../../../contexts/CartContext";
import TransactionService from "../../../services/TransactionService";
import SurveyModal from "./SurveyModal";

interface PaymentModalProps {
  show: boolean;
  onHide: () => void;
  total: number;
  items: any[];
  onPaymentComplete: () => void;
}

const PaymentModal = ({
  show,
  onHide,
  total = 0,
  items = [],
  onPaymentComplete,
}: PaymentModalProps) => {
  const [paymentMethod, setPaymentMethod] = useState<"cash">("cash");
  const [receivedAmount, setReceivedAmount] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSurvey, setShowSurvey] = useState(false);
  const [currentTransactionId, setCurrentTransactionId] = useState<
    number | null
  >(null);
  const { clearCart, subtotal, tax } = useCart();

  const totalDiscount = items.reduce(
    (sum, item) => sum + (item.discount || 0),
    0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (items.length === 0) {
      toast.error("Cart is empty");
      setLoading(false);
      return;
    }

    const received = parseFloat(receivedAmount);

    if (!receivedAmount) {
      toast.error("Please enter received amount");
      setLoading(false);
      return;
    }

    if (received < total) {
      toast.error("Received amount is less than total");
      setLoading(false);
      return;
    }

    try {
      const transactionData = {
        items: items.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
          unit_price: Number(item.product.price),
          discount_amount: item.discount || 0,
          total_amount:
            Number(item.product.price) * item.quantity - (item.discount || 0),
        })),
        payment_method: paymentMethod,
        customer_name: customerName,
        customer_email: customerEmail,
        subtotal: subtotal,
        tax_amount: tax,
        discount_amount: totalDiscount,
        total_amount: total,
        notes: `Change: ₱${(received - total).toFixed(2)}`,
        payment_status: "completed",
      };

      const response = await TransactionService.createTransaction(
        transactionData
      );
      toast.success("Transaction completed successfully!");
      clearCart();
      setCurrentTransactionId(response.data.id);
      onHide();
      setShowSurvey(true);
      onPaymentComplete();
    } catch (error: any) {
      console.error("Transaction error details:", error);
      toast.error(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Error completing transaction"
      );
    }
    setLoading(false);
  };

  const handleSurveyClose = () => {
    setShowSurvey(false);
    setCurrentTransactionId(null);
  };

  return (
    <>
      <Modal show={show} onHide={onHide} backdrop="static" keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>Complete Payment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Customer Name</Form.Label>
              <Form.Control
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter customer name"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Customer Email</Form.Label>
              <Form.Control
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="Enter customer email for receipt"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Payment Method</Form.Label>
              <Form.Control type="text" value="Cash" disabled readOnly />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Amount Received</Form.Label>
              <Form.Control
                type="number"
                value={receivedAmount}
                onChange={(e) => setReceivedAmount(e.target.value)}
                required
                min={total}
                step="any"
                placeholder="0.00"
              />
            </Form.Group>

            <div className="border rounded p-3 mb-3">
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal:</span>
                <span>₱{subtotal.toFixed(2)}</span>
              </div>
              {totalDiscount > 0 && (
                <div className="d-flex justify-content-between mb-2 text-success">
                  <span>Total Discount:</span>
                  <span>-₱{totalDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="d-flex justify-content-between mb-2">
                <span>Tax:</span>
                <span>₱{tax.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between border-top pt-2 mt-2">
                <h5 className="mb-0">Total:</h5>
                <h5 className="mb-0">₱{total.toFixed(2)}</h5>
              </div>
              {receivedAmount && (
                <div className="d-flex justify-content-between mt-2 text-primary">
                  <span>Change:</span>
                  <span>
                    ₱{(parseFloat(receivedAmount) - total).toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={onHide} disabled={loading}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? "Processing..." : "Complete Payment"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {currentTransactionId && (
        <SurveyModal
          show={showSurvey}
          onHide={handleSurveyClose}
          transactionId={currentTransactionId}
        />
      )}
    </>
  );
};

export default PaymentModal;
