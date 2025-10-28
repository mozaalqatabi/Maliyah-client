import React, { useState } from 'react';
import { Container, Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { FaCalculator, FaWeightHanging, FaCheck, FaTimes,  FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';


const Zakat = () => {
  const navigate = useNavigate();
  const [goldAssets, setGoldAssets] = useState([{ carat: 24, weight: 0 }]);
  const [showResult, setShowResult] = useState(false);
  const nisabThreshold = 5000;

  const goldCaratOptions = [
    { value: 24, label: '24K' },
    { value: 22, label: '22K' },
    { value: 21, label: '21K' },
    { value: 18, label: '18K' }
  ];

  const addGoldItem = () => {
    setGoldAssets([...goldAssets, { carat: 24, weight: 0 }]);
  };

  const removeGoldItem = (index) => {
    setGoldAssets(goldAssets.filter((_, i) => i !== index));
  };

  const updateGoldItem = (index, field, value) => {
    const newGoldAssets = [...goldAssets];
    newGoldAssets[index] = { ...newGoldAssets[index], [field]: value };
    setGoldAssets(newGoldAssets);
  };

  const calculateTotalGoldValue = () => {
    return goldAssets.reduce((sum, asset) => {
      const pricePerGram =
        asset.carat === 24 ? 25 :
        asset.carat === 22 ? 23 :
        asset.carat === 21 ? 22 :
        19; // 18K
      return sum + (asset.weight * pricePerGram);
    }, 0);
  };

  const calculateZakat = () => {
    return calculateTotalGoldValue() * 0.025;
  };

  const totalAssets = calculateTotalGoldValue();
  const zakatAmount = calculateZakat();
  const isZakatObligatory = totalAssets >= nisabThreshold;

  return (
    <Container className="py-4">
      <div
      onClick={() => navigate('/more')}
      style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', marginBottom: 16 }}
      title="Back to More Options"
      aria-label="Back to More Options"
    >
      <FaArrowLeft size={24} />
    </div>
      <div className="mb-4">
         <h4 className="fw-bold mb-0">Gold Zakat Calculator</h4>
        
        <p className="text-muted">Calculate your annual Zakat on gold assets</p>
      </div>

      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0 d-flex align-items-center text-warning">
              <FaWeightHanging className="me-2" />
              Gold Assets
            </h5>
            <Button variant="warning" size="sm" onClick={addGoldItem}>
              Add Gold Item
            </Button>
          </div>

          {goldAssets.map((asset, index) => (
            <Card key={index} className="mb-3 bg-warning bg-opacity-10">
              <Card.Body>
                <div className="d-flex justify-content-between mb-3">
                  <h6 className="fw-medium mb-0">Gold Item {index + 1}</h6>
                  {goldAssets.length > 1 && (
                    <Button
                      variant="link"
                      className="text-danger p-0"
                      onClick={() => removeGoldItem(index)}
                    >
                      <FaTimes />
                    </Button>
                  )}
                </div>
                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Label>Gold Carat</Form.Label>
                    <Form.Select
                      value={asset.carat}
                      onChange={(e) =>
                        updateGoldItem(index, 'carat', Number(e.target.value))
                      }
                    >
                      {goldCaratOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label>Weight (grams)</Form.Label>
                    <Form.Control
                      type="number"
                      value={asset.weight}
                      onChange={(e) =>
                        updateGoldItem(index, 'weight', Number(e.target.value))
                      }
                      placeholder="0"
                      min="0"
                      step="0.1"
                    />
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          ))}

          <div className="pt-3 border-top">
            <Button
              variant="primary"
              className="w-100 d-flex justify-content-center align-items-center"
              onClick={() => setShowResult(true)}
            >
              <FaCalculator className="me-2" />
              Calculate Zakat
            </Button>
          </div>
        </Card.Body>
      </Card>

      {showResult && (
        <Card>
          <Card.Body>
            <h5 className="fw-semibold mb-4">Calculation Results</h5>

            <Alert variant="warning" className="d-flex justify-content-between">
              <span>Total Gold Value</span>
              <strong>OMR {totalAssets.toFixed(3)}</strong>
            </Alert>

            <Alert variant="secondary" className="d-flex justify-content-between">
              <span>Nisab Threshold</span>
              <strong>OMR {nisabThreshold.toFixed(3)}</strong>
            </Alert>

            <Alert
              variant={isZakatObligatory ? 'info' : 'warning'}
              className="d-flex align-items-center"
            >
              {isZakatObligatory ? (
                <FaCheck className="me-2 text-info" />
              ) : (
                <FaTimes className="me-2 text-warning" />
              )}
              <span>
                {isZakatObligatory
                  ? 'Zakat is obligatory'
                  : 'Gold value below Nisab threshold - Zakat not obligatory'}
              </span>
            </Alert>

            {isZakatObligatory && (
              <Alert variant="success">
                <div className="d-flex justify-content-between">
                  <span className="fw-medium">Zakat Amount Due</span>
                  <span className="fw-bold">OMR {zakatAmount.toFixed(3)}</span>
                </div>
                <div className="text-muted mt-2">
                  This amount represents 2.5% of your total gold value
                </div>
              </Alert>
            )}
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default Zakat;
