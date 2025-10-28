import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import Login from '../Login';

const mockStore = configureStore([]);
const store = mockStore({
  counter: { isSuccess: false, isError: false, user: null, message: '' },
});

beforeAll(() => {
  jest.spyOn(console, "warn").mockImplementation(() => {});
});

describe('Login Component Tests', () => {

  test('renders email and password fields', () => {
    render(
      <Provider store={store}>
        <Router>
          <Login />
        </Router>
      </Provider>
    );

    // Check for Email field
    const emailInput = screen.getByLabelText(/email/i);
    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveAttribute('type', 'email');

    // Check for Password field
    const passwordInput = screen.getByLabelText(/password/i);
    expect(passwordInput).toBeInTheDocument();
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('allows typing in email and password fields', () => {
    render(
      <Provider store={store}>
        <Router>
          <Login />
        </Router>
      </Provider>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  test('validates email format using regex', () => {
    render(
      <Provider store={store}>
        <Router>
          <Login />
        </Router>
      </Provider>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Valid email format
    fireEvent.change(emailInput, { target: { value: 'valid.email@example.com' } });
    expect(emailRegex.test(emailInput.value)).toBe(true);

    // Invalid email format
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    expect(emailRegex.test(emailInput.value)).toBe(false);
  });

  test('shows validation errors for empty fields on submit', async () => {
    render(
      <Provider store={store}>
        <Router>
          <Login />
        </Router>
      </Provider>
    );

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);

    // Wait for validation messages
    expect(await screen.findByText(/email should not be empty/i)).toBeInTheDocument();
    expect(await screen.findByText(/password should not be empty/i)).toBeInTheDocument();
  });

  test('matches the UI snapshot', () => {
    const { container } = render(
      <Provider store={store}>
        <Router>
          <Login />
        </Router>
      </Provider>
    );

    // Snapshot testing
    expect(container).toMatchSnapshot();
  });

});



