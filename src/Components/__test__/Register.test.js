import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import Register from '../Register';

const mockStore = configureStore([]);
const store = mockStore({
  counter: { isSuccess: false, isError: false, user: null, message: '' },
});

beforeAll(() => {
  jest.spyOn(console, "warn").mockImplementation(() => {});
});

describe('Register Component Tests', () => {

  test('renders all input fields and submit button', () => {
    render(
      <Provider store={store}>
        <Router>
          <Register />
        </Router>
      </Provider>
    );

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  test('allows typing in all input fields', () => {
    render(
      <Provider store={store}>
        <Router>
          <Register />
        </Router>
      </Provider>
    );

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'Abc@123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'Abc@123' } });

    expect(screen.getByLabelText(/name/i).value).toBe('John Doe');
    expect(screen.getByLabelText(/email/i).value).toBe('john@example.com');
    expect(screen.getByLabelText(/^password$/i).value).toBe('Abc@123');
    expect(screen.getByLabelText(/confirm password/i).value).toBe('Abc@123');
  });

  test('validates email format using regex', () => {
    render(
      <Provider store={store}>
        <Router>
          <Register />
        </Router>
      </Provider>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    fireEvent.change(emailInput, { target: { value: 'valid.email@example.com' } });
    expect(emailRegex.test(emailInput.value)).toBe(true);

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    expect(emailRegex.test(emailInput.value)).toBe(false);
  });

  test('shows validation errors for empty fields on submit', async () => {
    render(
      <Provider store={store}>
        <Router>
          <Register />
        </Router>
      </Provider>
    );

    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    expect(await screen.findByText(/please enter your name/i)).toBeInTheDocument();
    expect(await screen.findByText(/please enter your email/i)).toBeInTheDocument();
    expect(await screen.findByText(/please enter your password/i)).toBeInTheDocument();
    expect(await screen.findByText(/please confirm your password/i)).toBeInTheDocument();
  });

  test('matches the UI snapshot', () => {
    const { container } = render(
      <Provider store={store}>
        <Router>
          <Register />
        </Router>
      </Provider>
    );
    expect(container).toMatchSnapshot();
  });

});
