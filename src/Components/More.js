import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Badge } from 'react-bootstrap';
import { FileText, MessageCircle, Calculator, Folder } from 'lucide-react';

const More = () => {
  const navigate = useNavigate();

  const options = [
    {
      icon: <FileText size={28} />,
      title: 'Statement Report',
      description: 'View and download your financial statements',
      path: '/report',
      color: '#0ea5e9',
      bg: 'linear-gradient(135deg, rgba(14,165,233,0.1), rgba(14,165,233,0.25))'
    },
    {
      icon: <Folder size={28} />,
      title: 'Categories Management',
      description: 'Manage your expense and income categories',
      path: '/category',
      color: '#16a34a',
      bg: 'linear-gradient(135deg, rgba(22,163,74,0.1), rgba(22,163,74,0.25))'
    },
    {
      icon: <MessageCircle size={28} />,
      title: 'Feedback',
      description: 'Share your thoughts and suggestions',
      path: '/feedback',
      color: '#f59e0b',
      bg: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(245,158,11,0.25))'
    },
    {
      icon: <Calculator size={28} />,
      title: 'Zakat Calculator',
      description: 'Easily calculate your annual Zakat on gold',
      path: '/zakat',
      color: '#9333ea',
      bg: 'linear-gradient(135deg, rgba(147,51,234,0.1), rgba(147,51,234,0.25))'
    }
  ];

  return (
    <Container className="py-5">
      {/* Header */}
      <div className="text-center mb-5">
        <h3 className="fw-bold mb-2" style={{ color: '#14532d' }}>More Options</h3>
        <p className="text-muted fs-6 mb-3">Explore additional features and settings</p>
        <div
          style={{
            width: '80px',
            height: '4px',
            background: 'linear-gradient(90deg, #14532d, #22c55e)',
            borderRadius: '10px',
            margin: '0 auto'
          }}
        ></div>
      </div>

      {/* Options Grid */}
      <Row xs={1} md={2} className="g-4">
        {options.map((option, index) => (
          <Col key={index}>
            <Card
              onClick={() => navigate(option.path)}
              className="more-card border-0 shadow-lg rounded-4 glassy-card"
              style={{
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(12px)'
              }}
            >
              <Card.Body className="d-flex align-items-center p-4">
                <div
                  className="d-flex align-items-center justify-content-center rounded-4 me-3"
                  style={{
                    width: 56,
                    height: 56,
                    background: option.bg,
                    color: option.color,
                    transition: 'all 0.3s ease'
                  }}
                >
                  {option.icon}
                </div>
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-center">
                    <Card.Title className="mb-1 fs-5 fw-semibold text-dark">
                      {option.title}
                    </Card.Title>
                    <Badge
                      bg="light"
                      text="dark"
                      style={{
                        fontSize: '0.75rem',
                        border: `1px solid ${option.color}`,
                        color: option.color,
                        backgroundColor: 'rgba(255,255,255,0.6)'
                      }}
                    >
                      Open
                    </Badge>
                  </div>
                  <Card.Text className="text-muted mt-1">{option.description}</Card.Text>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <style>{`
        .glassy-card {
          border-radius: 20px;
          box-shadow: 0 6px 18px rgba(0,0,0,0.08);
        }

        .glassy-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 10px 28px rgba(0,0,0,0.12);
          background: rgba(255,255,255,0.95);
        }

        .glassy-card:hover .rounded-4 {
          transform: scale(1.05);
          background: linear-gradient(135deg, #22c55e, #15803d);
          color: #fff !important;
        }

        .rounded-4 {
          transition: all 0.3s ease;
        }
      `}</style>
    </Container>
  );
};

export default More;
