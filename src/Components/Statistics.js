// client/Components/Statistics.js
import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart as BarChartIcon,
  PieChart,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  DollarSign
} from 'lucide-react';
import { Container, Row, Col, Button, Card, Table, ButtonGroup } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { setRecords } from '../Features/RecordsSlice';
import axios from 'axios';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF6384', '#36A2EB'];

const Statistics = () => {
  const [timeframe, setTimeframe] = useState('month');
  const dispatch = useDispatch();
  const records = useSelector((state) => state.records);
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userEmail = storedUser?.email;

  // Fetch all records on initial load
  useEffect(() => {
    if (!userEmail) return;
    const fetchRecords = async () => {
      try {
        const res = await axios.get(`https://maliyah-server.onrender.com/records/${userEmail}`);
        dispatch(setRecords(res.data));
      } catch (err) {
        console.error('Failed to fetch records:', err);
      }
    };
    fetchRecords();
  }, [userEmail, dispatch]);

  // Filter records based on timeframe
  const filteredRecords = useMemo(() => {
    const now = new Date();
    return records.filter(record => {
      const date = new Date(record.startDate);
      if (timeframe === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return date >= weekAgo && date <= now;
      } else if (timeframe === 'month') {
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      } else if (timeframe === 'year') {
        return date.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }, [records, timeframe]);

  // Process totals and charts
  const { totalIncome, totalExpenses, netSavings, savingsRate, expenseBreakdown, monthlyTrend } = useMemo(() => {
    let income = 0;
    let expenses = 0;
    const breakdownMap = {};
    const trendMap = {};

    filteredRecords.forEach(record => {
      const month = new Date(record.startDate).toLocaleString('default', { month: 'short' });
      if (!trendMap[month]) trendMap[month] = { month, income: 0, expenses: 0 };

      if (record.type === 'income') {
        income += record.amount;
        trendMap[month].income += record.amount;
      } else {
        expenses += record.amount;
        trendMap[month].expenses += record.amount;
        breakdownMap[record.category] = (breakdownMap[record.category] || 0) + record.amount;
      }
    });

    const totalSavings = income - expenses;
    const savingsPercent = income ? ((totalSavings / income) * 100).toFixed(1) : 0;

    const breakdown = Object.keys(breakdownMap).map(key => ({
      category: key,
      amount: breakdownMap[key],
      percentage: ((breakdownMap[key] / expenses) * 100).toFixed(1)
    }));

    const trend = Object.values(trendMap).sort((a, b) => {
      const monthOrder = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
    });

    return {
      totalIncome: income,
      totalExpenses: expenses,
      netSavings: totalSavings,
      savingsRate: savingsPercent,
      expenseBreakdown: breakdown,
      monthlyTrend: trend
    };
  }, [filteredRecords]);

  return (
    <Container className="mt-4">
      {/* Header & timeframe buttons */}
      <Row className="mb-4 justify-content-between align-items-center">
        <Col>
          <h4 className="fw-bold mb-0">Financial Statistics</h4>
          <p className="text-muted">Track your financial performance and trends</p>
        </Col>
        <Col className="text-end">
          <ButtonGroup>
            {['week', 'month', 'year'].map(period => (
              <Button
                key={period}
                variant={timeframe === period ? 'primary' : 'outline-secondary'}
                onClick={() => setTimeframe(period)}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Button>
            ))}
          </ButtonGroup>
        </Col>
      </Row>

      {/* Summary Cards */}
      <Row className="mb-4">
        {[
          { title: 'Total Income', value: `OMR ${totalIncome.toFixed(2)}`, icon: <TrendingUp size={24} className="text-success" />, bg: 'success', change: '+3.2%' },
          { title: 'Total Expenses', value: `OMR ${totalExpenses.toFixed(2)}`, icon: <BarChartIcon size={24} className="text-danger" />, bg: 'danger', change: '-2.1%', down: true },
          { title: 'Net Savings', value: `OMR ${netSavings.toFixed(2)}`, icon: <DollarSign size={24} className="text-primary" />, bg: 'primary', change: '+5.8%' },
          { title: 'Savings Rate', value: `${savingsRate}%`, icon: <PieChart size={24} className="text-warning" />, bg: 'warning', change: '+1.5%' }
        ].map((card, idx) => (
          <Col md={6} lg={3} key={idx}>
            <Card className="dashboard-card border-0 mb-3">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div className={`bg-${card.bg} bg-opacity-10 p-2 rounded`}>{card.icon}</div>
                  <span className={`d-flex align-items-center ${card.down ? 'text-danger' : 'text-success'}`}>
                    {card.down ? <ArrowDown size={16} className="me-1" /> : <ArrowUp size={16} className="me-1" />}
                    {card.change}
                  </span>
                </div>
                <Card.Subtitle className="mb-1 text-muted">{card.title}</Card.Subtitle>
                <Card.Title>{card.value}</Card.Title>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Charts Section */}
      <Row className="mb-4">
        <Col lg={6}>
          <Card className="dashboard-card border-0 mb-3">
            <Card.Body>
              <Card.Title>Income vs Expenses Trend</Card.Title>
              {monthlyTrend.length === 0 ? (
                <div className="text-center text-muted py-5">
                  <BarChartIcon size={48} className="mb-3" />
                  <p>No data yet</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyTrend}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="income" fill="#00C49F" animationDuration={1500} />
                    <Bar dataKey="expenses" fill="#FF6384" animationDuration={1500} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col lg={6}>
          <Card className="dashboard-card border-0 mb-3">
            <Card.Body>
              <Card.Title>Expense Breakdown</Card.Title>
              {expenseBreakdown.length === 0 ? (
                <div className="text-center text-muted py-5">
                  <PieChart size={48} className="mb-3" />
                  <p>No data yet</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <RePieChart>
                    <Pie
                      data={expenseBreakdown}
                      dataKey="amount"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      label
                      isAnimationActive={true}
                    >
                      {expenseBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                  </RePieChart>
                </ResponsiveContainer>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Expense Table */}
      <Card className="dashboard-card border-0 mb-3">
        <Card.Body>
          <Card.Title>Expense Categories Breakdown</Card.Title>
          <div className="table-responsive mt-3">
            <Table hover>
              <thead>
                <tr>
                  <th>Category</th>
                  <th className="text-end">Amount</th>
                  <th className="text-end">% of Total</th>
                  <th className="text-end">Trend</th>
                </tr>
              </thead>
              <tbody>
                {expenseBreakdown.map((item, index) => (
                  <tr key={index}>
                    <td>{item.category}</td>
                    <td className="text-end">OMR {item.amount.toFixed(2)}</td>
                    <td className="text-end">{item.percentage}%</td>
                    <td className="text-end">
                      {index % 2 === 0 ? (
                        <span className="text-success d-flex justify-content-end align-items-center">
                          <ArrowUp size={16} className="me-1" /> 2.3%
                        </span>
                      ) : (
                        <span className="text-danger d-flex justify-content-end align-items-center">
                          <ArrowDown size={16} className="me-1" /> 1.5%
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Statistics;

