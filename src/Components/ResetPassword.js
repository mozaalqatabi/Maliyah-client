import React, { useState } from "react";
import { Row, Col, Form, Button, Alert, Spinner } from "react-bootstrap";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import financeImage2 from '../Images/Image2.png'; // Assuming you have an image to display

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const email = localStorage.getItem("resetEmail");

  // Password validation regex
  // At least 1 uppercase and 1 special character, minimum length of 6
  const passwordRegex = /^(?=.*[A-Z])(?=.*[\W_]).{6,}$/;  

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    // Validate password using regex
    if (!passwordRegex.test(newPassword)) {
      setError("Password must be at least 6 characters long, contain at least 1 uppercase letter and 1 special character.");
      setIsSubmitting(false);
      return;
    }

    axios
      .post("http://localhost:8080/reset-password", {
        email,
        resetCode,
        newPassword,
      })
      .then(() => {
        setSuccess("Password reset successful!");
        localStorage.removeItem("resetEmail");
        setTimeout(() => navigate("/login"), 1500);
      })
      .catch((err) => {
        setError(err.response?.data || "Something went wrong");
        setIsSubmitting(false);
      });
  };

  return (
    <div style={{ backgroundColor: "#A6BDFF", minHeight: "100vh" }}>
      <Row className="align-items-center" style={{ minHeight: "100vh" }}>
        {/* Image Section */}
        <Col lg={6} className="d-flex justify-content-center">
          <img
            src={financeImage2}
            alt="Finance Dashboard"
            className="img-fluid rounded-3 shadow"
            style={{ maxWidth: "80%" }} // Adjust size as needed
          />
        </Col>

        {/* Form Section */}
        <Col lg={6}>
          <div
            style={{
              width: "100%",
              maxWidth: "420px",
              backgroundColor: "white",
              padding: "30px",
              borderRadius: "12px",
              boxShadow: "0 0 20px rgba(0,0,0,0.1)",
              margin: "0 auto",
            }}
          >
            <div className="text-center mb-4">
              <h4 className="mt-3 mb-1">Reset Password</h4>
              <p style={{ fontSize: "0.9rem", color: "#666" }}>
                Enter the reset code and your new password
              </p>
            </div>

            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="formCode" className="mb-3">
                <Form.Label>Reset Code</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter the reset code again"
                  required
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  disabled={isSubmitting}
                />
              </Form.Group>

              <Form.Group controlId="formNewPassword" className="mb-3">
                <Form.Label>New Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter new password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isSubmitting}
                />
              </Form.Group>

              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}

              <Button
                className="form-control"
                style={{ backgroundColor: "#4F6BED", border: "none" }}
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Spinner as="span" animation="border" size="sm" />
                ) : (
                  "Reset Password"
                )}
              </Button>

              <div className="text-center mt-3">
                <small>
                  <Link to="/login" style={{ color: "#4F6BED" }}>
                    Back to Login
                  </Link>
                </small>
              </div>
            </Form>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default ResetPassword;
