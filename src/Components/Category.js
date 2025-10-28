import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Card, InputGroup, FormControl, Alert } from 'react-bootstrap';
import { FiPlus, FiTrash2, FiSearch, FiArrowLeft as ArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Categories = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const userEmail = user?.email;

  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', type: 'expense' });
  const [search, setSearch] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      if (!userEmail) return;
      try {
        const res = await axios.get(`http://localhost:8080/categories/${userEmail}`);
        setCategories(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, [userEmail]);

  const handleAddCategory = async () => {
    const trimmedName = newCategory.name.trim();

    if (!trimmedName) {
      setErrorMessage("Category name is required");
      return;
    }

    // Check for duplicate name (case-insensitive) with same type
    const duplicate = categories.some(
      cat =>
        cat.name.toLowerCase() === trimmedName.toLowerCase() &&
        cat.type.toLowerCase() === newCategory.type.toLowerCase()
    );

    if (duplicate) {
      setErrorMessage("Category with the same name and type already exists");
      return;
    }

    try {
      const res = await axios.post('http://localhost:8080/categories', {
        name: trimmedName,
        type: newCategory.type,
        userEmail
      });
      setCategories([res.data, ...categories]);
      setNewCategory({ name: '', type: 'expense' });
      setShowModal(false);
      setSuccessMessage('Category created successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      setErrorMessage('');
    } catch (err) {
      console.error(err);
      setErrorMessage(err.response?.data?.message || "Failed to create category");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/categories/${id}`);
      setCategories(categories.filter(cat => cat._id !== id));
      setSuccessMessage('Category deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setErrorMessage(err.response?.data?.message || "Failed to delete category");
    }
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container py-4">
      <div onClick={() => navigate('/more')} style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', marginBottom: 16 }}>
        <ArrowLeft size={24} />
      </div>
      <h3 className="mb-3">Categories</h3>
      <p className="text-muted mb-4">Manage your transaction categories</p>

      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3 mb-4">
        <InputGroup className="flex-grow-1">
          <InputGroup.Text><FiSearch /></InputGroup.Text>
          <FormControl
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </InputGroup>
        <Button variant="primary" onClick={() => {
          setErrorMessage(''); // Clear previous form errors when opening modal
          setShowModal(true);
        }}>
          <FiPlus className="me-2" /> Add Category
        </Button>
      </div>

      <Row xs={1} sm={2} md={3} lg={4} className="g-3">
        {filteredCategories.map(cat => (
          <Col key={cat._id}>
            <Card className="shadow-sm border-0 position-relative">
              <Card.Body>
                {cat.userEmail && (
                  <Button
                    variant="link"
                    className="position-absolute top-0 end-0 m-2 p-0 text-danger"
                    onClick={() => handleDelete(cat._id)}
                  >
                    <FiTrash2 />
                  </Button>
                )}
                <Card.Title as="h6" className="fw-bold mb-1">{cat.name}</Card.Title>
                <Card.Text
                  className={cat.type.toLowerCase() === 'income' ? 'text-success' : 'text-danger'}
                >
                  {cat.type}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Create Category</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter category name"
                value={newCategory.name}
                onChange={e => setNewCategory({ ...newCategory, name: e.target.value })}
              />
              {errorMessage && (
                <Form.Text className="text-danger">
                  {errorMessage}
                </Form.Text>
              )}
            </Form.Group>
            <Form.Group>
              <Form.Label>Type</Form.Label>
              <div className="d-flex gap-2">
                <Form.Check
                  inline
                  type="radio"
                  label="Expense"
                  name="type"
                  checked={newCategory.type === 'expense'}
                  onChange={() => setNewCategory({ ...newCategory, type: 'expense' })}
                />
                <Form.Check
                  inline
                  type="radio"
                  label="Income"
                  name="type"
                  checked={newCategory.type === 'income'}
                  onChange={() => setNewCategory({ ...newCategory, type: 'income' })}
                />
              </div>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleAddCategory}>
            <FiPlus className="me-2" /> Create
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Categories;
