import React, { useState, useEffect, useMemo } from 'react';
import {
  Container, Row, Col, Form, Button, Table,
  Alert, ButtonGroup, Card, Modal
} from 'react-bootstrap';
import {
  Plus, Trash2, Edit,
  TrendingUp, BarChart as BarChartIcon, DollarSign,
  ArrowUp, ArrowDown
} from 'lucide-react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories } from '../Features/categorySlice';
import { setRecords, addRecord, deleteRecord, updateRecord } from '../Features/RecordsSlice';
import { formatDateTimeDDMMYYYY, getCurrentDateTimeForInput } from '../utils/dateUtils';

const formatForDateTimeLocal = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const pad = (n) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const AddRecord = () => {
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(getCurrentDateTimeForInput());
  const [type, setType] = useState('expense');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showActions, setShowActions] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState(null);
  const [editRecord, setEditRecord] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });

  const storedUser = JSON.parse(localStorage.getItem('user'));
  const userEmail = storedUser?.email;

  const dispatch = useDispatch();
  const { list: categories } = useSelector((state) => state.categories);
  const records = useSelector((state) => state.records);

  useEffect(() => {
    if (userEmail) dispatch(fetchCategories(userEmail));
  }, [dispatch, userEmail]);

  useEffect(() => {
    const fetchRecords = async () => {
      if (!userEmail) return;
      try {
        const res = await axios.get(`https://maliyah-server.onrender.com/records/${userEmail}`);
        dispatch(setRecords(res.data));
      } catch (err) {
        console.error('Error fetching records:', err);
        setErrorMessage('Failed to fetch records.');
        setTimeout(() => setErrorMessage(''), 3000);
      }
    };
    fetchRecords();
  }, [userEmail, dispatch]);

  const filteredOptions = useMemo(() => {
    const want = String(type).toLowerCase();
    return (categories || [])
      .filter((c) => String(c.type || '').toLowerCase() === want)
      .sort((a, b) => String(a.name).localeCompare(String(b.name)));
  }, [categories, type]);

  useEffect(() => {
    if (!categoryId) return;
    const exists = filteredOptions.some((c) => c._id === categoryId);
    if (!exists) {
      setCategory('');
      setCategoryId('');
    }
  }, [type, filteredOptions]);

  useEffect(() => {
    if (editMode && editRecord) {
      const match = filteredOptions.find((c) => c._id === editRecord.categoryId);
      if (match) {
        setCategoryId(match._id);
        setCategory(match.name);
      } else if (editRecord.categoryId) {
        setCategoryId(editRecord.categoryId);
        setCategory(editRecord.category || '');
      }
    }
  }, [filteredOptions, editMode, editRecord]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userEmail) return setErrorMessage('You must be logged in.');
    if (!amount || !description) return setErrorMessage('Please fill in all required fields.');
    if (parseFloat(amount) < 0) {
      setErrorMessage('Amount cannot be negative.');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    if (type === 'expense' && !categoryId) return setErrorMessage('Please choose a category.');

    const totalIncome = records.filter((r) => r.type === 'income').reduce((sum, r) => sum + r.amount, 0);
    const totalExpense = records.filter((r) => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0);
    const currentBalance = totalIncome - totalExpense;

    if (type === 'expense' && parseFloat(amount) > currentBalance) {
      setErrorMessage(`Insufficient balance! Current balance: OMR ${currentBalance.toFixed(2)}`);
      setTimeout(() => setErrorMessage(''), 4000);
      return;
    }

    const transaction = {
      amount: parseFloat(amount),
      category,
      categoryId,
      description,
      startDate,
      type,
      userEmail,
    };

    try {
      if (editMode) {
        const res = await axios.put(`https://maliyah-server.onrender.com/records/${editingRecordId}`, transaction);
        dispatch(updateRecord(res.data));
        setSuccessMessage('Record updated successfully!');
      } else {
        const res = await axios.post('https://maliyah-server.onrender.com/records', transaction);
        dispatch(addRecord(res.data));
        setSuccessMessage('Record added successfully!');
      }

      setShowSuccess(true);
      setAmount('');
      setCategory('');
      setCategoryId('');
      setDescription('');
      setStartDate(getCurrentDateTimeForInput());
      setType('expense');
      setEditMode(false);
      setEditingRecordId(null);
      setEditRecord(null);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Operation failed.');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const confirmDelete = (id, categoryName) => {
    if (categoryName === 'Goal Allocation') return;
    setDeleteConfirm({ show: true, id });
  };

  const handleDelete = async () => {
    if (!deleteConfirm.id) return;
    try {
      await axios.delete(`https://maliyah-server.onrender.com/records/${deleteConfirm.id}`);
      dispatch(deleteRecord(deleteConfirm.id));
      setDeleteConfirm({ show: false, id: null });
      setShowSuccess(true);
      setSuccessMessage('Record deleted successfully!');
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      setErrorMessage('Failed to delete record.');
      setTimeout(() => setErrorMessage(''), 3000);
      setDeleteConfirm({ show: false, id: null });
    }
  };

  const handleEdit = (record) => {
    if (record.category === 'Goal Allocation') return;
    setEditRecord(record);
    setType(record.type || 'expense');
    setAmount(record.amount?.toString() ?? '');
    setDescription(record.description ?? '');
    setStartDate(formatForDateTimeLocal(record.startDate));
    setEditingRecordId(record._id);

    const match = filteredOptions.find(c => c._id === record.categoryId);
    if (match) {
      setCategoryId(match._id);
      setCategory(match.name);
    } else {
      setCategoryId(record.categoryId || '');
      setCategory(record.category || '');
    }
    setEditMode(true);
  };

  const displayLocalTime = formatDateTimeDDMMYYYY;
  const totalIncome = records.filter((r) => r.type === 'income').reduce((sum, r) => sum + r.amount, 0);
  const totalExpense = records.filter((r) => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0);
  const currentBalance = totalIncome - totalExpense;

  return (
    <Container className="py-4">
      <Col>
        <h4 className="fw-bold mb-0">{editMode ? 'Edit Transaction' : 'Add New Transaction'}</h4>
        <p className="text-muted">Record your income or expenses</p>
      </Col>

      {showSuccess && <Alert variant="success">{successMessage}</Alert>}
      {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

      {/* Summary Cards */}
      <Row className="mb-4">
        {[{
          title: 'Current Balance',
          value: `OMR ${currentBalance.toFixed(2)}`,
          icon: <DollarSign size={24} className="text-primary" />,
          bg: 'primary',
          change: currentBalance >= 0 ? '+5.8%' : '-5.8%',
          down: currentBalance < 0,
        }, {
          title: 'Total Expenses',
          value: `OMR ${totalExpense.toFixed(2)}`,
          icon: <BarChartIcon size={24} className="text-danger" />,
          bg: 'danger',
          change: '-2.1%',
          down: true,
        }, {
          title: 'Total Income',
          value: `OMR ${totalIncome.toFixed(2)}`,
          icon: <TrendingUp size={24} className="text-success" />,
          bg: 'success',
          change: '+3.2%',
        }].map((card, idx) => (
          <Col md={6} lg={4} key={idx}>
            <Card className="dashboard-card border-0 shadow-sm mb-3">
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

      {/* Transaction Form */}
      <Card className="rounded-4 shadow-sm border-0 p-4 mb-4">
        <Card.Body className="p-0">
          <ButtonGroup className="mb-4 w-100 gap-2">
            <Button variant={type === 'expense' ? 'danger' : 'outline-secondary'} onClick={() => setType('expense')}>Expense</Button>
            <Button variant={type === 'income' ? 'success' : 'outline-secondary'} onClick={() => setType('income')}>Income</Button>
          </ButtonGroup>

          <Form onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Label>Amount</Form.Label>
                <Form.Control
                  type="text"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
                      setAmount(value);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === '-' || e.key === 'e' || e.key === 'E') e.preventDefault();
                  }}
                  required
                />
              </Col>
              <Col md={6}>
                <Form.Label>Date & Time</Form.Label>
                <Form.Control
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Label>Description</Form.Label>
                <Form.Control type="text" value={description} onChange={(e) => setDescription(e.target.value)} required />
              </Col>
              <Col md={6}>
                <Form.Label>Category ({type})</Form.Label>
                <Form.Select
                  value={categoryId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setCategoryId(id);
                    const match = filteredOptions.find((c) => c._id === id);
                    setCategory(match?.name || '');
                  }}
                  required={type === 'expense'}
                >
                  <option value="">Select a {type} category</option>
                  {filteredOptions.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </Form.Select>
              </Col>
            </Row>

            <div className="d-flex justify-content-end gap-2">
              <Button
                variant="outline-secondary"
                onClick={() => {
                  setAmount('');
                  setCategory('');
                  setCategoryId('');
                  setDescription('');
                  setStartDate(getCurrentDateTimeForInput());
                  setType('expense');
                  setEditMode(false);
                  setEditingRecordId(null);
                  setEditRecord(null);
                  setErrorMessage('');
                }}
              >
                Clear
              </Button>
              <Button type="submit" variant="primary" className="d-flex align-items-center">
                <Plus size={16} className="me-2" />
                {editMode ? 'Update Record' : 'Add Record'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      {/* Records Table */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5 className="fw-semibold">Records Transactions</h5>
        <Button variant="outline-primary" size="sm" onClick={() => setShowActions(!showActions)}>
          {showActions ? 'Exit Edit Mode' : 'Edit Records'}
        </Button>
      </div>

      {records.length === 0 ? (
        <p className="text-muted">No Records yet.</p>
      ) : (
        <Table responsive hover className="rounded-3 overflow-hidden shadow-sm">
          <thead className="table-light">
            <tr>
              <th>Description</th>
              <th>Category</th>
              <th>Date & Time</th>
              <th className="text-end">Amount</th>
              {showActions && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {[...records]
              .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
              .map((t) => {
                const categoryName = filteredOptions.find(c => c._id === t.categoryId)?.name || t.category;
                return (
                  <tr key={t._id}>
                    <td>{t.description}</td>
                    <td>{categoryName}</td>
                    <td>{displayLocalTime(t.startDate)}</td>
                    <td className={`text-end ${t.type === 'income' ? 'text-success' : 'text-danger'}`}>
                      {t.type === 'income' ? '+' : '-'} OMR {Math.abs(t.amount).toFixed(2)}
                    </td>
                    {showActions && (
                      <td className="text-center">
                        {t.category !== 'Goal Allocation' ? (
                          <>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="me-2"
                              onClick={() => handleEdit(t)}
                            >
                              <Edit size={16} />
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => confirmDelete(t._id, t.category)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </>
                        ) : null}
                      </td>
                    )}
                  </tr>
                );
              })}
          </tbody>
        </Table>
      )}

      {/* Delete Confirmation Modal */}
      <Modal show={deleteConfirm.show} onHide={() => setDeleteConfirm({ show: false, id: null })} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>Do you want to delete this record?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDeleteConfirm({ show: false, id: null })}>No</Button>
          <Button variant="danger" onClick={handleDelete}>Yes, Delete</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AddRecord;
