// client/src/Components/GamifiedPanel.js
import React, { useEffect, useMemo, useState } from 'react';
import { Card, Row, Col, ProgressBar, Badge } from 'react-bootstrap';
import { Trophy, Star, Flame } from 'lucide-react';
import Swal from 'sweetalert2';

const clamp = (n, lo = 0, hi = 1e9) => Math.max(lo, Math.min(hi, Number(n) || 0));
const pct = (n) => Math.round(clamp(n) * 100);

function loadProfile() {
  try { return JSON.parse(localStorage.getItem('gamifyProfile') || '{}'); } catch { return {}; }
}
function saveProfile(p) {
  localStorage.setItem('gamifyProfile', JSON.stringify(p));
}

function useBadges({ totalBudget, totalSpent, savingsRate, categoriesCount, daysElapsed, daysInMonth }) {
  const [profile, setProfile] = useState(() => {
    const p = loadProfile();
    return {
      xp: 0,
      level: 1,
      badges: {}, // { id: timestamp }
      ...p
    };
  });

  const onTrackSpend = totalBudget > 0
    ? totalSpent <= (totalBudget * (daysElapsed / Math.max(1, daysInMonth)))
    : false;

  const candidates = useMemo(() => {
    const arr = [];
    if (categoriesCount > 0) {
      arr.push({ id: 'first_budget', name: 'First Budget', desc: 'Created your first budget category.' });
    }
    if (onTrackSpend) {
      arr.push({ id: 'on_track', name: 'On Track', desc: 'Spending is within the month-to-date pace.' });
    }
    if (savingsRate >= 20) {
      arr.push({ id: 'saver_20', name: 'Thrifty Saver', desc: 'Savings rate reached 20% this month.' });
    }
    if (savingsRate >= 50) {
      arr.push({ id: 'budget_boss', name: 'Budget Boss', desc: 'Savings rate reached 50% this month.' });
    }
    return arr;
  }, [categoriesCount, onTrackSpend, savingsRate]);

  // Award new badges + XP
  useEffect(() => {
    let changed = false;
    let gainedXP = 0;
    const next = { ...profile, badges: { ...(profile.badges || {}) } };

    for (const b of candidates) {
      if (!next.badges[b.id]) {
        next.badges[b.id] = Date.now();
        changed = true;
        gainedXP += 25; // XP per badge
        Swal.fire({
          icon: 'success',
          title: `🏅 Badge unlocked: ${b.name}`,
          text: b.desc,
          timer: 2400,
          showConfirmButton: false,
        });
      }
    }

    if (changed || gainedXP) {
      next.xp = clamp((next.xp || 0) + gainedXP, 0);
      // Level: every 100 XP
      next.level = Math.max(1, Math.floor((next.xp || 0) / 100) + 1);
      setProfile(next);
      saveProfile(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(candidates)]);

  const earned = Object.entries(profile.badges || {}).sort((a, b) => b[1] - a[1]);

  return {
    profile,
    onTrackSpend,
    earnedBadges: earned.map(([id, ts]) => ({ id, ts })),
  };
}

export default function GamifiedPanel({
  totalBudget = 0,
  totalSpent = 0,
  savingsRate = 0,
  categoriesCount = 0,
  daysElapsed = 1,
  daysInMonth = 30,
}) {
  const { profile, onTrackSpend, earnedBadges } = useBadges({
    totalBudget, totalSpent, savingsRate, categoriesCount, daysElapsed, daysInMonth
  });

  const xpToNext = 100 - ((profile.xp || 0) % 100);
  const progress = ((profile.xp || 0) % 100) / 100 * 100;

  return (
    <Card className="border-0 shadow-sm rounded-4 mb-4">
      <Card.Body>
        <Row className="align-items-center">
          <Col md={4} className="mb-3 mb-md-0">
            <div className="d-flex align-items-center gap-2">
              <Trophy size={20} className="text-warning" />
              <div className="fw-semibold">Level {profile.level}</div>
            </div>
            <div className="small text-muted">XP {profile.xp} ・ {xpToNext} to next level</div>
            <ProgressBar now={progress} className="mt-2" />
          </Col>
          <Col md={4} className="mb-3 mb-md-0">
            <div className="d-flex align-items-center gap-2">
              <Flame size={20} className={onTrackSpend ? 'text-success' : 'text-danger'} />
              <div className="fw-semibold">
                {onTrackSpend ? 'On Track' : 'Off Track'}
              </div>
            </div>
            <div className="small text-muted">
              {totalBudget > 0
                ? `Spent OMR ${totalSpent.toFixed(2)} of prorated OMR ${(totalBudget * (daysElapsed/Math.max(1, daysInMonth))).toFixed(2)}`
                : 'Set a budget to start tracking'}
            </div>
          </Col>
          <Col md={4}>
            <div className="d-flex align-items-center gap-2 mb-1">
              <Star size={18} className="text-primary" />
              <div className="fw-semibold">Badges</div>
            </div>
            <div className="d-flex flex-wrap gap-2">
              {earnedBadges.length === 0 && <span className="text-muted small">No badges yet — keep going!</span>}
              {earnedBadges.slice(0, 6).map(b => (
                <Badge key={b.id} bg="light" text="dark" className="border">
                  {badgeName(b.id)}
                </Badge>
              ))}
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}

function badgeName(id) {
  switch (id) {
    case 'first_budget': return 'First Budget';
    case 'on_track': return 'On Track';
    case 'saver_20': return 'Thrifty Saver';
    case 'budget_boss': return 'Budget Boss';
    default: return id;
  }
}
