import React, { useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import TransactionService from "../../../services/TransactionService";

interface SurveyModalProps {
  show: boolean;
  onHide: () => void;
  transactionId: number;
}

const SurveyModal = ({ show, onHide, transactionId }: SurveyModalProps) => {
  const [rating, setRating] = useState<number>(5);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await TransactionService.submitFeedback(transactionId, {
        satisfaction_rating: rating,
        feedback: feedback,
      });
      toast.success("Thank you for your feedback!");
      onHide();
    } catch (error: any) {
      console.error("Error submitting feedback:", error);
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} backdrop="static" keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>Rate Your Experience</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-4">
            <Form.Label>How satisfied are you with our service?</Form.Label>
            <div className="d-flex justify-content-center gap-3 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`btn btn-outline-warning btn-lg px-4 ${
                    rating >= star ? "active" : ""
                  }`}
                  onClick={() => setRating(star)}
                >
                  <i className="bi bi-star-fill"></i>
                </button>
              ))}
            </div>
            <div className="text-center mb-3">
              <small className="text-muted">
                {rating === 1
                  ? "Very Dissatisfied"
                  : rating === 2
                  ? "Dissatisfied"
                  : rating === 3
                  ? "Neutral"
                  : rating === 4
                  ? "Satisfied"
                  : "Very Satisfied"}
              </small>
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Additional Comments (Optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tell us more about your experience..."
            />
          </Form.Group>

          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={onHide} disabled={loading}>
              Skip
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Feedback"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default SurveyModal;
