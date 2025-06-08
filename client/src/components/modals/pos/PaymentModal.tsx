import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useCart } from "../../../contexts/CartContext";
import { Payment, CartItem } from "../../../interfaces/Sales";
import AxiosInstance from "../../../AxiosInstance";
import { toast } from "react-toastify";

interface PaymentModalProps {
  show: boolean;
  onHide: () => void;
  total: number;
  items: CartItem[];
}

const PaymentModal = ({
  show,
  onHide,
  total = 0,
  items = [],
}: PaymentModalProps) => {
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card">("cash");
  const [receivedAmount, setReceivedAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const { clearCart } = useCart();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (items.length === 0) {
      toast.error("Cart is empty");
      setLoading(false);
      return;
    }

    const received =
      paymentMethod === "cash" ? parseFloat(receivedAmount) : total;

    if (paymentMethod === "cash") {
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
    }

    const payment: Payment = {
      method: paymentMethod,
      amount: total,
      received: paymentMethod === "cash" ? received : undefined,
    };

    const saleData = {
      items: items.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
        price: Number(item.price),
      })),
      payment,
    };

    try {
      const response = await AxiosInstance.post("/sales", saleData);

      if (response.data) {
        toast.success("Sale completed successfully!");
        clearCart();
        onHide();
      }
    } catch (error: any) {
      console.error("Sale error:", error);
      toast.error(error.response?.data?.message || "Error completing sale");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} backdrop="static" keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>Payment</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <div className="mb-3">
            <h5>Total Amount: ${(total || 0).toFixed(2)}</h5>
          </div>

          <Form.Group className="mb-3">
            <Form.Label>Payment Method</Form.Label>
            <Form.Select
              value={paymentMethod}
              onChange={(e) =>
                setPaymentMethod(e.target.value as "cash" | "card")
              }
              required
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
            </Form.Select>
          </Form.Group>

          {paymentMethod === "cash" && (
            <Form.Group className="mb-3">
              <Form.Label>Received Amount</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                min={total}
                value={receivedAmount}
                onChange={(e) => setReceivedAmount(e.target.value)}
                required
              />
              {receivedAmount && (
                <Form.Text>
                  Change: $
                  {((parseFloat(receivedAmount) || 0) - (total || 0)).toFixed(
                    2
                  )}
                </Form.Text>
              )}
            </Form.Group>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading || items.length === 0}
          >
            {loading ? "Processing..." : "Complete Sale"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default PaymentModal;
