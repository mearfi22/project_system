import React from "react";
import { Modal, Button } from "react-bootstrap";

interface DeleteConfirmationModalProps {
  show: boolean;
  onHide: () => void;
  onConfirm: () => void;
  title: string;
  message?: string;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  show,
  onHide,
  onConfirm,
  title,
  message = "Are you sure you want to delete this item?",
}) => {
  return (
    <Modal show={show} onHide={onHide} backdrop="static" keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="alert alert-warning">
          <i className="bi bi-exclamation-triangle me-2"></i>
          Warning: This action cannot be undone.
        </div>
        <p>{message}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          Delete
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteConfirmationModal;
