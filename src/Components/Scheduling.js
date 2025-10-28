// client/src/Components/Scheduling.js
import React, { useEffect, useMemo, useState } from 'react';
import {
  Container, Row, Col, Form, Button, Table, Alert, ButtonGroup, Card, Spinner
} from 'react-bootstrap';
import {
  DollarSign, Calendar as CalendarIcon, Clock, Tag, FileText, Plus
} from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { formatDateDDMMYYYY, getCurrentDateForInput } from '../utils/dateUtils';

const API = import.meta?.env?.VITE_API_URL || 'https://maliyah-server.onrender.com';

/**
* Toast (quick toasts) — same config used across pages for consistent UX
*/
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 2600,
  timerProgressBar: true,
  showCloseButton: true,
  customClass: {
    popup: 'oq-toast',
    title: 'oq-toast-title',
    htmlContainer: 'oq-toast-text',
    closeButton: 'oq-toast-close',
    timerProgressBar: 'oq-toast-progress'
  },
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  }
});

// Helpers
const formatOMR = (n) => `OMR ${Number(n || 0).toFixed(3)}`;
const isoYMD = (d) => new Date(d).toISOString().slice(0, 10);
const prettyDate = (d) => formatDateDDMMYYYY(d);

export default function Scheduling() {
  // auth / user
  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user')) || null; } catch { return null; }
  })();
  const userEmail = user?.email || '';

  // UI state
  const [tab, setTab] = useState('expense'); // 'expense' | 'income'
  const [cats, setCats] = useState([]);
  const [list, setList] = useState([]);      // schedules for current tab
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // edit mode
  const [editId, setEditId] = useState(null);
  const [editSnapshot, setEditSnapshot] = useState(null); // store original values for diff popup

  // form
  const [form, setForm] = useState({
    amount: '',
    categoryId: '',
    startDate: getCurrentDateForInput(),
    frequency: 'monthly',
    description: '',
  });

  const freqOptions = [
    { value: 'daily', label: 'Daily', api: 'DAILY' },
    { value: 'weekly', label: 'Weekly', api: 'WEEKLY' },
    { value: 'monthly', label: 'Monthly', api: 'MONTHLY' },
    { value: 'yearly', label: 'Yearly', api: 'YEARLY' },
  ];
  const currentFreqApi = freqOptions.find(f => f.value === form.frequency)?.api || 'MONTHLY';
  const labelForApi = (api) => {
    const item = freqOptions.find(f => f.api === (api || '').toUpperCase());
    return item ? item.label : api || 'Monthly';
  };

  // -------- Fetch categories --------
  const fetchCategories = async () => {
    if (!userEmail) { setCats([]); return; }
    try {
      // modern (if you have /api/categories)
      const res = await axios.get(`${API}/api/categories`, { params: { email: userEmail } });
      setCats(res.data || []);
    } catch (err) {
      // legacy fallback
      try {
        const legacy = await axios.get(`${API}/categories/${encodeURIComponent(userEmail)}`);
        setCats(legacy.data || []);
      } catch (err2) {
        console.error('fetchCategories error:', err2);
        setErrorMsg('Failed to load categories');
      }
    }
  };

  // -------- Fetch schedules --------
  const fetchSchedules = async () => {
    if (!userEmail) { setList([]); return; }
    try {
      const res = await axios.get(`${API}/schedules`, { params: { email: userEmail, type: tab } });
      setList(res.data || []);
    } catch (err) {
      try {
        const legacy = await axios.get(`${API}/schedules/${encodeURIComponent(userEmail)}`);
        const items = Array.isArray(legacy.data) ? legacy.data : [];
        setList(items.filter(s => (s?.type || 'expense').toLowerCase() === tab));
      } catch (err2) {
        console.error('fetchSchedules error:', err2);
        setErrorMsg('Failed to load schedules');
      }
    }
  };

  // initial + on tab change
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        await Promise.all([fetchCategories(), fetchSchedules()]);
      } finally {
        setLoading(false);
      }
    })();
  }, [userEmail, tab]);

  // filter cats by tab
  const filteredCats = useMemo(
    () => (cats || []).filter(c => (c?.type || 'expense').toLowerCase() === tab),
    [cats, tab]
  );
  const noCategoriesForTab = filteredCats.length === 0;

  // Build diff message for edit popup
  const buildEditDiffHtml = (before, after) => {
    const changes = [];

    if (Number(before.amount) !== Number(after.amount)) {
      changes.push(`<li><b>Amount:</b> ${formatOMR(before.amount)} → ${formatOMR(after.amount)}</li>`);
    }

    if ((before.categoryId || '') !== (after.categoryId || '')) {
      changes.push(`<li><b>Category:</b> ${before.categoryName || '(none)'} → ${after.categoryName || '(none)'}</li>`);
    }

    if ((before.freq || '').toUpperCase() !== (after.freq || '').toUpperCase()) {
      changes.push(`<li><b>Frequency:</b> ${labelForApi(before.freq)} → ${labelForApi(after.freq)}</li>`);
    }

    if (isoYMD(before.startDate) !== isoYMD(after.startDate)) {
      changes.push(`<li><b>First Due Date:</b> ${prettyDate(before.startDate)} → ${prettyDate(after.startDate)}</li>`);
    }

    if ((before.description || '') !== (after.description || '')) {
      changes.push(`<li><b>Description:</b> “${before.description || ''}” → “${after.description || ''}”</li>`);
    }

    if ((before.type || 'expense').toLowerCase() !== (after.type || 'expense').toLowerCase()) {
      changes.push(`<li><b>Type:</b> ${(before.type || 'expense')} → ${(after.type || 'expense')}</li>`);
    }

    if (changes.length === 0) {
      return '<i>No fields changed.</i>';
    }
    return `<ul style="margin:0 0 0 1rem; padding:0;">${changes.join('')}</ul>`;
  };

  // -------- Submit (Create or Edit) --------
  const submit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!userEmail) {
      Toast.fire({ icon: 'warning', title: 'Please sign in first' });
      return;
    }
    if (!form.categoryId) {
      Toast.fire({ icon: 'info', title: `Select a ${tab} category` });
      return;
    }
    const amt = Number(form.amount);
    if (!amt || Number.isNaN(amt) || amt <= 0) {
      Toast.fire({ icon: 'info', title: 'Enter a valid amount greater than 0' });
      return;
    }

    const selected = filteredCats.find(c => String(c._id) === String(form.categoryId));
    if (!selected) {
      Toast.fire({ icon: 'error', title: 'Selected category not found' });
      return;
    }

    try {
      setSubmitting(true);

      if (editId) {
        // Prepare "after" snapshot for diff
        const afterSnapshot = {
          amount: amt,
          categoryId: selected._id,
          categoryName: selected.name,
          freq: currentFreqApi,
          startDate: form.startDate,
          description: form.description || '',
          type: tab,
        };

        // PATCH update
        await axios.patch(`${API}/schedules/${editId}`, {
          amount: amt,
          description: form.description || '',
          freq: currentFreqApi,
          firstDueDate: form.startDate,
          categoryId: selected._id,
          categoryName: selected.name,
          type: tab,
        });

        // Refresh immediately
        await fetchSchedules();

        // Pop a detailed changes popup
        await Swal.fire({
          icon: 'success',
          title: 'Schedule updated',
          html: `
<div class="text-start" style="font-size:14px;">
<div><b>Schedule:</b> ${selected.name} (${tab})</div>
<div style="margin-top:0.5rem;"><b>Changes:</b></div>
              ${buildEditDiffHtml(editSnapshot || {}, afterSnapshot)}
</div>
          `,
          confirmButtonText: 'OK'
        });

        setEditId(null);
        setEditSnapshot(null);
      } else {
        // POST create
        const createResp = await axios.post(`${API}/schedules`, {
          userEmail,
          categoryId: selected._id,
          categoryName: selected.name,
          description: form.description || '',
          amount: amt,
          freq: currentFreqApi,
          interval: 1,
          firstDueDate: form.startDate,
          autoPost: true,
          active: true,
          type: tab,
        });

        // (A) Refresh schedules list immediately so user sees it
        await fetchSchedules();

        // (B) Optionally run first occurrence if due today/past
        try {
          const created = createResp?.data?.schedule;
          if (created && new Date(created.firstDueDate) <= new Date()) {
            await axios.post(`${API}/schedules/${created._id}/run`);
          }
        } catch (runErr) {
          console.warn('Failed to post first occurrence immediately:', runErr);
        }

        // Success popup
        await Swal.fire({
          icon: 'success',
          title: `Schedule Created — ${selected.name}`,
          html: `<div class="text-start" style="font-size:14px;">
<div><b>Type:</b> ${tab}</div>
<div><b>Amount:</b> ${formatOMR(amt)}</div>
<div><b>Frequency:</b> ${labelForApi(currentFreqApi)}</div>
<div><b>First Due:</b> ${prettyDate(form.startDate)}</div>
</div>`,
          confirmButtonText: 'Nice!'
        });
      }

      setForm({
        amount: '',
        categoryId: '',
        startDate: new Date().toISOString().slice(0, 10),
        frequency: 'monthly',
        description: '',
      });

    } catch (err) {
      console.error('submit schedule error:', err);
      Toast.fire({
        icon: 'error',
        title: editId ? 'Failed to update schedule' : 'Failed to create schedule',
        text: err?.response?.data?.message || 'Please try again'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // -------- Toggle Active --------
  const toggleActive = async (id) => {
    // Find schedule before toggling for contextual popup
    const s = list.find(x => x._id === id);
    try {
      await axios.post(`${API}/schedules/${id}/toggle`);
      await fetchSchedules();

      const newActive = !(s?.active); // flipped
      await Swal.fire({
        icon: newActive ? 'success' : 'warning',
        title: newActive ? 'Schedule Activated' : 'Schedule Deactivated',
        html: `
<div class="text-start" style="font-size:14px;">
<div><b>Schedule:</b> ${s?.categoryName || '(no name)'} (${(s?.type || tab)})</div>
<div><b>Amount:</b> ${formatOMR(s?.amount)}</div>
<div><b>Next Due:</b> ${s?.nextDueAt ? prettyDate(s.nextDueAt) : '—'}</div>
<div style="margin-top:0.5rem;"><b>Status:</b> ${newActive ? 'Active' : 'Inactive'}</div>
</div>
        `,
        confirmButtonText: 'OK'
      });

    } catch (e) {
      Toast.fire({ icon: 'error', title: 'Failed to toggle schedule' });
    }
  };

  // -------- Edit / Delete --------
  const editSchedule = (s) => {
    setEditId(s._id);
    setTab((s.type || 'expense').toLowerCase()); // ensure correct tab is selected

    setForm({
      amount: String(s.amount ?? ''),
      categoryId: s.categoryId || '',
      startDate: isoYMD(s.nextDueAt || s.firstDueDate || new Date()),
      frequency: (s.freq || 'MONTHLY').toLowerCase(),
      description: s.description || '',
    });

    // Capture snapshot for diff
    setEditSnapshot({
      amount: Number(s.amount || 0),
      categoryId: s.categoryId || '',
      categoryName: s.categoryName || '',
      freq: (s.freq || 'MONTHLY').toUpperCase(),
      startDate: s.nextDueAt || s.firstDueDate || new Date(),
      description: s.description || '',
      type: (s.type || 'expense'),
    });

    Toast.fire({ icon: 'info', title: 'Edit mode' });
  };

  const deleteSchedule = async (id) => {
    const s = list.find(x => x._id === id);
    const res = await Swal.fire({
      icon: 'warning',
      title: 'Delete this schedule?',
      html: `<div class="text-start" style="font-size:14px;">
<div><b>Schedule:</b> ${s?.categoryName || '(no name)'} (${s?.type || tab})</div>
<div><b>Amount:</b> ${formatOMR(s?.amount)}</div>
<div><b>Next Due:</b> ${s?.nextDueAt ? prettyDate(s.nextDueAt) : '—'}</div>
</div>
<div style="margin-top:0.5rem;">This will remove the schedule.</div>`,
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33'
    });
    if (!res.isConfirmed) return;

    try {
      await axios.delete(`${API}/schedules/${id}`);
      await fetchSchedules();
      await Swal.fire({
        icon: 'success',
        title: 'Schedule deleted',
        html: `<div class="text-start" style="font-size:14px;">
<div><b>Schedule:</b> ${s?.categoryName || '(no name)'} (${s?.type || tab})</div>
</div>`,
        confirmButtonText: 'OK'
      });
    } catch {
      Toast.fire({ icon: 'error', title: 'Failed to delete schedule' });
    }
  };

  if (!userEmail) {
    return (
      <Container className="py-4">
        <Alert variant="warning">Please sign in to schedule transactions.</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Col>
        <h4 className="fw-bold mb-0">Bill Payment Scheduler </h4>
        <p className="text-muted">Set up recurring transactions</p>
      </Col>

      <Card className="rounded-4 shadow-sm border-0 p-4 mb-4">
        <Card.Body className="p-0">
          <ButtonGroup className="mb-4 w-100 gap-2">
            <Button
              className="rounded-3 fw-semibold"
              variant={tab === 'expense' ? 'danger' : 'outline-secondary'}
              onClick={() => { setTab('expense'); setEditId(null); setEditSnapshot(null); }}
            >
              Recurring Expense
            </Button>
            <Button
              className="rounded-3 fw-semibold"
              variant={tab === 'income' ? 'success' : 'outline-secondary'}
              onClick={() => { setTab('income'); setEditId(null); setEditSnapshot(null); }}
            >
              Recurring Income
            </Button>
          </ButtonGroup>

          <Form onSubmit={submit}>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Label><DollarSign size={16} className="me-1 mb-1" />Amount</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="0.000"
                  value={form.amount}
                  onChange={(e) => setForm(f => ({ ...f, amount: e.target.value }))}
                  required
                  min="0.001"
                  step="0.001"
                  className="rounded-3"
                />
              </Col>
              <Col md={6}>
                <Form.Label><CalendarIcon size={16} className="me-1 mb-1" />First Due Date</Form.Label>
                <Form.Control
                  type="date"
                  value={form.startDate}
                  min={new Date().toISOString().slice(0, 10)}   // ✅ restricts past dates
                  onChange={(e) => setForm(f => ({ ...f, startDate: e.target.value }))}
                  required
                  className="rounded-3"
                />
              </Col>

            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Label><Clock size={16} className="me-1 mb-1" />Frequency</Form.Label>
                <Form.Select
                  value={form.frequency}
                  onChange={(e) => setForm(f => ({ ...f, frequency: e.target.value }))}
                  className="rounded-3"
                >
                  {freqOptions.map(f => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={6}>
                <Form.Label><Tag size={16} className="me-1 mb-1" />Category</Form.Label>
                <Form.Select
                  value={form.categoryId}
                  onChange={(e) => setForm(f => ({ ...f, categoryId: e.target.value }))}
                  className="rounded-3"
                  required
                  disabled={noCategoriesForTab}
                >
                  <option value="">
                    {noCategoriesForTab
                      ? `No ${tab} categories yet — add one in Categories`
                      : `Select a ${tab} category`}
                  </option>
                  {filteredCats.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </Form.Select>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={12}>
                <Form.Group className="mb-4">
                  <Form.Label><FileText size={16} className="me-1 mb-1" />Description</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter description"
                    value={form.description}
                    onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                    className="rounded-3"
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end gap-2">
              {editId && (
                <Button
                  variant="outline-secondary"
                  className="rounded-3"
                  onClick={() => {
                    setEditId(null);
                    setEditSnapshot(null);
                    setForm({
                      amount: '',
                      categoryId: '',
                      startDate: new Date().toISOString().slice(0, 10),
                      frequency: 'monthly',
                      description: '',
                    });
                  }}
                  disabled={submitting}
                >
                  Cancel Edit
                </Button>
              )}

              <Button
                variant="outline-secondary"
                className="rounded-3"
                onClick={() => setForm({
                  amount: '',
                  categoryId: '',
                  startDate: new Date().toISOString().slice(0, 10),
                  frequency: 'monthly',
                  description: '',
                })}
                disabled={submitting}
              >
                Clear
              </Button>

              <Button
                variant="primary"
                type="submit"
                className="rounded-3 d-flex align-items-center"
                disabled={submitting || noCategoriesForTab}
              >
                {submitting ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" /> {editId ? 'Updating…' : 'Creating…'}
                  </>
                ) : (
                  <>
                    <Plus size={16} className="me-2" /> {editId ? 'Save Changes' : 'Save Schedule'}
                  </>
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      {/* Schedules table */}
      <h5 className="fw-semibold mb-3">Your Schedules ({tab})</h5>
      {loading ? (
        <div className="text-muted d-flex align-items-center">
          <Spinner size="sm" className="me-2" /> Loading…
        </div>
      ) : list.length === 0 ? (
        <p className="text-muted">No schedules yet.</p>
      ) : (
        <Table responsive hover className="rounded-3 overflow-hidden shadow-sm">
          <thead className="table-light">
            <tr>
              <th>Next Due</th>
              <th>Description</th>
              <th>Category</th>
              <th>Freq</th>
              <th>Type</th> {/* NEW — styled same as AddRecord */}
              <th className="text-end">Amount (OMR)</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((s) => {
              const rowType = String(s.type || tab || 'expense').toLowerCase();
              return (
                <tr key={s._id}>
                  <td>{s.nextDueAt ? isoYMD(s.nextDueAt) : '—'}</td>
                  <td>{s.description}</td>
                  <td>{s.categoryName}</td>
                  <td>{s.freq}</td>
                  <td className={rowType === 'income' ? 'text-success' : 'text-danger'}>
                    {rowType}
                  </td>
                  <td className="text-end">{Number(s.amount).toFixed(3)}</td>
                  <td className="text-end">
                    <Button
                      size="sm"
                      variant={s.active ? 'outline-danger' : 'outline-success'}
                      className="me-2 rounded-3"
                      onClick={() => toggleActive(s._id)}
                    >
                      {s.active ? 'Deactivate' : 'Activate'}
                    </Button>

                    <Button
                      size="sm"
                      variant="outline-warning"
                      className="me-2 rounded-3"
                      onClick={() => editSchedule(s)}
                    >
                      Edit
                    </Button>

                    <Button
                      size="sm"
                      variant="outline-danger"
                      className="rounded-3"
                      onClick={() => deleteSchedule(s._id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}
    </Container>
  );

}
