import React, { useRef, useState } from "react";
import { Modal } from "react-bootstrap";
import { Products as ProductInterface } from "../../../interfaces/Products";
import EditProductForm from "../../forms/product/EditProductForm";

interface EditProductModalProps {
  show: boolean;
  onHide: () => void;
  product: ProductInterface;
  onProductUpdated: (message: string) => void;
}

const EditProductModal = ({
  show,
  onHide,
  product,
  onProductUpdated,
}: EditProductModalProps) => {
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
        <Modal.Title>Edit Product</Modal.Title>
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
