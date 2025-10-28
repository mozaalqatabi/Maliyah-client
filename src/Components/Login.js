import React, { useEffect, useState } from 'react';
import { Card, Form, Button, Alert, Spinner } from 'react-bootstrap';  // React-Bootstrap components
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getUser, resetFlags } from '../Features/UserSlice';
import { LoginValidation } from '../Validations/LoginValidation';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const message = useSelector((state) => state.counter.message);
  const user = useSelector((state) => state.counter.user);
  const isSuccess = useSelector((state) => state.counter.isSuccess);
  const isError = useSelector((state) => state.counter.isError);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit: submitForm,
    formState: { errors },
  } = useForm({ resolver: yupResolver(LoginValidation) });

  const [isSubmitting, setIsSubmitting] = useState(false);  // Track form submission state

  const handleSubmit = () => {
    const user = {email: email.toLowerCase(), password };
    setIsSubmitting(true);
    dispatch(resetFlags());
    dispatch(getUser(user));
  };

  useEffect(() => {
  if (isSuccess && user && Object.keys(user).length > 0) {
    localStorage.setItem("user", JSON.stringify(user));

    const tutorialKey = `tutorialShown_${user.email}`;
    const justRegistered = localStorage.getItem("justRegistered");

    // ✅ Clean up registration flag
    if (justRegistered === "true") {
      localStorage.removeItem("justRegistered");
    }

    // ✅ First-time user or fresh registration
    if (justRegistered === "true" || !localStorage.getItem(tutorialKey)) {
      navigate("/dashboard", { state: { showTutorial: true } });
    } else {
      navigate("/dashboard");
    }

    dispatch(resetFlags());
    setIsSubmitting(false);
  } else if (isError) {
    setIsSubmitting(false);
  }
}, [isSuccess, user, isError, navigate, dispatch]);


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
          <h4 className="mt-3 mb-1">Sign in to Maliyah</h4>
          <p style={{ fontSize: "0.9rem", color: "#666" }}>
            Enter your details to access your account
          </p>
        </div>

        <form onSubmit={submitForm(handleSubmit)}>
          {/* Email Input */}
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
            />
            <Form.Control.Feedback type="invalid">
              {errors.email?.message}
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

          {/* Submit Button */}
          <Button
            color="primary"
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
              "Sign In"
            )}
          </Button>

          {/* Error Message */}
          {isError && (
            <Alert variant="danger" className="mt-3 text-center">
              {message || "Invalid email or password"}
            </Alert>
          )}

          {/* Links */}
          <div className="text-center mt-3">
            <span className="text-muted">
              <Link to="/forgot-password" className="text-decoration-none">
                Forgot Password?
              </Link>
            </span>
          </div>

          <div className="text-center mt-3">
            <small>
              Don't have an account?{" "}
              <Link to="/register" style={{ color: "#4F6BED" }}>
                Sign Up Now
              </Link>
            </small>
            <span className="text-muted"></span>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
