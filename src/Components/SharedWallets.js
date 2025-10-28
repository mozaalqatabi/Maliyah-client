import React, { useState } from 'react';
import { Card, Button, Form, Row, Col, ListGroup, Modal } from 'react-bootstrap';
import { formatDateDDMMYYYY } from '../utils/dateUtils';

const SharedWallets = () => {
  const [wallets, setWallets] = useState([
    {
      id: 1,
      name: 'Family Budget',
      balance: 5000,
      transactions: 2,
      members: [
        { email: 'Kaltham@gmail.com', contribution: 3000 },
        { email: 'Lamya@gmail.com', contribution: 2000 }
      ],
      recentTransactions: [
        {
          type: 'Income',
          description: 'Monthly Contribution',
          amount: 1000,
          date: '5/1/2025'
        }
      ]
    }
  ]);
  const [selectedWalletId, setSelectedWalletId] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [transactionType, setTransactionType] = useState('Income');
  const [form, setForm] = useState({ amount: '', category: '', description: '' });

  // New states for Create Wallet
  const [showCreateWallet, setShowCreateWallet] = useState(false);
  const [newWalletName, setNewWalletName] = useState('');

  const handleWalletClick = (id) => {
    setSelectedWalletId(id);
  };

  const selectedWallet = wallets.find(w => w.id === selectedWalletId);

  const handleInvite = () => {
    if (!newMemberEmail) return;

    setWallets(prev =>
      prev.map(wallet =>
        wallet.id === selectedWalletId
          ? {
              ...wallet,
              members: [...wallet.members, { email: newMemberEmail, contribution: 0 }]
            }
          : wallet
      )
    );
    setNewMemberEmail('');
    setShowInviteModal(false);
  };

  const handleTransaction = () => {
    if (!form.amount || !form.category || !form.description) return;

    const amountNum = parseFloat(form.amount);
    const isIncome = transactionType === 'Income';

    setWallets(prev =>
      prev.map(wallet =>
        wallet.id === selectedWalletId
          ? {
              ...wallet,
              balance: isIncome ? wallet.balance + amountNum : wallet.balance - amountNum,
              transactions: wallet.transactions + 1,
              recentTransactions: [
                {
                  type: transactionType,
                  description: form.description,
                  amount: amountNum,
                  date: formatDateDDMMYYYY(new Date())
                },
                ...wallet.recentTransactions
              ]
            }
          : wallet
      )
    );

    setForm({ amount: '', category: '', description: '' });
  };

  const handleCreateWallet = () => {
    if (!newWalletName.trim()) return;

    const newWallet = {
      id: Date.now(),
      name: newWalletName.trim(),
      balance: 0,
      transactions: 0,
      members: [],
      recentTransactions: []
    };

    setWallets(prev => [...prev, newWallet]);
    setNewWalletName('');
    setShowCreateWallet(false);
  };

  return (
    <div className="p-4">
      <h3>Shared Wallets</h3>
      <p>Manage shared expenses with family and friends</p>

      {!selectedWalletId ? (
        <>
          {/* Create Wallet button on top right */}
          <div className="d-flex justify-content-end mb-3">
            <Button onClick={() => setShowCreateWallet(true)}>Create Shared Wallet</Button>
          </div>

          {/* Create wallet form */}
          {showCreateWallet && (
            <Card className="mb-3 p-3">
              <Form
                onSubmit={e => {
                  e.preventDefault();
                  handleCreateWallet();
                }}
              >
                <Row className="align-items-center">
                  <Col xs={8}>
                    <Form.Control
                      placeholder="New Wallet Name"
                      value={newWalletName}
                      onChange={e => setNewWalletName(e.target.value)}
                      autoFocus
                    />
                  </Col>
                  <Col xs={4}>
                    <Button type="submit" className="me-2">Create</Button>
                    <Button variant="secondary" onClick={() => setShowCreateWallet(false)}>
                      Cancel
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Card>
          )}

          <Row>
            {wallets.map(wallet => (
              <Col md={4} key={wallet.id}>
                <Card className="mb-3" onClick={() => handleWalletClick(wallet.id)} style={{ cursor: 'pointer' }}>
                  <Card.Body>
                    <Card.Title>{wallet.name}</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">{wallet.members.length} members</Card.Subtitle>
                    <Row className="mt-3">
                      <Col>
                        <div>Balance</div>
                        <strong>OMR {wallet.balance.toLocaleString()}</strong>
                      </Col>
                      <Col>
                        <div>Transactions</div>
                        <strong>{wallet.transactions}</strong>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </>
      ) : (
        <Card>
          <Card.Body>
            <Card.Title>{selectedWallet.name}</Card.Title>
            <div className="mb-3">
              <strong>Balance:</strong> OMR {selectedWallet.balance.toLocaleString()} <br />
              <strong>Transactions:</strong> {selectedWallet.transactions}
            </div>

            <div className="mb-3">
              <h5>Members</h5>
              <ListGroup>
                {selectedWallet.members.map((member, idx) => (
                  <ListGroup.Item key={idx}>
                    {member.email} — Contribution: OMR {member.contribution}
                  </ListGroup.Item>
                ))}
              </ListGroup>
              <Button variant="link" onClick={() => setShowInviteModal(true)}>
                + Invite
              </Button>
            </div>

            <div className="mb-4">
              <h5>Add Transaction</h5>
              <div className="mb-2">
                <Button
                  variant={transactionType === 'Expense' ? 'danger' : 'outline-danger'}
                  className="me-2"
                  onClick={() => setTransactionType('Expense')}
                >
                  Expense
                </Button>
                <Button
                  variant={transactionType === 'Income' ? 'success' : 'outline-success'}
                  onClick={() => setTransactionType('Income')}
                >
                  Income
                </Button>
              </div>

              <Form>
                <Row>
                  <Col>
                    <Form.Control
                      placeholder="Amount"
                      type="number"
                      value={form.amount}
                      onChange={e => setForm({ ...form, amount: e.target.value })}
                      className="mb-2"
                    />
                  </Col>
                  <Col>
                    <Form.Select
                      value={form.category}
                      onChange={e => setForm({ ...form, category: e.target.value })}
                      className="mb-2"
                    >
                      <option value="">Select Category</option>
                      <option value="Food">Food</option>
                      <option value="Utilities">Utilities</option>
                      <option value="Transport">Transport</option>
                    </Form.Select>
                  </Col>
                </Row>
                <Form.Control
                  placeholder="Description"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="mb-2"
                />
                <Button onClick={handleTransaction}>Add Transaction</Button>
              </Form>
            </div>

            <div>
              <h5>Recent Transactions</h5>
              <ListGroup>
                {selectedWallet.recentTransactions.map((tx, idx) => (
                  <ListGroup.Item key={idx} className="d-flex justify-content-between">
                    <div>
                      <strong>{tx.description}</strong> <br />
                      {tx.type} • {tx.date}
                    </div>
                    <div className={tx.type === 'Income' ? 'text-success' : 'text-danger'}>
                      {tx.type === 'Income' ? '+' : '-'}OMR {tx.amount.toLocaleString()}
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </div>

            <Button variant="secondary" className="mt-4" onClick={() => setSelectedWalletId(null)}>
              Back to Wallets
            </Button>
          </Card.Body>
        </Card>
      )}

      <Modal show={showInviteModal} onHide={() => setShowInviteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Invite Member</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Control
            placeholder="Enter email address"
            value={newMemberEmail}
            onChange={e => setNewMemberEmail(e.target.value)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowInviteModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleInvite}>
            Invite
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SharedWallets;
