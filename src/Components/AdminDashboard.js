//AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from "../Features/UserSlice";
import axios from 'axios';
import { Users, LogOut, Edit, Trash2, Plus, Search, Tag, Check, X, Star } from 'lucide-react';
import { Container, Row, Col, Button, Table, Form, Modal, Badge, InputGroup, FormControl, Alert } from 'react-bootstrap';
import { formatDateDDMMYYYY } from '../utils/dateUtils';
 
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
 
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', type: 'Expense', description: '' });
  const [newErrorMessage, setNewErrorMessage] = useState('');
 
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [editErrorMessage, setEditErrorMessage] = useState('');
 
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
 
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const adminEmail = "maliyahmlk@gmail.com";
 
  // Fetch users
  useEffect(() => {
    setLoading(true);
    axios.get('http://localhost:8080/admin/users')
      .then(res => { setUsers(res.data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);
 
  // Fetch categories
  useEffect(() => {
    if (activeTab === 'categories') {
      setLoading(true);
      axios.get(`http://localhost:8080/categories/${adminEmail}`)
        .then(res => { setCategories(res.data); setLoading(false); })
        .catch(err => { console.error(err); setLoading(false); });
    }
  }, [activeTab]);
 
  // Fetch feedbacks
  useEffect(() => {
    if (activeTab === 'feedback') {
      setLoading(true);
      axios.get('http://localhost:8080/feedback')
        .then(res => { setFeedbacks(res.data); setLoading(false); })
        .catch(err => { console.error(err); setLoading(false); });
    }
  }, [activeTab]);
 
  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };
 
  const filteredData = () => {
    if (activeTab === 'users') {
      return users.filter(user => user.email.toLowerCase().includes(searchTerm.toLowerCase()));
    } else if (activeTab === 'categories') {
      return categories.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return [];
  };
 
  const badgeVariant = (type) => (type === 'Income' ? 'success' : 'danger');
 
  // Check duplicate category
  const isDuplicateCategory = (name, type) => {
    return categories.some(
      cat =>
        cat.type.toLowerCase() === type.toLowerCase() &&
        cat.name.toLowerCase() === name.toLowerCase()
    );
  };
 
  // Create new category
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    setNewErrorMessage('');
 
    if (!newCategory.name) {
      setNewErrorMessage('Category name is required');
      return;
    }
 
    if (isDuplicateCategory(newCategory.name, newCategory.type)) {
      setNewErrorMessage('Category already exists');
      return;
    }
 
    try {
      const res = await axios.post('http://localhost:8080/categories', {
        name: newCategory.name,
        type: newCategory.type,
        description: newCategory.description,
        userEmail: null
      });
      setCategories([res.data, ...categories]);
      setNewCategory({ name: '', type: 'Expense', description: '' });
      setShowNewCategoryModal(false);
      setSuccessMessage('Category created successfully!');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      setNewErrorMessage(err.response?.data?.message || 'Failed to create category');
    }
  };
 
  // Open edit modal
  const openEditModal = (category) => {
    setEditCategory({ ...category });
    setEditErrorMessage('');
    setShowEditCategoryModal(true);
  };
 
  // Update category
  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    setEditErrorMessage('');
 
    if (!editCategory.name) {
      setEditErrorMessage('Category name is required');
      return;
    }
 
    // Duplicate check for edit, ignoring current category
    if (categories.some(
      cat => cat._id !== editCategory._id &&
        cat.type.toLowerCase() === editCategory.type.toLowerCase() &&
        cat.name.toLowerCase() === editCategory.name.toLowerCase()
    )) {
      setEditErrorMessage('Category with the same name and type already exists');
      return;
    }
 
    try {
      const res = await axios.put(`http://localhost:8080/categories/${editCategory._id}`, {
        name: editCategory.name,
        type: editCategory.type,
        description: editCategory.description
      });
      setCategories(categories.map(cat => cat._id === res.data._id ? res.data : cat));
      setShowEditCategoryModal(false);
      setSuccessMessage('Category updated successfully!');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      setEditErrorMessage(err.response?.data?.message || 'Failed to update category');
    }
  };
 
  // Delete category
  const deleteCategory = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/categories/${id}`);
      setCategories(categories.filter(cat => cat._id !== id));
      setSuccessMessage('Category deleted successfully!');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error('Error deleting category:', err);
    }
  };
 
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <div className="bg-white border-bottom border-gray-200">
        <Container fluid="md" className="py-3 d-flex justify-content-between align-items-center">
          <h1 className="h4 fw-bold mb-0 text-dark">Admin Dashboard</h1>
          <Button variant="link" className="text-secondary d-flex align-items-center" onClick={handleLogout}>
            <LogOut size={20} className="me-2" /> Logout
          </Button>
        </Container>
      </div>
 
      {/* Main Content */}
      <Container fluid="md" className="py-4">
        {showSuccess && (
          <Alert variant="success" className="d-flex align-items-center">
            <Check size={20} className="me-2" />
            <span>{successMessage}</span>
            <Button variant="link" className="ms-auto p-0 text-success" onClick={() => setShowSuccess(false)}>
              <X size={16} />
            </Button>
          </Alert>
        )}
 
        {/* Tabs */}
        <Row className="mb-4">
          <Col className="d-flex">
            <Button variant={activeTab === 'users' ? 'primary' : 'outline-secondary'} className="me-2 d-flex align-items-center" onClick={() => setActiveTab('users')}>
              <Users size={20} className="me-2" /> Users
            </Button>
            <Button variant={activeTab === 'categories' ? 'primary' : 'outline-secondary'} className="me-2 d-flex align-items-center" onClick={() => setActiveTab('categories')}>
              <Tag size={20} className="me-2" /> Categories
            </Button>
            <Button variant={activeTab === 'feedback' ? 'primary' : 'outline-secondary'} className="d-flex align-items-center" onClick={() => setActiveTab('feedback')}>
              <Star size={20} className="me-2" /> Feedback
            </Button>
          </Col>
        </Row>
 
        {/* Search & Add */}
        <Row className="mb-4 align-items-center">
          <Col md={6} lg={5} xl={4}>
            <InputGroup>
              <InputGroup.Text><Search size={20} /></InputGroup.Text>
              <FormControl placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </InputGroup>
          </Col>
          <Col className="d-flex justify-content-end gap-2">
            {activeTab === 'categories' && (
              <Button variant="primary" className="d-flex align-items-center" onClick={() => setShowNewCategoryModal(true)}>
                <Plus size={20} className="me-2" /> Add Category
              </Button>
            )}
          </Col>
        </Row>
 
        {/* Tables */}
        <div className="bg-white rounded shadow-sm">
          {/* Users Table */}
          {activeTab === 'users' && (
            <Table responsive hover className="mb-0">
              <thead className="table-light text-secondary text-uppercase small">
                <tr><th>Name</th><th>Email</th><th>Created At</th></tr>
              </thead>
              <tbody>
                {loading ? <tr><td colSpan="3" className="text-center py-3 text-muted">Loading...</td></tr>
                : filteredData().length === 0 ? <tr><td colSpan="3" className="text-center py-3 text-muted">No users found.</td></tr>
                : filteredData().map(user => (
                  <tr key={user._id}>
                    <td>{user.uname || 'N/A'}</td>
                    <td>{user.email}</td>
                    <td>{formatDateDDMMYYYY(user.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
 
          {/* Categories Table */}
          {activeTab === 'categories' && (
            <Table responsive hover className="mb-0">
              <thead className="table-light text-secondary text-uppercase small">
                <tr>
                  <th>Name</th><th>Type</th><th>Description</th><th>Created At</th><th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? <tr><td colSpan="5" className="text-center py-3 text-muted">Loading...</td></tr>
                : filteredData().length === 0 ? <tr><td colSpan="5" className="text-center py-3 text-muted">No categories found.</td></tr>
                : filteredData().map(cat => (
                  <tr key={cat._id}>
                    <td>{cat.name}</td>
                    <td><Badge bg={badgeVariant(cat.type)} className="text-capitalize px-2 py-1">{cat.type}</Badge></td>
                    <td>{cat.description}</td>
                    <td>{formatDateDDMMYYYY(cat.createdAt)}</td>
                    <td className="text-end">
                      <Button variant="link" size="sm" className="text-primary me-3 p-0" onClick={() => openEditModal(cat)}><Edit size={18} /></Button>
                      <Button variant="link" size="sm" className="text-danger p-0" onClick={() => deleteCategory(cat._id)}><Trash2 size={18} /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
 
          {/* Feedback Table */}
          {activeTab === 'feedback' && (
            <Table responsive hover className="mb-0">
              <thead className="table-light text-secondary text-uppercase small">
                <tr><th>User Email</th><th>Rating</th><th>Comment</th><th>Submitted At</th></tr>
              </thead>
              <tbody>
                {loading ? <tr><td colSpan="4" className="text-center py-3 text-muted">Loading...</td></tr>
                : feedbacks.length === 0 ? <tr><td colSpan="4" className="text-center py-3 text-muted">No feedback yet.</td></tr>
                : feedbacks.map(fb => (
                  <tr key={fb._id}>
                    <td>{fb.userEmail}</td>
                    <td>{fb.rating} ⭐</td>
                    <td>{fb.comment}</td>
                    <td>{formatDateDDMMYYYY(fb.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </div>
      </Container>
 
      {/* New Category Modal */}
      <Modal show={showNewCategoryModal} onHide={() => setShowNewCategoryModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Add New Category</Modal.Title></Modal.Header>
        <Form onSubmit={handleCreateCategory}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" placeholder="Enter category name" value={newCategory.name} onChange={e => setNewCategory({ ...newCategory, name: e.target.value })} />
              {newErrorMessage && <Form.Text className="text-danger">{newErrorMessage}</Form.Text>}
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Type</Form.Label>
              <Form.Select value={newCategory.type} onChange={e => setNewCategory({ ...newCategory, type: e.target.value })}>
                <option value="Expense">Expense</option>
                <option value="Income">Income</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control as="textarea" rows={3} placeholder="Category description" value={newCategory.description} onChange={e => setNewCategory({ ...newCategory, description: e.target.value })} />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowNewCategoryModal(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Create</Button>
          </Modal.Footer>
        </Form>
      </Modal>
 
      {/* Edit Category Modal */}
      <Modal show={showEditCategoryModal} onHide={() => setShowEditCategoryModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Edit Category</Modal.Title></Modal.Header>
        <Form onSubmit={handleUpdateCategory}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" value={editCategory?.name || ''} onChange={e => setEditCategory({ ...editCategory, name: e.target.value })} />
              {editErrorMessage && <Form.Text className="text-danger">{editErrorMessage}</Form.Text>}
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Type</Form.Label>
              <Form.Select value={editCategory?.type || 'Expense'} onChange={e => setEditCategory({ ...editCategory, type: e.target.value })}>
                <option value="Expense">Expense</option>
                <option value="Income">Income</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control as="textarea" rows={3} value={editCategory?.description || ''} onChange={e => setEditCategory({ ...editCategory, description: e.target.value })} />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditCategoryModal(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Update</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};
 
export default AdminDashboard;
 
 
