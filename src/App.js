import './App.css';
import 'sweetalert2/dist/sweetalert2.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import Header from './Components/Header';
import Login from './Components/Login';
import { Container, Row, Col } from 'reactstrap';
import Register from './Components/Register';
import { useSelector } from 'react-redux';
import Welcome from './Components/Welcome';
import UserProfile from './Components/UserProfile';
import DashboardPage from './Components/Dashboard';
import Sidebar from './Components/SideBar';
import AdminLogin from './Components/Admin';
import AdminDashboard from './Components/AdminDashboard';
import AddRecord from './Components/AddRecord';
import Scheduling from './Components/Scheduling';
import Statistics from './Components/Statistics';
import SharedWallets from './Components/SharedWallets';
import Budget from './Components/Budget';
import Goals from './Components/Goals';
import Reminders from './Components/Reminders';
import StatementReport from './Components/Statement';
import Categories from './Components/Category';
import More from './Components/More';
import ResetPassword from './Components/ResetPassword';
import ForgotPassword from './Components/ForgotPassword';
import AForgotPassword from './Components/AForgotPassword';
import VerifyCode from './Components/VerifyCode';
import Zakat from './Components/Zakat';
import UserFeedback from './Components/Feedback';

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

function AppContent() {
  const location = useLocation();
  const email = useSelector((state) => state.counter.user.email);

  const isAdminDashboard = location.pathname === '/admindash';

  return (
    <div className="d-flex flex-column min-vh-100">
      
      {email && !isAdminDashboard && <Header />}

      <Container fluid className="flex-grow-1">
        <Row className="flex-nowrap">
          
          {email && !isAdminDashboard && (
            <Col xs="2" className="p-0">
              <Sidebar />
            </Col>
          )}

          <Col xs={email && !isAdminDashboard ? '10' : '12'} className="p-3">
            <Routes>
              <Route path="/" element={<Welcome />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/dashboard" element={email ? <DashboardPage /> : <Login />} />
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/admindash" element={<AdminDashboard />} />
              <Route path="/reminder" element={<Reminders />} />
              <Route path="/add-record" element={email ? <AddRecord /> : <Login />} />
              <Route path="/scheduling" element={email ? <Scheduling /> : <Login />} />
              <Route path="/statistics" element={email ? <Statistics /> : <Login />} />
              <Route path="/shared-wallets" element={email ? <SharedWallets /> : <Login />} />
              <Route path="/budget" element={email ? <Budget /> : <Login />} />
              <Route path="/goals" element={<Goals />} />
              <Route path="/report" element={<StatementReport />} />
              <Route path="/zakat" element={<Zakat />} />
              <Route path="/feedback" element={<UserFeedback />} />
              <Route path="/category" element={<Categories />} />
              <Route path="/more" element={<More />} />
              <Route path="/aforgot-password" element={<AForgotPassword />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/verify-code" element={<VerifyCode />} />
              <Route path="/reset-password" element={<ResetPassword />} />
            </Routes>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default App;
