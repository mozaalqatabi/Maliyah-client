import React, { useState, useEffect } from 'react';
import { Table, Form, Button, Row, Col, Card } from 'react-bootstrap';
import {
  FiDownload as Download,
  FiCalendar as Calendar,
  FiFilter as Filter,
  FiTag as Tag,
  FiArrowLeft as ArrowLeft
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { formatDateDDMMYYYY, getCurrentDateForInput } from '../utils/dateUtils';

const StatementReport = () => {
  const navigate = useNavigate();

  const [dateRange, setDateRange] = useState({
    start: getCurrentDateForInput(),
    end: getCurrentDateForInput(),
  });

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Get logged-in user email
  const storedUser = JSON.parse(localStorage.getItem('user'));
  const userEmail = storedUser?.email;

  // Fetch transactions from backend
  const fetchTransactions = async () => {
    if (!userEmail) return console.error('No user email found!');
    setLoading(true);
    try {
      const res = await axios.get(`https://maliyah-server.onrender.com/records/${userEmail}`);
      console.log('Fetched records:', res.data); // Debug
      setTransactions(res.data);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [userEmail]);

  // Filter transactions by startDate
  const filteredTransactions = transactions.filter((t) => {
    const tDate = new Date(t.startDate);
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    return tDate >= start && tDate <= end;
  });

  // Download CSV
  const downloadCSV = () => {
    if (filteredTransactions.length === 0) return;

    const headers = ['Date', 'Description', 'Category', 'Type', 'Amount'];
    const rows = filteredTransactions.map(t => [
      formatDateDDMMYYYY(t.startDate),
      `"${t.description.replace(/"/g, '""')}"`, // handle commas and quotes
      t.category,
      t.type,
      t.amount.toFixed(2)
    ]);

    const csvContent = [headers, ...rows]
      .map(e => e.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `statement_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 mx-auto" style={{ maxWidth: '1100px' }}>
      <div
        onClick={() => navigate('/more')}
        style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', marginBottom: 16 }}
        title="Back to More Options"
      >
        <ArrowLeft size={24} />
      </div>

      <div className="mb-4">
        <h4 className="fw-bold mb-0">Statement Report</h4>
        <p className="text-muted">Generate and download your financial statements</p>
      </div>

      {/* Filters */}
      <Card className="mb-5 shadow-sm border-0">
        <Card.Body>
          <Row className="g-3">
            <Col md={4}>
              <Form.Label>Start Date</Form.Label>
              <div className="position-relative">
                <Calendar className="position-absolute top-50 translate-middle-y ms-2 text-muted" size={16} />
                <Form.Control
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="ps-5"
                />
              </div>
            </Col>
            <Col md={4}>
              <Form.Label>End Date</Form.Label>
              <div className="position-relative">
                <Calendar className="position-absolute top-50 translate-middle-y ms-2 text-muted" size={16} />
                <Form.Control
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="ps-5"
                />
              </div>
            </Col>
            <Col md={4} className="d-flex align-items-end">
              <Button
                variant="primary"
                className="w-100 d-flex align-items-center justify-content-center"
                onClick={fetchTransactions}
              >
                <Filter size={16} className="me-2" />
                Apply Filters
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Transactions Table */}
      <Card className="mb-5 shadow-sm border-0">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Transaction History</h5>
          <Button
            variant="dark"
            className="d-flex align-items-center"
            onClick={downloadCSV}
          >
            <Download size={16} className="me-2" />
            Download Statement
          </Button>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table striped bordered hover className="mb-0">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th className="text-end">Amount</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="text-center py-3 text-muted">
                      Loading...
                    </td>
                  </tr>
                ) : filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-3 text-muted">
                      No records found.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <tr key={transaction._id}>
                      <td>{formatDateDDMMYYYY(transaction.startDate)}</td>
                      <td>{transaction.description}</td>
                      <td className="d-flex align-items-center">
                        <Tag size={16} className="me-2 text-muted" />
                        {transaction.category}
                      </td>
                      <td
                        className={`text-end fw-semibold ${
                          transaction.type === 'income' ? 'text-success' : 'text-danger'
                        }`}
                      >
                        {transaction.type === 'income' ? '+' : '-'}
                        {transaction.amount.toFixed(2)} OMR
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default StatementReport;

