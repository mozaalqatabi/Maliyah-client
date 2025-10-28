import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Alert, Card } from 'react-bootstrap';
import { Star, Send, Check, X, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const UserFeedback = () => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  // ✅ Get logged-in user email
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userEmail = storedUser?.email;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userEmail) {
      setErrorMessage("You must be logged in to submit feedback.");
      return;
    }
    if (!rating || !comment.trim()) {
      setErrorMessage("Please provide a rating and comment.");
      return;
    }

    setErrorMessage("");

    try {
      await axios.post("https://maliyah-server.onrender.com/feedback", {
        userEmail,
        rating,
        comment
      });

      setShowSuccess(true);
      setRating(0);
      setComment('');

      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to submit feedback:", err);
      setErrorMessage(err.response?.data?.message || "Failed to submit feedback.");
    }
  };

  return (
    <Container className="py-4" style={{ maxWidth: '700px' }}>
      <div
        onClick={() => navigate('/more')}
        style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', marginBottom: 16 }}
        title="Back to More Options"
        aria-label="Back to More Options"
      >
        <ArrowLeft size={24} />
      </div>

      <div className="mb-4">
        <h4 className="fw-bold mb-0">Share Your Feedback</h4>
        <p className="text-muted">Help us improve your experience</p>
      </div>

      {showSuccess && (
        <Alert variant="success" className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <Check size={20} className="me-2" />
            Thank you for your feedback!
          </div>
          <Button variant="link" className="p-0 text-success" onClick={() => setShowSuccess(false)}>
            <X size={16} />
          </Button>
        </Alert>
      )}

      {errorMessage && (
        <Alert variant="danger" className="d-flex align-items-center justify-content-between">
          {errorMessage}
          <Button variant="link" className="p-0 text-danger" onClick={() => setErrorMessage('')}>
            <X size={16} />
          </Button>
        </Alert>
      )}

      <Card className="shadow-sm border">
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4">
              <Form.Label>How would you rate your experience?</Form.Label>
              <div className="d-flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Button
                    key={star}
                    variant="link"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="p-0 m-0"
                  >
                    <Star
                      size={32}
                      className={star <= (hoveredRating || rating) ? 'text-warning fill-warning' : 'text-secondary'}
                      fill={star <= (hoveredRating || rating) ? 'currentColor' : 'none'}
                    />
                  </Button>
                ))}
              </div>
              {rating > 0 && (
                <div className="mt-2 text-muted">
                  {rating === 5
                    ? 'Excellent!'
                    : rating === 4
                    ? 'Very Good!'
                    : rating === 3
                    ? 'Good'
                    : rating === 2
                    ? 'Fair'
                    : 'Poor'}
                </div>
              )}
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Your Comments</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts and suggestions..."
                required
              />
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button
                type="submit"
                disabled={rating === 0}
                variant={rating === 0 ? 'secondary' : 'primary'}
                className="d-flex align-items-center"
              >
                <Send size={16} className="me-2" />
                Submit Feedback
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default UserFeedback;

