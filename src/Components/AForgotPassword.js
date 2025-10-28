import React, { useState } from "react";
import { Row, Col, Form, Button, Alert, Spinner } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import financeImage from '../Images/Image2.png';
import { Link } from "react-router-dom";

const AForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    axios
      .post("http://localhost:8080/forgot-password", { email })
      .then((res) => {
        localStorage.setItem("resetEmail", email);
        setSuccess("Code sent! Check your email.");
        setTimeout(() => navigate("/verify-code"), 1000);
      })
      .catch((err) => {
        setError(err.response?.data || "Something went wrong");
        setIsSubmitting(false);
      });
  };

  return (
    <Row className="align-items-center" style={{ minHeight: "100vh", backgroundColor: "#A6BDFF" }}>
      {/* Image Section */}
      <Col lg={6} className="d-flex justify-content-center">
        <img
          src={financeImage}
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
            <h4 className="mt-3 mb-1">Reset Your Password</h4>
            <p style={{ fontSize: "0.9rem", color: "#666" }}>
              Enter your email to receive a verification code
            </p>
          </div>

          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formEmail" className="mb-3">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                "Send Code"
              )}
            </Button>
            <div className="text-center mt-3">
                                     <small>
                                       
                                       <Link to="/admin" style={{ color: "#4F6BED" }}>
                                         Back to Login
                                       </Link>
                                                 </small>
                                     <span className="text-muted"></span>
                        </div>
          </Form>

          
        </div>
      </Col>
    </Row>
  );
};

export default AForgotPassword;
