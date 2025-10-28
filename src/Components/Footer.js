import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { PiggyBank, Github as GitHub, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="py-5 mt-auto" style={{ backgroundColor: '#2B2675', color: 'white' }}>
      <Container>
        <Row className="g-4">
          <Col md={4}>
            <div className="d-flex align-items-center mb-3">
              
              <h5 className="mb-0 fw-bold text-white">Maliyah</h5>
            </div>
            <p className="text-white-50">
              Simplify your finances and make smarter money decisions with our intuitive personal finance app.
            </p>
            <div className="d-flex mt-3">
              
              <a href="#" className="text-white me-3">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-white">
                <Instagram size={20} />
              </a>
            </div>
          </Col>
          <Col md={2}>
            <h6 className="fw-bold mb-3 text-white">Product</h6>
            <ul className="list-unstyled">
              <li className="mb-2"><a href="#" className="text-decoration-none text-white-50">Features</a></li>
              {/*<li className="mb-2"><a href="#" className="text-decoration-none text-white-50">Pricing</a></li>*/}
              <li className="mb-2"><a href="#" className="text-decoration-none text-white-50">FAQ</a></li>
              {/*<li className="mb-2"><a href="#" className="text-decoration-none text-white-50">Download</a></li>*/}
            </ul>
          </Col>
          <Col md={2}>
            <h6 className="fw-bold mb-3 text-white">Company</h6>
            <ul className="list-unstyled">
              <li className="mb-2"><a href="#" className="text-decoration-none text-white-50">About Us</a></li>
              {/*<li className="mb-2"><a href="#" className="text-decoration-none text-white-50">Careers</a></li>*/}
              {/*<li className="mb-2"><a href="#" className="text-decoration-none text-white-50">Blog</a></li>*/}
              <li className="mb-2"><a href="#" className="text-decoration-none text-white-50">Contact</a></li>
            </ul>
          </Col>
          <Col md={4}>
  <h6 className="fw-bold mb-3 text-white">Zakat Reminder</h6>
  <p className="text-white-50 small mb-3">Track your Zakat deadline with our built-in calculator.</p>
  <button
  className="btn btn-light btn-sm text-dark px-5 py-2"
  style={{ borderRadius: '4px' }}
>
  Open Zakat Calculator
</button>

</Col>

        </Row>
        <hr className="my-4 border-light" />
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
          <p className="small text-white-50 mb-md-0">© 2025 Maliyah. All rights reserved.</p>
          <div>
            <a href="#" className="text-decoration-none text-white-50 small me-3">Privacy Policy</a>
            <a href="#" className="text-decoration-none text-white-50 small me-3">Terms of Service</a>
            <a href="#" className="text-decoration-none text-white-50 small">Cookie Settings</a>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;

/*import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { PiggyBank, Github as GitHub, Twitter, Instagram } from 'lucide-react';

const Footer= () => {
  return (
    <footer className="bg-light py-5 mt-auto">
      <Container>
        <Row className="g-4">
          <Col md={4}>
            <div className="d-flex align-items-center mb-3">
              <PiggyBank size={24} className="me-2 text-primary" />
              <h5 className="mb-0 fw-bold">FinanceTrack</h5>
            </div>
            <p className="text-muted">
              Simplify your finances and make smarter money decisions with our intuitive personal finance app.
            </p>
            <div className="d-flex mt-3">
              <a href="#" className="text-secondary me-3">
                <GitHub size={20} />
              </a>
              <a href="#" className="text-secondary me-3">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-secondary">
                <Instagram size={20} />
              </a>
            </div>
          </Col>
          <Col md={2}>
            <h6 className="fw-bold mb-3">Product</h6>
            <ul className="list-unstyled">
              <li className="mb-2"><a href="#" className="text-decoration-none text-secondary">Features</a></li>
              <li className="mb-2"><a href="#" className="text-decoration-none text-secondary">Pricing</a></li>
              <li className="mb-2"><a href="#" className="text-decoration-none text-secondary">FAQ</a></li>
              <li className="mb-2"><a href="#" className="text-decoration-none text-secondary">Download</a></li>
            </ul>
          </Col>
          <Col md={2}>
            <h6 className="fw-bold mb-3">Company</h6>
            <ul className="list-unstyled">
              <li className="mb-2"><a href="#" className="text-decoration-none text-secondary">About Us</a></li>
              <li className="mb-2"><a href="#" className="text-decoration-none text-secondary">Careers</a></li>
              <li className="mb-2"><a href="#" className="text-decoration-none text-secondary">Blog</a></li>
              <li className="mb-2"><a href="#" className="text-decoration-none text-secondary">Contact</a></li>
            </ul>
          </Col>
          <Col md={4}>
            <h6 className="fw-bold mb-3">Subscribe to our newsletter</h6>
            <p className="text-muted small mb-3">Get the latest updates and offers straight to your inbox.</p>
            <div className="input-group mb-3">
              <input type="email" className="form-control" placeholder="Email address" />
              <button className="btn btn-primary" type="button">Subscribe</button>
            </div>
          </Col>
        </Row>
        <hr className="my-4" />
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
          <p className="small text-muted mb-md-0">© 2025 FinanceTrack. All rights reserved.</p>
          <div>
            <a href="#" className="text-decoration-none text-secondary small me-3">Privacy Policy</a>
            <a href="#" className="text-decoration-none text-secondary small me-3">Terms of Service</a>
            <a href="#" className="text-decoration-none text-secondary small">Cookie Settings</a>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;*/
