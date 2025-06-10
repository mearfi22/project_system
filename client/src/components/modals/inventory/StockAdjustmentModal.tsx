import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import { Product } from "../../../interfaces/Products";
import { StockAdjustment } from "../../../interfaces/Inventory";
import InventoryService from "../../../services/InventoryService";
import ErrorHandler from "../../../handler/ErrorHandler";
import SpinnerSmall from "../../SpinnerSmall";

interface Props {
  show: boolean;
  onHide: () => void;
  product: Product;
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

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "quantity" ? parseInt(value) || 0 : value,
    }));
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      backdrop="static"
      keyboard={false}
      centered
    >
      <form onSubmit={handleSubmit}>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title as="h5" className="text-primary">
            Adjust Stock - {product.name}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="pt-4">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Movement Type</label>
              <select
                name="type"
                className="form-select"
                value={formData.type}
                onChange={handleInputChange}
                disabled={loading}
              >
                <option value="in">Stock In</option>
                <option value="out">Stock Out</option>
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label">Quantity</label>
              <input
                type="number"
                name="quantity"
                className="form-control"
                value={formData.quantity}
                onChange={handleInputChange}
                min="1"
                required
                disabled={loading}
              />
            </div>

            <div className="col-12">
              <label className="form-label">Reference</label>
              <input
                type="text"
                name="reference"
                className="form-control"
                value={formData.reference}
                onChange={handleInputChange}
                placeholder="e.g., Purchase Order #123"
                required
                disabled={loading}
              />
            </div>

            <div className="col-12">
              <label className="form-label">Notes</label>
              <textarea
                name="notes"
                className="form-control"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Add any additional notes here..."
                rows={3}
                disabled={loading}
              />
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer className="border-0 pt-0">
          <button
            type="button"
            className="btn btn-light"
            onClick={onHide}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary d-flex align-items-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <SpinnerSmall /> Adjusting Stock...
              </>
            ) : (
              <>
                <i className="bi bi-check2"></i> Save Changes
              </>
            )}
          </button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default StockAdjustmentModal;
