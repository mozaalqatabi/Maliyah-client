
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Target,
  Plus,
  DollarSign,
  Coins,
  Wallet,
  TrendingUp,
  Check,
  Calendar,
  Bell
} from 'lucide-react';
import {
  Container,
  Row,
  Col,
  Button,
  Card,
  Modal,
  Form,
  Alert,
  ProgressBar,
  Toast,
  ToastContainer
} from 'react-bootstrap';
import { fetchFinancialSummary } from '../Features/DashboardSlice';

// Local date utilities (inlined from removed utils/dateUtils.js)
const formatDateDDMMYYYY = (date) => {
  if (!date) return '';
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
  return `${day}/${month}/${year}`;
};

// Return local YYYY-MM-DD suitable for <input type="date"> (avoids UTC shift)
const getCurrentDateForInput = (date = null) => {
  const d = date ? new Date(date) : new Date();
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};


const Goals = () => {
  const dispatch = useDispatch();
  const [editGoal, setEditGoal] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [insights, setInsights] = useState({ suggestions: [] });
  const [showInsightNotification, setShowInsightNotification] = useState(false);
  const [insightTimeoutId, setInsightTimeoutId] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(15);
  const [countdownIntervalId, setCountdownIntervalId] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [dismissedInsights, setDismissedInsights] = useState(() => {
    // Load dismissed insights from localStorage
    const stored = localStorage.getItem('dismissedInsights');
    const dismissedTimestamp = localStorage.getItem('dismissedInsightsTimestamp');
    
    // Clear dismissed insights if they're older than 24 hours
    const now = new Date().getTime();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    
    if (dismissedTimestamp && (now - parseInt(dismissedTimestamp)) > twentyFourHours) {
      localStorage.removeItem('dismissedInsights');
      localStorage.removeItem('dismissedInsightsTimestamp');
      return [];
    }
    
    return stored ? JSON.parse(stored) : [];
  });
  const [insightsEnabled, setInsightsEnabled] = useState(() => {
    // Get preference from localStorage, default to true
    const goalToggle = localStorage.getItem('goalInsightsEnabled');
    const prefs = localStorage.getItem('notificationPreferences');
    let notifPrefs = { goal: true };
    try {
      if (prefs) notifPrefs = JSON.parse(prefs);
    } catch (e) {
      // ignore malformed prefs and default to enabled
    }
    return (goalToggle !== 'false') && (notifPrefs.goal !== false);
  });
  
  // Get userId and financial data from Redux store
  const user = useSelector((state) => state.counter.user);
  const financialSummary = useSelector((state) => state.dashboard.financialSummary);
  const userId = user?._id;
  const userEmail = user?.email;
  const [goals, setGoals] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Use real current balance from financial summary, fallback to 0 if not loaded
  const currentBalance = financialSummary?.currentBalance || 0;
  // Fetch goals and financial data from backend
  React.useEffect(() => {
    if (!userId || !userEmail) return;
    
    // Fetch financial summary to get current balance
    dispatch(fetchFinancialSummary(userEmail));
    
    // Fetch categories from database
    fetch(`https://maliyah-server.onrender.com/categories/${userEmail}`)
      .then(res => res.json())
      .then(data => {
        // Extract category names for the dropdown
        const categoryNames = data.map(cat => cat.name);
        
        // Add some default categories if none exist, and always include "Other"
        const defaultCategories = ['Savings', 'Vehicle', 'Home', 'Education', 'Travel', 'Technology', 'Investment'];
        const allCategories = [...new Set([...categoryNames, ...defaultCategories, 'Other'])];
        
        setCategories(allCategories.sort());
      })
      .catch(() => {
        setCategories(['Savings', 'Vehicle', 'Home', 'Education', 'Travel', 'Technology', 'Investment', 'Other']);
      });
    
    // Fetch goals
    fetch(`https://maliyah-server.onrender.com/goals/${userId}`)
      .then(res => res.json())
      .then(data => setGoals(data))
      .catch(() => setGoals([]));

    // Fetch insights and show popup only if enabled
    if (insightsEnabled) {
      fetch(`https://maliyah-server.onrender.com/goals/insights/${userId}`)
        .then(res => res.json())
        .then(data => {
          if (data.suggestions && data.suggestions.length > 0) {
            // Filter out already dismissed insights
            const newSuggestions = data.suggestions.filter(suggestion => 
              !dismissedInsights.includes(suggestion)
            );
            
            if (newSuggestions.length > 0) {
              // Limit to top 2 new suggestions
              const limitedSuggestions = { ...data, suggestions: newSuggestions.slice(0, 2) };
              setInsights(limitedSuggestions);
              // Show notification after a short delay
              setTimeout(() => {
                setShowInsightNotification(true);
                setTimeRemaining(15);
                
                // Start countdown interval
                const intervalId = setInterval(() => {
                  setTimeRemaining(prev => {
                    // Don't countdown if paused
                    if (isPaused) return prev;
                    
                    if (prev <= 1) {
                      clearInterval(intervalId);
                      return 0;
                    }
                    return prev - 1;
                  });
                }, 1000);
                
                setCountdownIntervalId(intervalId);
                
                // Auto-close after 15 seconds if not manually closed
                const timeoutId = setTimeout(() => {
                  setShowInsightNotification(false);
                  clearInterval(intervalId);
                  setCountdownIntervalId(null);
                }, 15000);
                
                setInsightTimeoutId(timeoutId);
              }, 1000);
            }
          }
        })
        .catch(() => setInsights({ suggestions: [] }));
    } else {
      // Clear any running timers if insights are disabled
      if (insightTimeoutId) {
        clearTimeout(insightTimeoutId);
        setInsightTimeoutId(null);
      }
      if (countdownIntervalId) {
        clearInterval(countdownIntervalId);
        setCountdownIntervalId(null);
      }
      setShowInsightNotification(false);
    }
  }, [userId, userEmail, insightsEnabled, dispatch, goals.length]);

  // Cleanup timeout when component unmounts
  React.useEffect(() => {
    return () => {
      if (insightTimeoutId) {
        clearTimeout(insightTimeoutId);
      }
      if (countdownIntervalId) {
        clearInterval(countdownIntervalId);
      }
    };
  }, [insightTimeoutId, countdownIntervalId]);

  // Handle pause/resume of auto-close timer
  React.useEffect(() => {
    if (isPaused && insightTimeoutId) {
      clearTimeout(insightTimeoutId);
      setInsightTimeoutId(null);
    } else if (!isPaused && showInsightNotification && !insightTimeoutId && timeRemaining > 0) {
      // Resume with remaining time
      const timeoutId = setTimeout(() => {
        setShowInsightNotification(false);
        if (countdownIntervalId) {
          clearInterval(countdownIntervalId);
          setCountdownIntervalId(null);
        }
      }, timeRemaining * 1000);
      setInsightTimeoutId(timeoutId);
    }
  }, [isPaused, showInsightNotification, timeRemaining, countdownIntervalId]);

  // Function to clear dismissed insights (useful for testing or reset)
  const clearDismissedInsights = () => {
    localStorage.removeItem('dismissedInsights');
    localStorage.removeItem('dismissedInsightsTimestamp');
    setDismissedInsights([]);
  };

  // Listen for storage changes to detect when records are updated from other pages
  React.useEffect(() => {
    const handleStorageChange = (event) => {
      // Refresh financial data when records are updated
      if (event.key === 'recordsUpdated' || event.key === 'balanceUpdated') {
        if (userEmail) {
          dispatch(fetchFinancialSummary(userEmail));
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [userEmail, dispatch]);

  // Listen for focus events to refresh data when user returns to this page
  React.useEffect(() => {
    const handleFocus = () => {
      if (userEmail) {
        dispatch(fetchFinancialSummary(userEmail));
        
        // Also refresh categories in case user added new ones
        fetch(`https://maliyah-server.onrender.com/categories/${userEmail}`)
          .then(res => res.json())
          .then(data => {
            const categoryNames = data.map(cat => cat.name);
            const defaultCategories = ['Savings', 'Vehicle', 'Home', 'Education', 'Travel', 'Technology', 'Investment'];
            const allCategories = [...new Set([...categoryNames, ...defaultCategories, 'Other'])];
            setCategories(allCategories.sort());
          })
          .catch(() => {
            setCategories(['Savings', 'Vehicle', 'Home', 'Education', 'Travel', 'Technology', 'Investment', 'Other']);
          });
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [userEmail, dispatch]);

  // Listen for visibility change to refresh when page becomes visible
  React.useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && userEmail) {
        dispatch(fetchFinancialSummary(userEmail));
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [userEmail, dispatch]);

  // Periodic refresh to ensure data stays current
  React.useEffect(() => {
    if (!userEmail) return;

    const intervalId = setInterval(() => {
      dispatch(fetchFinancialSummary(userEmail));
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(intervalId);
  }, [userEmail, dispatch]);

  // Listen for changes to insights setting from other pages
  React.useEffect(() => {
    const handleStorageChange = (event) => {
      // Recompute enabled based on both explicit toggle and notification preferences
      const goalToggle = localStorage.getItem('goalInsightsEnabled');
      const prefs = localStorage.getItem('notificationPreferences');
      let notifPrefs = { goal: true };
      try { if (prefs) notifPrefs = JSON.parse(prefs); } catch (e) {}
      const enabled = (goalToggle !== 'false') && (notifPrefs.goal !== false);
      setInsightsEnabled(enabled);
      if (!enabled) {
        setShowInsightNotification(false);
        setInsights({ suggestions: [] });
      }
      // If notification preferences changed elsewhere, refresh financial summary when records update
      if (event && (event.key === 'recordsUpdated' || event.key === 'balanceUpdated')) {
        if (userEmail) dispatch(fetchFinancialSummary(userEmail));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  const [showAllocationModal, setShowAllocationModal] = useState(false);
  const [showNewGoalModal, setShowNewGoalModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [allocationAmount, setAllocationAmount] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [newGoal, setNewGoal] = useState({
    name: '',
    targetAmount: '',
    deadline: '',
    category: ''
  });
  // derive validation messages instead of storing them in state to keep code short
  const newGoalError = (() => {
    const raw = String(newGoal.targetAmount || '').trim();
    if (raw === '') return ''; // don't show until user types
    const n = Number(raw);
    if (!Number.isFinite(n) || n <= 1) return 'Target amount must be greater than 1 OMR';
    return '';
  })();

  const newGoalNameError = (() => {
    const raw = String(newGoal.name || '').trim();
    if (raw === '') return ''; // don't show until user types
    if (/^\s*\d+\s*$/.test(raw)) return 'Goal name must include letters and cannot be only numbers';
    return '';
  })();

  const editGoalError = (() => {
    if (!editGoal) return '';
    const raw = String(editGoal.targetAmount || '').trim();
    if (raw === '') return ''; // don't show until user edits
    const n = Number(raw);
    if (!Number.isFinite(n) || n <= 1 || n < (editGoal.currentAmount || 0))
      return 'Target must be > 1 and not less than current saved amount';
    return '';
  })();

  const editGoalNameError = (() => {
    if (!editGoal) return '';
    const raw = String(editGoal.name || '').trim();
    if (raw === '') return ''; // don't show until user edits
    if (/^\s*\d+\s*$/.test(raw)) return 'Goal name must include letters and cannot be only numbers';
    return '';
  })();

    // Handler to open edit modal and set selected goal
    const handleEditGoal = (goal) => {
      setEditGoal({ ...goal });
      setShowEditModal(true);
    };

    // Handler to delete a goal
    const handleDeleteGoal = (goalId) => {
      fetch(`https://maliyah-server.onrender.com/goals/${goalId}`, {
        method: 'DELETE',
      })
        .then(res => res.json())
        .then(() => {
          setGoals(goals.filter(g => g._id !== goalId));
          setSuccessMessage('Goal deleted successfully!');
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
            // Notify other pages and same-window listeners that goals changed
            const ts = Date.now().toString();
            localStorage.setItem('goalsUpdated', ts);
            // storage events don't fire in the same window, so dispatch a custom event too
            try { window.dispatchEvent(new CustomEvent('goalsUpdated', { detail: ts })); } catch (e) {}
        });
    };

    // Handler to update a goal
    const handleUpdateGoal = (e) => {
      e.preventDefault();
      // Client-side validation: target must be > 1 and >= current saved amount
      const parsedTarget = Number(editGoal.targetAmount);
      if (!Number.isFinite(parsedTarget) || parsedTarget <= 1) {
        alert('Target amount must be greater than 1 OMR.');
        return;
      }
      if (parsedTarget < (editGoal.currentAmount || 0)) {
        alert('Target cannot be less than current saved amount.');
        return;
      }

      fetch(`https://maliyah-server.onrender.com/goals/${editGoal._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editGoal, targetAmount: parsedTarget })
      })
        .then(res => res.json())
        .then(updatedGoal => {
          setGoals(goals.map(g => g._id === updatedGoal._id ? updatedGoal : g));
          setShowEditModal(false);
          setEditGoal(null);
          setSuccessMessage('Goal updated successfully!');
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
            // Notify other pages and same-window listeners that goals changed
            const ts = Date.now().toString();
            localStorage.setItem('goalsUpdated', ts);
            try { window.dispatchEvent(new CustomEvent('goalsUpdated', { detail: ts })); } catch (e) {}
        });
    };

  // Short: client-side guard then POST to server; server enforces the final balance check
  const handleAllocation = (e) => {
    e.preventDefault();
    const amount = parseFloat(allocationAmount);
    if (!selectedGoal || isNaN(amount) || amount > currentBalance) {
      alert('Invalid or insufficient balance for this allocation');
      return;
    }

    // Find selected goal
    const goal = goals.find(g => g._id === selectedGoal);
    if (!goal) return;

    // Check if allocation would exceed target goal
    const remainingGoalAmount = goal.targetAmount - goal.currentAmount;
    if (amount > remainingGoalAmount) {
      alert(`Cannot allocate more than target goal. Maximum allocation allowed: OMR ${remainingGoalAmount.toFixed(3)}`);
      return;
    }

    // POST to new backend endpoint to allocate and create expense record
    fetch('https://maliyah-server.onrender.com/api/goals/allocate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        userEmail,
        goalId: selectedGoal,
        allocateAmount: amount,
        description: `Allocated to goal: ${goal.name}`
      })
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Allocation failed');
        }
        return data;
      })
      .then(result => {
        // Update local goals state
        setGoals(goals.map(g => g._id === selectedGoal ? result.goal : g));
        // Refresh financial summary to get updated balance
        dispatch(fetchFinancialSummary(userEmail));
        setShowAllocationModal(false);
        setAllocationAmount('');
        setSelectedGoal(null);
        setSuccessMessage('Amount allocated successfully!');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
  // Notify other tabs to refresh records and goals so Reminders and other pages update
  const ts = Date.now().toString();
  localStorage.setItem('recordsUpdated', ts);
  localStorage.setItem('goalsUpdated', ts);
  // storage events don't fire in the same window, so dispatch a custom event too
  try { window.dispatchEvent(new CustomEvent('goalsUpdated', { detail: ts })); } catch (e) {}
      })
      .catch(error => {
        alert(error.message);
      });
  };

  // Create a new goal (client-side validation: target must be > 1)
  const handleCreateGoal = (e) => {
    e.preventDefault();
    const target = Number(newGoal.targetAmount);
    if (!Number.isFinite(target) || target <= 1) {
      alert('Target amount must be greater than 1 OMR.');
      return;
    }
    const deadlineDate = new Date(newGoal.deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (deadlineDate < today) {
      alert('Cannot set goal for a past date.');
      return;
    }

    const goal = {
      userId,
      name: newGoal.name,
      targetAmount: parseFloat(target),
      currentAmount: 0,
      deadline: newGoal.deadline,
      category: newGoal.category
    };

    fetch('https://maliyah-server.onrender.com/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(goal)
    })
      .then(res => res.json())
      .then(newGoalObj => {
        setGoals([...goals, newGoalObj]);
        setNewGoal({ name: '', targetAmount: '', deadline: '', category: '' });
        setShowNewGoalModal(false);
        setSuccessMessage('New goal created successfully!');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
          // Notify other pages and same-window listeners that goals changed
          const ts = Date.now().toString();
          localStorage.setItem('goalsUpdated', ts);
          try { window.dispatchEvent(new CustomEvent('goalsUpdated', { detail: ts })); } catch (e) {}
      })
      .catch(err => {
        alert(err.message || 'Failed to create goal');
      });
  };

  // Note: delete and edit handlers are defined elsewhere above; keep them as-is


  const getProgressPercentage = (current, target) => {
    return Math.min((current / target) * 100, 100);
  };

  const formatOMR = (amount) => `OMR ${amount.toLocaleString(undefined, { minimumFractionDigits: 3 })}`;

  return (
    <Container className="my-4">
      {/* Side Notifications for Smart Insights - Only show on Goals page */}
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
        {insightsEnabled && insights.suggestions && insights.suggestions.length > 0 && showInsightNotification && 
          insights.suggestions.map((suggestion, idx) => (
            <Toast
              key={idx}
              onClose={() => {
                // Clear the auto-close timeout and countdown if user manually closes
                if (insightTimeoutId) {
                  clearTimeout(insightTimeoutId);
                  setInsightTimeoutId(null);
                }
                if (countdownIntervalId) {
                  clearInterval(countdownIntervalId);
                  setCountdownIntervalId(null);
                }
                
                // Mark this specific suggestion as dismissed
                const dismissedSuggestion = insights.suggestions[idx];
                const updatedDismissedInsights = [...dismissedInsights, dismissedSuggestion];
                setDismissedInsights(updatedDismissedInsights);
                
                // Save to localStorage with timestamp
                localStorage.setItem('dismissedInsights', JSON.stringify(updatedDismissedInsights));
                localStorage.setItem('dismissedInsightsTimestamp', new Date().getTime().toString());
                
                // Remove this specific suggestion from the array
                const updatedSuggestions = insights.suggestions.filter((_, index) => index !== idx);
                setInsights({ ...insights, suggestions: updatedSuggestions });
                // If no more suggestions, hide the notification
                if (updatedSuggestions.length === 0) {
                  setShowInsightNotification(false);
                }
              }}
              show={showInsightNotification}
              style={{
                background: 'linear-gradient(135deg, #e9d5ff 0%, #ddd6fe 100%)',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(139, 92, 246, 0.15)',
                minWidth: '350px',
                border: 'none',
                color: '#4c1d95',
                marginBottom: '10px',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                cursor: 'default'
              }}
              onMouseEnter={(e) => {
                setIsPaused(true);
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(139, 92, 246, 0.25)';
              }}
              onMouseLeave={(e) => {
                setIsPaused(false);
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(139, 92, 246, 0.15)';
              }}
            >
              <Toast.Header style={{ 
                background: 'rgba(76, 29, 149, 0.1)', 
                borderBottom: '1px solid rgba(76, 29, 149, 0.2)',
                color: '#4c1d95',
                borderRadius: '12px 12px 0 0'
              }}>
                <Bell size={20} className="me-2" style={{ color: '#8b5cf6' }} />
                <strong className="me-auto" style={{ fontSize: '1.1rem' }}>💡 Smart Insight #{idx + 1}</strong>
                <small className="opacity-75" style={{ color: '#6d28d9' }}>
                  {isPaused ? '⏸️ Paused' : `Auto-close in ${timeRemaining}s`}
                </small>
              </Toast.Header>
              <Toast.Body style={{ 
                fontSize: '0.95rem', 
                lineHeight: '1.4',
                padding: '12px 16px'
              }}>
                <div className="d-flex align-items-start">
                  <div className="me-2 mt-1">✨</div>
                  <div>{suggestion}</div>
                </div>
              </Toast.Body>
            </Toast>
          ))
        }
      </ToastContainer>

      <Row className="mb-4 justify-content-between align-items-center">
        <Col>
          <h4 className="fw-bold mb-0">Financial Goals</h4>
          <p className="text-muted">Track and manage your savings goals</p>
        </Col>
        <Col className="text-end">
          <div className="d-flex gap-2">
            <Button variant="success" size="sm" onClick={() => setShowNewGoalModal(true)}>
              <Plus size={14} className="me-1" />
              Create New Goal
            </Button>
            <Button variant="primary" size="sm" onClick={() => setShowAllocationModal(true)}>
              <Plus size={14} className="me-1" />
              Allocate to Goal
            </Button>
          </div>
        </Col>
      </Row>

      {showSuccess && (
        <Alert variant="success" dismissible onClose={() => setShowSuccess(false)}>
          <Check size={18} className="me-2" />
          {successMessage}
        </Alert>
      )}

      <Card className="mb-4 border-0 shadow-sm">
        <Card.Body>
          <Row className="g-3">
            <Col md={3}>
              <div className="text-center">
                <Wallet size={32} className="text-primary mb-2" />
                <h5 className="mb-1">{formatOMR(financialSummary.currentBalance || 0)}</h5>
                <small className="text-muted">Available Balance</small>
              </div>
            </Col>
            <Col md={3}>
              <div className="text-center">
                <Target size={32} className="text-success mb-2" />
                <h5 className="mb-1">{goals.length}</h5>
                <small className="text-muted">Active Goals</small>
              </div>
            </Col>
            <Col md={3}>
              <div className="text-center">
                <DollarSign size={32} className="text-warning mb-2" />
                <h5 className="mb-1">{formatOMR(goals.reduce((sum, goal) => sum + goal.currentAmount, 0))}</h5>
                <small className="text-muted">Total Saved</small>
              </div>
            </Col>
            <Col md={3}>
              <div className="text-center">
                <TrendingUp size={32} className="text-info mb-2" />
                <h5 className="mb-1">{formatOMR(goals.reduce((sum, goal) => sum + goal.targetAmount, 0))}</h5>
                <small className="text-muted">Target Amount</small>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Row xs={1} md={2} className="g-4">
        {goals.map(goal => {
          const progress = getProgressPercentage(goal.currentAmount, goal.targetAmount);
          return (
            <Col key={goal._id}>
              <Card className="shadow-sm border-0">
                <Card.Body>
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-success bg-opacity-10 p-2 rounded-circle me-3">
                      <Target size={24} className="text-success" />
                    </div>
                    <div>
                      <h5 className="mb-0">{goal.name}</h5>
                      <small className="text-muted">{goal.category}</small>
                    </div>
                    <div className="ms-auto text-end">
                      <small className="text-muted">Deadline</small><br />
                      <strong>{formatDateDDMMYYYY(goal.deadline)}</strong>
                    </div>
                  </div>

                  <ProgressBar now={progress} variant="success" className="mb-3" label={`${Math.round(progress)}%`} />

                  <Row>
                    <Col>
                      <div className="bg-light rounded p-2">
                        <small className="text-muted">Saved</small>
                        <div className="fw-bold text-success">{formatOMR(goal.currentAmount)}</div>
                      </div>
                    </Col>
                    <Col>
                      <div className="bg-light rounded p-2">
                        <small className="text-muted">Target</small>
                        <div className="fw-bold">{formatOMR(goal.targetAmount)}</div>
                      </div>
                    </Col>
                  </Row>
                  <div className="mt-3 d-flex justify-content-end gap-2">
                    <Button variant="outline-primary" size="sm" onClick={() => handleEditGoal(goal)}>
                      Edit
                    </Button>
                    <Button variant="outline-danger" size="sm" onClick={() => handleDeleteGoal(goal._id)}>
                      Delete
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* Allocation Modal */}
      <Modal show={showAllocationModal} onHide={() => setShowAllocationModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Allocate to Goal</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAllocation}>
            <Form.Group className="mb-3">
              <Form.Label>Select Goal</Form.Label>
              <Form.Select
                value={selectedGoal || ''}
                onChange={(e) => setSelectedGoal(e.target.value)}
                required
              >
                <option value="">Choose a goal</option>
                {goals.map(goal => (
                  <option key={goal._id} value={goal._id}>
                    {goal.name} ({formatOMR(goal.currentAmount)} / {formatOMR(goal.targetAmount)})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Amount to Allocate</Form.Label>
              <div className="position-relative">
                <Coins size={16} className="position-absolute top-50 start-0 translate-middle-y text-muted ms-2" />
                <Form.Control
                  type="number"
                  placeholder="Enter amount"
                  value={allocationAmount}
                  onChange={(e) => setAllocationAmount(e.target.value)}
                  className="ps-5"
                  max={selectedGoal ? Math.min(currentBalance, goals.find(g => g._id === selectedGoal)?.targetAmount - goals.find(g => g._id === selectedGoal)?.currentAmount || 0) : currentBalance}
                  min="0.001"
                  step="0.001"
                  required
                />
              </div>
              <Form.Text className="text-muted">
                Available balance: {formatOMR(currentBalance)}
                {selectedGoal && (() => {
                  const goal = goals.find(g => g._id === selectedGoal);
                  const remainingGoalAmount = goal ? goal.targetAmount - goal.currentAmount : 0;
                  return (
                    <div className="text-warning">
                      Maximum for this goal: {formatOMR(Math.min(currentBalance, remainingGoalAmount))}
                    </div>
                  );
                })()}
              </Form.Text>
            </Form.Group>
            <div className="text-end">
              <Button variant="secondary" onClick={() => setShowAllocationModal(false)} className="me-2">
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                <TrendingUp size={16} className="me-2" />
                Allocate Funds
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Create New Goal Modal */}
      {/* Edit Goal Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Goal</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editGoal && (
            <Form onSubmit={handleUpdateGoal}>
              <Form.Group className="mb-3">
                <Form.Label>Goal Name</Form.Label>
                <Form.Control
                  type="text"
                  value={editGoal.name}
                  onChange={e => setEditGoal({ ...editGoal, name: e.target.value })}
                  required
                />
                {editGoalNameError && (
                  <Form.Text as="div" className="text-danger mb-2">{editGoalNameError}</Form.Text>
                )}
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Target Amount</Form.Label>
                <Form.Control
                  type="number"
                  min={Math.max(1, editGoal.currentAmount || 0)}
                  step="0.001"
                  value={editGoal.targetAmount}
                  onChange={e => setEditGoal({ ...editGoal, targetAmount: e.target.value })}
                  required
                />
                {editGoalError && (
                  <Form.Text as="div" className="text-danger mb-2">{editGoalError}</Form.Text>
                )}
                <Form.Text as="div" className="text-muted mb-1">
                  Current saved amount: {formatOMR(editGoal.currentAmount || 0)}. Target cannot be less than current amount.
                </Form.Text>

              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Target Date</Form.Label>
                <Form.Control
                  type="date"
                  value={editGoal.deadline}
                  min={getCurrentDateForInput()}
                  onChange={e => setEditGoal({ ...editGoal, deadline: e.target.value })}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Category</Form.Label>
                <Form.Select
                  value={editGoal.category}
                  onChange={e => setEditGoal({ ...editGoal, category: e.target.value })}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </Form.Select>
              </Form.Group>
              <div className="text-end">
                <Button variant="secondary" onClick={() => setShowEditModal(false)} className="me-2">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={Boolean(editGoalError)}>
                  Save Changes
                </Button>
              </div>
            </Form>
          )}
        </Modal.Body>
      </Modal>
      <Modal show={showNewGoalModal} onHide={() => setShowNewGoalModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Create New Goal</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCreateGoal}>
            <Form.Group className="mb-3">
              <Form.Label>Goal Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., New Car"
                value={newGoal.name}
                onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                required
              />
              {newGoalNameError && (
                <Form.Text as="div" className="text-danger mb-2">{newGoalNameError}</Form.Text>
              )}
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Target Amount</Form.Label>
              <div className="position-relative">
                <Coins size={16} className="position-absolute top-50 start-0 translate-middle-y text-muted ms-2" />
                <Form.Control
                  type="number"
                  placeholder="Enter target amount"
                  className="ps-5"
                  min={1}
                  step="0.001"
                  value={newGoal.targetAmount}
                  onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                  required
                />
                {newGoalError && (
                  <Form.Text as="div" className="text-danger mb-2">{newGoalError}</Form.Text>
                )}
              </div>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Target Date</Form.Label>
              <div className="position-relative">
                <Calendar size={16} className="position-absolute top-50 start-0 translate-middle-y text-muted ms-2" />
                <Form.Control
                  type="date"
                  className="ps-5"
                  value={newGoal.deadline}
                  min={getCurrentDateForInput()}
                  onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                  required
                />
              </div>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Select
                value={newGoal.category}
                onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                required
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <div className="text-end">
              <Button variant="secondary" onClick={() => setShowNewGoalModal(false)} className="me-2">
                Cancel
              </Button>
              <Button type="submit" variant="success" disabled={Boolean(newGoalError) || !newGoal.name || !newGoal.deadline || !newGoal.category}>
                <Plus size={16} className="me-2" />
                Create Goal
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Goals;

