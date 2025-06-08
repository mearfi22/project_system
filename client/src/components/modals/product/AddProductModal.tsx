import React, { useRef, useState } from "react";
import { Modal } from "react-bootstrap";
import AddProductForm from "../../forms/product/AddProductForm";

interface AddProductModalProps {
  show: boolean;
  onHide: () => void;
  onProductAdded: (message: string) => void;
}

const AddProductModal = ({
  show,
  onHide,
  onProductAdded,
}: AddProductModalProps) => {
  const [loadingStore, setLoadingStore] = useState(false);
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
        <Modal.Title>Add Product</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <AddProductForm
          setSubmitForm={submitForm}
          setLoadingStore={setLoadingStore}
          onProductAdded={onProductAdded}
        />
      </Modal.Body>
      <Modal.Footer>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onHide}
          disabled={loadingStore}
        >
          Close
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={loadingStore}
        >
          {loadingStore ? (
            <>
              <span
                className="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              ></span>
              &nbsp;Loading...
            </>
          ) : (
            "Save"
          )}
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddProductModal;
