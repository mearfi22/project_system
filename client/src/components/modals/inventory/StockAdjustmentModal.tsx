import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { Products } from "../../../interfaces/Products";
import { StockAdjustment } from "../../../interfaces/Inventory";
import InventoryService from "../../../services/InventoryService";
import ErrorHandler from "../../../handler/ErrorHandler";

interface Props {
  show: boolean;
  onHide: () => void;
  product: Products;
  onStockAdjusted: (message: string) => void;
}

const StockAdjustmentModal: React.FC<Props> = ({
  show,
  onHide,
  product,
  onStockAdjusted,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<StockAdjustment>({
    product_id: product.id,
    quantity: 1,
    type: "in",
    reference: "",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    InventoryService.adjustStock(formData)
      .then((res) => {
        onStockAdjusted(res.data.message);
      })
      .catch((error) => {
        ErrorHandler(error, null);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Modal show={show} onHide={onHide} backdrop="static" keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>Adjust Stock - {product.name}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Current Stock</Form.Label>
            <Form.Control type="text" value={product.stock_quantity} disabled />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Type</Form.Label>
            <Form.Select
              value={formData.type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  type: e.target.value as "in" | "out",
                })
              }
              required
            >
              <option value="in">Stock In</option>
              <option value="out">Stock Out</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Quantity</Form.Label>
            <Form.Control
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  quantity: parseInt(e.target.value) || 0,
                })
              }
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Reference</Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g., Purchase Order #123"
              value={formData.reference}
              onChange={(e) =>
                setFormData({ ...formData, reference: e.target.value })
              }
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Notes</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Additional notes..."
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Adjusting..." : "Adjust Stock"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default StockAdjustmentModal;
