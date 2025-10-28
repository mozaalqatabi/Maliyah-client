import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutGrid, 
  PlusCircle, 
  Calendar, 
  BarChart3, 
  Wallet, 
  Receipt, 
  Target, 
  MoreHorizontal,
  Bell,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Nav, Container } from 'react-bootstrap';

// NavItem component
const NavItem = ({ id, to, icon, label, isActive, isCollapsed }) => {
  return (
    <Link
      id={id}
      to={to}
      className={`sidebar-nav-item ${isActive ? 'active' : ''} ${isCollapsed ? 'collapsed' : ''}`}
      title={isCollapsed ? label : ''}
    >
      <div className="nav-icon-wrapper">
        {icon}
      </div>
      {!isCollapsed && (
        <span className="nav-label">{label}</span>
      )}
      {isActive && !isCollapsed && <div className="active-indicator"></div>}
    </Link>
  );
};

// Section Header component
const SectionHeader = ({ title, isCollapsed }) => {
  if (isCollapsed) return null;
  return <div className="sidebar-section-header">{title}</div>;
};

// Divider component
const Divider = ({ isCollapsed }) => (
  <div className={`sidebar-divider ${isCollapsed ? 'collapsed' : ''}`}></div>
);

// Sidebar component
const Sidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [isCollapsed, setIsCollapsed] = useState(false);

  const mainNavItems = [
    { id: 'dashboard-link', to: '/dashboard', icon: <LayoutGrid size={20} />, label: 'Dashboard' },
    { id: 'add-record-link', to: '/add-record', icon: <PlusCircle size={20} />, label: 'Add Record' },
  ];

  const analyticsItems = [
    { id: 'statistics-link', to: '/statistics', icon: <BarChart3 size={20} />, label: 'Statistics' },
    { id: 'budget-link', to: '/budget', icon: <Receipt size={20} />, label: 'Budget' },
    { id: 'goals-link', to: '/goals', icon: <Target size={20} />, label: 'Goals' },
  ];

  const toolsItems = [
    { id: 'scheduling-link', to: '/scheduling', icon: <Calendar size={20} />, label: 'Scheduling' },
    { id: 'shared-wallets-link', to: '/shared-wallets', icon: <Wallet size={20} />, label: 'Shared Wallets' },
    { id: 'reminder-link', to: '/reminder', icon: <Bell size={20} />, label: 'Reminders' },
  ];

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`sidebar-container ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Sidebar Header */}
      <div className="sidebar-header">
        {!isCollapsed && (
          <div className="sidebar-brand">
            <div className="brand-icon">💰</div>
            <span className="brand-text">MALIYAH</span>
          </div>
        )}
        <button className="collapse-toggle" onClick={toggleCollapse}>
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Main Navigation */}
      <div className="sidebar-content">
        <div className="nav-section">
          <SectionHeader title="Main" isCollapsed={isCollapsed} />
          <Nav className="flex-column">
            {mainNavItems.map((item) => (
              <NavItem
                key={item.to}
                id={item.id}
                to={item.to}
                icon={item.icon}
                label={item.label}
                isActive={currentPath === item.to}
                isCollapsed={isCollapsed}
              />
            ))}
          </Nav>
        </div>

        <Divider isCollapsed={isCollapsed} />

        {/* Analytics Section */}
        <div className="nav-section">
          <SectionHeader title="Analytics" isCollapsed={isCollapsed} />
          <Nav className="flex-column">
            {analyticsItems.map((item) => (
              <NavItem
                key={item.to}
                id={item.id}
                to={item.to}
                icon={item.icon}
                label={item.label}
                isActive={currentPath === item.to}
                isCollapsed={isCollapsed}
              />
            ))}
          </Nav>
        </div>

        <Divider isCollapsed={isCollapsed} />

        {/* Tools Section */}
        <div className="nav-section">
          <SectionHeader title="Tools" isCollapsed={isCollapsed} />
          <Nav className="flex-column">
            {toolsItems.map((item) => (
              <NavItem
                key={item.to}
                id={item.id}
                to={item.to}
                icon={item.icon}
                label={item.label}
                isActive={currentPath === item.to}
                isCollapsed={isCollapsed}
              />
            ))}
          </Nav>
        </div>
      </div>

      {/* Sidebar Footer */}
      <div className="sidebar-footer">
        <Divider isCollapsed={isCollapsed} />
        <NavItem 
          to="/more" 
          icon={<MoreHorizontal size={20} />} 
          label="More" 
          isCollapsed={isCollapsed}
        />
      </div>
    </div>
  );
};

export default Sidebar;
