import React from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import financeImage from '../Images/Image.png';
import dashboard from '../Images/dashboard.svg';
import { Link } from 'react-router-dom';
import Footer from './Footer';
import WHeader from './welcomeHeader';
import { 
  BarChart3,  
  Wallet, 
  TrendingUp, 
  Clock, 
  Shield 
} from 'lucide-react';

const HomePage = () => {
  return (
    
    <div className="fade-in">
      <WHeader/>
      
      {/* Hero Section */}
      <section className="py-5 text-white" style={{ backgroundColor: '#A6BDFF' }}>
        <Container className="py-5">
          <Row className="align-items-center">
            <Col lg={6} className="mb-5 mb-lg-0">
              <h1 className="display-4 fw-bold mb-4">Take Control of Your Finances</h1>
              <p className="lead mb-4">
                Track expenses, manage budgets, and achieve your financial goals with our intuitive personal finance web-app.
              </p>
              <div className="d-flex flex-wrap gap-2">
                <Button as={Link} to="/register" variant="light" size="lg" className="fw-semibold px-4">
                  Get Started
                </Button>
                <Button as={Link} to="#features" variant="outline-light" size="lg" className="fw-semibold px-4">
                  Learn More
                </Button>
              </div>
            </Col>
            <Col lg={6}>
              <img 
                src={financeImage}
                alt="Finance Dashboard"
                className="img-fluid rounded-3 shadow"
              />
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-5" id="features">
        <Container className="py-5">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3">Features Designed for Your Financial Success</h2>
            <p className="lead text-muted mx-auto" style={{ maxWidth: '700px' }}>
              Our comprehensive tools help you track, plan, and achieve financial freedom.
            </p>
          </div>

          <Row className="g-4">
            <Col md={4}>
              <Card className="h-100 border-0 dashboard-card p-4">
                <div style={{ color: '#A6BDFF' }} className="mb-3">
                  <BarChart3 size={36} />
                </div>
                <Card.Body className="p-0">
                  <h4 className="fw-bold mb-3">Expense Tracking</h4>
                  <p className="text-muted">
                    Easily log and categorize your expenses to understand where your money goes.
                  </p>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card className="h-100 border-0 dashboard-card p-4">
                <div style={{ color: '#A6BDFF' }} className="mb-3">
                  <Wallet size={36} />
                </div>
                <Card.Body className="p-0">
                  <h4 className="fw-bold mb-3">Budget Planning</h4>
                  <p className="text-muted">
                    Create customized budgets for different categories and track your spending.
                  </p>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card className="h-100 border-0 dashboard-card p-4">
                <div style={{ color: '#A6BDFF' }} className="mb-3">
                  <TrendingUp size={36} />
                </div>
                <Card.Body className="p-0">
                  <h4 className="fw-bold mb-3">Savings Goals</h4>
                  <p className="text-muted">
                    Set and track progress toward your savings goals with visual indicators.
                  </p>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card className="h-100 border-0 dashboard-card p-4">
                <div style={{ color: '#A6BDFF' }} className="mb-3">
                  <TrendingUp size={36} />
                </div>
                <Card.Body className="p-0">
                  <h4 className="fw-bold mb-3">Buit-in Zakat</h4>
                  <p className="text-muted">
                    Offering features align with Islamic finance principle such as built-in zakat 
                  </p>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card className="h-100 border-0 dashboard-card p-4">
                <div style={{ color: '#A6BDFF' }} className="mb-3">
                  <Clock size={36} />
                </div>
                <Card.Body className="p-0">
                  <h4 className="fw-bold mb-3">Bill Reminders</h4>
                  <p className="text-muted">
                    Never miss a payment with customizable bill reminders and payment tracking.
                  </p>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card className="h-100 border-0 dashboard-card p-4">
                <div style={{ color: '#A6BDFF' }} className="mb-3">
                  <BarChart3 size={36} />
                </div>
                <Card.Body className="p-0">
                  <h4 className="fw-bold mb-3">Financial Insights </h4>
                  <p className="text-muted">
                    View financial insights through charts and reports 
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* How It Works Section */}
      <section className="py-5 bg-light">
        <Container className="py-5">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3">How It Works</h2>
            <p className="lead text-muted mx-auto" style={{ maxWidth: '700px' }}>
              Getting started with Maliyah is easy and takes just minutes.
            </p>
          </div>

          <Row className="align-items-center">
          <Col lg={6} className="mb-4 mb-lg-0 d-flex justify-content-end">
  <img 
    src={dashboard}
    alt="Finance Dashboard"
    className="img-fluid rounded-3 shadow"
    style={{ width: '400%', maxWidth: '600px' }}
  />
</Col>

            <Col lg={6}>
              {[1, 2, 3, 4].map((step, idx) => {
                const stepTitles = [
                  "Create your account",
                  "Add your Expenses and Income",
                  "Set your budget",
                  "Track and optimize"
                ];
                const stepDescriptions = [
                  "Sign up with your email and set up your profile in less than a minute.",
                  "Note your expenses and income record Transaction.",
                  "Create personalized budgets based on your income and financial goals.",
                  "Monitor your spending, get insights, and improve your financial health."
                ];

                return (
                  <div className="d-flex mb-4" key={step}>
                    <div className="text-white rounded-circle p-3 me-3" style={{ backgroundColor: '#A6BDFF' }}>
                      <span className="fw-bold">{step}</span>
                    </div>
                    <div>
                      <h4 className="fw-bold">{stepTitles[idx]}</h4>
                      <p className="text-muted">{stepDescriptions[idx]}</p>
                    </div>
                  </div>
                );
              })}
            </Col>
          </Row>
        </Container>
      </section>

      {/* Testimonials Section */}
      <section className="py-5">
        <Container className="py-5">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3">What Our Users Say</h2>
            <p className="lead text-muted mx-auto" style={{ maxWidth: '700px' }}>
              Thousands of people have transformed their financial lives with Maliyah.
            </p>
          </div>

          <Row className="g-4">
            {[
              {
                quote: "This app has completely changed how I manage my money. I've paid off debt and started saving for the first time.",
                initials: "KR",
                name: "Kaltham Rashid",
                role: "Freelance Designer"
              },
              {
                quote: "The visualization tools help me understand my spending habits. I've cut unnecessary expenses by 30%!",
                initials: "MA",
                name: "Moza Azzan",
                role: "Software Devoloper"
              },
              {
                quote: "The budgeting features are intuitive and flexible. I finally feel in control of my finances and know my money flow .",
                initials: "LS",
                name: "Lamya Saleem",
                role: "Software Engineer"
              }
            ].map(({ quote, initials, name, role }, idx) => (
              <Col md={4} key={idx}>
                <Card className="h-100 border-0 dashboard-card p-4">
                  <div className="mb-3">
                    <div className="text-warning mb-2">
                      {'★'.repeat(5)}
                    </div>
                    <p className="fw-light fst-italic">"{quote}"</p>
                  </div>
                  <div className="d-flex align-items-center">
                    <div className="avatar text-white me-3" style={{ backgroundColor: '#A6BDFF' }}>
                      {initials}
                    </div>
                    <div>
                      <p className="mb-0 fw-bold">{name}</p>
                      <small className="text-muted">{role}</small>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-5 text-white" style={{ backgroundColor: '#A6BDFF' }}>
        <Container className="py-5 text-center">
          <h2 className="display-5 fw-bold mb-4">Ready to Transform Your Finances?</h2>
          <p className="lead mx-auto mb-5" style={{ maxWidth: '700px' }}>
            Join thousands of users who have improved their financial health with Maliyah.
          </p>
          <Button 
            as={Link}
            to="/register" 
            variant="light" 
            size="lg" 
            className="fw-semibold px-5 py-3"
          >
            Start Saving Money
          </Button>
          <p className="mt-3">No credit card required.</p>
        </Container>
      </section>
      <Footer />
    </div>
  );
};

export default HomePage;
