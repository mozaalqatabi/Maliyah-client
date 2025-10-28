import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Check, AlertTriangle, Bell } from 'lucide-react';
import { Badge } from 'react-bootstrap';
// Local date formatter copied from utils to avoid external dependency
const formatDateDDMMYYYY = (date) => {
  if (!date) return '';
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
  return `${day}/${month}/${year}`;
};

// Custom styles for enhanced budget alerts
const reminderStyles = `
  .text-purple {
    color: #6366f1 !important;
  }
  .budget-alert-critical {
    animation: pulse-red 2s infinite;
  }
  @keyframes pulse-red {
    0% {
      box-shadow: 0 8px 25px rgba(220, 38, 38, 0.15);
    }
    50% {
      box-shadow: 0 8px 35px rgba(220, 38, 38, 0.25);
    }
    100% {
      box-shadow: 0 8px 25px rgba(220, 38, 38, 0.15);
    }
  }
  .budget-alert-warning {
    box-shadow: 0 8px 25px rgba(245, 158, 11, 0.15) !important;
  }
`;

const Reminders = () => {
  // --- Sorting state for reminders ---
  // sortBy: controls sorting by date, status, or category
  // Sorting state
  const [sortBy, setSortBy] = useState('date');
  // Notification preferences state
  // Initialize preferences from localStorage for persistence
  const getInitialPreferences = () => {
    const stored = localStorage.getItem('notificationPreferences');
    if (stored) return JSON.parse(stored);
    return { budget: true, goal: true, zakat: true, schedule: true };
  };
  const [preferences, setPreferences] = useState(getInitialPreferences());

  // goalInsightsEnabled removed (not used here)

  // Scheduling state
  const [schedules, setSchedules] = useState([]);
  
  // Budget alerts state
  const [budgetAlerts, setBudgetAlerts] = useState([]);

  // Get userId from Redux store
  const user = useSelector((state) => state.counter.user);
  const userId = user?._id;


  // (insights removed) Reminders focuses on reminders, schedules and budget alerts

  // Listen for goals changes triggered elsewhere (create/update/delete) and refresh insights/reminders
  React.useEffect(() => {
    const refetchGoalsData = () => {
      // Only refresh reminders here; insights are handled elsewhere (Goals page)
      if (!userId) return;
      fetch(`http://localhost:8080/reminders/${userId}`)
        .then(res => res.json())
        .then(data => setReminders(data))
        .catch(() => setReminders([]));
    };

    const refetchSchedulesData = () => {
      if (!user?.email || !preferences.schedule) return;
      fetch(`http://localhost:8080/schedules/${user.email}`)
        .then(res => res.json())
        .then(data => setSchedules(data))
        .catch(() => setSchedules([]));
    };

    const refetchBudgetsData = () => {
      if (!user?.email || !preferences.budget) return;
      fetch(`http://localhost:8080/api/budgets/summary?userEmail=${encodeURIComponent(user.email)}`)
        .then(res => res.json())
        .then(data => {
          const alerts = generateBudgetAlerts(data || []);
          setBudgetAlerts(alerts);
        })
        .catch(() => setBudgetAlerts([]));
    };

    const handler = (event) => {
      if (!userId) return;
      // storage event (cross-window) will have key
      if (!event) return;
      if (event.key === 'goalsUpdated') {
        refetchGoalsData();
      }
      if (event.key === 'schedulesUpdated') {
        refetchSchedulesData();
      }
      if (event.key === 'budgetsUpdated') {
        refetchBudgetsData();
      }
    };

    const onGoalsUpdated = (e) => {
      if (!userId) return;
      refetchGoalsData();
    };

    const onSchedulesUpdated = (e) => {
      refetchSchedulesData();
    };

    const onBudgetsUpdated = (e) => {
      refetchBudgetsData();
    };

    window.addEventListener('storage', handler);
    window.addEventListener('goalsUpdated', onGoalsUpdated);
    window.addEventListener('schedulesUpdated', onSchedulesUpdated);
    window.addEventListener('budgetsUpdated', onBudgetsUpdated);
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener('goalsUpdated', onGoalsUpdated);
      window.removeEventListener('schedulesUpdated', onSchedulesUpdated);
      window.removeEventListener('budgetsUpdated', onBudgetsUpdated);
    };
  }, [userId, preferences.schedule, preferences.budget, user?.email]);

  // Fetch reminders from backend
  const [reminders, setReminders] = useState([]);
  useEffect(() => {
    if (!userId) return;
    fetch(`http://localhost:8080/reminders/${userId}`)
      .then(res => res.json())
      .then(data => setReminders(data))
      .catch(() => setReminders([]));
  }, [userId]);

  // Fetch schedules when scheduling toggle is enabled
  useEffect(() => {
    if (preferences.schedule && user?.email) {
      fetch(`http://localhost:8080/schedules/${user.email}`)
        .then(res => res.json())
        .then(data => setSchedules(data))
        .catch(() => setSchedules([]));
    } else {
      setSchedules([]);
    }
  }, [preferences.schedule, user?.email]);

  // Fetch budget alerts when budget toggle is enabled
  useEffect(() => {
    if (preferences.budget && user?.email) {
      console.log('Fetching budget alerts for:', user.email);
      fetch(`http://localhost:8080/api/budgets/summary?userEmail=${user.email}`)
        .then(res => res.json())
        .then(data => {
          console.log('Budget data received:', data);
          const alerts = generateBudgetAlerts(data);
          console.log('Generated budget alerts:', alerts);
          setBudgetAlerts(alerts);
        })
        .catch(error => {
          console.error('Error fetching budget data:', error);
          setBudgetAlerts([]);
        });
    } else {
      setBudgetAlerts([]);
    }
  }, [preferences.budget, user?.email]);

  // Listen for focus events to refresh budget data when user returns from Budget page
  useEffect(() => {
    const handleFocus = () => {
      if (preferences.budget && user?.email) {
        // Refresh budget alerts when user returns to this page
        fetch(`http://localhost:8080/api/budgets/summary?userEmail=${user.email}`)
          .then(res => res.json())
          .then(data => {
            const alerts = generateBudgetAlerts(data);
            setBudgetAlerts(alerts);
          })
          .catch(() => setBudgetAlerts([]));
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [preferences.budget, user?.email]);

  const [filter, setFilter] = useState('all');

  // Helper function to generate budget alerts
  const generateBudgetAlerts = (budgetData) => {
    console.log('Generating budget alerts from data:', budgetData);
    const alerts = [];
    
    budgetData.forEach(budget => {
      if (budget.allocated <= 0) return; // Skip categories with no budget
      
      console.log('Processing budget:', budget.name, 'Spent:', budget.spent, 'Allocated:', budget.allocated);
      const percentage = (budget.spent / budget.allocated) * 100;
      console.log('Budget percentage:', percentage);
      
      // New budget (no spending yet)
      if (budget.spent === 0) {
        alerts.push({
          _id: `budget_new_${budget.id || budget.baseId}`,
          type: 'budget',
          title: `💼 New Budget Created: ${budget.name}`,
          description: `Budget set for OMR ${budget.allocated.toFixed(3)}. Start tracking your expenses!`,
          date: new Date().toISOString(),
          status: 'info',
          amount: budget.allocated,
          budgetData: budget,
          isBudgetAlert: true,
          alertLevel: 'info'
        });
      }
      // Over budget (red alert)
      else if (budget.spent > budget.allocated) {
        alerts.push({
          _id: `budget_over_${budget.id || budget.baseId}`,
          type: 'budget',
          title: `🚨 Budget Exceeded: ${budget.name}`,
          description: `Over budget by OMR ${(budget.spent - budget.allocated).toFixed(3)} (${percentage.toFixed(1)}%)`,
          date: new Date().toISOString(),
          status: 'critical',
          amount: budget.spent - budget.allocated,
          budgetData: budget,
          isBudgetAlert: true,
          alertLevel: 'critical'
        });
      }
      // 85% spent (warning)
      else if (percentage >= 85) {
        alerts.push({
          _id: `budget_warning_${budget.id || budget.baseId}`,
          type: 'budget',
          title: `⚠️ Budget Warning: ${budget.name}`,
          description: `${percentage.toFixed(1)}% spent (OMR ${budget.spent.toFixed(3)} of ${budget.allocated.toFixed(3)})`,
          date: new Date().toISOString(),
          status: 'warning',
          amount: budget.spent,
          budgetData: budget,
          isBudgetAlert: true,
          alertLevel: 'warning'
        });
      }
      // 75% spent (caution)
      else if (percentage >= 75) {
        alerts.push({
          _id: `budget_caution_${budget.id || budget.baseId}`,
          type: 'budget',
          title: `💡 Budget Notice: ${budget.name}`,
          description: `${percentage.toFixed(1)}% spent (OMR ${budget.spent.toFixed(3)} of ${budget.allocated.toFixed(3)})`,
          date: new Date().toISOString(),
          status: 'info',
          amount: budget.spent,
          budgetData: budget,
          isBudgetAlert: true,
          alertLevel: 'info'
        });
      }
      // 50% spent (good progress)
      else if (percentage >= 50) {
        alerts.push({
          _id: `budget_progress_${budget.id || budget.baseId}`,
          type: 'budget',
          title: `📊 Budget Progress: ${budget.name}`,
          description: `${percentage.toFixed(1)}% spent (OMR ${budget.spent.toFixed(3)} of ${budget.allocated.toFixed(3)}). Good progress!`,
          date: new Date().toISOString(),
          status: 'info',
          amount: budget.spent,
          budgetData: budget,
          isBudgetAlert: true,
          alertLevel: 'progress'
        });
      }
      // 25% spent (early progress)
      else if (percentage >= 25) {
        alerts.push({
          _id: `budget_early_${budget.id || budget.baseId}`,
          type: 'budget',
          title: `📈 Budget Update: ${budget.name}`,
          description: `${percentage.toFixed(1)}% spent (OMR ${budget.spent.toFixed(3)} of ${budget.allocated.toFixed(3)}). Stay on track!`,
          date: new Date().toISOString(),
          status: 'info',
          amount: budget.spent,
          budgetData: budget,
          isBudgetAlert: true,
          alertLevel: 'early'
        });
      }
      // Very low spending (less than 25%)
      else if (percentage > 0 && percentage < 25) {
        alerts.push({
          _id: `budget_low_${budget.id || budget.baseId}`,
          type: 'budget',
          title: `💰 Budget Status: ${budget.name}`,
          description: `${percentage.toFixed(1)}% spent (OMR ${budget.spent.toFixed(3)} of ${budget.allocated.toFixed(3)}). Plenty of budget remaining!`,
          date: new Date().toISOString(),
          status: 'info',
          amount: budget.spent,
          budgetData: budget,
          isBudgetAlert: true,
          alertLevel: 'low'
        });
      }
    });
    
    console.log('Generated alerts array:', alerts);
    return alerts;
  };

  // Handle preference toggle - updated function name to match usage
  const updatePreference = (type, value) => {
    setPreferences(prev => {
      const updated = { ...prev, [type]: value };
      localStorage.setItem('notificationPreferences', JSON.stringify(updated));
      return updated;
    });
  };

  // toggleGoalInsights removed (not used in this component)

  const getIcon = (type) => {
    switch (type) {
      case 'budget':
        return <span style={{ fontSize: '20px' }}>💰</span>;
      case 'goal':
        return <span style={{ fontSize: '20px' }}>🎯</span>;
      case 'zakat':
        return <span style={{ fontSize: '20px' }}>🤲</span>;
      case 'schedule':
        return <span style={{ fontSize: '20px' }}>📅</span>;
      default:
        return <span style={{ fontSize: '20px' }}>🔔</span>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <Badge bg="success" className="d-flex align-items-center">
            <Check size={12} className="me-1" /> Completed
          </Badge>
        );
      case 'overdue':
        return (
          <Badge bg="danger" className="d-flex align-items-center">
            <AlertTriangle size={12} className="me-1" /> Overdue
          </Badge>
        );
      default:
        return (
          <Badge bg="warning" className="text-dark d-flex align-items-center">
            <Bell size={12} className="me-1" /> Pending
          </Badge>
        );
    }
  };

  // State to track dismissed and completed items
  const [dismissedItems, setDismissedItems] = useState(new Set());
  const [completedItems, setCompletedItems] = useState(new Set());
  const [processingItems, setProcessingItems] = useState(new Set());
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  // Toast notification function
  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const markAsComplete = async (id) => {
    setProcessingItems(prev => new Set([...prev, id]));
    
    try {
      // Check if it's a budget alert
      if (id.startsWith('budget_')) {
        setCompletedItems(prev => new Set([...prev, id]));
        showToastMessage('Budget alert marked as complete!');
        return;
      }
      
      // Check if it's a schedule reminder
      if (id.startsWith('schedule_')) {
        setCompletedItems(prev => new Set([...prev, id]));
        showToastMessage('Schedule reminder marked as complete!');
        return;
      }
      
      // For regular reminders, update both local state and backend
      setReminders(reminders.map(reminder =>
        reminder._id === id ? { ...reminder, status: 'completed' } : reminder
      ));
      
      // Update on backend
      await fetch(`http://localhost:8080/reminders/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'completed' })
      });
      
      showToastMessage('Reminder marked as complete!');
    } catch (err) {
      console.error('Failed to update reminder status:', err);
      showToastMessage('Failed to mark reminder as complete. Please try again.');
    } finally {
      setProcessingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const dismissReminder = async (id) => {
    setProcessingItems(prev => new Set([...prev, id]));
    
    try {
      // Check if it's a budget alert
      if (id.startsWith('budget_')) {
        setDismissedItems(prev => new Set([...prev, id]));
        showToastMessage('Budget alert dismissed!');
        return;
      }
      
      // Check if it's a schedule reminder
      if (id.startsWith('schedule_')) {
        setDismissedItems(prev => new Set([...prev, id]));
        showToastMessage('Schedule reminder dismissed!');
        return;
      }
      
      // For regular reminders, delete from backend
      const res = await fetch(`http://localhost:8080/reminders/${id}`, {
        method: 'DELETE'
      });
      
      if (res.ok) {
        setReminders(reminders.filter(reminder => reminder._id !== id));
        showToastMessage('Reminder dismissed successfully!');
      } else {
        throw new Error('Failed to dismiss reminder');
      }
    } catch (err) {
      console.error('Failed to delete reminder:', err);
      showToastMessage('Failed to dismiss reminder. Please try again.');
    } finally {
      setProcessingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const isReached = (reminder) => {
    const today = new Date();
    const dueDate = new Date(reminder.date);
    return reminder.status === 'pending' && dueDate <= today;
  };

  // Convert schedules to reminder format
  const convertSchedulesToReminders = (schedules) => {
    return schedules.map(schedule => ({
      _id: `schedule_${schedule._id}`,
      type: 'schedule',
      title: `${schedule.type === 'income' ? 'Income' : 'Expense'}: ${schedule.categoryName}`,
      description: schedule.description || `${schedule.freq} ${schedule.categoryName} - OMR ${schedule.amount.toFixed(3)}`,
      date: schedule.nextDueAt,
      status: schedule.active ? 'pending' : 'inactive',
      amount: schedule.amount,
      frequency: schedule.freq,
      isSchedule: true,
      scheduleId: schedule._id
    }));
  };

  // Filter reminders by user preferences and filter tab
  // --- Filter reminders by user preferences and filter tab ---
  // First, combine reminders and schedules
  const getAllReminders = () => {
    let allReminders = [...reminders];
    
    // Add schedules if enabled in preferences
    if (preferences.schedule) {
      const scheduleReminders = convertSchedulesToReminders(schedules);
      allReminders = [...allReminders, ...scheduleReminders];
    }
    
    // Add budget alerts if enabled in preferences
    if (preferences.budget) {
      allReminders = [...allReminders, ...budgetAlerts];
    }
    
    // Filter out dismissed items
    allReminders = allReminders.filter(reminder => !dismissedItems.has(reminder._id));
    
    // Update status for completed items
    allReminders = allReminders.map(reminder => {
      if (completedItems.has(reminder._id)) {
        return { ...reminder, status: 'completed' };
      }
      return reminder;
    });
    
    return allReminders;
  };

  // First, filter reminders
  const filteredReminders = getAllReminders().filter(reminder => {
    // For schedules, use the schedule preference, for others use their type
    const prefKey = reminder.type === 'schedule' ? 'schedule' : reminder.type;
    if (!preferences[prefKey]) return false;
    
    if (filter === 'all') return true;
    if (filter === 'budget') return reminder.type === 'budget';
    if (filter === 'goal') return reminder.type === 'goal';
    if (filter === 'zakat') return reminder.type === 'zakat';
    if (filter === 'schedule') return reminder.type === 'schedule';
    return false;
  });

  // Debug logging
  console.log('All reminders:', getAllReminders());
  console.log('Budget alerts:', budgetAlerts);
  console.log('Preferences:', preferences);
  console.log('Current filter:', filter);
  console.log('Filtered reminders:', filteredReminders);

  // Then, sort reminders
  const sortedReminders = [...filteredReminders].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(a.date) - new Date(b.date);
    }
    if (sortBy === 'status') {
      return a.status.localeCompare(b.status);
    }
    if (sortBy === 'category') {
      return (a.category || '').localeCompare(b.category || '');
    }
    return 0;
  });

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: reminderStyles}} />
      <div className="container-fluid" style={{ 
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', 
        minHeight: '100vh', 
        padding: '2rem 0'
      }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-11">
            {/* Header Section */}
            <div className="text-center mb-5">
              <div className="d-inline-block p-4 rounded-circle mb-3" style={{ 
                background: 'rgba(71, 85, 105, 0.1)', 
                backdropFilter: 'blur(10px)',
                animation: 'pulse 2s infinite'
              }}>
                <i className="fas fa-bell fa-3x" style={{ color: '#475569' }}></i>
              </div>
              <h2 className="mb-2 fw-bold display-5" style={{ color: '#1e293b' }}>Notification Center</h2>
              <p className="fs-5" style={{ color: '#64748b' }}>Stay on top of your financial goals and reminders</p>
            </div>

              <div className="mb-4 d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-white rounded-pill px-3 py-2 shadow-sm">
                    <i className="me-2" style={{ color: '#475569' }}>📊</i>
                    <span className="fw-semibold text-dark">Sort by:</span>
                    <select 
                      value={sortBy} 
                      onChange={e => setSortBy(e.target.value)}
                      className="border-0 bg-transparent ms-2 fw-semibold"
                      style={{ outline: 'none' }}
                    >
                      <option value="date">Date</option>
                      <option value="status">Status</option>
                      <option value="category">Category</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Preferences Section */}
              <div className="card border-0 shadow-lg mb-4" style={{ 
                background: 'rgba(255,255,255,0.9)', 
                backdropFilter: 'blur(15px)', 
                borderRadius: '20px' 
              }}>
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-4">
                    <div className="p-3 rounded-circle me-3" style={{ background: '#e2e8f0' }}>
                      <i className="fas fa-cog fs-5" style={{ color: '#475569' }}></i>
                    </div>
                    <div>
                      <h5 className="mb-1 fw-bold">Notification Preferences</h5>
                      <p className="text-muted mb-0">Customize what notifications you want to receive</p>
                    </div>
                  </div>
                  
                  <div className="row g-4">
                    <div className="col-lg-4 col-md-6">
                      <Link 
                        to="/goals" 
                        className="text-decoration-none"
                        style={{ color: 'inherit' }}
                      >
                        <div 
                          className="preference-card h-100 p-4 rounded-4 position-relative overflow-hidden" 
                          style={{ 
                            background: preferences.goal ? 'linear-gradient(135deg, #d1fae5, #a7f3d0)' : 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
                            border: 'none',
                            transition: 'all 0.3s ease',
                            transform: preferences.goal ? 'translateY(-2px)' : 'none',
                            boxShadow: preferences.goal ? '0 8px 25px rgba(16, 185, 129, 0.15)' : '0 4px 15px rgba(0,0,0,0.05)',
                            cursor: 'pointer'
                          }}
                        >
                          <div className="d-flex align-items-center justify-content-between mb-3">
                            <div className="p-2">
                              <span className="fs-4">🎯</span>
                            </div>
                            <div className="form-check form-switch mb-0">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                checked={preferences.goal}
                                onChange={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  updatePreference('goal', e.target.checked);
                                }}
                                style={{ transform: 'scale(1.3)' }}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                          </div>
                          <h6 className={`fw-bold mb-2 ${preferences.goal ? 'text-dark' : 'text-dark'}`}>
                            Goal Updates
                          </h6>
                          <small className={`${preferences.goal ? 'text-gray-700' : 'text-muted'}`} style={{ color: preferences.goal ? '#374151' : '#6b7280' }}>
                            Smart insights about your financial goals and progress tracking
                          </small>
                          <div className="mt-2">
                            <small className="text-success">
                              <i className="fas fa-external-link-alt me-1"></i>
                              Go to Goals Page
                            </small>
                          </div>
                        </div>
                      </Link>
                    </div>
                  
                  <div className="col-lg-4 col-md-6">
                    <Link 
                      to="/scheduling" 
                      className="text-decoration-none"
                      style={{ color: 'inherit' }}
                    >
                      <div 
                        className="preference-card h-100 p-4 rounded-4 position-relative overflow-hidden" 
                        style={{ 
                          background: preferences.schedule ? 'linear-gradient(135deg, #dbeafe, #bfdbfe)' : 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
                          border: 'none',
                          transition: 'all 0.3s ease',
                          transform: preferences.schedule ? 'translateY(-2px)' : 'none',
                          boxShadow: preferences.schedule ? '0 8px 25px rgba(59, 130, 246, 0.15)' : '0 4px 15px rgba(0,0,0,0.05)',
                          cursor: 'pointer'
                        }}
                      >
                        <div className="d-flex align-items-center justify-content-between mb-3">
                          <div className="p-2">
                            <span className="fs-4">📅</span>
                          </div>
                          <div className="form-check form-switch mb-0">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={preferences.schedule}
                              onChange={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                updatePreference('schedule', e.target.checked);
                              }}
                              style={{ transform: 'scale(1.3)' }}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>
                        <h6 className={`fw-bold mb-2 ${preferences.schedule ? 'text-dark' : 'text-dark'}`}>
                          Scheduling
                        </h6>
                        <small className={`${preferences.schedule ? 'text-gray-700' : 'text-muted'}`} style={{ color: preferences.schedule ? '#374151' : '#6b7280' }}>
                          Upcoming scheduled transactions and recurring payments
                        </small>
                        <div className="mt-2">
                          <small className="text-info">
                            <i className="fas fa-external-link-alt me-1"></i>
                            Go to Scheduling Page
                          </small>
                        </div>
                      </div>
                    </Link>
                  </div>
                  
                  <div className="col-lg-4 col-md-6">
                    <Link 
                      to="/budget" 
                      className="text-decoration-none"
                      style={{ color: 'inherit' }}
                    >
                      <div 
                        className="preference-card h-100 p-4 rounded-4 position-relative overflow-hidden" 
                        style={{ 
                          background: preferences.budget ? 'linear-gradient(135deg, #fef3c7, #fde68a)' : 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
                          border: 'none',
                          transition: 'all 0.3s ease',
                          transform: preferences.budget ? 'translateY(-2px)' : 'none',
                          boxShadow: preferences.budget ? '0 8px 25px rgba(245, 158, 11, 0.15)' : '0 4px 15px rgba(0,0,0,0.05)',
                          cursor: 'pointer'
                        }}
                      >
                        <div className="d-flex align-items-center justify-content-between mb-3">
                          <div className="p-2">
                            <span className="fs-4">💰</span>
                          </div>
                          <div className="form-check form-switch mb-0">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={preferences.budget}
                              onChange={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                updatePreference('budget', e.target.checked);
                              }}
                              style={{ transform: 'scale(1.3)' }}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>
                        <h6 className={`fw-bold mb-2 ${preferences.budget ? 'text-dark' : 'text-dark'}`}>
                          Budget Alerts
                        </h6>
                        <small className={`${preferences.budget ? 'text-gray-700' : 'text-muted'}`} style={{ color: preferences.budget ? '#374151' : '#6b7280' }}>
                          Monitor your spending limits and budget thresholds
                        </small>
                        <div className="mt-2">
                          <small className="text-primary">
                            <i className="fas fa-external-link-alt me-1"></i>
                            Go to Budget Page
                          </small>
                        </div>
                      </div>
                    </Link>
                  </div>

                  <div className="col-lg-4 col-md-6">
                    <Link 
                      to="/zakat" 
                      className="text-decoration-none"
                      style={{ color: 'inherit' }}
                    >
                      <div 
                        className="preference-card h-100 p-4 rounded-4 position-relative overflow-hidden" 
                        style={{ 
                          background: preferences.zakat ? 'linear-gradient(135deg, #cffafe, #a5f3fc)' : 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
                          border: 'none',
                          transition: 'all 0.3s ease',
                          transform: preferences.zakat ? 'translateY(-2px)' : 'none',
                          boxShadow: preferences.zakat ? '0 8px 25px rgba(6, 182, 212, 0.15)' : '0 4px 15px rgba(0,0,0,0.05)',
                          cursor: 'pointer'
                        }}
                      >
                        <div className="d-flex align-items-center justify-content-between mb-3">
                          <div className="p-2">
                            <span className="fs-4">🤲</span>
                          </div>
                          <div className="form-check form-switch mb-0">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={preferences.zakat}
                              onChange={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                updatePreference('zakat', e.target.checked);
                              }}
                              style={{ transform: 'scale(1.3)' }}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>
                        <h6 className={`fw-bold mb-2 ${preferences.zakat ? 'text-dark' : 'text-dark'}`}>
                          Zakat Payment
                        </h6>
                        <small className={`${preferences.zakat ? 'text-gray-700' : 'text-muted'}`} style={{ color: preferences.zakat ? '#374151' : '#6b7280' }}>
                          Reminders for Zakat calculations and payment due dates
                        </small>
                        <div className="mt-2">
                          <small className="text-cyan-600">
                            <i className="fas fa-external-link-alt me-1"></i>
                            Go to Zakat Page
                          </small>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            {/* Filter Buttons */}
            <div className="mb-4">
              <div className="d-flex flex-wrap gap-2 justify-content-center">
                {[
                  { value: 'all', label: 'All Notifications', icon: 'fas fa-list', color: '#64748b' },
                  { value: 'budget', label: 'Budget Alerts', icon: 'fas fa-wallet', color: '#f59e0b' },
                  { value: 'goal', label: 'Goal Updates', icon: 'fas fa-target', color: '#10b981' },
                  { value: 'zakat', label: 'Zakat Payment', icon: 'fas fa-donate', color: '#6b7280' },
                  { value: 'schedule', label: 'Schedules', icon: 'fas fa-calendar', color: '#8b5cf6' }
                ].map(tab => (
                  <button
                    key={tab.value}
                    onClick={() => setFilter(tab.value)}
                    className={`btn btn-sm px-4 py-2 rounded-pill fw-semibold transition-all ${
                      filter === tab.value 
                        ? 'shadow-lg text-white' 
                        : 'btn-outline-light text-dark bg-white'
                    }`}
                    style={{
                      backgroundColor: filter === tab.value ? tab.color : 'white',
                      border: filter === tab.value ? 'none' : '2px solid #e2e8f0',
                      transform: filter === tab.value ? 'translateY(-2px)' : 'none',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <i className={`${tab.icon} me-2`}></i>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reminders List */}
            <div className="row g-4">
              {sortedReminders.length === 0 ? (
                <div className="col-12">
                  <div className="card border-0 shadow-lg text-center py-5" style={{ 
                    background: 'rgba(255,255,255,0.9)', 
                    backdropFilter: 'blur(15px)', 
                    borderRadius: '20px' 
                  }}>
                    <div className="p-4 rounded-circle d-inline-block mb-4" style={{ background: '#f1f5f9' }}>
                      <i className="fas fa-bell-slash fa-3x" style={{ color: '#94a3b8' }}></i>
                    </div>
                    <h5 className="mb-2" style={{ color: '#64748b' }}>No notifications to display</h5>
                    <p style={{ color: '#94a3b8' }}>Check back later for updates on your financial activities</p>
                  </div>
                </div>
              ) : (
                sortedReminders.map(reminder => {
                  // Determine special styling for budget alerts
                  const getBudgetAlertStyling = () => {
                    if (reminder.isBudgetAlert) {
                      switch (reminder.alertLevel) {
                        case 'critical':
                          return {
                            background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                            borderLeft: '5px solid #dc2626',
                            boxShadow: '0 8px 25px rgba(220, 38, 38, 0.15)'
                          };
                        case 'warning':
                          return {
                            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                            borderLeft: '4px solid #f59e0b',
                            boxShadow: '0 8px 25px rgba(245, 158, 11, 0.15)'
                          };
                        case 'info':
                          return {
                            background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                            borderLeft: '3px solid #3b82f6',
                            boxShadow: '0 8px 25px rgba(59, 130, 246, 0.15)'
                          };
                        case 'progress':
                          return {
                            background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                            borderLeft: '3px solid #10b981',
                            boxShadow: '0 8px 25px rgba(16, 185, 129, 0.15)'
                          };
                        case 'early':
                          return {
                            background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
                            borderLeft: '2px solid #6366f1',
                            boxShadow: '0 8px 25px rgba(99, 102, 241, 0.15)'
                          };
                        case 'low':
                          return {
                            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                            borderLeft: '2px solid #0ea5e9',
                            boxShadow: '0 8px 25px rgba(14, 165, 233, 0.15)'
                          };
                        default:
                          return {
                            background: 'rgba(255,255,255,0.9)',
                            borderLeft: 'none',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
                          };
                      }
                    }
                    return {
                      background: 'rgba(255,255,255,0.9)',
                      borderLeft: 'none',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
                    };
                  };

                  const budgetStyling = getBudgetAlertStyling();
                  
                  return (
                    <div key={reminder._id} className="col-lg-6 col-xl-4">
                      <div className={`card border-0 shadow-lg h-100 ${isReached(reminder) ? 'border-start border-4' : ''} ${reminder.status === 'completed' ? 'completed-reminder' : ''} ${reminder.isBudgetAlert && reminder.alertLevel === 'critical' ? 'budget-alert-critical' : ''}`} style={{ 
                        background: reminder.status === 'completed' 
                          ? 'rgba(220, 252, 231, 0.9)' 
                          : budgetStyling.background, 
                        backdropFilter: 'blur(15px)', 
                        borderRadius: '15px',
                        transition: 'all 0.3s ease',
                        transform: reminder.status === 'completed' ? 'scale(0.98)' : 'translateY(0)',
                        borderLeftColor: isReached(reminder) ? '#ef4444' : 'transparent',
                        borderLeft: budgetStyling.borderLeft || (isReached(reminder) ? '4px solid #ef4444' : 'none'),
                        boxShadow: budgetStyling.boxShadow,
                        opacity: reminder.status === 'completed' ? 0.8 : 1
                      }}
                      onMouseEnter={(e) => {
                        if (reminder.status !== 'completed') {
                          e.currentTarget.style.transform = 'translateY(-5px)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (reminder.status !== 'completed') {
                          e.currentTarget.style.transform = 'translateY(0)';
                        } else {
                          e.currentTarget.style.transform = 'scale(0.98)';
                        }
                      }}
                      >
                      <div className="card-body p-4">
                        {/* Header with icon and status */}
                        <div className="d-flex align-items-start justify-content-between mb-3">
                          <div className={`p-3 rounded-circle ${isReached(reminder) ? 'bg-red-50' : 'bg-slate-50'}`} style={{
                            backgroundColor: isReached(reminder) ? '#fef2f2' : '#f8fafc'
                          }}>
                            {getIcon(reminder.type)}
                          </div>
                          {getStatusBadge(reminder.status)}
                        </div>

                        {/* Title and Description */}
                        <div className="mb-3">
                          <div className="d-flex align-items-center mb-2">
                            {reminder.isBudgetAlert && (
                              <span className={`me-2 ${reminder.alertLevel === 'critical' ? 'text-danger' : 
                                        reminder.alertLevel === 'warning' ? 'text-warning' : 
                                        reminder.alertLevel === 'progress' ? 'text-success' : 
                                        reminder.alertLevel === 'info' ? 'text-primary' : 
                                        reminder.alertLevel === 'early' ? 'text-purple' : 'text-info'}`}>
                                {reminder.alertLevel === 'critical' && <i className="fa fa-exclamation-triangle fs-5"></i>}
                                {reminder.alertLevel === 'warning' && <i className="fa fa-exclamation-circle fs-6"></i>}
                                {(reminder.alertLevel === 'progress' || reminder.alertLevel === 'new') && <i className="fa fa-chart-line fs-6"></i>}
                                {reminder.alertLevel === 'info' && <i className="fa fa-info-circle fs-6"></i>}
                                {reminder.alertLevel === 'early' && <i className="fa fa-clock fs-6"></i>}
                                {reminder.alertLevel === 'low' && <i className="fa fa-chart-bar fs-6"></i>}
                              </span>
                            )}
                            <h6 className={`mb-0 fw-bold ${isReached(reminder) ? 'text-danger' : 'text-dark'} ${reminder.isBudgetAlert && reminder.alertLevel === 'critical' ? 'text-danger fw-bolder' : ''}`}>
                              {reminder.title}
                            </h6>
                          </div>
                          <p className="mb-0 small" style={{ color: '#64748b', lineHeight: '1.4' }}>
                            {reminder.description}
                          </p>
                        </div>

                        {/* Details Badges */}
                        <div className="d-flex flex-wrap gap-2 mb-3">
                          <span className={`badge px-2 py-1 small`} style={{
                            backgroundColor: isReached(reminder) ? '#fee2e2' : '#e0f2fe',
                            color: isReached(reminder) ? '#dc2626' : '#0369a1'
                          }}>
                            <i className="fas fa-calendar me-1"></i>
                            {formatDateDDMMYYYY(reminder.date)}
                          </span>
                          {reminder.amount && (
                            <span className="badge px-2 py-1 small" style={{ backgroundColor: '#ecfdf5', color: '#059669' }}>
                              <i className="fas fa-coins me-1"></i>
                              OMR {reminder.amount.toFixed(3)}
                            </span>
                          )}
                          {reminder.isBudgetAlert && reminder.alertLevel && (
                            <span className={`badge px-2 py-1 small fw-bold`} style={{ 
                              backgroundColor: reminder.alertLevel === 'critical' ? '#fee2e2' : 
                                             reminder.alertLevel === 'warning' ? '#fef3c7' : 
                                             reminder.alertLevel === 'info' ? '#dbeafe' : 
                                             reminder.alertLevel === 'progress' ? '#d1fae5' : 
                                             reminder.alertLevel === 'early' ? '#e0e7ff' : '#f0f9ff',
                              color: reminder.alertLevel === 'critical' ? '#dc2626' : 
                                     reminder.alertLevel === 'warning' ? '#d97706' : 
                                     reminder.alertLevel === 'info' ? '#2563eb' : 
                                     reminder.alertLevel === 'progress' ? '#059669' : 
                                     reminder.alertLevel === 'early' ? '#6366f1' : '#0ea5e9'
                            }}>
                              <i className="fas fa-layer-group me-1"></i>
                              {reminder.alertLevel.charAt(0).toUpperCase() + reminder.alertLevel.slice(1)}
                            </span>
                          )}
                          {reminder.category && (
                            <span className="badge px-2 py-1 small" style={{ backgroundColor: '#ede9fe', color: '#7c3aed' }}>
                              <i className="fas fa-tag me-1"></i>
                              {reminder.category}
                            </span>
                          )}
                          {reminder.frequency && (
                            <span className="badge px-2 py-1 small" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
                              <i className="fas fa-repeat me-1"></i>
                              {reminder.frequency}
                            </span>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="d-flex gap-2 justify-content-end">
                          {reminder.status !== 'completed' && (
                            <button 
                              className="btn btn-outline-success btn-sm px-3 py-2"
                              onClick={() => markAsComplete(reminder._id)}
                              disabled={processingItems.has(reminder._id)}
                              title="Mark as Complete"
                              style={{ 
                                transition: 'all 0.3s ease',
                                opacity: processingItems.has(reminder._id) ? 0.7 : 1
                              }}
                            >
                              {processingItems.has(reminder._id) ? (
                                <>
                                  <i className="fas fa-spinner fa-spin me-1"></i>
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <i className="fas fa-check me-1"></i>
                                  Complete
                                </>
                              )}
                            </button>
                          )}
                          <button 
                            className="btn btn-outline-danger btn-sm px-3 py-2"
                            onClick={() => dismissReminder(reminder._id)}
                            disabled={processingItems.has(reminder._id)}
                            title="Dismiss"
                            style={{ 
                              transition: 'all 0.3s ease',
                              opacity: processingItems.has(reminder._id) ? 0.7 : 1
                            }}
                          >
                            {processingItems.has(reminder._id) ? (
                              <>
                                <i className="fas fa-spinner fa-spin me-1"></i>
                                Dismissing...
                              </>
                            ) : (
                              <>
                                <i className="fas fa-times me-1"></i>
                                Dismiss
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
                })
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Toast Notification */}
      {showToast && (
        <div 
          className="position-fixed"
          style={{
            top: '20px',
            right: '20px',
            zIndex: 9999,
            animation: 'slideInRight 0.3s ease-out'
          }}
        >
          <div 
            className="alert alert-success alert-dismissible fade show shadow-lg"
            style={{
              minWidth: '300px',
              borderRadius: '10px',
              border: 'none'
            }}
          >
            <i className="fas fa-check-circle me-2"></i>
            {toastMessage}
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setShowToast(false)}
            ></button>
          </div>
        </div>
      )}
      
      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        
        @keyframes fadeOut {
          0% { opacity: 1; transform: scale(1); }
          100% { opacity: 0.8; transform: scale(0.98); }
        }
        
        @keyframes slideInRight {
          0% { transform: translateX(100%); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        
        .preference-card:hover {
          transform: translateY(-5px) !important;
        }
        
        .transition-all {
          transition: all 0.3s ease;
        }
        
        .completed-reminder {
          animation: fadeOut 0.5s ease-in-out;
        }
        
        .completed-reminder .card-body {
          position: relative;
        }
        
        .completed-reminder .card-body::after {
          content: "✓";
          position: absolute;
          top: 10px;
          right: 10px;
          background: #10b981;
          color: white;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 14px;
          z-index: 10;
        }
      `}</style>
      </div>
    </>
  );
};

export default Reminders;
