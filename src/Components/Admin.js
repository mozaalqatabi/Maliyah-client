import React, { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';
import { Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getUser, resetFlags } from '../Features/UserSlice'; 

const AdminLogin = () => {
  const adminEmail = 'maliyahmlk@gmail.com';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isSuccess, isError, message } = useSelector((state) => state.counter);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }
    if (email !== adminEmail) {
      setError('This portal is only for Admin');
      return;
    }

    setIsSubmitting(true);
    dispatch(resetFlags());
    dispatch(getUser({ email, password }));
  };

  useEffect(() => {
    if (user && isSuccess) {
      if (user.email === adminEmail) {
        navigate('/admindash');
      } else {
        setError('Unauthorized email for admin portal');
      }
      dispatch(resetFlags());
      setIsSubmitting(false);
    } else if (isError) {
      setError(message || 'Invalid email or password');
      setIsSubmitting(false);
    }
  }, [user, isSuccess, isError, message, navigate, dispatch]);

  return (
    <Card className="auth-card p-4 border-0 shadow-sm mx-auto" style={{ maxWidth: 450 }}>
      <div className="text-center mb-4">
        <Shield className="text-primary mb-2" size={32} />
        <h4 className="mb-1">Admin Portal</h4>
        <p className="text-muted">Sign in to access the admin dashboard</p>
      </div>

      <Form onSubmit={handleSubmit}>
        {error && <Alert variant="danger">{error}</Alert>}

        <Alert variant="warning" className="py-2 small">
          This area is restricted to authorized administrators only.
        </Alert>

        <Form.Group controlId="adminEmail" className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            autoFocus
            isInvalid={!!error}

          />
          <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
        </Form.Group>

        <Form.Group controlId="adminPassword" className="mb-3">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
            isInvalid={!!error}
          />
          <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
        </Form.Group>

        <div className="d-grid gap-2 pt-2">
          <Button variant="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />{' '}
                Signing In...
              </>
            ) : (
              'Sign In as Admin'
            )}
          </Button>

          <div className="text-center mt-3">
            <span className="text-muted">
              <Link to="/aforgot-password" className="text-decoration-none">
                Forgot Password?
              </Link>
            </span>
          </div>
        </div>
      </Form>
    </Card>
  );
};

export default AdminLogin;
