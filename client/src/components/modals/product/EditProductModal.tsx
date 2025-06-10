import React, { useRef, useState } from "react";
import { Modal } from "react-bootstrap";
import { Product } from "../../../interfaces/Products";
import EditProductForm from "../../forms/product/EditProductForm";

interface EditProductModalProps {
  show: boolean;
  onHide: () => void;
  product: Product | null;
  onProductUpdated: (product: Product, message: string) => void;
}

const EditProductModal: React.FC<EditProductModalProps> = ({
  show,
  onHide,
  product,
  onProductUpdated,
}) => {
  if (!product) return null;

  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const submitForm = useRef<(() => void) | null>(null);

  const handleSubmit = () => {
    if (submitForm.current) {
      submitForm.current();
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      backdrop="static"
      keyboard={false}
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title>Edit Product - {product.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <EditProductForm
          product={product}
          setSubmitForm={submitForm}
          setLoadingUpdate={setLoadingUpdate}
          onProductUpdated={onProductUpdated}
        />
      </Modal.Body>
      <Modal.Footer>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onHide}
          disabled={loadingUpdate}
        >
          Close
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={loadingUpdate}
        >
          {loadingUpdate ? (
            <>
              <span
                className="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              ></span>
              &nbsp;Loading...
            </>
          ) : (
            "Save Changes"
          )}
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditProductModal;
