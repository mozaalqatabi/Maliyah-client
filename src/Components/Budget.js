// client/src/Components/Budget.js
import React, { useState, useEffect, useMemo } from 'react';
 
import {
  Plus, Trash2, Edit, Info,
  Calendar as CalendarIcon, Clock,
  ChevronRight, ChevronLeft
} from 'lucide-react';
 
import {
  Container, Row, Col, Card, Form, Button, Badge, Alert, Spinner
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
 
const API = import.meta?.env?.VITE_API_URL || 'http://localhost:8080';
 
// --- helpers ---
const monthName = (m) =>
  ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][m] || '';
 
const parseYYYYMM = (yyyyMmStr) => {
  if (!yyyyMmStr || typeof yyyyMmStr !== 'string') return null;
  const [y, m] = yyyyMmStr.split('-').map(Number);
  if (!Number.isFinite(y) || !Number.isFinite(m)) return null;
  return new Date(Date.UTC(y, m - 1, 1));
};
 
const getAuthedUser = () => {
  try { return JSON.parse(localStorage.getItem('user')) || null; } catch { return null; }
};
const normEmail = (e) => String(e || '').toLowerCase().trim();
const numberOrNull = (v) => {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  const s = String(v ?? '').trim();
  if (s === '') return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};
const clampPercent = (p) => (!Number.isFinite(p) ? 0 : Math.max(0, Math.min(100, p)));
const fmtOMR = (n) => {
  const x = numberOrNull(n) ?? 0;
  return `OMR ${x.toFixed(2)}`;
};
 
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 2600,
  timerProgressBar: true,
  showCloseButton: true,
});
 
/* =========================================================
   Gamified visuals (no Tailwind needed)
   ========================================================= */
const clamp = (n, min = 0, max = 100) => Math.max(min, Math.min(max, n));
 
function levelForPercent(p) {
  const pct = clamp(Math.round(p));
  if (pct < 25)  return { level: 1, name: 'Warm-Up',     bar: '#10b981', track: '#d1fae5', hint: 'Great start! Keep it steady.', note: 'Early in the month—log consistently.' };
  if (pct < 50)  return { level: 2, name: 'Saver',       bar: '#0ea5e9', track: '#dbeafe', hint: 'Nice pace—you’re on track.',   note: 'Spending is balanced. Keep it up.' };
  if (pct < 75)  return { level: 3, name: 'Strategist',  bar: '#6366f1', track: '#e0e7ff', hint: 'Smart moves—watch the middle.', note: 'Monitor frequent categories now.' };
  if (pct < 90)  return { level: 4, name: 'Pro Planner', bar: '#f59e0b', track: '#fef3c7', hint: 'Caution—tighten a little.',     note: 'Approaching limit—trim non-essentials.' };
  if (pct <=100) return { level: 5, name: 'Edge Walker', bar: '#ef4444', track: '#fee2e2', hint: 'Near the limit—hold the line!', note: 'Focus only on priorities from here.' };
  return { level: 6, name: 'Overrun', bar: '#b91c1c', track: '#fee2e2', hint: 'Over budget—course correct.', note: 'Review overspends & adjust next month.' };
}
 
function InfoNote({ note }) {
  const [show, setShow] = useState(false);
  return (
    <span style={{ position: 'relative', marginLeft: 8 }}>
      <button type="button" onClick={() => setShow(!show)} className="btn btn-link p-0 text-muted">
        <Info size={16} />
      </button>
      {show && (
        <div
          style={{
            position: 'absolute', top: 22, left: 0, zIndex: 10,
            background: 'white', border: '1px solid #e2e8f0', boxShadow: '0 6px 16px rgba(0,0,0,.08)',
            borderRadius: 8, padding: 8, width: 220, fontSize: 12, color: '#475569'
          }}
        >
          {note}
        </div>
      )}
    </span>
  );
}
 
function TWCard({ children }) {
  return (
    <div style={{ width: '100%', background: 'white', border: '1px solid #e2e8f0', borderRadius: 16, boxShadow: '0 8px 18px rgba(0,0,0,.04)', padding: 12 }}>
      {children}
    </div>
  );
}
 
function Stat({ label, value, bg, fg }) {
  return (
    <div className="text-center px-3 py-2 rounded-3" style={{ background: bg, color: fg }}>
      <div style={{ fontSize: 12, opacity: .8, fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 800 }}>{value}</div>
    </div>
  );
}
 
function TWProgress({ pct }) {
  const { bar, track } = levelForPercent(pct);
  return (
    <div style={{ width: '100%', height: 12, background: track, borderRadius: 999, overflow: 'hidden' }}>
      <div
        style={{
          width: `${clamp(pct)}%`, height: '100%', background: bar,
          transition: 'width .6s ease'
        }}
      />
    </div>
  );
}
 
function BudgetOverviewTop({ totalAllocated = 0, totalSpent = 0 }) {
  const totalRemaining = Math.max(0, totalAllocated - totalSpent);
  const pct = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;
  const lvl = levelForPercent(pct);
 
  return (
    <TWCard>
      <div className="d-flex flex-column gap-2">
        <h6 className="mb-0 fw-semibold">💰 Budget Overview</h6>
 
        <div className="d-flex flex-wrap gap-2 justify-content-around">
          <Stat label="Total Allocated" value={`${totalAllocated.toFixed(2)} OMR`} bg="#eff6ff" fg="#1d4ed8" />
          <Stat label="Total Spent"     value={`${totalSpent.toFixed(2)} OMR`}    bg="#fef9c3" fg="#a16207" />
          <Stat label="Remaining"       value={`${totalRemaining.toFixed(2)} OMR`}bg="#ecfdf5" fg="#047857" />
          <Stat label="Usage"           value={`${clamp(Math.round(pct))}%`}      bg="#ffe4e6" fg="#be123c" />
        </div>
 
        <div className="d-flex align-items-center gap-2 mt-1">
          <TWProgress pct={pct} />
          <InfoNote note={lvl.note} />
        </div>
 
        <div className="text-muted small mt-1">
          Level {lvl.level}: <strong className="mx-1">{lvl.name}</strong> — {lvl.hint}
        </div>
      </div>
    </TWCard>
  );
}
// temporary stub only if you still see references
const GamifiedPanel = () => null;
 
/* =========================================================
   Component
   ========================================================= */
export default function Budget() {
  const navigate = useNavigate();
  const user = getAuthedUser();
  const userEmail = normEmail(user?.email || '');
 
  // ====== Month picker state (NEW) ======
  const todayUTC = new Date();
  const [viewedYear, setViewedYear]   = useState(todayUTC.getUTCFullYear());
  const [viewedMonth, setViewedMonth] = useState(todayUTC.getUTCMonth() + 1); // 1..12
  function shiftMonth(delta) {
    const d = new Date(Date.UTC(viewedYear, viewedMonth - 1 + delta, 1));
    setViewedYear(d.getUTCFullYear());
    setViewedMonth(d.getUTCMonth() + 1);
  }
  function onPickMonth(yyyyMm) {
    if (!yyyyMm) return;
    const [y, m] = yyyyMm.split('-').map(Number);
    if (Number.isFinite(y) && Number.isFinite(m)) {
      setViewedYear(y);
      setViewedMonth(m);
    }
  }
 
  // ===========================
  // STATE
  // ===========================
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({
    allocated: '',
    durationMonths: '',
    startMonth: '',
  });
 
  const [editingKey, setEditingKey] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', allocated: '' });
 
  // EXPENSE categories dropdown (fed from Categories page)
  const [expenseOptions, setExpenseOptions] = useState([]);
  const [selectedExpenseId, setSelectedExpenseId] = useState('');
 
  const [expenseLoadFailed, setExpenseLoadFailed] = useState(false);
  const [isLoadingExpense, setIsLoadingExpense] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(true);
 
  // ===========================
  // LOADERS
  // ===========================
  async function loadCategories(year, month, signal) {
    if (!userEmail) return;
    try {
      setLoadingSummary(true);
      const { data } = await axios.get(`${API}/api/budgets/summary`, {
        params: { userEmail, year, month },
        signal,
      });
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      if (signal?.aborted) return;
      Toast.fire({ icon: 'error', title: err?.response?.data?.message || 'Failed to load categories' });
    } finally {
      if (!signal?.aborted) setLoadingSummary(false);
    }
  }
 
  async function loadExpenseOptions(signal) {
    if (!userEmail) {
      setExpenseOptions([]);
      setExpenseLoadFailed(true);
      return;
    }
    setIsLoadingExpense(true);
    setExpenseLoadFailed(false);
    try {
      const q1 = await axios.get(`${API}/api/categories`, {
        params: { email: userEmail, type: 'expense' },
        signal,
      });
      let items = Array.isArray(q1.data) ? q1.data : [];
 
      if (!items.length) {
        const q2 = await axios.get(`${API}/categories/${encodeURIComponent(userEmail)}`, { signal });
        const all = Array.isArray(q2.data) ? q2.data : [];
        items = all.filter(c => String(c.type || '').toLowerCase() === 'expense');
      }
 
      items.sort((a, b) => String(a.name).localeCompare(String(b.name)));
      setExpenseOptions(items);
    } catch (err) {
      if (signal?.aborted) return;
      setExpenseOptions([]);
      setExpenseLoadFailed(true);
    } finally {
      if (!signal?.aborted) setIsLoadingExpense(false);
    }
  }
 
  // Mount & when userEmail / viewed month changes
  useEffect(() => {
    const controller = new AbortController();
    loadCategories(viewedYear, viewedMonth, controller.signal);
    loadExpenseOptions(controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userEmail, viewedYear, viewedMonth]);
 
  // Auto-refresh the dropdown when tab regains focus
  useEffect(() => {
    const onFocus = () => {
      const controller = new AbortController();
      loadExpenseOptions(controller.signal);
      return () => controller.abort();
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);
 
  // Auto-refresh budget summary when records change (AddRecord triggers a storage event)
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'recordsUpdated') {
        const controller = new AbortController();
        loadCategories(viewedYear, viewedMonth, controller.signal);
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [viewedYear, viewedMonth]);
 
  // ===========================
  // DERIVED
  // ===========================
  const visibleBudgetCats = useMemo(
    () => (Array.isArray(categories) ? categories : []).filter(c => c.source === 'budget'),
    [categories]
  );
 
  const totalBudget = visibleBudgetCats.reduce((sum, cat) => sum + (numberOrNull(cat.allocated) ?? 0), 0);
  const totalSpent  = visibleBudgetCats.reduce((sum, cat) => sum + (numberOrNull(cat.spent) ?? 0), 0);
  const savingsRate = totalBudget > 0 ? clampPercent(((totalBudget - totalSpent) / totalBudget) * 100) : 0;
 
  const getAchievementLevel = (spent, allocated) => {
    const a = numberOrNull(allocated) ?? 0;
    const s = numberOrNull(spent) ?? 0;
    if (a <= 0) return { level: 'No Budget Set', color: 'text-muted' };
 
    const pct = (s / a) * 100;
    if (pct < 10)  return { level: 'Not started',  color: 'text-secondary' };
    if (pct <= 40) return { level: 'Healthy',      color: 'text-success'   };
    if (pct <= 85) return { level: 'Caution',      color: 'text-warning'   };
    return             { level: 'Over Budget',     color: 'text-danger'    };
  };
 
  // ===========================
  // CREATE (Add New Budget)
  // ===========================
  const handleAddCategory = async (e) => {
    e.preventDefault();
 
    if (!userEmail) {
      return Toast.fire({ icon: 'info', title: 'Please sign in first.' });
    }
    if (!selectedExpenseId) {
      return Toast.fire({ icon: 'info', title: 'Select an expense category from the list.' });
    }
    const alloc = numberOrNull(newCategory.allocated);
    if (alloc === null || alloc < 0) {
      return Toast.fire({ icon: 'info', title: 'Enter a valid amount.' });
    }
 
    const base = expenseOptions.find(c => c._id === selectedExpenseId || c.id === selectedExpenseId);
    const exists = visibleBudgetCats.some(c =>
      (c.name || '').toLowerCase().trim() === String(base?.name || '').toLowerCase().trim()
    );
    if (exists) {
      return Toast.fire({ icon: 'warning', title: 'Budget for this category already exists.' });
    }
 
    const durationMonths = Math.max(1, Number(newCategory.durationMonths || 1));
    const startMonth = newCategory.startMonth || undefined; // "YYYY-MM"
 
    try {
      // primary route (with categoryId)
      await axios.post(`${API}/api/budgets/category`, {
        userEmail,
        email: userEmail,
        categoryId: selectedExpenseId,
        allocatedAmount: alloc,
        period: 'monthly',
        durationMonths,
        startMonth,
      });
 
      setSelectedExpenseId('');
      setNewCategory({ allocated: '', durationMonths: '1', startMonth: '' });
      await loadCategories(viewedYear, viewedMonth);
      Toast.fire({ icon: 'success', title: 'Category created successfully.' });
    } catch (errPrimary) {
      try {
        // fallback route (with plain name)
        await axios.post(`${API}/api/budgets/categories`, {
          userEmail,
          name: base?.name || 'Unnamed',
          allocated: alloc,
          durationMonths,
          startMonth,
        });
        setSelectedExpenseId('');
        setNewCategory({ allocated: '', durationMonths: '1', startMonth: '' });
        await loadCategories(viewedYear, viewedMonth);
        Toast.fire({ icon: 'success', title: 'Category created successfully.' });
      } catch (errOld) {
        Toast.fire({
          icon: 'error',
          title: errOld?.response?.data?.message || errPrimary?.response?.data?.message || 'Failed to create category.'
        });
      }
    }
  };
 
  // ===========================
  // EDIT / DELETE
  // ===========================
  const startEdit = (cat) => {
    const key = cat.id || cat.baseId || cat._id || cat.name;
    setEditingKey(key);
    setEditForm({ name: cat.name, allocated: String(numberOrNull(cat.allocated) ?? '') });
  };
 
  const cancelEdit = () => {
    setEditingKey(null);
    setEditForm({ name: '', allocated: '' });
  };
 
  const saveEdit = async (cat) => {
    const name = cat.name; // keep the old name
    const alloc = numberOrNull(editForm.allocated);
    if (alloc === null || alloc < 0) return Toast.fire({ icon: 'info', title: 'Enter a valid amount.' });
 
    try {
      if (cat.source === 'budget' && (cat.id || cat._id)) {
        // ✅ only update allocated amount, not name
        await axios.patch(`${API}/api/budgets/categories/${cat.id || cat._id}`, {
          allocated: alloc,
          userEmail
        });
      } else {
        try {
          await axios.post(`${API}/api/budgets/categories`, { userEmail, name: cat.name, allocated: alloc });
        } catch (e) {
          if (e?.response?.status === 409) {
            const { data } = await axios.get(`${API}/api/budgets/summary`, { params: { userEmail, year: viewedYear, month: viewedMonth } });
            const existing = (data || []).find(x =>
              x.source === 'budget' &&
              String(x.name || '').toLowerCase().trim() === name.toLowerCase().trim()
            );
            if (existing?.id || existing?._id) {
              await axios.patch(`${API}/api/budgets/categories/${existing.id || existing._id}`, {
                name, allocated: alloc, userEmail
              });
            } else {
              throw e;
            }
          } else {
            throw e;
          }
        }
      }
      cancelEdit();
      await loadCategories(viewedYear, viewedMonth);
      Toast.fire({ icon: 'success', title: 'Category updated successfully.' });
    } catch (err) {
      Toast.fire({ icon: 'error', title: err?.response?.data?.message || 'Failed to update category.' });
    }
  };
 
  const deleteCategory = async (cat) => {
    const confirmed = await Swal.fire({
      icon: 'warning',
      title: `Delete "${cat.name}" budget?`,
      text: 'This will remove your budget ',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      confirmButtonColor: '#d33',
      cancelButtonText: 'Cancel',
    });
    if (!confirmed.isConfirmed) return;
 
    try {
      await axios.delete(`${API}/api/budgets/categories/${cat.id || cat._id}`);
 
      await loadCategories(viewedYear, viewedMonth);
      Swal.fire({
        icon: 'success',
        title: 'Budget category deleted successfully!',
        text: `"${cat.name}" was removed from your budget.`,
        timer: 2500,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: err?.response?.data?.message || 'Failed to delete category',
      });
    }
  };
 
  // ===========================
  // Styles / Tutorial
  // ===========================
  const steps = [
    {
      title: 'Create Expense Categories',
      body: <>Go to <strong>Categories</strong> and add items like <em>Groceries</em> or <em>Rent</em>. Make sure <strong>Type = Expense</strong>.</>,
      cta: { label: 'Open Categories', action: () => navigate('/category') },
    },
    {
      title: 'Reload the List Here',
      body: <>Come back and your Expense categories appear in the dropdown. If not, refocus this tab or add one more and return.</>,
      cta: { label: 'I’ve added categories', action: () => loadExpenseOptions() },
    },
    {
      title: 'Assign Your New Budget Category',
      body: <>Select a category, enter an <strong>Allocated Amount</strong>, and click <strong>Add Category</strong>.</>,
      cta: null,
    },
  ];
  const [currentStep, setCurrentStep] = useState(0);
 
  const extraCss = `
    .progress { background-color: rgba(0,0,0,.06) !important; height: 12px; }
    .progress-bar { transition: width .6s ease; }
  `;
 
  const EmptyBudgetTutorial = () => (
    <Row className="justify-content-center align-items-center" style={{ minHeight: '44vh' }}>
      <Col md={11} lg={9} xl={8}>
        <Card className="border-0 shadow-sm rounded-4">
          <Card.Body className="p-4">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <h5 className="fw-bold mb-0">How to use Budget Categories</h5>
            </div>
            <p className="text-muted mb-3">
              Follow these steps to set up your first Budget Category. Click a step to focus it.
            </p>
 
            <div className="d-flex flex-wrap gap-2 mb-3">
              {steps.map((s, idx) => (
                <Badge
                  key={idx}
                  bg={idx === currentStep ? 'primary' : 'secondary'}
                  onClick={() => setCurrentStep(idx)}
                  style={{ cursor: 'pointer' }}
                >
                  {`Step ${idx + 1}`}
                </Badge>
              ))}
            </div>
 
            <Card className="border-0 bg-light">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div className="fw-semibold">{steps[currentStep].title}</div>
                </div>
                <div className="text-muted mb-3">{steps[currentStep].body}</div>
 
                <div className="d-flex justify-content-between">
                  <Button
                    variant="outline-secondary"
                    onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                    disabled={currentStep === 0}
                  >
                    <ChevronLeft size={16} className="me-1" /> Back
                  </Button>
 
                  <div className="d-flex gap-2">
                    {steps[currentStep].cta && (
                      <Button variant="success" onClick={steps[currentStep].cta.action}>
                        {steps[currentStep].cta.label}
                      </Button>
                    )}
                    <Button
                      variant="primary"
                      onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                      disabled={currentStep === steps.length - 1}
                    >
                      Next <ChevronRight size={16} className="ms-1" />
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
 
  // ===========================
  // RENDER
  // ===========================
  return (
    <Container fluid className="p-4">
      <style>{extraCss}</style>
 
      {!userEmail ? (
        <Alert variant="warning">Please sign in to view your budget.</Alert>
      ) : (
        <>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="fw-bold mb-0">Budget Overview</h4>
 
            {/* Month controls (NEW) */}
            <div className="d-flex align-items-center gap-2">
              <Button size="sm" variant="outline-secondary" onClick={() => shiftMonth(-1)}>
                <ChevronLeft size={16} />
              </Button>
              <Form.Control
                style={{ width: 180 }}
                type="month"
                value={`${String(viewedYear)}-${String(viewedMonth).padStart(2,'0')}`}
                onChange={(e) => onPickMonth(e.target.value)}
              />
              <Button size="sm" variant="outline-secondary" onClick={() => shiftMonth(1)}>
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
 
          {loadingSummary ? (
            <div className="text-muted d-flex align-items-center mb-3">
              <Spinner size="sm" className="me-2" /> Loading…
            </div>
          ) : null}
 
          {/* ======= Colored Overview (gamified) ======= */}
          <div className="mb-4">
            <BudgetOverviewTop totalAllocated={totalBudget} totalSpent={totalSpent} />
          </div>
 
          {/* Empty tutorial */}
          {visibleBudgetCats.length === 0 && (
            <div className="mb-4"><EmptyBudgetTutorial /></div>
          )}
 
          {/* Budget cards with GAMIFIED progress bar */}
          {visibleBudgetCats.length > 0 && (
            <Row className="g-4 mb-4">
              {visibleBudgetCats.map((cat) => {
                const alloc = numberOrNull(cat.allocated) ?? 0;
                const spent = numberOrNull(cat.spent) ?? 0;
                const pct = alloc > 0 ? (spent / alloc) * 100 : (spent > 0 ? 100 : 0);
                const achievement = getAchievementLevel(spent, alloc);
                const lvl = levelForPercent(pct);
 
                const key = cat.id || cat.baseId || cat._id || cat.name;
                const isEditing = editingKey === key;
 
                // ---- Duration & Start month display (visual only) ----
                const duration = Number(cat.durationMonths || cat.duration || 0) || null; // number or null
                const start = parseYYYYMM(cat.startMonth);                                // Date or null
 
                // Chip 1: Month X of Y / Duration
                let monthChip = '—';
                if (duration && start) {
                  const now = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1));
                  const idx =
                    (now.getUTCFullYear() - start.getUTCFullYear()) * 12 +
                    (now.getUTCMonth() - start.getUTCMonth()) + 1; // 1-based
                  if (idx >= 1 && idx <= duration) {
                    monthChip = `Month ${idx} of ${duration}`;
                  } else {
                    monthChip = `Duration: ${duration} ${duration === 1 ? 'month' : 'months'}`;
                  }
                } else if (duration && !start) {
                  monthChip = `Duration: ${duration} ${duration === 1 ? 'month' : 'months'}`;
                } else if (!duration && start) {
                  monthChip = 'Duration: —';
                }
 
                // Chip 2: Period label
                let periodLabel = '—';
                if (start && duration) {
                  const end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + (duration - 1), 1));
                  periodLabel = `${monthName(start.getUTCMonth())} ${start.getUTCFullYear()} → ${monthName(end.getUTCMonth())} ${end.getUTCFullYear()}`;
                } else if (start && !duration) {
                  periodLabel = `${monthName(start.getUTCMonth())} ${start.getUTCFullYear()} → —`;
                }
 
                return (
                  <Col md={6} key={key}>
                    <Card className="border-0 h-100 shadow-sm rounded-4">
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h5 className="fw-bold mb-1">{cat.name}</h5>
 
                            {/* Month & Duration chips */}
                            <div className="d-flex flex-wrap gap-2 mb-2 small">
                              <span className="badge rounded-pill text-dark bg-light">
                                <Clock size={14} className="me-1" />
                                {monthChip}
                              </span>
                              <span className="badge rounded-pill bg-primary bg-opacity-10 text-primary">
                                <CalendarIcon size={14} className="me-1" />
                                {periodLabel}
                              </span>
                            </div>
 
                            {isEditing ? (
                              <>
                                <Form.Control
                                  type="text"
                                  value={editForm.name}
                                  disabled
                                  readOnly
                                  className="mb-2"
                                  placeholder="Category name"
                                />
 
                                <Form.Control
                                  type="number"
                                  inputMode="decimal"
                                  min="0"
                                  step="0.01"
                                  value={editForm.allocated}
                                  onChange={(e) => setEditForm({ ...editForm, allocated: e.target.value })}
                                  className="mb-2"
                                  placeholder="Allocated (OMR)"
                                  style={{ maxWidth: 220 }}
                                />
                                <div className="d-flex gap-2">
                                  <Button variant="success" size="sm" onClick={() => saveEdit(cat)}>Save</Button>
                                  <Button variant="secondary" size="sm" onClick={cancelEdit}>Cancel</Button>
                                </div>
                              </>
                            ) : (
                              <>
                                <p className="text-muted mb-2">
                                  {fmtOMR(spent)} of {fmtOMR(alloc)}
                                </p>
                                <div className="text-muted small mb-1">
                                  Level {lvl.level}: <strong className="mx-1">{lvl.name}</strong> — {lvl.hint}
                                  <InfoNote note={lvl.note} />
                                </div>
                              </>
                            )}
                          </div>
 
                          <div className="d-flex gap-2">
                            {!isEditing && (
                              <Button
                                variant="link"
                                className="text-primary p-0"
                                title="Edit allocated amount"
                                onClick={() => startEdit(cat)}
                              >
                                <Edit size={18} />
                              </Button>
                            )}
                            <Button
                              variant="link"
                              className="text-danger p-0"
                              title="Delete category"
                              onClick={() => deleteCategory(cat)}
                            >
                              <Trash2 size={18} />
                            </Button>
                          </div>
                        </div>
 
                        {!isEditing && (
                          <>
                            {/* Gamified progress bar */}
                            <div className="mt-2">
                              <TWProgress pct={pct} />
                              <div className="d-flex justify-content-between small mt-1">
                                <span className={achievement.color}>{achievement.level}</span>
                                <span>{clampPercent(pct).toFixed(1)}%</span>
                              </div>
                            </div>
                          </>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          )}
 
          {/* Add New Budget */}
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Body>
              <h5 className="fw-bold mb-3">Add New Budget Category</h5>
 
              <Form onSubmit={handleAddCategory}>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Category Name</Form.Label>
                      <Form.Select
                        value={selectedExpenseId}
                        onChange={(e) => setSelectedExpenseId(e.target.value)}
                        required
                        disabled={isLoadingExpense || !userEmail}
                      >
                        {isLoadingExpense && <option>Loading categories…</option>}
                        {!isLoadingExpense && expenseOptions.length === 0 && (
                          <option value="">{userEmail ? 'No expense categories yet' : 'Please sign in'}</option>
                        )}
                        {!isLoadingExpense && expenseOptions.length > 0 && (
                          <>
                            <option value="">— Select expense category —</option>
                            {expenseOptions.map(opt => (
                              <option key={opt._id || opt.id} value={opt._id || opt.id}>
                                {opt.name}
                              </option>
                            ))}
                          </>
                        )}
                      </Form.Select>
                      <div className="form-text">
                        {expenseOptions.length === 0
                          ? userEmail
                            ? 'Add Expense categories on the Categories page first.'
                            : 'Sign in to load your categories.'
                          : 'Pulled from your Categories page (Expense only).'}
                      </div>
                      {expenseLoadFailed && userEmail && (
                        <div className="small text-danger mt-2">
                          Couldn’t load categories. Check your server and <code>VITE_API_URL</code>.
                        </div>
                      )}
                    </Form.Group>
                  </Col>
 
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Allocated Amount (OMR)</Form.Label>
                      <Form.Control
                        type="number"
                        inputMode="decimal"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={newCategory.allocated}
                        onChange={(e) => setNewCategory({ ...newCategory, allocated: e.target.value })}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
 
                {/* Duration + Start Month */}
                <Row className="mb-3">
                  {/* Duration */}
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Duration</Form.Label>
                      <Form.Select
                        required
                        value={newCategory.durationMonths || ''}
                        onChange={(e) =>
                          setNewCategory({ ...newCategory, durationMonths: e.target.value })
                        }
                        onInvalid={(e) =>
                          e.currentTarget.setCustomValidity('Please select how many months this budget will run')
                        }
                        onInput={(e) => e.currentTarget.setCustomValidity('')}
                      >
                        <option value="">Choose duration</option>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                          <option key={m} value={m}>
                            {m} {m === 1 ? 'month' : 'months'}
                          </option>
                        ))}
                      </Form.Select>
                      <div className="form-text">How long this budget should run.</div>
                    </Form.Group>
                  </Col>
 
                  {/* Start Month */}
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Start Month (optional)</Form.Label>
                      <Form.Control
                        type="month"
                        required
                        value={newCategory.startMonth || ''}
                        onChange={(e) =>
                          setNewCategory({ ...newCategory, startMonth: e.target.value })
                        }
                        onInvalid={(e) =>
                          e.currentTarget.setCustomValidity('Please choose the month you want this budget to start')
                        }
                        onInput={(e) => e.currentTarget.setCustomValidity('')}
                      />
                      <div className="form-text">Leave empty to start this month.</div>
                    </Form.Group>
                  </Col>
                </Row>
 
                <div className="d-flex justify-content-end">
                  <Button type="submit" variant="primary" disabled={!userEmail}>
                    <Plus size={16} className="me-2" /> Add Category
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </>
      )}
    </Container>
  );
}