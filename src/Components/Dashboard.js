
import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, ProgressBar, Alert } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';
import toast, { Toaster } from 'react-hot-toast';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import {
  BarChart as BarChartIcon,
  Wallet,
  Plus,
  TrendingUp,
  TrendingDown,
  PieChart as PieChartIcon,
  Clock,
  Tag,
  Banknote,
  Coffee,
  ShoppingCart,
  Home,
  Car,
  Dumbbell,
  RefreshCw,
  Activity,
  Zap,
  Bell,
  Settings,
  Calendar,
  Users,
  Target
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts';
import OnboardingTour from './OnboardingTour';
import { 
  fetchDashboardData,
  selectDashboardLoading,
  selectDashboardError,
  selectFinancialSummary,
  selectRecentTransactions,
  selectAllTransactions,
  selectUserGoals,
  selectSpendingByCategory,
  clearError
} from '../Features/DashboardSlice';

const categoryIcons = {
  Food: <Coffee size={18} />,
  Income: <Banknote size={18} />,
  Utilities: <Home size={18} />,
  Transport: <Car size={18} />,
  Shopping: <ShoppingCart size={18} />,
  Health: <Dumbbell size={18} />,
  Entertainment: <Coffee size={18} />,
  Education: <Coffee size={18} />,
  Travel: <Car size={18} />,
  Other: <Tag size={18} />
};

const getVariantForCategory = (index) => {
  const variants = ['primary', 'info', 'success', 'warning', 'danger'];
  return variants[index % variants.length];
};

const DashboardPage = () => {
  const [showTour, setShowTour] = useState(false);

  // Add custom styles to document head
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .balance-gradient {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.2);
        border-radius: 16px !important;
        position: relative;
        overflow: hidden;
      }
      
      .balance-gradient::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, #a8ff78 0%, #78ffd6 100%);
        opacity: 0.1;
        z-index: 1;
      }
      
      .balance-gradient .card-body {
        position: relative;
        z-index: 2;
      }
      
      .income-gradient {
        background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(78, 205, 196, 0.2);
        border-radius: 16px !important;
        position: relative;
        overflow: hidden;
      }
      
      .income-gradient::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, #10b981, #34d399);
        z-index: 3;
      }
      
      .expense-gradient {
        background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(252, 182, 159, 0.2);
        border-radius: 16px !important;
        position: relative;
        overflow: hidden;
      }
      
      .expense-gradient::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, #ef4444, #f87171);
        z-index: 3;
      }
      
      .savings-gradient {
        background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(168, 237, 234, 0.2);
        border-radius: 16px !important;
        position: relative;
        overflow: hidden;
      }
      
      .savings-gradient::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, #3b82f6, #60a5fa);
        z-index: 3;
      }
      
      .dashboard-card:hover {
        transform: translateY(-8px);
        box-shadow: 0 12px 35px rgba(0, 0, 0, 0.15) !important;
      }
      
      .dashboard-card:hover .card-hover-text {
        opacity: 1;
        transform: translateY(0);
      }
      
      /* Hero Balance Card Styling */
      .balance-gradient:hover {
        transform: translateY(-10px) scale(1.02);
        box-shadow: 0 20px 45px rgba(102, 126, 234, 0.3) !important;
      }
      
      .hero-balance {
        font-size: 2.2rem !important;
        font-weight: 800 !important;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        letter-spacing: -0.5px;
      }
      
      .hero-title {
        font-size: 1.1rem !important;
        font-weight: 600 !important;
        letter-spacing: 0.5px;
        text-transform: uppercase;
      }
      
      .card-icon {
        font-size: 2.5rem;
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
      }
      
      .card-title {
        font-size: 1rem !important;
        font-weight: 600 !important;
        letter-spacing: 0.3px;
        margin-bottom: 0.5rem !important;
      }
      
      .card-value {
        font-size: 1.8rem !important;
        font-weight: 700 !important;
        line-height: 1.2;
        margin-bottom: 0.5rem !important;
      }
      
      .card-note {
        font-size: 0.85rem !important;
        opacity: 0.8;
        font-weight: 500;
      }
      
      .card-hover-text {
        position: absolute;
        bottom: 10px;
        right: 15px;
        opacity: 0;
        transform: translateY(10px);
        transition: all 0.3s ease;
        font-size: 0.75rem;
        font-weight: 500;
      }
      
      /* All gradient cards - consistent dark text */
      .balance-gradient .card-hover-text,
      .income-gradient .card-hover-text,
      .expense-gradient .card-hover-text,
      .savings-gradient .card-hover-text {
        color: rgba(0, 0, 0, 0.7) !important;
      }
      
      .balance-gradient .text-muted,
      .income-gradient .text-muted,
      .expense-gradient .text-muted,
      .savings-gradient .text-muted {
        color: rgba(0, 0, 0, 0.6) !important;
      }
      
      .balance-gradient .text-dark,
      .income-gradient .text-dark,
      .expense-gradient .text-dark,
      .savings-gradient .text-dark {
        color: #2d3748 !important;
      }
      
      .balance-gradient .small,
      .income-gradient .small,
      .expense-gradient .small,
      .savings-gradient .small {
        color: rgba(0, 0, 0, 0.6) !important;
      }
      
      .balance-gradient h2,
      .income-gradient h2,
      .expense-gradient h2,
      .savings-gradient h2 {
        color: #2d3748 !important;
      }
      
      /* Make sure all text elements use dark colors */
      .dashboard-card .text-muted {
        color: rgba(0, 0, 0, 0.6) !important;
      }
      
      .dashboard-card .text-dark {
        color: #2d3748 !important;
      }
      
      .dashboard-card .small {
        color: rgba(0, 0, 0, 0.6) !important;
      }
      
      .dashboard-card h2 {
        color: #2d3748 !important;
      }
      
      /* Chart container animations */
      .chart-container {
        opacity: 0;
        transform: translateY(20px);
        animation: fadeInUp 0.8s ease-out forwards;
        background: linear-gradient(180deg, #f9fbfd 0%, #eef6f5 100%);
        border-radius: 12px;
        padding: 12px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        overflow: visible !important;
        position: relative;
        z-index: 1;
      }
      
      @keyframes fadeInUp {
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      /* Chart styling with rounded corners */
      .dashboard-card {
        border-radius: 16px !important;
        border: none !important;
        overflow: hidden;
      }
      
      .recharts-wrapper {
        border-radius: 12px;
      }
      
      /* Enhanced text contrast */
      .dashboard-card .text-muted {
        color: rgba(0, 0, 0, 0.7) !important;
        font-weight: 500 !important;
      }
      
      .dashboard-card .text-dark {
        color: #1a202c !important;
        font-weight: 600 !important;
      }
      
      .dashboard-card h2 {
        color: #1a202c !important;
        font-weight: 700 !important;
      }
      
      .dashboard-card h5 {
        color: #2d3748 !important;
        font-weight: 600 !important;
      }
      
      .dashboard-card .small {
        color: rgba(0, 0, 0, 0.65) !important;
        font-weight: 500 !important;
      }
      
      /* Chart type selector animations */
      .chart-selector .btn {
        transition: all 0.3s ease;
        transform: scale(1);
      }
      
      .chart-selector .btn:hover {
        transform: scale(1.05);
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
      }
      
      .chart-selector .btn:active {
        transform: scale(0.98);
      }
      
      /* Pulse animation for active chart type */
      .chart-selector .btn-dark {
        animation: pulse 2s infinite;
      }
      
      @keyframes pulse {
        0% {
          box-shadow: 0 0 0 0 rgba(52, 58, 64, 0.4);
        }
        70% {
          box-shadow: 0 0 0 10px rgba(52, 58, 64, 0);
        }
        100% {
          box-shadow: 0 0 0 0 rgba(52, 58, 64, 0);
        }
      }
      
      /* Smooth transitions for chart switching */
      .chart-transition {
        transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      /* Bar chart specific animations */
      .recharts-bar-rectangle {
        transition: all 0.3s ease;
        cursor: pointer;
      }
      
      .recharts-bar-rectangle:hover {
        filter: brightness(1.1) !important;
        transform: scale(1.02) !important;
        transform-origin: bottom center !important;
      }
      
      /* Grid line animations */
      .recharts-cartesian-grid-horizontal line,
      .recharts-cartesian-grid-vertical line {
        opacity: 0;
        animation: gridFadeIn 1s ease-out 0.5s forwards;
      }
      
      @keyframes gridFadeIn {
        to {
          opacity: 0.5;
        }
      }
      
      /* Axis animations */
      .recharts-xAxis .recharts-cartesian-axis-tick,
      .recharts-yAxis .recharts-cartesian-axis-tick {
        opacity: 0;
        animation: axisFadeIn 0.6s ease-out 1s forwards;
      }
      
      @keyframes axisFadeIn {
        to {
          opacity: 1;
        }
      }
      
      /* Tooltip enhancements */
      .recharts-tooltip-wrapper {
        animation: tooltipBounceIn 0.3s ease-out;
      }
      
      @keyframes tooltipBounceIn {
        0% {
          opacity: 0;
          transform: scale(0.8);
        }
        50% {
          transform: scale(1.05);
        }
        100% {
          opacity: 1;
          transform: scale(1);
        }
      }
      
      /* Line chart specific animations - removed CSS line drawing for better compatibility */
      .recharts-line .recharts-dot {
        opacity: 0;
        animation: dotFadeIn 0.5s ease-out forwards;
        animation-delay: 2.5s;
      }
      
      @keyframes dotFadeIn {
        to {
          opacity: 1;
        }
      }
      
      .recharts-active-dot {
        animation: dotPulse 2s infinite;
      }
      
      @keyframes dotPulse {
        0% {
          transform: scale(1);
          opacity: 1;
        }
        50% {
          transform: scale(1.2);
          opacity: 0.8;
        }
        100% {
          transform: scale(1);
          opacity: 1;
        }
      }
      
      /* Area chart animations */
      .recharts-area {
        animation: areaFadeIn 2.5s ease-out forwards;
      }
      
      @keyframes areaFadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
      
      /* Animated Grid */
      .animated-grid {
        animation: gridPulse 3s ease-in-out infinite;
      }
      
      @keyframes gridPulse {
        0%, 100% {
          opacity: 0.3;
        }
        50% {
          opacity: 0.6;
        }
      }
      
      /* Enhanced dot glow effect */
      .recharts-dot {
        transition: all 0.3s ease;
      }
      
      .recharts-dot:hover {
        transform: scale(1.2);
        filter: brightness(1.2);
      }
      
      .recharts-active-dot {
        animation: dotGlow 1.5s ease-in-out infinite alternate;
      }
      
      @keyframes dotGlow {
        from {
          filter: drop-shadow(0 0 5px currentColor);
        }
        to {
          filter: drop-shadow(0 0 10px currentColor);
        }
      }
      
      /* Animated Gradient Background */
      .chart-bg-animate {
        background: linear-gradient(120deg, #e0f7fa, #e8f5e9, #f1f8e9);
        background-size: 600% 600%;
        animation: gradientFlow 10s ease infinite;
        border-radius: 12px;
      }
      
      @keyframes gradientFlow {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);
  const [analyticsFilter, setAnalyticsFilter] = useState('monthly');
  const [chartType, setChartType] = useState('bar');
  const [animationKey, setAnimationKey] = useState(0);

  // Trigger re-animation when chart type changes
  const handleChartTypeChange = (newType) => {
    setChartType(newType);
    setAnimationKey(prev => prev + 1);
  }; // 'bar', 'line', or 'both'
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [dashboardGoals, setDashboardGoals] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [insightsToShow, setInsightsToShow] = useState([]);
  const insightSeverityColor = { critical: '#f87171', warning: '#f59e0b', info: '#60a5fa' };
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // ---- Inlined insight helper functions () ----
  const groupByMonth = (records) => {
    const map = {};
    (records || []).forEach(r => {
      const dateStr = r.startDate || r.date || r.createdAt || r.timestamp;
      if (!dateStr) return;
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      map[key] = map[key] || { total: 0, byCategory: {} };
      if (r.type === 'expense') {
        const amt = Math.abs(Number(r.amount) || 0);
        map[key].total += amt;
        const cat = r.category || 'Other';
        map[key].byCategory[cat] = (map[key].byCategory[cat] || 0) + amt;
      }
    });
    return map;
  };

  const percentChange = (previous, current) => {
    if (!previous) return Infinity;
    return ((current - previous) / previous) * 100;
  };

  const computeOverspendInsights = (records, opts = { percentThreshold: 20, minAmount: 5 }) => {
    const months = groupByMonth(records);
    const keys = Object.keys(months).sort();
    if (keys.length < 2) return [];
    const last = months[keys[keys.length - 1]];
    const prev = months[keys[keys.length - 2]] || { byCategory: {} };
    const insights = [];
    Object.keys(last.byCategory).forEach(cat => {
      const lastAmt = last.byCategory[cat] || 0;
      const prevAmt = prev.byCategory[cat] || 0;
      if (lastAmt < opts.minAmount) return;
      // If previous amount is zero (no spending previous period), treat as new spending
      if (!prevAmt || prevAmt === 0) {
        insights.push({
          id: `new_spend_${cat}_${keys[keys.length - 1]}`,
          text: `You spent OMR ${lastAmt.toFixed(3)} on ${cat} this month (no spending in the previous period).`,
          severity: 'warning',
          // impact: absolute amount newly spent (higher = more important)
          impact: lastAmt,
          meta: { lastAmt, prevAmt }
        });
        return;
      }
      const change = percentChange(prevAmt, lastAmt);
      if (change >= opts.percentThreshold) {
        // Provide more helpful phrasing for large percentages by showing amounts
        const pct = Math.round(change);
        const lastAmtStr = lastAmt.toFixed(3);
        const prevAmtStr = prevAmt.toFixed(3);
        // If the multiplier is large (e.g., >=2x), prefer an 'Nx as much' phrasing
        const multiplier = prevAmt > 0 ? (lastAmt / prevAmt) : Infinity;
        let message = '';
        if (multiplier >= 2) {
          // For sizeable increases prefer the multiplier phrasing (e.g., 2.5x)
          message = `You spent ${multiplier.toFixed(1)}x as much on ${cat} this month (OMR ${lastAmtStr} vs OMR ${prevAmtStr}).`;
        } else {
          // Keep percent phrasing for smaller relative changes, include amounts for clarity
          message = `You spent ${pct}% more on ${cat} this month (OMR ${lastAmtStr} vs OMR ${prevAmtStr}).`;
        }

        insights.push({
          id: `overspend_${cat}_${keys[keys.length - 1]}`,
          text: message,
          severity: 'warning',
          // impact measured as absolute increase (last - prev)
          impact: Math.max(0, lastAmt - prevAmt),
          meta: { lastAmt, prevAmt, pctChange: change }
        });
      }
    });
    return insights;
  };

  const computeLowBalanceInsight = (financialSummary, records, opts = { pctOfMonthly: 0.2, minAbsolute: 10 }) => {
    if (!financialSummary) return null;
    const currentBalance = Number(financialSummary.currentBalance || 0);
    const months = groupByMonth(records);
    const keys = Object.keys(months).sort();
    let lastTotal = 0;
    if (keys.length > 0) {
      lastTotal = months[keys[keys.length - 1]].total || 0;
    }
    const threshold = Math.max(opts.minAbsolute, lastTotal * opts.pctOfMonthly);
    if (currentBalance < threshold) {
      const deficit = threshold - currentBalance;
      return {
        id: `low_balance_${new Date().toISOString().slice(0,10)}`,
        text: `Low balance: OMR ${currentBalance.toFixed(3)} available (threshold OMR ${threshold.toFixed(3)}).`,
        severity: 'critical',
        // impact: how far below the threshold the balance is (higher = more urgent)
        impact: deficit,
        meta: { currentBalance, threshold }
      };
    }
    return null;
  };
  // ---- end inlined helpers ----

  // Redux selectors
  const loading = useSelector(selectDashboardLoading);
  const error = useSelector(selectDashboardError);
  const financialSummary = useSelector(selectFinancialSummary);
  const recentTransactions = useSelector(selectRecentTransactions);
  const allTransactions = useSelector(selectAllTransactions);
  const goals = useSelector(selectUserGoals);
  const spendingByCategory = useSelector(selectSpendingByCategory);

  // Simple debug to track goals
  console.log('Dashboard Goals Status:', dashboardGoals?.length || 0, dashboardGoals);

  // Get user info from localStorage
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userEmail = storedUser?.email;
  const userId = storedUser?._id;


  const reduxUser = useSelector((state) => state.counter?.user);
  const reduxUserId = reduxUser?._id;



  // Test function to manually fetch goals
  const testGoalsFetch = async () => {
    const finalUserId = userId || reduxUserId;
    console.log('Fetching goals for userId:', finalUserId);
    
    if (!finalUserId) {
      toast.error('No user ID available');
      return;
    }

    try {
      const response = await fetch(`https://maliyah-server.onrender.com/goals/${finalUserId}`);
      const data = await response.json();
      console.log('Goals fetched:', data.length, data);
      setDashboardGoals(data);
      toast.success(`Loaded ${data.length} goals`);
    } catch (error) {
      console.error('Goals fetch error:', error);
      toast.error('Failed to fetch goals');
    }
  };

  useEffect(() => {
    const tutorialKey = userEmail ? `tutorialShown_${userEmail}` : null;
    const showFromLogin = location.state?.showTutorial || false;

    // ✅ Only show tour if coming from login and not already seen
    if (showFromLogin && tutorialKey && !localStorage.getItem(tutorialKey)) {
      setShowTour(true);
      localStorage.setItem(tutorialKey, "true");
    }
  }, [location.state, userEmail]);

  useEffect(() => {
    // Fetch dashboard data when component mounts or user changes
    const finalUserId = userId || reduxUserId;
    if (userEmail && finalUserId) {
      dispatch(fetchDashboardData({ userEmail, userId: finalUserId }));
      
      // Direct fetch for goals (same as Goals component)
      fetch(`https://maliyah-server.onrender.com/goals/${finalUserId}`)
        .then(res => res.json())
        .then(data => {
          console.log('Direct goals fetch result:', data);
          setDashboardGoals(data);
        })
        .catch(error => {
          console.error('Direct goals fetch error:', error);
          setDashboardGoals([]);
        });
      // Fetch budgets summary for Top Budgets section
      fetch(`https://maliyah-server.onrender.com/api/budgets/summary?userEmail=${encodeURIComponent(userEmail)}`)
        .then(res => res.json())
        .then(data => {
          // Ensure we have an array
          setBudgets(Array.isArray(data) ? data : []);
        })
        .catch(err => {
          console.error('Failed to fetch budgets summary', err);
          setBudgets([]);
        });
      // Fetch schedules for Top Schedules card
      fetch(`https://maliyah-server.onrender.com/schedules/${encodeURIComponent(userEmail)}`)
        .then(res => res.json())
        .then(data => {
          const arr = Array.isArray(data) ? data : [];
          console.log('Dashboard: initial schedules fetched', arr.length);
          setSchedules(arr);
        })
        .catch(err => {
          console.error('Failed to fetch schedules', err);
          setSchedules([]);
        });
      // Fetch reminders for Top Reminders section
      fetch(`https://maliyah-server.onrender.com/reminders/${finalUserId}`)
        .then(res => res.json())
        .then(data => {
          const arr = Array.isArray(data) ? data : [];
          console.log('Dashboard: initial reminders fetched', arr.length, arr);
          setReminders(arr);
        })
        .catch(err => {
          console.error('Failed to fetch reminders', err);
          setReminders([]);
        });
    }
  }, [dispatch, userEmail, userId, reduxUserId]);

  // Compute simple rule-based insights (overspend and low balance)
  useEffect(() => {
    try {
      // gather inputs
      const records = Array.isArray(allTransactions) ? allTransactions : [];
      const fs = financialSummary || {};

      // compute candidate insights
      const overspends = computeOverspendInsights(records, { percentThreshold: 20, minAmount: 5 });
      const lowBal = computeLowBalanceInsight(fs, records, { pctOfMonthly: 0.2, minAbsolute: 10 });
      const candidates = [];
  if (lowBal) candidates.push(lowBal);
  if (overspends && overspends.length) candidates.push(...overspends);

      // dedupe by id and filter out seen insights from localStorage (24h)
      // Scope seen map per-user to avoid cross-account interference
      const finalUserKey = userId || reduxUserId || userEmail;
      const seenStorageKey = finalUserKey ? `dashboardInsightsSeen_${finalUserKey}` : 'dashboardInsightsSeen';
      let seenRaw = localStorage.getItem(seenStorageKey);
      // If we don't have a user-scoped value yet but a global value exists, migrate it
      if ((!seenRaw || seenRaw === '{}') && finalUserKey) {
        const globalRaw = localStorage.getItem('dashboardInsightsSeen');
        if (globalRaw) {
          try {
            localStorage.setItem(seenStorageKey, globalRaw);
            seenRaw = globalRaw;
          } catch (e) {
            // ignore storage errors
          }
        }
      }
      let seen = {};
      try { seen = seenRaw ? JSON.parse(seenRaw) : {}; } catch (e) { seen = {}; }
      const now = Date.now();
      const fresh = [];
      candidates.forEach(c => {
        const seenTs = seen[c.id];
        if (!seenTs || (now - seenTs) > 24 * 60 * 60 * 1000) {
          fresh.push(c);
        }
      });

      // Sort fresh insights by severity then by impact (both descending)
      const severityWeight = (s) => {
        if (!s) return 0;
        if (s === 'critical') return 3;
        if (s === 'warning') return 2;
        if (s === 'info') return 1;
        return 0;
      };

      fresh.sort((a, b) => {
        const wA = severityWeight(a.severity);
        const wB = severityWeight(b.severity);
        if (wA !== wB) return wB - wA; // higher severity first
        const impA = typeof a.impact === 'number' ? a.impact : 0;
        const impB = typeof b.impact === 'number' ? b.impact : 0;
        return impB - impA; // higher impact first
      });

  setInsightsToShow(fresh.slice(0, 5));
    } catch (e) {
      console.error('Insight compute error', e);
    }
  }, [allTransactions, financialSummary]);

  const dismissInsight = (id) => {
    try {
        const finalUserKey = userId || reduxUserId || userEmail;
        const seenStorageKey = finalUserKey ? `dashboardInsightsSeen_${finalUserKey}` : 'dashboardInsightsSeen';
        const seenRaw = localStorage.getItem(seenStorageKey);
        let seen = {};
        try { seen = seenRaw ? JSON.parse(seenRaw) : {}; } catch (e) { seen = {}; }
        seen[id] = Date.now();
        localStorage.setItem(seenStorageKey, JSON.stringify(seen));
      setInsightsToShow(prev => prev.filter(i => i.id !== id));
    } catch (e) {
      console.error('Failed to dismiss insight', e);
    }
  };

  // Auto-refresh functionality
  useEffect(() => {
    const finalUserId = userId || reduxUserId;
    if (autoRefresh && userEmail && finalUserId) {
      const interval = setInterval(() => {
        dispatch(fetchDashboardData({ userEmail, userId: finalUserId }));
        
        // Also refresh goals directly
        fetch(`https://maliyah-server.onrender.com/goals/${finalUserId}`)
          .then(res => res.json())
          .then(data => setDashboardGoals(data))
          .catch(error => console.error('Auto-refresh goals error:', error));
        // Also refresh budgets summary during auto-refresh
        fetch(`https://maliyah-server.onrender.com/api/budgets/summary?userEmail=${encodeURIComponent(userEmail)}`)
          .then(res => res.json())
          .then(data => setBudgets(Array.isArray(data) ? data : []))
          .catch(err => console.error('Auto-refresh budgets error:', err));
        // Also refresh reminders during auto-refresh
        fetch(`https://maliyah-server.onrender.com/reminders/${finalUserId}`)
          .then(res => res.json())
          .then(data => {
            const arr = Array.isArray(data) ? data : [];
            console.log('Dashboard: auto-refresh reminders fetched', arr.length);
            setReminders(arr);
          })
          .catch(err => console.error('Auto-refresh reminders error:', err));
        // Also refresh schedules during auto-refresh
        fetch(`https://maliyah-server.onrender.com/schedules/${encodeURIComponent(userEmail)}`)
          .then(res => res.json())
          .then(data => {
            const arr = Array.isArray(data) ? data : [];
            console.log('Dashboard: auto-refresh schedules fetched', arr.length);
            setSchedules(arr);
          })
          .catch(err => console.error('Auto-refresh schedules error:', err));
        
        setLastRefresh(new Date());
      }, 30000); // Refresh every 30 seconds

      setRefreshInterval(interval);
      return () => clearInterval(interval);
    } else if (refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    }
  }, [autoRefresh, userEmail, userId, reduxUserId, dispatch]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [refreshInterval]);

  const handleRefresh = () => {
    const finalUserId = userId || reduxUserId;
    if (userEmail && finalUserId) {
      toast.promise(
        dispatch(fetchDashboardData({ userEmail, userId: finalUserId })).unwrap(),
        {
          loading: 'Refreshing dashboard...',
          success: 'Dashboard updated successfully!',
          error: 'Failed to refresh dashboard'
        }
      );
      
      // Also refresh goals directly
      fetch(`https://maliyah-server.onrender.com/goals/${finalUserId}`)
        .then(res => res.json())
        .then(data => setDashboardGoals(data))
        .catch(error => console.error('Goals refresh error:', error));
      // Refresh budgets summary on manual refresh
      fetch(`https://maliyah-server.onrender.com0/api/budgets/summary?userEmail=${encodeURIComponent(userEmail)}`)
        .then(res => res.json())
        .then(data => setBudgets(Array.isArray(data) ? data : []))
        .catch(err => console.error('Budgets refresh error:', err));
      
      setLastRefresh(new Date());
    }
  };

  const toggleAutoRefresh = () => {
    const newAutoRefresh = !autoRefresh;
    setAutoRefresh(newAutoRefresh);
    toast.success(
      newAutoRefresh ? 'Auto-refresh enabled' : 'Auto-refresh disabled',
      {
        icon: newAutoRefresh ? '🔄' : '⏸️',
        duration: 2000
      }
    );
  };

  // Listen for budgetsUpdated (cross-tab via storage and same-tab via CustomEvent)
  React.useEffect(() => {
    const fetchBudgetsSummary = () => {
      if (!userEmail) return;
      fetch(`https://maliyah-server.onrender.com/api/budgets/summary?userEmail=${encodeURIComponent(userEmail)}`)
        .then(res => res.json())
        .then(data => setBudgets(Array.isArray(data) ? data : []))
        .catch(err => {
          console.error('Failed to fetch budgets summary (listener)', err);
          setBudgets([]);
        });
    };

    const onStorage = (e) => {
      if (e.key === 'budgetsUpdated') {
        fetchBudgetsSummary();
      }
    };

    const onCustom = (e) => {
      // same-window CustomEvent with detail may be used elsewhere
      fetchBudgetsSummary();
    };

    window.addEventListener('storage', onStorage);
    window.addEventListener('budgetsUpdated', onCustom);

    // cleanup
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('budgetsUpdated', onCustom);
    };
  }, [userEmail]);

  // Listen for remindersUpdated (cross-tab via storage and same-tab via CustomEvent)
  React.useEffect(() => {
    const fetchReminders = () => {
      if (!userEmail) return;
      const finalUserId = userId || reduxUserId;
      if (!finalUserId) return;
      fetch(`https://maliyah-server.onrender.com/reminders/${finalUserId}`)
        .then(res => res.json())
        .then(data => setReminders(Array.isArray(data) ? data : []))
        .catch(err => {
          console.error('Failed to fetch reminders (listener)', err);
          setReminders([]);
        });
    };

    const onStorage = (e) => {
      if (e.key === 'remindersUpdated') fetchReminders();
    };

    const onCustom = (e) => {
      fetchReminders();
    };

    window.addEventListener('storage', onStorage);
    window.addEventListener('remindersUpdated', onCustom);

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('remindersUpdated', onCustom);
    };
  }, [userEmail, userId, reduxUserId]);

  // Listen for schedulesUpdated (cross-tab via storage and same-tab via CustomEvent)
  React.useEffect(() => {
    const fetchSchedules = () => {
      if (!userEmail) return;
      fetch(`https://maliyah-server.onrender.com/schedules/${encodeURIComponent(userEmail)}`)
        .then(res => res.json())
        .then(data => setSchedules(Array.isArray(data) ? data : []))
        .catch(err => {
          console.error('Failed to fetch schedules (listener)', err);
          setSchedules([]);
        });
    };

    const onStorage = (e) => {
      if (e.key === 'schedulesUpdated') fetchSchedules();
    };

    const onCustom = (e) => {
      fetchSchedules();
    };

    window.addEventListener('storage', onStorage);
    window.addEventListener('schedulesUpdated', onCustom);

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('schedulesUpdated', onCustom);
    };
  }, [userEmail]);

  const getTimeAgo = (date) => {
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const getCurrentDateTime = () => {
    return format(new Date(), 'EEEE, MMMM do, yyyy • HH:mm');
  };

  const handleAddTransaction = () => {
    navigate('/add-record');
  };

  const handleViewStatement = () => {
    navigate('/report');
  };

  // Helper function to get donut chart data
  const getDonutData = () => {
    if (!allTransactions.length) return [];
    
    const totalIncome = allTransactions.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    const totalExpense = allTransactions.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    
    return [
      { name: 'Income', value: totalIncome, fill: '#198754' },
      { name: 'Expense', value: totalExpense, fill: '#dc3545' }
    ];
  };

  // Helper function to get transaction date
  const getTransactionDate = (tx) => {
    // Try different possible date fields
    const dateStr = tx.startDate || tx.date || tx.createdAt || tx.timestamp;
    if (!dateStr) return null;
    
    // Parse the date string
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
  };

  // Helper function to get chart data based on selected filter
  const getChartData = () => {
    if (!allTransactions.length) return [];
    
    const now = new Date();
    const expenses = allTransactions.filter(tx => tx.type === 'expense');
    const income = allTransactions.filter(tx => tx.type === 'income');
    
    if (analyticsFilter === 'weekly') {
      // Get last 7 days
      const weekData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        const dayExpenses = expenses.filter(tx => {
          const txDate = getTransactionDate(tx);
          return txDate && txDate.toDateString() === date.toDateString();
        });
        const dayIncome = income.filter(tx => {
          const txDate = getTransactionDate(tx);
          return txDate && txDate.toDateString() === date.toDateString();
        });
        
        const expenseTotal = dayExpenses.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
        const incomeTotal = dayIncome.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
        
        weekData.push({ 
          name: dayName, 
          expense: expenseTotal,
          income: incomeTotal 
        });
      }
      return weekData;
    } else if (analyticsFilter === 'yearly') {
      // Get last 12 months
      const yearData = [];
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        const monthName = date.toLocaleDateString('en-US', { month: 'short' });
        
        const monthExpenses = expenses.filter(tx => {
          const txDate = getTransactionDate(tx);
          return txDate && txDate.getMonth() === date.getMonth() && txDate.getFullYear() === date.getFullYear();
        });
        const monthIncome = income.filter(tx => {
          const txDate = getTransactionDate(tx);
          return txDate && txDate.getMonth() === date.getMonth() && txDate.getFullYear() === date.getFullYear();
        });
        
        const expenseTotal = monthExpenses.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
        const incomeTotal = monthIncome.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
        
        yearData.push({ 
          name: monthName, 
          expense: expenseTotal,
          income: incomeTotal 
        });
      }
      return yearData;
    } else {
      // Monthly - simplified to just show all data for now
      const monthData = [];
      
      // For testing, let's just aggregate all data into weeks
      const today = new Date();
      const totalExpense = expenses.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
      const totalIncome = income.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
      
      // Create 4 weeks with the actual data in the current week
      for (let i = 3; i >= 0; i--) {
        const weekName = `Week ${4 - i}`;
        
        if (i === 0) {
          // Current week - put all the data here
          monthData.push({ 
            name: weekName, 
            expense: totalExpense,
            income: totalIncome 
          });
        } else {
          // Other weeks - empty for now
          monthData.push({ 
            name: weekName, 
            expense: 0,
            income: 0 
          });
        }
      }
        
      
      return monthData;
    }
  };


  
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow rounded border">
          <p className="fw-medium mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className={`mb-1 ${entry.dataKey === 'income' ? 'text-success' : 'text-danger'}`}>
              <span className="fw-medium text-capitalize">{entry.dataKey}:</span> {formatCurrency(entry.value)}
            </p>
          ))}
          {payload.length === 2 && (
            <hr className="my-2" />
          )}
          {payload.length === 2 && (
            <p className="mb-0 fw-medium text-primary">
              Net: {formatCurrency(payload.find(p => p.dataKey === 'income')?.value - payload.find(p => p.dataKey === 'expense')?.value)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const formatCurrency = (amount) => {
    return `OMR ${Math.abs(amount).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return `Today, ${format(date, 'HH:mm')}`;
    } else if (isYesterday(date)) {
      return `Yesterday, ${format(date, 'HH:mm')}`;
    } else {
      return format(date, 'MMM dd, yyyy');
    }
  };



  // Loading skeleton component
  const DashboardSkeleton = () => (
    <SkeletonTheme baseColor="#f8f9fa" highlightColor="#e9ecef">
      <Container fluid className="p-4">
        <div className="dashboard-header mb-4">
          <Row className="align-items-center">
            <Col md={8}>
              <Skeleton height={32} width={300} className="mb-2" />
              <Skeleton height={16} width={400} />
            </Col>
            <Col md={4} className="text-end">
              <Skeleton height={32} width={200} />
            </Col>
          </Row>
        </div>
        
        <Row className="g-4 mb-4">
          {[1, 2, 3, 4].map(i => (
            <Col md={3} key={i}>
              <Card className="dashboard-card border-0 h-100">
                <Card.Body>
                  <Skeleton height={20} width={120} className="mb-3" />
                  <Skeleton height={40} width={150} className="mb-2" />
                  <Skeleton height={14} width={200} className="mb-3" />
                  <Skeleton height={32} width="100%" />
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
        
        <Row className="g-4">
          <Col lg={8}>
            <Card className="dashboard-card border-0">
              <Card.Body>
                <Skeleton height={24} width={200} className="mb-4" />
                {[1, 2, 3].map(i => (
                  <div key={i} className="mb-3">
                    <Skeleton height={60} width="100%" />
                  </div>
                ))}
              </Card.Body>
            </Card>
          </Col>
          <Col lg={4}>
            <Card className="dashboard-card border-0">
              <Card.Body>
                <Skeleton height={24} width={150} className="mb-4" />
                {[1, 2].map(i => (
                  <div key={i} className="mb-4">
                    <Skeleton height={50} width="100%" />
                  </div>
                ))}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </SkeletonTheme>
  );

  if (loading && recentTransactions.length === 0) {
    return <DashboardSkeleton />;
  }


  return (
    <div className="dashboard-animated">
      <Container fluid className="p-4">
        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#333',
              borderRadius: '12px',
              border: '1px solid rgba(0,0,0,0.1)',
              boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
            }
          }}
        />
        
        {/* ✅ Onboarding Tutorial */}
        {showTour && <OnboardingTour onFinish={() => setShowTour(false)} runTour={showTour} />}

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => dispatch(clearError())}>
          <strong>Error:</strong> {error}
        </Alert>
      )}

      {/* Dynamic Header */}
      <div className="dashboard-header mb-4">
        <Row className="align-items-center">
          <Col md={8}>
            <div className="d-flex align-items-center mb-2">
              <Activity size={28} className="text-primary me-3" />
              <div>
                <h3 className="fw-bold mb-1 text-gradient">Financial Dashboard</h3>
                <div className="d-flex align-items-center text-muted small">
                  <Calendar size={14} className="me-1" />
                  <span className="me-3">{getCurrentDateTime()}</span>
                  <div className="d-flex align-items-center">
                    <div className={`status-dot ${loading ? 'loading' : 'active'} me-1`}></div>
                    <span>Last updated: {getTimeAgo(lastRefresh)}</span>
                  </div>
                </div>
              </div>
            </div>
          </Col>
          <Col md={4} className="text-end">
            <div className="d-flex justify-content-end gap-2 flex-wrap">
              <Button 
                variant={autoRefresh ? "success" : "outline-secondary"} 
                size="sm" 
                onClick={toggleAutoRefresh}
                className="d-flex align-items-center"
              >
                <Zap size={14} className="me-1" />
                {autoRefresh ? 'Live' : 'Manual'}
              </Button>
              <Button 
                variant="outline-secondary" 
                size="sm" 
                onClick={handleRefresh} 
                disabled={loading}
                className="d-flex align-items-center"
              >
                <RefreshCw size={14} className={`me-1 ${loading ? 'spinning' : ''}`} />
                Refresh
              </Button>
              <Button 
                variant="primary" 
                size="sm" 
                onClick={handleAddTransaction}
                className="d-flex align-items-center"
              >
                <Plus size={14} className="me-1" />
                Quick Add
              </Button>
            </div>
          </Col>
        </Row>
      </div>

      {/* (Insights moved below the Financial Insights card) */}

      {/* Dynamic Overview Cards */}
      <div className="cards-animated">
        <Row className="g-4 mb-4">
          {[
          {
            title: 'Current Balance',
            value: formatCurrency(financialSummary.currentBalance),
            note: 'Total income minus expenses',
            trend: financialSummary.currentBalance >= 0 ? '+Healthy' : '-Deficit',
            icon: '💰',
            iconComponent: financialSummary.currentBalance >= 0 ? <Wallet size={24} /> : <TrendingDown size={24} />,
            variant: financialSummary.currentBalance >= 0 ? 'success' : 'danger',
            button: 'View Statement',
            action: handleViewStatement,
            bgGradient: 'balance-gradient',
            pulse: financialSummary.currentBalance < 0,
            isHero: true
          },
          {
            title: 'Monthly Income',
            value: formatCurrency(financialSummary.monthlyIncome),
            note: `${recentTransactions.filter(tx => tx.type === 'income').length} income sources`,
            trend: financialSummary.monthlyIncome > 0 ? '+Active' : 'No Income',
            icon: '📈',
            iconComponent: <TrendingUp size={24} />,
            variant: 'success',
            button: 'Add Income',
            action: handleAddTransaction,
            bgGradient: 'income-gradient',
            pulse: false
          },
          {
            title: 'Monthly Expenses',
            value: formatCurrency(financialSummary.monthlyExpenses),
            note: financialSummary.monthlyIncome > 0 ? 
              `${Math.round((financialSummary.monthlyExpenses / financialSummary.monthlyIncome) * 100)}% of income` : 
              'Track your spending patterns',
            trend: financialSummary.monthlyExpenses > 0 ? 
              (financialSummary.monthlyExpenses > financialSummary.monthlyIncome * 0.8 ? 'High' : 'Moderate') : 
              'No Expenses',
            icon: '💸',
            iconComponent: <TrendingDown size={24} />,
            variant: financialSummary.monthlyExpenses > financialSummary.monthlyIncome * 0.8 ? 'warning' : 'info',
            button: 'Add Expense',
            action: handleAddTransaction,
            bgGradient: 'expense-gradient',
            pulse: financialSummary.monthlyExpenses > financialSummary.monthlyIncome
          },
          {
            title: 'Savings Rate',
            value: `${financialSummary.monthlyIncome > 0 ? 
              Math.round(((financialSummary.monthlyIncome - financialSummary.monthlyExpenses) / financialSummary.monthlyIncome) * 100) : 
              0}%`,
            note: dashboardGoals && dashboardGoals.length > 0 ? `${dashboardGoals.length} active goals` : 'Set your first goal',
            trend: financialSummary.monthlyIncome > financialSummary.monthlyExpenses ? '+Saving' : '-Spending',
            icon: '🎯',
            iconComponent: <Target size={24} />,
            variant: financialSummary.monthlyIncome > financialSummary.monthlyExpenses ? 'primary' : 'secondary',
            button: 'View Goals',
            action: () => navigate('/goals'),
            bgGradient: 'savings-gradient',
            pulse: false
          }
        ].map((card, idx) => (
          <Col md={3} key={idx}>
            <div className="card-animated" style={{ animationDelay: `${idx * 0.1}s` }}>
              <Card className={`dashboard-card border-0 h-100 ${card.bgGradient} ${card.pulse ? 'pulse-card' : ''}`}>
              <Card.Body className="d-flex flex-column position-relative">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div className="d-flex align-items-center">
                    <div className="card-icon me-3">
                      {card.icon}
                    </div>
                    <div>
                      <div className={`card-title text-muted ${card.isHero ? 'hero-title' : ''}`}>
                        {card.title}
                      </div>
                      <div className="d-none d-md-block">
                        {card.iconComponent}
                      </div>
                    </div>
                  </div>
                  <div className={`trend-badge bg-${card.variant} bg-opacity-15 text-${card.variant} rounded-pill px-2 py-1 small fw-medium`}>
                    {card.trend}
                  </div>
                </div>
                <div className="mb-2">
                  <h2 className={`fw-bold mb-1 text-dark ${card.isHero ? 'hero-balance' : 'card-value'}`}>
                    {card.value}
                  </h2>
                  <div className="text-muted card-note">{card.note}</div>
                </div>
                <div className="mt-auto">
                  <Button 
                    variant={card.variant} 
                    size="sm" 
                    className="w-100 fw-medium"
                    onClick={card.action}
                    style={{
                      borderRadius: '12px',
                      padding: '8px 16px',
                      fontWeight: '600'
                    }}
                  >
                    {card.button} →
                  </Button>
                </div>
                
                {/* Hover text */}
                <div className="card-hover-text">
                  View Details →
                </div>
                
                {loading && (
                  <div className="position-absolute top-0 end-0 p-2">
                    <div className="spinner-border spinner-border-sm text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>
            </div>
          </Col>
        ))}
        </Row>
      </div>

      {/* Spending Analysis and Category Breakdown */}
      <Row className="g-4 mb-4">
        <Col lg={8}>
          <Card className="dashboard-card border-0" style={{borderRadius: '16px'}}>
            <Card.Body style={{ minHeight: chartType === 'both' ? '1400px' : 'auto', overflow: 'visible' }}>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold mb-0">Spending Analysis</h5>
                <div className="d-flex gap-4 align-items-center">
                  {/* Chart Type Selector */}
                  <div className="btn-group chart-selector" role="group" aria-label="Chart type selector">
                    <Button 
                      variant={chartType === 'bar' ? 'dark' : 'outline-secondary'}
                      size="sm"
                      onClick={() => handleChartTypeChange('bar')}
                      className="px-3"
                    >
                      <BarChartIcon size={14} className="me-1" />
                      Bar Chart
                    </Button>
                    <Button 
                      variant={chartType === 'line' ? 'dark' : 'outline-secondary'}
                      size="sm"
                      onClick={() => handleChartTypeChange('line')}
                      className="px-3"
                    >
                      <TrendingUp size={14} className="me-1" />
                      Line Chart
                    </Button>
                    <Button 
                      variant={chartType === 'donut' ? 'dark' : 'outline-secondary'}
                      size="sm"
                      onClick={() => handleChartTypeChange('donut')}
                      className="px-3"
                    >
                      <PieChartIcon size={14} className="me-1" />
                      Donut Chart
                    </Button>
                    <Button 
                      variant={chartType === 'both' ? 'dark' : 'outline-secondary'}
                      size="sm"
                      onClick={() => handleChartTypeChange('both')}
                      className="px-3"
                    >
                      All Views
                    </Button>
                  </div>
                  
                  {/* Time Period Selector */}
                  <div>
                    <Button 
                      variant="link" 
                      className={`text-decoration-none p-0 me-3 ${analyticsFilter === 'weekly' ? 'text-primary fw-medium' : 'text-muted'}`}
                      onClick={() => setAnalyticsFilter('weekly')}
                    >
                      Weekly
                    </Button>
                    <Button 
                      variant="link" 
                      className={`text-decoration-none p-0 me-3 ${analyticsFilter === 'monthly' ? 'text-primary fw-medium' : 'text-muted'}`}
                      onClick={() => setAnalyticsFilter('monthly')}
                    >
                      Monthly
                    </Button>
                    <Button 
                      variant="link" 
                      className={`text-decoration-none p-0 ${analyticsFilter === 'yearly' ? 'text-primary fw-medium' : 'text-muted'}`}
                      onClick={() => setAnalyticsFilter('yearly')}
                    >
                      Yearly
                    </Button>
                  </div>
                </div>
              </div>
              <div className="chart-container">
                {allTransactions.length > 0 ? (
                  <div>
                    {/* Chart Display */}
                    {chartType === 'bar' && (
                      <div className="chart-bg-animate" style={{ width: '100%', height: '280px', marginBottom: '40px' }}>
                        <div className="d-flex align-items-center mb-3 pb-2 border-bottom">
                          <BarChartIcon size={16} className="me-2 text-muted" />
                          <h6 className="text-dark mb-0 fw-semibold">📊 Individual Bar Chart</h6>
                        </div>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            key={`bar-chart-individual-${animationKey}`}
                            data={getChartData()}
                            margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                          >
                            <defs>
                              <linearGradient id="incomeGradientIndividual" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#198754" stopOpacity={0.8}/>
                                <stop offset="100%" stopColor="#198754" stopOpacity={0.3}/>
                              </linearGradient>
                              <linearGradient id="expenseGradientIndividual" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#dc3545" stopOpacity={0.8}/>
                                <stop offset="100%" stopColor="#dc3545" stopOpacity={0.3}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid 
                              strokeDasharray="3 3" 
                              stroke="#ddd" 
                              opacity={0.3}
                              className="animated-grid"
                            />
                            <XAxis 
                              dataKey="name" 
                              axisLine={false}
                              tickLine={false}
                              tick={{ fontSize: 12, fill: '#666' }}
                            />
                            <YAxis 
                              axisLine={false}
                              tickLine={false}
                              tick={{ fontSize: 12, fill: '#666' }}
                              tickFormatter={(value) => `${value}`}
                            />
                            <Tooltip 
                              cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
                              contentStyle={{
                                backgroundColor: '#fff',
                                border: '1px solid #e0e0e0',
                                borderRadius: '8px',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                padding: '12px'
                              }}
                              formatter={(value, name) => [formatCurrency(value), name]}
                              labelStyle={{ color: '#333', fontWeight: 'bold', marginBottom: '8px' }}
                            />
                            <Legend />
                            <Bar 
                              dataKey="income" 
                              radius={[6, 6, 0, 0]}
                              fill="url(#incomeGradientIndividual)"
                              name="Income"
                              animationBegin={0}
                              animationDuration={2000}
                              animationEasing="ease-out"
                            />
                            <Bar 
                              dataKey="expense" 
                              radius={[6, 6, 0, 0]}
                              fill="url(#expenseGradientIndividual)"
                              name="Expense"
                              animationBegin={400}
                              animationDuration={2000}
                              animationEasing="ease-out"
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                    
                    {chartType === 'bar' && getChartData().length === 0 && (
                      <div className="text-center py-5 text-muted">
                        <BarChartIcon size={48} className="mb-3 opacity-50" />
                        <h5>No Data Available</h5>
                        <p>Add some transactions to see your bar chart analysis</p>
                      </div>
                    )}
                    
                    {chartType === 'line' && (
                      <div className="chart-bg-animate" style={{ width: '100%', height: '280px', marginBottom: '40px' }}>
                        <div className="d-flex align-items-center mb-3 pb-2 border-bottom">
                          <TrendingUp size={16} className="me-2 text-muted" />
                          <h6 className="text-dark mb-0 fw-semibold">📈 Individual Line Chart</h6>
                        </div>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            key={`line-chart-${animationKey}`}
                            data={getChartData()}
                            margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                          >
                            <defs>
                              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#4CAF50" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#E53935" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#E53935" stopOpacity={0}/>
                              </linearGradient>
                              <filter id="glow">
                                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                                <feMerge> 
                                  <feMergeNode in="coloredBlur"/>
                                  <feMergeNode in="SourceGraphic"/>
                                </feMerge>
                              </filter>
                            </defs>
                            <CartesianGrid 
                              strokeDasharray="3 3" 
                              stroke="#ddd" 
                              opacity={0.3}
                              className="animated-grid"
                            />
                            <XAxis 
                              dataKey="name" 
                              axisLine={false}
                              tickLine={false}
                              tick={{ fontSize: 12, fill: '#666' }}
                            />
                            <YAxis 
                              axisLine={false}
                              tickLine={false}
                              tick={{ fontSize: 12, fill: '#666' }}
                              tickFormatter={(value) => `${value}`}
                            />
                            <Tooltip 
                              cursor={{
                                stroke: '#666',
                                strokeWidth: 2,
                                strokeDasharray: '5 5',
                                strokeOpacity: 0.8
                              }}
                              contentStyle={{
                                backgroundColor: '#fff',
                                border: '1px solid #e0e0e0',
                                borderRadius: '12px',
                                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                                padding: '16px'
                              }}
                              formatter={(value, name) => [formatCurrency(value), name]}
                              labelStyle={{ color: '#333', fontWeight: 'bold', marginBottom: '8px' }}
                            />
                            <Legend />
                            <Area
                              type="monotone"
                              dataKey="income"
                              stroke="#4CAF50"
                              fill="url(#incomeGradient)"
                              strokeWidth={0}
                              fillOpacity={1}
                              animationBegin={200}
                              animationDuration={2500}
                              animationEasing="ease-out"
                            />
                            <Area
                              type="monotone"
                              dataKey="expense"
                              stroke="#E53935"
                              fill="url(#expenseGradient)"
                              strokeWidth={0}
                              fillOpacity={1}
                              animationBegin={400}
                              animationDuration={2500}
                              animationEasing="ease-out"
                            />
                            <Line 
                              type="monotone"
                              dataKey="income" 
                              stroke="#4CAF50"
                              strokeWidth={2}
                              fillOpacity={1}
                              fill="url(#incomeGradient)"
                              dot={{ 
                                r: 5, 
                                stroke: "#fff", 
                                strokeWidth: 2, 
                                fill: "#4CAF50",
                                filter: "url(#glow)"
                              }}
                              activeDot={{ 
                                r: 8, 
                                fill: "#81C784",
                                stroke: '#fff',
                                strokeWidth: 2,
                                filter: "url(#glow)"
                              }}
                              name="Income"
                              animationBegin={0}
                              animationDuration={2500}
                              animationEasing="ease-out"
                              isAnimationActive={true}
                            />
                            <Line 
                              type="monotone"
                              dataKey="expense" 
                              stroke="#E53935"
                              strokeWidth={2}
                              fillOpacity={1}
                              fill="url(#expenseGradient)"
                              dot={{ 
                                r: 5, 
                                stroke: "#fff", 
                                strokeWidth: 2, 
                                fill: "#E53935",
                                filter: "url(#glow)"
                              }}
                              activeDot={{ 
                                r: 8, 
                                fill: "#EF5350",
                                stroke: '#fff',
                                strokeWidth: 2,
                                filter: "url(#glow)"
                              }}
                              name="Expense"
                              animationBegin={500}
                              animationDuration={2500}
                              animationEasing="ease-out"
                              isAnimationActive={true}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                    
                    {chartType === 'line' && getChartData().length === 0 && (
                      <div className="text-center py-5 text-muted">
                        <TrendingUp size={48} className="mb-3 opacity-50" />
                        <h5>No Data Available</h5>
                        <p>Add some transactions to see your trend analysis</p>
                      </div>
                    )}
                    
                    {chartType === 'donut' && (
                      <div style={{ width: '100%', height: '450px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={getDonutData()}
                              cx="50%"
                              cy="40%"
                              outerRadius={110}
                              innerRadius={70}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {getDonutData().map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => [formatCurrency(value), '']} />
                            <Legend wrapperStyle={{ paddingTop: '50px' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                    
                    {chartType === 'both' && (
                      <div className="chart-container chart-transition chart-bg-animate" style={{ 
                        width: '100%', 
                        minHeight: '1200px',
                        opacity: 1,
                        transform: 'translateY(0)',
                        animation: 'none'
                      }}>
                        {/* Debug info */}
                        <div className="text-muted small mb-3">
                          Showing all chart types: Bar, Line, and Donut charts
                        </div>
                        
                        {/* Bar Chart */}
                        <div className="chart-bg-animate" style={{ width: '100%', height: '280px', marginBottom: '40px' }}>
                          <div className="d-flex align-items-center mb-3 pb-2 border-bottom">
                            <BarChartIcon size={16} className="me-2 text-muted" />
                            <h6 className="text-dark mb-0 fw-semibold">📊 Bar Chart Analysis</h6>
                          </div>
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              key={`bar-chart-all-${animationKey}`}
                              data={getChartData()}
                              margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                            >
                              <defs>
                                <linearGradient id="incomeGradientAll" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#198754" stopOpacity={0.8}/>
                                  <stop offset="100%" stopColor="#198754" stopOpacity={0.3}/>
                                </linearGradient>
                                <linearGradient id="expenseGradientAll" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#dc3545" stopOpacity={0.8}/>
                                  <stop offset="100%" stopColor="#dc3545" stopOpacity={0.3}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" strokeOpacity={0.5} />
                              <XAxis 
                                dataKey="name" 
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: '#666' }}
                              />
                              <YAxis 
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: '#666' }}
                                tickFormatter={(value) => `${value}`}
                              />
                              <Tooltip 
                                cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
                                contentStyle={{
                                  backgroundColor: '#fff',
                                  border: '1px solid #e0e0e0',
                                  borderRadius: '8px',
                                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                  padding: '12px'
                                }}
                                formatter={(value, name) => [formatCurrency(value), name]}
                                labelStyle={{ color: '#333', fontWeight: 'bold', marginBottom: '8px' }}
                              />
                              <Legend />
                              <Bar 
                                dataKey="income" 
                                radius={[6, 6, 0, 0]}
                                fill="url(#incomeGradientAll)"
                                name="Income"
                                animationBegin={0}
                                animationDuration={2000}
                                animationEasing="ease-out"
                              />
                              <Bar 
                                dataKey="expense" 
                                radius={[6, 6, 0, 0]}
                                fill="url(#expenseGradientAll)"
                                name="Expense"
                                animationBegin={400}
                                animationDuration={2000}
                                animationEasing="ease-out"
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                        
                        {/* Line Chart */}
                        <div className="chart-bg-animate" style={{ width: '100%', height: '280px', marginBottom: '40px' }}>
                          <div className="d-flex align-items-center mb-3 pb-2 border-bottom">
                            <TrendingUp size={16} className="me-2 text-muted" />
                            <h6 className="text-dark mb-0 fw-semibold">📈 Trend Analysis</h6>
                            <span className="text-muted small ms-auto">
                              Data points: {getChartData().length}
                            </span>
                          </div>
                          {getChartData().length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              key={`line-chart-all-${animationKey}`}
                              data={getChartData()}
                              margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                            >
                              <defs>
                                <linearGradient id="incomeLineGradientAll" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.4}/>
                                  <stop offset="95%" stopColor="#4CAF50" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="expenseLineGradientAll" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#E53935" stopOpacity={0.4}/>
                                  <stop offset="95%" stopColor="#E53935" stopOpacity={0}/>
                                </linearGradient>
                                <filter id="glowAll">
                                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                                  <feMerge> 
                                    <feMergeNode in="coloredBlur"/>
                                    <feMergeNode in="SourceGraphic"/>
                                  </feMerge>
                                </filter>
                              </defs>
                              <CartesianGrid 
                                strokeDasharray="3 3" 
                                stroke="#ddd" 
                                opacity={0.3}
                                className="animated-grid"
                              />
                              <XAxis 
                                dataKey="name" 
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: '#666' }}
                              />
                              <YAxis 
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: '#666' }}
                                tickFormatter={(value) => `${value}`}
                              />
                              <Tooltip 
                                cursor={{
                                  stroke: '#666',
                                  strokeWidth: 2,
                                  strokeDasharray: '5 5',
                                  strokeOpacity: 0.8
                                }}
                                contentStyle={{
                                  backgroundColor: '#fff',
                                  border: '1px solid #e0e0e0',
                                  borderRadius: '12px',
                                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                                  padding: '16px'
                                }}
                                formatter={(value, name) => [formatCurrency(value), name]}
                                labelStyle={{ color: '#333', fontWeight: 'bold', marginBottom: '8px' }}
                              />
                              <Legend />
                              <Area
                                type="monotone"
                                dataKey="income"
                                stroke="#4CAF50"
                                fill="url(#incomeLineGradientAll)"
                                strokeWidth={0}
                                fillOpacity={1}
                                animationBegin={200}
                                animationDuration={2500}
                                animationEasing="ease-out"
                              />
                              <Area
                                type="monotone"
                                dataKey="expense"
                                stroke="#E53935"
                                fill="url(#expenseLineGradientAll)"
                                strokeWidth={0}
                                fillOpacity={1}
                                animationBegin={400}
                                animationDuration={2500}
                                animationEasing="ease-out"
                              />
                              <Line 
                                type="monotone"
                                dataKey="income" 
                                stroke="#4CAF50"
                                strokeWidth={2}
                                dot={{ 
                                  r: 5, 
                                  stroke: "#fff", 
                                  strokeWidth: 2, 
                                  fill: "#4CAF50",
                                  filter: 'url(#glowAll)'
                                }}
                                activeDot={{ 
                                  r: 8, 
                                  fill: "#81C784",
                                  stroke: '#fff',
                                  strokeWidth: 2,
                                  filter: 'url(#glowAll)'
                                }}
                                name="Income"
                                animationBegin={0}
                                animationDuration={2500}
                                animationEasing="ease-out"
                                isAnimationActive={true}
                              />
                              <Line 
                                type="monotone"
                                dataKey="expense" 
                                stroke="#E53935"
                                strokeWidth={2}
                                dot={{ 
                                  r: 5, 
                                  stroke: "#fff", 
                                  strokeWidth: 2, 
                                  fill: "#E53935",
                                  filter: 'url(#glowAll)'
                                }}
                                activeDot={{ 
                                  r: 8, 
                                  fill: "#EF5350",
                                  stroke: '#fff',
                                  strokeWidth: 2,
                                  filter: 'url(#glowAll)'
                                }}
                                name="Expense"
                                animationBegin={500}
                                animationDuration={2500}
                                animationEasing="ease-out"
                                isAnimationActive={true}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                          ) : (
                            <div className="text-center py-4 text-muted">
                              No data available for line chart
                            </div>
                          )}
                        </div>
                        
                        {/* Donut Chart */}
                        <div className="chart-bg-animate" style={{ width: '100%', height: '400px' }}>
                          <div className="d-flex align-items-center mb-3 pb-2 border-bottom">
                            <PieChartIcon size={16} className="me-2 text-muted" />
                            <h6 className="text-dark mb-0 fw-semibold">🍩 Distribution Overview</h6>
                            <span className="text-muted small ms-auto">
                              Categories: {getDonutData().length}
                            </span>
                          </div>
                          {getDonutData().length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={getDonutData()}
                                cx="50%"
                                cy="35%"
                                outerRadius={90}
                                innerRadius={55}
                                paddingAngle={8}
                                dataKey="value"
                                animationBegin={0}
                                animationDuration={2000}
                                animationEasing="ease-out"
                              >
                                {getDonutData().map((entry, index) => (
                                  <Cell 
                                    key={`cell-${index}`} 
                                    fill={entry.fill}
                                    stroke="#fff"
                                    strokeWidth={3}
                                  />
                                ))}
                              </Pie>
                              <Tooltip 
                                contentStyle={{
                                  backgroundColor: '#fff',
                                  border: '1px solid #e0e0e0',
                                  borderRadius: '12px',
                                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                                  padding: '16px'
                                }}
                                formatter={(value, name) => [formatCurrency(value), name]}
                                labelStyle={{ color: '#333', fontWeight: 'bold' }}
                              />
                              <Legend 
                                verticalAlign="bottom" 
                                height={36}
                                wrapperStyle={{ 
                                  paddingTop: '20px',
                                  bottom: '0px'
                                }} 
                              />
                            </PieChart>
                          </ResponsiveContainer>
                          ) : (
                            <div className="text-center py-4 text-muted">
                              No data available for donut chart
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Summary stats removed per request (Total Income/Expenses/Net/Expense Ratio) */}
                    {/* Top Reminders removed per request (use Top Schedules in right column) */}
                    
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <BarChartIcon size={64} className="text-muted mb-3 opacity-50" />
                    <h6 className="text-muted mb-2">No Spending Data Available</h6>
                    <p className="text-muted mb-3">Start tracking your expenses to see analytics here</p>
                    <Button variant="primary" onClick={handleAddTransaction}>
                      <Plus size={16} className="me-1" /> Add First Expense
                    </Button>
                  </div>
                )}
              </div>

            

            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          {/* Budget Overview card (Top 4 budgets) */}
          <Card className="dashboard-card border-0 mb-3" style={{ borderRadius: '16px' }}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">Budget Overview</h5>
                <div>
                  <Button variant="outline-primary" size="sm" onClick={() => navigate('/budget')}>
                    View All
                  </Button>
                </div>
              </div>
              {budgets && budgets.length > 0 ? (
                budgets
                  .slice()
                  .sort((a, b) => (Number(b.allocated || 0) - Number(a.allocated || 0)))
                  .slice(0, 4)
                  .map((bgt, idx) => {
                    const allocated = Number(bgt.allocated || 0);
                    const spent = Number(bgt.spent || 0);
                    const usedPct = allocated > 0 ? Math.min(100, Math.round((spent / allocated) * 100)) : 0;
                    return (
                      <div key={bgt._id || `${bgt.name}-${idx}`} className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <div className="fw-medium small">{bgt.name || 'Unnamed'}</div>
                          <div className="text-muted small">{formatCurrency(spent)} / {formatCurrency(allocated)}</div>
                        </div>
                        <div style={{ height: '8px', backgroundColor: '#e9ecef', borderRadius: '6px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', backgroundColor: usedPct > 80 ? '#dc3545' : (usedPct > 50 ? '#ffc107' : '#198754'), width: `${usedPct}%`, transition: 'width 0.3s ease' }} />
                        </div>
                        <div className="d-flex justify-content-between small mt-1 text-muted">
                          <span>{usedPct}% used</span>
                          <span>{formatCurrency(Math.max(0, allocated - spent))} left</span>
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div className="text-center text-muted py-3">
                  <small>No budgets set</small>
                </div>
              )}
            </Card.Body>
          </Card>
          {/* Top Schedules Card */}
          <Card className="dashboard-card border-0 mb-3" style={{ borderRadius: '16px' }}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">Top Schedules</h5>
                <div>
                  <Button variant="outline-primary" size="sm" onClick={() => navigate('/scheduling')}>
                    View All
                  </Button>
                </div>
              </div>
              {schedules && schedules.length > 0 ? (
                schedules
                  .slice()
                  .sort((a, b) => new Date(a.nextDueAt || a.startDate || 0) - new Date(b.nextDueAt || b.startDate || 0))
                  .slice(0, 4)
                  .map((s, idx) => {
                    const due = new Date(s.nextDueAt || s.startDate || Date.now());
                    const daysUntil = Math.ceil((due - new Date()) / (1000 * 60 * 60 * 24));
                    // accent color: critical if due within 3 days, warning within 7, green otherwise; inactive = gray
                    const accent = !s.active ? '#9ca3af' : (daysUntil <= 3 ? '#dc2626' : (daysUntil <= 7 ? '#d97706' : '#059669'));
                    const leftStyle = { borderLeft: `4px solid ${accent}`, paddingLeft: '12px' };
                    const icon = s.type === 'income' ? <Banknote size={16} /> : <ShoppingCart size={16} />;

                    return (
                      <div key={s._id || `${s.categoryName}-${idx}`} className="mb-3">
                        <div className="d-flex align-items-start" style={leftStyle}>
                          <div style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 10, borderRadius: 8, background: '#ffffff', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
                            {icon}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div className="d-flex justify-content-between align-items-start">
                              <div className="fw-medium" style={{ fontSize: 14 }}>{(s.type === 'income' ? 'Income' : 'Expense') + ': ' + (s.categoryName || s.category || 'Unnamed')}</div>
                              <div className="text-muted small">{formatDate(s.nextDueAt || s.startDate || new Date().toISOString())}</div>
                            </div>
                            <div className="text-muted small" style={{ marginTop: 6, lineHeight: 1.25 }}>{s.description || ''}</div>
                            <div className="d-flex gap-2 mt-2 align-items-center">
                              <div className="small" style={{ background: '#f8fafc', padding: '4px 8px', borderRadius: 8, color: '#374151', border: '1px solid #eef2ff' }}>
                                {s.freq || s.frequency || '—'}
                              </div>
                              <div className="small" style={{ background: '#fff7ed', padding: '4px 8px', borderRadius: 8, color: '#92400e', border: '1px solid #ffedd5' }}>
                                {formatCurrency(Number(s.amount || 0))}
                              </div>
                              {!s.active && (
                                <div className="small text-muted" style={{ padding: '4px 8px' }}>(inactive)</div>
                              )}
                              {daysUntil <= 3 && s.active && (
                                <div className="small" style={{ background: '#fee2e2', color: '#dc2626', padding: '4px 8px', borderRadius: 8 }}>Due soon</div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div className="text-center text-muted py-3">
                  <small>No schedules set</small>
                </div>
              )}
            </Card.Body>
          </Card>
          <Card className="dashboard-card border-0" style={{borderRadius: '16px'}}>
            <Card.Body>
              <h5 className="fw-bold mb-4">💳 Spending by Category</h5>
              {spendingByCategory.length > 0 ? (
                spendingByCategory.slice(0, 5).map((cat, i) => {
                  const variant = getVariantForCategory(i);
                  const icon = categoryIcons[cat.name] || <Tag size={16} />;
                  
                  return (
                    <div className="mb-3" key={i}>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div className="d-flex align-items-center">
                          <div className={`me-2 p-1 rounded bg-${variant} bg-opacity-10`}>
                            {icon}
                          </div>
                          <span>{cat.name}</span>
                        </div>
                        <div className="fw-medium">{cat.value}%</div>
                      </div>
                      <ProgressBar 
                        now={cat.value} 
                        variant={variant} 
                        className="savings-progress"
                        style={{ height: '6px' }}
                      />
                      <div className="text-muted small mt-1">
                        {formatCurrency(cat.amount)}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-muted py-4">
                  <ShoppingCart size={48} className="mb-3 opacity-50" />
                  <p>No spending data available</p>
                  <Button variant="outline-primary" size="sm" onClick={handleAddTransaction}>
                    Add Your First Expense
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Activity & Insights */}
      <Row className="g-4 mb-4">
        <Col md={12}>
          <Card className="dashboard-card border-0">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center">
                  <Activity size={20} className="text-primary me-2" />
                  <h5 className="fw-bold mb-0">Financial Insights</h5>
                  {autoRefresh && <div className="live-indicator ms-2"></div>}
                </div>
                <div className="d-flex gap-2">
                  <span className="badge bg-primary bg-opacity-10 text-primary">
                    <Bell size={12} className="me-1" />
                    {recentTransactions.length} Recent
                  </span>
                  <span className="badge bg-success bg-opacity-10 text-success">
                    <Target size={12} className="me-1" />
                    {goals.length} Goals
                  </span>
                </div>
              </div>
              
              <Row className="g-3">
                <Col md={4}>
                  <div className="insight-card p-3 rounded">
                    <div className="d-flex align-items-center mb-2">
                      <TrendingUp size={16} className="text-success me-2" />
                      <span className="fw-medium small">Spending Trend</span>
                    </div>
                    <div className="h6 mb-1">
                      {financialSummary.monthlyExpenses < financialSummary.monthlyIncome * 0.7 ? 
                        'Under Budget' : 
                        financialSummary.monthlyExpenses > financialSummary.monthlyIncome ? 
                        'Over Budget' : 'On Track'}
                    </div>
                    <div className="text-muted small">
                      {financialSummary.monthlyIncome > 0 ? 
                        `${Math.round((financialSummary.monthlyExpenses / financialSummary.monthlyIncome) * 100)}% of income` : 
                        'No income data'}
                    </div>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="insight-card p-3 rounded">
                    <div className="d-flex align-items-center mb-2">
                      <BarChartIcon size={16} className="text-info me-2" />
                      <span className="fw-medium small">Top Category</span>
                    </div>
                    <div className="h6 mb-1">
                      {spendingByCategory.length > 0 ? spendingByCategory[0].name : 'No data'}
                    </div>
                    <div className="text-muted small">
                      {spendingByCategory.length > 0 ? 
                        `${spendingByCategory[0].value}% of expenses` : 
                        'Start tracking expenses'}
                    </div>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="insight-card p-3 rounded">
                    <div className="d-flex align-items-center mb-2">
                      <Users size={16} className="text-warning me-2" />
                      <span className="fw-medium small">Activity Score</span>
                    </div>
                    <div className="h6 mb-1">
                      {recentTransactions.length > 0 ? 
                        `${Math.min(100, recentTransactions.length * 10)}%` : '0%'}
                    </div>
                    <div className="text-muted small">
                      Based on transaction frequency
                    </div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Rule-based Insights (moved here: after Financial Insights) */}
      <Row className="mb-3">
        <Col lg={8}>
          {insightsToShow.length > 0 ? (
            insightsToShow.slice(0,5).map(insight => (
              <Card
                key={insight.id}
                className="mb-3 shadow-sm"
                style={{ borderRadius: 12, borderLeft: `6px solid ${insightSeverityColor[insight.severity] || '#60a5fa'}` }}
              >
                <Card.Body className="d-flex justify-content-between align-items-start">
                  <div>
                    <div style={{ color: insightSeverityColor[insight.severity] || '#60a5fa', fontWeight: 700, display: 'flex', alignItems: 'center' }}>
                      {insight.severity === 'critical' ? '🚨' : insight.severity === 'warning' ? '⚠️' : '💡'}
                      <span className="ms-2" style={{ fontWeight: 700 }}>{insight.title || 'Insight'}</span>
                    </div>
                    <div className="mt-1" style={{ color: '#374151' }}>{insight.text}</div>
                  </div>
                  <div className="text-end d-flex flex-column align-items-end">
                    {insight.impact != null && (
                      <span style={{
                        backgroundColor: insightSeverityColor[insight.severity] || '#60a5fa',
                        color: '#fff',
                        padding: '4px 8px',
                        borderRadius: 12,
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        marginBottom: 8,
                      }}>
                        {typeof insight.impact === 'number' ? `OMR ${insight.impact.toFixed(2)}` : insight.impact}
                      </span>
                    )}
                    <Button variant="outline-secondary" size="sm" onClick={() => dismissInsight(insight.id)}>Dismiss</Button>
                  </div>
                </Card.Body>
              </Card>
            ))
          ) : (
            <Card className="mb-3 shadow-sm" style={{ borderRadius: 12 }}>
              <Card.Body className="d-flex justify-content-between align-items-center">
                <div>
                  <div style={{ fontWeight: 700 }}>No insights right now</div>
                  <div className="small text-muted">Insights appear when we detect notable changes (e.g., overspend, low balance).</div>
                </div>
                <div className="text-end">
                  <Button size="sm" variant="outline-primary" onClick={() => setInsightsToShow([{ id: 'sample_1', text: 'Sample: You spent 25% more on Food this month (OMR 35.000).', severity: 'warning' }])}>
                    Show sample insight
                  </Button>
                </div>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>

      {/* Recent Transactions and Savings Goals */}
      <Row className="g-4">
        <Col lg={8}>
          <Card className="dashboard-card border-0">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center">
                  <Clock size={20} className="text-primary me-2" />
                  <h5 className="fw-bold mb-0">Recent Transactions</h5>
                  <span className="badge bg-primary bg-opacity-10 text-primary ms-2">
                    {recentTransactions.length}
                  </span>
                </div>
                <div className="d-flex gap-2">
                  <Button variant="outline-primary" size="sm" onClick={() => navigate('/report')}>
                    View All
                  </Button>
                  <Button variant="primary" size="sm" onClick={handleAddTransaction}>
                    <Plus size={14} className="me-1" />
                    Add New
                  </Button>
                </div>
              </div>

              {recentTransactions.length > 0 ? (
                <div className="transactions-container">
                  {recentTransactions.map((tx, index) => (
                    <div
                      key={tx._id}
                      className="transaction-item transaction-animated"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="transaction-content">
                        <div className="transaction-icon-wrapper">
                          <div className={`transaction-icon ${tx.type === 'income' ? 'income-icon' : 'expense-icon'}`}>
                            {categoryIcons[tx.category] || <Tag size={20} />}
                          </div>
                        </div>
                        
                        <div className="transaction-details flex-grow-1">
                          <div className="d-flex justify-content-between align-items-start mb-1">
                            <div>
                              <h6 className="transaction-description mb-1">
                                {tx.description || 'No description'}
                              </h6>
                              <div className="transaction-meta">
                                <span className="category-tag">
                                  {tx.category}
                                </span>
                                <span className="transaction-date text-muted">
                                  {formatDate(tx.startDate)}
                                </span>
                              </div>
                            </div>
                            <div className="transaction-amount-wrapper">
                              <div className={`transaction-amount ${tx.type === 'income' ? 'income-amount' : 'expense-amount'}`}>
                                {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                              </div>
                              <div className={`transaction-type-badge ${tx.type}`}>
                                {tx.type === 'income' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                {tx.type}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="transaction-actions">
                        <Button variant="outline-secondary" size="sm" className="action-btn">
                          <Settings size={14} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state text-center py-5">
                  <div className="empty-icon mb-3">
                    <Wallet size={64} className="text-muted opacity-50" />
                  </div>
                  <h6 className="text-muted mb-2">No transactions yet</h6>
                  <p className="text-muted mb-4 small">
                    Start tracking your income and expenses to see them here
                  </p>
                  <div className="d-flex gap-2 justify-content-center">
                    <Button variant="success" size="sm" onClick={handleAddTransaction}>
                      <TrendingUp size={14} className="me-1" />
                      Add Income
                    </Button>
                    <Button variant="danger" size="sm" onClick={handleAddTransaction}>
                      <TrendingDown size={14} className="me-1" />
                      Add Expense
                    </Button>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="dashboard-card border-0">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold mb-0">Savings Goals</h5>
                <div className="d-flex gap-2">
                  <Button variant="outline-secondary" size="sm" onClick={testGoalsFetch}>
                    <RefreshCw size={14} className="me-1" />
                    Refresh
                  </Button>
                  <Button variant="outline-primary" size="sm" onClick={() => navigate('/goals')}>
                    <Plus size={14} className="me-1" /> Add Goal
                  </Button>
                </div>
              </div>
              <div className="mb-2 small text-muted">
                Goals loaded: {dashboardGoals?.length || 0}
              </div>
              {loading ? (
                <SkeletonTheme baseColor="#f3f4f6" highlightColor="#e5e7eb">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="mb-4">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <Skeleton width={120} height={16} />
                        <Skeleton width={80} height={14} />
                      </div>
                      <Skeleton height={8} className="mb-2" />
                      <div className="d-flex justify-content-between">
                        <Skeleton width={80} height={12} />
                        <Skeleton width={60} height={12} />
                      </div>
                    </div>
                  ))}
                </SkeletonTheme>
              ) : (
                <div>
                  {/* Force display goals if they exist */}
                  {dashboardGoals && Array.isArray(dashboardGoals) && dashboardGoals.length > 0 ? (
                    dashboardGoals.slice(0, 3).map(goal => {
                      // Ensure we have valid numbers for calculation
                      const currentAmount = parseFloat(goal.currentAmount) || 0;
                      const targetAmount = parseFloat(goal.targetAmount) || 1;
                      const percentage = Math.min(100, Math.max(0, (currentAmount / targetAmount) * 100));
                      
                      return (
                        <div key={goal._id || Math.random()} className="mb-4">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <div className="fw-medium">{goal.name || 'Unnamed Goal'}</div>
                            <div className="text-muted small">
                              {formatCurrency(currentAmount)} of {formatCurrency(targetAmount)}
                            </div>
                          </div>
                          
                          {/* Working Progress Bar */}
                          <div className="mb-2" style={{ height: '10px', backgroundColor: '#e9ecef', borderRadius: '5px', overflow: 'hidden' }}>
                            <div style={{ 
                              height: '100%', 
                              backgroundColor: '#28a745', 
                              width: `${percentage}%`,
                              transition: 'width 0.3s ease'
                            }}></div>
                          </div>
                          
                          <div className="d-flex justify-content-between small">
                            <span className="text-muted">{Math.round(percentage)}% complete</span>
                            <span className="text-primary">
                              {formatCurrency(Math.max(0, targetAmount - currentAmount))} to go
                            </span>
                          </div>
                          {goal.deadline && (
                            <div className="text-muted small mt-1">
                              Deadline: {goal.deadline}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center text-muted py-4">
                      <TrendingUp size={48} className="mb-3 opacity-50" />
                      <p>No savings goals set</p>
                      <Button variant="outline-primary" size="sm" onClick={() => navigate('/goals')}>
                        Create Your First Goal
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  </div>
  );
};

export default DashboardPage;
