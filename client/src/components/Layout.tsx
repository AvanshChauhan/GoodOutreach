import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Compass,
  Filter,
  Sparkles,
  Send,
  Settings,
  Search,
  Bell,
  MessageSquare,
  ChevronDown,
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/influencers', label: 'Influencers', icon: Users },
  { path: '/discovery', label: 'Discovery', icon: Compass },
  { path: '/filtering', label: 'Filtering', icon: Filter },
  { path: '/messages', label: 'AI Messages', icon: Sparkles },
  { path: '/outreach', label: 'Outreach', icon: Send },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="sidebar-container">
      {/* Brand Logo */}
      <div className="sidebar-logo">
        <div style={{
          width: 38,
          height: 38,
          borderRadius: 12,
          background: 'var(--lime-primary)',
          color: '#000000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 900,
          fontSize: 18,
          letterSpacing: '-0.05em'
        }}>
          GO
        </div>
        <div>
          <span style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
            Good<span style={{ color: 'var(--lime-primary)' }}>Outreach</span>
          </span>
          <p style={{ margin: 0, fontSize: 11, color: '#71717a' }}>Influencer OS</p>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1 }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}

export function Topbar() {
  return (
    <header style={{
      height: 72,
      background: '#ffffff',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px',
      position: 'sticky',
      top: 0,
      zIndex: 10
    }}>
      {/* Search pill */}
      <div className="topbar-search">
        <Search size={16} color="var(--text-muted)" />
        <input type="text" placeholder="Tap here to search influencers, niches..." />
      </div>

      {/* Right controls: Notifications & Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <button style={{
            background: '#f4f4f5',
            border: 'none',
            borderRadius: '50%',
            width: 38,
            height: 38,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}>
            <Bell size={18} color="var(--text-secondary)" />
          </button>
          <button style={{
            background: '#f4f4f5',
            border: 'none',
            borderRadius: '50%',
            width: 38,
            height: 38,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}>
            <MessageSquare size={18} color="var(--text-secondary)" />
          </button>
        </div>

        <div style={{ width: 1, height: 28, background: 'var(--border)' }} />

        {/* User Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
            alt="User avatar"
            style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--lime-primary)' }}
          />
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: 'var(--text-main)', lineHeight: 1.2 }}>
              James McGill
            </p>
            <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>
              Outreach Manager
            </p>
          </div>
          <ChevronDown size={16} color="var(--text-muted)" />
        </div>
      </div>
    </header>
  );
}

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-app)' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Topbar />
        <main style={{ flex: 1, padding: '28px 32px', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
