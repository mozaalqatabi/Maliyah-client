import React, { useEffect, useState } from "react";
import { Form, Button, Alert, Spinner } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addUser, resetMessage } from "../Features/UserSlice";
import { userSchemaValidation } from "../Validations/UserValidation";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const msg = useSelector((state) => state.counter.message);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(userSchemaValidation),
  });

  const handleFormSubmit = () => {
    const user = { uname: name, password, email };
    setIsSubmitting(true);
    dispatch(addUser(user));
  };

  useEffect(() => {
  if (msg?.toLowerCase().includes("user added")) {
    setSuccessMsg("Signed up successfully!");
    setIsSubmitting(false);

    setTimeout(() => {
      dispatch(resetMessage());

      // ✅ Set onboarding flag
      localStorage.setItem("justRegistered", "true");

      // ✅ Redirect to login, not dashboard
      navigate("/login");
    }, 2000);
  } else {
    setIsSubmitting(false);
  }
}, [msg, navigate, dispatch]);

  return (
    <div
      style={{
        backgroundColor: "#A6BDFF",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Link
        to="/"
        style={{
          position: "absolute",
          top: "50px",
          left: "100px",
          color: "#4F6BED",
          textDecoration: "none",
          fontWeight: "500",
          fontSize: "0.95rem",
        }}
      >
        ← Back to Home Page
      </Link>

      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          backgroundColor: "white",
          padding: "30px",
          borderRadius: "12px",
          boxShadow: "0 0 20px rgba(0,0,0,0.1)",
        }}
      >
        <div className="text-center mb-4">
          <h4 className="mt-3 mb-1">Create your Maliyah Account</h4>
          <p style={{ fontSize: "0.9rem", color: "#666" }}>
            Fill in your details to get started
          </p>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)}>
          {/* Name Input */}
          <Form.Group controlId="name" className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter your name"
              {...register("name", {
                value: name,
                onChange: (e) => setName(e.target.value),
              })}
              isInvalid={!!errors.name}
              disabled={isSubmitting}
            />
            <Form.Control.Feedback type="invalid">
              {errors.name?.message}
            </Form.Control.Feedback>
          </Form.Group>

          {/* Email Input (strict email format) */}
          <Form.Group controlId="email" className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter your email"
              {...register("email", {
                value: email,
                onChange: (e) => setEmail(e.target.value),
              })}
              isInvalid={!!errors.email}
              disabled={isSubmitting}
              pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
            />
            <Form.Control.Feedback type="invalid">
              {errors.email?.message || "Please enter a valid email address"}
            </Form.Control.Feedback>
          </Form.Group>

          {/* Password Input */}
          <Form.Group controlId="password" className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter your password"
              {...register("password", {
                value: password,
                onChange: (e) => setPassword(e.target.value),
              })}
              isInvalid={!!errors.password}
              disabled={isSubmitting}
            />
            <Form.Control.Feedback type="invalid">
              {errors.password?.message}
            </Form.Control.Feedback>
          </Form.Group>

          {/* Confirm Password Input */}
          <Form.Group controlId="confirmPassword" className="mb-3">
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Confirm your password"
              {...register("confirmPassword", {
                value: confirmPassword,
                onChange: (e) => setConfirmPassword(e.target.value),
              })}
              isInvalid={!!errors.confirmPassword}
              disabled={isSubmitting}
            />
            <Form.Control.Feedback type="invalid">
              {errors.confirmPassword?.message}
            </Form.Control.Feedback>
          </Form.Group>

          {/* Submit Button */}
          <Button
            className="form-control mb-3"
            type="submit"
            style={{ backgroundColor: "#4F6BED", border: "none" }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
              />
            ) : (
              "Sign Up"
            )}
          </Button>

          {/* Success Message */}
          {successMsg && (
            <Alert variant="success" className="text-center">
              {successMsg}
            </Alert>
          )}

          {/* Error Message */}
          {msg &&
            !msg.toLowerCase().includes("user added") &&
            msg.trim() !== "" && (
              <Alert variant="danger" className="text-center">
                {msg}
              </Alert>
            )}

          {/* Already have an account */}
          <div className="text-center mt-3">
            <small>
              Already have an account?{" "}
              <Link to="/login" style={{ color: "#4F6BED" }}>
                Sign In
              </Link>
            </small>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
